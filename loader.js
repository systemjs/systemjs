/*
 * JSPM Loader
 * https://jspm.io
 * 
 * Copyright (c) 2013 Guy Bedford
 * MIT License
 */
(function() {

  (function() {

    var isBrowser = typeof window != 'undefined';
    var global = isBrowser ? window : {};

    var startConfig = global.jspm || {};

    var config = {};
    config.waitSeconds = 20;
    config.map = config.map || {};
    config.main = config.main || {};
    config.endpoints = config.endpoints || {};
    config.shim = config.shim || {};
    config.urlArgs = config.urlArgs || '';

    global.createLoader = function() {
      delete global.createLoader;

      config.baseURL = config.baseURL || isBrowser ? document.URL.substring(0, window.location.href.lastIndexOf('\/') + 1) : './';
      config.registryURL = 'https://registry.jspm.io';

      // -- helpers --

        // es6 module regexs to check if it is a module or a global script
        var importRegEx = /(?:^\s*|[}{\(\);,\n]\s*)import\s+./;
        var exportRegEx = /(?:^\s*|[}{\(\);,\n]\s*)export\s+(\{|\*|var|class|function|default)/;
        var moduleRegEx = /(?:^\s*|[}{\(\);,\n]\s*)module\s+("[^"]+"|'[^']+')\s*\{/;

        // es6 module forwarding - allow detecting without Esprima
        var aliasRegEx = /^\s*export\s*\*\s*from\s*(?:'([^']+)'|"([^"]+)")/;

        // AMD and CommonJS regexs for support
        var amdDefineRegEx = /(?:^\s*|[}{\(\);,\n\?\&]\s*)define\s*\(\s*("[^"]+"\s*,|'[^']+'\s*,\s*)?(\[(\s*("[^"]+"|'[^']+')\s*,)*(\s*("[^"]+"|'[^']+')\s*)?\])?/g;
        var cjsDefineRegEx = /(?:^\s*|[}{\(\);,\n\?\&]\s*)define\s*\(\s*(("[^"]+"\s*,|'[^']+'\s*,)?("[^"]+"\s*,|'[^']+'\s*,)?function\s*|{|[_$a-zA-Z\xA0-\uFFFF][_$a-zA-Z0-9\xA0-\uFFFF]*\))/g;
        var cjsRequireRegEx = /(?:^\s*|[}{\(\);,\n=:\?\&]\s*)require\s*\(\s*("([^"]+)"|'([^']+)')\s*\)/g;
        var cjsExportsRegEx = /(?:^\s*|[}{\(\);,\n=:\?\&]\s*|module\.)(exports\s*\[\s*('[^']+'|"[^"]+")\s*\]|\exports\s*\.\s*[_$a-zA-Z\xA0-\uFFFF][_$a-zA-Z0-9\xA0-\uFFFF]*|exports\s*\=)/;

        // global dependency specifier, used for shimmed dependencies
        var globalShimRegEx = /(["']global["'];\s*)((['"]import [^'"]+['"];\s*)*)(['"]export ([^'"]+)["'])?/;
        var globalImportRegEx = /(["']import [^'"]+)+/g;
        
        // default switch - disable auto-default
        var transpileRegEx = /["']es6-transpile['"];/;

        var sourceMappingURLRegEx = /\/\/[@#] ?sourceMappingURL=(.+)/;
        var sourceURLRegEx = /\/\/[@#] ?sourceURL=(.+)/;

        // regex to check absolute urls
        var absUrlRegEx = /^\/|([^\:\/]*:\/\/)/;

        // determine if the source is minified - don't remove comments in this case
        function isMinified(str) {
          var newlines = str.match(/\n/g);
          return str.length / (newlines && newlines.length || 1) > 100;
        }

        // function to remove the comments from a string
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

        // check if the module is defined on an endpoint
        var getEndpoint = function(name) {
          var endpointParts = name.split(':');

          return endpointParts[1] !== undefined && !name.match(absUrlRegEx) ? endpointParts[0] : '';
        }

        // given a resolved module name and normalized parent name,
        // apply the map configuration
        var applyMap = function(name, parentName) {
          parentName = parentName || '';
          
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
          
          // apply main config
          if (config.main[name])
            name = name + '/' + config.main[name];

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
        // optional propertyName of the form 'some.object.here'
        function getGlobal(propertyName) {
          var singleGlobal, moduleGlobal;
          if (propertyName)
            singleGlobal = eval(propertyName);
          else {
            moduleGlobal = {};
            for (var g in jspm.global) {
              if (jspm.global.hasOwnProperty(g) && g != (isBrowser ? 'window' : 'global') && globalObj[g] != jspm.global[g]) {
                moduleGlobal[g] = jspm.global[g];
                if (singleGlobal) {
                  if (singleGlobal !== jspm.global[g])
                    singleGlobal = false;
                }
                else if (singleGlobal !== false)
                  singleGlobal = jspm.global[g];
              }
            }
          }
          
          // make the module the first found global
          return singleGlobal ? { default: singleGlobal } : moduleGlobal;
        }

        var pluginRegEx = /(\.[^\/\.]+|.)!(.*)/;

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

          var parentName = referer && referer.name;

          // check for a plugin (some/name!plugin)
          var pluginMatch = name.match(pluginRegEx);

          // if a plugin, remove the plugin part to do normalization
          var pluginName;
          if (pluginMatch) {
            pluginName = pluginMatch[2] || pluginMatch[1].substr(1);
            name = name.substr(0, name.length - pluginMatch[2].length - 1);
          }

          // module names starting with '#' are never normalized
          // useful for plugins where the import doesn't represent a real path
          if (name.substr(0, 1) != '#') {

            // endpoint relative normalization
            if (name.substr(0, 2) == './' && referer && referer.name && referer.name.indexOf(':') != -1 && referer.name.indexOf('/') == -1)
              name = referer.name.substr(0, referer.name.indexOf(':') + 1) + name.substr(2);

            // do standard normalization (resolve relative module name)
            else
              name = global.System.normalize(name, referer);

            // check endpoint config if given
            if (name.indexOf(':') != -1) {
              var endpoint = config.endpoints[name.substr(0, name.indexOf(':'))];
              if (typeof endpoint == 'object' && endpoint.normalize)
                  name = endpoint.normalize(name, referer);
            }

            // do map config
            name = applyMap(name, parentName);
          }

          if (pluginName)
            name = name + '!' + pluginName;
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

          // endpoints
          var oldBaseURL = this.baseURL;

          var endpoint = getEndpoint(name);
          var urlArgs = '';
          if (endpoint) {
            if (!config.endpoints[endpoint])
              throw 'Endpoint "' + endpoint + '" not defined.';
            this.baseURL = config.endpoints[endpoint].location || config.endpoints[endpoint];
            name = name.substr(endpoint.length + 1);
          }
          else if (name.substr(0, 2) != './' && name.substr(0, 3) != '../')
            this.baseURL = config.registryURL;
          else
            urlArgs = config.urlArgs;

          var address = global.System.resolve.call(this, name, options);

          // remove js extension added if a plugin
          if (pluginMatch)
            address = address.substr(0, address.length - 3);

          this.baseURL = oldBaseURL;

          return address + urlArgs;
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
          jspm['import'](pluginName, function(plugin) {

            plugin(options.normalized.substr(0, options.normalized.indexOf('!')), url, jspm.fetch, callback, errback);

          });
        },
        link: function(source, options) {
          if (config.onLoad)
            config.onLoad(options.normalized, source, options);

          var name = options.normalized || '';

          // plugins provide empty source
          if (!source)
            return new global.Module({});

          // check if the endpoint specifies a format
          var endpoint = name.indexOf(':') != -1 && config.endpoints[name.substr(0, name.indexOf(':'))];
          var format = endpoint && typeof endpoint.format == 'string' && endpoint.format.toLowerCase();
          

          // knowing the format, we can minimise the processing cost of regular expressions
          var isAMD = format == 'amd';
          var isES6 = format == 'es6';
          var isCJS = format == 'cjs';
          var detect = !(isAMD || isES6 || isCJS || format == 'global');

          var sourceMappingURL = sourceURL = null;

          var match, _imports = [];

          // alias check is based on a "simple form" only
          // eg import * from 'jquery';
          if (match = source.match(aliasRegEx)) {
            return {
              imports: [match[1] || match[2]],
              execute: function(dep) {
                return dep;
              }
            };
          }

          // global check, also based on a "simple form" regex
          if (detect) {
            var shim = config.shim[name];
            var first500 = source.substr(0, 500);
            if (match = first500.match(globalShimRegEx)) {
              var imports = match[2].match(globalImportRegEx);
              if (imports)
                for (var i = 0; i < imports.length; i++)
                  imports[i] = imports[i].substr(8);
              shim = {
                imports: imports,
                exports: match[5]
              };
              detect = false;
            }
          }

          // es6 module format
          if (isES6 || detect && (source.match(importRegEx) || source.match(exportRegEx) || source.match(moduleRegEx)))
            return;

          // detect any source map comments to reinsert at the end of the new wrappings
          // for efficiency, only apply the regex to the last 500 characters of the source
          var last500 = source.length < 500 ? source : source.substr(source.length - 500);
          sourceMappingURL = last500.match(sourceMappingURLRegEx);
          if (sourceMappingURL)
            sourceMappingURL = sourceMappingURL[1];

          sourceURL = last500.match(sourceURLRegEx);
          sourceURL = sourceURL ? sourceURL[1] : options.address;
          
          // remove comments before doing regular expression detection
          if (detect && !isMinified(source))
            source = removeComments(source);


          // AMD
          // define([.., .., ..], ...)
          amdDefineRegEx.lastIndex = 0;
          
          // define(varName); || define(function(require, exports) {}); || define({})
          cjsDefineRegEx.lastIndex = 0;
          var cjsAMD = false;
          if ((isAMD || detect) && (
            (match = amdDefineRegEx.exec(source)) && (match[1] || match[2]) ||
            (match = cjsDefineRegEx.exec(source)) && (cjsAMD = true)
          )) {

            if (cjsAMD) {
              _imports = ['require', 'exports', 'module'];
              while (match = cjsRequireRegEx.exec(source))
                _imports.push(match[3] || match[4]);
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
              
            var isTranspiled = source.match(transpileRegEx);

            return {
              imports: _imports,
              execute: function() {
                var deps = isTranspiled ? Array.prototype.splice.call(arguments, 0) : checkDefaultOnly(arguments);
                var depMap = {};
                for (var i = 0; i < _imports.length; i++)
                  depMap[_imports[i]] = deps[i];

                // add system dependencies
                var exports;
                var module;
                var require;

                if (moduleIndex != -1)
                  module = { id: name, uri: options.address };
                if (exportsIndex != -1)
                  exports = {};
                if (requireIndex != -1)
                  require = function(names, callback, errback) {
                    if (typeof names == 'string' && names in depMap)
                      return depMap[names];
                    return jspm.require(names, callback, errback, { name: name, address: options.address });
                  }

                if (moduleIndex != -1)
                  deps.splice(moduleIndex, 0, module);
                if (exportsIndex != -1)
                  deps.splice(exportsIndex, 0, exports);
                if (requireIndex != -1)
                  deps.splice(requireIndex, 0, require);

                var output;

                var g = jspm.global;

                g.require = g.requirejs = jspm.require;
                g.define = function(dependencies, factory) {
                  if (typeof dependencies == 'string') {
                    dependencies = arguments[1];
                    factory = arguments[2];
                  }

                  // no dependencies
                  if (!(dependencies instanceof Array))
                    factory = dependencies;

                  // run the factory function
                  if (typeof factory == 'function')
                    output = factory.apply(g, deps) || exports;
                  // otherwise factory is the value
                  else
                    output = factory;
                }
                g.define.amd = {};

                // ensure no NodeJS environment detection
                delete g.module;
                delete g.exports;

                __scopedEval(source, g, sourceURL, sourceMappingURL);

                delete g.define;
                delete g.require;
                delete g.requirejs;

                if (isTranspiled || (typeof output == 'object' && output.constructor == Object))
                  return new global.Module(output || {});
                else
                  return new global.Module({ 'default': output });
              }
            };
          }
          
          // CommonJS
          // require('...') || exports[''] = ... || exports.asd = ... || module.exports = ...
          cjsExportsRegEx.lastIndex = 0;
          cjsRequireRegEx.lastIndex = 0;
          if (isCJS || detect && ((match = cjsRequireRegEx.exec(source)) || source.match(cjsExportsRegEx))) {
            if (match)
              _imports.push(match[2] || match[3]);
            while (match = cjsRequireRegEx.exec(source))
              _imports.push(match[2] || match[3]);

            return {
              imports: _imports, // clone the array as we still need it
              execute: function() {
                var depMap = {};
                for (var i = 0; i < _imports.length; i++)
                  depMap[_imports[i]] = checkDefaultOnly(arguments[i]);

                var dirname = options.address.split('/');
                dirname.pop();
                dirname = dirname.join('/');

                var g = jspm.global;

                var globals = g._g = {
                  global: g,
                  exports: {},
                  process: nodeProcess,
                  require: function(d) {
                    return depMap[d];
                  },
                  __filename: options.address,
                  __dirname: dirname,
                };
                globals.module = { exports: globals.exports };

                var glString = '';
                for (var _g in globals)
                  glString += 'var ' + _g + ' = _g.' + _g + ';';

                source = glString + source;

                __scopedEval(source, g, sourceURL, sourceMappingURL);

                delete g._g;

                var outModule;

                if (typeof globals.module.exports == 'object' && globals.module.exports.constructor == Object)
                  return new global.Module(globals.module.exports);
                else
                  return new global.Module({ 'default': globals.module.exports });
              }
            };
          }

          // Global
          return {
            // apply shim config
            imports: shim ? _imports.concat(shim instanceof Array ? shim : shim.imports || []) : _imports,
            execute: function() {
              setGlobal(checkDefaultOnly(arguments));
              __scopedEval(source, jspm.global, sourceURL, sourceMappingURL);
              return new global.Module(getGlobal(shim && shim.exports));
            }
          };
        }
      });

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
        var defCnt = 0;
        for (var q in module) {
          if (module.hasOwnProperty(q)) {
            defCnt++;
            if (defCnt > 1)
              return module;
          }
        }
        return module['default'] ? module['default'] : module;
      }

      var _import = jspm['import'];
      jspm['import'] = function(name, callback, errback, referer) {
        _import.call(jspm, name, function() {
          if (callback)
            callback.apply(null, checkDefaultOnly(arguments));
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

        extend(config, newConfig);

        if (newConfig.baseURL)
          jspm.baseURL = newConfig.baseURL;
        if (newConfig.baseUrl)
          jspm.baseURL = newConfig.baseUrl;

        if (newConfig.jspmPackages)
          for (var l in config.endpoints) {
            if (config.endpoints[l].location)
              config.endpoints[l].location = newConfig.jspmPackages + '/' + l;
            else
              config.endpoints[l] = newConfig.jspmPackages + '/' + l;
          }
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
          return jspm['import'](names, callback, errback, referer);
        
        // commonjs require
        else if (typeof names == 'string')
          return checkDefaultOnly(jspm.get(names));

        else
          throw 'Invalid require';
      }
      jspm.require.config = jspm.config;

      // add convenience endpoints
      jspm.config({
        endpoints: {
          github: 'https://github.jspm.io',
          npm: {
            location: 'https://npm.jspm.io',
            format: 'cjs',
            normalize: function(name) {
              if (name.substr(name.length - 3, 3) == '.js')
                return name.substr(0, name.length - 3);
              return name;
            }
          },
          cdnjs: 'https://cdnjs.cloudflare.com/ajax/libs'
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
          '<' + 'script type="text/javascript" src="' + basePath + 'es6-module-loader.js" data-init="createLoader">' + '<' + '/script>'
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
  var __scopedEval = function(__source, global, __sourceURL, __sourceMappingURL) {
    eval('(function(global) { with(global) { ' + __source + ' \n } }).call(global, global);' + (__sourceMappingURL 
      ? '\n//# sourceMappingURL=' + __sourceMappingURL 
      : (__sourceURL ? '\n//# sourceURL=' + __sourceURL : '')));
  }

})();

