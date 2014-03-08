/*
  Implementation of the System.register bundling method

  This allows the output of Traceur to populate the
  module registry of the System loader
*/

(function() {

  // instantiation cache for System.register
  System.defined = {};

  // register a new module for instantiation
  System.register = function(name, deps, execute) {
    System.defined[name] = {  
      deps: deps,
      execute: function() {
        return Module(execute.apply(this, arguments));
      }
    };
  }

  var systemInstantiate = System.instantiate;
  System.instantiate = function(load) {
    // if the module has been defined by a bundle, use that
    if (System.defined[load.name]) {
      var instantiateResult = System.defined[load.name];
      delete System.defined[load.name];
      return instantiateResult;
    }

    return systemInstantiate.apply(this, arguments);
  }

})();