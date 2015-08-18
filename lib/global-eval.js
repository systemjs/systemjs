// we define a __exec for globally-scoped execution
// used by module format implementations
var __exec;

(function() {

  // System clobbering protection (mostly for Traceur)
  var curSystem;
  function preExec(loader) {
    curSystem = __global.System;
    __global.System = loader;
  }
  function postExec() {
    __global.System = curSystem;
  }

  var hasBtoa = typeof btoa != 'undefined';

  function getSource(load) {
    var lastLineIndex = load.source.lastIndexOf('\n');

    return load.source
        // adds the sourceURL comment if not already present
        + (load.source.substr(lastLineIndex, 15) != '\n//# sourceURL=' 
          ? '\n//# sourceURL=' + load.address + (load.metadata.sourceMap ? '!transpiled' : '') : '')
        // add sourceMappingURL if load.metadata.sourceMap is set
        + (load.metadata.sourceMap && hasBtoa && 
          '\n//# sourceMappingURL=data:application/json;base64,' + btoa(unescape(encodeURIComponent(load.metadata.sourceMap))) || '')
  }

  // Web Worker and Chrome Extensions use original ESML eval
  // this may lead to some global module execution differences (eg var not defining onto global)
  if (isWorker || isBrowser && window.chrome && window.chrome.extension) {
    __exec = function(load) {
      if (load.metadata.integrity)
        throw new Error('Subresource integrity checking is not supported in Web Workers or Chrome Extensions.');
      try {
        preExec(this);
        new Function(getSource(load)).call(__global);
        postExec();
      }
      catch(e) {
        throw addToError(e, 'Evaluating ' + load.address);
      }
    };
  }

  // use script injection eval to get identical global script behaviour
  else if (typeof document != 'undefined') {
    var head;

    var scripts = document.getElementsByTagName('script');
    $__curScript = scripts[scripts.length - 1];

    __exec = function(load) {
      if (!head)
        head = document.head || document.body || document.documentElement;

      var script = document.createElement('script');
      script.text = getSource(load);
      var onerror = window.onerror;
      var e;
      window.onerror = function(_e) {
        e = addToError(_e, 'Evaluating ' + load.address);
      }
      preExec(this);

      if (load.metadata.integrity)
        script.setAttribute('integrity', load.metadata.integrity);
      if (load.metadata.nonce)
        script.setAttribute('nonce', load.metadata.nonce);

      head.appendChild(script);
      head.removeChild(script);
      postExec();
      window.onerror = onerror;
      if (e)
        throw e;
    }
  }
  else {
    // global scoped eval for node
    var vmModule = 'vm';
    var vm = require(vmModule);
    __exec = function(load) {
      if (load.metadata.integrity)
        throw new Error('Subresource integrity checking is unavailable in Node.');
      try {
        preExec(this);
        vm.runInThisContext(getSource(load));
        postExec();
      }
      catch(e) {
        throw addToError(e.toString(), 'Evaluating ' + load.address);
      }
    };
  }

})();