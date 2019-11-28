System.register(["./b.js"], function (_export, _context) {
  "use strict";

  var a;
  return {
    setters: [function (_bJs) {
      _export("b", _bJs.b);
    }],
    execute: function () {
      _export("a", a = 'a');
    }
  };
});