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
 *     defaultJSExtension: true,
 *     modules: {
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
 * With normalization hooks providing main and defaultExtension support
 * so that:
 *   import 'jquery' => import 'jquery/index.js'
 *   import 'jquery/module' => import 'jquery/module.js'
 *
 * In addition, the following meta properties will be allowed to be package
 * -relative as well in the package meta config:
 *   
 *   - plugin
 *   - alias
 *
 */
(function() {

  hookConstructor(function(constructor) {
    return function() {
      constructor.call(this);
      this.packageMains = {};
      this.packageDefaultJSExtensions = {};
    };
  });

  hook('normalize', function(normalize) {
    return function(name, parentName, parentAddress) {
      var loader = this;
      return normalize.call(loader, name, parentName, parentAddress)
      .then(function(normalized) {
        // main
        if (loader.packageMains[normalized])
          normalized = normalized + '/' + loader.packageMains[normalized];

        // defaultJSExtension
        if (normalized.split('/').pop().indexOf('.') == -1) {
          for (var d in loader.packageDefaultExtensions) {
            if (normalized.substr(0, d.length + 1) == d + '/') {
              normalized += '.js';
              break;
            }
          }
        }
        return normalized;
      });
    };
  });

  SystemJSLoader.prototype.packages = function(packages) {
    for (var p in packages) {
      var pkgCfg = packages[p];

      // main
      var main = pkgCfg.main;
      if (main)
        this.packageMains[p] = main.substr(0, 2) == './' ? main.substr(2) : main;

      // defaultJSExtension
      if (pkgCfg.defaultJSExtension)
        this.packageDefaultJSExtensions[p] = true;

      // format
      if (pkgCfg.format) {
        var formatMeta = this.meta[p + '/*'] || {};
        formatMeta.format = pkgCfg.format;
        this.meta[p + '/*'] = formatMeta;
      }

      // meta
      for (var m in pkgCfg.modules) {
        var meta = this.meta[p + '/' + m] || {};
        var pkgMeta = pkgCfg.modules[m];
        // alias shorthand
        if (typeof pkgMeta === 'string')
          pkgMeta = { alias: pkgMeta };
        for (var p in pkgMeta) {
          // plugin and alias can be package-relative
          if ((p === 'plugin' || p === 'alias')
              && pkgMeta[p].substr(0, 2) == './')
            meta[p] = p + pkgMeta[p].substr(1);
          else
            meta[p] = pkgMeta[p];
        }
        this.meta[p + '/' + m] = meta;
      }

      // map
      for (var m in pkgCfg.map) {
        var target = pkgCfg.map[m];
        if (target.substr(0, 2) == './')
          target = p + target.substr(1);

        // package-relative base map
        if (m.substr(0, 2) == './') {
          this.map[p + m.substr(1)] = target;
        }

        // package-contextual map
        else {
          this.map[p] = this.map[p] || {};
          this.map[p][m] = target;
        }
      }
    }
  };

})();