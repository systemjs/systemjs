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

let importMap, importMapPromise;
if (typeof document !== 'undefined') {
  const scripts = document.getElementsByTagName('script');
  for (let i = 0; i < scripts.length; i++) {
    const script = scripts[i];
    if (script.type !== 'systemjs-importmap')
      continue;

    if (!script.src) {
      importMap = parseImportMap(JSON.parse(script.innerHTML), pageBaseUrl);
    }
    else {
      importMapPromise = fetch(script.src)
      .then(function (res) {
        return res.json();
      })
      .then(function (json) {
        importMap = parseImportMap(json, script.src);
      });
    }
    break;
  }
}

importMap = importMap || { imports: {}, scopes: {} };

systemJSPrototype.resolve = function (id, parentUrl) {
  parentUrl = parentUrl || pageBaseUrl;

  if (importMapPromise)
    return importMapPromise
    .then(function () {
      return resolveImportMap(id, parentUrl, importMap);
    });

  return resolveImportMap(id, parentUrl, importMap);
};