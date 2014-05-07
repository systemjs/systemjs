System.register(["./all-layers3"], function($__0) {
  "use strict";
  var q,
      r;
  function p() {
    if (q)
      r = $__0[0]["c"];
    else
      q = $__0[0]["c"];
  }
  return {
    exports: {
      get q() {
        return q;
      },
      get r() {
        return r;
      },
      get p() {
        return p;
      },
      set q(value) {
        q = value;
      },
      set r(value) {
        r = value;
      },
      set p(value) {
        p = value;
      }
    },
    execute: function() {
      ;
      $__0[0]["c"] = 5;
      ;
      p();
    }
  };
});
