/*
 * Extension to detect ES6 and auto-load Traceur or Babel for processing
 */
(function() {
  // good enough ES6 module detection regex - format detections not designed to be accurate, but to handle the 99% use case
  var esmRegEx = /(^\s*|[}\);\n]\s*)(import\s+(['"]|(\*\s+as\s+)?[^"'\(\)\n;]+\s+from\s+['"]|\{)|export\s+\*\s+from\s+["']|export\s+(\{|default|function|class|var|const|let|async\s+function))/;

  var traceurRuntimeRegEx = /\$traceurRuntime\s*\./;
  var babelHelpersRegEx = /babelHelpers\s*\./;

  hook('translate', function(translate) {
    return function(load) {
      var loader = this;
      return translate.call(loader, load)
      .then(function(source) {
        // detect & transpile ES6
        if (load.metadata.format == 'esm' || load.metadata.format == 'es6' || !load.metadata.format && source.match(esmRegEx)) {
          load.metadata.format = 'esm';
          loader.meta[loader.normalizeSync(loader.transpiler)] = {format: 'global'};
          if (loader.transpiler === 'traceur')
            loader.meta[loader.normalizeSync(loader.transpiler)].exports = 'traceur';
          return transpile.call(loader, load);
        }

        if (load.metadata.format == 'register') {
          if (!__global.$traceurRuntime && load.source.match(traceurRuntimeRegEx)) {
            loader.meta[loader.normalizeSync('traceur-runtime')] = {format: 'global'};
            return loader['import']('traceur-runtime').then(function() {
              return source;
            });
          }
          if (!__global.babelHelpers && load.source.match(babelHelpersRegEx)) {
            loader.meta[loader.normalizeSync('babel/external-helpers*')] = {format: 'global'};
            return loader['import']('babel/external-helpers').then(function() {
              return source;
            });
          }
        }

        return source;
      });
    };
  });

})();
