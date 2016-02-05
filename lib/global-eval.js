// we define a __exec for globally-scoped execution
// used by module format implementations
var __exec;

(function() {

  var hasBtoa = typeof btoa != 'undefined';

  // used to support leading #!/usr/bin/env in scripts as supported in Node
  var hashBangRegEx = /^\#\!.*/;

  function getSource(load, sourceMapOffset) {
    var lastLineIndex = load.source.lastIndexOf('\n');

    // wrap all formats with a System closure for System global encapsulation
    var wrap = load.metadata.format == 'esm' || load.metadata.format == 'register' || load.metadata.bundle;

    var sourceMap = load.metadata.sourceMap;
    if (sourceMap) {
      if (typeof sourceMap != 'object')
        throw new TypeError('load.metadata.sourceMap must be set to an object.');

      if (sourceMapOffset && sourceMap.mappings)
        sourceMap.mappings = ';' + sourceMap.mappings;
    }
    
    sourceMap = JSON.stringify(sourceMap);

    return (wrap ? '(function(System, SystemJS) {' : '') + (load.metadata.format == 'cjs' ? load.source.replace(hashBangRegEx, '') : load.source) + (wrap ? '\n})(System, System);' : '')
        // adds the sourceURL comment if not already present
        + (load.source.substr(lastLineIndex, 15) != '\n//# sourceURL=' 
          ? '\n//# sourceURL=' + load.address + (sourceMap ? '!transpiled' : '') : '')
        // add sourceMappingURL if load.metadata.sourceMap is set
        + (sourceMap && hasBtoa && '\n//# sourceMappingURL=data:application/json;base64,' + btoa(unescape(encodeURIComponent(sourceMap))) || '');
  }

  var curLoad;

  // System.register, System.registerDynamic, AMD define pipeline
  // if currently evalling code here, immediately reduce the registered entry against the load record
  hook('pushRegister_', function() {
    return function(register) {
      if (!curLoad)
        return false;

      this.reduceRegister_(curLoad, register);
      return true;
    };
  });

  // System clobbering protection (mostly for Traceur)
  var curSystem;
  var callCounter = 0;
  __exec = function(load) {
    if (load.metadata.integrity)
      throw new TypeError('Subresource integrity checking is only supported on modules with scriptLoad:true metadata or through the SystemCSP build.');
    try {
      if (callCounter++ == 0)
        curSystem = __global.System;
      __global.System = __global.SystemJS = this;
      curLoad = load;
      (0, eval)(getSource(load, true));
      if (--callCounter == 0)
        __global.System = __global.SystemJS = curSystem;
      curLoad = undefined;
    }
    catch(e) {
      if (--callCounter == 0)
        __global.System = __global.SystemJS = curSystem;
      curLoad = undefined;
      throw addToError(e, 'Evaluating ' + load.address);
    }
  };

})();