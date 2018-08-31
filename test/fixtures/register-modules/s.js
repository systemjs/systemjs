System.register(["./c.js", "./a.js"], function (_export, _context) {
  "use strict";

  var s;
  return {
    setters: [function (_cJs) {
      _export({
        b: _cJs.b,
        c: _cJs.c
      });
    }, function (_aJs) {
      _export("a", _aJs.a);
    }],
    execute: function () {
      _export("s", s = 's');
    }
  };
});