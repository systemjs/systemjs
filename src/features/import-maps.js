/*
 * SystemJS browser attachments for script and import map processing
 */
import { baseUrl, resolveAndComposeImportMap, hasDocument, resolveUrl, IMPORT_MAP } from '../common.js';
import { systemJSPrototype } from '../system-core.js';
import { errMsg } from '../err-msg.js';

var importMapPromise = Promise.resolve({ imports: {}, scopes: {}, depcache: {} });

// Scripts are processed immediately, on the first System.import, and on DOMReady.
// Import map scripts are processed only once (by being marked) and in order for each phase.
// This is to avoid using DOM mutation observers in core, although that would be an alternative.
var processFirst = hasDocument;
systemJSPrototype.prepareImport = function (doProcessScripts) {
  if (processFirst || doProcessScripts) {
    processScripts();
    processFirst = false;
  }
  var loader = this;
  return importMapPromise.then(function (importMap) {
    loader[IMPORT_MAP] = importMap;
  });
};
if (hasDocument) {
  processScripts();
  window.addEventListener('DOMContentLoaded', processScripts);
}

const systemInstantiate = systemJSPrototype.instantiate;
systemJSPrototype.instantiate = function (url, firstParentUrl) {
  var preloads = importMap.depcache[url];
  if (preloads) {
    for (var i = 0; i < preloads.length; i++)
      getOrCreateLoad(this, this.resolve(preloads[i], url), url);
  }
  return systemInstantiate.call(this, url, firstParentUrl);
};

function processScripts () {
  [].forEach.call(document.querySelectorAll('script'), function (script) {
    if (script.sp) // sp marker = systemjs processed
      return;
    // TODO: deprecate systemjs-module in next major now that we have auto import
    if (script.type === 'systemjs-module') {
      script.sp = true;
      if (!script.src)
        return;
      System.import(script.src.slice(0, 7) === 'import:' ? script.src.slice(7) : resolveUrl(script.src, baseUrl));
    }
    else if (script.type === 'systemjs-importmap') {
      script.sp = true;
      importMapPromise = importMapPromise.then(function (importMap) {
        if (script.src)
          return fetch(script.src).then(function (res) {
            return res.text();
          }).then(function (text) {
            return extendImportMap(importMap, text, script.src);
          });
        return extendImportMap(importMap, script.innerHTML, baseUrl);
      });
    }
  });
}

function extendImportMap (importMap, newMapText, newMapUrl) {
  try {
    var newMap = JSON.parse(newMapText);
  } catch (err) {
    throw Error(process.env.SYSTEM_PRODUCTION ? errMsg(1) : errMsg(1, "systemjs-importmap contains invalid JSON"));
  }
  return resolveAndComposeImportMap(newMap, newMapUrl, importMap);
}