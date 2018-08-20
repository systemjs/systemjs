import { systemJSPrototype, REGISTRY } from '../system-core.js';

systemJSPrototype.get = function (id) {
  const load = this[REGISTRY][id];
  if (load && load.e === null && !load.E)
    return load.n;
};

// Delete function provided for hot-reloading use cases
systemJSPrototype.delete = function (id) {
  const load = this.get(id);
  if (!load)
    return false;
  // remove from importerSetters
  // (release for gc)
  if (load.d)
    load.d.forEach(function (depLoad) {
      const importerIndex = depLoad.i.indexOf(load);
      if (importerIndex !== -1)
        depLoad.i.splice(importerIndex, 1);
    });
  return delete this[REGISTRY][id];
};