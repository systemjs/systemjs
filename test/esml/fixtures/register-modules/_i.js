System.register(['./_b.js'], function (_export, _context) {
  "use strict";

  var i;
  return {
    setters: [function (_bJs) {
      var _exportObj = {};
      _exportObj.b = _bJs.b;

      _export(_exportObj);
    }],
    execute: function () {
      _export('i', i = 'i');

      _export('i', i);
    }
  };
});