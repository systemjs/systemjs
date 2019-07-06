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

const baseMap = Object.create(null);
baseMap.imports = Object.create(null);
baseMap.scopes = Object.create(null);
let importMapPromise = Promise.resolve(baseMap);
let acquiringImportMaps = typeof document !== 'undefined';

if (acquiringImportMaps) {
  Array.prototype.forEach.call(document.querySelectorAll('script[type="systemjs-importmap"][src]'), function (script) {
    script._j = fetch(script.src).then(function (resp) {
      return resp.json();
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
  return originalMap;
}

systemJSPrototype.resolve = function (id, parentUrl) {
  parentUrl = parentUrl || baseUrl;

  if (acquiringImportMaps) {
    acquiringImportMaps = false;
    Array.prototype.forEach.call(document.querySelectorAll('script[type="systemjs-importmap"]'), function (script) {
      importMapPromise = importMapPromise.then(function (map) {
        return (script._j || script.src && fetch(script.src).then(function (resp) {return resp.json()}) || Promise.resolve(JSON.parse(script.innerHTML)))
        .then(function (json) {
          const scriptMap = parseImportMap(json, script.src || baseUrl);
          script.importmap = scriptMap;
          return mergeImportMap(map, scriptMap);
        });
      });
    });
  }

  return importMapPromise
  .then(function (importMap) {
    return resolveImportMap(id, parentUrl, importMap);
  });
};