/*
  SystemJS map support
  
  Provides map configuration through
    System.map['jquery'] = 'some/module/map'

  Note that this applies for subpaths, just like RequireJS

  jquery      -> 'some/module/map'
  jquery/path -> 'some/module/map/path'
  bootstrap   -> 'bootstrap'
*/
function map(loader) {
  loader.map = loader.map || {};

  var loaderNormalize = loader.normalize;
  loader.normalize = function(name, parentName, parentAddress) {
    var map = this.map || {};

    var curMatch;
    var matchLen = 0;
    for (var p in map) {
      if (p.length <= matchLen)
        continue;

      if (name.substr(0, p.length) != p)
        continue;

      if (name.length == p.length || name.substr(p.length, 1) == '/') {
        curMatch = p;
        matchLen = p.length;
      }
    }

    if (curMatch) {
      var subPath = name.substr(curMatch.length, name.length - curMatch.length);
      name = map[curMatch] + subPath;
    }

    return loaderNormalize.call(loader, name, parentName, parentAddress);
  }
}
