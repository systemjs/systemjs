System.register(['./star-dep.js'], function (_export, _context) {
  "use strict";

  var bar;
  return {
    setters: [function (_starDepJs) {
      var _exportObj = {};

      for (var _key in _starDepJs) {
        if (_key !== "default" && _key !== "__esModule") _exportObj[_key] = _starDepJs[_key];
      }

      _export(_exportObj);
    }],
    execute: function () {
      _export('bar', bar = 'bar');

      _export('bar', bar);
    }
  };
});