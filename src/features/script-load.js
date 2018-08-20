/*
 * Supports loading System.register via script tag injection
 */

import { systemJSPrototype } from '../system-core';

let errUrl, err;
if (typeof window !== 'undefined')
  window.addEventListener('error', function (e) {
    errUrl = e.filename;
    err = e.error;
  });

systemJSPrototype.instantiate = function (url) {
  const loader = this;
  return new Promise(function (resolve, reject) {
    const script = document.createElement('script');
    script.charset = 'utf-8';
    script.async = true;
    script.addEventListener('error', function () {
      reject(new Error('Error loading ' + url));
    });
    script.addEventListener('load', function () {
      // Note URL normalization issues are going to be a careful concern here
      if (errUrl === url)
        return reject(err);
      else
        resolve(loader.getRegister());
      document.head.removeChild(script);
    });
    script.src = url;
    document.head.appendChild(script);
  });
};