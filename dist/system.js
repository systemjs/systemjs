/*
* SystemJS 3.0.1
*/
(function () {
  const hasSelf = typeof self !== 'undefined';

  const envGlobal = hasSelf ? self : global;

  let baseUrl;
  if (typeof location !== 'undefined') {
    baseUrl = location.href.split('#')[0].split('?')[0];
    const lastSepIndex = baseUrl.lastIndexOf('/');
    if (lastSepIndex !== -1)
      baseUrl = baseUrl.slice(0, lastSepIndex + 1);
  }

  const backslashRegEx = /\\/g;
  function resolveIfNotPlainOrUrl (relUrl, parentUrl) {
    if (relUrl.indexOf('\\') !== -1)
      relUrl = relUrl.replace(backslashRegEx, '/');
    // protocol-relative
    if (relUrl[0] === '/' && relUrl[1] === '/') {
      return parentUrl.slice(0, parentUrl.indexOf(':') + 1) + relUrl;
    }
    // relative-url
    else if (relUrl[0] === '.' && (relUrl[1] === '/' || relUrl[1] === '.' && (relUrl[2] === '/' || relUrl.length === 2 && (relUrl += '/')) ||
        relUrl.length === 1  && (relUrl += '/')) ||
        relUrl[0] === '/') {
      const parentProtocol = parentUrl.slice(0, parentUrl.indexOf(':') + 1);
      // Disabled, but these cases will give inconsistent results for deep backtracking
      //if (parentUrl[parentProtocol.length] !== '/')
      //  throw new Error('Cannot resolve');
      // read pathname from parent URL
      // pathname taken to be part after leading "/"
      let pathname;
      if (parentUrl[parentProtocol.length + 1] === '/') {
        // resolving to a :// so we need to read out the auth and host
        if (parentProtocol !== 'file:') {
          pathname = parentUrl.slice(parentProtocol.length + 2);
          pathname = pathname.slice(pathname.indexOf('/') + 1);
        }
        else {
          pathname = parentUrl.slice(8);
        }
      }
      else {
        // resolving to :/ so pathname is the /... part
        pathname = parentUrl.slice(parentProtocol.length + (parentUrl[parentProtocol.length] === '/'));
      }

      if (relUrl[0] === '/')
        return parentUrl.slice(0, parentUrl.length - pathname.length - 1) + relUrl;

      // join together and split for removal of .. and . segments
      // looping the string instead of anything fancy for perf reasons
      // '../../../../../z' resolved to 'x/y' is just 'z'
      const segmented = pathname.slice(0, pathname.lastIndexOf('/') + 1) + relUrl;

      const output = [];
      let segmentIndex = -1;
      for (let i = 0; i < segmented.length; i++) {
        // busy reading a segment - only terminate on '/'
        if (segmentIndex !== -1) {
          if (segmented[i] === '/') {
            output.push(segmented.slice(segmentIndex, i + 1));
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
        output.push(segmented.slice(segmentIndex));
      return parentUrl.slice(0, parentUrl.length - pathname.length) + output.join('');
    }
  }

  /*
   * Import maps implementation
   * 
   * To make lookups fast we pre-resolve the entire import map
   * and then match based on backtracked hash lookups
   * 
   */

  function resolveUrl (relUrl, parentUrl) {
    return resolveIfNotPlainOrUrl(relUrl, parentUrl) ||
        relUrl.indexOf(':') !== -1 && relUrl ||
        resolveIfNotPlainOrUrl('./' + relUrl, parentUrl);
  }

  function resolvePackages(pkgs) {
    var outPkgs = {};
    for (var p in pkgs) {
      var value = pkgs[p];
      // TODO package fallback support
      if (typeof value !== 'string')
        continue;
      outPkgs[resolveIfNotPlainOrUrl(p) || p] = value;
    }
    return outPkgs;
  }

  function parseImportMap (json, baseUrl) {
    const imports = resolvePackages(json.imports) || {};
    const scopes = {};
    if (json.scopes) {
      for (let scopeName in json.scopes) {
        const scope = json.scopes[scopeName];
        let resolvedScopeName = resolveUrl(scopeName, baseUrl);
        if (resolvedScopeName[resolvedScopeName.length - 1] !== '/')
          resolvedScopeName += '/';
        scopes[resolvedScopeName] = resolvePackages(scope) || {};
      }
    }

    return { imports: imports, scopes: scopes, baseUrl: baseUrl };
  }

  function getMatch (path, matchObj) {
    if (matchObj[path])
      return path;
    let sepIndex = path.length;
    do {
      const segment = path.slice(0, sepIndex + 1);
      if (segment in matchObj)
        return segment;
    } while ((sepIndex = path.lastIndexOf('/', sepIndex - 1)) !== -1)
  }

  function applyPackages (id, packages, baseUrl) {
    const pkgName = getMatch(id, packages);
    if (pkgName) {
      const pkg = packages[pkgName];
      if (pkg === null)

      if (id.length > pkgName.length && pkg[pkg.length - 1] !== '/')
        console.warn("Invalid package target " + pkg + " for '" + pkgName + "' should have a trailing '/'.");
      return resolveUrl(pkg + id.slice(pkgName.length), baseUrl);
    }
  }

  function resolveImportMap (id, parentUrl, importMap) {
    const urlResolved = resolveIfNotPlainOrUrl(id, parentUrl);
    if (urlResolved)
      id = urlResolved;
    const scopeName = getMatch(parentUrl, importMap.scopes);
    if (scopeName) {
      const scopePackages = importMap.scopes[scopeName];
      const packageResolution = applyPackages(id, scopePackages, scopeName);
      if (packageResolution)
        return packageResolution;
    }
    return applyPackages(id, importMap.imports, importMap.baseUrl) || urlResolved || throwBare(id, parentUrl);
  }

  function throwBare (id, parentUrl) {
    throw new Error('Unable to resolve bare specifier "' + id + (parentUrl ? '" from ' + parentUrl : '"'));
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

  const systemJSPrototype = SystemJS.prototype;
  systemJSPrototype.import = function (id, parentUrl) {
    const loader = this;
    return Promise.resolve(loader.resolve(id, parentUrl))
    .then(function (id) {
      const load = getOrCreateLoad(loader, id);
      return load.C || topLevelLoad(loader, load);
    });
  };

  // Hookable createContext function -> allowing eg custom import meta
  systemJSPrototype.createContext = function (parentId) {
    return {
      url: parentId
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

  function getOrCreateLoad (loader, id, firstParentUrl) {
    let load = loader[REGISTRY][id];
    if (load)
      return load;

    const importerSetters = [];
    const ns = Object.create(null);
    if (toStringTag)
      Object.defineProperty(ns, toStringTag, { value: 'Module' });
    
    let instantiatePromise = Promise.resolve()
    .then(function () {
      return loader.instantiate(id, firstParentUrl);
    })
    .then(function (registration) {
      if (!registration)
        throw new Error('Module ' + id + ' did not instantiate');
      function _export (name, value) {
        // note if we have hoisted exports (including reexports)
        load.h = true;
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
      const declared = registration[1](_export, registration[1].length === 2 ? {
        import: function (importId) {
          return loader.import(importId, id);
        },
        meta: loader.createContext(id)
      } : undefined);
      load.e = declared.execute || function () {};
      return [registration[0], declared.setters || []];
    });

    instantiatePromise = instantiatePromise.catch(function (err) {
        loader.onload(load.id, err);
        throw err;
      });

    const linkPromise = instantiatePromise
    .then(function (instantiation) {
      return Promise.all(instantiation[0].map(function (dep, i) {
        const setter = instantiation[1][i];
        return Promise.resolve(loader.resolve(dep, id))
        .then(function (depId) {
          const depLoad = getOrCreateLoad(loader, depId, id);
          // depLoad.I may be undefined for already-evaluated
          return Promise.resolve(depLoad.I)
          .then(function () {
            if (setter) {
              depLoad.i.push(setter);
              // only run early setters when there are hoisted exports of that module
              // the timing works here as pending hoisted export calls will trigger through importerSetters
              if (depLoad.h || !depLoad.I)
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

    linkPromise.catch(function (err) {
      load.e = null;
      load.er = err;
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
      L: linkPromise,
      // whether it has hoisted exports
      h: false,

      // On instantiate completion we have populated:
      // dependency load records
      d: undefined,
      // execution function
      // set to NULL immediately after execution (or on any failure) to indicate execution has happened
      // in such a case, pC should be used, and pLo, pLi will be emptied
      e: undefined,

      // On execution we have populated:
      // the execution error if any
      er: undefined,
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
    if (seen[load.id])
      return;
    seen[load.id] = true;

    if (!load.e) {
      if (load.er)
        throw load.er;
      if (load.E)
        return load.E;
      return;
    }

    // deps execute first, unless circular
    let depLoadPromises;
    load.d.forEach(function (depLoad) {
      {
        try {
          const depLoadPromise = postOrderExec(loader, depLoad, seen);
          if (depLoadPromise)
            (depLoadPromises = depLoadPromises || []).push(depLoadPromise);
        }
        catch (err) {
          loader.onload(load.id, err);
          throw err;
        }
      }
    });
    if (depLoadPromises) {
      return Promise.all(depLoadPromises)
        .then(doExec)
        .catch(function (err) {
          loader.onload(load.id, err);
          throw err;
        });
    }

    return doExec();

    function doExec () {
      try {
        let execPromise = load.e.call(nullContext);
        if (execPromise) {
          execPromise = execPromise.then(function () {
              load.C = load.n;
              load.E = null; // indicates completion
              loader.onload(load.id, null);
            }, function (err) {
              loader.onload(load.id, err);
              throw err;
            });
          execPromise.catch(function () {});
          return load.E = load.E || execPromise;
        }
        // (should be a promise, but a minify optimization to leave out Promise.resolve)
        load.C = load.n;
        loader.onload(load.id, null);
      }
      catch (err) {
        loader.onload(load.id, err);
        load.er = err;
        throw err;
      }
      finally {
        load.L = load.I = undefined;
        load.e = null;
      }
    }
  }

  envGlobal.System = new SystemJS();

  /*
   * Supports loading System.register via script tag injection
   */

  let err;
  if (typeof window !== 'undefined')
    window.addEventListener('error', function (e) {
      err = e.error;
    });

  const systemRegister = systemJSPrototype.register;
  systemJSPrototype.register = function (deps, declare) {
    err = undefined;
    systemRegister.call(this, deps, declare);
  };

  systemJSPrototype.instantiate = function (url, firstParentUrl) {
    const loader = this;
    return new Promise(function (resolve, reject) {
      const script = document.createElement('script');
      script.charset = 'utf-8';
      script.async = true;
      script.crossOrigin = 'anonymous';
      script.addEventListener('error', function () {
        reject(new Error('Error loading ' + url + (firstParentUrl ? ' from ' + firstParentUrl : '')));
      });
      script.addEventListener('load', function () {
        document.head.removeChild(script);
        // Note URL normalization issues are going to be a careful concern here
        if (err)
          return reject(err);
        else
          resolve(loader.getRegister());
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
        resolve(loader.getRegister());
      });
    };

  /*
   * SystemJS global script loading support
   * Extra for the s.js build only
   * (Included by default in system.js build)
   */
  (function (global) {

  const systemJSPrototype = System.constructor.prototype;

  // safari unpredictably lists some new globals first or second in object order
  let firstGlobalProp, secondGlobalProp, lastGlobalProp;
  function getGlobalProp () {
    let cnt = 0;
    let lastProp;
    for (let p in global) {
      if (!global.hasOwnProperty(p))
        continue;
      if (cnt === 0 && p !== firstGlobalProp || cnt === 1 && p !== secondGlobalProp)
        return p;
      cnt++;
      lastProp = p;
    }
    if (lastProp !== lastGlobalProp)
      return lastProp;
  }

  function noteGlobalProps () {
    // alternatively Object.keys(global).pop()
    // but this may be faster (pending benchmarks)
    firstGlobalProp = secondGlobalProp = undefined;
    for (let p in global) {
      if (!global.hasOwnProperty(p))
        continue;
      if (!firstGlobalProp)
        firstGlobalProp = p;
      else if (!secondGlobalProp)
        secondGlobalProp = p;
      lastGlobalProp = p;
    }
    return lastGlobalProp;
  }

  const impt = systemJSPrototype.import;
  systemJSPrototype.import = function (id, parentUrl) {
    noteGlobalProps();
    return impt.call(this, id, parentUrl);
  };

  const emptyInstantiation = [[], function () { return {} }];

  const getRegister = systemJSPrototype.getRegister;
  systemJSPrototype.getRegister = function () {
    const lastRegister = getRegister.call(this);
    if (lastRegister)
      return lastRegister;
    
    // no registration -> attempt a global detection as difference from snapshot
    // when multiple globals, we take the global value to be the last defined new global object property
    // for performance, this will not support multi-version / global collisions as previous SystemJS versions did
    // note in Edge, deleting and re-adding a global does not change its ordering
    const globalProp = getGlobalProp();
    if (!globalProp)
      return emptyInstantiation;
    
    let globalExport;
    try {
      globalExport = global[globalProp];
    }
    catch (e) {
      return emptyInstantiation;
    }

    return [[], function (_export) {
      return { execute: function () { _export('default', globalExport); } };
    }];
  };

  })(typeof self !== 'undefined' ? self : global);

  /*
   * Loads WASM based on file extension detection
   * Assumes successive instantiate will handle other files
   */
  const instantiate = systemJSPrototype.instantiate;
  systemJSPrototype.instantiate = function (url, parent) {
    if (url.slice(-5) !== '.wasm')
      return instantiate.call(this, url, parent);
    
    return fetch(url)
    .then(function (res) {
      if (!res.ok)
        throw new Error(res.status + ' ' + res.statusText + ' ' + res.url + (parent ? ' loading from ' + parent : ''));

      if (WebAssembly.compileStreaming)
        return WebAssembly.compileStreaming(res);
      
      return res.arrayBuffer()
      .then(function (buf) {
        return WebAssembly.compile(buf);
      });
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
            return WebAssembly.instantiate(module, importObj)
            .then(function (instance) {
              _export(instance.exports);
            });
          }
        };
      }];
    });
  };

  /*
   * Import map support for SystemJS
   * 
   * <script type="systemjs-importmap">{}</script>
   * OR
   * <script type="systemjs-importmap" src=package.json></script>
   * 
   * Only supports loading the first import map
   */

  var importMap, importMapPromise;
  if (typeof document !== 'undefined') {
    const scripts = document.getElementsByTagName('script');
    for (let i = 0; i < scripts.length; i++) {
      const script = scripts[i];
      if (script.type !== 'systemjs-importmap')
        continue;

      if (!script.src) {
        importMap = parseImportMap(JSON.parse(script.innerHTML), baseUrl);
      }
      else {
        importMapPromise = fetch(script.src)
        .then(function (res) {
          return res.json();
        })
        .then(function (json) {
          importMap = parseImportMap(json, script.src);
        });
      }
      break;
    }
  }

  importMap = importMap || { imports: {}, scopes: {} };

  systemJSPrototype.resolve = function (id, parentUrl) {
    parentUrl = parentUrl || baseUrl;

    if (importMapPromise)
      return importMapPromise
      .then(function () {
        return resolveImportMap(id, parentUrl, importMap);
      });

    return resolveImportMap(id, parentUrl, importMap);
  };

  const toStringTag$1 = typeof Symbol !== 'undefined' && Symbol.toStringTag;

  systemJSPrototype.get = function (id) {
    const load = this[REGISTRY][id];
    if (load && load.e === null && !load.E) {
      if (load.er)
        return null;
      return load.n;
    }
  };

  systemJSPrototype.set = function (id, module) {
    let ns;
    if (toStringTag$1 && module[toStringTag$1] === 'Module') {
      ns = module;
    }
    else {
      ns = Object.assign(Object.create(null), module);
      if (toStringTag$1)
        Object.defineProperty(ns, toStringTag$1, { value: 'Module' });
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
      er: undefined,
      E: undefined,
      C: done
    };
    return ns;
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

}());
