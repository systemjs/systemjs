/*
  SystemJS CommonJS Format
  Provides the CommonJS module format definition at System.format.cjs
*/
(function() {
  System.formats.push('cjs');

  // CJS Module Format
  // require('...') || exports[''] = ... || exports.asd = ... || module.exports = ...
  var cjsExportsRegEx = /(?:^\s*|[}{\(\);,\n=:\?\&]\s*|module\.)(exports\s*\[\s*('[^']+'|"[^"]+")\s*\]|\exports\s*\.\s*[_$a-zA-Z\xA0-\uFFFF][_$a-zA-Z0-9\xA0-\uFFFF]*|exports\s*\=)/;
  var cjsRequireRegEx = /(?:^\s*|[}{\(\);,\n=:\?\&]\s*)require\s*\(\s*("([^"]+)"|'([^']+)')\s*\)/g;
  var commentRegEx = /(\/\*([\s\S]*?)\*\/|([^:]|^)\/\/(.*)$)/mg;

  var nodeProcess = {
    nextTick: function(f) {
      setTimeout(f, 7);
    }
  };

  System.format.cjs = {
    detect: function(load) {
      cjsExportsRegEx.lastIndex = 0;
      cjsRequireRegEx.lastIndex = 0;
      return !!(cjsRequireRegEx.exec(load.source) || cjsExportsRegEx.exec(load.source));
    },
    deps: function(load, global, exec) {
      cjsExportsRegEx.lastIndex = 0;
      cjsRequireRegEx.lastIndex = 0;

      var deps = [];

      // remove comments from the source first
      var source = load.source.replace(commentRegEx, '');

      var match;

      while (match = cjsRequireRegEx.exec(source))
        deps.push(match[2] || match[3]);

      load.metadata.deps = deps;

      return deps;
    },
    execute: function(depNames, load, global, exec) {
      var dirname = load.address.split('/');
      dirname.pop();
      dirname = dirname.join('/');

      var deps = load.metadata.deps;

      var globals = global._g = {
        global: global,
        exports: {},
        process: nodeProcess,
        require: function(d) {
          var index = deps.indexOf(d);
          if (index != -1)
            return System.get(depNames[index]);
        },
        __filename: load.address,
        __dirname: dirname,
      };
      globals.module = { exports: globals.exports };

      var glString = '';
      for (var _g in globals)
        glString += 'var ' + _g + ' = _g.' + _g + ';';

      load.source = glString + load.source;

      exec();

      delete global._g;

      return globals.module.exports;
    }
  };
})();