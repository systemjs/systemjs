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

// map is the first normalizer
hook('normalize', function() {
  return function(name, parentName) {
    if (name[0] != '.' && name[0] != '/' && !name.match(absURLRegEx)) {
      var mapped = applyMap(this.map, name);
      if (mapped)
        return this.map[mapped] + name.substr(mapped.length);
    }
    return name;
  };
});
