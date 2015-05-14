/*
  SystemJS AMD Format
  Provides the AMD module format definition at System.format.amd
  as well as a RequireJS-style require on System.require
*/
function amd(loader) {
  // by default we only enforce AMD noConflict mode in Node
  var isNode = typeof module != 'undefined' && module.exports;
  var global = loader.global;

  loader._extensions.push(amd);

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
        if(callback) {
          callback.apply(null, modules);
        }
      }, errback);
    }

    // commonjs require
    else if (typeof names == 'string') {
      var module = loader.get(names);
      return module.__useDefault ? module['default'] : module;
    }

    else
      throw new TypeError('Invalid require');
  }

  var anonDefine;
  // set to true if the current module turns out to be a named define bundle
  var defineBundle;
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

        module.uri = loader.baseURL + module.id;

        module.config = function() {};

        // add back in system dependencies
        if (moduleIndex != -1)
          depValues.splice(moduleIndex, 0, module);
        
        if (exportsIndex != -1)
          depValues.splice(exportsIndex, 0, exports);
        
        if (requireIndex != -1) 
          depValues.splice(requireIndex, 0, function(names, callback, errback) {
            if (typeof names == 'string' && typeof callback != 'function')
              return req(names);
            return require.call(loader, names, callback, errback, { name: module.id });
          });

        // set global require to AMD require
        var curRequire = global.require;
        global.require = require;

        var output = factory.apply(exportsIndex == -1 ? global : exports, depValues);

        global.require = curRequire;

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
      // this is just to support single modules of the form:
      // define('jquery')
      // still loading anonymously
      // because it is done widely enough to be useful
      if (deps.length == 0 && !anonDefine && !defineBundle) {
        anonDefine = define;
      }
      // otherwise its a bundle only
      else {
        // if there is an anonDefine already (we thought it could have had a single named define)
        // then we define it now
        // this is to avoid defining named defines when they are actually anonymous
        if (anonDefine && anonDefine.name)
          loader.register(anonDefine.name, anonDefine.deps, false, anonDefine.execute);

        anonDefine = null;
      }

      // note this is now a bundle
      defineBundle = true;

      // define the module through the register registry
      loader.register(name, define.deps, false, define.execute);
    }
  }
  define.amd = {};

  // adds define as a global (potentially just temporarily)
  function createDefine(loader) {
    anonDefine = null;
    defineBundle = null;

    // ensure no NodeJS environment detection
    var oldModule = global.module;
    var oldExports = global.exports;
    var oldDefine = global.define;

    global.module = undefined;
    global.exports = undefined;
    global.define = define;

    return function removeDefine() {
      global.define = oldDefine;
      global.module = oldModule;
      global.exports = oldExports;
    };
  }

  var amdHelpers = loader.newModule({
    createDefine: createDefine,
    require: require,
    define: define
  });

  loader.set('@@amd-helpers', amdHelpers);
  loader.amdDefine = define;
  loader.amdRequire = require;

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

  // script injection mode calls this function synchronously on load
  var onScriptLoad = loader.onScriptLoad;
  loader.onScriptLoad = function(load) {
    onScriptLoad(load);
    if (anonDefine || defineBundle) {
      load.metadata.format = 'defined';
      load.metadata.registered = true;
    }

    if (anonDefine) {
      load.metadata.deps = load.metadata.deps ? load.metadata.deps.concat(anonDefine.deps) : anonDefine.deps;
      load.metadata.execute = anonDefine.execute;
    }
  }

  if (loader.scriptLoader) {
    var loaderFetch = loader.fetch;
    loader.fetch = function(load) {
      amdHelpers.createDefine(this);
      return loaderFetch.call(this, load);
    }
  }

  var loaderInstantiate = loader.instantiate;
  loader.instantiate = function(load) {
    var loader = this;

    if (load.metadata.format == 'amd' || !load.metadata.format && load.source.match(amdRegEx)) {
      load.metadata.format = 'amd';

      if (loader.execute !== false) {
        var removeDefine = amdHelpers.createDefine(loader);

        loader.__exec(load);

        removeDefine();

        if (!anonDefine && !defineBundle && !isNode)
          throw new TypeError('AMD module ' + load.name + ' did not define');
      }

      if (anonDefine) {
        load.metadata.deps = load.metadata.deps ? load.metadata.deps.concat(anonDefine.deps) : anonDefine.deps;
        load.metadata.execute = anonDefine.execute;
      }
    }

    return loaderInstantiate.call(loader, load);
  }
}
