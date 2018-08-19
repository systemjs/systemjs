System.register(['./odd.js'], function (_export, _context) {
  "use strict";

  var odd, counter;
  function even(n) {
    _export('counter', counter + 1), counter++;
    return n == 0 || odd(n - 1);
  }

  _export('even', even);

  return {
    setters: [function (_oddJs) {
      odd = _oddJs.odd;
    }],
    execute: function () {
      _export('counter', counter = 0);

      _export('counter', counter);

      odd(1);
    }
  };
});