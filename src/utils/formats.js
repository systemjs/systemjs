import path from 'path';


// RegEx adjusted from https://github.com/jbrantly/yabble/blob/master/lib/yabble.js#L339
const cjsRequireRegEx = /(?:^\uFEFF?|[^$_a-zA-Z\xA0-\uFFFF."'])require\s*\(\s*("[^"\\]*(?:\\.[^"\\]*)*"|'[^'\\]*(?:\\.[^'\\]*)*'|`[^`\\]*(?:\\.[^`\\]*)*`)\s*\)/g

// require('...') || exports[''] = ... || exports.asd = ... || module.exports = ...
const cjsExportsRegEx = /(?:^\uFEFF?|[^$_a-zA-Z\xA0-\uFFFF.])(exports\s*(\[['"]|\.)|module(\.exports|\['exports'\]|\["exports"\])\s*(\[['"]|[=,\.]))/;

const cjsFileDirRegEx = /__filename|__dirname]/;

// good enough ES6 module detection regex - format detections not designed to be accurate, but to handle the 99% use case
const esmRegEx = /(^\s*|[}\);\n]\s*)(import\s*(['"]|(\*\s+as\s+)?(?!type)([^"'\(\)\n; ]+)\s*from\s*['"]|\{)|export\s+\*\s+from\s+["']|export\s*(\{|default|function|class|var|const|let|async\s+function))/;

// used to support leading #!/usr/bin/env in scripts as supported in Node
const hashBangRegEx = /^\#\!.*/;


// AMD Module Format Detection RegEx
// define([.., .., ..], ...)
// define(varName); || define(function(require, exports) {}); || define({})
const amdRegEx = /(?:^\uFEFF?|[^$_a-zA-Z\xA0-\uFFFF.])define\s*\(\s*("[^"]+"\s*,\s*|'[^']+'\s*,\s*)?\s*(\[(\s*(("[^"]+"|'[^']+')\s*,|\/\/.*\r?\n|\/\*(.|\s)*?\*\/))*(\s*("[^"]+"|'[^']+')\s*,?)?(\s*(\/\/.*\r?\n|\/\*(.|\s)*?\*\/))*\s*\]|function\s*|{|[_$a-zA-Z\xA0-\uFFFF][_$a-zA-Z0-9\xA0-\uFFFF]*\))/;
function detectAmdFormat(source) {
  return amdRegEx.test(source);
}

const leadingCommentAndMetaRegEx = /^(\s*\/\*[^\*]*(\*(?!\/)[^\*]*)*\*\/|\s*\/\/[^\n]*|\s*"[^"]+"\s*;?|\s*'[^']+'\s*;?)*\s*/;

function detectRegisterFormat(source) {
  const leadingCommentAndMeta = source.match(leadingCommentAndMetaRegEx);

  if (!leadingCommentAndMeta) {
    return false;
  }

  const codeStart = leadingCommentAndMeta[0].length;
  return source.substr(codeStart, 17) === 'SystemJS.register' || source.substr(codeStart, 15) === 'System.register';
}


export function detectFormat(url, source) {
  url = new URL(url);
  const ext = path.extname(url.pathname);
  let format = null;

  if (ext === '.mjs') {
    format = 'esm';
  } else if (ext === '.json') {
    format = 'json';
  } else if (ext === '.js') {
    format = 'cjs';
  } else if (url.protocol === 'builtin:') {
    return 'builtin';
  }

  if (source) {
    source = source.replace(hashBangRegEx, '');

    if (source.trim().length === 0) {
      return format;
    }

    if (ext === '.js') {
      if (cjsRequireRegEx.test(source) || cjsExportsRegEx.test(source) || cjsFileDirRegEx.test(source)) {
        format = 'cjs';
      }

      if (esmRegEx.test(source)) {
        format = 'esm';
      }

      if (detectRegisterFormat(source)) {
        format = 'register';
      }

      if (detectAmdFormat(source)) {
        format = 'amd';
      }
    }
  }

  return format;
}
