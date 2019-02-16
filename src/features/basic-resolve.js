import { systemJSPrototype } from '../system-core.js';
import { resolveIfNotPlainOrUrl } from '../common.js';

systemJSPrototype.resolve = function resolve(id, parentUrl) {
  const resolved = resolveIfNotPlainOrUrl(id, parentUrl || this.baseUrl);
  if (!resolved) {
    if (id.indexOf(':') !== -1)
      return id;
    throw new Error('Cannot resolve "' + id + (parentUrl ? '" from ' + parentUrl : '"'));
  }
  return resolved;
};
