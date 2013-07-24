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
      var amdDefineRegEx = /define\s*\(\s*("[^"]+"\s*,|'[^']+'\s*,)?\s*(\[(\s*("[^"]+"|'[^']+')\s*,)*(\s*("[^"]+"|'[^']+'))\])?/;
      var cjsDefineRegEx = /\s+define\s*\(\s*(function\s*|{|[_$a-zA-Z\xA0-\uFFFF][_$a-zA-Z0-9\xA0-\uFFFF]*\))/;
      var cjsRequireRegEx = /\s+require\s*\(\s*("([^"]+)"|'([^']+)')\s*\)/g;
      var cjsExportsRegEx = /\s+exports\s*\[\s*('[^']+'|"[^"]+")\s*\]|exports\s*\.\s*[_$a-zA-Z\xA0-\uFFFF][_$a-zA-Z0-9\xA0-\uFFFF]*|exports\s*\=/;

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
          return name + '!' + pluginName;
        else
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

          plugin.default(options.normalized.substr(0, options.normalized.indexOf('!')), url, jspm.fetch, callback, errback);

        });
      },
      link: function(source, options) {
        source = source || '';
        if (config.onLoad)
          config.onLoad(options.normalized, source, options);

        // check if there is any import syntax.
        if (source.match(importRegEx) || source.match(exportRegEx) || source.match(moduleRegEx))
          return;

        var match;

        // check if this module uses AMD form
        // define([.., .., ..], ...)
        console.log(source.match(amdDefineRegEx));
        if ((match = source.match(amdDefineRegEx)) && (match[2] || match[1])) {
          var _imports = match[2] || '[]';
          // just eval to get the array.. we know it is an array.
          eval('_imports = ' + _imports);
          
          var requireIndex, exportsIndex, moduleIndex;
          if ((requireIndex = _imports.indexOf('require')) != -1)
            _imports.splice(requireIndex, 1);
          if ((exportsIndex = _imports.indexOf('exports')) != -1)
            _imports.splice(exportsIndex, 1);
          if ((moduleIndex = _imports.indexOf('module')) != -1)
            _imports.splice(moduleIndex, 1);

          return {
            imports: _imports.concat([]),
            execute: function() {
              var deps = arguments;
              for (var i = 0; i < deps.length; i++)
                deps[i] = deps[i]['default'] || deps[i];

              var depMap = {};
              for (var i = 0; i < _imports.length; i++)
                depMap[_imports[i]] = arguments[i];

              if (moduleIndex != -1) {
                depMap.module = { id: options.normalized, uri: options.address };
                Array.prototype.splice.call(deps, moduleIndex, 0, depMap.module);
              }
              if (exportsIndex != -1) {
                depMap.exports = {};
                Array.prototype.splice.call(deps, exportsIndex, 0, depMap.exports);
              }
              if (requireIndex != -1) {
                depMap.require = function(d) { return depMap[d]; }
                Array.prototype.splice.call(deps, requireIndex, 0, depMap.require);
              }

              var output;
              var define = function(_deps, factory) {
                if (typeof _deps == 'string') {
                  _deps = factory;
                  factory = arguments[2];
                }
                if (!(_deps instanceof Array)) {
                  factory = _deps;
                }
                output = factory.apply(window, deps);
              }
              define.amd = true;
              var require = function(deps, callback, errback) {
                jspm.import(deps, function() {
                  var out = [];
                  for (var i = 0; i < arguments.length; i++)
                    out.push(arguments[i].default);
                  callback.apply(null, out);
                }, errback);
              }
              eval(source + (options.address ? '\n//# sourceURL=' + options.address : ''));

              return new Module({ 'default': output || depMap.exports, 'type': 'AMD' });
            }
          };
        }

        // check if it uses the AMD CommonJS form
        // define(varName); || define(function() {}); || define({})
        if (source.match(cjsDefineRegEx)) {
          var _imports = [];
          var match;
          while (match = cjsRequireRegEx.exec(source))
            _imports.push(match[2] || match[3]);

          return {
            imports: _imports.concat([]),
            execute: function() {
              var depMap = {};
              var module = false;
              for (var i = 0; i < _imports.length; i++) {
                depMap[_imports[i]] = arguments[i]['default'] || arguments[i];
                if (_imports[i] == 'module')
                  module = true;
              }
              if (module)
                depMap.module = { id: options.normalized, uri: options.address };
              var output;
              var exports = {};
              var module = {};
              depMap.exports = exports;
              var define = function(factory) { 
                output = typeof factory == "function" ? factory.call(window, function(d) { 
                  return depMap[d]; 
                }, exports) : factory; 
              };
              define.amd = true;
              var require = function(deps, callback, errback) {
                jspm.import(deps, function() {
                  var out = [];
                  for (var i = 0; i < arguments.length; i++)
                    out.push(arguments[i].default);
                  callback.apply(null, out);
                }, errback);
              }
              eval(source + (options.address ? '\n//# sourceURL=' + options.address : ''));
              return new Module({ 'default': output || module.exports || exports, type: 'AMD' });
            }
          };
        }
        
        // CommonJS
        // require('...') || exports[''] = ... || exports.asd = ... || module.exports = ...
        if (source.match(cjsExportsRegEx) || source.match(cjsRequireRegEx)) {
          var _imports = [];
          var match;
          while (match = cjsRequireRegEx.exec(source))
            _imports.push(match[2] || match[3]);
          return {
            imports: _imports.concat([]), // clone the array as we still need it
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
              return new Module({ 'default': global.module.exports, 'type': 'CommonJS' });
            }
          };
        }

        return {
          // apply shim config
          imports: config.shim[options.normalized] || [],
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

    jspm.baseURL = config.baseURL;

    // ondemand functionality
    jspm.ondemandTable = {};
    jspm.ondemand = System.ondemand;

    jspm._config = config;
    jspm.config = function(newConfig) {
      extend(config, newConfig);

      if (newConfig.baseURL)
        jspm.baseURL = newConfig.baseURL;
    }
    jspm.ondemand = function(resolvers) {
      jspm.ondemand(resolvers);
    }

    // add convenience locations
    jspm.config({
      locations: {
        github: 'https://github.jspm.io',
        npm: 'https://npm.jspm.io',
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
