"format register";

System.register("tree/third", [], function(deps) {
  return {
    exports: {
      some: 'exports'
    },
    execute: function() {}
  };
});

System.register("tree/cjs", [], true, function(require, exports, __moduleName) {
  var global = System.global;
  var __define = global.define;
  global.define = undefined;
  var module = { exports: exports };
  var process = System.get("@@nodeProcess");
  exports.cjs = true;
  global.define = __define;
  return module.exports;
});

System.register("tree/jquery", [], false, function(require, exports, __moduleName) {
  System.get("@@global-helpers").prepareGlobal(__moduleName, []);
  this.jquery = {};
  
  
  return System.get("@@global-helpers").retrieveGlobal(__moduleName, false);
});

System.register("tree/second", ["./third", "./cjs"], function($__0) {
  "use strict";
  var __moduleName = "tree/second";
  var q;
  return {
    exports: {
      get q() {
        return q;
      },
      set q(value) {
        q = value;
      }
    },
    execute: function() {
      ;
      ;
      q = 4;
    }
  };
});

System.register("tree/global", ['./jquery'], false, function(__require, __exports, __moduleName) {
  System.get("@@global-helpers").prepareGlobal(__moduleName, ["./jquery"]);
  "deps ./jquery";
  "exports jquery.test";
  this.jquery = this.jquery || {};
  this.jquery.test = 'output';
  
  this["jquery.test"] = jquery.test;
  return System.get("@@global-helpers").retrieveGlobal(__moduleName, "jquery.test");
});

System.register("tree/amd", ['./global'], false, function() {
  console.log('amd');
  return { is: 'amd' };
});


System.register("tree/first", ["./second", "./amd"], function($__0) {
  "use strict";
  var __moduleName = "tree/first";
  var p;
  return {
    exports: {
      get p() {
        return p;
      },
      set p(value) {
        p = value;
      }
    },
    execute: function() {
      ;
      ;
      p = 5;
    }
  };
});
