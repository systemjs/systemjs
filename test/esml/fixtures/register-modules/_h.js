System.register(['./_a.js', './_i.js'], function (_export, _context) {
  "use strict";

  var h;
  return {
    setters: [function (_aJs) {
      var _exportObj = {};
      _exportObj.a = _aJs.a;

      _export(_exportObj);
    }, function (_iJs) {
      var _exportObj2 = {};
      _exportObj2.i = _iJs.i;

      _export(_exportObj2);
    }],
    execute: function () {
      _export('h', h = 'h');

      _export('h', h);
    }
  };
});