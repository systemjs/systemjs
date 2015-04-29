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
      setMetaGlobal(this, 'babel/external-helpers');
    };
  });

  // these should really be instance variables
  var traceurNormalized, traceurRuntimeNormalized;

  // to ensure Traceur doesn't clobber System global
  // we store the normalized transpiler name as soon as possible
  hook('locate', function(locate) {
    return function(load) {
      var loader = this;

      if (loader.transpiler == 'traceur') {
        return Promise.all([
          traceurNormalized || (traceurNormalized = loader.normalize(loader.transpiler)),
          traceurRuntimeNormalized || (traceurRuntimeNormalized = loader.normalize(loader.transpiler + '-runtime'))
        ])
        .then(function(normalized) {
          if (load.name == normalized[0] || load.name == normalized[1])
            load.metadata.isTraceur = true;
          return locate.call(loader, load);
        });
      }
      return locate.call(loader, load);
    };
  });

  var curSystem;

  hook('fetch', function(fetch) {
    return function(load) {
      curSystem = __global.System;
      return fetch.call(this, load);
    };
  });
  hook('onScriptLoad', function(onScriptLoad) {
    return function(load) {
      if (load.metadata.isTraceur)
        __global.System = curSystem;
      return onScriptLoad.call(this, load);
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

        if (load.metadata.format == 'system' || load.metadata.format == 'register') {
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

        // ensure Traceur doesn't clobber the System global
        if (load.metadata.isTraceur)
          return '(function() { var curSystem = System; ' + source + '\nSystem = curSystem; })();';

        return source;
      });
    };
  });

})();
