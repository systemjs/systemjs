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

hook('normalize', function(normalize) {
  return function(name, parentName, parentAddress) {
    if (name.substr(0, 1) != '.' && name.substr(0, 1) != '/' && !name.match(absURLRegEx)) {
      var bestMatch, bestMatchLength = 0;

      // now do the global map
      for (var p in this.map) {
        if (typeof this.map[p] != 'string') {
          var pkg = this.packages[p] = this.packages[p] || {};
          pkg.map = this.map[p];
          delete this.map[p];
          continue;
        }

        if (name.substr(0, p.length) == p && (name.length == p.length || name[p.length] == '/')) {
          var curMatchLength = p.split('/').length;
          if (curMatchLength <= bestMatchLength)
            continue;
          bestMatch = p;
          bestMatchLength = curMatchLength;
        }
      }

      if (bestMatch)
        name = this.map[bestMatch] + name.substr(bestMatch.length);
    }
    
    return normalize.call(this, name, parentName, parentAddress);
  };
});
