/*
 * Extension to detect ES6 and auto-load Traceur or Babel for processing
 */
(function() {
  // good enough ES6 detection regex - format detections not designed to be accurate, but to handle the 99% use case
  var esRegEx = /(^\s*|[}\);\n]\s*)(import\s+(['"]|(\*\s+as\s+)?[^"'\(\)\n;]+\s+from\s+['"]|\{)|export\s+\*\s+from\s+["']|export\s+(\{|default|function|class|var|const|let|async\s+function))/;

  var traceurRuntimeRegEx = /\$traceurRuntime\s*\./;
  var babelHelpersRegEx = /babelHelpers\s*\./;

  function setMetaGlobal(loader, name) {
    var meta = loader.meta[name] = loader.meta[name] || {};
    meta.format = meta.format || 'global';
    if (name === 'traceur')
      meta.exports = 'traceur';
  }

  hookConstructor(function(constructor) {
    return function() {
      constructor.call(this);

      setMetaGlobal(this, 'babel');
      setMetaGlobal(this, 'traceur');
      setMetaGlobal(this, 'traceur-runtime');
      setMetaGlobal(this, 'babel/external-helpers.js');
      setMetaGlobal(this, 'typescript/bin/typescript.js');
    };
  });

  hook('translate', function(translate) {
    return function(load) {
      var loader = this;
      return translate.call(loader, load)
      .then(function(source) {
        // detect & transpile ES6
        if (load.metadata.format == 'es' || load.metadata.format == 'es6' || !load.metadata.format && source.match(esRegEx)) {
          load.metadata.format = 'es';          
          return transpile.call(loader, load);
        }

        if (load.metadata.format == 'register') {
          if (!__global.$traceurRuntime && load.source.match(traceurRuntimeRegEx)) {
            return loader['import']('traceur-runtime').then(function() {
              return source;
            });
          }
          if (!__global.babelHelpers && load.source.match(babelHelpersRegEx)) {
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
