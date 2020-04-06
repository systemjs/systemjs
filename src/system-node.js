import process from 'process';
import { sep } from 'path';
import { pathToFileURL } from 'url';
import './features/import-map.js';
import './features/registry.js';
import './extras/global.js';
import './extras/module-types.js';
import './features/node-fetch.js';
import { setBaseUrl } from './common.js';

if (!('DEV' in process.env))
  process.env.SYSTEM_DEV = '1';
if (!('TRACING') in process.env)
  process.env.SYSTEM_TRACING = '1';

export const System = global.System;
export { setBaseUrl } from './common.js';
export { applyImportMap } from './features/import-map.js';
export { clearFetchCache } from './features/node-fetch.js';

// Default base url for NodeJS
setBaseUrl(pathToFileURL(process.cwd() + sep).href);