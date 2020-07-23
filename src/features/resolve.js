import { BASE_URL, baseUrl, resolveImportMap, resolveIfNotPlainOrUrl, IMPORT_MAP } from '../common.js';
import { systemJSPrototype } from '../system-core.js';
import { errMsg } from '../err-msg.js';

systemJSPrototype.resolve = function (id, parentUrl) {
  parentUrl = parentUrl || !process.env.SYSTEM_BROWSER && this[BASE_URL] || baseUrl;
  return resolveImportMap(this[IMPORT_MAP], resolveIfNotPlainOrUrl(id, parentUrl) || id, parentUrl) || throwUnresolved(id, parentUrl);
};

function throwUnresolved (id, parentUrl) {
  throw Error(errMsg(8, process.env.SYSTEM_PRODUCTION ? [id, parentUrl].join(', ') : "Unable to resolve bare specifier '" + id + (parentUrl ? "' from " + parentUrl : "'")));
}
