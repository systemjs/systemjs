/*
  SystemJS AMD Format
  Provides the AMD module format definition at System.format.amd
  as well as a RequireJS-style require on System.requirejs
*/
(function() {
  System.formats.push('amd');

  // AMD Module Format
  // define([.., .., ..], ...)
  // define(varName); || define(function(require, exports) {}); || define({})
  var amdDefineRegEx = /(?:^\s*|[}{\(\);,\n\?\&]\s*)define\s*\(\s*("[^"]+"\s*,|'[^']+'\s*,\s*)?(\[(\s*("[^"]+"|'[^']+')\s*,)*(\s*("[^"]+"|'[^']+')\s*)?\])?/g;
  var cjsDefineRegEx = /(?:^\s*|[}{\(\);,\n\?\&]\s*)define\s*\(\s*(("[^"]+"\s*,|'[^']+'\s*,)?("[^"]+"\s*,|'[^']+'\s*,)?function\s*|{|[_$a-zA-Z\xA0-\uFFFF][_$a-zA-Z0-9\xA0-\uFFFF]*\))/g;

  var cjsRequireRegEx = /(?:^\s*|[}{\(\);,\n=:\?\&]\s*)require\s*\(\s*("([^"]+)"|'([^']+)')\s*\)/g;

  /*
    AMD-compatible require
    To copy RequireJS, set window.require = window.requirejs = System.requirejs
  */
  System.requirejs = function(names, callback, errback, referer) {
    // in amd, first arg can be a config object... we just ignore
    if (typeof names == 'object' && !(names instanceof Array))
      return System.require.apply(null, Array.prototype.splice.call(arguments, 1));

    if (typeof callback == 'object') {
      referer = callback;
      callback = undefined;
    }
    else if (typeof errback == 'object') {
      referer = errback;
      errback = undefined;
    }

    // amd require
    if (names instanceof Array) {
      var modules = [];
      var setCnt = 0;
      var errored = false;
      var err = function(err) {
        if (errored)
          return;
        errored = true;
        errback(err);
      }
      for (var i = 0; i < names.length; i++) (function(i) {
        System.import(names[i]).then(function(m) {
          modules[i] = m;
          setCnt++;
          if (setCnt == names.length)
            callback(modules);
        }, err);
      })();
    }

    // commonjs require
    else if (typeof names == 'string')
      return System.get(names);

    else
      throw 'Invalid require';
  }

  System.format.amd = {
    detect: function(source, load) {
      amdDefineRegEx.lastIndex = 0;
      cjsDefineRegEx.lastIndex = 0;

      // do detection
      var match;
      var deps;
      if (
        !(match = cjsDefineRegEx.exec(source)) &&
        !((match = amdDefineRegEx.exec(source)) && (match[1] || match[2] && (deps = (1, eval)(match[2]))))
      )
        return false;

      if (!deps) {
        // no deps means CJS AMD form, so pick up require('') statements with regex
        deps = ['require', 'exports', 'module'];

        while (match = cjsRequireRegEx.exec(source))
          deps.push(match[2] || match[3]);
      }

      // we then remove the special reserved names
      var index;
      var meta = load.metadata;
      if (meta.require = (index = deps.indexOf('require')) != -1)
        deps.splice(index, 1);
      if (meta.exports = (index = deps.indexOf('exports')) != -1)
        deps.splice(index, 1);
      if (meta.module = (index = deps.indexOf('module')) != -1)
        deps.splice(index, 1);

      return deps;
    },
    execute: function(load, depMap, global, execute) {
      // add back in system dependencies
      var meta = load.metadata;
      if (meta.module)
        depMap.module = { id: load.name, uri: load.address, config: function() { return {}; } };
      if (meta.exports)
        depMap.exports = {};

      // avoid load object closure
      var name = load.name;
      var address = load.address;

      if (meta.require)
        depMap.require = function(names, callback, errback) {
          if (typeof names == 'string' && names in depMap)
            return depMap[names];
          return System.requirejs(names, callback, errback, { name: name, address: address });
        }

      var output;

      global.require = global.requirejs = System.requirejs;
      global.define = function(dependencies, factory) {
        if (typeof dependencies == 'string') {
          dependencies = arguments[1];
          factory = arguments[2];
        }

        // no dependencies
        if (!(dependencies instanceof Array)) {
          factory = dependencies;
          if (typeof dependencies == 'function')
            dependencies = ['require', 'exports', 'module'];
        }

        for (var i = 0; i < dependencies.length; i++)
          dependencies[i] = depMap[dependencies[i]];

        // run the factory function
        if (typeof factory == 'function')
          output = factory.apply(global, dependencies) || depMap.exports;
        // otherwise factory is the value
        else
          output = factory;
      }
      global.define.amd = {};

      // ensure no NodeJS environment detection
      delete global.module;
      delete global.exports;

      execute();

      delete global.define;
      delete global.require;
      delete global.requirejs;

      return output;
    }
  };
})();
