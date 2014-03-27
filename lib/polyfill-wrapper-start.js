(function(global) {

global.upgradeSystemLoader = function() {
  global.upgradeSystemLoader = undefined;

  // Define an IE-friendly shim good-enough for purposes
  var indexOf = Array.prototype.indexOf || function(item) { 
    for (var i = 0, thisLen = this.length; i < thisLen; i++) {
      if (this[i] === item)
        return i;
    }
    return -1;
  };

  var lastIndexOf = Array.prototype.lastIndexOf || function(c) {
    for (var i = this.length - 1; i >= 0; i--) {
      if (this[i] === c) {
        return i;
      }
    }
    return -i;
  };
