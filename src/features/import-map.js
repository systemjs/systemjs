/*
 * Import map support for SystemJS
 * 
 * <script type="systemjs-importmap">{}</script>
 * OR
 * <script type="systemjs-importmap" src=package.json></script>
 * 
 * Only supports loading the first import map
 */
import { baseUrl as pageBaseUrl, parseImportMap, resolveImportMap } from '../common.js';
import { systemJSPrototype } from '../system-core.js';

var acquiringImportMaps = true, importMapPromise;

function retrieveImportMaps() {
  if (typeof document !== 'undefined') {
    const scripts = document.getElementsByTagName('script');
    let pendingMaps = []

    for (let i = 0; i < scripts.length; i++) {
      const script = scripts[i];
      if (script.type !== 'systemjs-importmap')
        continue;

      if (!script.src) {
        pendingMaps.push(parseImportMap(JSON.parse(script.innerHTML), pageBaseUrl));
      }
      else {
        pendingMaps.push(
          fetch(script.src)
          .then(function (res) {
            return res.json();
          })
          .then(function (data) {
            return parseImportMap(data, script.src);
          })
        );
      }
    }

    const initialImportMap = { imports: {}, scopes: {} };

    importMapPromise = Promise.all(pendingMaps).then(function(importMaps) {
      return importMaps.reduce(function(finalMap, importMap) {
        return mergeImportMap(finalMap, importMap);
      }, initialImportMap);
    });
  }
}

function mergeImportMap(originalMap, newMap) {
  for (let i in newMap.imports) {
    originalMap.imports[i] = newMap.imports[i];
  }

  for (let i in newMap.scopes) {
    originalMap.scopes[i] = newMap.scopes[i];
  }

  originalMap.baseUrl = newMap.baseUrl;

  return originalMap;
}

systemJSPrototype.resolve = function (id, parentUrl) {
  parentUrl = parentUrl || pageBaseUrl;

  if (acquiringImportMaps) {
    acquiringImportMaps = false;
    retrieveImportMaps();
  }

  return importMapPromise
    .then(function (importMap) {
      return resolveImportMap(id, parentUrl, importMap);
    });
};