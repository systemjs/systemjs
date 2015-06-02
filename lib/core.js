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
  for (var c in cfg) {
    var v = cfg[c];
    var normalizeProp = false, normalizeValArray = false;

    if (typeof v == 'object' && !(v instanceof Array)) {
      this[c] = this[c] || {};

      if (c == 'packages' || c == 'meta' || c == 'depCache')
        normalizeProp = true;

      for (var p in v) {
        
        // object map backwards-compat into packages configuration
        if (c == 'map' && typeof v[p] != 'string') {
          var normalized = this.normalizeSync(p);

          // if doing default js extensions, undo to get package name
          if (this.defaultJSExtensions)
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
          pkg.map = v[p];
        }

        else if (c == 'bundles') {
          var bundle = [];
          for (var i = 0; i < cfg[c][p].length; i++)
            bundle.push(this.normalizeSync(cfg[c][p][i]));
          this[c][p] = bundle;
        }

        else if (normalizeProp) {
          this[c][this.normalizeSync(p)] = v[p];
        }

        else {
          this[c][p] = v[p];
        }
      }
    }
    else
      this[c] = v;
  }

  // sanitize baseURL
  if (cfg.baseURL)
    getBaseURLObj.call(this);
};

})();