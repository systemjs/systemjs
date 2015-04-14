  /*
   * Config
   */
(function() {
  /*
   Extend config merging one deep only

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