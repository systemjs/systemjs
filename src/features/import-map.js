/*
 * Import map support for SystemJS
 *
 * Browser:
 *   <script type="systemjs-importmap">{}</script>
 *   OR
 *   <script type="systemjs-importmap" src=package.json></script>
 *
 * Node:
 *   Place "systemjs-importmap.json" in project root folder
 *
 * Only supports loading the first import map
 */

import { fetch } from '../utils/fetch.js';
import { DEFAULT_BASEURL, isBrowser, isNode, parseImportMap, resolveImportMap } from '../common.js';
import { systemJSPrototype } from '../system-core.js';
import { fileExists, URL } from './node-common.js';


function locateImportMapBrowser() {
  if (typeof document !== 'undefined') {
    const scripts = Array.from(document.getElementsByTagName('script'));
    const importMapScript = scripts.find((script => script.type === 'systemjs-importmap'));

    if (importMapScript) {
      if (importMapScript.src) {
        return new URL(importMapScript.src);
      }
      return JSON.parse(importMapScript.innerHTML);
    }
  }

  return undefined;
}


function locateImportMapNode() {
  const importMapUrl = new URL('./systemjs-importmap.json', DEFAULT_BASEURL);
  if (fileExists(importMapUrl)) {
    return importMapUrl;
  }

  return undefined;
}


function locateImportMap() {
  if (isBrowser) {
    return locateImportMapBrowser();
  } else if (isNode) {
    return locateImportMapNode();
  }
}


function fetchImportMap(input) {
  if (input instanceof URL) {
    return fetch(input.href).then(res => res.json());
  } else if (typeof input === 'object' && input !== null) {
    return Promise.resolve(input);
  }

  return Promise.resolve(undefined);
}


const location = locateImportMap();
const importMapPromise = fetchImportMap(location).then(data => {
  if (data) {
    const baseUrl = location instanceof URL ? location.href : DEFAULT_BASEURL;
    return parseImportMap(data, baseUrl);
  } else {
    return { imports: {}, scopes: {} };
  }
});


systemJSPrototype.resolve = function (id, parentUrl) {
  parentUrl = parentUrl || DEFAULT_BASEURL;

  return importMapPromise.then(importMap => resolveImportMap(id, parentUrl, importMap));
};
