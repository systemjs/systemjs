/*
 * Package Configuration Extension
 *
 * Example:
 *
 * System.packages = {
 *   jquery: {
 *     main: 'index.js', // when not set, package name is requested directly
 *     format: 'amd',
 *     defaultExtension: 'js',
 *     meta: {
 *       '*.ts': {
 *         loader: 'typescript'
 *       },
 *       'vendor/sizzle.js': {
 *         format: 'global'
 *       }
 *     },
 *     map: {
 *        // map internal require('sizzle') to local require('./vendor/sizzle')
 *        sizzle: './vendor/sizzle.js',
 *        // map any internal or external require of 'jquery/vendor/another' to 'another/index.js'
 *        './vendor/another.js': './another/index.js',
 *        // test.js / test -> lib/test.js
 *        './test.js': './lib/test.js',
 *
 *        // environment-specific map configurations
 *        './index.js': {
 *          '~browser': './index-node.js'
 *        }
 *     }
 *   }
 * };
 *
 * Then:
 *   import 'jquery'                       -> jquery/index.js
 *   import 'jquery/submodule'             -> jquery/submodule.js
 *   import 'jquery/submodule.ts'          -> jquery/submodule.ts loaded as typescript
 *   import 'jquery/vendor/another'        -> another/index.js
 *
 * Detailed Behaviours
 * - main is the only property where a leading "./" can be added optionally
 * - map and defaultExtension are applied to the main
 * - defaultExtension adds the extension only if no other extension is present
 * - defaultJSExtensions applies after map when defaultExtension is not set
 * - if a meta value is available for a module, map and defaultExtension are skipped
 * - like global map, package map also applies to subpaths (sizzle/x, ./vendor/another/sub)
 * - condition module map is '@env' module in package or '@system-env' globally
 *
 * In addition, the following meta properties will be allowed to be package
 * -relative as well in the package meta config:
 *   
 *   - loader
 *   - alias
 *
 */
(function() {

  hookConstructor(function(constructor) {
    return function() {
      constructor.call(this);
      this.packages = {};
    };
  });

  function getPackage(name) {
    for (var p in this.packages) {
      if (name.substr(0, p.length) === p && (name.length === p.length || name[p.length] === '/'))
        return p;
    }
  }

  function applyMap(map, name) {
    var bestMatch, bestMatchLength = 0;
    
    for (var p in map) {
      if (name.substr(0, p.length) == p && (name.length == p.length || name[p.length] == '/')) {
        var curMatchLength = p.split('/').length;
        if (curMatchLength <= bestMatchLength)
          continue;
        bestMatch = p;
        bestMatchLength = curMatchLength;
      }
    }

    return bestMatch;
  }

  function envMap(loader, pkgName, pkgMap, name) {
    var map = applyMap(pkgMap, name);
    var mapped = pkgMap[map];

    // conditional package map
    if (mapped) {
      if (typeof mapped == 'object') {
        return loader['import'](pkgMap['@env'] || '@system-env', pkgName)
        .then(function(env) {
          // first map condition to match is used
          for (var e in mapped) {
            var negate = e[0] == '~';

            var value = readMemberExpression(negate ? e.substr(1) : e, env);

            if (!negate && value || negate && !value)
              return mapped[e] + name.substr(map.length);
          }
        });
      }
      // normal map
      else {
        return mapped + name.substr(map.length);
      }
    }
  }

  function createPackageNormalize(normalize, sync) {
    return function(name, parentName) {
      // apply contextual package map first
      if (parentName) {
        var parentPackage = getPackage.call(this, parentName) || 
            this.defaultJSExtensions && parentName.substr(parentName.length - 3, 3) == '.js' && 
            getPackage.call(this, parentName.substr(0, parentName.length - 3));
      }

      if (parentPackage && name[0] !== '.') {
        var parentMap = this.packages[parentPackage].map;
        if (parentMap) {
          var map = applyMap(parentMap, name);

          if (map) {
            name = parentMap[map] + name.substr(map.length);

            // relative maps are package-relative
            if (name[0] === '.')
              parentName = parentPackage + '/';
          }
        }
      }

      var defaultJSExtension = this.defaultJSExtensions && name.substr(name.length - 3, 3) != '.js';

      // apply global map, relative normalization
      var normalized = normalize.call(this, name, parentName);

      // undo defaultJSExtension
      if (normalized.substr(normalized.length - 3, 3) != '.js')
        defaultJSExtension = false;
      if (defaultJSExtension)
        normalized = normalized.substr(0, normalized.length - 3);

      // check if we are inside a package
      var pkgName = getPackage.call(this, normalized);

      var loader = this;

      if (pkgName) {
        var pkg = loader.packages[pkgName];
        // main
        if (pkgName === normalized && pkg.main)
          normalized += '/' + (pkg.main.substr(0, 2) == './' ? pkg.main.substr(2) : pkg.main);

        if (normalized.substr(pkgName.length) == '/')
          return normalized;

        // defaultExtension & defaultJSExtension
        // if we have meta for this package, don't do defaultExtensions
        var defaultExtension = '';
        if (!pkg.meta || !(pkg.meta[normalized.substr(pkgName.length + 1)] || pkg.meta['./' + normalized.substr(pkgName.length + 1)])) {
          // apply defaultExtension

          if ('defaultExtension' in pkg) {
            if (pkg.defaultExtension !== false && normalized.split('/').pop().lastIndexOf('.') == -1)
              defaultExtension = '.' + pkg.defaultExtension;
          }
          // apply defaultJSExtensions if defaultExtension not set
          else if (defaultJSExtension) {
            defaultExtension = '.js';
          }
        }

        // sync normalize does not apply package map
        if (sync || !pkg.map)
          return normalized + defaultExtension;

        var subPath = '.' + normalized.substr(pkgName.length);

        // apply submap checking without then with defaultExtension
        return Promise.resolve(envMap(loader, pkgName, pkg.map, subPath))
        .then(function(mapped) {
          if (mapped)
            return mapped;

          if (defaultExtension)
            return envMap(loader, pkgName, pkg.map, subPath + defaultExtension);
        })
        .then(function(mapped) {
          if (mapped)
            normalized = mapped.substr(0, 2) == './' ? pkgName + mapped.substr(1) : normalize.call(loader, mapped);
          else
            normalized += defaultExtension;
          return normalized;
        });
      }
      
      // add back defaultJSExtension if not a package
      if (defaultJSExtension)
        normalized += '.js';

      return normalized;
    };
  }

  SystemJSLoader.prototype.normalizeSync = SystemJSLoader.prototype.normalize;

  hook('normalizeSync', function(normalize) {
    return createPackageNormalize(normalize, true);
  });

  hook('normalize', function(normalize) {
    return createPackageNormalize(normalize, false);
  });

  hook('locate', function(locate) {
    return function(load) {
      var loader = this;
      return Promise.resolve(locate.call(this, load))
      .then(function(address) {
        var pkgName = getPackage.call(loader, load.name);
        if (pkgName) {
          var pkg = loader.packages[pkgName];
          
          // format
          if (pkg.format)
            load.metadata.format = load.metadata.format || pkg.format;

          // loader
          if (pkg.loader)
            load.metadata.loader = load.metadata.loader || pkg.loader;

          if (pkg.meta) {
            // wildcard meta
            var meta = {};
            var bestDepth = 0;
            var wildcardIndex;
            for (var module in pkg.meta) {
              // allow meta to start with ./ for flexibility
              var dotRel = module.substr(0, 2) == './' ? './' : '';
              if (dotRel)
                module = module.substr(2);

              wildcardIndex = module.indexOf('*');
              if (wildcardIndex === -1)
                continue;

              if (module.substr(0, wildcardIndex) === load.name.substr(0, wildcardIndex)
                  && module.substr(wildcardIndex + 1) === load.name.substr(load.name.length - module.length + wildcardIndex + 1)) {
                var depth = module.split('/').length;
                if (depth > bestDepth)
                  bestDetph = depth;
                extendMeta(meta, pkg.meta[dotRel + module], bestDepth != depth);
              }
            }
            // exact meta
            var metaName = load.name.substr(pkgName.length + 1);
            var exactMeta = pkg.meta[metaName] || pkg.meta['./' + metaName];
            if (exactMeta)
              extendMeta(meta, exactMeta);

            // allow alias and loader to be package-relative
            if (meta.alias && meta.alias.substr(0, 2) == './')
              meta.alias = pkgName + meta.alias.substr(1);
            if (meta.loader && meta.loader.substr(0, 2) == './')
              meta.loader = pkgName + meta.loader.substr(1);
            
            extendMeta(load.metadata, meta);
          }
        }

        return address;
      });
    };
  });

})();