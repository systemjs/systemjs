import './features/resolve.js';
import './features/registry.js';
import './features/fetch-load.js';
import './features/node-fetch.js';
import './extras/global.js';

import { REGISTRY, systemJSPrototype } from './system-core.js';
import { BASE_URL, baseUrl, resolveAndComposeImportMap, IMPORT_MAP } from './common.js';

export const System = global.System;

const IMPORT_MAP_PROMISE = Symbol();

systemJSPrototype.prepareImport = function () {
  return this[IMPORT_MAP_PROMISE];
};

const originalResolve = systemJSPrototype.resolve;
systemJSPrototype.resolve = function () {
  if (!this[IMPORT_MAP]) {
    // Allow for basic URL resolution before applyImportMap is called
    this[IMPORT_MAP] = { imports: {}, scopes: {} };
  }
  return originalResolve.apply(this, arguments);
};

export function applyImportMap(loader, newMap, mapBase) {
  ensureValidSystemLoader(loader);
  loader[IMPORT_MAP] = loader[IMPORT_MAP] || { imports: {}, scopes: {} };
  resolveAndComposeImportMap(newMap, mapBase || baseUrl, loader[IMPORT_MAP]);
  loader[IMPORT_MAP_PROMISE] = Promise.resolve();
}

export function setBaseUrl(loader, url) {
  ensureValidSystemLoader(loader);
  loader[BASE_URL] = new URL(url).href;
}

function ensureValidSystemLoader (loader) {
  if (!loader[REGISTRY])
    throw new Error('A valid SystemJS instance must be provided');
}
