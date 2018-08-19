System.register([], function (_export, _context) {
  "use strict";

  var foo;
  return {
    setters: [],
    execute: function () {
      _export('foo', foo = 'foo');

      _export('foo', foo);
    }
  };
});