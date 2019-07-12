/*
 * Support for interop-ing with AMD modules that export
 * a default value and __esModule, instead of exporting a flat object of values.
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