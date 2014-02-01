(function(global) {

  var head = document.getElementsByTagName('head')[0];

  // override fetch to use script injection
  // bundles support (just like RequireJS)
  System.bundles = System.bundles || {};

  var systemFetch = System.fetch;
  System.fetch = function(load) {
    // if this module is in a bundle, load the bundle first
    for (var b in System.bundles) {
      if (System.bundles[b].indexOf(load.name) == -1)
        continue;
      return System.import(b).then(function() { return ''; });
    }
    
    // if already defined, skip
    if (instantiateCache[load.name])
      return '';

    // if a bundle, do script injection
    return new Promise(function(resolve, reject) {
      var s = document.createElement('script');
      s.async = true;
      s.addEventListener('load', function(evt) {
        if (lastAnonymous)
          instantiateCache[load.name] = lastAnonymous;
        lastAnonymous = null;
        resolve('');
      }, false);
      s.addEventListener('error', function(err) {
        reject(err);
      }, false);
      s.src = load.address;
      head.appendChild(s);
    });
  }
  var lastAnonymous = null;
  global.define = function(name, deps, factory) {
    // anonymous define
    if (typeof name != 'string') {
      factory = deps;
      deps = name;
      name = null;
    }

    if (!(deps instanceof Array))
      factory = deps;

    if (typeof factory != 'function')
      factory = (function(factory) {
        return function() { return factory; }
      })(factory);

    var instantiate = {
      deps: deps,
      execute: function() {
        var args = [];
        for (var i = 0; i < arguments.length; i++)
          args.push(System.get(arguments[i]));

        var output = factory.apply(this, args);
        return new global.Module(output && output.__transpiledModule ? (delete output.__transpiledModule, output) : { __defaultOnly: true, 'default': output });
      }
    };

    if (name)
      instantiateCache[name] = instantiate;
    else
      lastAnonymous = instantiate;
  }
  global.define.amd = {};  


  var systemLocate = System.locate;
  System.locate = function(load) {
    if (load.metadata.bundle)
      return '';
    return systemLocate.call(this, load);
  }
  // in production, no translate at all
  System.translate = function() {}


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
      })).then(callback, errback);

    // commonjs require
    else if (typeof names == 'string')
      return System.get(names);

    else
      throw 'Invalid require';
  }

  var instantiateCache = {};
  System.instantiate = function(load) {
    // we should have the AMD define in our cache now
    if (instantiateCache[load.name])
      return instantiateCache[load.name];

    // a bundle itself doesn't define anything
    return {
      deps: [],
      execute: function() {
        return new Module({});
      }
    };
  }

})(typeof window != 'undefined' ? window : global);