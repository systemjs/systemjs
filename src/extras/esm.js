/*
 * Interop for ESM modules to return the module export
 */
(function (global) {
  const esmPtrn = /\besm?\b/;
  const getPath = url => {
    const parsed = new URL(url, 'http://domain');
    return parsed.pathname + parsed.search + parsed.hash;
  };
  const systemJSPrototype = global.System.constructor.prototype;
  const originalInstantiate = systemJSPrototype.instantiate;
  systemJSPrototype.instantiate = function (url) {
    if (!esmPtrn.test(getPath(url))) {
      return originalInstantiate.apply(this, arguments);
    }

    return import(url).then((exported) => [
      [],
      (_export) => ({
        execute() {
          _export({ __useDefault: !!exported.default, ...exported });
        }        
      }),
    ]);
  };

})(typeof self !== 'undefined' ? self : global);
