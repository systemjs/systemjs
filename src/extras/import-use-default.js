/*
 * Support for interop-ing with older-style AMD modules that export
 * a default value and __esModule, instead of exporting a flat object of values.
 * 
 * See https://github.com/systemjs/systemjs/issues/1967
 */
(function () {
  const hasSymbol = typeof Symbol !== 'undefined';
  const toStringTag = hasSymbol && Symbol.toStringTag;
  const systemPrototype = System.constructor.prototype;
  const originalImport = systemPrototype.import;

  systemPrototype.import = function () {
    return originalImport.apply(this, arguments).then(function (ns) {
      ns = ns.__useDefault ? ns.default : ns;

      if (toStringTag)
        Object.defineProperty(ns, toStringTag, { value: 'Module' });

      return ns;
    });
  };

})()