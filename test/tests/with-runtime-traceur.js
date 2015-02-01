System.register([], function($__export) {
  "use strict";
  var __moduleName = "test";
  function require(path) {
    return $traceurRuntime.require("test", path);
  }
  var c;
  return {
    setters: [],
    execute: function() {
      c = $__export("c", (function() {
        var c = function c() {};
        return ($traceurRuntime.createClass)(c, {}, {});
      }()));
    }
  };
});
