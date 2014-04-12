/*
  SystemJS Core
  Adds normalization to the import function, as well as __useDefault support
*/
(function(global) {
  // check we have System
  if (typeof System == 'undefined')
    throw 'System not defined. Include the `es6-module-loader.js` polyfill before SystemJS.';

  var curSystem = System;

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
  System.getModule = function(key) {
    return checkUseDefault(System.get(key));  
  }

  // support the empty module, as a concept
  System.set('@empty', Module({}));
  
  
  var systemImport = System['import'];
  System['import'] = function(name, options) {
    // patch System.import to do normalization
    return new Promise(function(resolve) {
      resolve(System.normalize.call(this, name, options && options.name, options && options.address))
    })
    // add useDefault support
    .then(function(name) {
      return Promise.resolve(systemImport.call(System, name, options)).then(function(module) {
        return checkUseDefault(module);
      });
    });
  };

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

  // override locate to allow baseURL to be document-relative
  var systemLocate = System.locate;
  var normalizedBaseURL;
  System.meta = {};
  System.locate = function(load) {
    if (this.baseURL != normalizedBaseURL)
      this.baseURL = normalizedBaseURL = toAbsoluteURL(baseURI, this.baseURL);
    
    var systemMetadata = System.meta[load.name]
    for(var prop in systemMetadata) {
      load.metadata[prop] = systemMetadata[prop];
    }
    return Promise.resolve(systemLocate.call(this, load));
  };

  // define exec for custom instan
  System.__exec = function(load) {
    try {
      Function('global', 'with(global) { ' + load.source + ' \n }'
      + (load.address && !load.source.match(/\/\/[@#] ?(sourceURL|sourceMappingURL)=([^\n'"]+)/)
      ? '\n//# sourceURL=' + load.address : '')).call(global, global);
    }
    catch(e) {
      if (e.name == 'SyntaxError')
        e.message = 'Evaluating ' + load.address + '\n\t' + e.message;
      throw e;
    }
    // traceur overwrites System - write it back
    if (load.name == '@traceur') {
      global.traceurSystem = global.System;
      global.System = curSystem;
    }
  }
})(typeof window == 'undefined' ? global : window);
