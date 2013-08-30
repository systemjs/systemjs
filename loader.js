/*
 * ES6 RequireJS-style module loader
 *
 * Supports RequireJS-inspired map, packages and plugins.
 *
 * https://github.com/jspm/jspm-loader
 * 
 * MIT
 *
 */
(function() {

  (function() {

    var isBrowser = typeof window != 'undefined';
    var global = isBrowser ? window : {};

    var startConfig = global.jspm || {};

    var config = {};
    config.waitSeconds = 20;
    config.map = config.map || {};
    config.locations = config.locations || {};
    config.depends = config.depends || {};

    global.createLoader = function() {
      delete global.createLoader;

      config.baseURL = config.baseURL || isBrowser ? document.URL.substring(0, window.location.href.lastIndexOf('\/') + 1) : './';
      config.locations.plugin = config.locations.plugin || config.baseURL;

      // -- helpers --

        // es6 module regexs to check if it is a module or a global script
        var importRegEx = /^\s*import\s+./m;
        var exportRegEx = /^\s*export\s+(\{|\*|var|class|function|default)/m;
        var moduleRegEx = /^\s*module\s+("[^"]+"|'[^']+')\s*\{/m;

        // AMD and CommonJS regexs for support
        var amdDefineRegEx = /^\s*define\s*\(\s*("[^"]+"\s*,|'[^']+'\s*,)?\s*(\[(\s*("[^"]+"|'[^']+')\s*,)*(\s*("[^"]+"|'[^']+')\s*)?\])?/m;
        var cjsDefineRegEx = /^\s*define\s*\(\s*(function\s*|{|[_$a-zA-Z\xA0-\uFFFF][_$a-zA-Z0-9\xA0-\uFFFF]*\))/m;
        var cjsRequireRegEx = /\s*require\s*\(\s*("([^"]+)"|'([^']+)')\s*\)/gm;
        var cjsExportsRegEx = /\s*exports\s*\[\s*('[^']+'|"[^"]+")\s*\]|\exports\s*\.\s*[_$a-zA-Z\xA0-\uFFFF][_$a-zA-Z0-9\xA0-\uFFFF]*|exports\s*\=/m;

        // regex to check absolute urls
        var absUrlRegEx = /^\/|([^\:\/]*:\/\/)/;

        // function to remove the comments from a string
        function removeComments(str) {
          // output
          var curOutIndex = 0,
            outString = '';

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
                curOutIndex = i + 1;
                lineComment = false;
              }
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
              if (curChar === '/'  && (lastChar !== '\\' || doubleBackslash)) {
                regex = doubleBackslash = false;
                i++;
                lastToken = lastChar = curChar;
                curChar = str.charAt(i);
              }
            }

            else if (blockComment) {
              if (curChar === '/' && lastChar === '*') {
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
                outString += str.substring(curOutIndex, i - 1);
                i++;
                lastChar = curChar;
                curChar = str.charAt(i);
              }
              else if (curChar === '/') {
                lineComment = true;
                outString += str.substring(curOutIndex, i - 1);
              }
              else if (lastToken !== '}' && lastToken !== ')' && lastToken !== ']' && !lastToken.match(/\w|\d|'|"|\-|\+/)) {
                // exceptions not currently handled:
                // if (x) /foo/.exec('bar')
                // a++ /foo/.abc
                regex = true;
              }
            }
          }
          return outString + str.substr(curOutIndex);
        }

        // configuration object extension
        // objects extend, everything else replaces
        var extend = function(objA, objB) {
          for (var p in objB) {
            if (typeof objA[p] == 'object' && !(objA[p] instanceof Array))
              extend(objA[p], objB[p])
            else
              objA[p] = objB[p];
          }
        }

        // check if a module name starts with a given prefix
        // the key check is not to match the prefix 'jquery'
        // to the module name jquery-ui/some/thing, and only
        // to jquery/some/thing or jquery:some/thing
        // (multiple ':'s is a module name error)
        var prefixMatch = function(name, prefix) {
          var prefixParts = prefix.split(/[\/:]/);
          var nameParts = name.split(/[\/:]/);
          if (prefixParts.length > nameParts.length)
            return false;
          for (var i = 0; i < prefixParts.length; i++)
            if (nameParts[i] != prefixParts[i])
              return false;
          return true;
        }

        // check if the module is defined on a location
        var getLocation = function(name) {
          var locationParts = name.split(':');

          return locationParts[1] !== undefined && !name.match(absUrlRegEx) ? locationParts[0] : '';
        }

        // given a resolved module name and normalized parent name,
        // apply the map configuration
        var applyMap = function(name, parentName) {
          parentName = parentName || '';
          
          var location = getLocation(name);
          var parentLocation = getLocation(parentName);

          // if there is a parent location, and there is no location, add it here
          if (parentLocation && !location)
            name = parentLocation + ':' + name;

          // check for most specific map config
          var parentPrefixMatch = ''; // the matching parent refix
          var mapPrefixMatch = ''; // the matching map prefix
          var mapMatch = ''; // the matching map value

          for (var p in config.map) {
            var curMap = config.map[p];
            // do the global map check
            if (p == '*')
              continue;
            if (typeof curMap == 'string') {
              if (!prefixMatch(name, p))
                continue;
              if (p.length <= mapPrefixMatch.length)
                continue;
              mapPrefixMatch = p;
              mapMatch = curMap;
            }

            if (!prefixMatch(parentName, p))
              continue;

            // now check if this matches our current name
            for (var _p in curMap) {
              if (!prefixMatch(name, _p))
                continue;

              // the most specific mapPrefix wins first
              if (_p.length < mapPrefixMatch.length)
                continue;

              // then the most specific prefixMatch on the parent name
              if (_p.length == mapPrefixMatch.length && p.length < parentPrefixMatch.length)
                continue;

              parentPrefixMatch = p;
              mapPrefixMatch = _p;
              mapMatch = curMap[_p];
            }
          }
          // now compare against the global map config
          for (var _p in config.map['*'] || {}) {
            if (!prefixMatch(name, _p))
              continue;
            if (_p.length <= mapPrefixMatch.length)
              continue;
            mapPrefixMatch = _p;
            mapMatch = config.map['*'][_p];
          }
          // apply map config
          if (mapPrefixMatch)
            name = mapMatch + name.substr(mapPrefixMatch.length);

          return name;
        }

        // given a module's global dependencies, prepare the global object
        // to contain the union of the defined properties of its dependent modules
        var globalObj = {};
        function setGlobal(deps) {
          // first, we add all the dependency module properties to the global
          if (deps) {
            for (var i = 0; i < deps.length; i++) {
              var dep = deps[i];
              for (var m in dep)
                jspm.global[m] = dep[m];
            }
          }

          // now we store a complete copy of the global object
          // in order to detect changes
          for (var g in jspm.global) {
            if (jspm.global.hasOwnProperty(g))
              globalObj[g] = jspm.global[g];
          }
        }

        // go through the global object to find any changes
        // the differences become the returned global for this object
        // the global object is left as is
        function getGlobal() {
          var moduleGlobal = {};
          var firstGlobalName;
          var globalCnt = 0;
          for (var g in jspm.global) {
            if (jspm.global.hasOwnProperty(g) && g != (isBrowser ? 'window' : 'global') && globalObj[g] != jspm.global[g]) {
              moduleGlobal[g] = jspm.global[g];
              firstGlobalName = firstGlobalName || g;
              globalCnt++;
            }
          }
          
          // for a single global, return directly
          if (globalCnt == 1)
            return moduleGlobal[firstGlobalName];
          else
            return moduleGlobal;
        }

        var pluginRegEx = /(\.[^\/\.]+)?!(.*)/;

        var nodeProcess = {
          nextTick: function(f) {
            setTimeout(f, 7);
          }
        };



      // -- /helpers --

      var jspm = global.jspm = new global.Loader({
        global: global,
        normalize: function(name, referer) {
          name = name.trim();

          // allow inline depends configuration
          var inlineShim;
          if (name.indexOf('|') != -1) {
            var inlineShim = name.split('|');
            name = inlineShim.splice(0, 1)[0].trim();
          }

          var parentName = referer && referer.name;

          // if it has a js extension, and not a url or plugin, remove the js extension
          if (!pluginMatch && name.substr(name.length - 3, 3) == '.js' && !name.match(absUrlRegEx))
            name = name.substr(0, name.length - 3);

          // check for a plugin (some/name!plugin)
          var pluginMatch = name.match(pluginRegEx);

          // if a plugin, remove the plugin part to do normalization
          var pluginName;
          if (pluginMatch) {
            pluginName = pluginMatch[2] || pluginMatch[1].substr(1);
            name = name.substr(0, name.length - pluginMatch[2].length - 1);
          }

          if (name.substr(0, 1) != '#') {

            // treat an initial '/' as location relative
            if (name.substr(0, 1) == '/')
              name = name.substr(1);

            // do standard normalization (resolve relative module name)
            name = global.System.normalize(name, referer);

            // do map config
            name = applyMap(name, parentName);

          }

          if (pluginName)
            name = name + '!' + pluginName;

          // apply inline depends configuration
          if (inlineShim) {
            // normalize inline depends
            for (var i = 0; i < inlineShim.length; i++)
              inlineShim[i] = jspm.normalize(inlineShim[i], { name: name });
            
            var sConfig = {};
            sConfig[name] = inlineShim;

            jspm.config({ depends: sConfig });
          }
          
          return name;
        },
        resolve: function(name, options) {
          var pluginMatch = name.match(pluginRegEx);
          // remove plugin part
          if (pluginMatch)
            name = name.substr(0, name.length - pluginMatch[2].length - 1);

          // ondemand
          for (var r in this.ondemandTable)
            if (this.ondemandTable[r].indexOf(name) != -1)
              return name;

          if (name.match(absUrlRegEx))
            return name;

          // locations
          var oldBaseURL = this.baseURL;

          var location = getLocation(name);
          if (location) {
            this.baseURL = config.locations[location];
            name = name.substr(location.length + 1);
          }

          var address = global.System.resolve.call(this, name, options);

          // remove js extension added if a plugin
          if (pluginMatch)
            address = address.substr(0, address.length - 3);

          this.baseURL = oldBaseURL;

          if (location)
            return address;
          else
            // cache bust local
            return address;// + '?' + (new Date()).getTime();
        },
        fetch: function(url, callback, errback, options) {
          options = options || {};
          var pluginMatch = (options.normalized || '').match(pluginRegEx);

          if (!pluginMatch) {
            // do a fetch with a timeout
            var rejected = false;
            if (config.waitSeconds) {
              var waitTime = 0;
              setTimeout(function() {
                waitTime++;
                if (waitTime >= config.waitSeconds) {
                  rejected = true;
                  errback();
                }
              }, 1000);
            }
            global.System.fetch(url, function(source) {
              if (!rejected)
                callback(source);
            }, errback, options);
            return;
          }

          // for plugins, we first need to load the plugin module itself
          var pluginName = pluginMatch[2];
          jspm.import('plugin:' + pluginName, function(plugin) {

            plugin(options.normalized.substr(0, options.normalized.indexOf('!')), url, jspm.fetch, callback, errback);

          });
        },
        link: function(source, options) {
          source = source || '';
          if (config.onLoad)
            config.onLoad(options.normalized, source, options);

          if (source.match(importRegEx) || source.match(exportRegEx) || source.match(moduleRegEx))
            return;

          // remove comments before doing regular expressions
          source = removeComments(source);

          var match;

          // depends config
          var _imports = config.depends[options.normalized] ? [].concat(config.depends[options.normalized]) : [];

          // check if this module uses AMD form
          // define([.., .., ..], ...)
          // define('modulename', [.., ..., ..])
          if ((match = source.match(amdDefineRegEx)) && (match[2] || match[1])) {
            
            _imports = _imports.concat(eval(match[2] || '[]'));

            // remove any reserved words
            var requireIndex, exportsIndex, moduleIndex;

            if ((requireIndex = _imports.indexOf('require')) != -1)
              _imports.splice(requireIndex, 1);
            if ((exportsIndex = _imports.indexOf('exports')) != -1)
              _imports.splice(exportsIndex, 1);
            if ((moduleIndex = _imports.indexOf('module')) != -1)
              _imports.splice(moduleIndex, 1);

            return {
              imports: _imports,
              execute: function() {
                var deps = Array.prototype.splice.call(arguments, 0);

                // add system dependencies
                var exports;

                if (moduleIndex != -1)
                  deps.splice(moduleIndex, 0, { id: options.normalized, uri: options.address });
                if (exportsIndex != -1)
                  deps.splice(exportsIndex, 0, exports = {});
                if (requireIndex != -1)
                  deps.splice(requireIndex, 0, function(names, callback, errback) {
                    if (typeof names == 'object' && !(names instanceof Array))
                      return require.apply(null, Array.prototype.splice.call(arguments, 1));

                    return jspm.require(names, callback, errback, { name: options.normalized, address: options.address });
                  });

                var output;

                jspm.global.require = jspm.global.requirejs = jspm.require;
                jspm.global.define = function(name, dependencies, factory) {
                  // anonymous define
                  if (typeof name != 'string') {
                    factory = dependencies;
                    name = undefined;
                  }
                  // no dependencies
                  if (!(dependencies instanceof Array))
                    factory = dependencies;

                  // run the factory function
                  if (typeof factory == 'function')
                    output = factory.apply(jspm.global, deps);
                  // otherwise factory is the value
                  else
                    output = factory;
                  
                  if (name && name != options.normalized)
                      jspm.set(name, { default: output });
                }
                jspm.global.define.amd = {};

                scopedEval(source, jspm.global, options.address);

                delete jspm.global.define;
                delete jspm.global.require;
                delete jspm.global.requirejs;

                return new global.Module({ 'default': output || exports });
              }
            };
          }

          // check if it uses the AMD CommonJS form
          // define(varName); || define(function() {}); || define({})
          if (source.match(cjsDefineRegEx)) {
            var match;
            while (match = cjsRequireRegEx.exec(source))
              _imports.push(match[2] || match[3]);

            return {
              imports: _imports,
              execute: function() {
                var depMap = {};
                for (var i = 0; i < _imports.length; i++)
                  depMap[_imports[i]] = arguments[i]['default'] || arguments[i];
                
                var exports = {};
                var module = { id: options.normalized, uri: options.address };

                jspm.global.require = jspm.global.requirejs = jspm.require;

                var output;

                jspm.global.define = function(factory) { 
                  output = typeof factory == "function" ? factory.call(jspm.global, function(d) { 
                    return depMap[d]; 
                  }, exports) : factory; 
                };
                jspm.global.define.amd = {};

                scopedEval(source, jspm.global, options.address);

                delete jspm.global.require;
                delete jspm.global.requirejs;
                delete jspm.global.define;

                return new global.Module({ 'default': output || exports });
              }
            };
          }
          
          // CommonJS
          // require('...') || exports[''] = ... || exports.asd = ... || module.exports = ...
          if (source.match(cjsExportsRegEx) || source.match(cjsRequireRegEx)) {
            var match;
            while (match = cjsRequireRegEx.exec(source))
              _imports.push(match[2] || match[3]);

            return {
              imports: _imports, // clone the array as we still need it
              execute: function(deps) {
                var depMap = {};
                for (var i = 0; i < _imports.length; i++)
                  depMap[_imports[i]] = arguments[i]['default'] || arguments[i];
                var exports = {};
                var dirname = options.address.split('/');
                dirname.pop();
                dirname = dirname.join('/');
                var _global = {
                  process: nodeProcess,
                  console: console,
                  require: function(d) {
                    return depMap[d]
                  },
                  __filename: options.address,
                  __dirname: dirname,
                  module: { exports: exports },
                  exports: exports
                };
                var process = _global.process;
                var require = _global.require;
                var __filename = _global.__filename;
                var __dirname = _global.__dirname;
                var module = _global.module;
                var exports = _global.exports;
                eval(source + (options.address ? '\n//# sourceURL=' + options.address : ''));
                return new global.Module({ 'default': _global.module.exports });
              }
            };
          }

          // global script
          return {
            // apply depends config
            imports: _imports,
            execute: function(deps) {
              if (source == '')
                return new global.Module({});
              setGlobal(deps);
              scopedEval(source, jspm.global, options.address);
              return new global.Module(getGlobal());
            }
          };
        }
      });

      var _import = jspm.import;
      jspm.import = function(name, callback, errback, referer) {
        _import.call(jspm, name, function() {          
          var newArgs = [];
          for (var i = 0; i < arguments.length; i++) {
            var isDefaultOnly = true;
            for (var q in arguments[i])
              if (arguments[i].hasOwnProperty(q)) {
                if (q != 'default') {
                  isDefaultOnly = false;
                  break;
                }
              }
            if (isDefaultOnly && arguments[i] && arguments[i].default)
              newArgs[i] = arguments[i].default;
            else
              newArgs[i] = arguments[i];
          }
          if (callback)
            callback.apply(null, newArgs);
        }, errback, referer);
      }

      jspm.baseURL = config.baseURL;

      // ondemand functionality
      jspm.ondemandTable = {};
      jspm.ondemand = global.System.ondemand;

      jspm._config = config;
      jspm.config = function(newConfig) {
        if (newConfig.paths)
          extend(newConfig.map = newConfig.map || {}, newConfig.paths);
        
        if (newConfig.packages)
          throw 'Package configuration not support';

        extend(config, newConfig);

        if (newConfig.baseURL)
          jspm.baseURL = newConfig.baseURL;
        if (newConfig.baseUrl)
          jspm.baseURL = newConfig.baseUrl;
      }
      jspm.ondemand = function(resolvers) {
        jspm.ondemand(resolvers);
      }

      /*
        AMD & CommonJS-compatible require
        To copy RequireJS, set window.require = window.requirejs = jspm.require
      */
      jspm.require = function(names, callback, errback, referer) {
        // in amd, first arg can be a config object
        if (typeof names == 'object' && !(names instanceof Array)) {
          jspm.config(names);
          return jspm.require.apply(null, Array.prototype.splice.call(arguments, 1));
        }

        if (typeof callback == 'object') {
          referer = callback;
          callback = undefined;
        }
        else if (typeof errback == 'object') {
          referer = errback;
          errback = undefined;
        }

        // amd require
        if (names instanceof Array)
          return jspm.import(names, callback, errback, referer);
        
        // commonjs require
        else if (typeof names == 'string')
          return jspm.get(names);

        else
          throw 'Invalid require';
      }
      jspm.require.config = jspm.config;

      // add convenience locations
      jspm.config({
        locations: {
          github: 'https://github.jspm.io',
          npm: 'https://npm.jspm.io',
          cdnjs: 'https://cdnjs.cloudflare.com/ajax/libs',
          jspm: 'https://registry.jspm.io',
          plugin: 'https://github.jspm.io/jspm/plugins@0.0.6'
        }
      });

      // add initial config
      jspm.config(startConfig);

      if (!isBrowser)
        module.exports = jspm;
    }

    // dynamically polyfill the es6 loader if necessary
    if (!global.Loader) {
      if (isBrowser) {
        // determine the current script path as the base path
        var scripts = document.getElementsByTagName('script');
        var head = document.getElementsByTagName('head')[0];
        var curPath = scripts[scripts.length - 1].src;
        var basePath = curPath.substr(0, curPath.lastIndexOf('/') + 1);
        document.write(
          '<' + 'script type="text/javascript" src="' + basePath + 'es6-module-loader.js">' + '<' + '/script>' +
          '<' + 'script type="text/javascript">' + 'createLoader();' + '<' + '/script>'
        );
      }
      else {
        var es6ModuleLoader = require('es6-module-loader');
        global.System = es6ModuleLoader.System;
        global.Loader = es6ModuleLoader.Loader;
        global.Module = es6ModuleLoader.Module;
        global.createLoader();
      }
    }
    else
      createLoader();

  })();

  // carefully scoped eval with given global
  var scopedEval = function(source, global, sourceURL) {
    eval('(function(global) { with(global) { ' + source + ' } }).call(global, global);' +  (sourceURL ? '\n//# sourceURL=' + sourceURL : ''));
  }

})();
