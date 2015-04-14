hookConstructor(function(constructor) {
  return function() {
    var loader = this;
    constructor.call(loader);

    var hasOwnProperty = __global.hasOwnProperty;

    var curGlobalObj;
    var ignoredGlobalProps = ['_g', 'indexedDB', 'sessionStorage', 'localStorage',
        'clipboardData', 'frames', 'webkitStorageInfo', 'toolbar', 'statusbar',
        'scrollbars', 'personalbar', 'menubar', 'locationbar', 'webkitIndexedDB',
        'screenTop', 'screenLeft'];

    loader.set('@@global-helpers', loader.newModule({
      prepareGlobal: function(moduleName) {
        // store a complete copy of the global object in order to detect changes
        curGlobalObj = {};

        for (var g in __global) {
          if (indexOf.call(ignoredGlobalProps, g) != -1)
            continue;
          if (!hasOwnProperty || __global.hasOwnProperty(g)) {
            try {
              curGlobalObj[g] = __global[g];
            }
            catch (e) {
              ignoredGlobalProps.push(g);
            }
          }
        }
      },
      retrieveGlobal: function(moduleName) {
        var singleGlobal;
        var multipleExports;
        var exports;

        for (var g in __global) {
          if (indexOf.call(ignoredGlobalProps, g) != -1)
            continue;

          var value = __global[g];

          // see which globals differ from the previous copy to determine global exports
          if ((!hasOwnProperty || __global.hasOwnProperty(g)) 
              && g !== __global && curGlobalObj[g] !== value) {
            if (!exports) {
              // first property found
              exports = {};
              singleGlobal = value;
            }
            
            exports[g] = value;
            
            if (!multipleExports && singleGlobal !== value)
              multipleExports = true;
          }
        }

        return multipleExports ? exports : singleGlobal;
      }
    }));
  };
});