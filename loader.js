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

    var startConfig = window.jspm || {};

    var config = {};
    config.waitSeconds = 20;
    config.map = config.map || {};
    config.locations = config.locations || {};
    config.shim = config.shim || {};

    window.createLoader = function() {
      delete window.createLoader;

      config.baseURL = config.baseURL || document.URL.substring(0, window.location.href.lastIndexOf('\/') + 1);
      config.locations.plugin = config.locations.plugin || config.baseURL;

      // -- helpers --

        // es6 module regexs to check if it is a module or a global script
        var importRegEx = /^\s*import\s+./m;
        var exportRegEx = /^\s*export\s+(\{|\*|var|class|function|default)/m;
        var moduleRegEx = /^\s*module\s+("[^"]+"|'[^']+')\s*\{/m;

        // AMD and CommonJS regexs for support
        var amdDefineRegEx = /^\s*define\s*\(\s*("[^"]+"\s*,|'[^']+'\s*,)?\s*(\[(\s*("[^"]+"|'[^']+')\s*,)*(\s*("[^"]+"|'[^']+'))\])?/m;
        var cjsDefineRegEx = /^\s*define\s*\(\s*(function\s*|{|[_$a-zA-Z\xA0-\uFFFF][_$a-zA-Z0-9\xA0-\uFFFF]*\))/m;
        var cjsRequireRegEx = /\s*require\s*\(\s*("([^"]+)"|'([^']+)')\s*\)/gm;
        var cjsExportsRegEx = /\s*exports\s*\[\s*('[^']+'|"[^"]+")\s*\]|\exports\s*\.\s*[_$a-zA-Z\xA0-\uFFFF][_$a-zA-Z0-9\xA0-\uFFFF]*|exports\s*\=/m;

        // regex to check absolute urls
        var absUrlRegEx = /^\/|([^\:\/]*:\/\/)/;

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

          for (var g in jspm.global) {
            if (jspm.global.hasOwnProperty(g) && g != 'window' && globalObj[g] != jspm.global[g])
              moduleGlobal[g] = jspm.global[g];
          }
          return moduleGlobal;
        }

        var pluginRegEx = /(\.[^\/\.]+)?!(.+)/;

        var nodeProcess = {
          nextTick: function(f) {
            setTimeout(f, 7);
          }
        };



      // -- /helpers --

      window.jspm = new Loader({
        normalize: function(name, referer) {
          // allow inline shim configuration
          var inlineShim;
          if (name.indexOf('|') != -1) {
            var inlineShim = name.split('|');
            name = inlineShim.splice(0, 1)[0].trim();
            inlineShim = inlineShim[0].trim();
          }

          var parentName = referer && referer.name;

          // if it has a js extension, and not a url or plugin, remove the js extension
          if (!pluginMatch && name.substr(name.length - 3, 3) == '.js' && !name.match(absUrlRegEx))
            name = name.substr(0, name.length - 3);

          // check for a plugin (some/name!plugin)
          var pluginMatch = name.match(pluginRegEx);

          // if a plugin, remove the plugin part to do normalization
          // if the extension matches the plugin name, remove the resource extension as well
          var pluginName;
          if (pluginMatch) {
            pluginName = pluginMatch[2];
            if (pluginMatch[1] && pluginMatch[1] == '.' + pluginName)
              name = name.substr(0, name.length - pluginMatch[1].length - pluginName.length - 1);
            else
              name = name.substr(0, name.length - pluginName.length - 1);
          }

          // do standard normalization (resolve relative module name)
          name = System.normalize(name, referer);

          // do map config
          name = applyMap(name, parentName);

          // allow for '/' package main referencing
          // 'some-package@0.0.1/' -> 'some-package@0.0.1/some-package'
          if (name.substr(name.length - 1, 1) == '/') {
            var parts = name.indexOf(':') != -1 ? name.substr(name.indexOf(':') + 1).split('/') : name.split('/');
            var lastPart = parts[parts.length - 2];
            var lastPartName = lastPart.split('@')[0];
            name = name + lastPartName;
          }

          if (pluginName)
            name = name + '!' + pluginName;

          // apply inline shim configuration
          if (inlineShim) {
            // normalize inline shim
            for (var i = 0; i < inlineShim.length; i++)
              inlineShim[i] = jspm.normalize(inlineShim[i], { name: name });
            
            var sConfig = {};
            sConfig[name] = [inlineShim];

            jspm.config({ shim: sConfig });
          }

          return name;
        },
        resolve: function(name, options) {
          var pluginMatch = name.match(pluginRegEx);
          if (pluginMatch) {
            // remove plugin part
            name = name.substr(0, name.length - pluginMatch[2].length - 1);
            // add extension as plugin name if not present
            if (name.split('/').pop().split('.').length == 1)
              name += '.' + pluginMatch[2];
          }

          // ondemand
          for (var r in this.ondemandTable)
            if (this.ondemandTable[r].indexOf(name) != -1)
              return name;

          if (name.match(absUrlRegEx))
            return name;

          // locations
          var location = getLocation(name);
          if (location)
            name = config.locations[location] + (config.locations[location].substr(config.locations[location].length - 1, 1) != '/' ? '/' : '') + name.substring(location.length + 1);
          else
            name = this.baseURL + (this.baseURL.substr(this.baseURL.length - 1, 1) != '/' ? '/' : '') + name;

          // js extension
          if (!pluginMatch && name.substr(name.length - 3, 3) != '.js')
            name += '.js';

          return name;
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
            System.fetch(url, function(source) {
              if (!rejected)
                callback(source);
            }, errback, options);
            return;
          }

          // for plugins, we first need to load the plugin module itself
          var pluginName = pluginMatch[2];
          jspm.import('plugin/' + pluginName, function(plugin) {

            plugin(options.normalized.substr(0, options.normalized.indexOf('!')), url, jspm.fetch, callback, errback);

          });
        },
        link: function(source, options) {
          source = source || '';
          if (config.onLoad)
            config.onLoad(options.normalized, source, options);

          if (source.match(importRegEx) || source.match(exportRegEx) || source.match(moduleRegEx))
            return;

          var match;

          // shim config
          var _imports = config.shim[options.normalized] ? [].concat(config.shim[options.normalized]) : [];

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
                    output = factory.apply(window, deps);
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

                return new Module({ 'default': output || exports });
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

                return new Module({ 'default': output || exports });
              }
            };
          }
          
          // CommonJS
          // require('...') || exports[''] = ... || exports.asd = ... || module.exports = ...
          if (source.match(cjsExportsRegEx) || source.match(cjsRequireRegEx)) {
            // NB replace the require statements with the normalized dependency requires
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
                var global = {
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
                var process = global.process;
                var require = global.require;
                var __filename = global.__filename;
                var __dirname = global.__dirname;
                var module = global.module;
                var exports = global.exports;
                eval(source + (options.address ? '\n//# sourceURL=' + options.address : ''));
                return new Module({ 'default': global.module.exports });
              }
            };
          }

          return {
            // apply shim config
            imports: _imports,
            execute: function(deps) {
              if (source == '')
                return new Module({});
              setGlobal(deps);
              jspm.eval(source);
              return new Module(getGlobal());
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
      jspm.ondemand = System.ondemand;

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
          return jspm.get(jspm.normalize(names, referer));

        else
          throw 'Invalid require';
      }
      jspm.require.config = jspm.config;

      // add convenience locations
      jspm.config({
        locations: {
          github: 'https://github.jspm.io',
          npm: 'https://npm.jspm.io',
          jspm: 'https://github.jspm.io/jspm/registry@master'
        },
        map: {
          plugin: 'github:jspm/plugins'
        }
      });

      // add initial config
      jspm.config(startConfig);
    }

    // dynamically polyfill the es6 loader if necessary
    if (!window.Loader) {
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
    else
      createLoader();

  })();

  // carefully scoped eval with given global
  var scopedEval = function(source, global, sourceURL) {
    eval('(function(window) { with(global) { ' + source + ' } }).call(global, global);' +  (sourceURL ? '\n//# sourceURL=' + sourceURL : ''));
  }

})();
