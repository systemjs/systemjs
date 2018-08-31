System.register(["./_b.js", "./_d.js", "./_g.js"], function (_export, _context) {
  "use strict";

  var a;
  return {
    setters: [function (_bJs) {
      _export("b", _bJs.b);
    }, function (_dJs) {
      _export("d", _dJs.d);
    }, function (_gJs) {
      _export("g", _gJs.g);
    }],
    execute: function () {
      _export("a", a = 'a');
    }
  };
});