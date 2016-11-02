import SystemJSLoader from './systemjs-loader.js';
import { scriptLoad, isBrowser, isWorker, global, evaluate, cjsRequireRegEx, addToError, loadNodeModule } from './common.js';
import fetch from './fetch.js';
import { getGlobalValue, getCJSDeps, requireResolve, getPathVars, prepareGlobal, clearLastDefine, registerLastDefine } from './format-helpers.js';

export function instantiate (key, metadata, processAnonRegister) {
  var loader = this;
  // first do bundles and depCache
  return (loadBundlesAndDepCache(this, key) || Promise.resolve())
  .then(function () {
    if (metadata.registered)
      return;

    if (key.substr(0, 6) === '@node/') {
      if (!loader._nodeRequire)
        throw new TypeError('Error loading ' + name + '. Can only load node core modules in Node.');
      if (loader.builder)
        loader.registerDynamic([], function () {});
      else
        loader.registerDynamic([], function (require, exports, module) {
          module.exports = loadNodeModule.call(loader, key.substr(6), loader.baseURL);
        });
      processAnonRegister();
      return;
    }

    // auto script load AMD, global without deps
    if (!metadata.pluginName && !metadata.load.deps && !metadata.load.globals && metadata.load.scriptLoad !== false &&
        (metadata.load.format === 'amd' || metadata.load.format === 'system' || metadata.load.format === 'register' ||
        metadata.load.format === 'global' && metadata.load.exports && !isWorker))
      metadata.load.scriptLoad = true;

    // fetch / translate / instantiate pipeline
    if (metadata.load.format == 'json' || !metadata.load.scriptLoad || metadata.load.pluginName || (!isBrowser && !isWorker))
      return runFetchPipeline(loader, key, metadata, processAnonRegister);

    // just script loading
    return new Promise(function (resolve, reject) {
      // scriptLoad implies a define leak for AMD
      global.define = loader.amdDefine;

      scriptLoad(key, metadata.load.crossOrigin, metadata.load.integrity, function () {
        processAnonRegister();

        if (!metadata.registered) {
          metadata.load.format = 'global';
          var globalValue = getGlobalValue(metadata.load.exports);
          loader.registerDynamic([], function (require, exports, module) {
            try {
              module.exports = globalValue;
            }
            catch(e) {
              throw new Error("Invalid JSON file " + key);
            }
          });
          processAnonRegister();
        }

        resolve();
      }, reject);
    });
  });
};

function initializePlugin (loader, key, metadata) {
  if (!metadata.pluginName)
    return Promise.resolve();

  return loader.import(metadata.pluginName).then(function (plugin) {
    metadata.pluginModule = plugin;
    metadata.pluginLoad = {
      name: key,
      address: metadata.pluginArgument,
      source: undefined,
      metadata: metadata.load
    };
    metadata.load.deps = metadata.load.deps || [];
  });
}

function loadBundlesAndDepCache (loader, key) {
  // load direct deps, in turn will pick up their trace trees
  var deps = loader.depCache[key];
  if (deps) {
    for (var i = 0; i < deps.length; i++)
      loader.load(deps[i], key);
  }
  else {
    var matched = false;
    for (var b in loader.bundles) {
      for (var i = 0; i < loader.bundles[b].length; i++) {
        var curModule = loader.bundles[b][i];

        if (curModule == key) {
          matched = true;
          break;
        }

        // wildcard in bundles does not include / boundaries
        if (curModule.indexOf('*') != -1) {
          var parts = curModule.split('*');
          if (parts.length != 2) {
            loader.bundles[b].splice(i--, 1);
            continue;
          }

          if (key.substring(0, parts[0].length) == parts[0] &&
              key.substr(key.length - parts[1].length, parts[1].length) == parts[1] &&
              key.substr(parts[0].length, key.length - parts[1].length - parts[0].length).indexOf('/') == -1) {
            matched = true;
            break;
          }
        }
      }

      if (matched)
        return loader.import(b);
    }
  }
}

function runFetchPipeline (loader, key, metadata, processAnonRegister) {
  metadata.load.scriptLoad = false;

  if (metadata.load.exports && !metadata.load.format)
    metadata.load.format = 'global';

  return initializePlugin(loader, key, metadata)

  // locate
  .then(function () {
    if (!metadata.pluginModule || !metadata.pluginModule.locate)
      return;

    return metadata.pluginModule.locate.call(loader, metadata.pluginLoad)
    .then(function (address) {
      if (address)
        metadata.pluginLoad.address = address;
    });
  })

  // fetch
  .then(function () {
    if (!metadata.pluginModule)
      return fetch(key);

    if (!metadata.pluginModule.fetch)
      return fetch(metadata.pluginArgument);

    return metadata.pluginModule.fetch.call(loader, metadata.pluginLoad, function (load) {
      return fetch(load.address);
    });
  })

  // translate
  .then(function (source) {
    if (metadata.load.format == 'detect')
      metadata.load.format = undefined;

    readMetaSyntax(source, metadata);

    if (!metadata.pluginModule || !metadata.pluginModule.translate)
      return source;

    metadata.pluginLoad.source = source;
    return Promise.resolve(metadata.pluginModule.translate.call(loader, metadata.pluginLoad, metadata.traceOpts))
    .then(function (translated) {
      if (metadata.load.sourceMap) {
        if (typeof metadata.load.sourceMap !== 'object')
          throw new Error('metadata.load.sourceMap must be set to an object.');
        sanitizeSourceMap(metadata.pluginLoad.address, metadata.load.sourceMap);
      }

      if (typeof translated === 'string')
        return translated;
      else
        return metadata.pluginLoad.source;
    });
  })
  .then(function (source) {
    if (metadata.load.format === 'register' || !metadata.load.format && detectRegisterFormat(source)) {
      metadata.load.format = 'register';
      return source;
    }

    if (metadata.load.format !== 'esm' && (metadata.load.format || !source.match(esmRegEx))) {
      return source;
    }

    metadata.load.format = 'esm';
    return transpile(loader, source, key, metadata);
  })

  // instantiate
  .then(function (translated) {
    if (!metadata.pluginModule || !metadata.pluginModule.instantiate || loader.builder)
      return translated;

    var calledInstantiate = false;
    metadata.pluginLoad.source = translated;
    return Promise.resolve(metadata.pluginModule.instantiate.call(loader, metadata.pluginLoad, function (load) {
      translated = load.source;
      metadata.load = load.metadata;
      if (calledInstantiate)
        throw new Error('Instantiate must only be called once.');
      calledInstantiate = true;
    }))
    .then(function (result) {
      if (calledInstantiate)
        return translated;

      loader.registerDynamic([], function (require, exports, module) {
        module.exports = result;
      });
      processAnonRegister();
    });
  })
  .then(function (source) {
    // plugin instantiate result case
    if (source === undefined)
      return;

    if (!metadata.load.format)
      metadata.load.format = detectLegacyFormat(source);

    switch (metadata.load.format) {
      case 'esm':
      case 'register':
      case 'system':
        var err = evaluate(loader, source, metadata.load.sourceMap, key, metadata.load.integrity, metadata.load.nonce, false);
        if (err)
          throw err;
        processAnonRegister();

        // didnt register itself, use the last named registered value if only one
        if (!metadata.registered) {
          loader.register([], function () {
            return {};
          });
          processAnonRegister();
        }
      break;

      case 'json':
        loader.registerDynamic([], function (require, exports, module) {
          try {
            module.exports = JSON.parse(source);
          }
          catch(e) {
            throw new Error("Invalid JSON file " + key);
          }
        });
        processAnonRegister();
      break;

      case 'amd':
        if (!loader.builder) {
          var curDefine = global.define;
          global.define = loader.amdDefine;

          clearLastDefine(metadata.load.deps);

          var err = evaluate(loader, source, metadata.load.sourceMap, key, metadata.load.integrity, metadata.load.nonce, false);

          processAnonRegister();

          // if didn't register anonymously, use the last named define if only one
          if (!metadata.registered) {
            registerLastDefine(loader);
            processAnonRegister();
          }

          global.define = curDefine;

          if (err)
            throw err;
        }
        else {
          // TODO
          metadata.load.execute = function() {
            return metadata.load.builderExecute.apply(this, arguments);
          };
        }
      break;

      case 'cjs':
        var metaDeps = metadata.load.deps;
        var deps = (metadata.load.deps || []).concat(metadata.load.cjsRequireDetection ? getCJSDeps(source) : []);

        for (var g in metadata.load.globals)
          if (metadata.load.globals[g])
            deps.push(metadata.load.globals[g]);

        loader.registerDynamic(deps, function (_require, exports, module) {
          function require (name) {
            if (name[name.length - 1] == '/')
              name = name.substr(0, name.length - 1);
            return _require.apply(this, arguments);
          }
          require.resolve = function (name) {
            return requireResolve.call(loader, name, module.id);
          };
          // support module.paths ish
          module.paths = [];
          module.require = _require;

          // ensure meta deps execute first
          if (!metadata.load.cjsDeferDepsExecute && metaDeps)
            for (var i = 0; i < metaDeps.length; i++)
              require(metaDeps[i]);

          var pathVars = getPathVars(module.id);
          var __cjsWrapper = {
            exports: exports,
            args: [require, exports, module, pathVars.filename, pathVars.dirname, global, global]
          };

          var cjsWrapper = "(function (require, exports, module, __filename, __dirname, global, GLOBAL";

          // add metadata.globals to the wrapper arguments
          if (metadata.load.globals)
            for (var g in metadata.load.globals) {
              __cjsWrapper.args.push(require(metadata.load.globals[g]));
              cjsWrapper += ", " + g;
            }

          // disable AMD detection
          var define = global.define;
          global.define = undefined;
          global.__cjsWrapper = __cjsWrapper;

          source = cjsWrapper + ") {" + source.replace(hashBangRegEx, '') + "\n}).apply(__cjsWrapper.exports, __cjsWrapper.args);";

          var err = evaluate(loader, source, metadata.load.sourceMap, key, metadata.load.integrity, metadata.load.nonce, false);
          if (err)
            throw err;

          global.__cjsWrapper = undefined;
          global.define = define;
        });
        processAnonRegister();
      break;

      case 'global':
        var deps = metadata.load.deps || [];
        for (var g in metadata.load.globals) {
          var gl = metadata.load.globals[g];
          if (gl)
            deps.push(gl);
        }

        loader.registerDynamic(deps, function (require, exports, module) {
          for (var i = 0; i < deps.length; i++)
            require(deps[i]);

          var globals;
          if (metadata.load.globals) {
            globals = {};
            for (var g in metadata.load.globals)
              if (metadata.load.globals[g])
                globals[g] = require(metadata.load.globals[g]);
          }

          var exportName = metadata.load.exports;

          if (exportName)
            source += '\n' + globalName + '["' + exportName + '"] = ' + exportName + ';';

          var retrieveGlobal = prepareGlobal(module.id, exportName, globals, metadata.load.encapsulateGlobal);
          var err = evaluate(loader, source, metadata.load.sourceMap, key, metadata.load.integrity, metadata.load.nonce, true);

          if (err)
            throw err;

          module.exports = retrieveGlobal();
        });
        processAnonRegister();
      break;

      default:
        throw new TypeError('Unknown module format "' + metadata.load.format + '" for "' + key + '".' + (metadata.load.format === 'es6' ? ' SystemJS 0.20 uses "esm" instead here.' : ''));
    }

    if (!metadata.registered)
      throw new Error('Module ' + key + ' detected as ' + metadata.load.format + ' but didn\'t execute correctly.');
  });
}

var globalName = typeof self != 'undefined' ? 'self' : 'global';

// good enough ES6 module detection regex - format detections not designed to be accurate, but to handle the 99% use case
export var esmRegEx = /(^\s*|[}\);\n]\s*)(import\s*(['"]|(\*\s+as\s+)?[^"'\(\)\n;]+\s*from\s*['"]|\{)|export\s+\*\s+from\s+["']|export\s*(\{|default|function|class|var|const|let|async\s+function))/;

var leadingCommentAndMetaRegEx = /^(\s*\/\*[^\*]*(\*(?!\/)[^\*]*)*\*\/|\s*\/\/[^\n]*|\s*"[^"]+"\s*;?|\s*'[^']+'\s*;?)*\s*/;
export function detectRegisterFormat(source) {
  var leadingCommentAndMeta = source.match(leadingCommentAndMetaRegEx);
  return leadingCommentAndMeta && source.substr(leadingCommentAndMeta[0].length, 15) === 'System.register';
}

// AMD Module Format Detection RegEx
// define([.., .., ..], ...)
// define(varName); || define(function(require, exports) {}); || define({})
var amdRegEx = /(?:^\uFEFF?|[^$_a-zA-Z\xA0-\uFFFF.])define\s*\(\s*("[^"]+"\s*,\s*|'[^']+'\s*,\s*)?\s*(\[(\s*(("[^"]+"|'[^']+')\s*,|\/\/.*\r?\n|\/\*(.|\s)*?\*\/))*(\s*("[^"]+"|'[^']+')\s*,?)?(\s*(\/\/.*\r?\n|\/\*(.|\s)*?\*\/))*\s*\]|function\s*|{|[_$a-zA-Z\xA0-\uFFFF][_$a-zA-Z0-9\xA0-\uFFFF]*\))/;

/// require('...') || exports[''] = ... || exports.asd = ... || module.exports = ...
var cjsExportsRegEx = /(?:^\uFEFF?|[^$_a-zA-Z\xA0-\uFFFF.])(exports\s*(\[['"]|\.)|module(\.exports|\['exports'\]|\["exports"\])\s*(\[['"]|[=,\.]))/;
var commentRegEx = /(^|[^\\])(\/\*([\s\S]*?)\*\/|([^:]|^)\/\/(.*)$)/mg;

var stringRegEx = /("[^"\\\n\r]*(\\.[^"\\\n\r]*)*"|'[^'\\\n\r]*(\\.[^'\\\n\r]*)*')/g;

// used to support leading #!/usr/bin/env in scripts as supported in Node
var hashBangRegEx = /^\#\!.*/;

export function detectLegacyFormat (source) {
  if (source.match(amdRegEx))
    return 'amd';

  cjsExportsRegEx.lastIndex = 0;
  cjsRequireRegEx.lastIndex = 0;
  if (cjsRequireRegEx.exec(source) || cjsExportsRegEx.exec(source))
    return 'cjs';

  // global is the fallback format
  return 'global';
}

function sanitizeSourceMap (address, sourceMap) {
  var originalName = address.split('!')[0];

  // force set the filename of the original file
  if (!sourceMap.file || sourceMap.file == address)
    sourceMap.file = originalName + '!transpiled';

  // force set the sources list if only one source
  if (!sourceMap.sources || sourceMap.sources.length <= 1 && (!sourceMap.sources[0] || sourceMap.sources[0] === address))
    sourceMap.sources = [originalName];
}

function transpile (loader, source, key, metadata) {
  if (loader.transpiler === false) {
    // we accept translation to esm for builds though to enable eg rollup optimizations
    if (loader.builder)
      return source;
    throw new TypeError('Unable to dynamically transpile ES module as SystemJS.transpiler set to false.');
  }

  // deps support for es transpile
  if (metadata.load.deps) {
    var depsPrefix = '';
    for (var i = 0; i < metadata.load.deps.length; i++)
      depsPrefix += 'import "' + metadata.load.deps[i] + '"; ';
    source = depsPrefix + source;
  }

  // do transpilation
  return (loader.pluginLoader || loader).import.call(loader, loader.transpiler)
  .then(function (transpiler) {
    // translate hooks means this is a transpiler plugin instead of a raw implementation
    if (!transpiler.translate)
      throw new Error('Unable to load transpiler, ensure the SystemJS.transpiler is configured to a transpiler plugin. See the SystemJS README for more information.');

    // if transpiler is the same as the plugin loader, then don't run twice
    if (transpiler == metadata.pluginModule)
      return load.source;

    // convert the source map into an object for transpilation chaining
    if (typeof metadata.load.sourceMap === 'string')
      metadata.load.sourceMap = JSON.parse(metadata.load.sourceMap);

    metadata.pluginLoad = metadata.pluginLoad || {
      name: key,
      address: key,
      source: source,
      metadata: metadata.load
    };
    metadata.load.deps = metadata.load.deps || [];

    return Promise.resolve(transpiler.translate.call(loader, metadata.pluginLoad, metadata.traceOpts))
    .then(function (source) {
      // sanitize sourceMap if an object not a JSON string
      var sourceMap = metadata.load.sourceMap;
      if (sourceMap && typeof sourceMap === 'object')
        sanitizeSourceMap(key, sourceMap);

      if (metadata.load.format === 'esm' && !loader.builder && detectRegisterFormat(source))
        metadata.load.format = 'register';

      return source;
    });
  }, function (err) {
    throw addToError(err, 'Unable to load transpiler to transpile ' + key);
  });
}

// detect any meta header syntax
// only set if not already set
var metaRegEx = /^(\s*\/\*[^\*]*(\*(?!\/)[^\*]*)*\*\/|\s*\/\/[^\n]*|\s*"[^"]+"\s*;?|\s*'[^']+'\s*;?)+/;
var metaPartRegEx = /\/\*[^\*]*(\*(?!\/)[^\*]*)*\*\/|\/\/[^\n]*|"[^"]+"\s*;?|'[^']+'\s*;?/g;

function setMetaProperty(target, p, value) {
  var pParts = p.split('.');
  var curPart;
  while (pParts.length > 1) {
    curPart = pParts.shift();
    target = target[curPart] = target[curPart] || {};
  }
  curPart = pParts.shift();
  if (target[curPart] === undefined)
    target[curPart] = value;
}

function readMetaSyntax (source, metadata) {
  var meta = source.match(metaRegEx);
  if (!meta)
    return;

  var metaParts = meta[0].match(metaPartRegEx);

  for (var i = 0; i < metaParts.length; i++) {
    var curPart = metaParts[i];
    var len = curPart.length;

    var firstChar = curPart.substr(0, 1);
    if (curPart.substr(len - 1, 1) == ';')
      len--;

    if (firstChar != '"' && firstChar != "'")
      continue;

    var metaString = curPart.substr(1, curPart.length - 3);
    var metaName = metaString.substr(0, metaString.indexOf(' '));

    if (metaName) {
      var metaValue = metaString.substr(metaName.length + 1, metaString.length - metaName.length - 1);

      if (metaName === 'deps')
        metaName = 'deps[]';

      if (metaName.substr(metaName.length - 2, 2) === '[]') {
        metaName = metaName.substr(0, metaName.length - 2);
        metadata.load[metaName] = metadata.load[metaName] || [];
        metadata.load[metaName].push(metaValue);
      }
      else {
        setMetaProperty(metadata.load, metaName, metaValue);
      }
    }
    else {
      metadata.load[metaString] = true;
    }
  }
}
