/*
 * Extension to detect ES6 and auto-load Traceur or Babel for processing
 */
function es6(loader) {

  loader._extensions.push(es6);

  var transpiler, transpilerModule, transpilerRuntimeModule, transpilerRuntimeGlobal;

  var isBrowser = typeof window != 'undefined';

  function setTranspiler(name) {
    transpiler = name;
    transpilerModule = '@' + transpiler;
    transpilerRuntimeModule = transpilerModule + (transpiler == 'babel' ? '-helpers' : '-runtime');
    transpilerRuntimeGlobal = transpiler == 'babel' ? transpiler + 'Helpers' : '$' + transpiler + 'Runtime';

    // auto-detection of paths to loader transpiler files
    var scriptBase;
    if ($__curScript && $__curScript.src)
      scriptBase = $__curScript.src.substr(0, $__curScript.src.lastIndexOf('/') + 1);
    else
      scriptBase = loader.baseURL + (loader.baseURL.lastIndexOf('/') == loader.baseURL.length - 1 ? '' : '/');

    if (!loader.paths[transpilerModule])
      loader.paths[transpilerModule] = $__curScript && $__curScript.getAttribute('data-' + loader.transpiler + '-src') || scriptBase + loader.transpiler + '.js';
    
    if (!loader.paths[transpilerRuntimeModule])
      loader.paths[transpilerRuntimeModule] = $__curScript && $__curScript.getAttribute('data-' + transpilerRuntimeModule.substr(1) + '-src') || scriptBase + transpilerRuntimeModule.substr(1) + '.js';
  }

  // good enough ES6 detection regex - format detections not designed to be accurate, but to handle the 99% use case
  var es6RegEx = /(^\s*|[}\);\n]\s*)(import\s+(['"]|(\*\s+as\s+)?[^"'\(\)\n;]+\s+from\s+['"]|\{)|export\s+\*\s+from\s+["']|export\s+(\{|default|function|class|var|const|let|async\s+function))/;

  var loaderTranslate = loader.translate;
  loader.translate = function(load) {
    // update transpiler info if necessary
    if (this.transpiler !== transpiler)
      setTranspiler(this.transpiler);

    var loader = this;

    if (load.name == transpilerModule || load.name == transpilerRuntimeModule)
      return loaderTranslate.call(loader, load);

    // detect ES6
    else if (load.metadata.format == 'es6' || !load.metadata.format && load.source.match(es6RegEx)) {
      load.metadata.format = 'es6';

      // dynamically load transpiler for ES6 if necessary
      if (isBrowser && !loader.global[transpiler])
        return loader['import'](transpilerModule).then(function() {
          return loaderTranslate.call(loader, load);
        });
    }

    // dynamically load transpiler runtime if necessary
    if (isBrowser && !loader.global[transpilerRuntimeGlobal] && load.source.indexOf(transpilerRuntimeGlobal) != -1) {
      var System = $__global.System;
      return loader['import'](transpilerRuntimeModule).then(function() {
        // traceur runtme annihilates System global
        $__global.System = System;
        return loaderTranslate.call(loader, load);
      });
    }

    return loaderTranslate.call(loader, load);
  }

  // always load transpiler as a global
  var loaderInstantiate = loader.instantiate;
  loader.instantiate = function(load) {
    var loader = this;
    if (isBrowser && (load.name == transpilerModule || load.name == transpilerRuntimeModule)) {
      loader.__exec(load);
      return {
        deps: [],
        execute: function() {
          return loader.newModule({});
        }
      };
    }
    return loaderInstantiate.call(loader, load);
  }

}
