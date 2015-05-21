/*
  SystemJS AMD Format
  Provides the AMD module format definition at System.format.amd
  as well as a RequireJS-style require on System.require
*/
(function() {
  // AMD Module Format Detection RegEx
  // define([.., .., ..], ...)
  // define(varName); || define(function(require, exports) {}); || define({})
  var amdRegEx = /(?:^\uFEFF?|[^$_a-zA-Z\xA0-\uFFFF.])define\s*\(\s*("[^"]+"\s*,\s*|'[^']+'\s*,\s*)?\s*(\[(\s*(("[^"]+"|'[^']+')\s*,|\/\/.*\r?\n|\/\*(.|\s)*?\*\/))*(\s*("[^"]+"|'[^']+')\s*,?)?(\s*(\/\/.*\r?\n|\/\*(.|\s)*?\*\/))*\s*\]|function\s*|{|[_$a-zA-Z\xA0-\uFFFF][_$a-zA-Z0-9\xA0-\uFFFF]*\))/;

  // script injection mode calls this function synchronously on load
  hook('onScriptLoad', function(onScriptLoad) {
    return function(load) {
      onScriptLoad.call(this, load);

      var lastModule = this.get('@@amd-helpers').lastModule;
      if (lastModule.anonDefine || lastModule.isBundle) {
        load.metadata.format = 'defined';
        load.metadata.registered = true;
        lastModule.isBundle = false;
      }

      if (lastModule.anonDefine) {
        load.metadata.deps = load.metadata.deps ? load.metadata.deps.concat(lastModule.anonDefine.deps) : lastModule.anonDefine.deps;
        load.metadata.execute = lastModule.anonDefine.execute;
        lastModule.anonDefine = null;
      }
    };
  });

  hook('fetch', function(fetch) {
    return function(load) {
      if (load.metadata.format === 'amd')
        load.metadata.scriptLoad = true;
      if (load.metadata.scriptLoad)
        this.get('@@amd-helpers').createDefine(this);
      return fetch.call(this, load);
    };
  });

  hook('instantiate', function(instantiate) {
    return function(load) {
      var loader = this;
      
      if (load.metadata.format == 'amd' || !load.metadata.format && load.source.match(amdRegEx)) {
        load.metadata.format = 'amd';
        
        if (loader.execute !== false) {
          var removeDefine = this.get('@@amd-helpers').createDefine(loader);

          __exec.call(loader, load);

          removeDefine(loader);

          var lastModule = this.get('@@amd-helpers').lastModule;

          if (!lastModule.anonDefine && !lastModule.isBundle)
            throw new TypeError('AMD module ' + load.name + ' did not define');

          if (lastModule.anonDefine) {
            load.metadata.deps = load.metadata.deps ? load.metadata.deps.concat(lastModule.anonDefine.deps) : lastModule.anonDefine.deps;
            load.metadata.execute = lastModule.anonDefine.execute;
          }

          lastModule.isBundle = false;
          lastModule.anonDefine = null;
        }

        return instantiate.call(loader, load);
      }

      return instantiate.call(loader, load);
    };
  });

})();
