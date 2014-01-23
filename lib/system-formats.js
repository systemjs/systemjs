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

    // also in ESML, build.js
    var es6RegEx = /(?:^\s*|[}{\(\);,\n]\s*)(import\s+['"]|(import|module)\s+[^"'\(\)\n;]+\s+from\s+['"]|export\s+(\*|\{|default|function|var|const|let|[_$a-zA-Z\xA0-\uFFFF][_$a-zA-Z0-9\xA0-\uFFFF]*))/;

    // module format hint regex
    var formatHintRegEx = /^(\s*(\/\*.*\*\/)|(\/\/[^\n]*))*(["']use strict["'];?)?["']([^'"]+)["'][;\n]/;

    var systemInstantiate = System.instantiate;
    System.instantiate = function(load) {
      var name = load.name || '';

      if (!load.source || name == 'traceur')
        return systemInstantiate.call(this, load);

      // set load.metadata.format from metadata or format hints in the source
      var format = load.metadata.format;
      if (!format) {
        var formatMatch = load.source.match(formatHintRegEx);
        if (formatMatch)
          format = load.metadata.format = formatMatch[5];
      }

      // es6 handled by core
      if (format == 'es6' || !format && load.source.match(es6RegEx)) {
        load.metadata.es6 = true;
        return systemInstantiate.call(System, load);
      }

      // if we don't know the format, run detection first
      if (!format || !this.format[format])
        for (var i = 0; i < this.formats.length; i++) {
          var f = this.formats[i];
          var curFormat = this.format[f];
          if (curFormat.detect(load)) {
            format = f;
            break;
          }
        }

      var curFormat = this.format[format];

      // if we don't have a format or format rule, throw
      if (!format || !curFormat)
        throw new TypeError('No format found for ' + (format ? format : load.address));

      // now invoke format instantiation
      function exec() {
        __scopedEval(load.source, global, load.address);
      }
      return {
        deps: curFormat.deps(load, global, exec),
        execute: function() {
          var output = curFormat.execute.call(this, Array.prototype.splice.call(arguments, 0), load, global, exec);

          if (output instanceof global.Module)
            return output;
          else
            return new global.Module(output && output.__transpiledModule ? (delete output.__transpiledModule, output) : { __defaultOnly: true, 'default': output });
        }
      };
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
