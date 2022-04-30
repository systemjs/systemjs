var fs = require('fs');

// require('...') || exports[''] = ... || exports.asd = ... || module.exports = ...
var cjsExportsRegEx = /(?:^\uFEFF?|[^$_a-zA-Z\xA0-\uFFFF.])(exports\s*(\[['"]|\.)|module(\.exports|\['exports'\]|\["exports"\])\s*(\[['"]|[=,\.]))/;
// RegEx adjusted from https://github.com/jbrantly/yabble/blob/master/lib/yabble.js#L339
var cjsRequireRegEx = /(?:^\uFEFF?|[^$_a-zA-Z\xA0-\uFFFF."'])require\s*\(\s*("[^"\\]*(?:\\.[^"\\]*)*"|'[^'\\]*(?:\\.[^'\\]*)*')\s*\)/g;

/** This regex is used to find strings, comments and regex expressions that should be excluded from the deps search.
 * All the different kinds are used as alternatives so that they can be detected in a mutually exclusive way without interfering with eachother
 * Here is an example of how this expression handles complex js: https://regex101.com/r/r4A4is/1
 *                        ( double quoted string | single quoted string | string literal      | comment    | multi-line comment      | regular expression      ) */
 var depExclusionsRegEx = /("(?:\\.|[^"\\\n\r]*)*"|'(?:\\.|[^'\\\n\r]*)*'|\`(?:\\.|[^\`\\]*)*\`|\/\/[^\n\r]*|\/\*(?:\*[^\/]|[^*])*\*\/|\/(?:\\.|[^\/\\\n\r]*)*\/)/g;


function getCJSDeps(source) {
  cjsRequireRegEx.lastIndex = depExclusionsRegEx.lastIndex = 0;

  var deps = [];

  var match;

  // track string and comment locations for unminified source    
  var exclusionLocations = [];

  function inLocation (locations, index) {
    for (var i = 0; i < locations.length; i++)
      if (locations[i][0] < index && locations[i][1] > index)
        return true;
    return false;
  }

  while (match = depExclusionsRegEx.exec(source))
    exclusionLocations.push([match.index, match.index + match[0].length]);

  while (match = cjsRequireRegEx.exec(source)) {
    // ensure we're not within a string or comment location
    // 1 is added to the match index to align with the `require` word
    if (!inLocation(exclusionLocations, match.index + 1) ) {
      var dep = match[1].substr(1, match[1].length - 2);
      // skip cases like require('" + file + "')
      if (dep.match(/"|'/))
        continue;
      // trailing slash requires are removed as they don't map mains in SystemJS
      if (dep[dep.length - 1] == '/')
        dep = dep.substr(0, dep.length - 1);
      deps.push(dep);
    }
  }

  return deps;
}

var cjs = fs.readFileSync('./cjs-sample/cjs.js').toString();

var startTime = Date.now();
for (var i = 0; i < 1000; i++)
  getCJSDeps(cjs);
console.log(Date.now() - startTime);

