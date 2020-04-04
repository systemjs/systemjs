import { systemJSPrototype } from '../system-core.js';
import { resolveIfNotPlainOrUrl, baseUrl } from '../common.js';
import { errMsg } from '../err-msg.js';

systemJSPrototype.resolve = function (id, parentUrl) {
  const resolved = resolveIfNotPlainOrUrl(id, parentUrl || baseUrl);
  if (!resolved) {
    if (id.indexOf(':') !== -1)
      return Promise.resolve(id);
    throw Error(errMsg(3, DEV ? 'Cannot resolve "' + id + (parentUrl ? '" from ' + parentUrl : '"') : [id, parentUrl].join(', ')));
  }
  return Promise.resolve(resolved);
};