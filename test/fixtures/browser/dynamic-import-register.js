System.register([], function (_export, _context) {
  _export('lazy', function lazy () {
    return _context.import('./dynamic-import-lazy.js').then(function (m) {
      return m.lazyValue;
    });
  });
  return {};
});
