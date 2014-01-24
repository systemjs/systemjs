/*
  SystemJS map support
  
  Provides map configuration through
    System.map['jquery'] = 'some/module/map'

  As well as contextual map config through
    System.map['bootstrap'] = {
      jquery: 'some/module/map2'
    }

  Note that this applies for subpaths, just like RequireJS

  jquery      -> 'some/module/map'
  jquery/path -> 'some/module/map/path'
  bootstrap   -> 'bootstrap'

  Inside any module name of the form 'bootstrap' or 'bootstrap/*'
    jquery    -> 'some/module/map2'
    jquery/p  -> 'some/module/map2/p'

  Maps are carefully applied from most specific contextual map, to least specific global map
*/
(function() {

  System.map = System.map || {};


  // return the number of prefix parts (separated by '/') matching the name
  // eg prefixMatchLength('jquery/some/thing', 'jquery') -> 1
  function prefixMatchLength(name, prefix) {
    var prefixParts = prefix.split('/');
    var nameParts = name.split('/');
    if (prefixParts.length > nameParts.length)
      return 0;
    for (var i = 0; i < prefixParts.length; i++)
      if (nameParts[i] != prefixParts[i])
        return 0;
    return prefixParts.length;
  }


  // given a relative-resolved module name and normalized parent name,
  // apply the map configuration
  function applyMap(name, parentName) {

    var curMatch, curMatchLength = 0;
    var curParent, curParentMatchLength = 0;
    
    // first find most specific contextual match
    if (parentName) {
      for (var p in System.map) {
        var curMap = System.map[p];
        if (typeof curMap != 'object')
          continue;

        // most specific parent match wins first
        if (prefixMatchLength(parentName, p) <= curParentMatchLength)
          continue;

        for (var q in curMap) {
          // most specific name match wins
          if (prefixMatchLength(name, q) <= curMatchLength)
            continue;

          curMatch = q;
          curMatchLength = q.split('/').length;
          curParent = p;
          curParentMatchLength = p.split('/').length;
        }
      }
      if (curMatch) {
        var subPath = name.split('/').splice(curMatchLength).join('/');
        return System.map[curParent][curMatch] + (subPath ? '/' + subPath : '');
      }
    }

    // if we didn't find a contextual match, try the global map
    for (var p in System.map) {
      var curMap = System.map[p];
      if (typeof curMap != 'string')
        continue;

      if (prefixMatchLength(name, p) <= curMatchLength)
        continue;

      curMatch = p;
      curMatchLength = p.split('/').length;
    }
    
    // return a match if any
    if (!curMatch)
      return name;
    
    var subPath = name.split('/').splice(curMatchLength).join('/');
    return System.map[curMatch] + (subPath ? '/' + subPath : '');
  }

  var systemNormalize = System.normalize;
  System.normalize = function(name, parentName, parentAddress) {
    return systemNormalize(applyMap(name, parentName), parentName, parentAddress);
  }
})();
