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
      const moduleScripts = doc.querySelectorAll('script');

      return Promise.all(Array.prototype.slice.call(moduleScripts).map(function (htmlScript) {
        if (htmlScript.type !== 'module') {
          loadError("All JS modules within an HTML module must have type 'module'");
        } else if (htmlScript.src) {
          loadError("All JS modules within an HTML module must be inline");
        } else {
          const script = document.createElement('script');
          script.text = htmlScript.text;
          script.type = 'text/javascript';
          document.head.appendChild(script);
          document.head.removeChild(script);
          return loader.getRegister();
        }
      })).then(function (declarations) {
        const depNames = declarations.reduce(function (result, declaration) {
          return result.concat(declaration[0]);
        }, []);

        return [depNames, function(_export, _context) {
          _context.meta.document = doc;

          let defaultAlreadyExported = false;

          const registers = declarations.map(function (declaration) {
            return declaration[1](protectedExport, _context);
          });

          return {
            setters: registers.reduce(function (allSetters, register) {
              return allSetters.concat(register.setters);
            }, []),
            execute: function() {
              registers.forEach(function (register) {
                register.execute();
              });

              if (!defaultAlreadyExported) {
                _export('default', doc);
              }
            }
          };

          function protectedExport(name, value) {
            if (name === 'default') {
              if (defaultAlreadyExported) {
                throw Error("Only one HTML module inline script can export default");
              } else {
                defaultAlreadyExported = true;
              }
            }
            _export(name, value);
          }
        }];
      });
    });
  }
};