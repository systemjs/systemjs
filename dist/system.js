/*
 * SystemJS
 * 
 * Copyright (c) 2013 Guy Bedford
 * MIT License
 */

(function(global) {

global.upgradeSystemLoader = function() {
  delete global.upgradeSystemLoader;
/*
  SystemJS Core
  Adds normalization to the import function, as well as __defaultOnly support
*/
(function() {
  // check we have System
  if (typeof System == 'undefined')
    throw 'System not defined. Include the `es6-module-loader.js` polyfill before SystemJS.';

  /*
    __defaultOnly
    
    When a module object looks like:
    new Module({
      __defaultOnly: true,
      default: 'some-module'
    })

    Then the import of that module is taken to be the 'default' export and not the module object itself.

    Useful for module.exports = function() {} handling
  */
  var checkDefaultOnly = function(module) {
    if (!(module instanceof Module)) {
      var out = [];
      for (var i = 0; i < module.length; i++)
        out[i] = checkDefaultOnly(module[i]);
      return out;
    }
    return module.__defaultOnly ? module['default'] : module;
  }
  
  var systemGet = System.get;
  System.get = function(key) {
    var module = systemGet.call(this, key);
    return checkDefaultOnly(module);
  }
  
  // patch System.import to do normalization
  var systemImport = System.import;
  System.import = function(name, options) {
    // normalize name first
    return new Promise(function(resolve) {
      resolve(System.normalize.call(this, name, options && options.name, options && options.address))
    })
    .then(function(name) {
      return systemImport.call(System, name, options);
    })
    .then(function(module) {
      return checkDefaultOnly(module);
    });
  }

})();
/*
  SystemJS Formats

  Provides modular support for format detections.

  Add a format with:
    System.formats.push('myformatname');
    System.format.myformat = {
      detect: function(source, load) {
        return false / depArray;
      },
      execute: function(load, depMap, global, execute) {
        return moduleObj; // (doesnt have to be a Module instance)
      }
    }

  The System.formats array sets the format detection order.
  
  See the AMD, global and CommonJS format extensions for examples.
*/
(function() {

  (function(global) {

    System.format = {};
    System.formats = [];

    // also in ESML, build.js
    var es6RegEx = /(?:^\s*|[}{\(\);,\n]\s*)(import\s+['"]|(import|module)\s+[^"'\(\)\n;]+\s+from\s+['"]|export\s+(\*|\{|default|function|var|const|let|[_$a-zA-Z\xA0-\uFFFF][_$a-zA-Z0-9\xA0-\uFFFF]*))/;

    // module format hint regex
    var formatHintRegEx = /^(\s*(\/\*.*\*\/)|(\/\/[^\n]*))*(["']use strict["'];?)?["']([^'"]+)["'][;\n]/;

    var systemInstantiate = System.instantiate;
    System.instantiate = function(load) {
      var name = load.name || '';

      if (!load.source || name == 'traceur')
        return systemInstantiate.call(this, load);

      // set load.metadata.format from metadata or format hints in the source
      var format = load.metadata.format;
      if (!format) {
        var formatMatch = load.source.match(formatHintRegEx);
        if (formatMatch)
          format = load.metadata.format = formatMatch[5];
      }

      // es6 handled by core
      if (format == 'es6' || !format && load.source.match(es6RegEx)) {
        load.metadata.es6 = true;
        return systemInstantiate.call(System, load);
      }

      // if it is shimmed, assume it is a global script
      if (System.shim && System.shim[load.name])
        format = 'global';

      // if we don't know the format, run detection first
      if (!format || !this.format[format])
        for (var i = 0; i < this.formats.length; i++) {
          var f = this.formats[i];
          var curFormat = this.format[f];
          if (curFormat.detect(load)) {
            format = f;
            break;
          }
        }

      var curFormat = this.format[format];

      // if we don't have a format or format rule, throw
      if (!format || !curFormat)
        throw new TypeError('No format found for ' + (format ? format : load.address));

      // now invoke format instantiation
      function exec() {
        __scopedEval(load.source, global, load.address);
      }
      return {
        deps: curFormat.deps(load, global, exec),
        execute: function() {
          var output = curFormat.execute.call(this, Array.prototype.splice.call(arguments, 0), load, global, exec);

          if (output instanceof global.Module)
            return output;
          else
            return new global.Module(output && output.__transpiledModule ? (delete output.__transpiledModule, output) : { __defaultOnly: true, 'default': output });
        }
      };
    }
  })(typeof window != 'undefined' ? window : global);

  // carefully scoped eval with given global
  function __scopedEval(__source, global, __sourceURL) {
    try {
      eval('with(global) { (function() { ' + __source + ' \n }).call(global); }'
        + (__sourceURL && !__source.match(/\/\/[@#] ?(sourceURL|sourceMappingURL)=([^\n]+)/)
        ? '\n//# sourceURL=' + __sourceURL : ''));
    }
    catch(e) {
      if (e.name == 'SyntaxError')
        e.message = 'Evaluating ' + __sourceURL + '\n\t' + e.message;
      throw e;
    }
  }

})();
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
      return System.get(names);

    else
      throw 'Invalid require';
  }
  function makeRequire(parentName, deps, depsNormalized) {
    return function(names, callback, errback) {
      if (typeof names == 'string' && deps.indexOf(names) != -1)
        return System.get(depsNormalized[deps.indexOf(names)]);
      return require(names, callback, errback, { name: parentName });
    }
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
        }
        else {
          meta.name = name;
        }
        if (!(_deps instanceof Array)) {
          factory = _deps;
          // CommonJS AMD form
          _deps = ['require', 'exports', 'module'].concat(System.format.cjs.deps(load, global, eval));
        }
        deps = _deps;
        
        if (typeof factory != 'function') {
          meta.factory = function() {
            return factory;
          }
        }
        else {
          meta.factory = factory;
        }
      }
      global.define.amd = {};

      // ensure no NodeJS environment detection
      delete global.module;
      delete global.exports;

      exec();

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

      delete global.define;

      meta.deps = deps;

      return deps;

    },
    execute: function(depNames, load, global, exec) {
      var meta = load.metadata;
      var deps = [];
      for (var i = 0; i < depNames.length; i++)
        deps[i] = System.get(depNames[i]);

      var require, exports = {}, module;
      
      // add back in system dependencies
      if (meta.moduleIndex !== undefined)
        deps.splice(meta.moduleIndex, 0, module = { id: load.name, uri: load.address, config: function() { return {}; }, exports: exports });
      if (meta.exportsIndex !== undefined)
        deps.splice(meta.exportsIndex, 0, exports);
      if (meta.requireIndex !== undefined)
        deps.splice(meta.requireIndex, 0, require = makeRequire(load.name, meta.deps, depNames));

      return meta.factory.apply(global, deps) || module && module.exports || exports || undefined;
    }
  };
})();
/*
  SystemJS CommonJS Format
  Provides the CommonJS module format definition at System.format.cjs
*/
(function() {
  System.formats.push('cjs');

  // CJS Module Format
  // require('...') || exports[''] = ... || exports.asd = ... || module.exports = ...
  var cjsExportsRegEx = /(?:^\s*|[}{\(\);,\n=:\?\&]\s*|module\.)(exports\s*\[\s*('[^']+'|"[^"]+")\s*\]|\exports\s*\.\s*[_$a-zA-Z\xA0-\uFFFF][_$a-zA-Z0-9\xA0-\uFFFF]*|exports\s*\=)/;
  var cjsRequireRegEx = /(?:^\s*|[}{\(\);,\n=:\?\&]\s*)require\s*\(\s*("([^"]+)"|'([^']+)')\s*\)/g;
  var commentRegEx = /(\/\*([\s\S]*?)\*\/|([^:]|^)\/\/(.*)$)/mg;

  var nodeProcess = {
    nextTick: function(f) {
      setTimeout(f, 7);
    }
  };

  System.format.cjs = {
    detect: function(load) {
      cjsExportsRegEx.lastIndex = 0;
      cjsRequireRegEx.lastIndex = 0;
      return !!(cjsRequireRegEx.exec(load.source) || cjsExportsRegEx.exec(load.source));
    },
    deps: function(load, global, exec) {
      cjsExportsRegEx.lastIndex = 0;
      cjsRequireRegEx.lastIndex = 0;

      var deps = [];

      // remove comments from the source first
      var source = load.source.replace(commentRegEx, '');

      var match;

      while (match = cjsRequireRegEx.exec(source))
        deps.push(match[2] || match[3]);

      load.metadata.deps = deps;

      return deps;
    },
    execute: function(depNames, load, global, exec) {
      var dirname = load.address.split('/');
      dirname.pop();
      dirname = dirname.join('/');

      var deps = load.metadata.deps;

      var globals = global._g = {
        global: global,
        exports: {},
        process: nodeProcess,
        require: function(d) {
          var index = deps.indexOf(d);
          if (index != -1)
            return System.get(depNames[index]);
        },
        __filename: load.address,
        __dirname: dirname,
      };
      globals.module = { exports: globals.exports };

      var glString = '';
      for (var _g in globals)
        glString += 'var ' + _g + ' = _g.' + _g + ';';

      load.source = glString + load.source;

      exec();

      delete global._g;

      return globals.module.exports;
    }
  };
})();/*
  SystemJS Global Format
  Provides the global support at System.format.global
  Supports inline shim syntax with:
    "global";
    "import jquery";
    "export my.Global";

  Also detects writes to the global object avoiding global collisions.
  See the SystemJS readme global support section for further information.
*/
(function() {
  System.formats.push('global');

  // Global
  var globalShimRegEx = /(["']global["'];\s*)((['"]import [^'"]+['"];\s*)*)(['"]export ([^'"]+)["'])?/;
  var globalImportRegEx = /(["']import [^'"]+)+/g;

  // given a module's global dependencies, prepare the global object
  // to contain the union of the defined properties of its dependent modules
  var moduleGlobals = {};

  // also support a System.shim system
  System.shim = {};

  System.format.global = {
    detect: function() {
      return true;
    },
    deps: function(load, global, exec) {
      var match, deps;
      if (match = load.source.match(globalShimRegEx)) {
        deps = match[2].match(globalImportRegEx);
        if (deps)
          for (var i = 0; i < deps.length; i++)
            deps[i] = deps[i].substr(8);
        load.metadata.globalExport = match[5];
      }
      deps = deps || [];
      var shim;
      if (shim = System.shim[load.name]) {
        if (typeof shim == 'object') {
          if (shim.exports)
            load.metadata.globalExport = shim.exports;
          if (shim.imports)
            shim = shim.imports;
        }
        if (shim instanceof Array)
          deps = deps.concat(shim);
      }
      return deps;
    },
    execute: function(depNames, load, global, exec) {
      var globalExport = load.metadata.globalExport;

      // first, we add all the dependency module properties to the global
      for (var i = 0; i < depNames.length; i++) {
        var moduleGlobal = moduleGlobals[depNames[i]];
        if (moduleGlobal)
          for (var m in moduleGlobal)
            global[m] = moduleGlobal[m];
      }

      // now store a complete copy of the global object
      // in order to detect changes
      var globalObj = {};
      for (var g in global)
        if (global.hasOwnProperty(g))
          globalObj[g] = global[g];

      if (globalExport)
        load.source += '\nthis["' + globalExport + '"] = ' + globalExport;

      exec();

      // check for global changes, creating the globalObject for the module
      // if many globals, then a module object for those is created
      // if one global, then that is the module directly
      var singleGlobal, moduleGlobal;
      if (globalExport) {
        var firstPart = globalExport.split('.')[0];
        singleGlobal = eval.call(global, globalExport);
        moduleGlobal = {};
        moduleGlobal[firstPart] = global[firstPart];
      }
      else {
        moduleGlobal = {};
        for (var g in global) {
          if (global.hasOwnProperty(g) && g != global && globalObj[g] != global[g]) {
            moduleGlobal[g] = global[g];
            if (singleGlobal) {
              if (singleGlobal !== global[g])
                singleGlobal = false;
            }
            else if (singleGlobal !== false)
              singleGlobal = global[g];
          }
        }
      }
      moduleGlobals[load.name] = moduleGlobal;
      
      if (singleGlobal)
        return singleGlobal;
      else
        return new Module(moduleGlobal);
    }
  };
})();/*
  SystemJS Plugin Support

  Supports plugin syntax with "!"

  The plugin name is loaded as a module itself, and can override standard loader hooks
  for the plugin resource. See the plugin section of the systemjs readme.
*/
(function() {
  var systemNormalize = System.normalize;
  System.normalize = function(name, parentName, parentAddress) {
    name = name.trim();

    // if parent is a plugin, normalize against the parent plugin argument only
    var parentPluginIndex;
    if (parentName && (parentPluginIndex = parentName.indexOf('!')) != -1)
      parentName = parentName.substr(0, parentPluginIndex);

    // if this is a plugin, normalize the plugin name and the argument
    var pluginIndex = name.lastIndexOf('!');
    if (pluginIndex != -1) {
      var argumentName = name.substr(0, pluginIndex);

      // plugin name is part after "!" or the extension itself
      var pluginName = name.substr(pluginIndex + 1) || argumentName.substr(argumentName.lastIndexOf('.') + 1);

      // normalize the plugin name
      return new Promise(function(resolve) {
        resolve(System.normalize(pluginName)); 
      })
      // normalize the plugin argument
      .then(function(_pluginName) {
        pluginName = _pluginName;
        return System.normalize(argumentName, parentName, parentAddress);
      })
      .then(function(argumentName) {
        return argumentName + '!' + pluginName;
      });
    }

    // standard normalization
    return systemNormalize.call(this, name, parentName, parentAddress);
  }

  var systemLocate = System.locate;
  System.locate = function(load) {
    var name = load.name;

    // plugin
    var pluginIndex = name.lastIndexOf('!');
    if (pluginIndex != -1) {
      var pluginName = name.substr(pluginIndex + 1);

      // the name to locate is the plugin argument only
      load.name = name.substr(0, pluginIndex);

      // load the plugin module
      return System.load(pluginName)
      .then(function() {
        var plugin = System.get(pluginName);
        plugin = plugin.default || plugin;

        // store the plugin module itself on the metadata
        load.metadata.plugin = plugin;
        load.metadata.pluginName = pluginName;
        load.metadata.pluginArgument = load.name;

        // run plugin locate if given
        if (plugin.locate)
          return plugin.locate.call(System, load);

        // otherwise use standard locate without '.js' extension adding
        else
          return new Promise(function(resolve) {
            resolve(System.locate(load));
          })
          .then(function(address) {
            return address.substr(0, address.length - 3);
          });
      });
    }

    return systemLocate.call(this, load);
  }

  var systemFetch = System.fetch;
  System.fetch = function(load) {
    // support legacy plugins
    var self = this;
    if (typeof load.metadata.plugin == 'function') {
      return new Promise(function(fulfill, reject) {
        load.metadata.plugin(load.metadata.pluginArgument, load.address, function(url, callback, errback) {
          systemFetch.call(self, { name: load.name, address: url, metadata: {} }).then(callback, errback);
        }, fulfill, reject);
      });
    }
    return (load.metadata.plugin && load.metadata.plugin.fetch || systemFetch).call(this, load);
  }

  var systemTranslate = System.translate;
  System.translate = function(load) {
    var plugin = load.metadata.plugin;
    if (plugin && plugin.translate)
      return plugin.translate.call(this, load);

    return systemTranslate.call(this, load);
  }

})();/*
  SystemJS map support
  
  Provides map configuration through
    System.map['jquery'] = 'some/module/map'

  As well as contextual map config through
    System.map['bootstrap'] = {
      jquery: 'some/module/map2'
    }

  Note that this applies for subpaths, just like RequireJS

  jquery      -> 'some/module/map'
  jquery/path -> 'some/module/map/path'
  bootstrap   -> 'bootstrap'

  Inside any module name of the form 'bootstrap' or 'bootstrap/*'
    jquery    -> 'some/module/map2'
    jquery/p  -> 'some/module/map2/p'

  Maps are carefully applied from most specific contextual map, to least specific global map
*/
(function() {

  System.map = System.map || {};


  // return the number of prefix parts (separated by '/') matching the name
  // eg prefixMatchLength('jquery/some/thing', 'jquery') -> 1
  function prefixMatchLength(name, prefix) {
    var prefixParts = prefix.split('/');
    var nameParts = name.split('/');
    if (prefixParts.length > nameParts.length)
      return 0;
    for (var i = 0; i < prefixParts.length; i++)
      if (nameParts[i] != prefixParts[i])
        return 0;
    return prefixParts.length;
  }


  // given a relative-resolved module name and normalized parent name,
  // apply the map configuration
  function applyMap(name, parentName) {

    var curMatch, curMatchLength = 0;
    var curParent, curParentMatchLength = 0;
    
    // first find most specific contextual match
    if (parentName) {
      for (var p in System.map) {
        var curMap = System.map[p];
        if (typeof curMap != 'object')
          continue;

        // most specific parent match wins first
        if (prefixMatchLength(parentName, p) <= curParentMatchLength)
          continue;

        for (var q in curMap) {
          // most specific name match wins
          if (prefixMatchLength(name, q) <= curMatchLength)
            continue;

          curMatch = q;
          curMatchLength = q.split('/').length;
          curParent = p;
          curParentMatchLength = p.split('/').length;
        }
      }
      if (curMatch) {
        var subPath = name.split('/').splice(curMatchLength).join('/');
        return System.map[curParent][curMatch] + (subPath ? '/' + subPath : '');
      }
    }

    // if we didn't find a contextual match, try the global map
    for (var p in System.map) {
      var curMap = System.map[p];
      if (typeof curMap != 'string')
        continue;

      if (prefixMatchLength(name, p) <= curMatchLength)
        continue;

      curMatch = p;
      curMatchLength = p.split('/').length;
    }
    
    // return a match if any
    if (!curMatch)
      return name;
    
    var subPath = name.split('/').splice(curMatchLength).join('/');
    return System.map[curMatch] + (subPath ? '/' + subPath : '');
  }

  var systemNormalize = System.normalize.bind(System);
  System.normalize = function(name, parentName, parentAddress) {
    return Promise.resolve(systemNormalize(name, parentName, parentAddress))
    .then(function(name) {
      return applyMap(name, parentName);
    });
  }
})();
/*
  SystemJS Semver Version Addon
  
  1. Uses Semver convention for major and minor forms

  Supports requesting a module from a package that contains a version suffix
  with the following semver ranges:
    module       - any version
    module@1     - major version 1, any minor (not prerelease)
    module@1.2   - minor version 1.2, any patch (not prerelease)
    module@1.2.3 - exact version

  It is assumed that these modules are provided by the server / file system.

  First checks the already-requested packages to see if there are any packages 
  that would match the same package and version range.

  This provides a greedy algorithm as a simple fix for sharing version-managed
  dependencies as much as possible, which can later be optimized through version
  hint configuration created out of deeper version tree analysis.
  
  2. Semver-compatibility syntax (caret operator - ^)

  Compatible version request support is then also provided for:

    module@^1.2.3        - module@1, >=1.2.3
    module@^1.2          - module@1, >=1.2.0
    module@^1            - module@1
    module@^0.5.3        - module@0.5, >= 0.5.3
    module@^0.0.1        - module@0.0.1

  The ^ symbol is always normalized out to a normal version request.

  This provides comprehensive semver compatibility.
  
  3. System.versions version hints and version report

  Note this addon should be provided after all other normalize overrides.

  The full list of versions can be found at System.versions providing an insight
  into any possible version forks.

  It is also possible to create version solution hints on the System global:

  System.versions = {
    jquery: ['1.9.2', '2.0.3'],
    bootstrap: '3.0.1'
  };

  Versions can be an array or string for a single version.

  When a matching semver request is made (jquery@1.9, jquery@1, bootstrap@3)
  they will be converted to the latest version match contained here, if present.

  Prereleases in this versions list are also allowed to satisfy ranges when present.
*/

(function() {
  // match x, x.y, x.y.z, x.y.z-prerelease.1
  var semverRegEx = /^(\d+)(?:\.(\d+)(?:\.(\d+)(?:-([0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*))?)?)?$/;

  var semverCompare = function(v1, v2) {
    var v1Parts = v1.split('.');
    var v2Parts = v2.split('.');
    var prereleaseIndex;
    if (v1Parts[2] && (prereleaseIndex = v1Parts[2].indexOf('-')) != -1)
      v1Parts.splice(2, 1, v1Parts[2].substr(0, prereleaseIndex), v1Parts[2].substr(prereleaseIndex + 1));
    if (v2Parts[2] && (prereleaseIndex = v2Parts[2].indexOf('-')) != -1)
      v2Parts.splice(2, 1, v2Parts[2].substr(0, prereleaseIndex), v2Parts[2].substr(prereleaseIndex + 1));
    for (var i = 0; i < Math.max(v1Parts.length, v2Parts.length); i++) {
      if (!v1Parts[i])
        return true;
      else if (!v2Parts[i])
        return false;
      if (v1Parts[i] != v2Parts[i])
        return v1Parts[i] > v2Parts[i];
    }
    return true;
  }
  
  var systemNormalize = System.normalize;

  System.versions = {};

  // hook normalize and store a record of all versioned packages
  System.normalize = function(name, parentName, parentAddress) {
    var packageVersions = System.versions;
    // run all other normalizers first
    return Promise.resolve(systemNormalize.call(this, name, parentName, parentAddress)).then(function(normalized) {
      
      var version, semverMatch, nextChar, versions;
      var index = normalized.indexOf('@');

      // see if this module corresponds to a package already in out versioned packages list
      
      // no version specified - check against the list (given we don't know the package name)
      if (index == -1) {
        for (var p in packageVersions) {
          versions = packageVersions[p];
          if (typeof versions == 'string')
            versions = [versions];
          if (normalized.substr(0, p.length) != p)
            continue;

          nextChar = normalized.charAt(p.length);

          if (nextChar && nextChar != '/')
            continue;

          // match -> take latest version
          return p + '@' + versions[versions.length - 1] + normalized.substr(p.length);
        }
        return normalized;
      }

      // get the version info
      version = normalized.substr(index + 1).split('/')[0];

      var minVersion;
      if (version.substr(0, 1) == '^') {
        version = version.substr(1);
        minVersion = true;
      }

      semverMatch = version.match(semverRegEx);

      // translate '^' handling as described above
      if (minVersion) {
        // >= 1.0.0
        if (semverMatch[1] > 0) {
          minVersion = version;
          semverMatch = [semverMatch[1]];
        }
        // >= 0.1.0
        else if (semverMatch[2] > 0) {
          minVersion = version;
          semverMatch = [0, semverMatch[2]];
        }
        // >= 0.0.0
        else {
          minVersion = false;
          semverMatch = [0, 0, semverMatch[3]]
        }
        version = semverMatch.join('.');

        // remove the ^ now
        normalized = normalized.substr(0, index + 1) + version;
      }

      // if not a semver, we cant help
      if (!semverMatch)
        return normalized;

      var packageName = normalized.substr(0, index);

      versions = packageVersions[packageName] || [];

      if (typeof versions == 'string')
        versions = [versions];

      // look for a version match
      // if an exact semver, theres nothing to match, just record it
      if (!semverMatch[3] || minVersion)
        for (var i = versions.length - 1; i >= 0; i--) {
          var curVersion = versions[i];
          // if I have requested x.y, find an x.y.z-b
          // if I have requested x, find any x.y / x.y.z-b
          if (curVersion.substr(0, version.length) == version && curVersion.charAt(version.length).match(/^[\.\-]?$/)) {
            // if a minimum version, then check too
            if (!minVersion || minVersion && semverCompare(curVersion, minVersion))
              return packageName + '@' + curVersion + normalized.substr(packageName.length + version.length + 1);
          }
        }

      // record the package and semver for reuse since we're now asking the server
      // x.y and x versions will now be latest by default, so they are useful in the version list
      if (versions.indexOf(version) == -1) {
        versions.push(version);
        versions.sort(semverCompare);
        packageVersions[packageName] = versions.length == 1 ? versions[0] : versions;

        // could also add a catch here to another System.import, so if the import fails we can remove the version
      }

      return normalized;
    });
  }

})();
};

(function() {
  if (!global.System) {
    if (typeof window != 'undefined') {
      // determine the current script path as the base path
      var scripts = document.getElementsByTagName('script');
      var curPath = scripts[scripts.length - 1].src;
      var basePath = curPath.substr(0, curPath.lastIndexOf('/') + 1);
      document.write(
        '<' + 'script type="text/javascript" src="' + basePath + 'es6-module-loader.js" data-init="upgradeSystemLoader">' + '<' + '/script>'
      );
    }
    else {
      var es6ModuleLoader = require('es6-module-loader');
      global.System = es6ModuleLoader.System;
      global.Loader = es6ModuleLoader.Loader;
      global.Module = es6ModuleLoader.Module;
      module.exports = global.System;
      global.upgradeSystemLoader();
    }
  }
  else
    global.upgradeSystemLoader();
})();


})(typeof window != 'undefined' ? window : global);
