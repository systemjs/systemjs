/*
  SystemJS packages extension
  
  System.config({
    packages: {
      'first/package': {
        main: 'main',
        format: 'amd',
        meta: {
          'some/file': {
            deps: ['jquery']
          }
        },
        map: {
          dep: 'another/package/path'
        }
      }
    }
  })
*/

function packages(loader) {
  loader.packages = loader.packages || {};

  function getMatch(name, matches) {
    var matchLen = 0;
    var curMatch;
    for (var p in matches) {
      if (p.length <= matchLen)
        continue;

      if (name.substr(0, p.length) != p)
        continue;

      if (name.length == p.length || name.substr(p.length, 1) == '/') {
        matchLen = p.length;
        curMatch = p;
      }
    }
    return curMatch;
  }

  var loaderNormalize = loader.normalize;
  loader.normalize = function(name, parentName, parentAddress) {
    var pkgs = this.packages || {};

    // if the parentName is inside a package, apply the parent package map
    var parentPkgName = getMatch(parentName || '', pkgs);
    if (parentPkgName) {
      var parentMap = pkgs[parentPkgName].map || {};
      var mapMatch = getMatch(name, parentMap);

      if (mapMatch) {
        var subPath = name.substr(mapMatch.length, name.length - mapMatch.length);
        name = parentMap[mapMatch] + subPath;
      }
    }

    return Promise.resolve(loaderNormalize.call(this, name, parentName, parentAddress)).then(function(normalized) {
      
      // if the normalized name is the package name, add the main entry point
      if (pkgs[normalized]) 
        normalized += '/' + (pkgs[normalized].main || normalized.split('/').pop());

      return normalized;

    });
  }

  var loaderLocate = loader.locate;
  loader.locate = function(load) {
    var pkgName = getMatch(load.name, this.packages);
    var pkg = this.packages[pkgName] || {};

    // add any package metadata
    if (pkg) {
      if (pkg.format)
        load.metadata.format = pkg.format;

      var pkgMeta;
      if (pkg.meta) {
        var pkgMeta = pkg.meta[load.name.substr(pkgName.length + 1, load.name.length - pkgName.length - 1)];
        if (pkgMeta)
          for (var p in pkgMeta)
            load.metadata[p] = pkgMeta[p];
      }
    }

    return loaderLocate.call(this, load);
  }
}