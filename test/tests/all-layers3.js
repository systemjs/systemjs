System.register(["./all-layers2", "./all-layers4"], function($__0) {
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
      c = $__0[1]["c"];
      ;
      $__0[0]["p"]();
    }
  };
});
