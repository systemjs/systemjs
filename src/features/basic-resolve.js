import { systemJSPrototype } from '../system-core.js';
import { resolveIfNotPlainOrUrl, baseUrl } from '../common.js';
systemJSPrototype.resolve = function (id, parentUrl) {
  const resolved = resolveIfNotPlainOrUrl(id, parentUrl || baseUrl);
  if (!resolved) {
    if (id.indexOf(':') !== -1)
      return id;
    throw new Error('Cannot resolve "' + id + (parentUrl ? '" in ' + parentUrl : '"'));
  }
  return resolved;
};