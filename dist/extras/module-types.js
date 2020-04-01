/*
 * Loads JSON, CSS, Wasm module types based on file extensions
 * Supports application/javascript falling back to JS eval
 */
(function(global) {
  const systemJSPrototype = global.System.constructor.prototype;
  const instantiate = systemJSPrototype.instantiate;

  const moduleTypesRegEx = /\.(css|html|json|wasm)$/;
  systemJSPrototype.shouldFetch = function (url) {
    const path = url.split('?')[0].split('#')[0];
    const ext = path.slice(path.lastIndexOf('.'));
    return ext.match(moduleTypesRegEx);
  }
  systemJSPrototype.fetch = function (url) {
    return fetch(url);
  };

  systemJSPrototype.instantiate = function (url, parent) {
    const loader = this;
    if (this.shouldFetch(url)) {
      return this.fetch(url)
      .then(function (res) {
        if (!res.ok)
          throw Error(res.status + ' ' + res.statusText + ', loading ' + url + (parent ? ' from ' + parent : ''));
        const contentType = res.headers.get('content-type');
        if (contentType.match(/^(text|application)\/(x-)?javascript(;|$)/)) {
          return res.text().then(function (source) {
            (0, eval)(source);
            return loader.getRegister();
          });
        }
        else if (contentType.match(/^application\/json(;|$)/)) {
          return res.text().then(function (source) {
            return [[], function (_export) {
              return {
                execute: function () {
                  _export('default', JSON.parse(source));
                }
              };
            }];
          });
        }
        else if (contentType.match(/^text\/css(;|$)/)) {
          return res.text().then(function (source) {
            return [[], function (_export) {
              return {
                execute: function () {
                  // Relies on a Constructable Stylesheet polyfill
                  const stylesheet = new CSSStyleSheet();
                  stylesheet.replaceSync(source);
                  _export('default', stylesheet);
                }
              };
            }];
          }); 
        }
        else if (contentType.match(/^application\/wasm(;|$)/)) {
          return (WebAssembly.compileStreaming ? WebAssembly.compileStreaming(res) : res.arrayBuffer().then(WebAssembly.compile))
          .then(function (module) {
            const deps = [];
            const setters = [];
            const importObj = {};
        
            // we can only set imports if supported (eg early Safari doesnt support)
            if (WebAssembly.Module.imports)
              WebAssembly.Module.imports(module).forEach(function (impt) {
                const key = impt.module;
                if (deps.indexOf(key) === -1) {
                  deps.push(key);
                  setters.push(function (m) {
                    importObj[key] = m;
                  });
                }
              });
        
            return [deps, function (_export) {
              return {
                setters: setters,
                execute: function () {
                  return WebAssembly.instantiate(module, importObj)
                  .then(function (instance) {
                    _export(instance.exports);
                  });
                }
              };
            }];
          });
        }
        else {
          throw new Error('Unknown module type "' + contentType + '"');
        }
      });
    }
    return instantiate.apply(this, arguments);
  };
})(typeof self !== 'undefined' ? self : global);
