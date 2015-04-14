/*
  SystemJS CommonJS Format
*/
(function() {
  // CJS Module Format
  // require('...') || exports[''] = ... || exports.asd = ... || module.exports = ...
  var cjsExportsRegEx = /(?:^\uFEFF?|[^$_a-zA-Z\xA0-\uFFFF.]|module\.)(exports\s*\[['"]|\exports\s*\.)|(?:^\uFEFF?|[^$_a-zA-Z\xA0-\uFFFF.])module\.exports\s*\=/;
  // RegEx adjusted from https://github.com/jbrantly/yabble/blob/master/lib/yabble.js#L339
  var cjsRequireRegEx = /(?:^\uFEFF?|[^$_a-zA-Z\xA0-\uFFFF."'])require\s*\(\s*("[^"\\]*(?:\\.[^"\\]*)*"|'[^'\\]*(?:\\.[^'\\]*)*')\s*\)/g;
  var commentRegEx = /(\/\*([\s\S]*?)\*\/|([^:]|^)\/\/(.*)$)/mg;

  function getCJSDeps(source) {
    cjsRequireRegEx.lastIndex = 0;

    var deps = [];

    // remove comments from the source first, if not minified
    if (source.length / source.split('\n').length < 200)
      source = source.replace(commentRegEx, '');

    var match;

    while (match = cjsRequireRegEx.exec(source))
      deps.push(match[1].substr(1, match[1].length - 2));

    return deps;
  }

  hookConstructor(function(constructor) {
    return function() {
      constructor.call(this);

      // include the node require since we're overriding it
      if (typeof require != 'undefined')
        loader._nodeRequire = require;
    };
  });

  hook('instantiate', function(instantiate) {
    return function(load) {
      var loader = this;
      if (!load.metadata.format) {
        cjsExportsRegEx.lastIndex = 0;
        cjsRequireRegEx.lastIndex = 0;
        if (cjsRequireRegEx.exec(load.source) || cjsExportsRegEx.exec(load.source))
          load.metadata.format = 'cjs';
      }

      if (load.metadata.format == 'cjs') {
        load.metadata.deps = load.metadata.deps ? load.metadata.deps.concat(getCJSDeps(load.source)) : getCJSDeps(load.source);

        load.metadata.executingRequire = true;

        load.metadata.execute = function(require, exports, module) {
          var dirname = (load.address || '').split('/');
          dirname.pop();
          dirname = dirname.join('/');

          var globals = {
            exports: exports,
            module: module,
            require: require,
            __filename: loader._nodeRequire ? load.address.substr(5) : load.address,
            __dirname: loader._nodeRequire ? dirname.substr(5) : dirname
          };
          for (var g in load.metadata.globals)
            globals[g] = require(load.metadata.globals[g]);

          // disable AMD detection
          var define = __global.define;
          __global.define = undefined;

          __exec(load, globals, exports);

          __global.define = define;

          __global._g = undefined;
        };
      }

      return instantiate.call(loader, load);
    };
  });
})();
