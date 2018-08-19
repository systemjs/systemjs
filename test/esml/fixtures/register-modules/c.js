System.register(['./a.js'], function (_export, _context) {
  "use strict";

  var c;
  return {
    setters: [function (_aJs) {
      var _exportObj = {};
      _exportObj.a = _aJs.a;
      _exportObj.b = _aJs.b;

      _export(_exportObj);
    }],
    execute: function () {
      _export('c', c = 'c');

      _export('c', c);
    }
  };
});