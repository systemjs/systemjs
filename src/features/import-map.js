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
import { BASE_URL, baseUrl, resolveAndComposeImportMap, resolveImportMap, resolveIfNotPlainOrUrl, hasDocument, hasSymbol } from '../common.js';
import { systemJSPrototype } from '../system-core.js';
import { errMsg } from '../err-msg.js';

var IMPORT_MAP = hasSymbol ? Symbol() : '#';
var IMPORT_MAP_PROMISE = hasSymbol ? Symbol() : '$';

iterateDocumentImportMaps(function (script) {
  script._t = fetch(script.src).then(function (res) {
    return res.text();
  });
}, '[src]');

systemJSPrototype.prepareImport = function () {
  var loader = this;
  if (!loader[IMPORT_MAP_PROMISE]) {
    loader[IMPORT_MAP] = { imports: {}, scopes: {} };
    loader[IMPORT_MAP_PROMISE] = Promise.resolve();
    iterateDocumentImportMaps(function (script) {
      loader[IMPORT_MAP_PROMISE] = loader[IMPORT_MAP_PROMISE].then(function () {
        return (script._t || script.src && fetch(script.src).then(function (res) { return res.text(); }) || Promise.resolve(script.innerHTML))
        .then(function (text) {
          try {
            return JSON.parse(text);
          } catch (err) {
            throw Error(process.env.SYSTEM_PRODUCTION ? errMsg(1) : errMsg(1, "systemjs-importmap contains invalid JSON"));
          }
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
  parentUrl = parentUrl || !process.env.SYSTEM_BROWSER && this[BASE_URL] || baseUrl;
  return resolveImportMap(this[IMPORT_MAP], resolveIfNotPlainOrUrl(id, parentUrl) || id, parentUrl) || throwUnresolved(id, parentUrl);
};

function throwUnresolved (id, parentUrl) {
  throw Error(errMsg(2, process.env.SYSTEM_PRODUCTION ? [id, parentUrl].join(', ') : "Unable to resolve bare specifier '" + id + (parentUrl ? "' from " + parentUrl : "'")));
}

function iterateDocumentImportMaps(cb, extraSelector) {
  if (hasDocument)
    [].forEach.call(document.querySelectorAll('script[type="systemjs-importmap"]' + extraSelector), cb);
}
