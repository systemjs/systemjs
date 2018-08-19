System.register([], function (_export, _context) {
  "use strict";

  var p, q, s;
  function foo() {}
  _export("foo", foo);

  function bar() {}
  _export("default", bar);

  return {
    setters: [],
    execute: function () {
      _export("p", p = 5);

      _export("m", _export("q", q = {}));

      _export("q", q);

      _export("t", _export("s", s = 4));
    }
  };
});
