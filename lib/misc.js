var absURLRegEx = /^[^\/]+:\/\//;

(function() {

var baseURI;

hookConstructor(function(constructor) {
  return function() {
    constructor.call(this);

    // by default ModuleLoader sets this.baseURL to baseURI
    baseURI = this.baseURL;

    // support the empty module, as a concept
    this.set('@empty', this.newModule({}));
  };
});

// caches baseURL URL object
// also allows baseURL to be relative to the baseURI
function getAbsBaseURL(baseURL) {
  return baseURLCache[baseURL] = baseURLCache[baseURL] || new URL(baseURL + (baseURL[baseURL.length - 1] != '/' ? '/' : ''), baseURI);
}

/*
  Normalization

  Dot-Normalization is applied for relative module names, when the parent name 
  is not a URL itself.
  ../, ./ are resolved relative to plain path parentNames
  where "plain paths" are defined as not beginning with protocol://, /, ./
  Inner ../ or ./ are not supported
  Names that dot below the parent name skip to use URL normalization

  The goal is for normalize to normalize all names into a space containing a union
  of "plain paths", and absolute URLs.

  Plain paths will then either be packages or paths in locate
  or they will be baseURL-relative in locate

  Absolute paths corresponding to paths within baseURL are converted
  back into plain paths to ensure a unique representation in this space.

  In SystemJS we assume and define normalize to never output a module 
  name not an absolute URL or plain path.
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
      if (dotdots <= parentParts.length)
        parts = parentParts.splice(0, parentParts.length - dotdots - 1).concat(parts);

      name = parts.join('/');
    }
    
    // if url-relative, normalize to baseURL
    // if within baseURL, convert into corresponding plain path
    if (name[0] == '.' || name[0] == '/') {
      var baseURL = getAbsBaseURL(this.baseURL);
      var normalizedURL = new URL(name, baseURL);
      if (normalizedURL.origin == baseURL.origin && normalizedURL.pathname.substr(0, baseURL.pathname.length) == baseURL.pathname)
        name = normalizedURL.pathname.substr(baseURL.pathname.length);
      else
        name = normalizedURL.href;
    }

    return name;
  };
});


/*
  Locate

  Any plain names from normalize are normalized into absolute URLs
  First they are checked against paths
  Paths is moved from normalize in the module spec to locate in the System spec
  This isn't inconsistent because the module spec normalizes everything to absolute URLs,
  while the System spec defines its own intermediate union of URLs and plain paths
 */
hook('locate', function() {
  return function(load) {
    if (load.name.match(absURLRegEx))
      return load.name;

    name = applyPaths(this, load.name);

    return new URL(name, getAbsBaseURL(this.baseURL)).href;
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
*/
SystemLoader.prototype.config = function(cfg) {
  for (var c in cfg) {
    var v = cfg[c];
    if (typeof v == 'object' && !(v instanceof Array)) {
      this[c] = this[c] || {};
      for (var p in v)
        this[c][p] = v[p];
    }
    else
      this[c] = v;
  }
};

})();