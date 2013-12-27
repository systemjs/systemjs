/*
 * SystemJS
 * 
 * Copyright (c) 2013 Guy Bedford
 * MIT License
 */
(function() {

  (function() {

    var isBrowser = typeof window != 'undefined';
    var global = isBrowser ? window : {};

    global.upgradeSystemLoader = function() {
      delete global.upgradeSystemLoader;

      System.map = {};

      // -- helpers --

        // es6 module forwarding - allow detecting without Traceur
        var aliasRegEx = /^\s*export\s*\*\s*from\s*(?:'([^']+)'|"([^"]+)")/;

        var es6RegEx = /(?:^\s*|[}{\(\);,\n]\s*)((import|module)\s+[^"']+\s+from\s+['"]|export\s+(\*|\{|default|function|var|const|let|[_$a-zA-Z\xA0-\uFFFF][_$a-zA-Z0-9\xA0-\uFFFF]*))/;

        // AMD and CommonJS regexs for support
        var amdDefineRegEx = /(?:^\s*|[}{\(\);,\n\?\&]\s*)define\s*\(\s*("[^"]+"\s*,|'[^']+'\s*,\s*)?(\[(\s*("[^"]+"|'[^']+')\s*,)*(\s*("[^"]+"|'[^']+')\s*)?\])?/g;
        var cjsDefineRegEx = /(?:^\s*|[}{\(\);,\n\?\&]\s*)define\s*\(\s*(("[^"]+"\s*,|'[^']+'\s*,)?("[^"]+"\s*,|'[^']+'\s*,)?function\s*|{|[_$a-zA-Z\xA0-\uFFFF][_$a-zA-Z0-9\xA0-\uFFFF]*\))/g;
        var cjsRequireRegEx = /(?:^\s*|[}{\(\);,\n=:\?\&]\s*)require\s*\(\s*("([^"]+)"|'([^']+)')\s*\)/g;
        var cjsExportsRegEx = /(?:^\s*|[}{\(\);,\n=:\?\&]\s*|module\.)(exports\s*\[\s*('[^']+'|"[^"]+")\s*\]|\exports\s*\.\s*[_$a-zA-Z\xA0-\uFFFF][_$a-zA-Z0-9\xA0-\uFFFF]*|exports\s*\=)/;

        // module format hint regex
        var formatHintRegEx = /(\s*(\/\*.*\*\/)|(\/\/[^\n]*))*(["']use strict["'];?)?["'](global|amd|cjs|es6)["'][;\n]/;

        // global dependency specifier, used for shimmed dependencies
        var globalShimRegEx = /(["']global["'];\s*)((['"]import [^'"]+['"];\s*)*)(['"]export ([^'"]+)["'])?/;
        var globalImportRegEx = /(["']import [^'"]+)+/g;

        var sourceMappingURLRegEx = /\/\/[@#] ?sourceMappingURL=(.+)/;
        var sourceURLRegEx = /\/\/[@#] ?sourceURL=(.+)/;

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

        var separatorRegEx = /[\/:]/;

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

        // given a module's global dependencies, prepare the global object
        // to contain the union of the defined properties of its dependent modules
        var globalObj = {};
        var moduleGlobals = {};
        function setGlobal(depModules) {
          // first, we add all the dependency module properties to the global
          if (depModules) {

            for (var i = 0; i < depModules.length; i++) {
              // NB cheat for iteration
              var depGlobal;
              for (var m in System._modules) {
                if (System._modules[m] === depModules[i]) {
                  depGlobal = moduleGlobals[m];
                  break;
                }
              }
              if (depGlobal)
                for (var m in depGlobal)
                  global[m] = depGlobal[m];
            }
          }

          // now we store a complete copy of the global object
          // in order to detect changes
          for (var g in global) {
            if (global.hasOwnProperty(g))
              globalObj[g] = global[g];
          }
        }

        // go through the global object to find any changes
        // the differences become the returned global for this object
        // the global object is left as is
        // optional propertyName of the form 'some.object.here'
        function getGlobal(name, propertyName) {
          var singleGlobal, moduleGlobal;
          if (propertyName) {
            singleGlobal = eval(propertyName);
            moduleGlobal = {};
            moduleGlobal[propertyName.split('.')[0]] = singleGlobal;
          }
          else {
            moduleGlobal = {};
            for (var g in global) {
              if (global.hasOwnProperty(g) && g != (isBrowser ? 'window' : 'global') && globalObj[g] != global[g]) {
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
          // make the module the first found global if not otherwise specified
          return singleGlobal ? { default: singleGlobal, __defaultOnly: true } : moduleGlobal;
        }

        var nodeProcess = {
          nextTick: function(f) {
            setTimeout(f, 7);
          }
        };

        // go through a module list or module and if the only
        // export is the default, then provide it directly
        // useful for module.exports = function() {} handling
        var checkDefaultOnly = function(module) {
          if (!(module instanceof global.Module)) {
            var out = [];
            for (var i = 0; i < module.length; i++)
              out[i] = checkDefaultOnly(module[i]);
            return out;
          }
          return module.__defaultOnly ? module['default'] : module;
        }
      // -- /helpers --



      var systemNormalize = System.normalize;
      System.normalize = function(name, parentName, parentAddress) {
        name = name.trim();

        // plugin
        var pluginIndex = name.lastIndexOf('!');
        if (pluginIndex != -1) {
          var argumentName = name.substr(0, pluginIndex);

          // plugin name is part after "!" or the extension itself
          var pluginName = name.substr(pluginIndex + 1) || argumentName.substr(argumentName.lastIndexOf('.') + 1);

          // load the plugin module
          var normalized = System.normalize(pluginName);
          return (normalized.then || function(resolve) { return resolve(normalized); })(function(_pluginName) {
            pluginName = _pluginName;
            
            return System.load(pluginName)
            .then(function() {
              var plugin = System.get(pluginName);
              plugin = plugin.default || plugin;

              // normalize the plugin argument
              var normalized = (plugin.normalize || System.normalize).call(System, argumentName, parentName, parentAddress);
              return (normalized.then || function(resolve) { return resolve(normalized); })(function(argumentName) {
                return argumentName + '!' + pluginName;
              });

            });
          });
        }

        return systemNormalize.call(this, applyMap(name), parentName, parentAddress);
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

          var plugin = System.get(pluginName);
          plugin = plugin.default || plugin;

          // store the plugin module itself on the metadata
          load.metadata.plugin = plugin;
          load.metadata.pluginName = pluginName;

          // run locate if given
          if (plugin.locate)
            return plugin.locate.call(System, load);

          var located = System.locate(load);
          return (located.then || function(resolve) { return resolve(located); })(function(address) {
            // remove ".js" extension
            return address.substr(0, address.length - 3);
          });
        }

        return systemLocate.call(this, load);
      }

      var systemFetch = System.fetch;
      System.fetch = function(load) {
        return (load.metadata.plugin && load.metadata.plugin.fetch || systemFetch).call(this, load);
      }

      var systemTranslate = System.translate;
      System.translate = function(load) {
        var plugin = load.metadata.plugin;
        if (plugin && plugin.translate)
          return plugin.translate.call(this, load);

        return systemTranslate.call(this, load);
      }

      var systemInstantiate = System.instantiate;
      System.instantiate = function(load) {
        var plugin = load.metadata.plugin;
        if (plugin && plugin.instantiate)
          return plugin.instantiate.call(System, load);

        var name = load.name || '';

        if (name == 'traceur')
          return systemInstantiate.call(this, load);

        var source = load.source;

        // plugins provide empty source
        if (!source)
          return new global.Module({});

        // set load.metadata.format from metaata or format hints in the source
        var format = load.metadata.format;
        if (!format) {
          var formatMatch = load.source.match(formatHintRegEx);
          if (formatMatch)
            format = formatMatch[5];
        }
        var match;

        // alias check is based on a "simple form" only
        // eg import * from 'jquery';
        if ((format == 'es6' || !format) && (match = source.match(aliasRegEx))) {
          return {
            deps: [match[1] || match[2]],
            execute: function(dep) {
              return dep;
            }
          };
        }

        if (format == 'es6' || source.match(es6RegEx)) {
          load.metadata.format = 'es6';
          return systemInstantiate.call(System, load);
        }

        // remove comments to allow for regex format detections if necessary
        if (!format && !isMinified(source))
          source = removeComments(source);

        var _imports = [];

        // AMD
        // define([.., .., ..], ...)
        amdDefineRegEx.lastIndex = 0;
        
        // define(varName); || define(function(require, exports) {}); || define({})
        cjsDefineRegEx.lastIndex = 0;
        var cjsAMD = false;
        if ((format == 'amd' || !format) && (
          (match = cjsDefineRegEx.exec(source)) && (cjsAMD = true) ||
          (match = amdDefineRegEx.exec(source)) && (match[1] || match[2])
        )) {
          if (cjsAMD) {
            _imports = ['require', 'exports', 'module'];

            while (match = cjsRequireRegEx.exec(source))
              _imports.push(match[2] || match[3]);
          }
          else {
            
            if (match[2])
              _imports = _imports.concat(eval(match[2]));
          }

          // remove any reserved words
          var requireIndex, exportsIndex, moduleIndex;

          if ((requireIndex = _imports.indexOf('require')) != -1)
            _imports.splice(requireIndex, 1);
          if ((exportsIndex = _imports.indexOf('exports')) != -1)
            _imports.splice(exportsIndex, 1);
          if ((moduleIndex = _imports.indexOf('module')) != -1)
            _imports.splice(moduleIndex, 1);

          return {
            deps: _imports,
            execute: function() {
              var deps = checkDefaultOnly(arguments);
              var depMap = {};
              for (var i = 0; i < _imports.length; i++)
                depMap[_imports[i]] = deps[i];

              // add system dependencies
              var exports;
              var module;
              var require;

              if (moduleIndex != -1)
                module = { id: name, uri: load.address, config: function() { return {}; } };
              if (exportsIndex != -1)
                exports = {};
              if (requireIndex != -1)
                require = function(names, callback, errback) {
                  if (typeof names == 'string' && names in depMap)
                    return depMap[names];
                  return System.require(names, callback, errback, { name: name, address: load.address });
                }

              if (moduleIndex != -1)
                deps.splice(moduleIndex, 0, module);
              if (exportsIndex != -1)
                deps.splice(exportsIndex, 0, exports);
              if (requireIndex != -1)
                deps.splice(requireIndex, 0, require);

              var output;

              global.require = global.requirejs = System.require;
              global.define = function(dependencies, factory) {
                if (typeof dependencies == 'string') {
                  dependencies = arguments[1];
                  factory = arguments[2];
                }

                // no dependencies
                if (!(dependencies instanceof Array))
                  factory = dependencies;

                // run the factory function
                if (typeof factory == 'function')
                  output = factory.apply(global, deps) || exports;
                // otherwise factory is the value
                else
                  output = factory;
              }
              global.define.amd = {};

              // ensure no NodeJS environment detection
              delete global.module;
              delete global.exports;

              __scopedEval(load.source, global, load.address);

              delete global.define;
              delete global.require;
              delete global.requirejs;

              return new global.Module(output && output.__module ? output : { __defaultOnly: true, 'default': output });
            }
          };
        }
        
        // CommonJS
        // require('...') || exports[''] = ... || exports.asd = ... || module.exports = ...
        cjsExportsRegEx.lastIndex = 0;
        cjsRequireRegEx.lastIndex = 0;
        if (format == 'cjs' || !format && ((match = cjsRequireRegEx.exec(source)) || source.match(cjsExportsRegEx))) {
          if (match)
            _imports.push(match[2] || match[3]);
          while (match = cjsRequireRegEx.exec(source))
            _imports.push(match[2] || match[3]);

          return {
            deps: _imports, // clone the array as we still need it
            execute: function() {
              var depMap = {};
              for (var i = 0; i < _imports.length; i++)
                depMap[_imports[i]] = checkDefaultOnly(arguments[i]);

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

              __scopedEval(load.source, global, load.address);

              delete global._g;

              var output = globals.module.exports;

              return new global.Module(output && output.__module ? output : { __defaultOnly: true, 'default': output });
            }
          };
        }

        // Global
        var globalExport;
        if (format == 'global' && (match = source.match(globalShimRegEx))) {
          _imports = match[2].match(globalImportRegEx);
          if (_imports)
            for (var i = 0; i < _imports.length; i++)
              _imports[i] = _imports[i].substr(8);
          globalExport = match[5];
        }
        return {
          // apply shim config
          deps: _imports,
          execute: function() {
            setGlobal(arguments);
            // ensure local vars are scoped back to the global
            if (globalExport)
              load.source += '\nthis["' + globalExport + '"] = ' + globalExport;
            __scopedEval(load.source, global, load.address);
            return new global.Module(getGlobal(name, globalExport));
          }
        };
      }

      var systemImport = System.import;
      System.import = function(name, options) {
        // normalize name first
        var normalized = System.normalize.call(this, name, null, null);
        return (normalized.then || function(resolve) { return resolve(normalized); })(function(name) {
          return systemImport.call(System, name, options).then(function(module) {
            return checkDefaultOnly(module);
          });
        });
      }

      /*
        AMD & CommonJS-compatible require
        To copy RequireJS, set window.require = window.requirejs = System.require
      */
      System.require = function(names, callback, errback, referer) {
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
          return checkDefaultOnly(System.get(names));

        else
          throw 'Invalid require';
      }

      if (!isBrowser)
        module.exports = System;
    }

    // dynamically polyfill the es6 loader if necessary
    if (!global.System) {
      if (isBrowser) {
        // determine the current script path as the base path
        var scripts = document.getElementsByTagName('script');
        var head = document.getElementsByTagName('head')[0];
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
        global.upgradeSystemLoader();
      }
    }
    else
      global.upgradeSystemLoader();

  })();

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

