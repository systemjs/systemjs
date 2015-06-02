/*
 * Package Configuration Extension
 *
 * Example:
 *
 * System.packages = {
 *   jquery: {
 *     main: 'index.js', // when not set, package name is requested directly
 *     format: 'amd',
 *     defaultExtension: true,
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
 *
 *        // map any internal or external require of 'jquery/vendor/another' to 'another/index.js'
 *        './vendor/another': 'another/index.js'
 *      }
 *    }
 *  }
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
 * - if a map or meta value is available for a module without defaultExtension, defaultExtension is skipped
 * - like global map, package map also applies to subpaths (sizzle/x, ./vendor/another/sub)
 * - map targets do not pass through any further map or defaultExtension
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
    if (bestMatch)
      return map[bestMatch] + name.substr(bestMatch.length);
  }

  hook('normalize', function(normalize) {
    return function(name, parentName) {
      // apply contextual package map first
      if (parentName)
        var parentPackage = getPackage.call(this, parentName);

      if (parentPackage && name[0] !== '.') {
        var parentMap = this.packages[parentPackage].map;
        if (parentMap) {
          name = applyMap(parentMap, name) || name;

          // relative maps are package-relative
          if (name[0] === '.')
            parentName = parentPackage + '/';
        }
      }

      // apply global map, relative normalization
      var normalized = normalize.call(this, name, parentName);

      // check if we are inside a package
      var pkgName = getPackage.call(this, normalized);

      if (pkgName) {
        var pkg = this.packages[pkgName];

        // main
        if (pkgName === normalized) {

          // no package main -> just use package itself
          if (!pkg.main)
            return normalized;

          normalized += '/' + (pkg.main.substr(0, 2) == './' ? pkg.main.substr(2) : pkg.main);
        }

        var defaultExtension;
        if (pkg.defaultExtension && normalized.split('/').pop().indexOf('.') == -1)
          defaultExtension = '.' + pkg.defaultExtension;

        // apply map checking without then with defaultExtension
        var subPath = '.' + normalized.substr(pkgName.length);
        var mapped = applyMap(pkg.map, subPath) || defaultExtension && applyMap(pkg.map, subPath + defaultExtension);
        if (mapped)
          normalized = mapped.substr(0, 2) == './' ? pkgName + mapped.substr(1) : mapped;

        // apply default extension if not in meta and not the package itself
        else if (defaultExtension && (!pkg.meta || !pkg.meta[subPath.substr(2)]))
          normalized += defaultExtension;
      }

      return normalized;
    };
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
              wildcardIndex = module.indexOf('*');
              if (wildcardIndex === -1)
                continue;
              if (module.substr(0, wildcardIndex) === load.name.substr(0, wildcardIndex)
                  && module.substr(wildcardIndex + 1) === load.name.substr(load.name.length - module.length + wildcardIndex + 1)) {
                var depth = module.split('/').length;
                if (depth > bestDepth)
                  bestDetph = depth;
                extend(meta, pkg.meta[module], bestDepth != depth);
              }
            }
            // exact meta
            var exactMeta = pkg.meta[load.name.substr(pkgName.length + 1)];
            if (exactMeta)
              extend(meta, exactMeta);

            // allow alias and loader to be package-relative
            if (meta.alias && meta.alias.substr(0, 2) == './')
              meta.alias = pkgName + meta.alias.substr(1);
            if (meta.loader && meta.loader.substr(0, 2) == './')
              meta.loader = pkgName + meta.loader.substr(1);
            
            extend(load.metadata, meta);
          }
        }

        return address;
      });
    };
  });

})();