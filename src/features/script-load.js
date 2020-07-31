/*
 * Script instantiation loading
 */
import { hasDocument } from '../common.js';
import { systemJSPrototype } from '../system-core.js';
import { errMsg } from '../err-msg.js';

if (hasDocument) {
  window.addEventListener('error', function (evt) {
    lastWindowErrorUrl = evt.filename;
    lastWindowError = evt.error;
  });
  var baseOrigin = location.origin
}

systemJSPrototype.createScript = function (url) {
  var script = document.createElement('script');
  script.charset = 'utf-8';
  script.async = true;
  // Only add cross origin for actual cross origin
  // this is because Safari triggers for all
  // - https://bugs.webkit.org/show_bug.cgi?id=171566
  if (!url.startsWith(baseOrigin + '/'))
    script.crossOrigin = 'anonymous';
  script.src = url;
  return script;
};

// Auto imports -> script tags can be inlined directly for load phase
var lastAutoImportUrl, lastAutoImportDeps;
var autoImportCandidates = {};
var systemRegister = systemJSPrototype.register;
var timeoutCnt = 0;
systemJSPrototype.register = function (deps, declare) {
  if (hasDocument && document.readyState === 'loading' && typeof deps !== 'string') {
    var scripts = document.getElementsByTagName('script');
    var lastScript = scripts[scripts.length - 1];
    var url = lastScript && lastScript.src;
    if (url) {
      lastAutoImportUrl = url;
      lastAutoImportDeps = deps;
      autoImportCandidates[url] = [deps, declare];
      var loader = this;
      // This timeout ensures that if this is a dynamic script injection by SystemJS
      // that the auto import will be cleared after the timeout and hence will not
      // be auto imported
      timeoutCnt++;
      setTimeout(function () {
        if (autoImportCandidates[url])
          loader.import(url);
        if (--timeoutCnt === 0 && document.readyState !== 'loading')
          autoImportCandidates = {};
      });
    }
  }
  else {
    lastAutoImportDeps = undefined;
  }
  return systemRegister.call(this, deps, declare);
};

var lastWindowErrorUrl, lastWindowError;
systemJSPrototype.instantiate = function (url, firstParentUrl) {
  var loader = this;
  var autoImportRegistration = autoImportCandidates[url];
  if (autoImportRegistration) {
    delete autoImportCandidates[url];
    return autoImportRegistration;
  }
  return new Promise(function (resolve, reject) {
    var script = systemJSPrototype.createScript(url);
    script.addEventListener('error', function () {
      reject(Error(errMsg(3, process.env.SYSTEM_PRODUCTION ? [url, firstParentUrl].join(', ') : 'Error loading ' + url + (firstParentUrl ? ' from ' + firstParentUrl : ''))));
    });
    script.addEventListener('load', function () {
      document.head.removeChild(script);
      // Note that if an error occurs that isn't caught by this if statement,
      // that getRegister will return null and a "did not instantiate" error will be thrown.
      if (lastWindowErrorUrl === url) {
        reject(lastWindowError);
      }
      else {
        var register = loader.getRegister();
        // Clear any auto import registration for dynamic import scripts during load
        if (register && register[0] === lastAutoImportDeps)
          delete autoImportCandidates[lastAutoImportUrl];
        resolve(register);
      }
    });
    document.head.appendChild(script);
  });
};
