/*
* SystemJS 6.2.2
*/
(function () {
  const hasSelf = typeof self !== 'undefined';

  const hasDocument = typeof document !== 'undefined';

  const envGlobal = hasSelf ? self : global;

  let baseUrl;

  if (hasDocument) {
    const baseEl = document.querySelector('base[href]');
    if (baseEl)
      baseUrl = baseEl.href;
  }

  if (!baseUrl && typeof location !== 'undefined') {
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
      //  throw Error('Cannot resolve');
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
    return resolveIfNotPlainOrUrl(relUrl, parentUrl) || (relUrl.indexOf(':') !== -1 ? relUrl : resolveIfNotPlainOrUrl('./' + relUrl, parentUrl));
  }

  function objectAssign (to, from) {
    for (let p in from)
      to[p] = from[p];
    return to;
  }

  function resolveAndComposePackages (packages, outPackages, baseUrl, parentMap, parentUrl) {
    for (let p in packages) {
      const resolvedLhs = resolveIfNotPlainOrUrl(p, baseUrl) || p;
      const rhs = packages[p];
      // package fallbacks not currently supported
      if (typeof rhs !== 'string')
        continue;
      const mapped = resolveImportMap(parentMap, resolveIfNotPlainOrUrl(rhs, baseUrl) || rhs, parentUrl);
      if (!mapped)
        targetWarning(p, rhs, 'bare specifier did not resolve');
      else
        outPackages[resolvedLhs] = mapped;
    }
  }

  function resolveAndComposeImportMap (json, baseUrl, parentMap) {
    const outMap = { imports: objectAssign({}, parentMap.imports), scopes: objectAssign({}, parentMap.scopes) };

    if (json.imports)
      resolveAndComposePackages(json.imports, outMap.imports, baseUrl, parentMap, null);

    if (json.scopes)
      for (let s in json.scopes) {
        const resolvedScope = resolveUrl(s, baseUrl);
        resolveAndComposePackages(json.scopes[s], outMap.scopes[resolvedScope] || (outMap.scopes[resolvedScope] = {}), baseUrl, parentMap, resolvedScope);
      }

    return outMap;
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

  function applyPackages (id, packages) {
    const pkgName = getMatch(id, packages);
    if (pkgName) {
      const pkg = packages[pkgName];
      if (pkg === null) return;
      if (id.length > pkgName.length && pkg[pkg.length - 1] !== '/')
        targetWarning(pkgName, pkg, "should have a trailing '/'");
      else
        return pkg + id.slice(pkgName.length);
    }
  }

  function targetWarning (match, target, msg) {
    console.warn("Package target " + msg + ", resolving target '" + target + "' for " + match);
  }

  function resolveImportMap (importMap, resolvedOrPlain, parentUrl) {
    let scopeUrl = parentUrl && getMatch(parentUrl, importMap.scopes);
    while (scopeUrl) {
      const packageResolution = applyPackages(resolvedOrPlain, importMap.scopes[scopeUrl]);
      if (packageResolution)
        return packageResolution;
      scopeUrl = getMatch(scopeUrl.slice(0, scopeUrl.lastIndexOf('/')), importMap.scopes);
    }
    return applyPackages(resolvedOrPlain, importMap.imports) || resolvedOrPlain.indexOf(':') !== -1 && resolvedOrPlain;
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
   * - System.onload(err, id, deps) handler for tracing / hot-reloading
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

  systemJSPrototype.prepareImport = function () {};

  systemJSPrototype.import = function (id, parentUrl) {
    const loader = this;
    return Promise.resolve(loader.prepareImport())
    .then(function() {
      return loader.resolve(id, parentUrl);
    })
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

  // onLoad(err, id, deps) provided for tracing / hot-reloading
  systemJSPrototype.onload = function () {};
  function loadToId (load) {
    return load.id;
  }
  function triggerOnload (loader, load, err) {
    loader.onload(err, load.id, load.d && load.d.map(loadToId));
    if (err)
      throw err;
  }

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
        throw Error('Module ' + id + ' did not instantiate');
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

          if (name.__esModule) {
            ns.__esModule = name.__esModule;
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
        triggerOnload(loader, load, err);
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

    // Capital letter = a promise function
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
      // in such a case, C should be used, and E, I, L will be emptied
      e: undefined,

      // On execution we have populated:
      // the execution error if any
      er: undefined,
      // in the case of TLA, the execution promise
      E: undefined,

      // On execution, L, I, E cleared

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
          if (depLoadPromise) {
            depLoadPromise.catch(function (err) {
              triggerOnload(loader, load, err);
            });
            (depLoadPromises = depLoadPromises || []).push(depLoadPromise);
          }
        }
        catch (err) {
          triggerOnload(loader, load, err);
        }
      }
    });
    if (depLoadPromises)
      return Promise.all(depLoadPromises).then(doExec);

    return doExec();

    function doExec () {
      try {
        let execPromise = load.e.call(nullContext);
        if (execPromise) {
          execPromise = execPromise.then(function () {
              load.C = load.n;
              load.E = null; // indicates completion
              triggerOnload(loader, load, null);
            }, function (err) {
              triggerOnload(loader, load, err);
            });
          return load.E = load.E || execPromise;
        }
        // (should be a promise, but a minify optimization to leave out Promise.resolve)
        load.C = load.n;
        triggerOnload(loader, load, null);
      }
      catch (err) {
        triggerOnload(loader, load, err);
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
   * Import map support for SystemJS
   * 
   * <script type="systemjs-importmap">{}</script>
   * OR
   * <script type="systemjs-importmap" src=package.json></script>
   * 
   * Only those import maps available at the time of SystemJS initialization will be loaded
   * and they will be loaded in DOM order.
   * 
   * There is no support for dynamic import maps injection currently.
   */

  let importMap = { imports: {}, scopes: {} }, importMapPromise;

  if (hasDocument) {
    Array.prototype.forEach.call(document.querySelectorAll('script[type="systemjs-importmap"][src]'), function (script) {
      script._j = fetch(script.src).then(function (res) {
        return res.json();
      });
    });
  }

  systemJSPrototype.prepareImport = function () {
    if (!importMapPromise) {
      importMapPromise = Promise.resolve();
      if (hasDocument)
        Array.prototype.forEach.call(document.querySelectorAll('script[type="systemjs-importmap"]'), function (script) {
          importMapPromise = importMapPromise.then(function () {
            return (script._j || script.src && fetch(script.src).then(function (resp) { return resp.json(); }) || Promise.resolve(JSON.parse(script.innerHTML)))
            .then(function (json) {
              importMap = resolveAndComposeImportMap(json, script.src || baseUrl, importMap);
            });
          });
        });
    }
    return importMapPromise;
  };

  systemJSPrototype.resolve = function (id, parentUrl) {
    parentUrl = parentUrl || baseUrl;
    return resolveImportMap(importMap, resolveIfNotPlainOrUrl(id, parentUrl) || id, parentUrl) || throwUnresolved(id, parentUrl);
  };

  function throwUnresolved (id, parentUrl) {
    throw Error("Unable to resolve specifier '" + id + (parentUrl ? "' from " + parentUrl : "'"));
  }

  /*
   * Supports loading System.register via script tag injection
   */

  const systemRegister = systemJSPrototype.register;
  systemJSPrototype.register = function (deps, declare) {
    systemRegister.call(this, deps, declare);
  };

  systemJSPrototype.createScript = function (url) {
    const script = document.createElement('script');
    script.charset = 'utf-8';
    script.async = true;
    script.crossOrigin = 'anonymous';
    script.src = url;
    return script;
  };

  let lastWindowErrorUrl, lastWindowError;
  if (hasDocument)
    window.addEventListener('error', function (evt) {
      lastWindowErrorUrl = evt.filename;
      lastWindowError = evt.error;
    });

  systemJSPrototype.instantiate = function (url, firstParentUrl) {
    const loader = this;
    return new Promise(function (resolve, reject) {
      const script = systemJSPrototype.createScript(url);
      script.addEventListener('error', function () {
        reject(Error('Error loading ' + url + (firstParentUrl ? ' from ' + firstParentUrl : '')));
      });
      script.addEventListener('load', function () {
        document.head.removeChild(script);
        // Note that if an error occurs that isn't caught by this if statement,
        // that getRegister will return null and a "did not instantiate" error will be thrown.
        if (lastWindowErrorUrl === url) {
          reject(lastWindowError);
        }
        else {
          resolve(loader.getRegister());
        }
      });
      document.head.appendChild(script);
    });
  };

  if (hasDocument) {
    window.addEventListener('DOMContentLoaded', loadScriptModules);
    loadScriptModules();
  }

  function loadScriptModules() {
    Array.prototype.forEach.call(
      document.querySelectorAll('script[type=systemjs-module]'), function (script) {
        if (script.src) {
          System.import(script.src.slice(0, 7) === 'import:' ? script.src.slice(7) : resolveUrl(script.src, baseUrl));
        }
      });
  }

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
    const systemJSPrototype = global.System.constructor.prototype;
    const isIE = navigator.userAgent.indexOf('Trident') !== -1;

    // safari unpredictably lists some new globals first or second in object order
    let firstGlobalProp, secondGlobalProp, lastGlobalProp;
    function getGlobalProp () {
      let cnt = 0;
      let lastProp;
      for (let p in global) {
        // do not check frames cause it could be removed during import
        if (
          !global.hasOwnProperty(p)
          || (!isNaN(p) && p < global.length)
          || (isIE && global[p] && global[p].parent === window)
        )
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
        // do not check frames cause it could be removed during import
        if (
          !global.hasOwnProperty(p)
          || (!isNaN(p) && p < global.length)
          || (isIE && global[p] && global[p].parent === window)
        )
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
        return {
          execute: function () {
            _export({ default: globalExport, __useDefault: true });
          }
        };
      }];
    };
  })(typeof self !== 'undefined' ? self : global);

  /*
   * Loads JSON, CSS, Wasm module types based on file extensions
   * Supports application/javascript falling back to JS eval
   */
  (function(global) {
    const systemJSPrototype = global.System.constructor.prototype;
    const instantiate = systemJSPrototype.instantiate;

    const moduleTypesRegEx = /\.(css|html|json|wasm)$/;
    systemJSPrototype.shouldFetch = function (url) {
      const path = url.split('?')[0].split('#')[0];
      const ext = path.slice(path.lastIndexOf('.'));
      return ext.match(moduleTypesRegEx);
    };
    systemJSPrototype.fetch = function (url) {
      return fetch(url);
    };

    systemJSPrototype.instantiate = function (url, parent) {
      const loader = this;
      if (this.shouldFetch(url)) {
        return this.fetch(url)
        .then(function (res) {
          if (!res.ok)
            throw Error(res.status + ' ' + res.statusText + ', loading ' + url + (parent ? ' from ' + parent : ''));
          const contentType = res.headers.get('content-type');
          if (contentType.match(/^(text|application)\/(x-)?javascript(;|$)/)) {
            return res.text().then(function (source) {
              (0, eval)(source);
              return loader.getRegister();
            });
          }
          else if (contentType.match(/^application\/json(;|$)/)) {
            return res.text().then(function (source) {
              return [[], function (_export) {
                return {
                  execute: function () {
                    _export('default', JSON.parse(source));
                  }
                };
              }];
            });
          }
          else if (contentType.match(/^text\/css(;|$)/)) {
            return res.text().then(function (source) {
              return [[], function (_export) {
                return {
                  execute: function () {
                    // Relies on a Constructable Stylesheet polyfill
                    const stylesheet = new CSSStyleSheet();
                    stylesheet.replaceSync(source);
                    _export('default', stylesheet);
                  }
                };
              }];
            }); 
          }
          else if (contentType.match(/^application\/wasm(;|$)/)) {
            return (WebAssembly.compileStreaming ? WebAssembly.compileStreaming(res) : res.arrayBuffer().then(WebAssembly.compile))
            .then(function (module) {
              const deps = [];
              const setters = [];
              const importObj = {};
          
              // we can only set imports if supported (eg early Safari doesnt support)
              if (WebAssembly.Module.imports)
                WebAssembly.Module.imports(module).forEach(function (impt) {
                  const key = impt.module;
                  if (deps.indexOf(key) === -1) {
                    deps.push(key);
                    setters.push(function (m) {
                      importObj[key] = m;
                    });
                  }
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
          }
          else {
            throw new Error('Unknown module type "' + contentType + '"');
          }
        });
      }
      return instantiate.apply(this, arguments);
    };
  })(typeof self !== 'undefined' ? self : global);

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

    const load = this[REGISTRY][id] || (this[REGISTRY][id] = {
      id: id,
      i: [],
      h: false,
      d: [],
      e: null,
      er: undefined,
      E: undefined
    });

    if (load.e || load.E)
      return false;
    
    Object.assign(load, {
      n: ns,
      I: undefined,
      L: undefined,
      C: done
    });
    return ns;
  };

  systemJSPrototype.has = function (id) {
    const load = this[REGISTRY][id];
    return !!load;
  };

  // Delete function provided for hot-reloading use cases
  systemJSPrototype.delete = function (id) {
    const registry = this[REGISTRY];
    const load = registry[id];
    // in future we can support load.E case by failing load first
    // but that will require TLA callbacks to be implemented
    if (!load || load.e !== null || load.E)
      return false;

    let importerSetters = load.i;
    // remove from importerSetters
    // (release for gc)
    if (load.d)
      load.d.forEach(function (depLoad) {
        const importerIndex = depLoad.i.indexOf(load);
        if (importerIndex !== -1)
          depLoad.i.splice(importerIndex, 1);
      });
    delete registry[id];
    return function () {
      const load = registry[id];
      if (!load || !importerSetters || load.e !== null || load.E)
        return false;
      // add back the old setters
      importerSetters.forEach(function (setter) {
        load.i.push(setter);
        setter(load.n);
      });
      importerSetters = null;
    };
  };

  const iterator = typeof Symbol !== 'undefined' && Symbol.iterator;

  systemJSPrototype.entries = function () {
    const loader = this, keys = Object.keys(loader[REGISTRY]);
    let index = 0, ns, key;
    const result = {
      next: function () {
        while (
          (key = keys[index++]) !== undefined && 
          (ns = loader.get(key)) === undefined
        );
        return {
          done: key === undefined,
          value: key !== undefined && [key, ns]
        };
      }
    };

    result[iterator] = function() { return this };

    return result;
  };

}());
