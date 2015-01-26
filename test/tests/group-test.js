"format register";

System.register("group-c", [], function($__export) {
  "use strict";
  var __moduleName = "group-c";
  return {
    setters: [],
    execute: function() {
      $__export('default', 'bar');
    }
  };
});



System.register("group-b", ["group-c"], false, function(__require, __exports, __module) {
  System.get("@@global-helpers").prepareGlobal(__module.id, ["group-c"]);
  (function() {
    this.foo = 'foo';
  }).call(System.global);
  return System.get("@@global-helpers").retrieveGlobal(__module.id, false);
});

System.register("group-a", ["./group-b"], function($__export) {
  "use strict";
  var __moduleName = "group-a";
  return {
    setters: [function(m) {}],
    execute: function() {}
  };
});



