
  
  if (!System.paths['@traceur'])
    System.paths['@traceur'] = __$curScript && __$curScript.getAttribute('data-traceur-src')
      || (__$curScript && __$curScript.src 
        ? __$curScript.src.substr(0, __$curScript.src.lastIndexOf('/') + 1) 
        : System.baseURL + (System.baseURL.lastIndexOf('/') == System.baseURL.length - 1 ? '' : '/')
        ) + 'traceur.js';
};

function __eval(__source, __global, __address, __sourceMap) {
  try {
    __source = (__global != __$global ? 'with(__global) { (function() { ' + __source + ' \n }).call(__global); }' : __source)
      + '\n//# sourceURL=' + __address
      + (__sourceMap ? '\n//# sourceMappingURL=' + __sourceMap : '');
    eval(__source);
  }
  catch(e) {
    if (e.name == 'SyntaxError')
      e.message = 'Evaluating ' + __address + '\n\t' + e.message;
    if (System.trace && System.execute == false)
      console.log('Execution error for ' + __address + ': ' + e.stack || e);
    throw e;
  }
}

var __$curScript;

(function(global) {
  if (typeof window != 'undefined') {
    var scripts = document.getElementsByTagName('script');
    __$curScript = scripts[scripts.length - 1];

    if (!global.System || !global.LoaderPolyfill) {
      // determine the current script path as the base path
      var curPath = __$curScript.src;
      var basePath = curPath.substr(0, curPath.lastIndexOf('/') + 1);
      document.write(
        '<' + 'script type="text/javascript" src="' + basePath + 'es6-module-loader.js" data-init="upgradeSystemLoader">' + '<' + '/script>'
      );
    }
    else {
      global.upgradeSystemLoader();
    }
  }
  else {
    var es6ModuleLoader = require('es6-module-loader');
    global.System = es6ModuleLoader.System;
    global.Loader = es6ModuleLoader.Loader;
    global.Module = es6ModuleLoader.Module;
    global.upgradeSystemLoader();
    module.exports = global.System;
  }
})(__$global);

})(typeof window != 'undefined' ? window : global);
