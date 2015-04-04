(function() {
  /*
    __useDefault
    
    When a module object looks like:
    newModule(
      __useDefault: true,
      default: 'some-module'
    })

    Then importing that module provides the 'some-module'
    result directly instead of the full module.

    Useful for eg module.exports = function() {}
  */
  hook('import', function(systemImport) {
    return function(name, parentName) {
      return systemImport.call(this, name, parentName).then(function(module) {
        return module.__useDefault ? module['default'] : module;
      });
    };
  });

  /*
    Config
    Extends config merging one deep only

    loader.config({
      some: 'random',
      config: 'here',
      deep: {
        config: { too: 'too' }
      }
    });

    <=>

    loader.some = 'random';
    loader.config = 'here'
    loader.deep = loader.deep || {};
    loader.deep.config = { too: 'too' };
  */
  SystemLoader.prototype.config = function(cfg) {
    for (var c in cfg) {
      var v = cfg[c];
      if (typeof v == 'object' && !(v instanceof Array)) {
        this[c] = this[c] || {};
        for (var p in v)
          this[c][p] = v[p];
      }
      else
        this[c] = v;
    }
  };

  var baseURL;
  hookConstructor(function(constructor) {
    return function() {
      var loader = this;
      constructor.call(loader);
      baseURL = loader.baseURL;

      // support the empty module, as a concept
      loader.set('@empty', loader.newModule({}));

      // include the node require since we're overriding it
      if (typeof require != 'undefined')
        loader._nodeRequire = require;
    };
  });

  // allow baseURL to be a relative URL
  var normalizedBaseURL;
  hook('locate', function(locate) {
    return function(load) {
      if (this.baseURL != normalizedBaseURL) {
        normalizedBaseURL = new URL(this.baseURL, baseURL).href;

        if (normalizedBaseURL.substr(normalizedBaseURL.length - 1, 1) != '/')
          normalizedBaseURL += '/';
        this.baseURL = normalizedBaseURL;
      }

      return Promise.resolve(locate.call(this, load));
    };
  });
})();