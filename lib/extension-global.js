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
  var loaderInstantiate = loader.instantiate;
  loader.instantiate = function(load) {
    var loader = this;

    // global is a fallback module format
    if (load.metadata.format == 'global' || !load.metadata.format) {
      load.metadata.deps = load.metadata.deps || [];
      var deps = load.metadata.deps;

      var moduleGlobals = loader.moduleGlobals = loader.moduleGlobals || {};
      var globalExport = load.metadata.exports;
      var init = load.metadata.init;

      load.metadata.execute = function(require, exports, moduleName) {
        var hasOwnProperty = loader.global.hasOwnProperty;

        // first, we add all the dependency modules to the global
        for (var i = 0; i < deps.length; i++) {
          var moduleGlobal = moduleGlobals[deps[i]];
          if (moduleGlobal)
            for (var m in moduleGlobal)
              loader.global[m] = moduleGlobal[m];
        }

        // now store a complete copy of the global object
        // in order to detect changes
        var globalObj = {};
        for (var g in loader.global)
          if (!hasOwnProperty || loader.global.hasOwnProperty(g))
            globalObj[g] = loader.global[g];

        if (globalExport)
          load.source += '\nthis["' + globalExport + '"] = ' + globalExport;

        loader.__exec(load);

        var singleGlobal;

        // run init
        if (init) {
          var depModules = [];
          for (var i = 0; i < deps.length; i++)
            depModules.push(require(deps[i]));
          singleGlobal = init.apply(loader.global, depModules);
        }

        // check for global changes, creating the globalObject for the module
        // if many globals, then a module object for those is created
        // if one global, then that is the module directly
        if (globalExport && !singleGlobal) {
          var firstPart = globalExport.split('.')[0];
          singleGlobal = eval.call(loader.global, globalExport);
          exports[firstPart] = loader.global[firstPart];
        }

        else {
          for (var g in loader.global) {
            if (!hasOwnProperty && (g == 'sessionStorage' || g == 'localStorage' || g == 'clipboardData' || g == 'frames'))
              continue;
            if ((!hasOwnProperty || loader.global.hasOwnProperty(g)) && g != loader.global && globalObj[g] != loader.global[g]) {
              exports[g] = loader.global[g];
              if (singleGlobal) {
                if (singleGlobal !== loader.global[g])
                  singleGlobal = false;
              }
              else if (singleGlobal !== false)
                singleGlobal = loader.global[g];
            }
          }
        }
        moduleGlobals[load.name] = exports;

        var module = singleGlobal ? singleGlobal : exports;

        return { __useDefault: true, 'default': module };
      }
    }
    return loaderInstantiate.call(loader, load);
  }
}