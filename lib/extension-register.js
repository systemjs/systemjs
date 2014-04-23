/*
  Implementation of the loader.register bundling method

  This allows the output of Traceur to populate the
  module registry of the loader loader
*/

function register(loader) {

  // instantiation cache for loader.register
  loader.defined = {};

  // register a new module for instantiation
  loader.register = function(name, deps, execute) {
    loader.defined[name] = {  
      deps: deps,
      execute: function() {
        return Module(execute.apply(this, arguments));
      }
    };
  }
  
  var loaderLocate = loader.locate;
  loader.locate = function(load) {
    if (loader.defined[load.name])
      return '';
    return loaderLocate.apply(this, arguments);
  }
  
  var loaderFetch = loader.fetch;
  loader.fetch = function(load) {
    // if the module is already defined, skip fetch
    if (loader.defined[load.name])
      return '';
    return loaderFetch.apply(this, arguments);
  }

  var loaderInstantiate = loader.instantiate;
  loader.instantiate = function(load) {
    // if the module has been defined by a bundle, use that
    if (loader.defined[load.name]) {
      var instantiateResult = loader.defined[load.name];
      delete loader.defined[load.name];
      return instantiateResult;
    }

    return loaderInstantiate.apply(this, arguments);
  }

}
