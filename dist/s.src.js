/*
* SJS 2.0.0-dev
* Minimal SystemJS Build
*/
(function () {
  const hasSelf = typeof self !== 'undefined';

  const envGlobal = hasSelf ? self : global;

  const backslashRegEx = /\\/g;
  function resolveIfNotPlainOrUrl (relUrl, parentUrl) {
    if (relUrl.indexOf('\\') !== -1)
      relUrl = relUrl.replace(backslashRegEx, '/');
    // protocol-relative
    if (relUrl[0] === '/' && relUrl[1] === '/') {
      return parentUrl.substr(0, parentUrl.indexOf(':') + 1) + relUrl;
    }
    // relative-url
    else if (relUrl[0] === '.' && (relUrl[1] === '/' || relUrl[1] === '.' && (relUrl[2] === '/' || relUrl.length === 2 && (relUrl += '/')) ||
        relUrl.length === 1  && (relUrl += '/')) ||
        relUrl[0] === '/') {
      const parentProtocol = parentUrl.substr(0, parentUrl.indexOf(':') + 1);
      // read pathname from parent URL
      // pathname taken to be part after leading "/"
      let pathname;
      if (parentUrl[parentProtocol.length + 1] === '/') {
        // resolving to a :// so we need to read out the auth and host
        if (parentProtocol !== 'file:') {
          pathname = parentUrl.substr(parentProtocol.length + 2);
          pathname = pathname.substr(pathname.indexOf('/') + 1);
        }
        else {
          pathname = parentUrl.substr(8);
        }
      }
      else {
        // resolving to :/ so pathname is the /... part
        pathname = parentUrl.substr(parentProtocol.length + 1);
      }

      if (relUrl[0] === '/')
        return parentUrl.substr(0, parentUrl.length - pathname.length - 1) + relUrl;

      // join together and split for removal of .. and . segments
      // looping the string instead of anything fancy for perf reasons
      // '../../../../../z' resolved to 'x/y' is just 'z'
      const segmented = pathname.substr(0, pathname.lastIndexOf('/') + 1) + relUrl;

      const output = [];
      let segmentIndex = -1;
      for (let i = 0; i < segmented.length; i++) {
        // busy reading a segment - only terminate on '/'
        if (segmentIndex !== -1) {
          if (segmented[i] === '/') {
            output.push(segmented.substring(segmentIndex, i + 1));
            segmentIndex = -1;
          }
        }

        // new segment - check if it is relative
        else if (segmented[i] === '.') {
          // ../ segment
          if (segmented[i + 1] === '.' && (segmented[i + 2] === '/' || i + 2 === segmented.length)) {
            output.pop();
            i += 2;
          }
          // ./ segment
          else if (segmented[i + 1] === '/' || i + 1 === segmented.length) {
            i += 1;
          }
          else {
            // the start of a new segment as below
            segmentIndex = i;
          }
        }
        // it is the start of a new segment
        else {
          segmentIndex = i;
        }
      }
      // finish reading out the last segment
      if (segmentIndex !== -1)
        output.push(segmented.substr(segmentIndex));
      return parentUrl.substr(0, parentUrl.length - pathname.length) + output.join('');
    }
  }

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
        throw new Error('No System.register Module');
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
      err.message += '\n  Instantiating ' + id;
      load.e = null;
      throw err;
    });

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
      L: instantiatePromise.then(function (instantiation) {
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
          });
        }))
        .then(function (depLoads) {
          load.d = depLoads;
        });
      }),

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
      });
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
        try {
          const depLoadPromise = postOrderExec(loader, depLoad, seen);
          if (depLoadPromise)
            (depLoadPromises = depLoadPromises || []).push(depLoadPromise.catch(evalError));
        }
        catch (e) {
          evalError(e);
        }
      });
      if (depLoadPromises)
        return Promise.all(depLoadPromises).then(doEval);
    }

    return doEval();

    function doEval () {
      // could be circular or tla
      if (!load.e)
        return load.E;
    
      try {
        const execPromise = load.e.call(nullContext);
        if (execPromise)
          return load.E = execPromise.then(done, evalError);
        done();
      }
      catch (err) {
        evalError(err);
      }
      finally {
        load.L = load.I = undefined;
        load.e = null;
      }
    }

    function done () {
      // (should be a promise, but a minify optimization to leave out Promise.resolve)
      load.C = load.n;
    }
    
    function evalError (err) {
      err.message += '\n  Evaluating ' + load.id;
      if (!load.eE)
        load.eE = err;
      throw err;
    }
  }

  envGlobal.System = new SystemJS();

  let baseUrl = location.href.split('#')[0].split('?')[0];
  const lastSepIndex = baseUrl.lastIndexOf('/');
  if (lastSepIndex !== -1)
    baseUrl = baseUrl.substr(0, lastSepIndex + 1);

  /*
   * Supports loading System.register via script tag injection
   */
  systemJSPrototype.instantiate = function (url) {
    const loader = this;
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.charset = 'utf-8';
      script.async = true;
      script.addEventListener('error', reject);
      script.addEventListener('load', function () {
        resolve(loader.getRegister());
        document.head.removeChild(script);
      });
      script.src = url;
      document.head.appendChild(script);
    });
  };

  systemJSPrototype.resolve = function (id, parent) {
    return resolveIfNotPlainOrUrl(id, parent || baseUrl);
  };

}());
//# sourceMappingURL=s.src.js.map
