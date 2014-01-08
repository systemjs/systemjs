/*
  SystemJS Formats

  Provides modular support for format detections.

  Add a format with:
    System.formats.push('myformatname');
    System.format.myformat = {
      detect: function(source, load) {
        return false / depArray;
      },
      execute: function(load, depMap, global, execute) {
        return moduleObj; // (doesnt have to be a Module instance)
      }
    }

  The System.formats array sets the format detection order.
  
  See the AMD, global and CommonJS format extensions for examples.
*/
(function() {

  (function(global) {

    System.format = {};
    System.formats = [];

    var es6RegEx = /(?:^\s*|[}{\(\);,\n]\s*)(import\s+['"]|(import|module)\s+[^"'\(\)\n;]+\s+from\s+['"]|export\s+(\*|\{|default|function|var|const|let|[_$a-zA-Z\xA0-\uFFFF][_$a-zA-Z0-9\xA0-\uFFFF]*))/;

    // module format hint regex
    var formatHintRegEx = /^(\s*(\/\*.*\*\/)|(\/\/[^\n]*))*(["']use strict["'];?)?["']([^'"]+)["'][;\n]/;

    // go through a module list or module and if the only
    // export is the default, then provide it directly
    // useful for module.exports = function() {} handling
    var checkDefaultOnly = function(module) {
      if (!(module instanceof Module)) {
        var out = [];
        for (var i = 0; i < module.length; i++)
          out[i] = checkDefaultOnly(module[i]);
        return out;
      }
      return module.__defaultOnly ? module['default'] : module;
    }

    // determine if the source is minified - don't remove comments in this case
    function isMinified(str) {
      var newlines = str.match(/\n/g);
      return str.length / (newlines && newlines.length || 1) > 100;
    }

    // function to remove the comments from a string
    // necessary for regex detection not to check commented code
    function removeComments(str) {
      // output
      // block comments replaced with equivalent whitespace
      // this is to ensure source maps remain valid
      var curOutIndex = 0,
        outString = '',
        blockCommentWhitespace = '';

      // mode variables
      var singleQuote = false,
        doubleQuote = false,
        regex = false,
        blockComment = false,
        doubleBackslash = false,
        lineComment = false;

      // character buffer
      var lastChar;
      var curChar = '';
      var lastToken;

      for (var i = 0, l = str.length; i <= l; i++) {
        lastChar = curChar;
        curChar = str.charAt(i);

        if (curChar === '\n' || curChar === '\r' || curChar === '') {
          regex = doubleQuote = singleQuote = doubleBackslash = false;
          if (lineComment) {
            curOutIndex = i;
            lineComment = false;
          }
          if (blockComment)
            blockCommentWhitespace += curChar;
          lastToken = '';
          continue;
        }

        if (lastChar !== ' ' && lastChar !== '\t')
          lastToken = lastChar;

        if (singleQuote || doubleQuote || regex) {
          if (curChar == '\\' && lastChar == '\\')
            doubleBackslash = !doubleBackslash;
        }

        if (singleQuote) {
          if (curChar === "'" && (lastChar !== '\\' || doubleBackslash))
            singleQuote = doubleBackslash = false;
        }

        else if (doubleQuote) {
          if (curChar === '"' && (lastChar !== '\\' || doubleBackslash))
            doubleQuote = doubleBackslash = false;
        }

        else if (regex) {
          if (curChar === '/' && (lastChar !== '\\' || doubleBackslash)) {
            // a comment inside a regex immediately means we've misread the regex
            // so switch back to block mode to detect the comment
            if (str.charAt(i + 1) == '/') {
              regex = doubleBackslash = false;
            }
            else {
              regex = doubleBackslash = false;
              i++;
              lastToken = lastChar = curChar;
              curChar = str.charAt(i);
            }
          }
        }

        else if (blockComment) {
          blockCommentWhitespace += ' ';
          if (curChar === '/' && lastChar === '*' && blockCommentWhitespace.length > 3) {
            blockComment = false;
            curOutIndex = i + 1;
          }
        }

        else if (!lineComment) {
          doubleQuote = curChar === '"';
          singleQuote = curChar === "'";

          if (lastChar !== '/')
            continue;
          
          if (curChar === '*') {
            blockComment = true;
            outString += blockCommentWhitespace + str.substring(curOutIndex, i - 1);
            blockCommentWhitespace = '  ';
          }
          else if (curChar === '/') {
            lineComment = true;
            outString += blockCommentWhitespace + str.substring(curOutIndex, i - 1);
            blockCommentWhitespace = '';
          }
          else if (lastToken !== '}' && lastToken !== ')' && lastToken !== ']' && !lastToken.match(/\w|\d|'|"|\-|\+/)) {
            // detection not perfect - careful comment detection within regex is used to compensate
            // without sacrificing global comment removal accuracy
            regex = true;
          }
        }
      }
      return outString + blockCommentWhitespace + str.substr(curOutIndex);
    }

    var systemInstantiate = System.instantiate;
    System.instantiate = function(load) {
      var name = load.name || '';

      if (!load.source || name == 'traceur')
        return systemInstantiate.call(this, load);

      var source = load.source;

      // set load.metadata.format from metadata or format hints in the source
      var format = load.metadata.format;
      if (!format) {
        var formatMatch = load.source.match(formatHintRegEx);
        if (formatMatch)
          format = formatMatch[5];
      }

      // es6 handled by core
      if (format == 'es6' || !format && source.match(es6RegEx)) {
        load.metadata.es6 = true;
        return systemInstantiate.call(System, load);
      }

      // remove comments to allow for regex format detections if necessary
      if (!format && !isMinified(source))
        source = removeComments(source);

      // do modular format detection and handling
      // format priority is order of System.formats array
      for (var i = 0; i < this.formats.length; i++) {
        var f = this.formats[i];

        if (format && format != f)
            continue;

        var curFormat = this.format[f];

        // run detection, which returns deps (even if format already knows format)
        var deps;
        if (!(deps = curFormat.detect(source, load)) && !format)
          continue;

        var execute = curFormat.execute;

        return {
          deps: deps,
          execute: function() {
            var depMap = {};
            for (var i = 0; i < arguments.length; i++)
              depMap[deps[i]] = checkDefaultOnly(arguments[i]);

            // yes this is a lot of arguments, but we really dont want to add the other properties
            // to the load object, as it is then too easy to create a global closure function of load
            // that causes the module source not to be garbage disposed
            var output = execute(load, depMap, global, function() {
              __scopedEval(load.source, global, load.address);
            });

            if (output instanceof global.Module)
              return output;
            else
              return new global.Module(output && output.__module ? output.__module : { __defaultOnly: true, 'default': output });
          }
        };
      }

      if (format && format != 'global')
        throw new TypeError('Format "' + format + '" not defined in System');
    }
  })(typeof window != 'undefined' ? window : global);

  // carefully scoped eval with given global
  function __scopedEval(__source, global, __sourceURL) {
    try {
      eval('with(global) { (function() { ' + __source + ' \n }).call(global); }'
        + (__sourceURL && !__source.match(/\/\/[@#] ?(sourceURL|sourceMappingURL)=([^\n]+)/)
        ? '\n//# sourceURL=' + __sourceURL : ''));
    }
    catch(e) {
      if (e.name == 'SyntaxError')
        e.message = 'Evaluating ' + __sourceURL + '\n\t' + e.message;
      throw e;
    }
  }

})();
