/*
  SystemJS Module Addon

  Supports the import "@module" for any module, providing the module meta:

  import { name } from "@module";

  Where name is the name of the current module.
*/
(function() {
  var systemNormalize = System.normalize;
  System.normalize = function(name, parentName, parentAddress) {
    if (name == '@module')
      return '@module:' + parentName;
    return systemNormalize.call(this, name, parentName, parentAddress);
  }
  var systemLocate = System.locate;
  System.locate = function(load) {
    if (load.name.substr(0, 7) == '@module') {
      load.metadata.module = {
        name: load.name.substr(8)
      };
      return '';
    }
    return systemLocate.call(this, load);
  }
  var systemFetch = System.fetch;
  System.fetch = function(load) {
    if (load.metadata.module)
      return '';
    return systemFetch.call(this, load);
  }
  var systemInstantiate = System.instantiate;
  System.instantiate = function(load) {
    if (load.metadata.module)
      return {
        deps: [],
        execute: function() {
          return new Module(load.metadata.module);
        }
      };
    return systemInstantiate.call(this, load);
  }
})();