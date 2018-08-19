System.register(['./c.js', './a.js'], function (_export, _context) {
  "use strict";

  var s;
  return {
    setters: [function (_cJs) {
      var _exportObj = {};
      _exportObj.b = _cJs.b;
      _exportObj.c = _cJs.c;

      _export(_exportObj);
    }, function (_aJs) {
      var _exportObj2 = {};
      _exportObj2.a = _aJs.a;

      _export(_exportObj2);
    }],
    execute: function () {
      _export('s', s = 's');

      _export('s', s);
    }
  };
});