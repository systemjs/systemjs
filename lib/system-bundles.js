(function() {

  // bundles support (just like RequireJS)
  // bundle name is module name of bundle itself
  // bundle is array of modules defined by the bundle
  // when a module in the bundle is requested, the bundle is loaded instead
  // of the form System.bundles['mybundle'] = ['jquery', 'bootstrap/js/bootstrap']
  System.bundles = System.bundles || {};

  // store a cache of defined modules
  // of the form System.defined['moduleName'] = { deps: [], execute: function() {} }
  System.defined = System.defined || {};

  var systemFetch = System.fetch;
  System.fetch = function(load) {
    // if the module is already defined, skip fetch
    if (System.defined[load.name])
      return '';
    // if this module is in a bundle, load the bundle first then
    for (var b in System.bundles) {
      if (System.bundles[b].indexOf(load.name) == -1)
        continue;
      return System.import(b).then(function() { return ''; });
    }
    return systemFetch.apply(this, arguments);
  }

  var systemInstantiate = System.instantiate;
  System.instantiate = function(load) {
    // if the module has been defined by a bundle, use that
    if (System.defined[load.name]) {
      var instantiateResult = System.defined[load.name];
      delete System.defined[load.name];
      return instantiateResult;
    }

    // if it is a bundle itself, it doesn't define anything
    if (System.bundles[load.name])
      return {
        deps: [],
        execute: function() {
          return new Module({});
        }
      };

    return systemInstantiate.apply(this, arguments);
  }

})();