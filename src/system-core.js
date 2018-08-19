/*
 * SystemJS Core
 * 
 * Provides
 * - System.import
 * - System.register support for
 *     live bindings, function hoisting through circular references,
 *     reexports, dynamic import, import.meta.url, top-level await
 * - System.getRegister to get the registration
 * - Symbol.toStringTag support in Module objects
 * - Hookable System.createContext to customize import.meta
 * - System.onload(id, err?) handler for tracing / hot-reloading
 * 
 * Core comes with no System.prototype.resolve or
 * System.prototype.instantiate implementations
 */
import { global } from './common.js';
export { systemJSPrototype, REGISTRY }

const hasSymbol = typeof Symbol !== 'undefined';
const toStringTag = hasSymbol && Symbol.toStringTag;
const REGISTRY = hasSymbol ? Symbol() : '@';

function SystemJS () {
  this[REGISTRY] = {};
}

function callResolve (loader, id, parentUrl) {
  return Promise.resolve()
  .then(function () {
    return loader.resolve(id, parentUrl);
  })
  .then(function (id) {
    if (id)
      return id;
    throw new Error('No resolution');
  })
  .catch(function (err) {
    if (err && err.message)
      err.message += '\n  Resolving ' + id + (parentUrl ? ' to ' + parentUrl : '');
    throw err;
  });
}

const systemJSPrototype = SystemJS.prototype;
systemJSPrototype.import = function (id, parent) {
  const loader = this;
  return callResolve(loader, id, parent)
  .then(function (id) {
    const load = getOrCreateLoad(loader, id);
    return load.C || topLevelLoad(loader, load);
  });
};

// Hookable createContext function -> allowing eg custom import meta
systemJSPrototype.createContext = function (parentId) {
  const loader = this;
  return {
    import: function (id) {
      return loader.import(id, parentId);
    },
    meta: {
      url: parentId
    }
  };
};

// onLoad(id, err) provided for tracing / hot-reloading
if (TRACING)
  systemJSPrototype.onload = function () {};

let lastRegister;
systemJSPrototype.register = function (deps, declare) {
  lastRegister = [deps, declare];
};

/*
 * getRegister provides the last anonymous System.register call
 */
systemJSPrototype.getRegister = function () {
  const _lastRegister = lastRegister;
  lastRegister = undefined;
  return _lastRegister;
};

function getOrCreateLoad (loader, id) {
  let load = loader[REGISTRY][id];
  if (load)
    return load;

  const importerSetters = [];
  const ns = Object.create(null);
  if (toStringTag)
    Object.defineProperty(ns, toStringTag, { value: 'Module' });
  
  const instantiatePromise = Promise.resolve()
  .then(function () {
    return loader.instantiate(id);
  })
  .then(function (registration) {
    if (!registration)
      throw new Error('No instantiation');
    let hoistedExports = false;
    function _export (name, value) {
      hoistedExports = true;
      let changed = false;
      if (typeof name !== 'object') {
        if (!(name in ns) || ns[name] !== value) {
          ns[name] = value;
          changed = true;
        }
      }
      else {
        for (let p in name) {
          let value = name[p];
          if (!(p in ns) || ns[p] !== value) {
            ns[p] = value;
            changed = true;
          }
        }
      }
      if (changed)
        for (let i = 0; i < importerSetters.length; i++)
          importerSetters[i](ns);
      return value;
    }
    const declared = registration[1](_export, registration[1].length === 2 ? loader.createContext(id) : undefined);
    load.e = declared.execute || function () {};
    return [registration[0], declared.setters, hoistedExports];
  })
  .catch(function (err) {
    if (err && err.message)
      err.message += '\n  Loading ' + load.id;
    if (TRACING) loader.onload(load.id, err);
    throw err;
  });

  const linkPromise =  instantiatePromise
  .then(function (instantiation) {
    return Promise.all(instantiation[0].map(function (dep, i) {
      const setter = instantiation[1][i];
      return callResolve(loader, dep, id)
      .then(function (depId) {
        const depLoad = getOrCreateLoad(loader, depId);
        // depLoad.I may be undefined for already-evaluated
        return Promise.resolve(depLoad.I).then(function () {
          if (setter) {
            depLoad.i.push(setter);
            // only run early setters when there are hoisted exports
            if (instantiation[2] || !depLoad.I)
              setter(depLoad.n);
          }
          return depLoad;
        });
      })
    }))
    .then(function (depLoads) {
      load.d = depLoads;
    });
  });

  // disable unhandled rejections
  instantiatePromise.catch(function () {});
  linkPromise.catch(function () {});

  // Captial letter = a promise function
  return load = loader[REGISTRY][id] = {
    id: id,
    // importerSetters, the setters functions registered to this dependency
    // we retain this to add more later
    i: importerSetters,
    // module namespace object
    n: ns,

    // instantiate
    I: instantiatePromise,
    // link
    L: linkPromise,

    // On instantiate completion we have populated:
    // dependency load records
    d: undefined,
    // execution function
    // set to NULL immediately after execution (or on any failure) to indicate execution has happened
    // in such a case, pC should be used, and pLo, pLi will be emptied
    e: undefined,

    // On execution we have populated:
    // the execution error if any
    eE: undefined,
    // in the case of TLA, the execution promise
    E: undefined,

    // On execution, pLi, pLo, e cleared

    // Promise for top-level completion
    C: undefined
  };
}

function instantiateAll (loader, load, loaded) {
  if (!loaded[load.id]) {
    loaded[load.id] = true;
    // load.L may be undefined for already-instantiated
    return Promise.resolve(load.L)
    .then(function () {
      return Promise.all(load.d.map(function (dep) {
        return instantiateAll(loader, dep, loaded);
      }));
    })
  }
}

function topLevelLoad (loader, load) {
  return load.C = instantiateAll(loader, load, {})
  .then(function () {
    return postOrderExec(loader, load, {});
  })
  .then(function () {
    return load.n;
  });
}

// the closest we can get to call(undefined)
const nullContext = Object.freeze(Object.create(null));

// returns a promise if and only if a top-level await subgraph
// throws on sync errors
function postOrderExec (loader, load, seen) {
  if (!load.e) {
    if (load.eE)
      throw load.eE;
    return load.E;
  }

  // deps execute first, unless circular
  if (!seen[load.id]) {
    seen[load.id] = true;
    
    let depLoadPromises;
    load.d.forEach(function (depLoad) {
      if (TRACING) {
        try {
          const depLoadPromise = postOrderExec(loader, depLoad, seen);
          if (depLoadPromise)
            (depLoadPromises = depLoadPromises || []).push(depPromise);
        }
        catch (err) {
          loader.onload(load.id, err);
          throw err;
        }
      }
      else {
        const depLoadPromise = postOrderExec(loader, depLoad, seen);
        if (depLoadPromise)
          (depLoadPromises = depLoadPromises || []).push(depPromise);
      }
    });
    if (depLoadPromises) {
      if (TRACING) {
        return Promise.all(depLoadPromises)
        .catch(function (err) { loader.onload(load.id, err); throw err; })
        .then(function () {
          // TLA trick:
          // second time till will jump straight to evaluation part as seen
          return postOrderExec(loader, load, seen);
        });
      }
      else {
        return Promise.all(depLoadPromises)
        .then(function () {
          return postOrderExec(loader, load, seen);
        });
      }
    }
  }

  // could be a TLA race or circular
  if (!load.e)
    return load.E;

  try {
    const execPromise = load.e.call(nullContext);
    if (execPromise) {
      if (TRACING) execPromise.catch(function (err) { loader.onload(load.id, err); throw err; });
      load.E = execPromise;
      execPromise.then(function () {
        load.C = load.n;
        if (TRACING) loader.onload(load.id, null);
      })
      .catch(function () {});
      return execPromise;
    }
    // (should be a promise, but a minify optimization to leave out Promise.resolve)
    load.C = load.n;
    if (TRACING) loader.onload(load.id, null);
  }
  catch (err) {
    if (TRACING) loader.onload(load.id, err);
    load.eE = err;
    throw err;
  }
  finally {
    load.L = load.I = undefined;
    load.e = null;
  }
}

global.System = new SystemJS();