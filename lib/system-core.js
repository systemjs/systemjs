(function() {
  // check we have System
  if (typeof System == 'undefined')
    throw 'System not defined. Include the `es6-module-loader.js` polyfill before SystemJS.';

  // go through a module list or module and if the only
  // export is the default, then provide it directly
  // useful for module.exports = function() {} handling
  var checkDefaultOnly = function(module) {
    if (!(module instanceof Module)) {
      var out = [];
      for (var i = 0; i < module.length; i++)
        out[i] = checkDefaultOnly(module[i]);
      return out;
    }
    return module.__defaultOnly ? module['default'] : module;
  }
  
  // patch System.import to do normalization
  var systemImport = System.import;
  System.import = function(name, options) {
    // normalize name first
    return new Promise(function(resolve) {
      resolve(System.normalize.call(this, name, null, null))
    })
    .then(function(name) {
      return systemImport.call(System, name, options);
    })
    .then(function(module) {
      return checkDefaultOnly(module);
    });
  }
})();
