import { systemJSPrototype } from '../system-core';

/*
 * Supports loading System.register via script tag injection
 */
systemJSPrototype.instantiate = function (url) {
  const loader = this;
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.charset = 'utf-8';
    script.async = true;
    script.addEventListener('error', reject);
    script.addEventListener('load', function () {
      resolve(loader.getRegister());
      document.head.removeChild(script);
    });
    script.src = url;
    document.head.appendChild(script);
  });
};