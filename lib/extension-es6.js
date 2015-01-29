/*
 * Extension to detect ES6 and auto-load Traceur or 6to5 for processing
 */
function es6(loader) {

  loader._extensions.push(es6);

  var parser, parserName, parserModule, parserRuntimeModule, parserRuntimeGlobal;

  var isBrowser = typeof window != 'undefined';

  function setParser(name) {
    parser = name;
    parserName = this.parser == '6to5' ? 'to5' : parser;
    parserModule = '@' + parser;
    parserRuntimeModule = '@' + parser + '-runtime';
    parserRuntimeGlobal = (parserName == 'to5' ? parserName : '$' + parserName) + 'Runtime';

    // auto-detection of paths to loader parser files
    if (typeof $__curScript != 'undefined') {
      if (!loader.paths[parserModule])
        loader.paths[parserModule] = $__curScript.getAttribute('data-' + loader.parser + '-src')
          || ($__curScript.src ? $__curScript.src.substr(0, $__curScript.src.lastIndexOf('/') + 1)
            : loader.baseURL + (loader.baseURL.lastIndexOf('/') == loader.baseURL.length - 1 ? '' : '/')
            ) + loader.parser + '.js';
      if (!loader.paths[parserRuntimeModule])
        loader.paths[parserRuntimeModule] = $__curScript.getAttribute('data-' + loader.parser + '-runtime-src') || loader.paths[parserModule].replace(/\.js$/, '-runtime.js');
    }
  }

  // good enough ES6 detection regex - format detections not designed to be accurate, but to handle the 99% use case
  var es6RegEx = /(^\s*|[}\);\n]\s*)(import\s+(['"]|(\*\s+as\s+)?[^"'\(\)\n;]+\s+from\s+['"]|\{)|export\s+\*\s+from\s+["']|export\s+(\{|default|function|class|var|const|let|async\s+function))/;

  var loaderTranslate = loader.translate;
  loader.translate = function(load) {
    // update parser info if necessary
    if (this.parser !== parser)
      setParser(this.parser);

    var loader = this;

    if (load.name == parserModule || load.name == parserRuntimeModule)
      return loaderTranslate.call(loader, load);

    // detect ES6
    else if (load.metadata.format == 'es6' || !load.metadata.format && load.source.match(es6RegEx)) {
      load.metadata.format = 'es6';

      // dynamically load parser for ES6 if necessary
      if (isBrowser && !loader.global[parserName]) {
        return loader['import'](parserModule).then(function() {
          return loaderTranslate.call(loader, load);
        });
      }
    }

    // dynamically load parser runtime if necessary
    if (isBrowser && !loader.global[parserRuntimeGlobal] && load.source.indexOf(parserRuntimeGlobal) != -1) {
      var System = $__global.System;
      return loader['import'](parserRuntimeModule).then(function() {
        // traceur runtme annihilates System global
        $__global.System = System;
        return loaderTranslate.call(loader, load);
      });
    }

    return loaderTranslate.call(loader, load);
  }

  // always load parser as a global
  var loaderInstantiate = loader.instantiate;
  loader.instantiate = function(load) {
    var loader = this;
    if (isBrowser && (load.name == parserModule || load.name == parserRuntimeModule)) {
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
