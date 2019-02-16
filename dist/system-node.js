/*
* SystemJS - NodeJS 3.0.0
*/
'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var assert = require('assert');
var fs = _interopDefault(require('fs'));
var path = _interopDefault(require('path'));
var url = _interopDefault(require('url'));
var fileUrlFromPath = _interopDefault(require('file-url'));
var SourceMapSupport = _interopDefault(require('source-map-support'));
var vm = _interopDefault(require('vm'));
var stripShebang = _interopDefault(require('strip-shebang'));
require('isomorphic-fetch');
var fileFetch = _interopDefault(require('file-fetch'));

const isBrowser = typeof window !== 'undefined' && typeof document !== 'undefined';
const isNode = typeof process !== 'undefined' && process.versions && process.versions.node;

function getGlobal () {
  if (typeof self !== 'undefined') { return self; }
  if (typeof window !== 'undefined') { return window; }
  if (typeof global !== 'undefined') { return global; }
  throw new Error('unable to locate global object');
}

const envGlobal = getGlobal();

const URL$1 = envGlobal.URL
  ? envGlobal.URL
  : url.URL;

const pathToFileURL = url.pathToFileURL
  ? url.pathToFileURL
  : function pathToFileURL(filePath) {
    const fileUrl = new URL$1(fileUrlFromPath(filePath));
    if (!filePath.endsWith(path.sep)) {
      fileUrl.pathname += '/';
    }
    return fileUrl;
  };

const fileURLToPath = url.fileURLToPath
  ? url.fileURLToPath
  : function fileURLToPath(fileUrl) {
    return fileUrl.pathname;
  };

function getDefaultBaseUrl() {
  let url$$1;

  if (typeof location !== 'undefined') {
    url$$1 = location.href.split('#')[0].split('?')[0];
    const lastSepIndex = url$$1.lastIndexOf('/');
    if (lastSepIndex !== -1) {
      url$$1 = url$$1.slice(0, lastSepIndex + 1);
    }
  } else if (isNode) {
    url$$1 = pathToFileURL(process.cwd() + '/');
  }

  return url$$1;
}

const sourceMapSources = {};

SourceMapSupport.install({
  retrieveSourceMap: function(source) {
    if (!sourceMapSources[source])
      return null;

    return {
      url: source.replace('!transpiled', ''),
      map: sourceMapSources[source]
    };
  }
});


const baseUrl = getDefaultBaseUrl();
const DEFAULT_BASEURL = baseUrl;

const backslashRegEx = /\\/g;
function resolveIfNotPlainOrUrl (relUrl, parentUrl) {
  if (relUrl.indexOf('\\') !== -1)
    relUrl = relUrl.replace(backslashRegEx, '/');
  // protocol-relative
  if (relUrl[0] === '/' && relUrl[1] === '/') {
    return parentUrl.slice(0, parentUrl.indexOf(':') + 1) + relUrl;
  }
  // relative-url
  else if (relUrl[0] === '.' && (relUrl[1] === '/' || relUrl[1] === '.' && (relUrl[2] === '/' || relUrl.length === 2 && (relUrl += '/')) ||
      relUrl.length === 1  && (relUrl += '/')) ||
      relUrl[0] === '/') {
    const parentProtocol = parentUrl.slice(0, parentUrl.indexOf(':') + 1);
    // Disabled, but these cases will give inconsistent results for deep backtracking
    //if (parentUrl[parentProtocol.length] !== '/')
    //  throw new Error('Cannot resolve');
    // read pathname from parent URL
    // pathname taken to be part after leading "/"
    let pathname;
    if (parentUrl[parentProtocol.length + 1] === '/') {
      // resolving to a :// so we need to read out the auth and host
      if (parentProtocol !== 'file:') {
        pathname = parentUrl.slice(parentProtocol.length + 2);
        pathname = pathname.slice(pathname.indexOf('/') + 1);
      }
      else {
        pathname = parentUrl.slice(8);
      }
    }
    else {
      // resolving to :/ so pathname is the /... part
      pathname = parentUrl.slice(parentProtocol.length + (parentUrl[parentProtocol.length] === '/'));
    }

    if (relUrl[0] === '/')
      return parentUrl.slice(0, parentUrl.length - pathname.length - 1) + relUrl;

    // join together and split for removal of .. and . segments
    // looping the string instead of anything fancy for perf reasons
    // '../../../../../z' resolved to 'x/y' is just 'z'
    const segmented = pathname.slice(0, pathname.lastIndexOf('/') + 1) + relUrl;

    const output = [];
    let segmentIndex = -1;
    for (let i = 0; i < segmented.length; i++) {
      // busy reading a segment - only terminate on '/'
      if (segmentIndex !== -1) {
        if (segmented[i] === '/') {
          output.push(segmented.slice(segmentIndex, i + 1));
          segmentIndex = -1;
        }
      }

      // new segment - check if it is relative
      else if (segmented[i] === '.') {
        // ../ segment
        if (segmented[i + 1] === '.' && (segmented[i + 2] === '/' || i + 2 === segmented.length)) {
          output.pop();
          i += 2;
        }
        // ./ segment
        else if (segmented[i + 1] === '/' || i + 1 === segmented.length) {
          i += 1;
        }
        else {
          // the start of a new segment as below
          segmentIndex = i;
        }
      }
      // it is the start of a new segment
      else {
        segmentIndex = i;
      }
    }
    // finish reading out the last segment
    if (segmentIndex !== -1)
      output.push(segmented.slice(segmentIndex));
    return parentUrl.slice(0, parentUrl.length - pathname.length) + output.join('');
  }
}

/*
 * Import maps implementation
 *
 * To make lookups fast we pre-resolve the entire import map
 * and then match based on backtracked hash lookups
 *
 */

function resolveUrl (relUrl, parentUrl) {
  return resolveIfNotPlainOrUrl(relUrl, parentUrl) ||
      relUrl.indexOf(':') !== -1 && relUrl ||
      resolveIfNotPlainOrUrl('./' + relUrl, parentUrl);
}

function resolvePackages(pkgs) {
  var outPkgs = {};
  for (var p in pkgs) {
    var value = pkgs[p];
    // TODO package fallback support
    if (typeof value !== 'string')
      continue;
    outPkgs[resolveIfNotPlainOrUrl(p) || p] = value;
  }
  return outPkgs;
}

function parseImportMap (json, baseUrl) {
  const imports = resolvePackages(json.imports) || {};
  const scopes = {};
  if (json.scopes) {
    for (let scopeName in json.scopes) {
      const scope = json.scopes[scopeName];
      let resolvedScopeName = resolveUrl(scopeName, baseUrl);
      if (resolvedScopeName[resolvedScopeName.length - 1] !== '/')
        resolvedScopeName += '/';
      scopes[resolvedScopeName] = resolvePackages(scope) || {};
    }
  }

  return { imports: imports, scopes: scopes, baseUrl: baseUrl };
}

function getMatch (path$$1, matchObj) {
  if (matchObj[path$$1])
    return path$$1;
  let sepIndex = path$$1.length;
  do {
    const segment = path$$1.slice(0, sepIndex + 1);
    if (segment in matchObj)
      return segment;
  } while ((sepIndex = path$$1.lastIndexOf('/', sepIndex - 1)) !== -1)
}

function applyPackages (id, packages, baseUrl) {
  const pkgName = getMatch(id, packages);
  if (pkgName) {
    const pkg = packages[pkgName];
    if (pkg === null)

    if (id.length > pkgName.length && pkg[pkg.length - 1] !== '/')
      console.warn("Invalid package target " + pkg + " for '" + pkgName + "' should have a trailing '/'.");
    return resolveUrl(pkg + id.slice(pkgName.length), baseUrl);
  }
}

function resolveImportMap (id, parentUrl, importMap) {
  const urlResolved = resolveIfNotPlainOrUrl(id, parentUrl || DEFAULT_BASEURL);
  if (urlResolved)
    id = urlResolved;
  const scopeName = getMatch(parentUrl, importMap.scopes);
  if (scopeName) {
    const scopePackages = importMap.scopes[scopeName];
    const packageResolution = applyPackages(id, scopePackages, scopeName);
    if (packageResolution)
      return packageResolution;
  }
  return applyPackages(id, importMap.imports, importMap.baseUrl) || urlResolved || throwBare(id, parentUrl);
}

function throwBare (id, parentUrl) {
  throw new Error('Unable to resolve bare specifier "' + id + (parentUrl ? '" from ' + parentUrl : '"'));
}

/*
 * SystemJS Core
 *
 * Provides
 * - System.import
 * - System.register support for
 *     live bindings, function hoisting through circular references,
 *     reexports, dynamic import, import.meta.url, top-level await
 * - System.getRegister to get the registration
 * - Symbol.toStringTag support in Module objects
 * - Hookable System.createContext to customize import.meta
 * - System.onload(id, err?) handler for tracing / hot-reloading
 *
 * Core comes with no System.prototype.resolve or
 * System.prototype.instantiate implementations
 */

const hasSymbol = typeof Symbol !== 'undefined';
const toStringTag = hasSymbol && Symbol.toStringTag;
const REGISTRY = hasSymbol ? Symbol() : '@';

/**
 * Creates new SystemJS instance.
 *
 * @param {string} baseUrl
 * @constructor
 */
function SystemJS({ baseUrl: baseUrl$$1 } = {}) {
  this[REGISTRY] = Object.create(null);

  baseUrl$$1 = new URL$1(baseUrl$$1 || DEFAULT_BASEURL);
  if (!baseUrl$$1.pathname.endsWith('/')) {
    baseUrl$$1.pathname += '/';
  }

  Object.defineProperty(this,'baseUrl', { value: baseUrl$$1.href });
}

const systemJSPrototype = SystemJS.prototype;
systemJSPrototype.import = function (id, parentUrl) {
  const loader = this;
  return Promise.resolve(loader.resolve(id, parentUrl))
  .then(function (id) {
    const load = getOrCreateLoad(loader, id);
    return load.C || topLevelLoad(loader, load);
  });
};

// Hookable createContext function -> allowing eg custom import meta
systemJSPrototype.createContext = function (parentId) {
  return {
    url: parentId
  };
};

// onLoad(id, err) provided for tracing / hot-reloading
systemJSPrototype.onload = function () {};

let lastRegister;
systemJSPrototype.register = function (deps, declare) {
  lastRegister = [deps, declare];
};

/*
 * getRegister provides the last anonymous System.register call
 */
systemJSPrototype.getRegister = function () {
  const _lastRegister = lastRegister;
  lastRegister = undefined;
  return _lastRegister;
};

function getOrCreateLoad (loader, id, firstParentUrl) {
  let load = loader[REGISTRY][id];
  if (load)
    return load;

  const importerSetters = [];
  const ns = Object.create(null);
  if (toStringTag)
    Object.defineProperty(ns, toStringTag, { value: 'Module' });

  let instantiatePromise = Promise.resolve()
  .then(function () {
    return loader.instantiate(id, firstParentUrl);
  })
  .then(function (registration) {
    if (!registration)
      throw new Error('Module ' + id + ' did not instantiate');
    function _export (name, value) {
      // note if we have hoisted exports (including reexports)
      load.h = true;
      let changed = false;
      if (typeof name !== 'object') {
        if (!(name in ns) || ns[name] !== value) {
          ns[name] = value;
          changed = true;
        }
      }
      else {
        for (let p in name) {
          let value = name[p];
          if (!(p in ns) || ns[p] !== value) {
            ns[p] = value;
            changed = true;
          }
        }
      }
      if (changed)
        for (let i = 0; i < importerSetters.length; i++)
          importerSetters[i](ns);
      return value;
    }
    const declared = registration[1](_export, registration[1].length === 2 ? {
      import: function (importId) {
        return loader.import(importId, id);
      },
      meta: loader.createContext(id)
    } : undefined);
    load.e = declared.execute || function () {};
    return [registration[0], declared.setters || []];
  });

  instantiatePromise = instantiatePromise.catch(function (err) {
      loader.onload(load.id, err);
      throw err;
    });

  const linkPromise = instantiatePromise
  .then(function (instantiation) {
    return Promise.all(instantiation[0].map(function (dep, i) {
      const setter = instantiation[1][i];
      return Promise.resolve(loader.resolve(dep, id))
      .then(function (depId) {
        const depLoad = getOrCreateLoad(loader, depId, id);
        // depLoad.I may be undefined for already-evaluated
        return Promise.resolve(depLoad.I)
        .then(function () {
          if (setter) {
            depLoad.i.push(setter);
            // only run early setters when there are hoisted exports of that module
            // the timing works here as pending hoisted export calls will trigger through importerSetters
            if (depLoad.h || !depLoad.I)
              setter(depLoad.n);
          }
          return depLoad;
        });
      })
    }))
    .then(function (depLoads) {
      load.d = depLoads;
    });
  });

  // disable unhandled rejections
  linkPromise.catch(function () {});

  // Captial letter = a promise function
  return load = loader[REGISTRY][id] = {
    id: id,
    // importerSetters, the setters functions registered to this dependency
    // we retain this to add more later
    i: importerSetters,
    // module namespace object
    n: ns,

    // instantiate
    I: instantiatePromise,
    // link
    L: linkPromise,
    // whether it has hoisted exports
    h: false,

    // On instantiate completion we have populated:
    // dependency load records
    d: undefined,
    // execution function
    // set to NULL immediately after execution (or on any failure) to indicate execution has happened
    // in such a case, pC should be used, and pLo, pLi will be emptied
    e: undefined,

    // On execution we have populated:
    // the execution error if any
    eE: undefined,
    // in the case of TLA, the execution promise
    E: undefined,

    // On execution, pLi, pLo, e cleared

    // Promise for top-level completion
    C: undefined
  };
}

function instantiateAll (loader, load, loaded) {
  if (!loaded[load.id]) {
    loaded[load.id] = true;
    // load.L may be undefined for already-instantiated
    return Promise.resolve(load.L)
    .then(function () {
      return Promise.all(load.d.map(function (dep) {
        return instantiateAll(loader, dep, loaded);
      }));
    })
  }
}

function topLevelLoad (loader, load) {
  return load.C = instantiateAll(loader, load, {})
  .then(function () {
    return postOrderExec(loader, load, {});
  })
  .then(function () {
    return load.n;
  });
}

// the closest we can get to call(undefined)
const nullContext = Object.freeze(Object.create(null));

// returns a promise if and only if a top-level await subgraph
// throws on sync errors
function postOrderExec (loader, load, seen) {
  if (seen[load.id])
    return;
  seen[load.id] = true;

  if (!load.e) {
    if (load.eE)
      throw load.eE;
    if (load.E)
      return load.E;
    return;
  }

  // deps execute first, unless circular
  let depLoadPromises;
  load.d.forEach(function (depLoad) {
    {
      try {
        const depLoadPromise = postOrderExec(loader, depLoad, seen);
        if (depLoadPromise)
          (depLoadPromises = depLoadPromises || []).push(depLoadPromise);
      }
      catch (err) {
        loader.onload(load.id, err);
        throw err;
      }
    }
  });
  if (depLoadPromises) {
    return Promise.all(depLoadPromises)
      .then(doExec)
      .catch(function (err) {
        loader.onload(load.id, err);
        throw err;
      });
  }

  return doExec();

  function doExec () {
    try {
      let execPromise = load.e.call(nullContext);
      if (execPromise) {
        execPromise = execPromise.then(function () {
            load.C = load.n;
            load.E = null; // indicates completion
            loader.onload(load.id, null);
          }, function (err) {
            loader.onload(load.id, err);
            throw err;
          });
        execPromise.catch(function () {});
        return load.E = load.E || execPromise;
      }
      // (should be a promise, but a minify optimization to leave out Promise.resolve)
      load.C = load.n;
      loader.onload(load.id, null);
    }
    catch (err) {
      loader.onload(load.id, err);
      load.eE = err;
      throw err;
    }
    finally {
      load.L = load.I = undefined;
      load.e = null;
    }
  }
}

envGlobal.System = new SystemJS();

const URL$2 = global.URL
  ? global.URL
  : url.URL;


const pathToFileURL$1 = url.pathToFileURL
  ? url.pathToFileURL
  : function pathToFileURL(path$$1) {
    const theUrl = new URL$2(fileUrlFromPath(path$$1));
    if (path$$1.endsWith(path.sep)) {
      theUrl.pathname += '/';
    }
    return theUrl;
  };

const DEFAULT_BASEURL$1 = pathToFileURL$1(process.cwd() + '/');


function fileExists(path$$1) {
  try {
    fs.accessSync(path$$1);
    return fs.statSync(path$$1).isFile();
  } catch (err) {
    return false;
  }
}


function isURL(value) {
  if (value instanceof URL$2) {
    return true;
  }

  if (typeof value === 'string') {
    try {
      new URL$2(value);
      return true;
    } catch (err) {}
  }

  return false;
}

function unzipModuleVars(moduleVars = {}) {
  return Object.entries(moduleVars).reduce(({ params, args }, [key, value]) => ({
    params: [...params, key],
    args: [...args, value],
  }), { params: [], args: [] });
}


function wrapScript(sourceUrl, source, moduleVars) {
  const { params, args } = unzipModuleVars(moduleVars);

  const wrapped_before = `(function(${params.join(',')}){`;
  const wrappee = stripShebang(source);
  const wrapper_sourceUrl = sourceUrl ? `\n//# sourceURL=${sourceUrl}` : '';
  const wrapped_after = '})';

  return `${wrapped_before}${wrappee}${wrapped_after}${wrapper_sourceUrl}`;
}


function compileScriptBrowser(sourceUrl, source, moduleVars) {
  const { args } = unzipModuleVars(moduleVars);
  const wrapped = wrapScript(sourceUrl, source, moduleVars);

  (0, eval)(wrapped)(...args);
}


function compileScriptNode(sourceUrl, source, moduleVars) {
  const { args } = unzipModuleVars(moduleVars);
  const wrapped = wrapScript(sourceUrl, source, moduleVars);

  const runOptions = {
    displayErrors: true,
    filename: `${sourceUrl}`,
    lineOffset: 0,
  };

  vm.runInThisContext(wrapped, runOptions)(...args);
}


function compileScript(sourceUrl, source, moduleVars) {
  return (isNode? compileScriptNode : compileScriptBrowser)(sourceUrl, source, moduleVars);
}

function detectFormat(url$$1) {
  const ext = path.extname(url$$1.pathname);
  let format = null;

  if (ext === '.mjs') {
    format = 'esm';
  } else if (ext === '.json') {
    format = 'json';
  } else if (ext === '.js') {
    format = 'cjs';
  } else if (url$$1.protocol === 'builtin:') {
    return 'builtin';
  }

  return format;
}


function createFileURLReader(url$$1) {
  let CACHED_CONTENT;

  function read(force = false) {
    if (force === true || CACHED_CONTENT === undefined) {
      if (fileExists(read.url)) {
        CACHED_CONTENT = fs.readFileSync(read.url, 'utf8');
      } else {
        throw new Error(`File '${read.url.href}' does not exist.`);
      }
    }
    return CACHED_CONTENT;
  }

  try {
    read.url = new URL$1(url$$1);
  } catch (err) {
    read.url = pathToFileURL(url$$1);
  }

  read.format = detectFormat(read.url);

  return read;
}


function loadRegisterModule(getContent, loader) {
  const { url: url$$1 } = getContent;
  const source = getContent();

  compileScript(url$$1, source, {
    System: loader,
    SystemJS: loader,
  });
}


function loadBuiltinModule(getContent, loader) {
  const { url: url$$1 } = getContent;
  const name = url$$1.pathname;

  const nodeModule = require(name);

  const registration = [[], function declare(_export) {
    return {
      execute() {
        _export('default', nodeModule);
        _export(nodeModule);
      },
    };
  }];

  loader.register(...registration);
}


function loadJSONModule(getContent, loader) {
  const registration = [[], function declare(_export) {
    return {
      execute() {
        _export('default', JSON.parse(getContent()));
      },
    };
  }];

  loader.register(...registration);
}


systemJSPrototype.instantiate = function instantiate(url$$1, firstParentUrl) {
  assert.ok(url$$1, 'missing url');
  assert.ok(url$$1 instanceof URL$1 || typeof url$$1 === 'string', 'url must be a URL or string');

  url$$1 = new URL$1(url$$1);

  const getContent = createFileURLReader(url$$1);

  try {
    switch(getContent.format) {
      case 'builtin':
        loadBuiltinModule(getContent, this);
        break;

      case 'json':
        loadJSONModule(getContent, this);
        break;

      default:
        loadRegisterModule(getContent, this);
    }
  } catch (err) {
    if (err instanceof ReferenceError) {
      throw err;
    }
    throw new Error(`Error loading ${url$$1}${firstParentUrl ? ' from ' + firstParentUrl : ''}`);
  }

  return this.getRegister();
};



// class NodeLoader extends SystemJS {
//   constructor({ baseUrl = DEFAULT_BASEURL, importMapUrl } = {}) {
//     super(baseUrl, importMapUrl);
//
//     console.log('HEY THERE!');
//
//     // const resolverConfig = {
//     //   baseUrl: this.baseUrl,
//     //   importMapConfig,
//     // };
//
//     // this.resolvers = [
//     //   createImportMapResolver(resolverConfig),
//     //   createNodeResolver(resolverConfig),
//     // ];
//   }
//
//   // resolve(id, parentUrl) {
//   //   let resolved;
//   //
//   //   for (let resolver of this.resolvers) {
//   //     try {
//   //       resolved = resolver(id, parentUrl);
//   //       if (resolved) {
//   //         return resolved;
//   //       }
//   //     } catch (err) {
//   //       // Do nothing. Continue...
//   //     }
//   //   }
//   //
//   //   throw new Error(`Cannot resolve "${id}"${parentUrl ? ` from ${parentUrl}` : ''}`);
//   // }
//
//
//   async instantiate(url, firstParentUrl) {
//     assert(url, 'missing url');
//     assert(url instanceof URL || typeof url === 'string', 'url must be a URL or string');
//
//     url = new URL(url);
//
//     const getContent = createFileURLReader(url);
//
//     try {
//       switch(getContent.format) {
//         case 'builtin':
//           loadBuiltinModule(getContent, this);
//           break;
//
//         case 'json':
//           loadJSONModule(getContent, this);
//           break;
//
//         default:
//           loadRegisterModule(getContent, this);
//       }
//     } catch (err) {
//       if (err instanceof ReferenceError) {
//         throw err;
//       }
//       throw new Error(`Error loading ${url}${firstParentUrl ? ' from ' + firstParentUrl : ''}`);
//     }
//
//     return this.getRegister();
//   }
// }

// SystemJS.prototype = systemJSPrototype;
// systemJSPrototype.constructor = SystemJS;
// global.System = new SystemJS();
//
//
// global.System = new NodeLoader();
//
// export default NodeLoader;

/**
 * This polyfills Node with a version of fetch that can handle
 * "file" URLs.
 */

const globalFetch = envGlobal.fetch;

function fetch(input, init) {
  const { protocol, href } = new URL(input);
  if (isNode && protocol === 'file:') {
   return fileFetch(href, init);
  }
  return globalFetch(href, init);
}

/*
 * Import map support for SystemJS
 *
 * Browser:
 *   <script type="systemjs-importmap">{}</script>
 *   OR
 *   <script type="systemjs-importmap" src=package.json></script>
 *
 * Node:
 *   Place "systemjs-importmap.json" in project root folder
 *
 * Only supports loading the first import map
 */


function locateImportMapBrowser() {
  if (typeof document !== 'undefined') {
    const scripts = Array.from(document.getElementsByTagName('script'));
    const importMapScript = scripts.find((script => script.type === 'systemjs-importmap'));

    if (importMapScript) {
      if (importMapScript.src) {
        return new URL$1(importMapScript.src);
      }
      return JSON.parse(importMapScript.innerHTML);
    }
  }

  return undefined;
}


function locateImportMapNode(baseUrl$$1, importMapUrl) {
  if (isURL(importMapUrl)) {
    importMapUrl = new URL$1(importMapUrl);
  } else {
    importMapUrl = new URL$1('./systemjs-importmap.json', baseUrl$$1);
  }

  if (fileExists(importMapUrl)) {
    return importMapUrl;
  }

  return undefined;
}


function locateImportMap(baseUrl$$1, importMapUrl) {
  if (isBrowser) {
    return locateImportMapBrowser();
  } else if (isNode) {
    return locateImportMapNode(baseUrl$$1, importMapUrl);
  }
}


function fetchImportMap(input) {
  if (input instanceof URL$1) {
    return fetch(input.href).then(res => res.json());
  } else if (typeof input === 'object' && input !== null) {
    return Promise.resolve(input);
  }

  return Promise.resolve(undefined);
}


function createImportMap(loader, importMapUrl) {
  const location = locateImportMap(loader.baseUrl, importMapUrl);

  return fetchImportMap(location).then(data => {
    if (data) {
      const baseUrl$$1 = location instanceof URL$1 ? location.href : loader.baseUrl;
      return parseImportMap(data, baseUrl$$1);
    } else {
      return { imports: {}, scopes: {} };
    }
  });
}


const importMapRegistry = new WeakMap();

function setImportMap(loader, importMap) {
  importMapRegistry.set(loader, importMap);
}

function getImportMap(loader) {
  return importMapRegistry.get(loader);
}


const constructor = systemJSPrototype.constructor;
function SystemJS$1({ baseUrl: baseUrl$$1, importMapUrl } = {}) {
  constructor.call(this, { baseUrl: baseUrl$$1 });

  this.registerRegistry = Object.create(null);
  const importMap = createImportMap(this, importMapUrl);
  setImportMap(this, importMap);
}

SystemJS$1.prototype = Object.create(systemJSPrototype);
SystemJS$1.prototype.constructor = SystemJS$1;

/**
 * @async
 *
 * Resolves a module import specifier.
 *
 * @param {string} id - Module import specifier
 * @param {string} [parentUrl] - The URL of the importing module.
 *
 * @return {Promise<string>} The resolved URL
 */
SystemJS$1.prototype.resolve = function resolve(id, parentUrl) {
  parentUrl = parentUrl || this.baseUrl;
  return getImportMap(this).then(importMap => resolveImportMap(id, parentUrl, importMap));
};

envGlobal.System = new SystemJS$1();

systemJSPrototype.get = function get(id) {
  const load = this[REGISTRY][id];
  if (load && load.e === null && !load.E) {
    if (load.eE)
      return null;
    return load.n;
  }
};

// Delete function provided for hot-reloading use cases
systemJSPrototype.delete = function (id) {
  const load = this.get(id);
  if (load === undefined)
    return false;
  // remove from importerSetters
  // (release for gc)
  if (load && load.d)
    load.d.forEach(function (depLoad) {
      const importerIndex = depLoad.i.indexOf(load);
      if (importerIndex !== -1)
        depLoad.i.splice(importerIndex, 1);
    });
  return delete this[REGISTRY][id];
};
//# sourceMappingURL=system-node.js.map
