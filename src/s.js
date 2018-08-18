import { systemJSPrototype } from './system-core.js';
import { baseUrl } from './baseurl.js';
import { resolveIfNotPlainOrUrl } from './common.js';
import './features/script-load.js';

systemJSPrototype.resolve = function (id, parent) {
  return resolveIfNotPlainOrUrl(id, parent || baseUrl);
};