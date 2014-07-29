
  
  if (!System.paths['@traceur'])
    System.paths['@traceur'] = __$curScript && __$curScript.getAttribute('data-traceur-src')
      || (__$curScript && __$curScript.src 
        ? __$curScript.src.substr(0, __$curScript.src.lastIndexOf('/') + 1) 
        : System.baseURL + (System.baseURL.lastIndexOf('/') == System.baseURL.length - 1 ? '' : '/')
        ) + 'traceur.js';
};

var __head;

function __eval(__source, __global, __address, __sourceMap) {
  try {
    __source = (__global != __$global ? 'with(__global) { (function() { ' + __source + ' \n }).call(__global); }' : __source)
      + '\n//# sourceURL=' + __address
      + (__sourceMap ? '\n//# sourceMappingURL=' + __sourceMap : '');
    
    // we need to ensure eval runs in a global scope
    if (__global == __$global && __head) {
      var __script = document.createElement('script');
      __script.textContent = __source;
      var __onerror = window.onerror;
      var __e;
      window.onerror = function(e) {
        __e = e;
        return true;
      }
      __head.appendChild(__script);
      __head.removeChild(__script);
      window.onerror = __onerror;
      if (__e)
        throw __e;
    }
    else
      eval(__source);
  }
  catch(e) {
    if (e.name == 'SyntaxError')
      e.message = 'Evaluating ' + __address + '\n\t' + e.message;
    if (System.trace && System.execute == false)
      e = 'Execution error for ' + __address + ': ' + e.stack || e;
    throw e;
  }
}

var __$curScript;

(function(global) {
  if (typeof window != 'undefined') {
    __head = document.head || document.body || document.documentElement;

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
    global.upgradeSystemLoader();
    module.exports = global.System;
  }
})(__$global);

})(typeof window != 'undefined' ? window : global);
