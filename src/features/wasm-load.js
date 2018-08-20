/*
 * Loads WASM based on file extension detection
 * Assumes successive instantiate will handle other files
 */
import { systemJSPrototype } from '../system-core';
const instantiate = systemJSPrototype.instantiate;
systemJSPrototype.instantiate = function (url) {
  if (url.slice(-5) !== '.wasm')
    return instantiate.call(this, url);
  
  return fetch(url)
  .then(function (res) {
    if (!res.ok)
      throw new Error('Fetch error: ' + res.status + ' ' + res.statusText);
    return WebAssembly.compileStreaming(res);
  })
  .then(function (module) {
    const deps = [];
    const setters = [];
    const importObj = {};

    // we can only set imports if supported (eg early Safari doesnt support)
    if (WebAssembly.Module.imports)
      WebAssembly.Module.imports(module).forEach(function (impt) {
        const key = impt.module;
        setters.push(function (m) {
          importObj[key] = m;
        });
        if (deps.indexOf(key) === -1)
          deps.push(key);
      });

    return [deps, function (_export) {
      return {
        setters: setters,
        execute: function () {
          _export(new WebAssembly.Instance(module, importObj).exports);
        }
      };
    }];
  });
};