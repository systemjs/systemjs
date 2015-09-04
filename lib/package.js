/*
 * Package Configuration Extension
 *
 * Example:
 *
 * System.packages = {
 *   jquery: {
 *     basePath: 'lib', // optionally only use a subdirectory within the package
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
 *
 * Package Configuration Loading
 * 
 * Not all packages may already have their configuration present in the System config
 * For these cases, a list of packageConfigPaths can be provided, which when matched against
 * a request, will first request a ".json" file by the package name to derive the package
 * configuration from. This allows dynamic loading of non-predetermined code, a key use
 * case in SystemJS.
 *
 * Example:
 * 
 *   System.packageConfigPaths = ['packages/test/package.json', 'packages/*.json'];
 *
 *   // will first request 'packages/new-package/package.json' for the package config
 *   // before completing the package request to 'packages/new-package/path'
 *   System.import('packages/new-package/path');
 *
 *   // will first request 'packages/test/package.json' before the main
 *   System.import('packages/test');
 *
 * When a package matches packageConfigPaths, it will always send a config request for
 * the package configuration.
 * The package name itself is taken to be the match up to and including the last wildcard
 * or trailing slash.
 * Package config paths are ordered - matching is done based on the first match found.
 * Any existing package configurations for the package will deeply merge with the 
 * package config, with the existing package configurations taking preference.
 * To opt-out of the package configuration request for a package that matches
 * packageConfigPaths, use the { loadConfig: false } package config option.
 * 
 */
(function() {

  hookConstructor(function(constructor) {
    return function() {
      constructor.call(this);
      this.packages = {};
      this.packageConfigPaths = {};
    };
  });

  function getPackage(name) {
    // use most specific package
    var curPkg, curPkgLen = 0, pkgLen;
    for (var p in this.packages) {
      if (name.substr(0, p.length) === p && (name.length === p.length || name[p.length] === '/')) {
        pkgLen = p.split('/').length;
        if (pkgLen > curPkgLen) {
          curPkg = p;
          curPkgLen = pkgLen;
        }
      }
    }
    return curPkg;
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

  function getBasePath(pkg) {
    // sanitize basePath
    var basePath = pkg.basePath && pkg.basePath != '.' ? pkg.basePath : '';
    if (basePath) {
      if (basePath.substr(0, 2) == './')
        basePath = basePath.substr(2);
      if (basePath[basePath.length - 1] != '/')
        basePath += '/';
    }
    return basePath;
  }

  // given the package subpath, return the resultant combined path
  // defaultExtension is only added if the path does not have 
  // loader package meta or exact package meta
  function toPackagePath(pkgName, pkg, basePath, subPath, defaultJSExtension) {
    var normalized = pkgName + '/' + basePath + subPath;

    var hasLoadMeta = false;
    if (pkg.meta)
      getMetaMatches(pkg.meta, basePath, pkgName, normalized, function(matchMeta, matchDepth) {
        if (matchMeta.loader || matchDepth == 0)
          hasLoadMeta = true;
      });

    return normalized + (hasLoadMeta ? '' : getDefaultExtension(pkg, subPath, defaultJSExtension));
  }

  function getDefaultExtension(pkg, subPath, defaultJSExtension) {
    // work out what the defaultExtension is
    var defaultExtension = '';
    if ('defaultExtension' in pkg && subPath[subPath.length - 1] != '/') {
      if (pkg.defaultExtension !== false && subPath.substr(subPath.length - pkg.defaultExtension.length - 1) != '.' + pkg.defaultExtension)
        defaultExtension = '.' + pkg.defaultExtension;
    }
    // apply defaultJSExtensions if defaultExtension not set
    else if (defaultJSExtension) {
      defaultExtension = '.js';
    }
    return defaultExtension;
  }

  function applyPackageConfig(normalized, pkgName, sync, defaultJSExtension) {
    var loader = this;
    var pkg = loader.packages[pkgName];

    var basePath = getBasePath(pkg);

    // main
    if (pkgName === normalized && pkg.main)
      normalized += '/' + (pkg.main.substr(0, 2) == './' ? pkg.main.substr(2) : pkg.main);

    // allow for direct package name normalization with trailling "/" (no main)
    if (normalized.length == pkgName.length + 1 && normalized[pkgName.length] == '/')
      return normalized + (defaultJSExtension && normalized.substr(normalized.length - 3, 3) != '.js' ? '.js' : '');

    // no submap if name is package itself
    if (normalized.length == pkgName.length)
      return normalized + getDefaultExtension(pkg, '', defaultJSExtension);

    // sync normalize does not apply package map
    if (sync || !pkg.map)
      return toPackagePath(pkgName, pkg, basePath, normalized.substr(pkgName.length + 1), defaultJSExtension);

    var subPath = '.' + normalized.substr(pkgName.length);

    // apply submap checking without then with defaultExtension
    return Promise.resolve(envMap(loader, pkgName, pkg.map, subPath))
    .then(function(mapped) {
      if (mapped)
        return mapped;

      var defaultExtension = getDefaultExtension(pkg, subPath.substr(2), defaultJSExtension);
      if (defaultExtension)
        return envMap(loader, pkgName, pkg.map, subPath + defaultExtension);
    })
    .then(function(mapped) {
      if (mapped) {
        // '.' as a target is the package itself (with package main check)
        if (mapped == '.')
          return loader.normalizeSync(pkgName);
        // internal package map
        else if (mapped.substr(0, 2) == './')
          return toPackagePath(pkgName, pkg, basePath, mapped.substr(2), defaultJSExtension);
        // global package map
        else
          return loader.normalize.call(loader, mapped); 
      }
      else {
        return toPackagePath(pkgName, pkg, basePath, normalized.substr(pkgName.length + 1), defaultJSExtension);
      }
    });
  }

  var packageConfigPathsRegExps = {};
  var pkgConfigPromises = {};
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
      
      // check if we match a packageConfigPaths
      if (!sync) {
        var pkgPath, pkgConfigPath;
        for (var i = 0; i < this.packageConfigPaths.length; i++) {
          var p = this.packageConfigPaths[i];
          var pPkgLen = Math.max(p.lastIndexOf('*') + 1, p.lastIndexOf('/'));
          var match = normalized.match(packageConfigPathsRegExps[p] || 
              (packageConfigPathsRegExps[p] = new RegExp('^(' + p.substr(0, pPkgLen).replace(/\*/g, '[^\\/]+') + ')(\/|$)')));
          if (match) {
            pkgPath = match[1];
            pkgConfigPath = pkgPath + p.substr(pPkgLen);
            break;
          }
        }

        if (pkgPath && (!pkgName || pkgName != pkgPath || loader.packages[pkgName].loadConfig !== false)) {
          return (pkgConfigPromises[pkgPath] || 
            (pkgConfigPromises[pkgPath] = 
              loader['fetch']({ name: pkgConfigPath, address: pkgConfigPath, metadata: {} })
              .then(function(source) {
                try {
                  return JSON.parse(source);
                }
                catch(e) {
                  throw new Error('Invalid JSON in package configuration file ' + pkgPath);
                }
              })
              .then(function(cfg) {
                // support "systemjs" prefixing
                if (cfg.systemjs)
                  cfg = cfg.systemjs;

                // remove any non-system properties if generic config file (eg package.json)
                for (var p in cfg) {
                  if (indexOf.call(packageProperties, p) == -1)
                    delete cfg[p];
                }

                // deeply-merge (to first level) config with any existing package config
                if (pkgName && pkgName == pkgPath)
                  extendMeta(cfg, loader.packages[pkgPath]);

                loader.packages[pkgPath] = cfg;
              })
            )
          )
          .then(function() {
            // finally apply the package config we just created to the current request
            return applyPackageConfig.call(loader, normalized, pkgPath, sync, defaultJSExtension);
          });
        }
      }

      if (pkgName)
        return applyPackageConfig.call(loader, normalized, pkgName, sync, defaultJSExtension);
      
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

  function getMetaMatches(pkgMeta, basePath, pkgName, normalized, matchFn) {
    // wildcard meta
    var meta = {};
    var wildcardIndex;
    for (var module in pkgMeta) {
      // allow meta to start with ./ for flexibility
      var dotRel = module.substr(0, 2) == './' ? './' : '';
      if (dotRel)
        module = module.substr(2);

      wildcardIndex = module.indexOf('*');
      if (wildcardIndex === -1)
        continue;

      if (basePath + module.substr(0, wildcardIndex) === normalized.substr(pkgName.length + 1, wildcardIndex + basePath.length)
          && module.substr(wildcardIndex + 1) === normalized.substr(normalized.length - module.length + wildcardIndex + 1)) {
        matchFn(pkgMeta[dotRel + module], module.split('/').length);
      }
    }
    // exact meta
    var metaName = normalized.substr(pkgName.length + basePath.length + 1);
    var exactMeta = pkgMeta[metaName] || pkgMeta['./' + metaName];
    if (exactMeta && normalized.substr(pkgName.length + 1, basePath.length) == basePath)
      matchFn(exactMeta, 0);
  }

  hook('locate', function(locate) {
    return function(load) {
      var loader = this;
      return Promise.resolve(locate.call(this, load))
      .then(function(address) {
        var pkgName = getPackage.call(loader, load.name);
        if (pkgName) {
          var pkg = loader.packages[pkgName];

          var basePath = getBasePath(pkg);
          
          // format
          if (pkg.format)
            load.metadata.format = load.metadata.format || pkg.format;

          var meta = {};
          if (pkg.meta) {
            var bestDepth = 0;
            getMetaMatches(pkg.meta, basePath, pkgName, load.name, function(matchMeta, matchDepth) {
              if (matchDepth > bestDepth)
                bestDepth = matchDepth;
              extendMeta(meta, matchMeta, matchDepth && bestDepth > matchDepth);
            });

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