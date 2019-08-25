/*
 * Import map support for SystemJS
 * 
 * <script type="systemjs-importmap">{}</script>
 * OR
 * <script type="systemjs-importmap" src=package.json></script>
 * 
 * Only those import maps available at the time of SystemJS initialization will be loaded
 * and they will be loaded in DOM order.
 * 
 * There is no support for dynamic import maps injection currently.
 */
import { baseUrl, parseImportMap, resolveImportMap } from '../common.js';
import { systemJSPrototype } from '../system-core.js';

const importMap = { imports: {}, scopes: {} };
let acquiringImportMaps = typeof document !== 'undefined';

if (acquiringImportMaps) {
  Array.prototype.forEach.call(document.querySelectorAll('script[type="systemjs-importmap"][src]'), function (script) {
    script._j = fetch(script.src).then(function (res) {
      return res.json();
    });
  });
}

export function mergeImportMap(originalMap, newMap) {
  for (let i in newMap.imports) {
    originalMap.imports[i] = newMap.imports[i];
  }
  for (let i in newMap.scopes) {
    originalMap.scopes[i] = newMap.scopes[i];
  }
}

systemJSPrototype.prepareImport = function () {
  if (acquiringImportMaps) {
    acquiringImportMaps = false;
    let importMapPromise = Promise.resolve();
    Array.prototype.forEach.call(document.querySelectorAll('script[type="systemjs-importmap"]'), function (script) {
      importMapPromise = importMapPromise.then(function () {
        return (script._j || script.src && fetch(script.src).then(function (resp) { return resp.json(); }) || Promise.resolve(JSON.parse(script.innerHTML)))
        .then(function (json) {
          mergeImportMap(importMap, parseImportMap(json, script.src || baseUrl));
        });
      });
    });
    return importMapPromise;
  }
};

systemJSPrototype.resolve = function (id, parentUrl) {
  parentUrl = parentUrl || baseUrl;
  return resolveImportMap(id, parentUrl, importMap);
};