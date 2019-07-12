/*
 * Interop for AMD modules to return the direct AMD binding instead of a
 * `{ default: amdModule }` object from `System.import`
 */
(function () {
  const systemPrototype = System.constructor.prototype;
  const originalImport = systemPrototype.import;

  systemPrototype.import = function () {
    return originalImport.apply(this, arguments).then(function (ns) {
      return ns.__useDefault ? ns.default : ns;
    });
  };
})()