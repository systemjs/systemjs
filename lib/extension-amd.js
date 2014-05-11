/*
  SystemJS AMD Format
  Provides the AMD module format definition at System.format.amd
  as well as a RequireJS-style require on System.require
*/
function amd(loader) {

  // AMD Module Format Detection RegEx
  // define([.., .., ..], ...)
  // define(varName); || define(function(require, exports) {}); || define({})
  var amdRegEx = /(?:^\s*|[}{\(\);,\n\?\&]\s*)define\s*\(\s*("[^"]+"\s*,\s*|'[^']+'\s*,\s*)?(\[(\s*("[^"]+"|'[^']+')\s*,)*(\s*("[^"]+"|'[^']+')\s*)?\]|function\s*|{|[_$a-zA-Z\xA0-\uFFFF][_$a-zA-Z0-9\xA0-\uFFFF]*\))/;

  /*
    AMD-compatible require
    To copy RequireJS, set window.require = window.requirejs = loader.require
  */
  function require(names, callback, errback, referer) {
    // 'this' is bound to the loader
    var loader = this;

    // in amd, first arg can be a config object... we just ignore
    if (typeof names == 'object' && !(names instanceof Array))
      return require.apply(null, Array.prototype.splice.call(arguments, 1, arguments.length - 1));

    // amd require
    if (names instanceof Array)
      Promise.all(names.map(function(name) {
        return loader['import'](name, referer);
      })).then(function(modules) {
        callback.apply(null, modules);
      }, errback);

    // commonjs require
    else if (typeof names == 'string') {
      var module = loader.get(names);
      return module.__useDefault ? module['default'] : module;
    }

    else
      throw 'Invalid require';
  };
  loader.require = require;

  function makeRequire(parentName, staticRequire, loader) {
    return function(names, callback, errback) {
      if (typeof names == 'string')
        return staticRequire(names);
      return require.call(loader, names, callback, errback, { name: parentName });
    }
  }

  var lastDefine;
  function createDefine(loader) {

    lastDefine = null;

    // ensure no NodeJS environment detection
    loader.global.module = undefined;
    loader.global.exports = undefined;


    if (loader.global.define && loader.global.define.loader == loader)
      return;

    loader.global.define = function(name, deps, factory) {
      if (typeof name != 'string') {
        factory = deps;
        deps = name;
        name = null;
      }
      if (!(deps instanceof Array)) {
        factory = deps;
        // CommonJS AMD form
        if (!loader._getCJSDeps)
          throw "AMD extension needs CJS extension for AMD CJS support";
        deps = ['require', 'exports', 'module'].concat(loader._getCJSDeps(factory.toString()));
      }

      if (typeof factory != 'function')
        factory = (function(factory) {
          return function() { return factory; }
        })(factory);

      // a module file can only define one anonymous module
      if (!name && lastDefine)
        throw "Multiple defines for anonymous module";

      // remove system dependencies
      var requireIndex, exportsIndex, moduleIndex
      if ((requireIndex = indexOf.call(deps, 'require')) != -1)
        deps.splice(requireIndex, 1);

      if ((exportsIndex = indexOf.call(deps, 'exports')) != -1)
        deps.splice(exportsIndex, 1);
      
      if ((moduleIndex = indexOf.call(deps, 'module')) != -1)
        deps.splice(moduleIndex, 1);

      lastDefine = {
        deps: deps,
        execute: function(require, exports, moduleName) {

          var depValues = [];
          for (var i = 0; i < deps.length; i++)
            depValues.push(require(deps[i]));

          var module;

          // add back in system dependencies
          if (moduleIndex != -1)
            depValues.splice(moduleIndex, 0, exports, module = { id: moduleName, uri: loader.baseURL + moduleName, config: function() { return {}; }, exports: exports });
          
          if (exportsIndex != -1)
            depValues.splice(exportsIndex, 0, exports);
          
          if (requireIndex != -1)
            depValues.splice(requireIndex, 0, makeRequire(moduleName, require, loader));

          var output = factory.apply(loader.global, depValues);

          output = output || module && module.exports;

          if (output && output.__esModule)
            return output;
          else if (output !== undefined)
            return { __useDefault: true, 'default': output };
        }
      };

      // attaches to loader.defined as dynamic
      if (name)
        loader.defined[name] = lastDefine;
    };
    
    loader.global.define.amd = {};
    loader.global.define.loader = loader;
  }

  createDefine(loader);

  if (loader.scriptLoader) {
    var loaderFetch = loader.fetch;
    var scriptLoader = true;
    loader.fetch = function(load) {
      createDefine(this);
      return Promise.resolve(loaderFetch.call(this, load)).then(function(source) {
        if (lastDefine) {
          load.metadata.format = 'defined';
          load.metadata.deps = load.metadata.deps ? load.metadata.deps.concat(lastDefine.deps) : lastDefine.deps;
          load.metadata.execute = lastDefine.execute;
        }
        return source;
      });
    }
  }
  

  var loaderInstantiate = loader.instantiate;
  loader.instantiate = function(load) {
    var loader = this;

    if (load.metadata.format == 'amd' || !load.metadata.format && load.source.match(amdRegEx)) {
      load.metadata.format = 'amd';
        
      createDefine(loader);

      loader.__exec(load);

      if (!lastDefine)
        throw "AMD module " + load.name + " did not define";

      load.metadata.deps = load.metadata.deps ? load.metadata.deps.concat(lastDefine.deps) : lastDefine.deps;
      load.metadata.execute = lastDefine.execute;
    }

    return loaderInstantiate.call(loader, load);
  }
}