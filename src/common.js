import { resolveUrlToParentIfNotPlain } from 'es-module-loader/core/resolve.js';
import { baseURI, isBrowser, isWindows, addToError, global } from 'es-module-loader/core/common.js';

export { baseURI, isBrowser, isWindows, addToError, global }

export var isWorker = typeof window == 'undefined' && typeof self != 'undefined' && typeof importScripts != 'undefined';

export var scriptSrc;

if (typeof document !== 'undefined') {
  var scripts = document.getElementsByTagName('script');
  var curScript = scripts[scripts.length - 1];
  if (document.currentScript && (curScript.defer || curScript.async))
    curScript = document.currentScript;

  scriptSrc = curScript.src;
}
// worker
else if (typeof importScripts !== 'undefined') {
  try {
    throw new Error('_');
  }
  catch (e) {
    e.stack.replace(/(?:at|@).*(http.+):[\d]+:[\d]+/, function(m, url) {
      scriptSrc = url;
    });
  }
}
// node
else if (typeof __filename !== 'undefined') {
  scriptSrc = __filename;
}

// include the node require since we're overriding it
export var nodeRequire;
if (typeof require !== 'undefined' && typeof process !== 'undefined' && !process.browser)
  nodeRequire = require;

export function warn (msg, force) {
  if (force || this.warnings && typeof console !== 'undefined' && console.warn)
    console.warn(msg);
}

var absURLRegEx = /^[^\/]+:\/\//;
export function isAbsolute (name) {
  return name.match(absURLRegEx);
}
export function isRel (name) {
  return (name[0] === '.' && (!name[1] || name[1] === '/' || name[1] === '.')) || name[0] === '/';
}
export function isPlain (name) {
  return !isRel(name) && !isAbsolute(name);
}

export function urlResolve (url, parentUrl) {
  return resolveUrlToParentIfNotPlain(url, parentUrl || baseURI) || resolveUrlToParentIfNotPlain('./' + url, parentUrl || baseURI);
}

export function applyPaths (loader, name) {
  // most specific (most number of slashes in path) match wins
  var pathMatch = '', wildcard;

  var paths = loader.paths;
  var pathsCache = loader._loader.paths;

  // check to see if we have a paths entry
  for (var p in paths) {
    if (!paths.hasOwnProperty(p))
      continue;

    // paths sanitization
    var path = paths[p];
    if (path !== pathsCache[p])
      path = paths[p] = pathsCache[p] = urlResolve(paths[p], isRel(paths[p]) ? baseURI : loader.baseURL);

    // exact path match
    if (name == p) {
      return paths[p];
    }
    // support trailing / in paths rules
    else if (name.substr(0, p.length - 1) == p.substr(0, p.length - 1) && (name.length < p.length || name[p.length - 1] == p[p.length - 1]) && (paths[p][paths[p].length - 1] == '/' || paths[p] == '')) {
      return paths[p].substr(0, paths[p].length - 1) + (name.length > p.length ? (paths[p] && '/' || '') + name.substr(p.length) : '');
    }
  }

  var outPath = paths[pathMatch];
  if (typeof wildcard == 'string')
    outPath = outPath.replace('*', wildcard);

  return outPath;
}

var parentModuleContext;
export function loadNodeModule (name, baseURL) {
  if (!isPlain(name))
    throw new Error('Node module ' + name + ' can\'t be loaded as it is not a package require.');

  if (!parentModuleContext) {
    var Module = this._nodeRequire('module');
    var base = baseURL.substr(isWindows ? 8 : 7);
    parentModuleContext = new Module(base);
    parentModuleContext.paths = Module._nodeModulePaths(base);
  }
  return parentModuleContext.require(name);
}

export function extend (a, b, prepend) {
  for (var p in b) {
    if (!b.hasOwnProperty(p))
      continue;
    if (!prepend || a[p] === undefined)
      a[p] = b[p];
  }
  return a;
}

// meta first-level extends where:
// array + array appends
// object + object extends
// other properties replace
export function extendMeta (a, b, prepend) {
  for (var p in b) {
    if (!b.hasOwnProperty(p))
      continue;
    var val = b[p];
    if (a[p] === undefined)
      a[p] = val;
    else if (val instanceof Array && a[p] instanceof Array)
      a[p] = [].concat(prepend ? val : a[p]).concat(prepend ? a[p] : val);
    else if (typeof val == 'object' && val !== null && typeof a[p] == 'object')
      a[p] = extend(extend({}, a[p]), val, prepend);
    else if (!prepend)
      a[p] = val;
  }
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

var curSystem, curRequire;

export function scriptLoad (src, crossOrigin, integrity, resolve, reject) {
  // percent encode just "#" for HTTP requests
  src = src.replace(/#/g, '%23');

  if (isWorker) {
    if (integrity)
      reject(new Error('Subresource integrity checking is not supported in web workers.'));
    else
      workerImport(src, resolve, reject);
  }
  else {
    curSystem = global.System;
    curRequire = global.require;

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
      global.System = curSystem;
      global.require = curRequire;
      script.removeEventListener('load', load, false);
      script.removeEventListener('error', error, false);
      document.head.removeChild(script);
    }
  }
}

export function readMemberExpression (p, value) {
  var pParts = p.split('.');
  while (pParts.length)
    value = value[pParts.shift()];
  return value;
}

export function getMapMatch (map, name) {
  var bestMatch, bestMatchLength = 0;

  for (var p in map) {
    if (name.substr(0, p.length) === p && (name.length === p.length || name[p.length] === '/')) {
      var curMatchLength = p.split('/').length;
      if (curMatchLength <= bestMatchLength)
        continue;
      bestMatch = p;
      bestMatchLength = curMatchLength;
    }
  }

  return bestMatch;
}

var hasBuffer = typeof Buffer !== 'undefined';
try {
  if (hasBuffer && new Buffer('a').toString('base64') !== 'YQ==')
    hasBuffer = false;
}
catch (e) {
  hasBuffer = false;
}

var sourceMapPrefix = '\n//# sourceMapping' + 'URL=data:application/json;base64,';
function inlineSourceMap (sourceMapString) {
  if (hasBuffer)
    return sourceMapPrefix + new Buffer(sourceMapString).toString('base64');
  else if (typeof btoa !== 'undefined')
    return sourceMapPrefix + btoa(unescape(encodeURIComponent(sourceMapString)));
  else
    return '';
}

function getSource(source, sourceMap, address, wrap) {
  var lastLineIndex = source.lastIndexOf('\n');

  if (sourceMap) {
    if (typeof sourceMap != 'object')
      throw new TypeError('load.metadata.sourceMap must be set to an object.');

    sourceMap = JSON.stringify(sourceMap);
  }

  return (wrap ? '(function(System, SystemJS) {' : '') + source + (wrap ? '\n})(System, System);' : '')
      // adds the sourceURL comment if not already present
      + (source.substr(lastLineIndex, 15) != '\n//# sourceURL='
        ? '\n//# sourceURL=' + address + (sourceMap ? '!transpiled' : '') : '')
      // add sourceMappingURL if load.metadata.sourceMap is set
      + (sourceMap && inlineSourceMap(sourceMap) || '');
}

var curSystem;
var callCounter = 0;
function preExec (loader) {
  if (callCounter++ == 0)
    curSystem = global.System;
  global.System = global.SystemJS = loader;
}
function postExec () {
  if (--callCounter == 0)
    global.System = global.SystemJS = curSystem;
}

var supportsScriptExec = false;
if (isBrowser && typeof document != 'undefined' && document.getElementsByTagName) {
  if (!(window.chrome && window.chrome.extension || navigator.userAgent.match(/^Node\.js/)))
    supportsScriptExec = true;
}

// script execution via injecting a script tag into the page
// this allows CSP integrity and nonce to be set for CSP environments
var head;
function scriptExec(loader, source, sourceMap, address, integrity, nonce) {
  if (!head)
    head = document.head || document.body || document.documentElement;

  var script = document.createElement('script');
  script.text = getSource(source, sourceMap, address, false);
  var onerror = window.onerror;
  var e;
  window.onerror = function(_e) {
    e = addToError(_e, 'Evaluating ' + address);
    if (onerror)
      onerror.apply(this, arguments);
  }
  preExec(loader);

  if (integrity)
    script.setAttribute('integrity', integrity);
  if (nonce)
    script.setAttribute('nonce', nonce);

  head.appendChild(script);
  head.removeChild(script);
  postExec();
  window.onerror = onerror;
  if (e)
    return e;
}

var vm;
var useVm;

export function evaluate (loader, source, sourceMap, address, integrity, nonce, noWrap) {
  if (!source)
    return;
  if ((integrity || nonce) && supportsScriptExec)
    return scriptExec(loader, source, sourceMap, address, integrity, nonce);
  try {
    preExec(loader);
    // global scoped eval for node (avoids require scope leak)
    if (!vm && loader._nodeRequire) {
      vm = loader._nodeRequire('vm');
      useVm = vm.runInThisContext("typeof System !== 'undefined' && System") === loader;
    }
    if (useVm)
      vm.runInThisContext(getSource(source, sourceMap, address, !noWrap), { filename: address + (sourceMap ? '!transpiled' : '') });
    else
      (0, eval)(getSource(source, sourceMap, address, !noWrap));
    postExec();
  }
  catch (e) {
    postExec();
    return e;
  }
}

// RegEx adjusted from https://github.com/jbrantly/yabble/blob/master/lib/yabble.js#L339
export var cjsRequireRegEx = /(?:^\uFEFF?|[^$_a-zA-Z\xA0-\uFFFF."'])require\s*\(\s*("[^"\\]*(?:\\.[^"\\]*)*"|'[^'\\]*(?:\\.[^'\\]*)*')\s*\)/g;
