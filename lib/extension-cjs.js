/*
  SystemJS CommonJS Format
*/
function cjs(loader) {

  // CJS Module Format
  // require('...') || exports[''] = ... || exports.asd = ... || module.exports = ...
  var cjsExportsRegEx = /(?:^\uFEFF?|[^$_a-zA-Z\xA0-\uFFFF.]|module\.)(exports\s*\[['"]|\exports\s*\.)|(?:^\uFEFF?|[^$_a-zA-Z\xA0-\uFFFF.])module\.exports\s*\=/;

  // RegEx adjusted from https://github.com/jbrantly/yabble/blob/master/lib/yabble.js#L339
  var cjsRequireRegEx = /(?:^\uFEFF?|[^$_a-zA-Z\xA0-\uFFFF."'])require\s*\(\s*("[^"\\]*(?:\\.[^"\\]*)*"|'[^'\\]*(?:\\.[^'\\]*)*')\s*\)/g;

  var newLineRegEx = /\n|\r/g;
  var blockCommentEndRegEx = /\*\//g;

  // find characters that change state
  var stateRegEx = /"|'|\/\/|\/\*|\//g;
  var endWhiteStateRegEx = /\S/g;

  var regExEndRegEx = /\/|\n|\r/g;

  // walk functions assume a mode, and return the index at the end of that mode
  function walkString(str, doubleQuote, index) {
    var backtrack;
    while (index = str.indexOf(doubleQuote ? '"' : "'", index + 1)) {
      // check even number of \\ to know its the right string end
      backtrack = index;
      while (str.charAt(--backtrack) == '\\');
      if ((index - backtrack) % 2)
        return index + 1;
    }
    return str.length - 1;
  }
  function walkRegEx(str, index) {
    var backtrack, match;
    regExEndRegEx.lastIndex = index + 1;
    while (match = regExEndRegEx.exec(str)) {
      // newline terminates regex, may have been confused for division
      if (match[0] !== '/')
        return regExEndRegEx.lastIndex;

      backtrack = regExEndRegEx.lastIndex;
      while (str.charAt(--backtrack) == '\\');
      if ((regExEndRegEx.lastIndex - backtrack) % 2)
        return regExEndRegEx.lastIndex;
    }
    return str.length - 1;
  }
  function walkBlockComment(str, index) {
    blockCommentEndRegEx.lastIndex = index;
    blockCommentEndRegEx.exec(str);
    return blockCommentEndRegEx.lastIndex || str.length - 1;
  }
  function walkLineComment(str, index) {
    newLineRegEx.lastIndex = index;
    newLineRegEx.exec(str);
    return newLineRegEx.lastIndex || str.length - 1;
  }

  function getRequires(str) {
    // an array of alternating string/comment start/end points in str
    // note regular expressions are not added as ignore zones as they are confusable with division
    var stringsAndCommentIndexes = [];

    stateRegEx.lastIndex = 0;

    // work out these alternative points by seeking ahead to the next state change
    while (match = stateRegEx.exec(str)) {
      var newState = match[0];

      stringsAndCommentIndexes.push(stateRegEx.lastIndex - 1);

      stateRegEx.lastIndex = (newState === '"' || newState === "'") && walkString(str, newState === '"', stateRegEx.lastIndex)
          || newState === '/' && walkRegEx(str, stateRegEx.lastIndex)
          || newState === '//' && walkLineComment(str, stateRegEx.lastIndex)
          || newState === '/*' && walkBlockComment(str, stateRegEx.lastIndex);

      stringsAndCommentIndexes.push(stateRegEx.lastIndex - 1);
    }

    // now run require regex
    var requires = [];
    var lastIndex = 0;
    var l = stringsAndCommentIndexes.length;
    cjsRequireRegEx.lastIndex = 0;
    while (match = cjsRequireRegEx.exec(str)) {
      // if it started in a dead zone, ignore
      var startIndex = cjsRequireRegEx.lastIndex - match[0].length;
      while (lastIndex <= l && stringsAndCommentIndexes[lastIndex++] < startIndex);
      if (lastIndex % 2)
        requires.push(match[1].substr(1, match[1].length - 2));
    }
    return requires;
  }

  var loaderInstantiate = loader.instantiate;
  loader.instantiate = function(load) {

    if (!load.metadata.format) {
      cjsExportsRegEx.lastIndex = 0;
      cjsRequireRegEx.lastIndex = 0;
      if (cjsRequireRegEx.exec(load.source) || cjsExportsRegEx.exec(load.source))
        load.metadata.format = 'cjs';
    }

    if (load.metadata.format == 'cjs') {
      var deps = getRequires(load.source);
      load.metadata.deps = load.metadata.deps ? load.metadata.deps.concat(deps) : deps;

      load.metadata.executingRequire = true;

      load.metadata.execute = function(require, exports, module) {
        var dirname = (load.address || '').split('/');
        dirname.pop();
        dirname = dirname.join('/');

        // if on the server, remove the "file:" part from the dirname
        if (System._nodeRequire)
          dirname = dirname.substr(5);

        var globals = loader.global._g = {
          global: loader.global,
          exports: exports,
          module: module,
          require: require,
          __filename: System._nodeRequire ? load.address.substr(5) : load.address,
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
