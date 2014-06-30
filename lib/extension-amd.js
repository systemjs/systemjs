/*
  SystemJS AMD Format
  Provides the AMD module format definition at System.format.amd
  as well as a RequireJS-style require on System.require
*/
function amd(loader) {

  var isNode = typeof module != 'undefined' && module.exports;

  // Matches parenthesis
  var parensRegExp = /\(([^)]+)/;
  var commentRegEx = /(\/\*([\s\S]*?)\*\/|([^:]|^)\/\/(.*)$)/mg;
  var argRegEx = /[\w\d]+/g;
  function getRequireAlias(source, index){
    var match = source.match(parensRegExp);
    if(match){
      var args = [];
      match[1].replace(commentRegEx,"").replace(argRegEx, function(arg){
        args.push(arg);
      });
      return args[index||0];
    }
  };
  

  // AMD Module Format Detection RegEx
  // define([.., .., ..], ...)
  // define(varName); || define(function(require, exports) {}); || define({})
  var amdRegEx = /(?:^\s*|[}{\(\);,\n\?\&]\s*)define\s*\(\s*("[^"]+"\s*,\s*|'[^']+'\s*,\s*)?\s*(\[(\s*("[^"]+"|'[^']+')\s*,)*(\s*("[^"]+"|'[^']+')\s*,?\s*)?\]|function\s*|{|[_$a-zA-Z\xA0-\uFFFF][_$a-zA-Z0-9\xA0-\uFFFF]*\))/;
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

  var anonDefine;
  // set to true of the current module turns out to be a named define bundle
  var defineBundle;
  function createDefine(loader) {
    anonDefine = null;
    defineBundle = null;

    // ensure no NodeJS environment detection
    loader.global.module = undefined;
    loader.global.exports = undefined;

    if (loader.global.define && loader.global.define.loader == loader)
      return;

    // script injection mode calls this function synchronously on load
    var onScriptLoad = loader.onScriptLoad;
    loader.onScriptLoad = function(load) {
      onScriptLoad(load);
      if (anonDefine || defineBundle)
        load.metadata.format = 'defined';

      if (anonDefine) {
        load.metadata.deps = load.metadata.deps ? load.metadata.deps.concat(anonDefine.deps) : anonDefine.deps;
        load.metadata.execute = anonDefine.execute;
      }
    }

    function define(name, deps, factory) {
      if (typeof name != 'string') {
        factory = deps;
        deps = name;
        name = null;
      }
      if (!(deps instanceof Array)) {
        factory = deps;
        deps = ['require','exports','module']
      }

      if (typeof factory != 'function')
        factory = (function(factory) {
          return function() { return factory; }
        })(factory);

      // remove system dependencies
      var requireIndex, exportsIndex, moduleIndex
      
      if ((requireIndex = indexOf.call(deps, 'require')) != -1) {
      	
      	deps.splice(requireIndex, 1);
        // CommonJS AMD form
        if (!loader._getCJSDeps)
          throw "AMD extension needs CJS extension for AMD CJS support";
        var factoryText = factory.toString();
        deps = deps.concat(loader._getCJSDeps(factoryText, getRequireAlias(factoryText, requireIndex)));
      }
        

      if ((exportsIndex = indexOf.call(deps, 'exports')) != -1)
        deps.splice(exportsIndex, 1);
      
      if ((moduleIndex = indexOf.call(deps, 'module')) != -1)
        deps.splice(moduleIndex, 1);

      var define = {
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

          if (typeof output == 'undefined' && module)
            output = module.exports;

          if (typeof output != 'undefined')
            return output;
        }
      };

      // anonymous define
      if (!name) {
        // already defined anonymously -> throw
        if (anonDefine)
          throw "Multiple defines for anonymous module";
        anonDefine = define;
      }
      // named define
      else {
        // if it has no dependencies and we don't have any other
        // defines, then let this be an anonymous define
        if (deps.length == 0 && !anonDefine && !defineBundle)
          anonDefine = define;

        // otherwise its a bundle only
        else
          anonDefine = null;

        // the above is just to support single modules of the form:
        // define('jquery')
        // still loading anonymously
        // because it is done widely enough to be useful

        // note this is now a bundle
        defineBundle = true;

        // define the module through the register registry
        loader.register(name, define.deps, false, define.execute);
      }
    };

    loader.amdDefine = define;
    loader.global.define = define;
    loader.global.define.amd = {};
    loader.global.define.loader = loader;
  }

  if (!isNode && loader.amdDefine !== false)
    createDefine(loader);

  if (loader.scriptLoader) {
    var loaderFetch = loader.fetch;
    loader.fetch = function(load) {
      if (loader.amdDefine !== false)
        createDefine(this);
      return loaderFetch.call(this, load);
    }
  }
  

  var loaderInstantiate = loader.instantiate;
  loader.instantiate = function(load) {
    var loader = this;

    if (load.metadata.format == 'amd' || !load.metadata.format && load.source.match(amdRegEx)) {
      load.metadata.format = 'amd';

      createDefine(loader);

      try {
        loader.__exec(load);
      }
      catch (e) {
        if (loader.execute === false && isNode) {
          // use a regular expression to pull out deps
          var match = load.source.match(amdRegEx);
          if (match) {
            // named or anonymous
            if (match[1] && match[1][0] == '[')
              define(match[1].substr(match[1].length - 2), eval(match[2]), function() {});
            else if (match[2] && match[2][0] == '[')
              define(eval(match[2]), function() {});
            else
              define(function() {});
          }
        }
        else
          throw e;
      }

      if (isNode)
        loader.global.define = undefined;

      if (!anonDefine && !defineBundle && !isNode)
        throw "AMD module " + load.name + " did not define";

      if (anonDefine) {
        load.metadata.deps = load.metadata.deps ? load.metadata.deps.concat(anonDefine.deps) : anonDefine.deps;
        load.metadata.execute = anonDefine.execute;
      }
    }

    return loaderInstantiate.call(loader, load);
  }
}