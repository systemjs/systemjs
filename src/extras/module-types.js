/*
 * Loads JSON, CSS, Wasm module types based on file extensions
 * Supports application/javascript falling back to JS eval
 */
import { systemJSPrototype } from '../system-core';
const instantiate = systemJSPrototype.instantiate;
systemJSPrototype.instantiate = function (url, parent) {
  const loader = this;
  const ext = url.slice(url.lastIndexOf('.'));
  switch (ext) {
    case '.css':
      return loadDynamicModule(function (_export, source) {
        // Relies on a Constructable Stylesheet polyfill
        const stylesheet = new CSSStyleSheet();
        stylesheet.replaceSync(source);
        _export('default', stylesheet);
      });
    case '.html':
      return getSourceRes().then(function (res) {
        return maybeJSFallback(res) || htmlModule(res);
      });
    case '.json':
      return loadDynamicModule(function (_export, source) {
        _export('default', JSON.parse(source));
      });
    case '.wasm':
      return getSourceRes().then(function (res) {
        return maybeJSFallback(res) ||
            (WebAssembly.compileStreaming ? WebAssembly.compileStreaming(res) : res.arrayBuffer().then(WebAssembly.compile));
      })
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
  return instantiate.apply(this, arguments);

  function getSourceRes () {
    return fetch(url).then(function (res) {
      if (!res.ok)
        loadError(res.status + ' ' + res.statusText);
      return res;
    });
  }
  function maybeJSFallback (res) {
    const contentType = res.headers.get('content-type');
    // if the resource is sent as application/javascript, support eval-based execution
    if (contentType && contentType.match(/^application\/javascript(;|$)/)) {
      return res.text().then(function (source) {
        (0, eval)(source);
        return loader.getRegister();
      });
    }
  }
  function loadDynamicModule (createExec) {
    return getSourceRes().then(function (res) {
      return maybeJSFallback(res) || res.text().then(function (source) {
        return [[], function (_export) {
          return { execute: createExec(_export, source) };
        }];
      });
    });
  }
  function loadError (msg) {
    throw Error(msg + ', loading ' + url + (parent ? ' from ' + parent : ''));
  }
  function htmlModule(res) {
    return res.text().then(function (source) {
      const doc = new DOMParser().parseFromString(source, 'text/html');

      return Promise.all(Array.prototype.slice.call(doc.querySelectorAll('script')).map(function (htmlScript) {
        if (htmlScript.type !== 'systemjs-module') {
          loadError("All JS modules within an HTML module must have type 'systemjs-module'");
        } else if (htmlScript.src) {
          loadError("All JS modules within an HTML module must be inline");
        } else {
          const script = document.createElement('script');
          script.text = htmlScript.text;
          document.head.appendChild(script);
          document.head.removeChild(script);
          return loader.getRegister();
        }
      })).then(function (registers) {
        const depNames = registers.reduce(function (result, register) {
          return result.concat(register[0]);
        }, []);

        return [depNames, function(_export, _context) {
          _context.meta.document = doc;

          _export('default', doc);

          const declares = registers.map(function (register) {
            return register[1](_export, _context);
          });

          return {
            setters: declares.reduce(function (allSetters, declare) {
              return allSetters.concat(declare.setters);
            }, []),
            execute: function () {
              declares.forEach(function (declare) {
                declare.execute();
              });
            }
          };
        }];
      });
    });
  }
};