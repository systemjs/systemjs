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
  var im_scripts = document.querySelectorAll('script[type="systemjs-importmap"][src]');
  for (var i = 0; i < im_scripts.length; i++) {
    im_scripts[i]._j = fetch(im_scripts[i].src).then(function (resp) {
      return resp.json();
    });
  };
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
    var im_scripts = document.querySelectorAll('script[type="systemjs-importmap"][src]');
    for (var i = 0; i < im_scripts.length; i++) {
      importMapPromise = importMapPromise.then(function (map) {
        return (im_scripts[i]._j || im_scripts[i].src && fetch(im_scripts[i].src).then(function (resp) {return resp.json()}) || Promise.resolve(JSON.parse(im_scripts[i].innerHTML)))
        .then(function (json) {
          return mergeImportMap(map, parseImportMap(json, im_scripts[i].src || baseUrl));
        });
      });
    };
  }

  return importMapPromise
  .then(function (importMap) {
    return resolveImportMap(id, parentUrl, importMap);
  });
};
