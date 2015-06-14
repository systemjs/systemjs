/*
  SystemJS CommonJS Format
*/
(function() {
  // CJS Module Format
  // require('...') || exports[''] = ... || exports.asd = ... || module.exports = ...
  var cjsExportsRegEx = /(?:^\uFEFF?|[^$_a-zA-Z\xA0-\uFFFF.]|module\.)exports\s*(\[['"]|\.)|(?:^\uFEFF?|[^$_a-zA-Z\xA0-\uFFFF.])module\.exports\s*[=,]/;
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

  function urlToPath(url) {
    var path;
    if (url.substr(0, 8) != 'file:///')
      return url;

    path = url.substr(7);
    // on windows remove leading '/'
    if (typeof process != 'undefined' && process.env && process.platform.match(/^win/))
      path = path.substr(1);
    return path;
  }

  var dirnameCache = {};
  function getDirname(loader) {
    return dirnameCache[loader.baseURL] || 
        (dirnameCache[loader.baseURL] = urlToPath(loader.baseURL.substr(0, loader.baseURL.length - 1)));
  }

  if (typeof window != 'undefined' && window.location)
    var windowOrigin = location.protocol + '//' + location.hostname + (location.port ? ':' + location.port : '');

  hookConstructor(function(constructor) {
    return function() {
      constructor.call(this);

      // include the node require since we're overriding it
      if (typeof require != 'undefined' && require.resolve && typeof process != 'undefined')
        this._nodeRequire = require;
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
        var metaDeps = load.metadata.deps || [];
        load.metadata.deps = metaDeps.concat(getCJSDeps(load.source));

        load.metadata.executingRequire = true;

        load.metadata.execute = function(require, exports, module) {
          // ensure meta deps execute first
          for (var i = 0; i < metaDeps.length; i++)
            require(metaDeps[i]);
          var address = load.address || '';

          if (windowOrigin && address.substr(0, windowOrigin.length) === windowOrigin)
            address = address.substr(windowOrigin.length);
          else
            address = urlToPath(address);

          // disable AMD detection
          var define = __global.define;
          __global.define = undefined;

          __global.__cjsWrapper = {
            exports: exports,
            args: [require, exports, module, address, getDirname(loader), __global]
          };

          load.source = "(function(require, exports, module, __filename, __dirname, global) {"
              + load.source + "\n}).apply(__cjsWrapper.exports, __cjsWrapper.args);";

          __exec.call(loader, load);

          __global.__cjsWrapper = undefined;
          __global.define = define;
        };
      }

      return instantiate.call(loader, load);
    };
  });
})();
