/*
  SystemJS Global Format

  Supports
    metadata.deps
    metadata.init
    metadata.exports

  Also detects writes to the global object avoiding global collisions.
  See the SystemJS readme global support section for further information.
*/
function global(loader) {

  loader._extensions.push(global);

  function readGlobalProperty(p, value) {
    var pParts = p.split('.');
    while (pParts.length)
      value = value[pParts.shift()];
    return value;
  }

  var ignoredGlobalProps = ['indexedDB', 'sessionStorage', 'localStorage',
      'clipboardData', 'frames', 'webkitStorageInfo', 'toolbar', 'statusbar',
      'scrollbars', 'personalbar', 'menubar', 'locationbar', 'webkitIndexedDB',
      'screenTop', 'screenLeft', 'external'];

  var globalName = typeof window != 'undefined' ? 'window' : (typeof global != 'undefined' ? 'global' : 'self');

  try {
    var hasOwnProperty = loader.global.hasOwnProperty;
    // throws in Safari web-worker
    loader.global.hasOwnProperty('window');
  }
  catch(e) {
    hasOwnProperty = false;
  }

  function forEachGlobal(callback) {
    for (var g in loader.global) {
      var curGlobal;
      if (indexOf.call(ignoredGlobalProps, g) != -1)
        continue;
      if (hasOwnProperty && !loader.global.hasOwnProperty(g))
        continue;
      try {
        curGlobal = loader.global[g];
      } catch (e) {
        ignoredGlobalProps.push(g);
      }
      if (curGlobal !== loader.global)
        callback(g, curGlobal);
    }
  }

  function createHelpers(loader) {
    if (loader.has('@@global-helpers'))
      return;
    
    var moduleGlobals = {};

    var curGlobalObj;

    loader.set('@@global-helpers', loader.newModule({
      prepareGlobal: function(moduleName, deps) {
        // first, we add all the dependency modules to the global
        for (var i = 0; i < deps.length; i++) {
          var moduleGlobal = moduleGlobals[deps[i]];
          if (moduleGlobal)
            for (var m in moduleGlobal)
              loader.global[m] = moduleGlobal[m];
        }

        // now store a complete copy of the global object
        // in order to detect changes
        curGlobalObj = {};
        
        forEachGlobal(function(name, value) {
          curGlobalObj[name] = value;
        });
      },
      retrieveGlobal: function(moduleName, exportName, init) {
        var singleGlobal;
        var multipleExports;
        var exports = {};

        // run init
        if (init)
          singleGlobal = init.call(loader.global);

        // check for global changes, creating the globalObject for the module
        // if many globals, then a module object for those is created
        // if one global, then that is the module directly
        else if (exportName) {
          var firstPart = exportName.split('.')[0];
          singleGlobal = readGlobalProperty(exportName, loader.global);
          exports[firstPart] = loader.global[firstPart];
        }

        else {
          forEachGlobal(function(name, value) {
            if (curGlobalObj[name] === value)
              return;
            if (typeof value === 'undefined')
              return;
            exports[name] = value;
            if (typeof singleGlobal !== 'undefined') {
              if (!multipleExports && singleGlobal !== value)
                multipleExports = true;
            }
            else {
              singleGlobal = value;
            }
          });
        }

        moduleGlobals[moduleName] = exports;

        return multipleExports ? exports : singleGlobal;
      }
    }));
  }

  createHelpers(loader);

  var loaderInstantiate = loader.instantiate;
  loader.instantiate = function(load) {
    var loader = this;

    createHelpers(loader);

    var exportName = load.metadata.exports;

    if (!load.metadata.format)
      load.metadata.format = 'global';

    // global is a fallback module format
    if (load.metadata.format == 'global') {
      load.metadata.execute = function(require, exports, module) {

        loader.get('@@global-helpers').prepareGlobal(module.id, load.metadata.deps);

        if (exportName)
          load.source += globalName + '["' + exportName + '"] = ' + exportName + ';';

        // disable module detection
        var define = loader.global.define;
        var require = loader.global.require;
        
        loader.global.define = undefined;
        loader.global.module = undefined;
        loader.global.exports = undefined;

        loader.__exec(load);

        loader.global.require = require;
        loader.global.define = define;

        return loader.get('@@global-helpers').retrieveGlobal(module.id, exportName, load.metadata.init);
      }
    }
    return loaderInstantiate.call(loader, load);
  }
}
