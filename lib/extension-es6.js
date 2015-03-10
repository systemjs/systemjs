/*
 * Extension to detect ES6 and auto-load Traceur or Babel for processing
 */
function es6(loader) {

  loader._extensions.push(es6);

  var autoLoadTranspiler = typeof window !== 'undefined' || typeof WorkerGlobalScope !== 'undefined';

  function setConfig(module) {
    loader.meta[module] = {format: 'global'};
    loader.paths[module] = loader.paths[module] || module + '.js';
  }
  
  setConfig('traceur');
  loader.meta['traceur'].exports = 'traceur';
  setConfig('traceur-runtime');
  setConfig('babel');
  setConfig('babel-runtime');

  // good enough ES6 detection regex - format detections not designed to be accurate, but to handle the 99% use case
  var es6RegEx = /(^\s*|[}\);\n]\s*)(import\s+(['"]|(\*\s+as\s+)?[^"'\(\)\n;]+\s+from\s+['"]|\{)|export\s+\*\s+from\s+["']|export\s+(\{|default|function|class|var|const|let|async\s+function))/;

  var loaderTranslate = loader.translate;
  loader.translate = function(load) {
    var loader = this;

    return loaderTranslate.call(loader, load)
    .then(function(source) {

      // detect ES6
      if (load.metadata.format == 'es6' || !load.metadata.format && source.match(es6RegEx)) {
        load.metadata.format = 'es6';

        // dynamically load transpiler for ES6 if necessary
        if (autoLoadTranspiler && !$__global[loader.transpiler])
          return loader['import'](loader.transpiler).then(function() {
            return source;
          });
      }

      // ensure Traceur doesn't clobber the System global
      if (load.name == 'traceur' || load.name == 'traceur-runtime')
        return '(function() { var curSystem = System; ' + source + '\nSystem = curSystem; })();';

      return source;
    });

  };

}
