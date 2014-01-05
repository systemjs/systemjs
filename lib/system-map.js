(function() {
  var separatorRegEx = /[\/:]/;

  System.map = {};

  // given a relative-resolved module name apply the map configuration
  var applyMap = function(name) {
    
    var curMatch = '';
    var curMatchSuffix = '';

    var nameParts = name.split(separatorRegEx);
    
    main:
    for (var p in System.map) {
      var matchParts = p.split(separatorRegEx);
      if (matchParts.length > nameParts.length)
        continue;

      for (var i = 0; i < matchParts.length; i++)
        if (nameParts[i] != matchParts[i])
          continue main;
    
      if (p.length <= curMatch.length)
        continue;

      curMatch = p;
      curMatchSuffix = name.substr(nameParts.splice(0, matchParts.length).join('/').length);
    }
    if (curMatch)
      name = System.map[curMatch] + curMatchSuffix;

    return name;
  }

  var systemNormalize = System.normalize;
  System.normalize = function(name, parentName, parentAddress) {
    return systemNormalize(applyMap(name), parentName, parentAddress);
  }
})();