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
    script.addEventListener('error', function () { reject(new Error('Load error')) });
    script.addEventListener('load', function () {
      // will be empty for syntax errors resulting in "Module did not instantiate" error
      // (but the original error will show in the console)
      // we can try and use window.onerror to get the syntax error,
      // if theres a way to do this reliably, although that seems doubtful
      resolve(loader.getRegister());
      document.head.removeChild(script);
    });
    script.src = url;
    document.head.appendChild(script);
  });
};