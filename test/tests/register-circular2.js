System.register(["./register-circular1"], function($__0) {
  "use strict";
  var c;
  return {
    exports: {
      get c() {
        return c;
      },
      set c(value) {
        c = value;
      }
    },
    execute: function() {
      c = 3;
      ;
      $__0[0]["p"]();
    }
  };
});
