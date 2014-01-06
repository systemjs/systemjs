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
(function() {
  System.formats.push('global');

  // Global
  var globalShimRegEx = /(["']global["'];\s*)((['"]import [^'"]+['"];\s*)*)(['"]export ([^'"]+)["'])?/;
  var globalImportRegEx = /(["']import [^'"]+)+/g;

  // given a module's global dependencies, prepare the global object
  // to contain the union of the defined properties of its dependent modules
  var moduleGlobals = {};

  // also support a System.shim system
  System.shim = {};

  System.format.global = {
    detect: function(source, load) {
      var match, deps;
      if (match = source.match(globalShimRegEx)) {
        deps = match[2].match(globalImportRegEx);
        if (deps)
          for (var i = 0; i < deps.length; i++)
            deps[i] = deps[i].substr(8);
        load.metadata.globalExport = match[5];
      }
      deps = deps || [];
      var shim;
      if (shim = System.shim[load.name]) {
        if (typeof shim == 'object') {
          if (shim.exports)
            load.metadata.globalExport = shim.exports;
          if (shim.imports)
            shim = shim.imports;
        }
        if (shim instanceof Array)
          deps = deps.concat(shim);
      }
      return deps;
    },
    execute: function(load, depMap, global, execute) {
      var globalExport = load.metadata.globalExport;

      // first, we add all the dependency module properties to the global
      // NB cheat here for System iteration
      for (var d in depMap) {
        var module = depMap[d];
        var moduleGlobal;
        for (var m in System._modules) {
          if (System._modules[m] === module) {
            moduleGlobal = moduleGlobals[m];
            break;
          }
        }
        if (moduleGlobal)
          for (var m in moduleGlobal)
            global[m] = moduleGlobal[m];
      }

      // now store a complete copy of the global object
      // in order to detect changes
      var globalObj = {};
      for (var g in global)
        if (global.hasOwnProperty(g))
          globalObj[g] = global[g];

      if (globalExport)
        load.source += '\nthis["' + globalExport + '"] = ' + globalExport;

      execute();

      // check for global changes, creating the globalObject for the module
      // if many globals, then a module object for those is created
      // if one global, then that is the module directly
      var singleGlobal, moduleGlobal;
      if (globalExport) {
        singleGlobal = eval('global.' + globalExport);
        moduleGlobal = {};
        moduleGlobal[globalExport.split('.')[0]] = singleGlobal;
      }
      else {
        moduleGlobal = {};
        for (var g in global) {
          if (global.hasOwnProperty(g) && g != global && globalObj[g] != global[g]) {
            moduleGlobal[g] = global[g];
            if (singleGlobal) {
              if (singleGlobal !== global[g])
                singleGlobal = false;
            }
            else if (singleGlobal !== false)
              singleGlobal = global[g];
          }
        }
      }
      moduleGlobals[name] = moduleGlobal;
      
      if (singleGlobal)
        return singleGlobal;
      else
        return new Module(moduleGlobal);
    }
  };
})();