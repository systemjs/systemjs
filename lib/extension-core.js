/*
  SystemJS Core
  Adds normalization to the import function, as well as __useDefault support
*/
function core(loader) {
  (function() {

    var curSystem = loader;

    /*
      __useDefault
      
      When a module object looks like:
      new Module({
        __useDefault: true,
        default: 'some-module'
      })

      Then the import of that module is taken to be the 'default' export and not the module object itself.

      Useful for module.exports = function() {} handling
    */
    var checkUseDefault = function(module) {
      if (!(module instanceof Module)) {
        var out = [];
        for (var i = 0; i < module.length; i++)
          out[i] = checkUseDefault(module[i]);
        return out;
      }
      return module.__useDefault ? module['default'] : module;
    }
    
    // a variation on System.get that does the __useDefault check
    loader.getModule = function(key) {
      return checkUseDefault(loader.get(key));  
    }

    // support the empty module, as a concept
    loader.set('@empty', Module({}));
    
    
    var loaderImport = loader['import'];
    loader['import'] = function(name, options) {
      // patch loader.import to do normalization
      return new Promise(function(resolve) {
        resolve(loader.normalize.call(this, name, options && options.name, options && options.address))
      })
      // add useDefault support
      .then(function(name) {
        return Promise.resolve(loaderImport.call(loader, name, options)).then(function(module) {
          return checkUseDefault(module);
        });
      });
    }

    // Absolute URL parsing, from https://gist.github.com/Yaffle/1088850
    function parseURI(url) {
      var m = String(url).replace(/^\s+|\s+$/g, '').match(/^([^:\/?#]+:)?(\/\/(?:[^:@]*(?::[^:@]*)?@)?(([^:\/?#]*)(?::(\d*))?))?([^?#]*)(\?[^#]*)?(#[\s\S]*)?/);
      // authority = '//' + user + ':' + pass '@' + hostname + ':' port
      return (m ? {
        href     : m[0] || '',
        protocol : m[1] || '',
        authority: m[2] || '',
        host     : m[3] || '',
        hostname : m[4] || '',
        port     : m[5] || '',
        pathname : m[6] || '',
        search   : m[7] || '',
        hash     : m[8] || ''
      } : null);
    }
    function toAbsoluteURL(base, href) {
      function removeDotSegments(input) {
        var output = [];
        input.replace(/^(\.\.?(\/|$))+/, '')
          .replace(/\/(\.(\/|$))+/g, '/')
          .replace(/\/\.\.$/, '/../')
          .replace(/\/?[^\/]*/g, function (p) {
            if (p === '/..')
              output.pop();
            else
              output.push(p);
        });
        return output.join('').replace(/^\//, input.charAt(0) === '/' ? '/' : '');
      }

      href = parseURI(href || '');
      base = parseURI(base || '');

      return !href || !base ? null : (href.protocol || base.protocol) +
        (href.protocol || href.authority ? href.authority : base.authority) +
        removeDotSegments(href.protocol || href.authority || href.pathname.charAt(0) === '/' ? href.pathname : (href.pathname ? ((base.authority && !base.pathname ? '/' : '') + base.pathname.slice(0, base.pathname.lastIndexOf('/') + 1) + href.pathname) : base.pathname)) +
        (href.protocol || href.authority || href.pathname ? href.search : (href.search || base.search)) +
        href.hash;
    }
    var baseURI;
    if (typeof window == 'undefined') {
      baseURI = __dirname;
    }
    else {
      baseURI = document.baseURI;
      if (!baseURI) {
        var bases = document.getElementsByTagName('base');
        baseURI = bases[0] && bases[0].href || window.location.href;
      }
    }

    // System.meta provides default metadata
    System.meta = {};

    // override locate to allow baseURL to be document-relative
    var loaderLocate = loader.locate;
    var normalizedBaseURL;
    loader.locate = function(load) {
      if (this.baseURL != normalizedBaseURL)
        this.baseURL = normalizedBaseURL = toAbsoluteURL(baseURI, this.baseURL);

      var meta = System.meta[load.name];
      for (var p in meta)
        load.metadata[p] = meta[p];

      return Promise.resolve(loaderLocate.call(this, load));
    }

    // define exec for custom instantiations
    loader.__exec = function(load) {

      // support sourceMappingURL (efficiently)
      var sourceMappingURL;
      var lastLineIndex = load.source.lastIndexOf('\n');
      if (lastLineIndex != -1) {
        if (load.source.substr(lastLineIndex + 1, 21) == '//# sourceMappingURL=')
          sourceMappingURL = toAbsoluteURL(load.address, load.source.substr(lastLineIndex + 22));
      }

      __eval(load.source, loader.global, load.address, sourceMappingURL);

      // traceur overwrites System - write it back
      if (load.name == '@traceur') {
        loader.global.traceurSystem = loader.global.System;
        loader.global.System = curSystem;
      }
    }

  })();

  function __eval(__source, __global, __address, __sourceMap) {
    try {
      __source = 'with(__global) { (function() { ' + __source + ' \n }).call(__global); }'
        + '\n//# sourceURL=' + __address
        + (__sourceMap ? '\n//# sourceMappingURL=' + __sourceMap : '');
      eval(__source);
    }
    catch(e) {
      if (e.name == 'SyntaxError')
        e.message = 'Evaluating ' + __address + '\n\t' + e.message;
      throw e;
    }
  }
}