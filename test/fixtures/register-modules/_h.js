System.register(["./_a.js", "./_i.js"], function (_export, _context) {
  "use strict";

  var h;
  return {
    setters: [function (_aJs) {
      _export("a", _aJs.a);
    }, function (_iJs) {
      _export("i", _iJs.i);
    }],
    execute: function () {
      _export("h", h = 'h');
    }
  };
});