/*
 * Extension to detect ES6 and auto-load Traceur or 6to5 for processing
 */
function es6(loader) {
  var parserName = loader.parser == '6to5' ? 'to5' : loader.parser;
  var parserModule = '@' + loader.parser;
  var parserRuntimeModule = '@' + loader.parser + '-runtime';
  var parserRuntimeGlobal = (parserName == 'to5' ? parserName : '$' + parserName) + 'Runtime';

  // good enough ES6 detection regex - format detections not designed to be accurate, but to handle the 99% use case
  var es6RegEx = /(^\s*|[}\);\n]\s*)(import\s+(['"]|(\*\s+as\s+)?[^"'\(\)\n;]+\s+from\s+['"]|\{)|export\s+\*\s+from\s+["']|export\s+(\{|default|function|class|var|const|let|async\s+function))/;

  var loaderTranslate = loader.translate;
  loader.translate = function(load) {
    var loader = this;

    if (load.name == parserModule || load.name == parserRuntimeModule)
      return loaderTranslate.call(loader, load);

    // detect ES6
    else if (load.metadata.format == 'es6' || !load.metadata.format && load.source.match(es6RegEx)) {
      load.metadata.format = 'es6';

      // dynamically load Traceur for ES6 if necessary
      if (!loader.global[parserName]) {
        return loader['import'](parserModule).then(function() {
          return loaderTranslate.call(loader, load);
        });
      }
    }

    // dynamicallly load Traceur runtime if necessary
    if (!loader.global[parserRuntimeGlobal] && load.source.indexOf(parserRuntimeGlobal) != -1) {
      var System = $__global.System;
      return loader['import'](parserRuntimeModule).then(function() {
        // traceur runtme annihilates System global
        $__global.System = System;
        return loaderTranslate.call(loader, load);
      });
    }

    return loaderTranslate.call(loader, load);
  }

  // always load Traceur as a global
  var loaderInstantiate = loader.instantiate;
  loader.instantiate = function(load) {
    var loader = this;
    if (load.name == parserModule || load.name == parserRuntimeModule) {
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

  // auto-detection of paths to loader parser files
  if (typeof $__curScript != 'undefined') {
    if (!System.paths[parserModule])
      System.paths[parserModule] = $__curScript.getAttribute('data-' + System.parser + '-src')
        || ($__curScript.src ? $__curScript.src.substr(0, $__curScript.src.lastIndexOf('/') + 1)
          : System.baseURL + (System.baseURL.lastIndexOf('/') == System.baseURL.length - 1 ? '' : '/')
          ) + System.parser + '.js';
    if (!System.paths[parserRuntimeModule])
      System.paths[parserRuntimeModule] = $__curScript.getAttribute('data-' + System.parser + '-runtime-src') || System.paths[parserModule].replace(/\.js$/, '-runtime.js');
  }

}