System.register(["./a.js"], function (_export, _context) {
  "use strict";

  var c;
  return {
    setters: [function (_aJs) {
      _export({
        a: _aJs.a,
        b: _aJs.b
      });
    }],
    execute: function () {
      _export("c", c = 'c');
    }
  };
});