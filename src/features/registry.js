import { systemJSPrototype, REGISTRY } from '../system-core.js';

const toStringTag = typeof Symbol !== 'undefined' && Symbol.toStringTag;

systemJSPrototype.get = function (id) {
  const load = this[REGISTRY][id];
  if (load && load.e === null && !load.E) {
    if (load.eE)
      return null;
    return load.n;
  }
};

systemJSPrototype.set = function (id, module) {
  let ns;
  if (toStringTag && module[toStringTag] === 'Module') {
    ns = module;
  }
  else {
    ns = Object.assign(Object.create(null), module);
    if (toStringTag)
      Object.defineProperty(ns, toStringTag, { value: 'Module' });
  }
  const done = Promise.resolve(ns);
  this.delete(id);
  this[REGISTRY][id] = {
    id: id,
    i: [],
    n: ns,
    I: done,
    L: done,
    h: false,
    d: [],
    e: null,
    eE: undefined,
    E: undefined,
    C: done
  };
};

systemJSPrototype.has = function (id) {
  const load = this[REGISTRY][id];
  return load && load.e === null && !load.E;
};

// Delete function provided for hot-reloading use cases
systemJSPrototype.delete = function (id) {
  const load = this.get(id);
  if (load === undefined)
    return false;
  // remove from importerSetters
  // (release for gc)
  if (load && load.d)
    load.d.forEach(function (depLoad) {
      const importerIndex = depLoad.i.indexOf(load);
      if (importerIndex !== -1)
        depLoad.i.splice(importerIndex, 1);
    });
  return delete this[REGISTRY][id];
};