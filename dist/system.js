/*
* SystemJS 2.0.0-dev
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
      // Disabled, but these cases will give inconsistent results for deep backtracking
      //if (parentUrl[parentProtocol.length] !== '/')
      //  throw new Error('Cannot resolve');
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
      loader.onload(load.id, err);
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
        {
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
      });
      if (depLoadPromises) {
        {
          return Promise.all(depLoadPromises)
          .catch(function (err) { loader.onload(load.id, err); throw err; })
          .then(function () {
            // TLA trick:
            // second time till will jump straight to evaluation part as seen
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
        execPromise.catch(function (err) { loader.onload(load.id, err); throw err; });
        load.E = execPromise;
        execPromise.then(function () {
          load.C = load.n;
          loader.onload(load.id, null);
        })
        .catch(function () {});
        return execPromise;
      }
      // (should be a promise, but a minify optimization to leave out Promise.resolve)
      load.C = load.n;
      loader.onload(load.id, null);
    }
    catch (err) {
      loader.onload(load.id, err);
      load.eE = err;
      throw err;
    }
    finally {
      load.L = load.I = undefined;
      load.e = null;
    }
  }

  envGlobal.System = new SystemJS();

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

  /*
   * Supports loading System.register in workers
   */

  if (hasSelf && typeof importScripts === 'function')
    systemJSPrototype.instantiate = function (url) {
      const loader = this;
      return new Promise(function (resolve, reject) {
        try {
          importScripts(url);
        }
        catch (e) {
          reject(e);
        }
        resolve(loader.execInstantiate());
      });
    };

  /*
   * Support for global loading
   */

  let lastGlobalProp;
  let lastGlobalCheck = -1;
  const instantiate = systemJSPrototype.instantiate;
  systemJSPrototype.instantiate = function (url) {
    // snapshot the global list, debounced every 50ms
    const now = Date.now();
    if (now - lastGlobalCheck > 50) {
      lastGlobalProp = Object.keys(envGlobal).pop();
      lastGlobalCheck = now;
    }
    return instantiate.call(this, url);
  };

  const getRegister = systemJSPrototype.getRegister;
  systemJSPrototype.getRegister = function () {
    const lastRegister = getRegister.call(this);
    if (lastRegister)
      return lastRegister;
    
    // no registration -> attempt a global detection as difference from snapshot
    // when multiple globals, we take the global value to be the last defined new global object property
    // for performance, this will not support multi-version / global collisions as previous SystemJS versions did
    const globalProp = Object.keys(envGlobal).pop();
    lastGlobalCheck = Date.now();
    if (lastGlobalProp === globalProp)
      return;
    
    lastGlobalProp = globalProp;
    let globalExport;
    try {
      globalExport = envGlobal[globalProp];
    }
    catch (e) {
      return;
    }

    return [[], function (_export) {
      return { execute: function () { _export('default', globalExport); } };
    }];  
  };

  /*
   * Loads WASM based on file extension detection
   * Assumes successive instantiate will handle other files
   */
  const instantiate$1 = systemJSPrototype.instantiate;
  systemJSPrototype.instantiate = function (url) {
    if (!url.endsWith('.wasm'))
      return instantiate$1.call(this, url);
    
    return fetch(url)
    .then(function (res) {
      if (!res.ok)
        throw new Error('Fetch error: ' + res.status + ' ' + res.statusText);
      return WebAssembly.compileStreaming(res);
    })
    .then(function (module) {
      const deps = [];
      const setters = [];
      const importObj = {};

      // we can only set imports if supported (eg early Safari doesnt support)
      if (WebAssembly.Module.imports)
        WebAssembly.Module.imports(module).forEach(function (impt) {
          const key = impt.module;
          setters.push(function (m) {
            importObj[key] = m;
          });
          if (deps.indexOf(key) === -1)
            deps.push(key);
        });

      return [deps, function (_export) {
        return {
          setters: setters,
          execute: function () {
            _export(new WebAssembly.Instance(module, importObj).exports);
          }
        };
      }];
    });
  };

  let baseUrl;
  if (typeof location !== 'undefined') {
    baseUrl = location.href.split('#')[0].split('?')[0];
    const lastSepIndex = baseUrl.lastIndexOf('/');
    if (lastSepIndex !== -1)
      baseUrl = baseUrl.substr(0, lastSepIndex + 1);
  }

  /*
   * Package name map support for SystemJS
   * 
   * <script type="systemjs-packagemap">{}</script>
   * OR
   * <script type="systemjs-packagemap" src=package.json></script>
   * 
   * Only supports loading the first package map
   */

  let packageMapPromise, packageMapResolve;
  const scripts = document.getElementsByTagName('script');
  for (let i = 0; i < scripts.length; i++) {
    const script = scripts[i];
    if (script.type !== 'systemjs-packagemap')
      continue;

    if (!script.src)
      packageMapResolve = createPackageMap(JSON.parse(script.innerHTML));
    else
      packageMapPromise = fetch(script.src)
      .then(function (res) {
        return res.json();
      })
      .then(function (json) {
        packageMapResolve = createPackageMap(json);
        packageMapPromise = undefined;
      });
    break;
  }

  systemJSPrototype.resolve = function (id, parentUrl) {
    const resolvedIfNotPlainOrUrl = resolveIfNotPlainOrUrl(id, parentUrl || baseUrl);
    if (resolvedIfNotPlainOrUrl)
      return resolvedIfNotPlainOrUrl;

    if (packageMapResolve)
      return packageMapResolve(id, parentUrl);

    if (packageMapPromise)
      return packageMapPromise
      .then(function () {
        return packageMapResolve(id, parentUrl);
      });
    
    return id;
  };

  /*
   * Package name maps implementation
   *
   * Reduced implementation - only a single scope level is supported
   * 
   * To make lookups fast we pre-resolve the entire package name map
   * and then match based on backtracked hash lookups
   * 
   * path_prefix in scopes not supported
   * nested scopes not supported
   */

  function resolveUrl (relUrl, parentUrl) {
    return resolveIfNotPlainOrUrl(relUrl.startsWith('./') ? relUrl : './' + json.path_prefix, parentUrl);
  }

  function createPackageMap (json) {
    let baseUrl$$1 = json.path_prefix ? resolveUrl(json.path_prefix, baseUrl) : baseUrl;
    if (baseUrl$$1[baseUrl$$1.length - 1] !== '/')
      baseUrl$$1 += '/';
      
    const basePackages = json.packages || {};
    const scopePackages = {};
    if (json.scopes) {
      for (let scopeName in json.scopes) {
        const scope = json.scopes[scopeName];
        if (scope.path_prefix)
          throw new Error('Scope path_prefix not currently supported');
        if (scope.scopes)
          throw new Error('Nested scopes not currently supported');
        scopePackages[resolveUrl(scopeName, baseUrl$$1)] = scope.packages || {};
      }
    }

    function getMatch (url, matchObj) {
      let sepIndex = url.length;
      while ((sepIndex = url.lastIndexOf('/', sepIndex)) !== -1) {
        const segment = url.substr(0, sepIndex);
        if (segment in matchObj)
          return segmnet;
      }
    }

    function applyPackages (id, packages) {
      const pkgName = getMatch(id, packages);
      if (pkgName) {
        const pkg = packages[pkgName];
        if (pkg === id) {
          if (typeof pkg === 'string')
            return resolveUrl(pkgName + '/' + pkg, baseUrl$$1);
          if (!pkg.main)
            throw new Error('Package ' + pkgName + ' has no main');
          return resolveUrl((pkg.path || pkgName) + '/' + pkg.main, baseUrl$$1);
        }
        return resolveUrl((pkg.path || pkgName) + '/' + id.substr(pkg.length), baseUrl$$1);
      }
    }

    return function (id, parentUrl) {
      const scope = getMatch(parentUrl, scopePackages);
      if (scope) {
        const packages = scopePackages[scope];
        const packageResolution = applyPackages(id, packages);
        if (packageResolution)
          return packageResolution;
      }
      // core will throw "No resolution" on blank resolution
      return applyPackages(id, basePackages);
    };
  }

  systemJSPrototype.get = function (id) {
    const load = this[REGISTRY][id];
    if (load && load.e === null && !load.E)
      return load.n;
  };

  // Delete function provided for hot-reloading use cases
  systemJSPrototype.delete = function (id) {
    return this.get(id) ? delete this[REGISTRY][id] : false;
  };

}());
