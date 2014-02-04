/*
  SystemJS AMD Format
  Provides the AMD module format definition at System.format.amd
  as well as a RequireJS-style require on System.requirejs
*/
(function() {
  System.formats.push('amd');

  // AMD Module Format Detection RegEx
  // define([.., .., ..], ...)
  // define(varName); || define(function(require, exports) {}); || define({})
  var amdRegEx = /(?:^\s*|[}{\(\);,\n\?\&]\s*)define\s*\(\s*("[^"]+"\s*,|'[^']+'\s*,\s*)?(\[(\s*("[^"]+"|'[^']+')\s*,)*(\s*("[^"]+"|'[^']+')\s*)?\]|function\s*|{|[_$a-zA-Z\xA0-\uFFFF][_$a-zA-Z0-9\xA0-\uFFFF]*\))/;

  /*
    AMD-compatible require
    To copy RequireJS, set window.require = window.requirejs = System.requirejs
  */
  var require = System.requirejs = function(names, callback, errback, referer) {
    // in amd, first arg can be a config object... we just ignore
    if (typeof names == 'object' && !(names instanceof Array))
      return require.apply(null, Array.prototype.splice.call(arguments, 1));

    // amd require
    if (names instanceof Array)
      Promise.all(names.map(function(name) {
        return System.import(name, referer);
      })).then(function(modules) {
        callback.apply(null, modules);
      }, errback);

    // commonjs require
    else if (typeof names == 'string')
      return System.getModule(names);

    else
      throw 'Invalid require';
  }
  function makeRequire(parentName, deps, depsNormalized) {
    return function(names, callback, errback) {
      if (typeof names == 'string' && deps.indexOf(names) != -1)
        return System.getModule(depsNormalized[deps.indexOf(names)]);
      return require(names, callback, errback, { name: parentName });
    }
  }

  function prepareDeps(deps, meta) {
    for (var i = 0; i < deps.length; i++)
      if (deps.lastIndexOf(deps[i]) != i)
        deps.splice(i--, 1);

    // remove system dependencies
    var index;
    if ((index = deps.indexOf('require')) != -1) {
      meta.requireIndex = index;
      deps.splice(index, 1);
    }
    if ((index = deps.indexOf('exports')) != -1) {
      meta.exportsIndex = index;
      deps.splice(index, 1);
    }
    if ((index = deps.indexOf('module')) != -1) {
      meta.moduleIndex = index;
      deps.splice(index, 1);
    }
    return deps;
  }

  function prepareExecute(depNames, load, module) {
    var meta = load.metadata;
    var deps = [];
    for (var i = 0; i < depNames.length; i++)
      deps[i] = System.getModule(depNames[i]);

    var module, exports;

    // add back in system dependencies
    if (meta.moduleIndex !== undefined)
      deps.splice(meta.moduleIndex, 0, exports = {}, module = { id: load.name, uri: load.address, config: function() { return {}; }, exports: exports });
    if (meta.exportsIndex !== undefined)
      deps.splice(meta.exportsIndex, 0, exports = exports || {});
    if (meta.requireIndex !== undefined)
      deps.splice(meta.requireIndex, 0, makeRequire(load.name, meta.deps, depNames));

    return {
      deps: deps,
      module: module || exports && { exports: exports }
    };
  }

  System.format.amd = {
    detect: function(load) {
      return !!load.source.match(amdRegEx);
    },
    deps: function(load, global, exec) {

      var deps;
      var meta = load.metadata;

      global.define = function(name, _deps, factory) {

        if (typeof name != 'string') {
          factory = _deps;
          _deps = name;
          name = null;
        }
        if (!(_deps instanceof Array)) {
          factory = _deps;
          // CommonJS AMD form
          _deps = ['require', 'exports', 'module'].concat(System.format.cjs.deps(load, global));
        }
        
        
        if (typeof factory != 'function')
          factory = (function(factory) {
            return function() { return factory; }
          })(factory);
        
        if (name && name != load.name) {
          // named define for a bundle describing another module
          var _load = {
            name: name,
            address: name,
            metadata: {}
          };
          _deps = prepareDeps(_deps, _load.metadata);
          System.defined[name] = {
            deps: _deps,
            execute: function() {
              var execs = prepareExecute(Array.prototype.splice.call(arguments, 0), _load);
              var output = factory.apply(global, execs.deps) || execs.module && execs.module.exports;

              if (output instanceof global.Module)
                return output;
              else
                return new global.Module(output && output.__transpiledModule ? (delete output.__transpiledModule, output) : { __defaultOnly: true, 'default': output });
            }
          }
        }
        else {
          // we are defining this module
          deps = _deps;
          meta.factory = factory;
        }
      }
      global.define.amd = {};

      // ensure no NodeJS environment detection
      delete global.module;
      delete global.exports;

      exec();

      // deps not defined for an AMD module that defines a different name
      deps = deps || [];

      deps = prepareDeps(deps, meta);

      delete global.define;

      meta.deps = deps;

      return deps;

    },
    execute: function(depNames, load, global, exec) {
      if (!load.metadata.factory)
        return;
      var execs = prepareExecute(depNames, load);
      return load.metadata.factory.apply(global, execs.deps) || execs.module && execs.module.exports;
    }
  };
})();
