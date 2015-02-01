System.register([], function (_export) {
  "use strict";

  var c;
  return {
    setters: [],
    execute: function () {
      c = function c() {
        to5Runtime.get(Object.getPrototypeOf(c.prototype), "constructor", this).call(this);
      };

      _export("c", c);
      new c();
    }
  };
});