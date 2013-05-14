/*
  RequireJS ES6 module loader
  - Polyfills the native browser module loader assuming 'es-loader.js' at the same location
  - Provides an AMD-style loader at the globals "require" and "requirejs"


 Todo
  - Work out plugin syntax that allows a fully sync normalization
    import * from '@env/mobile if @some/thing then @another/thing else @first/thing/here'
    import * from '@cs my/module/file'

  Configuration

    require.config({
      'baseUrl': 'lib',
      'shim': {
        'jquery': {
          deps: [],
          exports: ['jQuery', '$']
        }
      },
      'paths': {
        some: 'path'
      },
      'map': {
        'backbone': {
          '$': 'jquery'
        }
      },
      'packages': [
      {
        name: 'jquery',
        main: 'index'
      }
      ]
    });

    All configuration identical to RequireJS

    Except:
    - "baseURL" is used instead of "baseUrl"
    - plugin differences

*/

(function() {
  var scripts = document.getElementsByTagName('script');
  var head = document.getElementsByTagName('head')[0];
  var curPath = scripts[scripts.length - 1].src;
  var basePath = curPath.substr(0, curPath.lastIndexOf('/') + 1);

  if (!window.Loader) {
    var s = document.createElement('script');
    s.type = "text/javascript";
    s.src = basePath + "es6-loader.js";
    s.onload = createJSPMLoader();
    head.appendChild(s);
  }

  function createJSPMLoader() {

    var _config = require._config = {
      waitSeconds: 30,
      shim: {},
      paths: {},
      map: {},
      packages: []
    };

    // check if a module name starts with a given prefix
    // the key check is not to match the prefix 'jquery'
    // to the module name jquery-ui/some/thing, and only
    // to jquery/some/thing
    var prefixMatch = function(name, prefix) {
      var prefixParts = prefix.split('/');
      var nameParts = name.split('/');
      if (prefixParts.length > nameParts.length)
        return false;
      for (var i = 0; i < prefixParts.length; i++) {
        if (nameParts[i] != prefixParts[i])
          return false;
      return true;
    }

    // apply map configurations
    var map = function(name, parentName) {
      for (var m in _config.map) {
        if (m == '*')
          continue;

        if (!prefixMatch(parentName, m))
          continue;

        for (var p in _config.map[m]) {
          if (!prefixMatch(name, p))
            continue;

          // a match
          return _config.map[m][p] + name.substr(p.length);
        }
      }

      // check wildcard second
      if (config.map['*'])
        for (var p in _config.map['*']) {
          if (!prefixMatch(name, p))
            continue;

          // a match
          return _config.map['*'][p] + name.substr(p.length);
        }

      return name;
    }

    window.require = window.requirejs = new Loader(System, {

      // normalize applies equally to scripts and assets
      // the presence of an extension does not imply a URL
      // only a '/' or protocol implies a url
      // '.js' extension is removed when checking map, package and shim config

      normalize: function(name, parentName) {
        // NB do plugin normalize breakdown delegation first

        // remove the extension
        var ext = '';
        if (name.indexOf('.')) {
          ext = name.substr(name.lastIndexOf('.'));
          name = name.substr(0, name.length - ext.length);

          if (ext == '.js')
            ext = '';
        }

        // do normalization
        name = System.normalize(name, parentName) + ext;

        // do map config
        name = map(name + ext, parentName);

        // do package config
        for (var i = 0; i < _config.packages.length; i++) {
          if (name == _config.packages[i]) {
            name += '/index';
            break;
          }
          
          else if (_config.packages[i].name && name == _config.packages[i].name) {
            if (_config.packages[i].location)
              name = _config.packages[i].location;

            // ensure that main is a relative ID if not a plugin form
            var main = _config.packages[i].main;
            if (main.indexOf('!') == -1 && (main.substr(0, 2) != '..' || main.substr(0, 2) != './'))
              main = './' + main;

            name = this.normalize(main, name);
            break;
          }
        }
      },
      resolve: function(name) {
        // first apply paths configuration
        for (var p in _config.paths) {
          if (!prefixMatch(name, p))
            continue;

          // match
          name = _config.paths[p] + name.substr(p.length);
          break;
        }

        // then just use standard resolution
        return System.resolve(name);
      },
      fetch: function(url, options) {
        // do a fetch with a timeout
        System.fetch(url, options)
      },
      translate: function(source) {
        // apply shim configuration with careful global management
        return 
        source;
      }
    });

    // shim functions
    require.globals = {};
    require.makeGlobal = function(packageName, deps) {
      var g = this.globals[packageName] = this.globals[packageName] || {};
      // extend the global with the globals of all the dependencies
      if (deps)
        for (var i = 0; i < deps.length; i++) {
          if (deps[i].substr(0, 1) == '.')
            continue;
          var dep = deps[i].split('/')[0];
          var depG = requirejs.globals[this.normalize(deps[i], packageName)];
          for (var p in depG)
            this.globals[p] = g[p] = depG[p];
        }
    }
    require.saveGlobal = function(packageName, exports) {
      if (!exports)
        return;
      if (!(exports instanceof Array))
        exports = [exports];
      var g = requirejs.globals[packageName];
      for (var i = 0; i < exports.length; i++)
        g[exports[i]] = window[exports[i]];
      return g[exports[0]];
    }

    require.resolvers = {};
    require.ondemand = System.ondemand;

    var extend = function(objA, objB) {
      for (var p in objB) {
        if (typeof objB[p] == 'object') {
          if (typeof objA[p] != 'object')
            objA[p] = {};
          extend(objA[p], objB[p]);
          continue;
        }

        objA[p] = objB[p];
      }
    }

    require.config = function(config) {
      if (config.baseURL)
        this.baseURL = config.baseURL;
      
      if (config.waitSeconds && parseInt(config.waitSeconds) >= 0)
        _config.waitSeconds = parseInt(config.waitSeconds);

      if (config.map)
        extend(_config.map, config.map);

      if (config.packages)
        _config.packages = _config.packages.concat(config.packages);

      if (config.shim)
        extend(this._config.shim, config.shim);
    }
  }
})();