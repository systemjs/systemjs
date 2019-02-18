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

import { global, URL, isBrowser, isNode, isURL, parseImportMap, resolveImportMap } from '../common.js';
import { systemJSPrototype } from '../system-core.js';
import { fetch } from '../utils/fetch.js';
import { fileExists } from './node-common.js';


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


function locateImportMapNode(baseUrl, importMapUrl) {
  if (isURL(importMapUrl)) {
    importMapUrl = new URL(importMapUrl);
  } else {
    importMapUrl = new URL('./systemjs-importmap.json', baseUrl);
  }

  if (fileExists(importMapUrl)) {
    return importMapUrl;
  }

  return undefined;
}


function locateImportMap(baseUrl, importMapUrl) {
  if (isBrowser) {
    return locateImportMapBrowser();
  } else if (isNode) {
    return locateImportMapNode(baseUrl, importMapUrl);
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


function createImportMap(loader, importMapUrl) {
  const location = locateImportMap(loader.baseUrl, importMapUrl);

  return fetchImportMap(location).then(data => {
    if (data) {
      const baseUrl = location instanceof URL ? location.href : loader.baseUrl;
      return parseImportMap(data, baseUrl);
    } else {
      return { imports: {}, scopes: {} };
    }
  });
}


const importMapRegistry = new WeakMap();

function setImportMap(loader, importMap) {
  importMapRegistry.set(loader, importMap);
}

function getImportMap(loader) {
  return importMapRegistry.get(loader);
}


const constructor = systemJSPrototype.constructor;
function SystemJS({ baseUrl, importMapUrl } = {}) {
  constructor.call(this, { baseUrl });

  this.registerRegistry = Object.create(null);
  const importMap = createImportMap(this, importMapUrl);
  setImportMap(this, importMap);
}

SystemJS.prototype = Object.create(systemJSPrototype);
SystemJS.prototype.constructor = SystemJS;

/**
 * @async
 *
 * Resolves a module import specifier.
 *
 * @param {string} id - Module import specifier
 * @param {string} [parentUrl] - The URL of the importing module.
 *
 * @return {Promise<string>} The resolved URL
 */
SystemJS.prototype.resolve = function resolve(id, parentUrl) {
  parentUrl = parentUrl || this.baseUrl;
  return getImportMap(this).then(importMap => resolveImportMap(id, parentUrl, importMap));
};

global.System = new SystemJS();
