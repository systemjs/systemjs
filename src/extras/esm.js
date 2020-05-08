/*
 * Interop for ESM modules to return the module export
 */
(function (global) {
  var esmPtrn = /\besm?\b/;
  function getPath(url) {
    var parsed = new URL(url, 'http://domain');
    return parsed.pathname + parsed.search + parsed.hash;
  };
  var systemJSPrototype = global.System.constructor.prototype;
  var originalInstantiate = systemJSPrototype.instantiate;
  systemJSPrototype.instantiate = function (url) {
    if (!esmPtrn.test(getPath(url))) {
      return originalInstantiate.apply(this, arguments);
    }

    return import(url).then(function (exported) {
      return [
        [],
        function (_export) {
          return {
            execute() {
              _export({ __useDefault: !!exported.default, ...exported });
            }
          };
        },
      ];
    });
  };

})(typeof self !== 'undefined' ? self : global);
