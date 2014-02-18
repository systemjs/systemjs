/*
  SystemJS Core
  Adds normalization to the import function, as well as __defaultOnly support
*/
(function() {
  // check we have System
  if (typeof System == 'undefined')
    throw 'System not defined. Include the `es6-module-loader.js` polyfill before SystemJS.';

  /*
    __defaultOnly
    
    When a module object looks like:
    new Module({
      __defaultOnly: true,
      default: 'some-module'
    })

    Then the import of that module is taken to be the 'default' export and not the module object itself.

    Useful for module.exports = function() {} handling
  */
  var checkDefaultOnly = function(module) {
    if (!(module instanceof Module)) {
      var out = [];
      for (var i = 0; i < module.length; i++)
        out[i] = checkDefaultOnly(module[i]);
      return out;
    }
    return module.__defaultOnly ? module['default'] : module;
  }
  
  // a variation on System.get that does the __defaultOnly check
  System.getModule = function(key) {
    return checkDefaultOnly(System.get(key));  
  }

  // support the empty module, as a concept
  System.set('@empty', Module({}));
  
  
  var systemImport = System['import'];
  var loadingPromises = {};
  System['import'] = function(name, options) {
    // patch System.import to do normalization
    return new Promise(function(resolve) {
      resolve(System.normalize.call(this, name, options && options.name, options && options.address))
    })
    // add defaultOnly support
    .then(function(name) {
      return Promise.resolve(systemImport.call(System, name, options)).then(function(module) {
        return checkDefaultOnly(module);
      });
    });
  }

})();
