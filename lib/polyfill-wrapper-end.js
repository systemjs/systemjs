  
  if (__$curScript) {
    System.baseURL = __$curScript.getAttribute('data-baseurl') || System.baseURL;

    var configPath = __$curScript.getAttribute('data-config');
    if (configPath === '')
      configPath = System.baseURL + 'config.json';

    var main = __$curScript.getAttribute('data-main');

    if (!System.paths['@traceur'])
      System.paths['@traceur'] = typeof __$curScript != 'undefined' && __$curScript.getAttribute('data-traceur-src');

    (!configPath ? Promise.resolve() :
      Promise.resolve(System.fetch.call(System, { address: configPath, metadata: {} }))
      .then(JSON.parse)
      .then(System.config)
    ).then(function() {
      if (main)
        return System['import'](main);
    })
    ['catch'](function(e) {
      setTimeout(function() {
        throw e;
      })
    });
  }

};

function __eval(__source, __global, __address, __sourceMap) {
  try {
    __source = 'with(__global) { (function() { ' + __source + ' \n }).call(__global); }'
      + '\n//# sourceURL=' + __address
      + (__sourceMap ? '\n//# sourceMappingURL=' + __sourceMap : '');
    eval(__source);
  }
  catch(e) {
    if (e.name == 'SyntaxError')
      e.message = 'Evaluating ' + __address + '\n\t' + e.message;
    throw e;
  }
}

var __$curScript;

(function(global) {
  if (typeof window != 'undefined') {
    var scripts = document.getElementsByTagName('script');
    __$curScript = scripts[scripts.length - 1];

    if (!global.System || global.System.registerModule) {
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
    module.exports = global.System;
    global.upgradeSystemLoader();
  }
})(__$global);

})(typeof window != 'undefined' ? window : global);