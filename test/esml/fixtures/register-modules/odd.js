System.register(['./even.js'], function (_export, _context) {
  "use strict";

  var even;
  function odd(n) {
    return n != 0 && even(n - 1);
  }

  _export('odd', odd);

  return {
    setters: [function (_evenJs) {
      even = _evenJs.even;
    }],
    execute: function () {}
  };
});