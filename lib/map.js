/*
  SystemJS map support
  
  Provides map configuration through
    System.map['jquery'] = 'some/module/map'

  Note that this applies for subpaths, just like RequireJS:

  jquery      -> 'some/module/map'
  jquery/path -> 'some/module/map/path'
  bootstrap   -> 'bootstrap'

  The most specific map is always taken, as longest path length
*/
hookConstructor(function(constructor) {
  return function() {
    constructor.call(this);
    this.map = {};
  };
});

var baseURLCache = {};

hook('normalize', function(normalize) {
  return function(name, parentName, parentAddress) {
    var loader = this;
    return Promise.resolve(normalize.call(loader, name, parentName, parentAddress))
    .then(function(name) {
      if (name.substr(0, 1) != '.' && name.substr(0, 1) != '/' && !name.match(absURLRegEx)) {
        var bestMatch, bestMatchLength = 0;

        // now do the global map
        for (var p in loader.map) {
          if (typeof loader.map[p] != 'string')
            throw new TypeError('Map configuration no longer permits object submaps. Use package map instead (`System.packages[name].map`).');

          if (name.substr(0, p.length) == p && (name.length == p.length || name[p.length] == '/')) {
            var curMatchLength = p.split('/').length;
            if (curMatchLength <= bestMatchLength)
              continue;
            bestMatch = p;
            bestMatchLength = curMatchLength;
          }
        }

        if (bestMatch)
          return loader.map[bestMatch] + name.substr(bestMatch.length);
      }

      return name;
    });
  };
});
