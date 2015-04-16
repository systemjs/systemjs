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

function bundles(loader) {
  if (typeof indexOf == 'undefined')
    indexOf = Array.prototype.indexOf;

  loader._extensions.push(bundles);

  // bundles support (just like RequireJS)
  // bundle name is module name of bundle itself
  // bundle is array of modules defined by the bundle
  // when a module in the bundle is requested, the bundle is loaded instead
  // of the form System.bundles['mybundle'] = ['jquery', 'bootstrap/js/bootstrap']
  loader.bundles = loader.bundles || {};

  var loadedBundles = [];

  function loadFromBundle(loader, bundle) {
    // we do manual normalization in case the bundle is mapped
    // this is so we can still know the normalized name is a bundle
    return Promise.resolve(loader.normalize(bundle))
    .then(function(normalized) {
      if (indexOf.call(loadedBundles, normalized) == -1) {
        loadedBundles.push(normalized);
        loader.bundles[normalized] = loader.bundles[normalized] || loader.bundles[bundle];

        // note this module is a bundle in the meta
        loader.meta = loader.meta || {};
        loader.meta[normalized] = loader.meta[normalized] || {};
        loader.meta[normalized].bundle = true;
      }
      return loader.load(normalized);
    })
    .then(function() {
      return '';
    });
  }

  var loaderFetch = loader.fetch;
  loader.fetch = function(load) {
    var loader = this;
    if (loader.trace)
      return loaderFetch.call(this, load);
    if (!loader.bundles)
      loader.bundles = {};

    // check what bundles we've already loaded
    for (var i = 0; i < loadedBundles.length; i++) {
      if (indexOf.call(loader.bundles[loadedBundles[i]], load.name) == -1)
        continue;

      return loadFromBundle(loader, loadedBundles[i]);
    }

    // if this module is in a bundle, load the bundle first then
    for (var b in loader.bundles) {
      if (indexOf.call(loader.bundles[b], load.name) == -1)
        continue;

      return loadFromBundle(loader, b);
    }

    return loaderFetch.call(this, load);
  }
}
