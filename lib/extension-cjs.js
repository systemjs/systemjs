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
  var stateRegEx = /"|'|\/\/|\/\*|\/|(^\uFEFF?|[^$_a-zA-Z\xA0-\uFFFF."'])require[^$_a-zA-Z\xA0-\uFFFF]/g;
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

  // check if we have a require statement, if so add string to require list
  // 'index' is require( /* */ 'tes require("invalid"); t'  );
  //            input: ^                            output: ^
  // return the index at the failed point or end, in a standard source state
  function checkRequire(str, index, requires) {
    endWhiteStateRegEx.lastIndex = index;

    var seekOpenBracket = true, seekRequireString, seekCloseBracket, requireString;

    // look ahead to state change
    while (match = endWhiteStateRegEx.exec(str)) {
      var newState = match[0];

      if (seekOpenBracket && newState === '(') {
        seekRequireString = true;
        seekOpenBracket = false;
      }
      else if (seekCloseBracket && newState === ')') {
        requires.push(requireString);
        return endWhiteStateRegEx.lastIndex;
      }
      else if (seekRequireString && (newState === '"' || newState === "'")) {
        requireString = str.substring(endWhiteStateRegEx.lastIndex, (endWhiteStateRegEx.lastIndex = walkString(str, newState === '"', endWhiteStateRegEx.lastIndex)) - 1);
        seekCloseBracket = true;
        seekRequireString = false;
      }
      else if (newState === '/' && str.charAt(endWhiteStateRegEx.lastIndex) === '/') {
        endWhiteStateRegEx.lastIndex = walkLineComment(str, endWhiteStateRegEx.lastIndex);
      }
      else if (newState === '/' && str.charAt(endWhiteStateRegEx.lastIndex) === '*') {
        endWhiteStateRegEx.lastIndex = walkBlockComment(str, endWhiteStateRegEx.lastIndex);
      }
      else {
        return endWhiteStateRegEx.lastIndex - 1;
      }
    }
    return index;
  }

  function getRequires(str) {
    var requires = [];

    stateRegEx.lastIndex = 0;

    // look ahead to state change
    while (match = stateRegEx.exec(str)) {
      var newState = match[0];

      if (newState === '"' || newState === "'")
        stateRegEx.lastIndex = walkString(str, newState === '"', stateRegEx.lastIndex);
      else if (newState === '/')
        stateRegEx.lastIndex = walkRegEx(str, stateRegEx.lastIndex);
      else if (newState === '//')
        stateRegEx.lastIndex = walkLineComment(str, stateRegEx.lastIndex);
      else if (newState === '/*')
        stateRegEx.lastIndex = walkBlockComment(str, stateRegEx.lastIndex);
      else
        stateRegEx.lastIndex = checkRequire(str, stateRegEx.lastIndex - 1, requires);
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
