(function () {
  // Copyright Joyent, Inc. and other Node contributors.
  //
  // Permission is hereby granted, free of charge, to any person obtaining a
  // copy of this software and associated documentation files (the
  // "Software"), to deal in the Software without restriction, including
  // without limitation the rights to use, copy, modify, merge, publish,
  // distribute, sublicense, and/or sell copies of the Software, and to permit
  // persons to whom the Software is furnished to do so, subject to the
  // following conditions:
  //
  // The above copyright notice and this permission notice shall be included
  // in all copies or substantial portions of the Software.
  //
  // THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
  // OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
  // MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
  // NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
  // DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
  // OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
  // USE OR OTHER DEALINGS IN THE SOFTWARE.
  // resolves . and .. elements in a path array with directory names there
  // must be no slashes, empty elements, or device names (c:\) in the array
  // (so also no leading and trailing slashes - it does not distinguish
  // relative and absolute paths)
  function normalizeArray(parts, allowAboveRoot) {
    // if the path tries to go above the root, `up` ends up > 0
    var up = 0;

    for (var i = parts.length - 1; i >= 0; i--) {
      var last = parts[i];

      if (last === '.') {
        parts.splice(i, 1);
      } else if (last === '..') {
        parts.splice(i, 1);
        up++;
      } else if (up) {
        parts.splice(i, 1);
        up--;
      }
    } // if the path is allowed to go above the root, restore leading ..s


    if (allowAboveRoot) {
      for (; up--; up) {
        parts.unshift('..');
      }
    }

    return parts;
  } // Split a filename into [root, dir, basename, ext], unix version
  // 'root' is just a slash, or nothing.


  var splitPathRe = /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/;

  var splitPath = function (filename) {
    return splitPathRe.exec(filename).slice(1);
  }; // path.resolve([from ...], to)
  // posix version


  function resolve() {
    var resolvedPath = '',
        resolvedAbsolute = false;

    for (var i = arguments.length - 1; i >= -1 && !resolvedAbsolute; i--) {
      var path = i >= 0 ? arguments[i] : '/'; // Skip empty and invalid entries

      if (typeof path !== 'string') {
        throw new TypeError('Arguments to path.resolve must be strings');
      } else if (!path) {
        continue;
      }

      resolvedPath = path + '/' + resolvedPath;
      resolvedAbsolute = path.charAt(0) === '/';
    } // At this point the path should be resolved to a full absolute path, but
    // handle relative paths to be safe (might happen when process.cwd() fails)
    // Normalize the path


    resolvedPath = normalizeArray(filter(resolvedPath.split('/'), function (p) {
      return !!p;
    }), !resolvedAbsolute).join('/');
    return (resolvedAbsolute ? '/' : '') + resolvedPath || '.';
  }
  // posix version

  function normalize(path) {
    var isPathAbsolute = isAbsolute(path),
        trailingSlash = substr(path, -1) === '/'; // Normalize the path

    path = normalizeArray(filter(path.split('/'), function (p) {
      return !!p;
    }), !isPathAbsolute).join('/');

    if (!path && !isPathAbsolute) {
      path = '.';
    }

    if (path && trailingSlash) {
      path += '/';
    }

    return (isPathAbsolute ? '/' : '') + path;
  }

  function isAbsolute(path) {
    return path.charAt(0) === '/';
  } // posix version

  function join() {
    var paths = Array.prototype.slice.call(arguments, 0);
    return normalize(filter(paths, function (p, index) {
      if (typeof p !== 'string') {
        throw new TypeError('Arguments to path.join must be strings');
      }

      return p;
    }).join('/'));
  } // path.relative(from, to)
  // posix version

  function relative(from, to) {
    from = resolve(from).substr(1);
    to = resolve(to).substr(1);

    function trim(arr) {
      var start = 0;

      for (; start < arr.length; start++) {
        if (arr[start] !== '') break;
      }

      var end = arr.length - 1;

      for (; end >= 0; end--) {
        if (arr[end] !== '') break;
      }

      if (start > end) return [];
      return arr.slice(start, end - start + 1);
    }

    var fromParts = trim(from.split('/'));
    var toParts = trim(to.split('/'));
    var length = Math.min(fromParts.length, toParts.length);
    var samePartsLength = length;

    for (var i = 0; i < length; i++) {
      if (fromParts[i] !== toParts[i]) {
        samePartsLength = i;
        break;
      }
    }

    var outputParts = [];

    for (var i = samePartsLength; i < fromParts.length; i++) {
      outputParts.push('..');
    }

    outputParts = outputParts.concat(toParts.slice(samePartsLength));
    return outputParts.join('/');
  }
  var sep = '/';
  var delimiter = ':';
  function dirname(path) {
    var result = splitPath(path),
        root = result[0],
        dir = result[1];

    if (!root && !dir) {
      // No dirname whatsoever
      return '.';
    }

    if (dir) {
      // It has a dirname, strip trailing slash
      dir = dir.substr(0, dir.length - 1);
    }

    return root + dir;
  }
  function basename(path, ext) {
    var f = splitPath(path)[2]; // TODO: make this comparison case-insensitive on windows?

    if (ext && f.substr(-1 * ext.length) === ext) {
      f = f.substr(0, f.length - ext.length);
    }

    return f;
  }
  function extname(path) {
    return splitPath(path)[3];
  }
  var path = {
    extname: extname,
    basename: basename,
    dirname: dirname,
    sep: sep,
    delimiter: delimiter,
    relative: relative,
    join: join,
    isAbsolute: isAbsolute,
    normalize: normalize,
    resolve: resolve
  };

  function filter(xs, f) {
    if (xs.filter) return xs.filter(f);
    var res = [];

    for (var i = 0; i < xs.length; i++) {
      if (f(xs[i], i, xs)) res.push(xs[i]);
    }

    return res;
  } // String.prototype.substr - negative index don't work in IE8


  var substr = 'ab'.substr(-1) === 'b' ? function (str, start, len) {
    return str.substr(start, len);
  } : function (str, start, len) {
    if (start < 0) start = str.length + start;
    return str.substr(start, len);
  };

  const cjsRequireRegEx = /(?:^\uFEFF?|[^$_a-zA-Z\xA0-\uFFFF."'])require\s*\(\s*("[^"\\]*(?:\\.[^"\\]*)*"|'[^'\\]*(?:\\.[^'\\]*)*'|`[^`\\]*(?:\\.[^`\\]*)*`)\s*\)/g; // require('...') || exports[''] = ... || exports.asd = ... || module.exports = ...

  const cjsExportsRegEx = /(?:^\uFEFF?|[^$_a-zA-Z\xA0-\uFFFF.])(exports\s*(\[['"]|\.)|module(\.exports|\['exports'\]|\["exports"\])\s*(\[['"]|[=,\.]))/;
  const cjsFileDirRegEx = /__filename|__dirname]/; // good enough ES6 module detection regex - format detections not designed to be accurate, but to handle the 99% use case

  const esmRegEx = /(^\s*|[}\);\n]\s*)(import\s*(['"]|(\*\s+as\s+)?(?!type)([^"'\(\)\n; ]+)\s*from\s*['"]|\{)|export\s+\*\s+from\s+["']|export\s*(\{|default|function|class|var|const|let|async\s+function))/; // used to support leading #!/usr/bin/env in scripts as supported in Node

  const hashBangRegEx = /^\#\!.*/; // AMD Module Format Detection RegEx
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

  function detectFormat(url, source) {
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

  /*
   * Support for a "transform" loader interface
   */

  const systemJSPrototype = System.constructor.prototype;
  const resolve$1 = systemJSPrototype.resolve;

  systemJSPrototype.resolve = function (url, parent) {
    return resolve$1.call(this, url, parent);
  };

  const instantiate = systemJSPrototype.instantiate;

  systemJSPrototype.instantiate = function (url, parent) {
    if (url.slice(-5) === '.wasm') {
      return instantiate.call(this, url, parent);
    }

    const context = {
      parent
    };
    return this.fetch(context, url).catch(({
      code,
      message
    }) => {
      throw new Error(`Fetch error: ${code} ${message}${parent ? ` loading from ${parent}` : ''}`);
    }).then(source => this.detectFormat(context, url, source)).then(source => {
      if (this.transform.length === 3) {
        return this.transform(context, url, source);
      }

      return this.transform(url, source);
    }).then(source => this.evaluate(context, url, source)).then(registration => registration || this.getRegister());
  }; // Hookable fetch function


  systemJSPrototype.fetch = function (context, url) {
    const options = {
      credentials: 'same-origin'
    };
    return fetch(url, options).then(function (res) {
      if (res.ok) {
        return res.text();
      }

      throw {
        url,
        code: res.status,
        message: res.statusText
      };
    }).catch(function (err) {
      throw err;
    });
  }; // Hookable file format detection


  systemJSPrototype.detectFormat = function (context, url, source) {
    context.format = detectFormat(url, source);
    return source;
  }; // Hookable transform function!


  systemJSPrototype.transform = function (context, url, source) {
    return source;
  }; // Hookable evaluate function


  systemJSPrototype.evaluate = function (context, url, source) {
    try {
      const wrapped = `${source}\n//# sourceURL=${url}`;
      (0, eval)(wrapped);
    } catch (err) {
      throw err;
    }
  };

}());
//# sourceMappingURL=transform.js.map
