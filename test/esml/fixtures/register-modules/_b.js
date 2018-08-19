System.register(['./_c.js'], function (_export, _context) {
  "use strict";

  var b;
  return {
    setters: [function (_cJs) {
      var _exportObj = {};
      _exportObj.c = _cJs.c;

      _export(_exportObj);
    }],
    execute: function () {
      _export('b', b = 'b');

      _export('b', b);
    }
  };
});