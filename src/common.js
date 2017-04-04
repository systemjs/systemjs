import { resolveIfNotPlain } from 'es-module-loader/core/resolve.js';
import { baseURI, isBrowser, isWindows, addToError, global, createSymbol } from 'es-module-loader/core/common.js';
import RegisterLoader from 'es-module-loader/core/register-loader.js';
import { ModuleNamespace } from 'es-module-loader/core/loader-polyfill.js';

export { baseURI, isBrowser, isWindows, addToError, global, resolveIfNotPlain, ModuleNamespace }

export var resolvedPromise = Promise.resolve();
export function noop () {};

export var emptyModule = new ModuleNamespace({});

export function protectedCreateNamespace (bindings) {
  if (bindings instanceof ModuleNamespace)
    return bindings;

  if (bindings && bindings.__esModule)
    return new ModuleNamespace(bindings);

  return new ModuleNamespace({ default: bindings, __useDefault: true });
}

var hasStringTag;
export function isModule (m) {
  if (hasStringTag === undefined)
    hasStringTag = typeof Symbol !== 'undefined' && !!Symbol.toStringTag;
  return m instanceof ModuleNamespace || hasStringTag && Object.prototype.toString.call(m) == '[object Module]';
}

export var CONFIG = createSymbol('loader-config');
export var METADATA = createSymbol('metadata');
export var PLAIN_RESOLVE = createSymbol('plain-resolve');
export var PLAIN_RESOLVE_SYNC = createSymbol('plain-resolve-sync');

export var isWorker = typeof window === 'undefined' && typeof self !== 'undefined' && typeof importScripts !== 'undefined';

export function warn (msg, force) {
  if (force || this.warnings && typeof console !== 'undefined' && console.warn)
    console.warn(msg);
}

export function checkInstantiateWasm (loader, wasmBuffer, processAnonRegister) {
  var bytes = new Uint8Array(wasmBuffer);

  // detect by leading bytes
  // Can be (new Uint32Array(fetched))[0] === 0x6D736100 when working in Node
  if (bytes[0] === 0 && bytes[1] === 97 && bytes[2] === 115) {
    return WebAssembly.compile(wasmBuffer).then(function (m) {
      var deps = [];
      var setters = [];
      var importObj = {};

      // we can only set imports if supported (eg Safari doesnt support)
      if (WebAssembly.Module.imports)
        WebAssembly.Module.imports(m).forEach(function (i) {
          var key = i.module;
          setters.push(function (m) {
            importObj[key] = m;
          });
          if (deps.indexOf(key) === -1)
            deps.push(key);
        });
      loader.register(deps, function (_export) {
        return {
          setters: setters,
          execute: function () {
            _export(new WebAssembly.Instance(m, importObj).exports);
          }
        };
      });
      processAnonRegister();

      return true;
    });
  }

  return Promise.resolve(false);
}

var parentModuleContext;
export function loadNodeModule (key, baseURL) {
  if (key[0] === '.')
    throw new Error('Node module ' + key + ' can\'t be loaded as it is not a package require.');

  if (!parentModuleContext) {
    var Module = this._nodeRequire('module');
    var base = baseURL.substr(isWindows ? 8 : 7);
    parentModuleContext = new Module(base);
    parentModuleContext.paths = Module._nodeModulePaths(base);
  }
  return parentModuleContext.require(key);
}

export function extend (a, b) {
  for (var p in b) {
    if (!Object.hasOwnProperty.call(b, p))
      continue;
    a[p] = b[p];
  }
  return a;
}

export function prepend (a, b) {
  for (var p in b) {
    if (!Object.hasOwnProperty.call(b, p))
      continue;
    if (a[p] === undefined)
      a[p] = b[p];
  }
  return a;
}

// meta first-level extends where:
// array + array appends
// object + object extends
// other properties replace
export function extendMeta (a, b, _prepend) {
  for (var p in b) {
    if (!Object.hasOwnProperty.call(b, p))
      continue;
    var val = b[p];
    if (a[p] === undefined)
      a[p] = val;
    else if (val instanceof Array && a[p] instanceof Array)
      a[p] = [].concat(_prepend ? val : a[p]).concat(_prepend ? a[p] : val);
    else if (typeof val == 'object' && val !== null && typeof a[p] == 'object')
      a[p] = (_prepend ? prepend : extend)(extend({}, a[p]), val);
    else if (!_prepend)
      a[p] = val;
  }
}

var supportsPreload = false, supportsPrefetch = false;
if (isBrowser)
  (function () {
    var relList = document.createElement('link').relList;
    if (relList && relList.supports) {
      supportsPrefetch = true;
      try {
        supportsPreload = relList.supports('preload');
      }
      catch (e) {}
    }
  })();

export function preloadScript (url) {
  // fallback to old fashioned image technique which still works in safari
  if (!supportsPreload && !supportsPrefetch) {
    var preloadImage = new Image();
    preloadImage.src = url;
    return;
  }

  var link = document.createElement('link');
  if (supportsPreload) {
    link.rel = 'preload';
    link.as = 'script';
  }
  else {
    // this works for all except Safari (detected by relList.supports lacking)
    link.rel = 'prefetch';
  }
  link.href = url;
  document.head.appendChild(link);
  document.head.removeChild(link);
}

function workerImport (src, resolve, reject) {
  try {
    importScripts(src);
  }
  catch (e) {
    reject(e);
  }
  resolve();
}

if (isBrowser) {
  var loadingScripts = [];
  var onerror = window.onerror;
  window.onerror = function globalOnerror (msg, src) {
    for (var i = 0; i < loadingScripts.length; i++) {
      if (loadingScripts[i].src !== src)
        continue;
      loadingScripts[i].err(msg);
      return;
    }
    if (onerror)
      onerror.apply(this, arguments);
  };
}

export function scriptLoad (src, crossOrigin, integrity, resolve, reject) {
  // percent encode just "#" for HTTP requests
  src = src.replace(/#/g, '%23');

  // subresource integrity is not supported in web workers
  if (isWorker)
    return workerImport(src, resolve, reject);

  var script = document.createElement('script');
  script.type = 'text/javascript';
  script.charset = 'utf-8';
  script.async = true;

  if (crossOrigin)
    script.crossOrigin = crossOrigin;
  if (integrity)
    script.integrity = integrity;

  script.addEventListener('load', load, false);
  script.addEventListener('error', error, false);

  script.src = src;
  document.head.appendChild(script);

  function load () {
    resolve();
    cleanup();
  }

  // note this does not catch execution errors
  function error (err) {
    cleanup();
    reject(new Error('Fetching ' + src));
  }

  function cleanup () {
    for (var i = 0; i < loadingScripts.length; i++) {
      if (loadingScripts[i].err === error) {
        loadingScripts.splice(i, 1);
        break;
      }
    }
    script.removeEventListener('load', load, false);
    script.removeEventListener('error', error, false);
    document.head.removeChild(script);
  }
}

export function readMemberExpression (p, value) {
  var pParts = p.split('.');
  while (pParts.length)
    value = value[pParts.shift()];
  return value;
}

// separate out paths cache as a baseURL lock process
export function applyPaths (baseURL, paths, key) {
  var mapMatch = getMapMatch(paths, key);
  if (mapMatch) {
    var target = paths[mapMatch] + key.substr(mapMatch.length);

    var resolved = resolveIfNotPlain(target, baseURI);
    if (resolved !== undefined)
      return resolved;

    return baseURL + target;
  }
  else if (key.indexOf(':') !== -1) {
    return key;
  }
  else {
    return baseURL + key;
  }
}

function checkMap (p) {
  var name = this.name;
  // can add ':' here if we want paths to match the behaviour of map
  if (name.substr(0, p.length) === p && (name.length === p.length || name[p.length] === '/' || p[p.length - 1] === '/' || p[p.length - 1] === ':')) {
    var curLen = p.split('/').length;
    if (curLen > this.len) {
      this.match = p;
      this.len = curLen;
    }
  }
}

export function getMapMatch (map, name) {
  if (Object.hasOwnProperty.call(map, name))
    return name;

  var bestMatch = {
    name: name,
    match: undefined,
    len: 0
  };

  Object.keys(map).forEach(checkMap, bestMatch);

  return bestMatch.match;
}

// RegEx adjusted from https://github.com/jbrantly/yabble/blob/master/lib/yabble.js#L339
export var cjsRequireRegEx = /(?:^\uFEFF?|[^$_a-zA-Z\xA0-\uFFFF."'])require\s*\(\s*("[^"\\]*(?:\\.[^"\\]*)*"|'[^'\\]*(?:\\.[^'\\]*)*')\s*\)/g;
