  if (!System.paths['@traceur'])
    System.paths['@traceur'] = $__curScript && $__curScript.getAttribute('data-traceur-src')
      || ($__curScript && $__curScript.src 
        ? $__curScript.src.substr(0, $__curScript.src.lastIndexOf('/') + 1) 
        : System.baseURL + (System.baseURL.lastIndexOf('/') == System.baseURL.length - 1 ? '' : '/')
        ) + 'traceur.js';
};

var $__curScript, __eval;

(function() {

  var doEval;

  __eval = function(source, address, sourceMap) {
    source += '\n//# sourceURL=' + address + (sourceMap ? '\n//# sourceMappingURL=' + sourceMap : '');

    try {
      doEval(source);
    }
    catch(e) {
      var msg = 'Error evaluating ' + address + '\n';
      if (e instanceof Error)
        e.message = msg + e.message;
      else
        e = msg + e;
      throw e;
    }
  };

  var isWorker = typeof WorkerGlobalScope !== 'undefined' &&
    self instanceof WorkerGlobalScope;
  var isBrowser = typeof window != 'undefined';

  if (isBrowser) {
    var head;

    var scripts = document.getElementsByTagName('script');
    $__curScript = scripts[scripts.length - 1];

    // globally scoped eval for the browser
    doEval = function(source) {
      if (!head)
        head = document.head || document.body || document.documentElement;

      var script = document.createElement('script');
      script.text = source;
      var onerror = window.onerror;
      var e;
      window.onerror = function(_e) {
        e = _e;
      }
      head.appendChild(script);
      head.removeChild(script);
      window.onerror = onerror;
      if (e)
        throw e;
    }

    if (!$__global.System || !$__global.LoaderPolyfill) {
      // determine the current script path as the base path
      var curPath = $__curScript.src;
      var basePath = curPath.substr(0, curPath.lastIndexOf('/') + 1);
      document.write(
        '<' + 'script type="text/javascript" src="' + basePath + 'es6-module-loader.js" data-init="upgradeSystemLoader">' + '<' + '/script>'
      );
    }
    else {
      $__global.upgradeSystemLoader();
    }
  }
  else if(isWorker) {
    doEval = function(source) {
      try {
        eval(source);
      } catch(e) {
        throw e;
      }
    };

    if (!$__global.System || !$__global.LoaderPolyfill) {
      var basePath = '';
      try {
        throw new TypeError('Unable to get Worker base path.');
      } catch(err) {
        var idx = err.stack.indexOf('at ') + 3;
        var withSystem = err.stack.substr(idx, err.stack.substr(idx).indexOf('\n'));
        basePath = withSystem.substr(0, withSystem.lastIndexOf('/') + 1);
      }
      importScripts(basePath + 'es6-module-loader.js');
    } else {
      $__global.upgradeSystemLoader();
    }
  }
  else {
    var es6ModuleLoader = require('es6-module-loader');
    $__global.System = es6ModuleLoader.System;
    $__global.Loader = es6ModuleLoader.Loader;
    $__global.upgradeSystemLoader();
    module.exports = $__global.System;

    // global scoped eval for node
    var vm = require('vm');
    doEval = function(source, address, sourceMap) {
      vm.runInThisContext(source);
    }
  }
})();

})(typeof window != 'undefined' ? window : (typeof WorkerGlobalScope != 'undefined' ?
                                           self : global));
