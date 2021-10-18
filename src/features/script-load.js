/*
 * Script instantiation loading
 */
import { hasDocument } from '../common.js';
import { systemJSPrototype } from '../system-core.js';
import { errMsg } from '../err-msg.js';
import { importMap } from './import-maps.js';

if (hasDocument) {
  window.addEventListener('error', function (evt) {
    lastWindowErrorUrl = evt.filename;
    lastWindowError = evt.error;
  });
  var baseOrigin = location.origin;
}

systemJSPrototype.createScript = function (url) {
  var script = document.createElement('script');
  script.async = true;
  // Only add cross origin for actual cross origin
  // this is because Safari triggers for all
  // - https://bugs.webkit.org/show_bug.cgi?id=171566
  if (url.indexOf(baseOrigin + '/'))
    script.crossOrigin = 'anonymous';
  var integrity = importMap.integrity[url];
  if (integrity)
    script.integrity = integrity;
  script.src = url;
  return script;
};

// Auto imports -> script tags can be inlined directly for load phase
var lastAutoImportUrl, lastAutoImportDeps, lastAutoImportTimeout;
var autoImportCandidates = {};
var systemRegister = systemJSPrototype.register;
systemJSPrototype.register = function (deps, declare) {
  if (hasDocument && document.readyState === 'loading' && typeof deps !== 'string') {
    var scripts = document.querySelectorAll('script[src]');
    var lastScript = scripts[scripts.length - 1];
    if (lastScript) {
      lastAutoImportUrl = lastScript.src;
      lastAutoImportDeps = deps;
      // if this is already a System load, then the instantiate has already begun
      // so this re-import has no consequence
      var loader = this;
      lastAutoImportTimeout = setTimeout(function () {
        autoImportCandidates[lastScript.src] = [deps, declare];
        loader.import(lastScript.src);
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
  var autoImportRegistration = autoImportCandidates[url];
  if (autoImportRegistration) {
    delete autoImportCandidates[url];
    return autoImportRegistration;
  }
  var loader = this;
  return Promise.resolve(systemJSPrototype.createScript(url)).then(function (script) {
    return new Promise(function (resolve, reject) {
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
          var register = loader.getRegister(url);
          // Clear any auto import registration for dynamic import scripts during load
          if (register && register[0] === lastAutoImportDeps)
            clearTimeout(lastAutoImportTimeout);
          resolve(register);
        }
      });
      document.head.appendChild(script);
    });
  });
};
