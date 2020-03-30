import './features/import-map.js';
import './features/registry.js';
import './extras/global.js';
import './extras/module-types.js';
import './features/node-fetch.js';

export const System = global.System;
export { setBaseUrl } from './common.js';
export { applyImportMap } from './features/import-map.js';
