/*
 * Supports loading System.register via script tag injection
 */

import { systemJSPrototype } from '../system-core';

let err;
if (typeof window !== 'undefined')
  window.addEventListener('error', function (e) {
    err = e.error;
  });

const systemRegister = systemJSPrototype.register;
systemJSPrototype.register = function (deps, declare) {
  err = undefined;
  systemRegister.call(this, deps, declare);
};

systemJSPrototype.instantiate = function (url, firstParentUrl) {
  const loader = this;
  return new Promise(function (resolve, reject) {
    const script = document.createElement('script');
    script.charset = 'utf-8';
    script.async = true;
    script.crossOrigin = 'anonymous';
    script.addEventListener('error', function () {
      reject(new Error('Error loading ' + url + (firstParentUrl ? ' from ' + firstParentUrl : '')));
    });
    script.addEventListener('load', function () {
      document.head.removeChild(script);
      // Note URL normalization issues are going to be a careful concern here
      if (err)
        return reject(err);
      else
        resolve(loader.getRegister());
    });
    script.src = url;
    document.head.appendChild(script);
  });
};