/*
 * Script instantiation loading
 */
import { hasDocument } from '../common.js';
import { systemJSPrototype } from '../system-core.js';
import { errMsg } from '../err-msg.js';

systemJSPrototype.createScript = function (url) {
  var script = document.createElement('script');
  script.charset = 'utf-8';
  script.async = true;
  script.crossOrigin = 'anonymous';
  script.src = url;
  return script;
};

var lastWindowErrorUrl, lastWindowError;
systemJSPrototype.instantiate = function (url, firstParentUrl) {
  var loader = this;
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
        resolve(loader.getRegister());
      }
    });
    document.head.appendChild(script);
  });
};

if (hasDocument)
  window.addEventListener('error', function (evt) {
    lastWindowErrorUrl = evt.filename;
    lastWindowError = evt.error;
  });
