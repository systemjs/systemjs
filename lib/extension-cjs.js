/*
  SystemJS CommonJS Format
*/
function cjs(loader) {
  loader._extensions.push(cjs);

  // CJS Module Format
  // require('...') || exports[''] = ... || exports.asd = ... || module.exports = ...
  var cjsExportsRegEx = /(?:^\uFEFF?|[^$_a-zA-Z\xA0-\uFFFF.]|module\.)exports\s*(\[['"]|\.)|(?:^\uFEFF?|[^$_a-zA-Z\xA0-\uFFFF.])module\.exports\s*[=,]/;
  // RegEx adjusted from https://github.com/jbrantly/yabble/blob/master/lib/yabble.js#L339
  var cjsRequireRegEx = /(?:^\uFEFF?|[^$_a-zA-Z\xA0-\uFFFF."'])require\s*\(\s*("[^"\\]*(?:\\.[^"\\]*)*"|'[^'\\]*(?:\\.[^'\\]*)*')\s*\)/g;
  var commentRegEx = /(\/\*([\s\S]*?)\*\/|([^:]|^)\/\/(.*)$)/mg;

  function getCJSDeps(source) {
    cjsRequireRegEx.lastIndex = 0;

    var deps = [];

    // remove comments from the source first, if not minified
    if (source.length / source.split('\n').length < 200)
      source = source.replace(commentRegEx, '');

    var match;

    while (match = cjsRequireRegEx.exec(source))
      deps.push(match[1].substr(1, match[1].length - 2));

    return deps;
  }

  if (typeof location != 'undefined' && location.origin)
    var curOrigin = location.protocol + '//' + location.hostname + (location.port ? ':' + location.port : '');

  var loaderInstantiate = loader.instantiate;
  loader.instantiate = function(load) {

    if (!load.metadata.format) {
      cjsExportsRegEx.lastIndex = 0;
      cjsRequireRegEx.lastIndex = 0;
      if (cjsRequireRegEx.exec(load.source) || cjsExportsRegEx.exec(load.source))
        load.metadata.format = 'cjs';
    }

    if (load.metadata.format == 'cjs') {
      load.metadata.deps = load.metadata.deps ? load.metadata.deps.concat(getCJSDeps(load.source)) : getCJSDeps(load.source);

      load.metadata.executingRequire = true;

      load.metadata.execute = function(require, exports, module) {
        var dirname = (load.address || '').split('/');
        dirname.pop();
        dirname = dirname.join('/');

        var address = load.address;

        if (curOrigin && address.substr(0, curOrigin.length) === curOrigin) {
          address = address.substr(curOrigin.length);
          dirname = dirname.substr(curOrigin.length);
        }
        else if (address.substr(0, 5) == 'file:') {
          address = address.substr(5);
          dirname = dirname.substr(5);
        }

        // if on the server, remove the "file:" part from the dirname
        if (System._nodeRequire)
          dirname = dirname.substr(5);

        var globals = loader.global._g = {
          global: loader.global,
          exports: exports,
          module: module,
          require: require,
          __filename: address,
          __dirname: dirname
        };

        var source = '(function(global, exports, module, require, __filename, __dirname) { ' + load.source 
          + '\n}).call(_g.exports, _g.global, _g.exports, _g.module, _g.require, _g.__filename, _g.__dirname);';

        // disable AMD detection
        var define = loader.global.define;
        loader.global.define = undefined;

        loader.__exec({
          name: load.name,
          address: load.address,
          source: source
        });

        loader.global.define = define;

        loader.global._g = undefined;
      }
    }

    return loaderInstantiate.call(this, load);
  };
}
