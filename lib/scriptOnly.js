/*
 * Script-only addition used for production loader
 *
 */

hook('fetch', function(fetch) {
  return function(load) {
    load.metadata.scriptLoad = true;
    // prepare amd define
    this.get('@@amd-helpers').createDefine(this);
    return fetch.call(this, load);
  };
});

// AMD support
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