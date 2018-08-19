System.register(['./_b.js', './_d.js', './_g.js'], function (_export, _context) {
  "use strict";

  var a;
  return {
    setters: [function (_bJs) {
      var _exportObj = {};
      _exportObj.b = _bJs.b;

      _export(_exportObj);
    }, function (_dJs) {
      var _exportObj2 = {};
      _exportObj2.d = _dJs.d;

      _export(_exportObj2);
    }, function (_gJs) {
      var _exportObj3 = {};
      _exportObj3.g = _gJs.g;

      _export(_exportObj3);
    }],
    execute: function () {
      _export('a', a = 'a');

      _export('a', a);
    }
  };
});