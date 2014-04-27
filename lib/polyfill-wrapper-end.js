
  if (__$global.systemMainEntryPoint)
    System['import'](__$global.systemMainEntryPoint);
};

(function() {
  if (typeof window != 'undefined') {
    var scripts = document.getElementsByTagName('script');
    var curScript = scripts[scripts.length - 1];
    __$global.systemMainEntryPoint = curScript.getAttribute('data-main');

    if (!__$global.System || __$global.System.registerModule) {      
      // determine the current script path as the base path
      var curPath = curScript.src;
      var basePath = curPath.substr(0, curPath.lastIndexOf('/') + 1);
      document.write(
        '<' + 'script type="text/javascript" src="' + basePath + 'es6-module-loader.js" data-init="upgradeSystemLoader">' + '<' + '/script>'
      );
    }
    else {
      __$global.upgradeSystemLoader();
    }

    var configPath = curScript.getAttribute('data-config');
    if (configPath)
      document.write('<' + 'script type="text/javascript src="' + configPath + '">' + '<' + '/script>');
  }
  else {
    var es6ModuleLoader = require('es6-module-loader');
    __$global.System = es6ModuleLoader.System;
    __$global.Loader = es6ModuleLoader.Loader;
    __$global.Module = es6ModuleLoader.Module;
    module.exports = __$global.System;
    __$global.upgradeSystemLoader();
  }
})();


})(typeof window != 'undefined' ? window : global);