/*
  SystemJS Global Format

  Supports
    metadata.deps
    metadata.exports

  As well as additional globals that should be defined from existing module values:

    metadata.globals = {
      $: 'jquery'
    }

  Also detects writes to the global object avoiding global collisions.
  See the SystemJS readme global support section for further information.
*/
function global(loader) {

  var global = loader.global;

  var ignoredGlobalProps = ['indexedDB', 'sessionStorage', 'localStorage', 'clipboardData', 'frames', 'webkitStorageInfo', 'errorOnAccess'];
  // dummy variable to ensure access below isn't optimized out
  var lastGlobal;
  var hasOwnProperty = loader.global.hasOwnProperty;
  function allowedGlobal(p) {
    if (indexOf.call(ignoredGlobalProps, p) != -1)
      return false;
    if (hasOwnProperty && !global.hasOwnProperty(p))
      return false;
    try {
      lastGlobal = global[p];
      return true;
    }
    catch(e) {
      ignoredGlobalProps.push(p);
      return false;
    }
  }

  function createHelpers(loader) {
    if (loader.has('@@global-helpers'))
      return;

    var moduleGlobals = {};

    var curGlobalObj;

    loader.set('@@global-helpers', loader.newModule({
      prepareGlobal: function(moduleName, deps, globals, require) {
        // first, we add all the dependency modules to the global
        for (var i = 0; i < deps.length; i++) {
          var moduleGlobal = moduleGlobals[deps[i]];
          if (moduleGlobal)
            for (var m in moduleGlobal)
              global[m] = moduleGlobal[m];
        }

        // next we set the globals from the imports object
        if (globals) {
          for (var m in globals)
            global[m] = require(globals[m]);
        }

        // now store a complete copy of the global object
        // in order to detect changes
        curGlobalObj = {};
        
        for (var g in global) {
          if (!allowedGlobal(g))
            continue;
          curGlobalObj[g] = global[g];
        }
      },
      retrieveGlobal: function(moduleName, exportName) {
        var singleGlobal;
        var multipleExports;
        var exports = {};

        // check for global changes, creating the globalObject for the module
        // if many globals, then a module object for those is created
        // if one global, then that is the module directly
        if (exportName) {
          var firstPart = exportName.split('.')[0];
          singleGlobal = eval.call(global, exportName);
          exports[firstPart] = global[firstPart];
        }

        else {
          for (var g in global) {
            if (!allowedGlobal(g) || global[g] === curGlobalObj[g])
              continue;
            exports[g] = global[g];
            if (singleGlobal) {
              if (singleGlobal !== global[g])
                multipleExports = true;
            }
            else if (singleGlobal !== false) {
              singleGlobal = global[g];
            }
          }
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
      var normalizedDeps;
      var deps = load.metadata.deps;
      var globals = load.metadata.globals;

      load.metadata.execute = function(require, exports, module) {

        loader.get('@@global-helpers').prepareGlobal(module.id, normalizedDeps, globals, require);

        if (exportName)
          load.source += '\nthis["' + exportName + '"] = ' + exportName + ';';

        if (globals) {
          // create a closure for all the globals so they remain correctly linked
          // even if they get overritten on the global object
          var globalNames;
          for (var m in globals) {
            if (globalNames)
              globalNames = ', ' + m;
            else
              globalNames = m;
          }
          load.source = '(function(' + globalNames + ') {' + load.source + '\n}).call(this, ' + globalNames + ');';
        }

        // disable AMD detection
        var define = loader.global.define;
        loader.global.define = undefined;

        // ensure no NodeJS environment detection
        loader.global.module = undefined;
        loader.global.exports = undefined;

        loader.__exec(load);

        loader.global.define = define;

        return loader.get('@@global-helpers').retrieveGlobal(module.id, exportName);
      }

      // add dep globals as dependencies if not already
      if (globals) {
        for (var m in globals) {
          if (deps.indexOf(globals[m]) == -1)
            deps.push(globals[m]);
        }
      }

      var normalizePromises = [];
      for (var i = 0, l = deps.length; i < l; i++)
        normalizePromises.push(Promise.resolve(loader.normalize(deps[i], load.name, load.address)));
      
      return Promise.all(normalizePromises).then(function(_normalizedDeps) {
        normalizedDeps = _normalizedDeps;
        return loaderInstantiate.call(loader, load);
      });
    }
    return loaderInstantiate.call(loader, load);
  }
}
