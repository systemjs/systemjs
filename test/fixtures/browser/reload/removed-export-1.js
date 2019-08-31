System.register(["./removed-export-2.js"], function (_export, _context) {
  "use strict";

  var x, y;

  function getX() {
    return x;
  }

  function getY() {
    return y;
  }

  _export({
    getX: getX,
    getY: getY
  });

  return {
    setters: [function (_removedExport2Js) {
      x = _removedExport2Js.x;
      y = _removedExport2Js.y;
    }],
    execute: function () {}
  };
});
