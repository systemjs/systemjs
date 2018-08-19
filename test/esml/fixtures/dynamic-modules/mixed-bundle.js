System.register("tree/third", [], function($__export) {
  var some;
  return {
    setters: [],
    execute: function() {
      some = $__export('some', 'exports');
    }
  };
});

System.registerDynamic("tree/cjs", [], true, function(require, exports, __moduleName) {
  var module = { exports: exports };
  exports.cjs = true;
  return module.exports;
});

System.registerDynamic("tree/jquery", [], false, function(require, exports, __moduleName) {
  return {};
});

System.register("tree/second", ["./third", "./cjs"], function($__export) {
  "use strict";
  var q;
  return {
    setters: [function() {}, function() {}],
    execute: function() {
      q = $__export('q', 4);
    }
  };
});

System.registerDynamic("tree/global", ['./jquery'], false, function(__require, __exports, __moduleName) {
  return 'output';
});

System.registerDynamic("tree/amd", ['./global'], false, function() {
  return { is: 'amd' };
});


System.register("tree/first", ["./second", "./amd"], function($__export) {
  "use strict";
  var __moduleName = "tree/first";
  var p;
  return {
    setters: [function(s) {
      $__export('q', s.q);
    }, function(a) {
      $__export('a', a.default);
    }],
    execute: function() {
      p = $__export('p', 5);
    }
  };
});
