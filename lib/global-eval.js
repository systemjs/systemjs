// we define a __exec for globally-scoped execution
// used by module format implementations
var __exec;

(function() {

  // support sourceMappingURL extraction and normalization efficiently
  function getSource(load, globals, thisValue) {
    var sourceMappingURL;
    var lastLineIndex = load.source.lastIndexOf('\n');
    if (lastLineIndex != -1) {
      if (load.source.substr(lastLineIndex + 1, 21) == '//# sourceMappingURL=') {
        sourceMappingURL = load.source.substr(lastLineIndex + 22, load.source.length - lastLineIndex - 22);
        sourceMappingURL = new URL(sourceMappingURL, load.address).href;
      }
    }

    // optional global scoping
    var globalPrefix = '';
    var globalSuffix = '';
    if (globals) {
      __global._g = globals;
      for (var g in globals) {
        if (!globalPrefix) {
          globalPrefix = '(function(' + g;
          globalSuffix = '}).call(' + (thisValue ? '_g._this' : 'this') + ', _g["' + g + '"]';
        }
        else {
          globalPrefix += ', ' + g;
          globalSuffix += ', _g["' + g + '"]';
        }
      }
      if (globalPrefix) {
        globalPrefix += '){';
        globalSuffix += ');';
      }
      if (thisValue)
        __global._g._this = thisValue;
    }

    return globalPrefix + load.source + globalSuffix
        + (load.address ? '\n//# sourceURL=' + load.address : '')
        + (sourceMappingURL ? '\n//# sourceMappingURL=' + sourceMappingURL : '');
  }

  // use script injection eval to get identical global script behaviour
  if (typeof document != 'undefined') {
    var head;

    var scripts = document.getElementsByTagName('script');
    $__curScript = scripts[scripts.length - 1];

    __exec = function(load, globals, thisValue) {
      if (!head)
        head = document.head || document.body || document.documentElement;

      var script = document.createElement('script');
      script.text = getSource(load, globals, thisValue);
      var onerror = window.onerror;
      var e;
      window.onerror = function(_e) {
        e = addToError(_e, 'Evaluating ' + load.address);
      }
      head.appendChild(script);
      head.removeChild(script);
      __global._g = undefined;
      window.onerror = onerror;
      if (e)
        throw e;
    }
  }
  // Web Worker uses original ESML eval
  // this may lead to some global module execution differences (eg var not defining onto global)
  else if (typeof WorkerGlobalScope != 'undefined') {
    __exec = function(load, globals, thisValue) {
      try {
        new Function(getSource(load, globals, thisValue)).call(__global);
        __global._g = undefined;
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
    __exec = function(load, globals, thisValue) {
      try {
        vm.runInThisContext(getSource(load, globals, thisValue));
        __global._g = undefined;
      }
      catch(e) {
        throw addToError(e, 'Evaluating ' + load.address);
      }
    };
  }

  hook('instantiate', function(instantiate) {
    return function(load) {
      load.metadata.deps = load.metadata.deps || [];
      for (var g in load.metadata.globals)
        load.metadata.deps.push(load.metadata.globals[g]);
      return instantiate.call(this, load);
    };
  });

})();