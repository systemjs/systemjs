/*
  SystemJS CommonJS Format
*/
function cjs(loader) {

  // CJS Module Format
  // require('...') || exports[''] = ... || exports.asd = ... || module.exports = ...
  var cjsExportsRegEx = /(?:^\s*|[}{\(\);,\n=:\?\&]\s*|module\.)(exports\s*\[\s*('[^']+'|"[^"]+")\s*\]|\exports\s*\.\s*[_$a-zA-Z\xA0-\uFFFF][_$a-zA-Z0-9\xA0-\uFFFF]*|exports\s*\=)/;
  var cjsRequireRegEx = /(?:^\s*|[}{\(\);,\n=:\?\&]\s*)require\s*\(\s*("([^"]+)"|'([^']+)')\s*\)/g;
  var commentRegEx = /(\/\*([\s\S]*?)\*\/|([^:]|^)\/\/(.*)$)/mg;

  function getCJSDeps(source) {
    cjsExportsRegEx.lastIndex = 0;
    cjsRequireRegEx.lastIndex = 0;

    var deps = [];

    // remove comments from the source first
    var source = source.replace(commentRegEx, '');

    var match;

    while (match = cjsRequireRegEx.exec(source))
      deps.push(match[2] || match[3]);

    return deps;
  }

  var loaderTranslate = loader.translate;
  loader.translate = function(load) {
    var loader = this;
    if (!loader._getCJSDeps)
      loader._getCJSDeps = getCJSDeps;
    return loaderTranslate.call(loader, load);
  }


  var noop = function() {}
  var nodeProcess = {
    nextTick: function(f) {
      setTimeout(f, 7);
    },
    browser: typeof window != 'undefined',
    env: {},
    argv: [],
    on: noop,
    once: noop,
    off: noop,
    emit: noop,
    cwd: function() { return '/' }
  };
  loader.set('@@nodeProcess', Module(nodeProcess));

  var loaderInstantiate = loader.instantiate;
  loader.instantiate = function(load) {

    if (!load.metadata.format) {
      cjsExportsRegEx.lastIndex = 0;
      cjsRequireRegEx.lastIndex = 0;
      if (cjsRequireRegEx.exec(load.source) || cjsExportsRegEx.exec(load.source))
        load.metadata.format = 'cjs';
    }

    if (load.metadata.format == 'cjs') {
      load.metadata.deps = load.metadata.deps ? load.metadata.deps.concat(getCJSDeps(load.source)) : load.metadata.deps;

      load.metadata.executingRequire = true;

      load.metadata.execute = function(require, exports, moduleName) {
        var dirname = load.address.split('/');
        dirname.pop();
        dirname = dirname.join('/');

        var globals = loader.global._g = {
          global: loader.global,
          exports: exports,
          module: { exports: exports },
          process: nodeProcess,
          require: require,
          __filename: load.address,
          __dirname: dirname
        };

        var glString = '';
        for (var _g in globals)
          glString += 'var ' + _g + ' = _g.' + _g + ';';

        load.source = glString + load.source;

        // disable AMD detection
        delete loader.global.define;

        loader.__exec(load);

        loader.global._g = undefined;

        var output = globals.module.exports;

        if (output && output.__esModule)
          return output;
        else if (output !== undefined)
          return { __useDefault: true, 'default': output };
      }
    }

    return loaderInstantiate.call(this, load);
  };
}