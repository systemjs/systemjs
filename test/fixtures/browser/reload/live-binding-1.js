System.register(["./live-binding-2.js"], function (_export, _context) {
  "use strict";

  var x;

  function getY() {
    return x * 2;
  }

  _export("getY", getY);

  return {
    setters: [function (_liveBinding2Js) {
      x = _liveBinding2Js.x;
    }],
    execute: function () {}
  };
});
