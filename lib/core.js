var absURLRegEx = /^[^\/]+:\/\//;

function readMemberExpression(p, value) {
  var pParts = p.split('.');
  while (pParts.length)
    value = value[pParts.shift()];
  return value;
}

var baseURLCache = {};
function getBaseURLObj() {
  if (baseURLCache[this.baseURL])
    return baseURLCache[this.baseURL];

  // normalize baseURL if not already
  if (this.baseURL[this.baseURL.length - 1] != '/')
    this.baseURL += '/';

  var baseURL = new URL(this.baseURL, baseURI);

  this.baseURL = baseURL.href;

  return (baseURLCache[this.baseURL] = baseURL);
}

var baseURIObj = new URL(baseURI);

(function() {

hookConstructor(function(constructor) {
  return function() {
    constructor.call(this);

    // support baseURL
    this.baseURL = baseURI.substr(0, baseURI.lastIndexOf('/') + 1);

    // support the empty module, as a concept
    this.set('@empty', this.newModule({}));
  };
});

/*
  Normalization

  If a name is relative, we apply URL normalization to the page
  If a name is an absolute URL, we leave it as-is

  Plain names (neither of the above) run through the map and package
  normalization phases (applying before and after this one).

  The paths normalization phase applies last (paths extension), which
  defines the `normalizeSync` function and normalizes everything into
  a URL.

  The final normalization 
 */
hook('normalize', function() {
  return function(name, parentName) {
    // relative URL-normalization
    if (name[0] == '.' || name[0] == '/')
      return new URL(name, parentName || baseURIObj).href;
    return name;
  };
});

/*
  __useDefault
  
  When a module object looks like:
  newModule(
    __useDefault: true,
    default: 'some-module'
  })

  Then importing that module provides the 'some-module'
  result directly instead of the full module.

  Useful for eg module.exports = function() {}
*/
hook('import', function(systemImport) {
  return function(name, parentName, parentAddress) {
    return systemImport.call(this, name, parentName, parentAddress).then(function(module) {
      return module.__useDefault ? module['default'] : module;
    });
  };
});

/*
 Extend config merging one deep only

  loader.config({
    some: 'random',
    config: 'here',
    deep: {
      config: { too: 'too' }
    }
  });

  <=>

  loader.some = 'random';
  loader.config = 'here'
  loader.deep = loader.deep || {};
  loader.deep.config = { too: 'too' };


  Normalizes meta and package configs allowing for:

  System.config({
    meta: {
      './index.js': {}
    }
  });

  To become

  System.meta['https://thissite.com/index.js'] = {};

  For easy normalization canonicalization with latest URL support.

*/
SystemJSLoader.prototype.config = function(cfg) {

  // always configure baseURL first
  if (cfg.baseURL) {
    var hasConfig = false;
    function checkHasConfig(obj) {
      for (var p in obj)
        return true;
    }
    if (checkHasConfig(this.packages) || checkHasConfig(this.meta) || checkHasConfig(this.depCache) || checkHasConfig(this.bundles))
      throw new TypeError('baseURL should only be configured once and must be configured first.');

    this.baseURL = cfg.baseURL;

    // sanitize baseURL
    getBaseURLObj.call(this);
  }

  if (cfg.paths) {
    for (var p in cfg.paths)
      this.paths[p] = cfg.paths[p];
  }

  if (cfg.map) {
    for (var p in cfg.map) {
      var v = cfg.map[p];

      // object map backwards-compat into packages configuration
      if (typeof v !== 'string') {
        var normalized = this.normalizeSync(p);

        // if doing default js extensions, undo to get package name
        if (this.defaultJSExtensions && p.substr(p.length - 3, 3) != '.js')
          normalized = normalized.substr(0, normalized.length - 3);

        // if a package main, revert it
        var pkgMatch = '';
        for (var pkg in this.packages) {
          if (normalized.substr(0, pkg.length) == pkg 
              && (!normalized[pkg.length] || normalized[pkg.length] == '/') 
              && pkgMatch.split('/').length < pkg.split('/').length)
            pkgMatch = pkg;
        }
        if (pkgMatch && this.packages[pkgMatch].main)
          normalized = normalized.substr(0, normalized.length - this.packages[pkgMatch].main.length - 1);

        var pkg = this.packages[normalized] = this.packages[normalized] || {};
        pkg.map = v;
      }
      else {
        this.map[p] = v;
      }
    }
  }

  if (cfg.packages) {
    for (var p in cfg.packages) {
      var prop = this.normalizeSync(p);

      // if doing default js extensions, undo to get package name
      if (this.defaultJSExtensions && p.substr(p.length - 3, 3) != '.js')
        prop = prop.substr(0, prop.length - 3);

      this.packages[prop]= this.packages[prop] || {};
      for (var q in cfg.packages[p])
        this.packages[prop][q] = cfg.packages[p][q];
    }
  }

  if (cfg.bundles) {
    for (var p in cfg.bundles) {
      var bundle = [];
      for (var i = 0; i < cfg.bundles[p].length; i++)
        bundle.push(this.normalizeSync(cfg.bundles[p][i]));
      this.bundles[p] = bundle;
    }
  }

  for (var c in cfg) {
    var v = cfg[c];
    var normalizeProp = false, normalizeValArray = false;

    if (c == 'baseURL' || c == 'map' || c == 'packages' || c == 'bundles' || c == 'paths')
      continue;

    if (typeof v != 'object' || v instanceof Array) {
      this[c] = v;
    }
    else {
      this[c] = this[c] || {};

      if (c == 'meta' || c == 'depCache')
        normalizeProp = true;

      for (var p in v) {
        if (normalizeProp)
          this[c][this.normalizeSync(p)] = v[p];
        else
          this[c][p] = v[p];
      }
    }
  }
};

})();