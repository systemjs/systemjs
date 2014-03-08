(function() {

  // bundles support (just like RequireJS)
  // bundle name is module name of bundle itself
  // bundle is array of modules defined by the bundle
  // when a module in the bundle is requested, the bundle is loaded instead
  // of the form System.bundles['mybundle'] = ['jquery', 'bootstrap/js/bootstrap']
  System.bundles = System.bundles || {};
  
  // register a new module for instantiation
  System.register = function(name, deps, execute) {
    System.defined[name] = {  
      deps: deps,
      execute: function() {
        return Module(execute.apply(this, arguments));
      }
    };  
  }

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
      // we do manual normalization in case the bundle is mapped
      // this is so we can still know the normalized name is a bundle
      return Promise.resolve(System.normalize(b))
      .then(function(normalized) {
        System.bundles[normalized] = System.bundles[normalized] || System.bundles[b];
        return System.load(normalized);
      });
      return System.import(b).then(function() { return ''; });
    }
    return systemFetch.apply(this, arguments);
  }

  var systemLocate = System.locate;
  System.locate = function(load) {
    if (System.bundles[load.name])
      load.metadata.bundle = true;
    return systemLocate.call(this, load);
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
    if (load.metadata.bundle)
      return {
        deps: [],
        execute: function() {
          return new Module({});
        }
      };

    return systemInstantiate.apply(this, arguments);
  }

})();
