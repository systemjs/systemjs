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
  
  var systemGet = System.get;
  System.get = function(key) {
    var module = systemGet.call(this, key);
    return checkDefaultOnly(module);
  }
  
  // patch System.import to do normalization
  var systemImport = System.import;
  System.import = function(name, options) {
    // normalize name first
    return new Promise(function(resolve) {
      resolve(System.normalize.call(this, name, options && options.name, options && options.address))
    })
    .then(function(name) {
      return systemImport.call(System, name, options);
    })
    .then(function(module) {
      return checkDefaultOnly(module);
    });
  }

})();
