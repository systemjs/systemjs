/*
 * Package Configuration Extension
 *
 * Creates new `System.packages` configuration function.
 * Which in turn populates base-level configs.
 * Also adds support for package mains.
 *
 * Example:
 *
 * System.packages({
 *   jquery: {
 *     main: 'index.js',
 *     format: 'amd',
 *     meta: {
 *       '*': {
 *         defaultExtension: '.ts' // auto adds .js if not already present
 *       },
 *       'vendor/sizzle.js': {
 *         format: 'global'
 *       }
 *     },
 *     map: {
 *       // map internal require('sizzle') to local require('./vendor/sizzle')
 *       sizzle: './vendor/sizzle.js',
 *
 *       // map external require of 'jquery/vendor/another.js' to 'another/index.js'
 *       './vendor/another.js': 'another/index.js' 
 *     }
 *   }
 * });
 *
 * Is equivalent to:
 * 
 * System.config({
 *   meta: {
 *     'jquery/*': {
 *       format: 'amd',
 *       defaultExtension: '.js'
 *     }
 *     'jquery/vendor/sizzle.js': {
 *       format: 'global'
 *     }
 *   },
 *   map: {
 *     'jquery/vendor/another.js': 'another/index.js'
 *     jquery: {
 *       sizzle: 'jquery/vendor/sizzle.js'
 *     }
 *   }
 * });
 *
 * With normalization so that import 'jquery' => import 'jquery/index.js'
 *
 */
(function() {

  hookConstructor(function(constructor) {
    return function() {
      constructor.call(this);
      this.packageMains = {};
    };
  });

  hook('normalize', function(normalize) {
    return function(name, parentName, parentAddress) {
      var loader = this;
      return normalize.call(loader, name, parentName, parentAddress)
      .then(function(normalized) {
        if (loader.packageMains[normalized])
          normalized = normalized + '/' + loader.packageMains[normalized];
        return normalized;
      });
    };
  });

  function extend(a, b) {
    a = a || {};
    for (var p in b)
      a[b] = b[p];
    return a;
  }

  SystemJSLoader.prototype.packages = function(packages) {
    var loader = this;
    for (var p in packages) {
      var pkgCfg = packages[p];

      // main
      var main = pkgCfg.main;
      if (main)
        loader.packageMains[p] = main.substr(0, 2) == './' ? main.substr(2) : main;

      // format
      if (pkgCfg.format)
        loader.meta[p + '/*'] = extend(loader.meta[p + '/*'], { format: pkgCfg.format });

      // meta
      for (var m in pkgCfg.meta)
        loader.meta[p + '/' + m] = extend(loader.meta[p + '/' + m], pkgCfg.meta[m]);

      // map
      for (var m in pkgCfg.map) {
        var target = pkgCfg.map[m];
        if (target.substr(0, 2) == './')
          target = p + target.substr(1);

        // package-relative base map
        if (m.substr(0, 2) == './') {
          loader.map[p + m.substr(1)] = target;
        }

        // package-contextual map
        else {
          loader.map[p] = loader.map[p] || {};
          loader.map[p][m] = target;
        }
      }
    }
  };

})();