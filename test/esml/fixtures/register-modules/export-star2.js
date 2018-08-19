System.register(['./export-star.js'], function (_export, _context) {
  "use strict";

  function foo() {}

  _export('foo', foo);

  return {
    setters: [function (_exportStarJs) {
      var _exportObj = {};

      for (var _key in _exportStarJs) {
        if (_key !== "default" && _key !== "__esModule") _exportObj[_key] = _exportStarJs[_key];
      }

      _export(_exportObj);
    }],
    execute: function () {}
  };
});