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

    var es6RegEx = /(?:^\s*|[}{\(\);,\n]\s*)(import\s+['"]|(import|module)\s+[^"'\(\)\n;]+\s+from\s+['"]|export\s+(\*|\{|default|function|var|const|let|[_$a-zA-Z\xA0-\uFFFF][_$a-zA-Z0-9\xA0-\uFFFF]*))/;

    // module format hint regex
    var formatHintRegEx = /^(\s*(\/\*.*\*\/)|(\/\/[^\n]*))*(["']use strict["'];?)?["']([^'"]+)["'][;\n]/;

    // go through a module list or module and if the only
    // export is the default, then provide it directly
    // useful for module.exports = function() {} handling
    var checkDefaultOnly = function(module) {
      if (!(module instanceof Module)) {
        var out = [];
        for (var i = 0; i < module.length; i++)
          out[i] = checkDefaultOnly(module[i]);
        return out;
      }
      return module.__defaultOnly ? module['default'] : module;
    }

    // determine if the source is minified - don't remove comments in this case
    function isMinified(str) {
      var newlines = str.match(/\n/g);
      return str.length / (newlines && newlines.length || 1) > 100;
    }

    // function to remove the comments from a string
    // necessary for regex detection not to check commented code
    function removeComments(str) {
      // output
      // block comments replaced with equivalent whitespace
      // this is to ensure source maps remain valid
      var curOutIndex = 0,
        outString = '',
        blockCommentWhitespace = '';

      // mode variables
      var singleQuote = false,
        doubleQuote = false,
        regex = false,
        blockComment = false,
        doubleBackslash = false,
        lineComment = false;

      // character buffer
      var lastChar;
      var curChar = '';
      var lastToken;

      for (var i = 0, l = str.length; i <= l; i++) {
        lastChar = curChar;
        curChar = str.charAt(i);

        if (curChar === '\n' || curChar === '\r' || curChar === '') {
          regex = doubleQuote = singleQuote = doubleBackslash = false;
          if (lineComment) {
            curOutIndex = i;
            lineComment = false;
          }
          if (blockComment)
            blockCommentWhitespace += curChar;
          lastToken = '';
          continue;
        }

        if (lastChar !== ' ' && lastChar !== '\t')
          lastToken = lastChar;

        if (singleQuote || doubleQuote || regex) {
          if (curChar == '\\' && lastChar == '\\')
            doubleBackslash = !doubleBackslash;
        }

        if (singleQuote) {
          if (curChar === "'" && (lastChar !== '\\' || doubleBackslash))
            singleQuote = doubleBackslash = false;
        }

        else if (doubleQuote) {
          if (curChar === '"' && (lastChar !== '\\' || doubleBackslash))
            doubleQuote = doubleBackslash = false;
        }

        else if (regex) {
          if (curChar === '/' && (lastChar !== '\\' || doubleBackslash)) {
            // a comment inside a regex immediately means we've misread the regex
            // so switch back to block mode to detect the comment
            if (str.charAt(i + 1) == '/') {
              regex = doubleBackslash = false;
            }
            else {
              regex = doubleBackslash = false;
              i++;
              lastToken = lastChar = curChar;
              curChar = str.charAt(i);
            }
          }
        }

        else if (blockComment) {
          blockCommentWhitespace += ' ';
          if (curChar === '/' && lastChar === '*' && blockCommentWhitespace.length > 3) {
            blockComment = false;
            curOutIndex = i + 1;
          }
        }

        else if (!lineComment) {
          doubleQuote = curChar === '"';
          singleQuote = curChar === "'";

          if (lastChar !== '/')
            continue;
          
          if (curChar === '*') {
            blockComment = true;
            outString += blockCommentWhitespace + str.substring(curOutIndex, i - 1);
            blockCommentWhitespace = '  ';
          }
          else if (curChar === '/') {
            lineComment = true;
            outString += blockCommentWhitespace + str.substring(curOutIndex, i - 1);
            blockCommentWhitespace = '';
          }
          else if (lastToken !== '}' && lastToken !== ')' && lastToken !== ']' && !lastToken.match(/\w|\d|'|"|\-|\+/)) {
            // detection not perfect - careful comment detection within regex is used to compensate
            // without sacrificing global comment removal accuracy
            regex = true;
          }
        }
      }
      return outString + blockCommentWhitespace + str.substr(curOutIndex);
    }

    var systemInstantiate = System.instantiate;
    System.instantiate = function(load) {
      var name = load.name || '';

      if (!load.source || name == 'traceur')
        return systemInstantiate.call(this, load);

      var source = load.source;

      // set load.metadata.format from metadata or format hints in the source
      var format = load.metadata.format;
      if (!format) {
        var formatMatch = load.source.match(formatHintRegEx);
        if (formatMatch)
          format = formatMatch[5];
      }

      // es6 handled by core
      if (format == 'es6' || !format && source.match(es6RegEx)) {
        load.metadata.es6 = true;
        return systemInstantiate.call(System, load);
      }

      // remove comments to allow for regex format detections if necessary
      if (!format && !isMinified(source))
        source = removeComments(source);

      // do modular format detection and handling
      // format priority is order of System.formats array
      for (var i = 0; i < this.formats.length; i++) {
        var f = this.formats[i];

        if (format && format != f)
            continue;

        var curFormat = this.format[f];

        // run detection, which returns deps (even if format already knows format)
        var deps;
        if (!(deps = curFormat.detect(source, load)) && !format)
          continue;

        var execute = curFormat.execute;

        return {
          deps: deps,
          execute: function() {
            var depMap = {};
            for (var i = 0; i < arguments.length; i++)
              depMap[deps[i]] = checkDefaultOnly(arguments[i]);

            // yes this is a lot of arguments, but we really dont want to add the other properties
            // to the load object, as it is then too easy to create a global closure function of load
            // that causes the module source not to be garbage disposed
            var output = execute(load, depMap, global, function() {
              __scopedEval(load.source, global, load.address);
            });

            if (output instanceof global.Module)
              return output;
            else
              return new global.Module(output && output.__module ? output.__module : { __defaultOnly: true, 'default': output });
          }
        };
      }

      if (format && format != 'global')
        throw new TypeError('Format "' + format + '" not defined in System');
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

  var nodeProcess = {
    nextTick: function(f) {
      setTimeout(f, 7);
    }
  };

  System.format.cjs = {
    detect: function(source) {

      cjsExportsRegEx.lastIndex = 0;
      cjsRequireRegEx.lastIndex = 0;

      var firstMatch = cjsRequireRegEx.exec(source);

      // fail detection
      if (!firstMatch && !source.match(cjsExportsRegEx))
        return false;

      var deps = [];
      var match;
      if ((match = firstMatch))
        deps.push(match[2] || match[3]);

      while (match = cjsRequireRegEx.exec(source))
        deps.push(match[2] || match[3]);

      return deps;
    },
    execute: function(load, depMap, global, execute) {
      var dirname = load.address.split('/');
      dirname.pop();
      dirname = dirname.join('/');

      var globals = global._g = {
        global: global,
        exports: {},
        process: nodeProcess,
        require: function(d) {
          return depMap[d];
        },
        __filename: load.address,
        __dirname: dirname,
      };
      globals.module = { exports: globals.exports };

      var glString = '';
      for (var _g in globals)
        glString += 'var ' + _g + ' = _g.' + _g + ';';

      load.source = glString + load.source;

      execute();

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
    detect: function(source, load) {
      var match, deps;
      if (match = source.match(globalShimRegEx)) {
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
    execute: function(load, depMap, global, execute) {
      var globalExport = load.metadata.globalExport;

      // first, we add all the dependency module properties to the global
      // NB cheat here for System iteration
      for (var d in depMap) {
        var module = depMap[d];
        var moduleGlobal;
        for (var m in System._modules) {
          if (System._modules[m] === module) {
            moduleGlobal = moduleGlobals[m];
            break;
          }
        }
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

      execute();

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
      moduleGlobals[name] = moduleGlobal;
      
      if (singleGlobal)
        return singleGlobal;
      else
        return new Module(moduleGlobal);
    }
  };
})();/*
  SystemJS Module Addon

  Supports the import "@module" for any module, providing the module meta:

  import { name } from "@module";

  Where name is the name of the current module.
*/
(function() {
  var systemNormalize = System.normalize;
  System.normalize = function(name, parentName, parentAddress) {
    if (name == '@module')
      return '@module:' + parentName;
    return systemNormalize.call(this, name, parentName, parentAddress);
  }
  var systemLocate = System.locate;
  System.locate = function(load) {
    if (load.name.substr(0, 7) == '@module') {
      load.metadata.module = {
        name: load.name.substr(8)
      };
      return '';
    }
    return systemLocate.call(this, load);
  }
  var systemFetch = System.fetch;
  System.fetch = function(load) {
    if (load.metadata.module)
      return '';
    return systemFetch.call(this, load);
  }
  var systemInstantiate = System.instantiate;
  System.instantiate = function(load) {
    if (load.metadata.module)
      return {
        deps: [],
        execute: function() {
          return new Module(load.metadata.module);
        }
      };
    return systemInstantiate.call(this, load);
  }
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
        load.metadata.plugin(load.name, load.address, function(url, callback, errback) {
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
*/
(function() {
  var separatorRegEx = /[\/:]/;

  System.map = {};

  // given a relative-resolved module name apply the map configuration
  var applyMap = function(name) {
    
    var curMatch = '';
    var curMatchSuffix = '';

    var nameParts = name.split(separatorRegEx);
    
    main:
    for (var p in System.map) {
      var matchParts = p.split(separatorRegEx);
      if (matchParts.length > nameParts.length)
        continue;

      for (var i = 0; i < matchParts.length; i++)
        if (nameParts[i] != matchParts[i])
          continue main;
    
      if (p.length <= curMatch.length)
        continue;

      curMatch = p;
      curMatchSuffix = name.substr(nameParts.splice(0, matchParts.length).join('/').length);
    }
    if (curMatch)
      name = System.map[curMatch] + curMatchSuffix;

    return name;
  }

  var systemNormalize = System.normalize;
  System.normalize = function(name, parentName, parentAddress) {
    return systemNormalize(applyMap(name), parentName, parentAddress);
  }
})();/*
  SystemJS Semver Version Addon

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
  dependencies as much as possible, which can later be optimized through map 
  configuration created out of deeper version tree analysis.

  Compatible version request support is then also provided for:

    module@^1.2.3       - module@1, >=1.2.3
    module@^1.2         - module@1, >=1.2.0
    module@^1           - module@1
    module@^0.5.3       - module@0.5, >= 0.5.3
    module@^0.0.1       - module@0.0.1

  The ^ symbol is always normalized out to a normal version request.

  This provides comprehensive semver compatibility.

  Note this addon should be provided after all other normalize overrides.

  The full list of versions can be found at System.versions providing an insight
  into any possible version forks.

  It is also possible to create version solution hints on the System global:

  System.versions = {
    jquery: ['1.9.2'],
    bootstrap: ['3.0.1']
  };

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
    var prerelease;
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

  var packageVersions = System.versions = {};

  // hook normalize and store a record of all versioned packages
  System.normalize = function(name, parentName, parentAddress) {
    // run all other normalizers first
    return Promise.resolve(systemNormalize.call(this, name, parentName, parentAddress)).then(function(normalized) {
      
      var version, semverMatch, nextChar;
      var index = normalized.indexOf('@');

      // see if this module corresponds to a package already in out versioned packages list
      
      // no version specified - check against the list (given we don't know the package name)
      if (index == -1) {
        for (var p in packageVersions) {
          if (normalized.substr(0, p.length) != p)
            continue;

          nextChar = normalized.charAt(p.length);

          if (nextChar && nextChar != '/')
            continue;

          // match -> take latest version
          return p + '@' + packageVersions[p][packageVersions[p].length - 1] + normalized.substr(p.length);
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
        if (semverMatch[1] > 0) {
          minVersion = version;
          version = semverMatch[0];
          semverMatch = [semverMatch[1]];
        }
        else if (semverMatch[2] > 0) {
          minVersion = version;
          semverMatch = [0, semverMatch[2]];
        }
        else
          minVersion = false;
        version = semverMatch.join('.');

        // remove the ^ now
        normalized = normalized.substr(0, index + 1) + version;
      }

      // if not a semver, we cant help
      if (!semverMatch)
        return normalized;

      var packageName = normalized.substr(0, index);
      var versions = packageVersions[packageName] = packageVersions[packageName] || [];

      // look for a version match
      // if an exact semver, theres nothing to match, just record it
      if (!semverMatch[3] || minVersion)
        for (var i = versions.length - 1; i >= 0; i--) {
          var curVersion = versions[i];
          // if I have requested x.y, find an x.y.z-b
          // if I have requested x, find any x.y / x.y.z-b
          if (curVersion.substr(0, version.length) == version && curVersion.charAt(version.length) == '.') {
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
      }

      return normalized;
    });
  }

})();/*
  SystemJS jspm

  Defines jspm paths for SystemJS

  Allows requires of the form:
    System.import('jquery')
    System.import('npm:underscore')

  To work directly over CDN.
*/
System.paths['~/*'] = System.baseURL + '*.js';
System.baseURL = 'https://registry.jspm.io/';
System.paths['npm:*'] = 'https://npm.jspm.io/*.js';
System.paths['github:*'] = 'https://github.jspm.io/*.js';
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
