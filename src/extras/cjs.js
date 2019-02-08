import babel from '@babel/core';
import dynamicImportPlugin from '@babel/plugin-syntax-dynamic-import';
import esRegisterFormatPlugin from '@babel/plugin-transform-modules-systemjs';

import extractCjsDepsPlugin from '../utils/babel-visit-cjs-deps-plugin';
import { compileScript } from '../utils/compile';
import { sourceMapSources, urlToPath, basename, dirname } from '../common';


async function createRequire(loader, url, deps, resolves) {
  const mapImportSpecifierToUrl = async (specifier) => {
    const resolvedUrl = await loader.resolve(specifier, url);
    await loader.import(specifier, url);
    return [specifier, resolvedUrl, true];
  };

  const mapResolveSpecifierToUrl = async (specifier) => {
    const resolvedUrl = await loader.resolve(specifier, url);
    return [specifier, resolvedUrl, false];
  };

  const importSpecifierMapEntries = await Promise.all(deps.map(mapImportSpecifierToUrl));
  const resolveSpecifierMapEntries = await Promise.all(resolves.map(mapResolveSpecifierToUrl));
  const specifierMapEntries = [...importSpecifierMapEntries, ...resolveSpecifierMapEntries];
  const specifierMap = specifierMapEntries.reduce((acc, [specifier, resolvedUrl, required]) => {
    const [, origRequired = false] = acc[specifier] || [];
    acc[specifier] = [resolvedUrl, origRequired || required];
    return acc;
  }, {});

  function require(specifier) {
    const [resolvedUrl, required] = specifierMap[specifier];
    if (!required) {
      throw new Error(`Cannot require dynamic module '${specifier}'`);
    }
    return loader.get(resolvedUrl).default;
  }

  require.resolve = function resolve(specifier) {
    const [resolvedUrl] = specifierMap[specifier];
    return resolvedUrl;
  };

  return require;
}

function createModule(require, url) {
  return {
    children: [],
    exports: Object.create(null),
    filename: url.href,
    id: url.href,
    loaded: false,
    parent: null,
    paths: [],
    require,
  };
}

function postExecute(updateExport, module) {
  const exports = module.exports;

  if ((typeof exports === 'object' || typeof exports === 'function') && !('__esModule' in exports)) {
    Object.defineProperty(module.exports, '__esModule', {
      value: true,
    });
  }

  updateExport('default', module.exports);

  module.loaded = true;
}


function babelTransform(source, options) {
  return new Promise(function(resolve, reject) {
    babel.transform(source, options, function(err, result) {
      if (err) {
        reject(err);
      } else {
        resolve(result);
      }
    });
  });
}


function getSourceUrl(url) {
  url = new URL(url);
  if (url.protocol === 'file:') {
    return urlToPath(url);
  }
  return url.href;
}


const systemPrototype = System.constructor.prototype;
global.System = new System.constructor();

const superTransform = systemPrototype.transform;
systemPrototype.transform = async function transform(context, url, source) {
  if (context.format !== 'cjs') {
    return superTransform.call(this, context, url, source);
  }

  const { resolves, deps } = context.cjsDeps = {
    resolves: [],
    deps: [],
  };

  const modulePath = urlToPath(url);
  const sourceUrl = getSourceUrl(url);
  const transpiledPath = `${sourceUrl}!transpiled`;

  const options = {
    babelrc: false,
    compact: false,
    configFile: false,
    filename: transpiledPath,
    sourceFileName: `${sourceUrl}`,
    moduleIds: false,
    parserOpts: {
      allowReturnOutsideFunction: true,
    },
    sourceMaps: true,
    sourceType: 'module',
    plugins: [
      [extractCjsDepsPlugin, { deps, resolves }],
      dynamicImportPlugin,
      esRegisterFormatPlugin
    ],
  };

  const output = await babelTransform(source, options);

  output.map.sources = output.map.sources.map(getSourceUrl);
  sourceMapSources[transpiledPath] = output.map;

  return output.code;
};

const superEvaluate = systemPrototype.evaluate;
systemPrototype.evaluate = async function evaluate(context, url, source) {
  if (context.format !== 'cjs') {
    return superEvaluate.call(this, context, url, source);
  }

  const { deps, resolves } = context.cjsDeps;

  const modulePath = urlToPath(url);
  const transpiledPath = `${getSourceUrl(url)}!transpiled`;

  const _require = await createRequire(this, url, deps, resolves);
  const _module = createModule(_require, url);

  const moduleVars = {
    exports: _module.exports,
    require: _require,
    module: _module,
    __filename: basename(modulePath),
    __dirname: dirname(modulePath),
  };

  compileScript(transpiledPath, source, moduleVars);


  // Get the registration and modify the 'dependendencies' array to include
  // found require() & require.resolve() calls. Also wrap 'definition' and
  // 'execute' functions to get a reference to the export setter function
  // and get notified when the script actually executes so we can get the
  // default export. Since 'getRegister' removes the registration, we must
  // call 'register' again with the modified values for it to be picked up in
  // the next step.
  const [dependencies, definition] = this.getRegister();

  function wrappedDefinition(_export, _context) {
    const { setters, execute } = definition(_export, _context);

    function wrappedExecute() {
      execute();
      postExecute(_export, _module);
    }

    return {
      setters,
      execute: wrappedExecute,
    };
  }

  const registration = [
    [...dependencies, ...deps],
    wrappedDefinition,
  ];

  return registration;
};
