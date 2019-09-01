/*
 * Supports loading System.register via script tag injection
 */

import { systemJSPrototype } from '../system-core';

const systemRegister = systemJSPrototype.register;
systemJSPrototype.register = function (deps, declare) {
  systemRegister.call(this, deps, declare);
};

systemJSPrototype.instantiate = function (url, firstParentUrl) {
  const loader = this;
  return new Promise(function (resolve, reject) {
    let err;

    function windowErrorListener(evt) {
      if (evt.filename === url)
        err = evt.error;
    }

    window.addEventListener('error', windowErrorListener);

    const script = document.createElement('script');
    script.charset = 'utf-8';
    script.async = true;
    script.crossOrigin = 'anonymous';
    script.addEventListener('error', function () {
      window.removeEventListener('error', windowErrorListener);
      reject(Error('Error loading ' + url + (firstParentUrl ? ' from ' + firstParentUrl : '')));
    });
    script.addEventListener('load', function () {
      window.removeEventListener('error', windowErrorListener);
      document.head.removeChild(script);
      // Note that if an error occurs that isn't caught by this if statement,
      // that getRegister will return null and a "did not instantiate" error will be thrown.
      if (err) {
        reject(err);
      }
      else {
        resolve(loader.getRegister());
      }
    });
    script.src = url;
    document.head.appendChild(script);
  });
};

if (typeof window !== 'undefined') {
  window.addEventListener('load', loadScriptModules);
}

function loadScriptModules() {
  window.removeEventListener('load', loadScriptModules);
  document.querySelectorAll('script[type=systemjs-module]').forEach(function (script) {
    if (script.src) {
      System.import(script.src.slice(0, 7) === 'import:' ? script.src.slice(7) : script.src);
    } else {
      console.error('inline systemjs-module scripts are not yet supported');
    }
  });
}