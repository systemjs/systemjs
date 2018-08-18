import { systemJSPrototype, REGISTRY } from '../system-core.js';

systemJSPrototype.get = function (id) {
  const load = this[REGISTRY][id];
  if (load && load.e === null && !load.pE)
    return load.ns;
};

// Delete function provided for hot-reloading use cases
systemJSPrototype.delete = function (id) {
  return this.get(id) ? delete this[REGISTRY][id] : false;
};