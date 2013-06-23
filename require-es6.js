/*
 * ES6 RequireJS-style module loader
 *
 * Supports RequireJS-inspired map, packages and plugins.
 *
 * https://github.com/guybedford/require-es6
 * 
 * MIT
 *
 */
(function() {
  var config = window.requireES6 || {};

  // these exactly as in RequireJS
  config.waitSeconds = 20;
  config.map = config.map || {};
  config.paths = config.paths || {};
  config.packages = config.packages || {};

  config.shimDeps = config.shimDeps || {};

  // -- helpers --

    // es6 module regexs to check if it is a module or a global script
    var importRegEx = /^\s*import\s+./m;
    var exportRegEx = /^\s*export\s+(\{|\*|var|class|function|default)/m;
    var moduleRegEx = /^\s*module\s+("[^"]+"|'[^']+')\s*\{/m;

    // regex to check absolute urls
    var absUrlRegEx = /^\/|([^\:\/]*:)/;

    // standard object extension
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
    // to jquery/some/thing
    var prefixMatch = function(name, prefix) {
      var prefixParts = prefix.split('/');
      var nameParts = name.split('/');
      if (prefixParts.length > nameParts.length)
        return false;
      for (var i = 0; i < prefixParts.length; i++)
        if (nameParts[i] != prefixParts[i])
          return false;
      return true;
    }

    // get the configuration package for a given module name
    var getPackage = function(name) {
      if (!name)
        return '';
      var p = '';
      for (var _p in config.packages) {
        if (!prefixMatch(name, _p))
          continue;

        // find most specific package name
        if (_p.length > p.length)
          p = _p;
      }
      return p;
    }

  // -- /helpers --

  // determine the current script path as the base path
  var scripts = document.getElementsByTagName('script');
  var head = document.getElementsByTagName('head')[0];
  var curPath = scripts[scripts.length - 1].src;
  var basePath = curPath.substr(0, curPath.lastIndexOf('/') + 1);

  config.baseURL = config.baseURL || basePath;

  // dynamically polyfill the es6 loader if necessary
  if (!window.Loader)
    document.write(
      '<' + 'script type="text/javascript" src="' + basePath + 'es6-loader.js">' + '<' + '/script>' +
      '<' + 'script type="text/javascript">' + 'createLoader();' + '<' + '/script>'
    );
  else
    createLoader();

  function createLoader() {

    // hooks without plugin logic
    var loaderHooks = {
      normalize: function(name, referer) {
        var parentName = referer && referer.name;

        // if the extension is js, and not an absolute URL, remove the extension
        if (name.substr(name.length - 3, 3) == '.js' && !name.match(absUrlRegEx))
          name = name.substr(0, name.length - 3);

        // check if the parent package defines any specific map config
        // this takes preference over any global maps
        // note that maps conly apply once... there is no rechecking of map configs
        var parentPackage = config.packages[getPackage(parentName)];
        var appliedParentMap = false;
        if (parentPackage && parentPackage.map) {
          for (var m in parentPackage.map) {
            if (!prefixMatch(name, m))
              continue;

            name = parentPackage.map[m] + name.substr(m.length);
            appliedParentMap = true;
            break;
          }
        }
        // apply global map config if no parent package map config applied
        if (!appliedParentMap)
          for (var m in config.map) {
            if (!prefixMatch(name, m))
              continue;

            // match
            name = config.map[m] + name.substr(m.length);
            break;
          }

        // do standard normalization
        name = System.normalize(name, referer);

        return name;
      },
      resolve: function(name, options) {
        var parentName = options.referer && options.referer.name;

        // do package config
        var p = getPackage(name);
        if (p) {
          // a sub-package path
          if (name.length > p.length)
            name = config.packages[p].path + name.substr(p.length);

          // the exact package - the main call
          else {
            var main = config.packages[p].main || 'index';

            // ensure that main is a relative ID if not a plugin form
            if (main.indexOf('!') == -1 && (main.substr(0, 2) != '..' || main.substr(0, 2) != './'))
              main = './' + main;

            // normalize the main
            name = this.normalize(main, { name: config.packages[p].path + '/' });
          }
        }

        // paths configuration
        // check the parent package first
        var parentPackage = config.packages[getPackage(parentName)];
        var appliedParentPaths = false;
        if (parentPackage && parentPackage.paths) {
          for (var p in parentPackage.paths) {
            if (!prefixMatch(name, p))
              continue;

            name = parentPackage.paths[p] + name.substr(p.length);
            appliedParentPaths = true;
            break;
          }
        }
        if (!appliedParentPaths)
          for (var p in config.paths) {
            if (!prefixMatch(name, p))
              continue;

            name = config.paths[p] + name.substr(p.length);
            break;
          }

        // then just use standard resolution
        return System.resolve(name, options);
      },
      fetch: function(url, callback, errback, options) {
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
      },
      link: function(source, options) {
        // check if there are any import syntax. If not, use the global shim config
        if (source.match(importRegEx) || source.match(exportRegEx) || source.match(moduleRegEx))
          return;

        var shimDeps;

        // apply shim configuration with careful global management
        var p = getPackage(options.normalized);
        if (p)
          for (var s in config.packages[p].shimDeps) {
            if (!prefixMatch(options.normalized, p + '/' + s))
              continue;

            shimDeps = config.packages[p].shimDeps[s];
            break;
          }
        
        else
          for (var s in config.shimDeps) {
            if (!prefixMatch(options.normalized, s))
              continue;

            shimDeps = config.shimDeps[s];
            break;
          }

        return {
          imports: shimDeps || [],
          execute: function(deps) {
            setGlobal(deps);
            loader.eval(source);
            return new Module(getGlobal());
          }
        };
      }
    };

    // given a module's global dependencies, prepare the global object
    // to contain the union of the defined properties of its dependent modules
    var globalObj = {};
    function setGlobal(deps) {
      // first, we add all the dependency module properties to the global
      if (deps) {
        for (var i = 0; i < deps.length; i++) {
          var dep = deps[i];
          for (var m in dep)
            loader.global[m] = dep[m];
        }
      }

      // now we store a complete copy of the global object
      // in order to detect changes
      for (var g in loader.global) {
        if (loader.global.hasOwnProperty(g))
          globalObj[g] = loader.global[g];
      }
    }

    // go through the global object to find any changes
    // the differences become the returned global for this object
    // the global object is left as is
    function getGlobal() {
      var moduleGlobal = {};

      for (var g in loader.global) {
        if (loader.global.hasOwnProperty(g) && g != 'window' && globalObj[g] != loader.global[g])
          moduleGlobal[g] = loader.global[g];
      }
      return moduleGlobal;
    }



    var loader = new Loader({
      baseURL: config.baseURL,
      normalize: function(name, referer) {

        // plugin shorthand
        if (name.substr(0, 1) == '!') {
          var ext = name.substr(name.indexOf('.') + 1);
          if (ext.length != name.length)
            name = ext + '[' + name + ']';
        }

        // plugin normalization
        var pluginIndex = name.indexOf('!');
        var pluginName = '';
        var pluginArgument = '';
        var pluginArguments = [];
        if (pluginIndex != -1) {
          pluginArgument = name.substr(pluginIndex);
          name = name.substr(0, pluginIndex);

          // parse square brackets as separators of normalization parts in arguments
          // p!something[plugin]here
          // -> p-normalized!something/normalized[plugin]here/normalized
          var bracketDepth = 0;
          var argIndex = 1;
          for (var i = 1; i < pluginArgument.length; i++) {
            if (i == pluginArgument.length - 1 || (pluginArgument.substr(i, 1) == '[' && bracketDepth++ == 0)) {
              // normalize anything up to the bracket
              var argumentPart = pluginArgument.substr(argIndex, i);

              if (argumentPart) {
                var normalized = loader.normalize(argumentPart, referer);
                var resolved = loader.resolve(normalized.normalized || normalized, {
                  referer: referer,
                  metadata: normalized.metadata || null
                });
                var len = pluginArgument.length;
                pluginArgument = pluginArgument.substr(0, argIndex) + (normalized.normalized || normalized) + pluginArgument.substr(i + 1);
                i += len - pluginArgument.length;
                pluginArguments.push({ name: argumentPart, normalized: normalized.normalized || normalized, address: resolved.address || resolved });
                argIndex = i;
              }
            }
            if (pluginArgument.substr(i, 1) == ']' && --bracketDepth == 0) {
              pluginArguments.push({ value: pluginArgument.substr(argIndex + 1, i - 1) });
              argIndex = i + 1;
            }
          }
          pluginName = name;
        }

        // hook normalize function
        var out;
        if (config.normalize)
          out = config.normalize.call(loaderHooks, name, referer) + pluginArgument;
        else
          out = loaderHooks.normalize(name, referer) + pluginArgument;

        if (typeof out == 'string')
          out = { normalized: out };

        out.metadata = out.metadata || {};
        
        // store the unnormalized plugin name and arguments
        // we will renormalize later to avoid double normalization
        if (pluginIndex != -1) {
          out.metadata.pluginName = name;
          out.metadata.pluginArguments = pluginArguments;
        }

        return out;
      },
      resolve: function(name, options) {
        // if it is a plugin resource, let the resolve function return
        // the resolved name of the plugin module
        if (options.metadata.pluginName)
          name = options.metadata.pluginName;
        
        if (config.resolve)
          return config.resolve.call(loaderHooks, name, options);
        else
          return loaderHooks.resolve(name, options);
      },
      fetch: function(url, callback, errback, options) {
        options = options || {};
        // do the fetch
        if (!options.metadata || !options.metadata.pluginName) {
          if (config.fetch)
            return config.fetch.call(loaderHooks, url, callback, errback, options);
          else
            return loaderHooks.fetch(url, callback, errback, options);
        }

        // for plugins, we first need to load the plugin module itself
        loader.import(options.metadata.pluginName, function(pluginModule) {

          // run the plugin load hook.. the callback will return the effective source
          pluginModule.load(options.metadata.pluginArguments, loader, callback, errback, options.referer);

        }, errback, options.referer); 
      },
      translate: function(source, options) {
        if (config.translate)
          return config.translate.call(loaderHooks, source, options);
        else
          return source;
      },
      link: function(source, options) {
        if (config.link)
          return config.link.call(loaderHooks, source, options);
        else
          return loaderHooks.link(source, options);
      }
    });

    // ondemand functionality
    loader.ondemandTable = {};
    loader.ondemand = System.ondemand;

    window.requireES6 = function(arg, callback, errback) {
      // RequireJS-style ES6 loader
      // supports string, array and commonJS-style loads
      return require.call(this, arg, callback, errback);
    }
    requireES6._config = config;
    requireES6.config = function(newConfig) {
      extend(config, newConfig);

      if (newConfig.baseURL)
        loader.baseURL = newConfig.baseURL;
    }
    requireES6.ondemand = function(resolvers) {
      loader.ondemand(resolvers);
    }
    requireES6.get = loader.get.bind(loader);
    requireES6.set = loader.set.bind(loader);
    requireES6.has = loader.has.bind(loader);
    requireES6.delete = loader.delete.bind(loader);

    requireES6.loader = loader;
    
    var cjsRequireRegExp = /[^.]\s*require\s*\(\s*["']([^'"\s]+)['"]\s*\)/g;

    loader.set('__require', require);

    function require(arg, callback, errback) {
      if ((typeof arg == 'string' && arguments.length > 1) || arg instanceof Array) {
        loader.import(arg, callback, errback);
      }
      else if (typeof arg == 'string' && arguments.length == 1) {
        return loader.get(arg);
      }
      else if (typeof arg == 'function') {
        var deps = ['__require'];
        arg.toString().replace(cjsRequireRegExp, function(match, dep) {
          deps.push(dep);
        });
        require(deps, callback, errback);
      }
    }
  }
})();