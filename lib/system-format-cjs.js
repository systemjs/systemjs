(function() {
  System.formats.push('cjs');

  // CJS Module Format
  // require('...') || exports[''] = ... || exports.asd = ... || module.exports = ...
  var cjsExportsRegEx = /(?:^\s*|[}{\(\);,\n=:\?\&]\s*|module\.)(exports\s*\[\s*('[^']+'|"[^"]+")\s*\]|\exports\s*\.\s*[_$a-zA-Z\xA0-\uFFFF][_$a-zA-Z0-9\xA0-\uFFFF]*|exports\s*\=)/;
  var cjsRequireRegEx = /(?:^\s*|[}{\(\);,\n=:\?\&]\s*)require\s*\(\s*("([^"]+)"|'([^']+)')\s*\)/g;

  var nodeProcess = {
    nextTick: function(f) {
      setTimeout(f, 7);
    }
  };

  System.format.cjs = {
    detect: function(source) {

      cjsExportsRegEx.lastIndex = 0;
      cjsRequireRegEx.lastIndex = 0;

      var firstMatch = cjsRequireRegEx.exec(source);

      // fail detection
      if (!firstMatch && !source.match(cjsExportsRegEx))
        return false;

      var deps = [];
      var match;
      if ((match = firstMatch))
        deps.push(match[2] || match[3]);

      while (match = cjsRequireRegEx.exec(source))
        deps.push(match[2] || match[3]);

      return deps;
    },
    execute: function(load, depMap, global, execute) {
      var dirname = load.address.split('/');
      dirname.pop();
      dirname = dirname.join('/');

      var globals = global._g = {
        global: global,
        exports: {},
        process: nodeProcess,
        require: function(d) {
          return depMap[d];
        },
        __filename: load.address,
        __dirname: dirname,
      };
      globals.module = { exports: globals.exports };

      var glString = '';
      for (var _g in globals)
        glString += 'var ' + _g + ' = _g.' + _g + ';';

      load.source = glString + load.source;

      execute();

      delete global._g;

      return globals.module.exports;
    }
  };
})();