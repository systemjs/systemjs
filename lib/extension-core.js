/*
 * SystemJS Core
 * Code should be vaguely readable
 * 
 */
var originalSystem = $__global.System.originalSystem;
function core(loader) {
  /*
    __useDefault
    
    When a module object looks like:
    newModule(
      __useDefault: true,
      default: 'some-module'
    })

    Then importing that module provides the 'some-module'
    result directly instead of the full module.

    Useful for eg module.exports = function() {}
  */
  var loaderImport = loader['import'];
  loader['import'] = function(name, options) {
    return loaderImport.call(this, name, options).then(function(module) {
      return module.__useDefault ? module['default'] : module;
    });
  }

  // support the empty module, as a concept
  loader.set('@empty', loader.newModule({}));

  // include the node require since we're overriding it
  if (typeof require != 'undefined')
    loader._nodeRequire = require;

  /*
    Config
    Extends config merging one deep only

    loader.config({
      some: 'random',
      config: 'here',
      deep: {
        config: { too: 'too' }
      }
    });

    <=>

    loader.some = 'random';
    loader.config = 'here'
    loader.deep = loader.deep || {};
    loader.deep.config = { too: 'too' };
  */
  loader.config = function(cfg) {
    for (var c in cfg) {
      var v = cfg[c];
      if (typeof v == 'object' && !(v instanceof Array)) {
        this[c] = this[c] || {};
        for (var p in v)
          this[c][p] = v[p];
      }
      else
        this[c] = v;
    }
  }

  // override locate to allow baseURL to be document-relative
  var baseURI;
  if (typeof window == 'undefined' &&
      typeof WorkerGlobalScope == 'undefined' && typeof process != 'undefined') {
    baseURI = 'file:' + process.cwd() + '/';
    if (isWindows)
      baseURI = baseURI.replace(/\\/g, '/');
  }
  // Inside of a Web Worker
  else if (typeof window == 'undefined') {
    baseURI = location.href;
  }
  else {
    baseURI = document.baseURI;
    if (!baseURI) {
      var bases = document.getElementsByTagName('base');
      baseURI = bases[0] && bases[0].href || window.location.href;
    }
  }

  var loaderLocate = loader.locate;
  var normalizedBaseURL;
  loader.locate = function(load) {
    if (this.baseURL != normalizedBaseURL) {
      normalizedBaseURL = toAbsoluteURL(baseURI, this.baseURL);

      if (normalizedBaseURL.substr(normalizedBaseURL.length - 1, 1) != '/')
        normalizedBaseURL += '/';
      this.baseURL = normalizedBaseURL;
    }

    return Promise.resolve(loaderLocate.call(this, load));
  }

  function applyExtensions(extensions, loader) {
    loader._extensions = [];
    for(var i = 0, len = extensions.length; i < len; i++) {
      extensions[i](loader);
    }
  }

  loader._extensions = loader._extensions || [];
  loader._extensions.push(core);

  loader.clone = function() {
    var originalLoader = this;
    var loader = new LoaderPolyfill(originalSystem);
    loader.baseURL = originalLoader.baseURL;
    loader.paths = { '*': '*.js' };
    applyExtensions(originalLoader._extensions, loader);
    return loader;
  };
}
