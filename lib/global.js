/*
  SystemJS Global Format

  Supports
    metadata.deps
    metadata.globals
    metadata.exports

  Without metadata.exports, detects writes to the global object.
*/
(function() {

  var __globalName = typeof window != 'undefined' ? 'window' : (typeof global != 'undefined' ? 'global' : 'self');

  function readGlobalProperty(p, value) {
    var pParts = p.split('.');
    while (pParts.length)
      value = value[pParts.shift()];
    return value;
  }

  hook('onScriptLoad', function(onScriptLoad) {
    return function(load) {
      if (load.metadata.format == 'global') {
        load.metadata.registered = true;
        var globalValue = readGlobalProperty(load.metadata.exports, __global);
        load.metadata.execute = function() {
          return globalValue;
        }
      }
      return onScriptLoad.call(this, load);
    };
  });

  hook('fetch', function(fetch) {
    return function(load) {
      if (load.metadata.exports)
        load.metadata.format = 'global';

      // A global with exports, no globals and no deps
      // can be loaded via a script tag
      if (load.metadata.format == 'global' 
          && load.metadata.exports && !load.metadata.globals 
          && (!load.metadata.deps || load.metadata.deps.length == 0))
        load.metadata.scriptLoad = true;

      return fetch.call(this, load);
    };
  });

  // ideally we could support script loading for globals, but the issue with that is that
  // we can't do it with AMD support side-by-side since AMD support means defining the
  // global define, and global support means not definining it, yet we don't have any hook
  // into the "pre-execution" phase of a script tag being loaded to handle both cases

  hook('instantiate', function(instantiate) {
    return function(load) {
      var loader = this;

      if (!load.metadata.format)
        load.metadata.format = 'global';

      // global is a fallback module format
      if (load.metadata.format == 'global' && !load.metadata.registered) {
        load.metadata.execute = function(require, exports, module) {
          var exportName = load.metadata.exports;

          if (!exportName)
            loader.get('@@global-helpers').prepareGlobal(module.id);
          else
            load.source += '\n' + __globalName + '["' + exportName + '"] = ' + exportName + ';';

          // disable module detection
          var define = __global.define;
          var require = __global.require;
          
          __global.define = undefined;
          __global.module = undefined;
          __global.exports = undefined;

          // allow globals to be defined by other modules (including non globals)
          if (load.metadata.globals) {
            var globals = {};
            for (var g in load.metadata.globals)
              globals[g] = require(load.metadata.globals[g]);
          }

          __exec(load, globals);

          __global.require = require;
          __global.define = define;

          if (exportName)
            return readGlobalProperty(exportName, __global);
          else
            return loader.get('@@global-helpers').retrieveGlobal(module.id);
        }
      }
      return instantiate.call(this, load);
    };
  });
})();
