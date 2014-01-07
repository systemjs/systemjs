};

(function() {
  if (!global.System) {
    if (typeof window != 'undefined') {
      // determine the current script path as the base path
      var scripts = document.getElementsByTagName('script');
      var curPath = scripts[scripts.length - 1].src;
      var basePath = curPath.substr(0, curPath.lastIndexOf('/') + 1);
      document.write(
        '<' + 'script type="text/javascript" src="' + basePath + 'es6-module-loader.js" data-init="upgradeSystemLoader">' + '<' + '/script>'
      );
    }
    else {
      var es6ModuleLoader = require('es6-module-loader');
      global.System = es6ModuleLoader.System;
      global.Loader = es6ModuleLoader.Loader;
      global.Module = es6ModuleLoader.Module;
      module.exports = global.System;
      global.upgradeSystemLoader();
    }
  }
  else
    global.upgradeSystemLoader();
})();


})(typeof window != 'undefined' ? window : global);
