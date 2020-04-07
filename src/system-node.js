import './system-node-baseurl.js';

import { IMPORT_MAP } from './features/import-map.js';
import './features/registry.js';
import './extras/global.js';
import './extras/module-types.js';
import './features/node-fetch.js';
import { BASE_URL } from './common.js';

export const System = global.System;

export function applyImportMap(loader, newMap, mapBase) {
  ensureValidSystemLoader(loader);
  loader[IMPORT_MAP] = resolveAndComposeImportMap(newMap, mapBase || baseUrl, loader[IMPORT_MAP] || { imports: {}, scopes: {} });
}

export { clearFetchCache } from './features/node-fetch.js';

export function setBaseUrl(loader, url) {
  ensureValidSystemLoader(loader);
  loader[BASE_URL] = new URL(url).href;
}

function ensureValidSystemLoader (loader) {
  if (!loader[IMPORT_MAP])
    throw new Error('A valid SystemJS instance must be provided');
}
