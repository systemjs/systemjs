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
import { baseUrl, resolveAndComposeImportMap, resolveImportMap, resolveIfNotPlainOrUrl, hasDocument } from '../common.js';
import { hasSymbol, systemJSPrototype } from '../system-core.js';

const IMPORT_MAP = hasSymbol ? Symbol() : '#';
const IMPORT_MAP_PROMISE = hasSymbol ? Symbol() : '$';

iterateDocumentImportMaps(function (script) {
  script._t = fetch(script.src).then(function (res) {
    return res.text();
  });
}, '[src]');

systemJSPrototype.prepareImport = function () {
  const loader = this;
  if (!loader[IMPORT_MAP_PROMISE]) {
    loader[IMPORT_MAP] = { imports: {}, scopes: {} };
    loader[IMPORT_MAP_PROMISE] = Promise.resolve();
    iterateDocumentImportMaps(function (script) {
      loader[IMPORT_MAP_PROMISE] = loader[IMPORT_MAP_PROMISE].then(function () {
        return (script._t || script.src && fetch(script.src).then(function (res) { return res.text(); }) || Promise.resolve(script.innerHTML))
        .then(function (text) {
          return JSON.parse(text);
        })
        .then(function (newMap) {
          loader[IMPORT_MAP] = resolveAndComposeImportMap(newMap, script.src || baseUrl, loader[IMPORT_MAP]);
        });
      });
    }, '');
  }
  return loader[IMPORT_MAP_PROMISE];
};

systemJSPrototype.resolve = function (id, parentUrl) {
  parentUrl = parentUrl || baseUrl;
  return resolveImportMap(this[IMPORT_MAP], resolveIfNotPlainOrUrl(id, parentUrl) || id, parentUrl) || throwUnresolved(id, parentUrl);
};

function throwUnresolved (id, parentUrl) {
  throw Error("Unable to resolve specifier '" + id + (parentUrl ? "' from " + parentUrl : "'"));
}

function iterateDocumentImportMaps(cb, extraSelector) {
  if (hasDocument)
    [].forEach.call(document.querySelectorAll('script[type="systemjs-importmap"]' + extraSelector), cb);
}

export function applyImportMap(loader, newMap) {
  loader[IMPORT_MAP] = resolveAndComposeImportMap(newMap, baseUrl, loader[IMPORT_MAP] || { imports: {}, scopes: {} });
}
