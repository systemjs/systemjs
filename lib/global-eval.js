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

  // support sourceMappingURL extraction and normalization efficiently
  function getSource(load) {
    var sourceMappingURL;
    var lastLineIndex = load.source.lastIndexOf('\n');
    if (lastLineIndex != -1) {
      if (load.source.substr(lastLineIndex + 1, 21) == '//# sourceMappingURL=') {
        sourceMappingURL = load.source.substr(lastLineIndex + 22, load.source.length - lastLineIndex - 22);
        sourceMappingURL = new URL(sourceMappingURL, load.address).href;
      }
    }

    return load.source
        + (load.address ? '\n//# sourceURL=' + load.address : '')
        + (sourceMappingURL ? '\n//# sourceMappingURL=' + sourceMappingURL : '');
  }

  // use script injection eval to get identical global script behaviour
  if (typeof document != 'undefined') {
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
      head.appendChild(script);
      head.removeChild(script);
      postExec();
      window.onerror = onerror;
      if (e)
        throw e;
    }
  }
  // Web Worker uses original ESML eval
  // this may lead to some global module execution differences (eg var not defining onto global)
  else if (isWorker) {
    __exec = function(load) {
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
  else {
    // global scoped eval for node
    var vmModule = 'vm';
    var vm = require(vmModule);
    __exec = function(load) {
      try {
        preExec(this);
        vm.runInThisContext(getSource(load));
        postExec();
      }
      catch(e) {
        throw addToError(e, 'Evaluating ' + load.address);
      }
    };
  }

})();