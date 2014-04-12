/*
  SystemJS Global Format
  Provides the global support at System.format.global
  Supports inline shim syntax with:
    "global";
    "import jquery";
    "export my.Global";

  Also detects writes to the global object avoiding global collisions.
  See the SystemJS readme global support section for further information.
*/
function formatGlobal(loader) {
  loader.formats.push('global');

  // Global
  var globalShimRegEx = /(["']global["'];\s*)((['"]import [^'"]+['"];\s*)*)(['"]export ([^'"]+)["'])?/;
  var globalImportRegEx = /(["']import [^'"]+)+/g;

  // given a module's global dependencies, prepare the global object
  // to contain the union of the defined properties of its dependent modules
  var moduleGlobals = {};

  // also support a loader.shim system
  loader.shim = {};

  loader.format.global = {
    detect: function() {
      return true;
    },
    deps: function(load) {
      var match, deps;
      if (match = load.source.match(globalShimRegEx)) {
        deps = match[2].match(globalImportRegEx);
        if (deps)
          for (var i = 0; i < deps.length; i++)
            deps[i] = deps[i].substr(8);
        load.metadata.exports = match[5];
      }
      deps = deps || [];
      if (load.metadata.deps)
        deps = deps.concat(load.metadata.deps);
      return deps;
    },
    execute: function(depNames, load) {
      var hasOwnProperty = loader.global.hasOwnProperty;
      var globalExport = load.metadata.exports;

      // first, we add all the dependency module properties to the global
      for (var i = 0; i < depNames.length; i++) {
        var moduleGlobal = moduleGlobals[depNames[i]];
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

      // check for global changes, creating the globalObject for the module
      // if many globals, then a module object for those is created
      // if one global, then that is the module directly
      var singleGlobal, moduleGlobal;
      if (globalExport) {
        var firstPart = globalExport.split('.')[0];
        singleGlobal = eval.call(loader.global, globalExport);
        moduleGlobal = {};
        moduleGlobal[firstPart] = loader.global[firstPart];
      }
      else {
        moduleGlobal = {};
        for (var g in loader.global) {
          if (!hasOwnProperty && (g == 'sessionStorage' || g == 'localStorage' || g == 'clipboardData' || g == 'frames'))
            continue;
          if ((!hasOwnProperty || loader.global.hasOwnProperty(g)) && g != loader.global && globalObj[g] != loader.global[g]) {
            moduleGlobal[g] = loader.global[g];
            if (singleGlobal) {
              if (singleGlobal !== loader.global[g])
                singleGlobal = false;
            }
            else if (singleGlobal !== false)
              singleGlobal = loader.global[g];
          }
        }
      }
      moduleGlobals[load.name] = moduleGlobal;
      
      if (singleGlobal)
        return singleGlobal;
      else
        return new Module(moduleGlobal);
    }
  };
}
