/*
 * Import map support for SystemJS
 * 
 * <script type="systemjs-importmap">{}</script>
 * OR
 * <script type="systemjs-importmap" src=package.json></script>
 */
import { baseUrl as pageBaseUrl, parseImportMap, resolveImportMap } from '../common.js';
import { systemJSPrototype } from '../system-core.js';

var importMapPromise, fetchPromises = {};

// Start downloading the import maps as soon as possible
if (typeof document !== 'undefined') {
  const scriptsToDownload = document.querySelectorAll('script[type="systemjs-importmap"][src]');

  for (let i = 0; i < scriptsToDownload.length; i++) {
    const script = scriptsToDownload[i]
    fetchPromises[script.src] = fetch(script.src)
      .then(function (res) {
        return res.json();
      })
      .then(function (data) {
        return parseImportMap(data, script.src);
      })
  }
}

function retrieveImportMaps() {
  if (typeof document !== 'undefined') {
    // We must apply/merge the import maps in the order that they appear in the dom
    const scripts = document.querySelectorAll('script[type="systemjs-importmap"]');
    let pendingMaps = []

    for (let i = 0; i < scripts.length; i++) {
      const script = scripts[i];
      if (!script.src) {
        pendingMaps.push(parseImportMap(JSON.parse(script.innerHTML), pageBaseUrl));
      }
      else if (fetchPromises[script.src]) {
        pendingMaps.push(fetchPromises[script.src])
      } else {
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

    // free the memory for this object -- we don't need it anymore after the first System.import happens
    fetchPromises = null

    const initialImportMap = { imports: {}, scopes: {} };

    return Promise.all(pendingMaps).then(function(importMaps) {
      return importMaps.reduce(function(finalMap, importMap) {
        return mergeImportMap(finalMap, importMap);
      }, initialImportMap);
    });
  }
}

export function mergeImportMap(originalMap, newMap) {
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

  if (!importMapPromise) {
    importMapPromise = retrieveImportMaps();
  }

  return importMapPromise
    .then(function (importMap) {
      return resolveImportMap(id, parentUrl, importMap);
    });
};