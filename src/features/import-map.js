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

if (typeof document !== 'undefined') {
  const importMapScripts = document.querySelectorAll('script[type="systemjs-importmap"]');
  for (let i = 0; i < importMapScripts.length; i++) {
    const script = importMapScripts[i];
    if (!script.src) {
      importMapPromise = importMapPromise.then(function (map) {
        return mergeImportMap(map, parseImportMap(JSON.parse(script.innerHTML), baseUrl));
      });
    }
    else {
      const fetchPromise = fetch(script.src);
      importMapPromise = importMapPromise.then(function (map) {
        return fetchPromise
        .then(function (res) {
          return res.json();
        })
        .then(function (data) {
          return mergeImportMap(map, parseImportMap(data, script.src));
        });  
      });      
    }
  }
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

  return importMapPromise
  .then(function (importMap) {
    return resolveImportMap(id, parentUrl, importMap);
  });
};