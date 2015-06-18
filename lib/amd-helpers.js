/*
 * AMD Helper function module
 * Separated into its own file as this is the part needed for full AMD support in SFX builds
 *
 */
hookConstructor(function(constructor) {
  return function() {
    var loader = this;
    constructor.call(this);

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
      // in amd, first arg can be a config object... we just ignore
      if (typeof names == 'object' && !(names instanceof Array))
        return require.apply(null, Array.prototype.splice.call(arguments, 1, arguments.length - 1));

      // amd require
      if (typeof names == 'string' && typeof callback == 'function')
        names = [names];
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

    function define(name, deps, factory) {
      if (typeof name != 'string') {
        factory = deps;
        deps = name;
        name = null;
      }
      if (!(deps instanceof Array)) {
        factory = deps;
        deps = ['require', 'exports', 'module'].splice(0, factory.length);
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

        // only trace cjs requires for non-named
        // named defines assume the trace has already been done
        if (!name)
          deps = deps.concat(getCJSDeps(factory.toString(), requireIndex));
      }

      if ((exportsIndex = indexOf.call(deps, 'exports')) != -1)
        deps.splice(exportsIndex, 1);
      
      if ((moduleIndex = indexOf.call(deps, 'module')) != -1)
        deps.splice(moduleIndex, 1);

      var define = {
        name: name,
        deps: deps,
        execute: function(req, exports, module) {

          var depValues = [];
          for (var i = 0; i < deps.length; i++)
            depValues.push(req(deps[i]));

          module.uri = module.id;

          module.config = function() {};

          // add back in system dependencies
          if (moduleIndex != -1)
            depValues.splice(moduleIndex, 0, module);
          
          if (exportsIndex != -1)
            depValues.splice(exportsIndex, 0, exports);
          
          if (requireIndex != -1) {
            function contextualRequire(names, callback, errback) {
              if (typeof names == 'string' && typeof callback != 'function')
                return req(names);
              return require.call(loader, names, callback, errback, module.id);
            }
            contextualRequire.toUrl = function(name) {
              // normalize without defaultJSExtensions
              var defaultJSExtension = loader.defaultJSExtensions && name.substr(name.length - 3, 3) != '.js';
              var url = loader.normalizeSync(name, module.id);
              if (defaultJSExtension && url.substr(url.length - 3, 3) == '.js')
                url = url.substr(0, url.length - 3);
              return url;
            };
            depValues.splice(requireIndex, 0, contextualRequire);
          }

          // set global require to AMD require
          var curRequire = __global.require;
          __global.require = require;

          var output = factory.apply(exportsIndex == -1 ? __global : exports, depValues);

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
        if (lastModule.anonDefine)
          throw new TypeError('Multiple defines for anonymous module');
        lastModule.anonDefine = define;
      }
      // named define
      else {
        // if it has no dependencies and we don't have any other
        // defines, then let this be an anonymous define
        // this is just to support single modules of the form:
        // define('jquery')
        // still loading anonymously
        // because it is done widely enough to be useful
        if (deps.length == 0 && !lastModule.anonDefine && !lastModule.isBundle) {
          lastModule.anonDefine = define;
        }
        // otherwise its a bundle only
        else {
          // if there is an anonDefine already (we thought it could have had a single named define)
          // then we define it now
          // this is to avoid defining named defines when they are actually anonymous
          if (lastModule.anonDefine && lastModule.anonDefine.name)
            loader.registerDynamic(lastModule.anonDefine.name, lastModule.anonDefine.deps, false, lastModule.anonDefine.execute);

          lastModule.anonDefine = null;
        }

        // note this is now a bundle
        lastModule.isBundle = true;

        // define the module through the register registry
        loader.registerDynamic(name, define.deps, false, define.execute);
      }
    }
    define.amd = {};

    // adds define as a global (potentially just temporarily)
    function createDefine(loader) {
      lastModule.anonDefine = null;
      lastModule.isBundle = false;

      // ensure no NodeJS environment detection
      var oldModule = __global.module;
      var oldExports = __global.exports;
      var oldDefine = __global.define;

      __global.module = undefined;
      __global.exports = undefined;
      __global.define = define;

      return function() {
        __global.define = oldDefine;
        __global.module = oldModule;
        __global.exports = oldExports;
      };
    }

    var lastModule = {
      isBundle: false,
      anonDefine: null
    };

    loader.set('@@amd-helpers', loader.newModule({
      createDefine: createDefine,
      require: require,
      define: define,
      lastModule: lastModule
    }));
    loader.amdDefine = define;
    loader.amdRequire = require;
  };
});