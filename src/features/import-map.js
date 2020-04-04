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
import { errMsg } from '../err-msg.js';
import { systemJSPrototype } from '../system-core.js';

let importMap = { imports: {}, scopes: {} }, importMapPromise;

if (hasDocument) {
  iterateImportMaps(function (script) {
    script._j = fetch(script.src).then(function (res) {
      return res.text();
    }).then(parseJson);
  }, '[src]');
}

systemJSPrototype.prepareImport = function () {
  if (!importMapPromise) {
    importMapPromise = Promise.resolve();
    if (hasDocument)
      iterateImportMaps(function (script) {
        importMapPromise = importMapPromise.then(function () {
          return (script._j || (script.src ? fetch(script.src).then(function (resp) { return resp.text(); }) : Promise.resolve(script.innerHTML)).then(parseJson))
          .then(function (json) {
            importMap = resolveAndComposeImportMap(json, script.src || baseUrl, importMap);
          });
        });
      });
  }
  return importMapPromise;
};

systemJSPrototype.resolve = function (id, parentUrl) {
  parentUrl = parentUrl || baseUrl;
  return resolveImportMap(importMap, resolveIfNotPlainOrUrl(id, parentUrl) || id, parentUrl) || throwUnresolved(id, parentUrl);
};

function throwUnresolved (id, parentUrl) {
  throw Error(errMsg(2, DEV ? "Unable to resolve specifier '" + id + (parentUrl ? "' from " + parentUrl : "'") : [id, parentUrl].join(', ')));
}

function parseJson(text) {
  try {
    return JSON.parse(text);
  } catch (err) {
    if (DEV)
      throw Error(errMsg(1, "systemjs-importmap contains invalid JSON"));
    else
      throw Error(errMsg(1));
  }
}

function iterateImportMaps(cb, extraSelector) {
  [].forEach.call(document.querySelectorAll('script[type="systemjs-importmap"]' + (extraSelector || '')), cb);
}
