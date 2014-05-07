(function(__$global) {

__$global.upgradeSystemLoader = function() {
  __$global.upgradeSystemLoader = undefined;

  // indexOf polyfill for IE
  var indexOf = Array.prototype.indexOf || function(item) {
    for (var i = 0, l = this.length; i < l; i++)
      if (this[i] === item)
        return i;
    return -1;
  }

  // clone the original System loader
  var originalSystem = __$global.System;
  var System = __$global.System = new LoaderPolyfill(originalSystem);
  System.baseURL = originalSystem.baseURL;
  System.paths = { '*': '*.js' };
  System.originalSystem = originalSystem;

  System.noConflict = function() {
    __$global.SystemJS = System;
    __$global.System = System.originalSystem;
  }

  