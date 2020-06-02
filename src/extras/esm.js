/*
 * Interop for ESM to return the module export
 */
(function (global) {
  const systemJSPrototype = global.System.constructor.prototype;

  const originalCreateScript = systemJSPrototype.createScript;
  systemJSPrototype.createScript = function () {
    return Object.assign(originalCreateScript.apply(this, arguments), { type: 'module' });
  };

  const originalInstantiate = systemJSPrototype.instantiate;
  systemJSPrototype.instantiate = function (url) {
    return originalInstantiate.apply(this, arguments)
    .then(lastRegister => {
      // third argument is used to identify global fallback
      if (lastRegister && !lastRegister[2])
        return lastRegister;

      // esm is the fallback
      return import(url).then(m => [[], _export => (_export(m), {})]);
    });
  };

})(typeof self !== 'undefined' ? self : global);
