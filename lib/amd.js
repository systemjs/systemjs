/*
  SystemJS AMD Format
  Provides the AMD module format definition at System.format.amd
  as well as a RequireJS-style require on System.require
*/
(function() {
  // AMD Module Format Detection RegEx
  // define([.., .., ..], ...)
  // define(varName); || define(function(require, exports) {}); || define({})
  var amdRegEx = /(?:^\uFEFF?|[^$_a-zA-Z\xA0-\uFFFF.])define\s*\(\s*("[^"]+"\s*,\s*|'[^']+'\s*,\s*)?\s*(\[(\s*(("[^"]+"|'[^']+')\s*,|\/\/.*\r?\n|\/\*(.|\s)*?\*\/))*(\s*("[^"]+"|'[^']+')\s*,?)?(\s*(\/\/.*\r?\n|\/\*(.|\s)*?\*\/))*\s*\]|function\s*|{|[_$a-zA-Z\xA0-\uFFFF][_$a-zA-Z0-9\xA0-\uFFFF]*\))/;
  var commentRegEx = /(\/\*([\s\S]*?)\*\/|([^:]|^)\/\/(.*)$)/mg;

  var cjsRequirePre = "(?:^|[^$_a-zA-Z\\xA0-\\uFFFF.])";
  var cjsRequirePost = "\\s*\\(\\s*(\"([^\"]+)\"|'([^']+)')\\s*\\)";

  var fnBracketRegEx = /\(([^\)]*)\)/;

  var wsRegEx = /^\s+|\s+$/g;

  var requireRegExs = {};

  function getCJSDeps(source, requireIndex) {

    // remove comments
    source = source.replace(commentRegEx, '');

    // determine the require alias
    var params = source.match(fnBracketRegEx);
    var requireAlias = (params[1].split(',')[requireIndex] || 'require').replace(wsRegEx, '');

    // find or generate the regex for this requireAlias
    var requireRegEx = requireRegExs[requireAlias] || (requireRegExs[requireAlias] = new RegExp(cjsRequirePre + requireAlias + cjsRequirePost, 'g'));

    requireRegEx.lastIndex = 0;

    var deps = [];

    var match;
    while (match = requireRegEx.exec(source))
      deps.push(match[2] || match[3]);

    return deps;
  }

  /*
    AMD-compatible require
    To copy RequireJS, set window.require = window.requirejs = loader.amdRequire
  */
  function require(names, callback, errback, referer) {
    // 'this' is bound to the loader
    var loader = this;

    // in amd, first arg can be a config object... we just ignore
    if (typeof names == 'object' && !(names instanceof Array))
      return require.apply(null, Array.prototype.splice.call(arguments, 1, arguments.length - 1));

    // amd require
    if (names instanceof Array) {
      var dynamicRequires = [];
      for (var i = 0; i < names.length; i++)
        dynamicRequires.push(loader['import'](names[i], referer));
      Promise.all(dynamicRequires).then(function(modules) {
        if (callback)
          callback.apply(null, modules);
      }, errback);
    }

    // commonjs require
    else if (typeof names == 'string') {
      var module = loader.get(names);
      return module.__useDefault ? module['default'] : module;
    }

    else
      throw new TypeError('Invalid require');
  };
  SystemJSLoader.prototype.amdRequire = function() {
    return require.apply(this, arguments);
  };

  function makeRequire(parentName, staticRequire, loader) {
    return function(names, callback, errback) {
      if (typeof names == 'string') {
        if (typeof callback == 'function')
          names = [names];
        else
          return staticRequire(names);
      }
      return require.call(loader, names, callback, errback, parentName);
    }
  }

  hookConstructor(function(constructor) {
    return function() {
      var loader = this;
      constructor.call(this);

      function define(name, deps, factory) {
        if (typeof name != 'string') {
          factory = deps;
          deps = name;
          name = null;
        }
        if (!(deps instanceof Array)) {
          factory = deps;
          deps = ['require', 'exports', 'module'];
        }

        if (typeof factory != 'function')
          factory = (function(factory) {
            return function() { return factory; }
          })(factory);

        // in IE8, a trailing comma becomes a trailing undefined entry
        if (deps[deps.length - 1] === undefined)
          deps.pop();

        // remove system dependencies
        var requireIndex, exportsIndex, moduleIndex;
        
        if ((requireIndex = indexOf.call(deps, 'require')) != -1) {
          
          deps.splice(requireIndex, 1);

          var factoryText = factory.toString();

          deps = deps.concat(getCJSDeps(factoryText, requireIndex));
        }
          

        if ((exportsIndex = indexOf.call(deps, 'exports')) != -1)
          deps.splice(exportsIndex, 1);
        
        if ((moduleIndex = indexOf.call(deps, 'module')) != -1)
          deps.splice(moduleIndex, 1);

        var define = {
          deps: deps,
          execute: function(require, exports, module) {

            var depValues = [];
            for (var i = 0; i < deps.length; i++)
              depValues.push(require(deps[i]));

            module.uri = loader.baseURL + module.id;

            module.config = function() {};

            // add back in system dependencies
            if (moduleIndex != -1)
              depValues.splice(moduleIndex, 0, module);
            
            if (exportsIndex != -1)
              depValues.splice(exportsIndex, 0, exports);
            
            if (requireIndex != -1)
              depValues.splice(requireIndex, 0, makeRequire(module.id, require, loader));

            // set global require to AMD require
            var curRequire = __global.require;
            __global.require = System.amdRequire;

            var output = factory.apply(__global, depValues);

            __global.require = curRequire;

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
            throw new TypeError('Multiple defines for anonymous module');
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
          loader.registerDynamic(name, define.deps, false, define.execute);
        }
      };

      define.amd = {};
      loader.amdDefine = define;
    };
  });

  // script injection mode calls this function synchronously on load
  hook('onScriptLoad', function(onScriptLoad) {
    return function(load) {
      onScriptLoad.call(this, load);

      if (anonDefine || defineBundle) {
        load.metadata.format = 'defined';
        load.metadata.registered = true;
      }

      if (anonDefine) {
        load.metadata.deps = load.metadata.deps ? load.metadata.deps.concat(anonDefine.deps) : anonDefine.deps;
        load.metadata.execute = anonDefine.execute;
      }
    };
  });

  var anonDefine;
  // set to true if the current module turns out to be a named define bundle
  var defineBundle;

  var oldModule, oldExports, oldDefine;

  // adds define as a global (potentially just temporarily)
  function createDefine(loader) {
    anonDefine = null;
    defineBundle = null;

    // ensure no NodeJS environment detection
    oldModule = __global.module;
    oldExports = __global.exports;
    oldDefine = __global.define;

    __global.module = undefined;
    __global.exports = undefined;

    if (__global.define && __global.define === loader.amdDefine)
      return;

    __global.define = loader.amdDefine;
  }

  function removeDefine(loader) {
    __global.define = oldDefine;
    __global.module = oldModule;
    __global.exports = oldExports;
  }

  hook('fetch', function(fetch) {
    return function(load) {
      if (load.metadata.format === 'amd')
        load.metadata.scriptLoad = true;
      if (load.metadata.scriptLoad)
        createDefine(this);
      return fetch.call(this, load);
    };
  });

  hook('instantiate', function(instantiate) {
    return function(load) {
      var loader = this;
      
      if (load.metadata.format == 'amd' || !load.metadata.format && load.source.match(amdRegEx)) {
        load.metadata.format = 'amd';
        
        if (loader.execute !== false) {
          createDefine(loader);

          __exec(load);

          removeDefine(loader);

          if (!anonDefine && !defineBundle && !isNode)
            throw new TypeError('AMD module ' + load.name + ' did not define');
        }

        if (anonDefine) {
          load.metadata.deps = load.metadata.deps ? load.metadata.deps.concat(anonDefine.deps) : anonDefine.deps;
          load.metadata.execute = anonDefine.execute;
        }

        return instantiate.call(loader, load);
      }

      return instantiate.call(loader, load);
    };
  });

})();
