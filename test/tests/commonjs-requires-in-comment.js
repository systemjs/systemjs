"format cjs";

System.register("lib/module-with-comment", [], function($__export) {
  "use strict";
  var __moduleName = "lib/module-with-comment";
  var shared;
  return {
  	// This comment triggered SystemJS to do a require because of this -> require('')
    setters: [function(m) {
      shared = m.default;
    }],
    execute: function() {
    }
  };
});
