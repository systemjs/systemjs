(function(global) {

  var head = document.getElementsByTagName('head')[0];

  // override fetch to use script injection
  System.fetch = function(load) {
    // if already defined, skip
    if (System.defined[load.name])
      return '';

    // script injection fetch system
    return new Promise(function(resolve, reject) {
      var s = document.createElement('script');
      s.async = true;
      s.addEventListener('load', function(evt) {
        if (lastAnonymous)
          System.defined[load.name] = lastAnonymous;
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

    if (!(deps instanceof Array)) {
      factory = deps;
      deps = [];
    }

    if (typeof factory != 'function')
      factory = (function(factory) {
        return function() { return factory; }
      })(factory);

    for (var i = 0; i < deps.length; i++)
      if (lastIndexOf.call(deps, deps[i]) != i)
        deps.splice(i--, 1);

    var instantiate = {
      deps: deps,
      execute: function() {
        var args = [];
        for (var i = 0; i < arguments.length; i++)
          args.push(System.getModule(arguments[i]));

        var output = factory.apply(this, args);
        return new global.Module(output && output.__esModule ? output : { __useDefault: true, 'default': output });
      }
    };

    if (name)
      System.defined[name] = instantiate;
    else
      lastAnonymous = instantiate;
  }
  global.define.amd = {};  

  // no translate at all
  System.translate = function() {}

  // instantiate defaults to null
  System.instantiate = function() {
    return {
      deps: [],
      execute: function() {
        return new Module({});
      }
    };
  }


  /*
    AMD-compatible require
    To copy RequireJS, set window.require = window.requirejs = System.requirejs
  */
  var require = System.requirejs = function(names, callback, errback, referer) {
    // in amd, first arg can be a config object... we just ignore
    if (typeof names == 'object' && !(names instanceof Array))
      return require.apply(null, Array.prototype.splice.call(arguments, 1, arguments.length - 1));

    // amd require
    if (names instanceof Array)
      Promise.all(names.map(function(name) {
        return System['import'](name, referer);
      })).then(function(mods) {
        return callback.apply(this, mods);
      }, errback);

    // commonjs require
    else if (typeof names == 'string')
      return System.getModule(names);

    else
      throw 'Invalid require';
  }

})(typeof window != 'undefined' ? window : global);
