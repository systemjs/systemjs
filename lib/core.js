var absURLRegEx = /^[^\/]+:\/\//;

// caches baseURL URL object
// also allows baseURL to be relative to the baseURI
var baseURI;
function getAbsBaseURL() {
  var baseURL = this.baseURL;
  return baseURLCache[baseURL] = baseURLCache[baseURL] || new URL(baseURL + (baseURL[baseURL.length - 1] != '/' ? '/' : ''), baseURI);
}

(function() {

hookConstructor(function(constructor) {
  return function() {
    constructor.call(this);

    // by default ModuleLoader sets this.baseURL to baseURI
    baseURI = this.baseURL;

    // support the empty module, as a concept
    this.set('@empty', this.newModule({}));
  };
});

/*
  Normalization

  There are two types of normalized module specifiers:
  - Package names: PLAIN NAMES (not beginning with protocol://, /, ./)
  - URLs: absolute URLs

  All modules in the module table fall under one of the above.

  When normalizing a module, we need to either normalize it as a URL into
  an absolute URL for the registry, or as a PLAIN NAME using Dot Normalization.

  - Dot Normalization is applied when the relative module name starts with
    ./ or ../ and the parent module name is not a URL.
    Dot Normalization is a subset of URL normalization handling relative 
    resolution and backtracking relative to a plain parent name.
    ( normalize(../x, a/b/c) -> a/x )
    Inner ../ or ./ are not supported.
    Names that dot below the parent name become the base-level.

  - URL Normalization is applied when the relative name to normalize starts with
    ./ or ../ and the parent name is a URL, or when it starts with / or //.

  When there is no parent name, the parent name is taken to be the baseURL.

  Plain Names (as defined above) are left in-tact.
 */
hook('normalize', function() {
  return function(name, parentName, parentAddress) {
    // percent encode just '#' in module names
    // according to https://github.com/jorendorff/js-loaders/blob/master/browser-loader.js#L238
    // we should encode everything, but it breaks for servers that don't expect it
    // like in (https://github.com/systemjs/systemjs/issues/168)
    if (isBrowser)
      name = name.replace(/#/g, '%23');

    // Relative Normalization
    if (name[0] == '.' && parentName) {
      // if parent is a URL, apply URL normalization
      if (parentName.match(absURLRegEx))
        return new URL(name, parentName).href;

      // Dot Normalization

      // skip leading ./
      var parts = name.split('/');
      var i = 0;
      var dotdots = 0;
      while (parts[i] == '.') {
        i++;
        if (i == parts.length)
          throw new TypeError('Invalid module name');
      }
      
      // count dot dots
      while (parts[i] == '..') {
        i++;
        dotdots++;
        if (i == parts.length)
          throw new TypeError('Invalid module name');
      }

      var parentParts = parentName.split('/');

      parts = parts.splice(i, parts.length - i);

      // if backtracking below the parent name, just set to the base-level like URLs
      // NB if parentAddress is supported in the spec, we can URL normalize against it here instead
      if (dotdots > parentParts.length)
        throw new TypeError('Normalization of "' + name + '" to "' + parentName + '" back-tracks below the parent');

      parts = parentParts.splice(0, parentParts.length - dotdots - 1).concat(parts);

      name = parts.join('/');
    }
    
    // if url-relative, normalize to baseURL
    if (name[0] == '.' || name[0] == '/')
      name = new URL(name, getAbsBaseURL.call(this)).href;

    return name;
  };
});


/*
  Locate

  - URLs are left as-is
  - PLAIN NAMES (not URLs) are checked against paths.
    (Paths is moved from normalize in the module spec to locate in the System spec.
     This isn't inconsistent because the module spec normalizes everything to absolute URLs,
     while the System spec defines its own intermediate union of URLs and plain paths)
  - The resulting name (if matched in paths or not) is then normalized to the baseURL
  - Breaking Change in future: This final normalization will ultimately only apply for 
    relative syntax and not for plain names
    That is, System.import('jquery') must be configured, and won't default to baseURL
      System.import('./jquery') should be used instead, making plain and URL spaces
      separate and distinct.
 */
hook('locate', function() {
  return function(load) {
    if (load.name.match(absURLRegEx))
      return load.name;

    return new URL(applyPaths(this, load.name), getAbsBaseURL.call(this)).href;
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
SystemLoader.prototype.config = function(cfg) {
  for (var c in cfg) {
    var v = cfg[c];
    var normalizeConfig = false;
    if (typeof v == 'object' && !(v instanceof Array)) {
      this[c] = this[c] || {};
      if (c == 'packages' || c == 'meta')
        normalizeConfig = true;
      for (var p in v) {
        var value = v[p];
        if (normalizeConfig && (p[0] == '.' || p[0] == '/'))
          p = new URL(p, getAbsBaseURL.call(this)).href;
        this[c][p] = value;
      }
    }
    else
      this[c] = v;
  }
};

})();