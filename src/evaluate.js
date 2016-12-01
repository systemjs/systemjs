import { isBrowser, global } from './common.js';

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

// script execution via injecting a script tag into the page
// this allows CSP nonce to be set for CSP environments
var head;
function scriptExec(loader, source, sourceMap, address, nonce) {
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

export function evaluate (loader, source, sourceMap, address, integrity, nonce, noWrap) {
  if (!source)
    return;
  if (nonce && supportsScriptExec)
    return scriptExec(loader, source, sourceMap, address, nonce);
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
