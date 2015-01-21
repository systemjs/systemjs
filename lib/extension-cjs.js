/*
  SystemJS CommonJS Format
*/
function cjs(loader) {

  // CJS Module Format
  // require('...') || exports[''] = ... || exports.asd = ... || module.exports = ...
  var cjsExportsRegEx = /(?:^\uFEFF?|[^$_a-zA-Z\xA0-\uFFFF.]|module\.)(exports\s*\[['"]|\exports\s*\.)|(?:^\uFEFF?|[^$_a-zA-Z\xA0-\uFFFF.])module\.exports\s*\=/;

  // RegEx adjusted from https://github.com/jbrantly/yabble/blob/master/lib/yabble.js#L339
  var cjsRequireRegEx = /(?:^\uFEFF?|[^$_a-zA-Z\xA0-\uFFFF."'])require\s*\(\s*("[^"\\]*(?:\\.[^"\\]*)*"|'[^'\\]*(?:\\.[^'\\]*)*')\s*\)/g;

  var identifierCharRegEx = /[$_a-zA-Z\xA0-\uFFFF]/;

  // function to extract require statements from source
  // simple but comprehensive tokenzier
  function getRequires(src, requireName) {
    var requires = [];

    // mode variables
    var singleQuote = false,
      doubleQuote = false,
      regex = false,
      blockComment = false,
      lineComment = false;

    // character buffer
    var lastChar, curChar, 
      nextChar = src.charAt(0);

    // require statement detection state
    // states are cumulative, one leads to the other
    // if one fails, all reset
    var checkingRequire,
      readingCall,
      callRequireMatchLength,
      seekOpenBracket,
      seekRequireString,
      inRequireString,
      requireString,
      seekCloseBracket;

    notRequire();

    function notRequire() {
      checkingRequire = false;
      readingCall = false;
      seekOpenBracket = false;
      seekRequireString = false;
      inRequireString = false;
      seekCloseBracket = false;
    }

    for (var i = src.substr(0, 1) == '\uFEFF' ? 1 : 0, l = src.length; i < l; i++) {
      lastChar = curChar;
      curChar = nextChar;
      nextChar = src.charAt(i + 1);

      if (singleQuote || doubleQuote) {
        if (singleQuote && curChar === "'" && lastChar !== '\\'
          || doubleQuote && curChar === '"' && lastChar !== '\\') {
        
          singleQuote = doubleQuote = false;
        
          if (inRequireString) {
            inRequireString = false;
            seekCloseBracket = true;
          }
        }
        else {
          if (inRequireString)
            requireString += curChar;
        }
      }

      else if (regex) {
        if (curChar === '/'  && lastChar !== '\\')
          regex = false;
      }

      else if (blockComment) {
        if (curChar === '/' && lastChar === '*')
          blockComment = false;
      }
      
      else if (lineComment) {
        if (nextChar === '\n' || nextChar === '\r' || nextChar == '')
          lineComment = false;
      }

      else {
        doubleQuote = curChar === '"';
        singleQuote = curChar === "'";

        if (checkingRequire) {
          if (readingCall) {
            if (curChar !== requireName.substr(callRequireMatchLength++, 1))
              notRequire();

            if (callRequireMatchLength == requireName.length) {
              seekOpenBracket = true;
              readingCall = false;
            }
          }
          else if (seekOpenBracket || seekRequireString || seekCloseBracket) {
            if (seekOpenBracket && curChar === '(') {
              seekOpenBracket = false;
              seekRequireString = true;
            }
            else if (seekRequireString && (singleQuote || doubleQuote)) {
              inRequireString = true;
              requireString = '';
              seekRequireString = false;
            }
            else if (seekCloseBracket && curChar === ')') {
              checkingRequire = false;
              requires.push(requireString);
              seekCloseBracket = false;
            }
            else if (curChar !== ' ' && curChar !== '\n' && curChar !== '\r')
              notRequire();
          }
        }

        // new check
        if (!checkingRequire && curChar === requireName.substr(0, 1) && (!lastChar || !lastChar.match(identifierCharRegEx))) {
          checkingRequire = true;
          readingCall = true;
          callRequireMatchLength = 1;
        }

        if (curChar !== '/')
          continue;
        
        if (nextChar === '*') {
          blockComment = true;
        }
        else if (nextChar === '/') {
          lineComment = true;
          if (checkingRequire)
            notRequire();
        }
        else {
          regex = true;
          if (checkingRequire)
            notRequire();
        }
      }
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
      var deps = getRequires(load.source, 'require');
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
