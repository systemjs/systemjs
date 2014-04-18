
  if (__$global.systemMainEntryPoint)
    System['import'](__$global.systemMainEntryPoint);
  return System;
}; // upgradeLoader end

(function() {
  if (typeof window != 'undefined') {
    var scripts = document.getElementsByTagName('script');
    var curScript = scripts[scripts.length - 1];
    __$global.systemMainEntryPoint = curScript.getAttribute('data-main');
  }
  
  __$global.upgradeSystemLoader = function(){
    __$global.upgradeSystemLoader = undefined;
    var originalSystemLoader = __$global.System;
    __$global.System = upgradeLoader(System);
    __$global.System.clone = function(){
      	return upgradeLoader(originalSystemLoader);
    }
  };
  if (!__$global.System || __$global.System.registerModule) {
    if (typeof window != 'undefined') {
      // determine the current script path as the base path
      var curPath = curScript.src;
      var basePath = curPath.substr(0, curPath.lastIndexOf('/') + 1);
      
      document.write(
        '<' + 'script type="text/javascript" src="' + basePath + 'es6-module-loader.js" data-init="upgradeSystemLoader">' + '<' + '/script>'
      );
    }
    else {
      var es6ModuleLoader = require('es6-module-loader');
      var originalSystemLoader = es6ModuleLoader.System;
      __$global.System = es6ModuleLoader.System;
      __$global.Loader = es6ModuleLoader.Loader;
      __$global.Module = es6ModuleLoader.Module;
      __$global.upgradeSystemLoader();
      module.exports = __$global.System;
      
    }
  }
  else {
    __$global.upgradeSystemLoader();
  }
  /*if (typeof window != 'undefined') {
    var configPath = curScript.getAttribute('data-config');
    if (configPath)
      document.write('<' + 'script type="text/javascript src="' + configPath + '">' + '<' + '/script>');
  }*/
})();


})(typeof window != 'undefined' ? window : global);