(function(__$global) {
  // helpers
  var extend = function(d, s){
    for(var prop in s) {
  	  d[prop] = s[prop]	
  	}
  	return d;
  }
	
  var cloneSystemLoader = function(System){
  	var Loader = __$global.Loader || __$global.LoaderPolyfill;
  	var loader = new Loader(System);
  	loader.baseURL = System.baseURL;
  	loader.paths = extend({}, System.paths);
  	return loader;
  }


  var upgradeLoader = function(baseLoader) {
  	var System = cloneSystemLoader(baseLoader);