(function(__$global) {

// indexOf polyfill for IE
var indexOf = Array.prototype.indexOf || function(item) {
  for (var i = 0, l = this.length; i < l; i++)
    if (this[i] === item)
      return i;
  return -1;
}

__$global.upgradeSystemLoader = function() {
  __$global.upgradeSystemLoader = undefined;