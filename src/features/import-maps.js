/*
 * SystemJS browser attachments for script and import map processing
 */
import { baseUrl, resolveAndComposeImportMap, hasDocument, resolveUrl } from '../common.js';
import { systemJSPrototype } from '../system-core.js';
import { errMsg } from '../err-msg.js';

var importMapPromise = Promise.resolve();
export var importMap = { imports: {}, scopes: {}, depcache: {}, integrity: {} };

// Scripts are processed immediately, on the first System.import, and on DOMReady.
// Import map scripts are processed only once (by being marked) and in order for each phase.
// This is to avoid using DOM mutation observers in core, although that would be an alternative.
var processFirst = hasDocument;
systemJSPrototype.prepareImport = function (doProcessScripts) {
  if (processFirst || doProcessScripts) {
    processScripts();
    processFirst = false;
  }
  return importMapPromise;
};
if (hasDocument) {
  processScripts();
  window.addEventListener('DOMContentLoaded', processScripts);
}

function processScripts () {
  [].forEach.call(document.querySelectorAll('script'), function (script) {
    if (script.sp) // sp marker = systemjs processed
      return;
    // TODO: deprecate systemjs-module in next major now that we have auto import
    if (script.type === 'systemjs-module') {
      script.sp = true;
      if (!script.src)
        return;
      System.import(script.src.slice(0, 7) === 'import:' ? script.src.slice(7) : resolveUrl(script.src, baseUrl)).catch(function (e) {
        // if there is a script load error, dispatch an "error" event
        // on the script tag.
        if (e.message.indexOf('https://git.io/JvFET#3') > -1) {
          var event = document.createEvent('Event');
          event.initEvent('error', false, false);
          script.dispatchEvent(event);
        }
        return Promise.reject(e);
      });
    }
    else if (script.type === 'systemjs-importmap') {
      script.sp = true;
      // The passThrough property is for letting the module types fetch implementation know that this is not a SystemJS module.
      var fetchPromise = script.src ? (System.fetch || fetch)(script.src, { integrity: script.integrity, passThrough: true }).then(function (res) {
        if (!res.ok)
          throw Error(process.env.SYSTEM_PRODUCTION ? res.status : 'Invalid status code: ' + res.status);
        return res.text();
      }).catch(function (err) {
        err.message = errMsg('W4', process.env.SYSTEM_PRODUCTION ? script.src : 'Error fetching systemjs-import map ' + script.src) + '\n' + err.message;
        console.warn(err);
        if (typeof script.onerror === 'function') {
            script.onerror();
        }
        return '{}';
      }) : script.innerHTML;
      importMapPromise = importMapPromise.then(function () {
        return fetchPromise;
      }).then(function (text) {
        extendImportMap(importMap, text, script.src || baseUrl);
      });
    }
  });
}

function extendImportMap (importMap, newMapText, newMapUrl) {
  var newMap = {};
  try {
    newMap = JSON.parse(newMapText);
  } catch (err) {
    console.warn(Error((process.env.SYSTEM_PRODUCTION ? errMsg('W5') : errMsg('W5', "systemjs-importmap contains invalid JSON") + '\n\n' + newMapText + '\n' )));
  }
  resolveAndComposeImportMap(newMap, newMapUrl, importMap);
}
