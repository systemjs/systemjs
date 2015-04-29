/*
  SystemJS Global Format

  Supports
    metadata.deps
    metadata.globals
    metadata.exports

  Without metadata.exports, detects writes to the global object.
*/
(function() {

  function readGlobalProperty(p, value) {
    var pParts = p.split('.');
    while (pParts.length)
      value = value[pParts.shift()];
    return value;
  }

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
      if (load.metadata.format == 'global') {
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
