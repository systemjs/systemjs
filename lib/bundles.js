/*
  System bundles

  Allows a bundle module to be specified which will be dynamically 
  loaded before trying to load a given module.

  For example:
  System.bundles['mybundle'] = ['jquery', 'bootstrap/js/bootstrap']

  Will result in a load to "mybundle" whenever a load to "jquery"
  or "bootstrap/js/bootstrap" is made.

  In this way, the bundle becomes the request that provides the module
*/

(function() {
  // bundles support (just like RequireJS)
  // bundle name is module name of bundle itself
  // bundle is array of modules defined by the bundle
  // when a module in the bundle is requested, the bundle is loaded instead
  // of the form System.bundles['mybundle'] = ['jquery', 'bootstrap/js/bootstrap']
  hookConstructor(function(constructor) {
    return function() {
      constructor.call(this);
      this.bundles = {};
      this.loadedBundles_ = {};
    };
  });

  function loadFromBundle(loader, bundle) {
    return Promise.resolve(loader.normalize(bundle))
    .then(function(normalized) {
      loader.loadedBundles_[normalized] = true;
      loader.bundles[normalized] = loader.bundles[normalized] || loader.bundles[bundle];
      return loader.load(normalized);
    })
    .then(function() {
      return '';
    });
  }

  // assign bundle metadata for bundle loads
  hook('locate', function(locate) {
    return function(load) {
      if (load.name in this.loadedBundles_ || load.name in this.bundles)
        load.metadata.bundle = true;

      return locate.call(this, load);
    };
  });

  hook('fetch', function(fetch) {
    return function(load) {
      var loader = this;
      if (loader.trace)
        return fetch.call(loader, load);
      
      // if already defined, no need to load a bundle
      if (load.name in loader.defined)
        return '';

      // check if it is in an already-loaded bundle
      for (var b in loader.loadedBundles_) {
        if (indexOf.call(loader.bundles[b], load.name) != -1)
          return loadFromBundle(loader, b);
      }

      // check if it is a new bundle
      for (var b in loader.bundles) {
        if (indexOf.call(loader.bundles[b], load.name) != -1)
          return loadFromBundle(loader, b);
      }

      return fetch.call(loader, load);
    };
  });
})();
