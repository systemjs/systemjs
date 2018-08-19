System.register(['./b.js'], function (_export, _context) {
  "use strict";

  var a;
  return {
    setters: [function (_bJs) {
      var _exportObj = {};
      _exportObj.b = _bJs.b;

      _export(_exportObj);
    }],
    execute: function () {
      _export('a', a = 'a');

      _export('a', a);
    }
  };
});