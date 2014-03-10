/*
  SystemJS Core
  Adds normalization to the import function, as well as __useDefault support
*/
(function(global) {
  // check we have System
  if (typeof System == 'undefined')
    throw 'System not defined. Include the `es6-module-loader.js` polyfill before SystemJS.';

  var curSystem = System;

  /*
    __useDefault
    
    When a module object looks like:
    new Module({
      __useDefault: true,
      default: 'some-module'
    })

    Then the import of that module is taken to be the 'default' export and not the module object itself.

    Useful for module.exports = function() {} handling
  */
  var checkUseDefault = function(module) {
    if (!(module instanceof Module)) {
      var out = [];
      for (var i = 0; i < module.length; i++)
        out[i] = checkUseDefault(module[i]);
      return out;
    }
    return module.__useDefault ? module['default'] : module;
  }
  
  // a variation on System.get that does the __useDefault check
  System.getModule = function(key) {
    return checkUseDefault(System.get(key));  
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
    // add useDefault support
    .then(function(name) {
      return Promise.resolve(systemImport.call(System, name, options)).then(function(module) {
        return checkUseDefault(module);
      });
    });
  }

  // define exec for custom instan
  System.__exec = function(load) {
    try {
      Function('global', 'with(global) { ' + load.source + ' \n }'
      + (load.address && !load.source.match(/\/\/[@#] ?(sourceURL|sourceMappingURL)=([^\n'"]+)/)
      ? '\n//# sourceURL=' + load.address : '')).call(global, global);
    }
    catch(e) {
      if (e.name == 'SyntaxError')
        e.message = 'Evaluating ' + load.address + '\n\t' + e.message;
      throw e;
    }
    // traceur overwrites System - write it back
    if (load.name == '@traceur')
      global.System = curSystem;
  }
})(typeof window == 'undefined' ? global : window);
