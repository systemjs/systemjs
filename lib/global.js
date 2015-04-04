/*
  SystemJS Global Format

  Supports
    metadata.deps
    metadata.init
    metadata.exports

  Also detects writes to the global object avoiding global collisions.
  See the SystemJS readme global support section for further information.
*/
(function() {

  function readGlobalProperty(p, value) {
    var pParts = p.split('.');
    while (pParts.length)
      value = value[pParts.shift()];
    return value;
  }

  hookConstructor(function(constructor) {
    return function() {
      var loader = this;
      constructor.call(loader);

      var hasOwnProperty = __global.hasOwnProperty;
      var moduleGlobals = {};

      var curGlobalObj;
      var ignoredGlobalProps;

      loader.set('@@global-helpers', loader.newModule({
        prepareGlobal: function(moduleName, deps) {
          // first, we add all the dependency modules to the global
          for (var i = 0; i < deps.length; i++) {
            var moduleGlobal = moduleGlobals[deps[i]];
            if (moduleGlobal)
              for (var m in moduleGlobal)
                __global[m] = moduleGlobal[m];
          }

          // now store a complete copy of the global object
          // in order to detect changes
          curGlobalObj = {};
          ignoredGlobalProps = ['indexedDB', 'sessionStorage', 'localStorage',
            'clipboardData', 'frames', 'webkitStorageInfo', 'toolbar', 'statusbar',
            'scrollbars', 'personalbar', 'menubar', 'locationbar', 'webkitIndexedDB',
            'screenTop', 'screenLeft'
          ];
          for (var g in __global) {
            if (indexOf.call(ignoredGlobalProps, g) != -1) { continue; }
            if (!hasOwnProperty || __global.hasOwnProperty(g)) {
              try {
                curGlobalObj[g] = __global[g];
              } catch (e) {
                ignoredGlobalProps.push(g);
              }
            }
          }
        },
        retrieveGlobal: function(moduleName, exportName, init) {
          var singleGlobal;
          var multipleExports;
          var exports = {};

          // run init
          if (init)
            singleGlobal = init.call(__global);

          // check for global changes, creating the globalObject for the module
          // if many globals, then a module object for those is created
          // if one global, then that is the module directly
          else if (exportName) {
            var firstPart = exportName.split('.')[0];
            singleGlobal = readGlobalProperty(exportName, __global);
            exports[firstPart] = __global[firstPart];
          }

          else {
            for (var g in __global) {
              if (indexOf.call(ignoredGlobalProps, g) != -1)
                continue;
              if ((!hasOwnProperty || __global.hasOwnProperty(g)) && g != __global && curGlobalObj[g] != __global[g]) {
                exports[g] = __global[g];
                if (singleGlobal) {
                  if (singleGlobal !== __global[g])
                    multipleExports = true;
                }
                else if (singleGlobal !== false) {
                  singleGlobal = __global[g];
                }
              }
            }
          }

          moduleGlobals[moduleName] = exports;

          return multipleExports ? exports : singleGlobal;
        }
      }));
    };
  });

  hook('instantiate', function(instantiate) {
    return function(load) {
      var loader = this;

      var exportName = load.metadata.exports;

      if (!load.metadata.format)
        load.metadata.format = 'global';

      // global is a fallback module format
      if (load.metadata.format == 'global') {
        load.metadata.execute = function(require, exports, module) {

          loader.get('@@global-helpers').prepareGlobal(module.id, load.metadata.deps);

          if (exportName)
            load.source += '\nthis["' + exportName + '"] = ' + exportName + ';';

          // disable module detection
          var define = __global.define;
          var require = __global.require;
          
          __global.define = undefined;
          __global.module = undefined;
          __global.exports = undefined;

          __exec(load);

          __global.require = require;
          __global.define = define;

          return loader.get('@@global-helpers').retrieveGlobal(module.id, exportName, load.metadata.init);
        }
      }
      return instantiate.call(loader, load);
    };
  });
})();
