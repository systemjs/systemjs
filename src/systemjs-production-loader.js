import { ModuleNamespace } from 'es-module-loader/core/loader-polyfill.js';
import RegisterLoader from 'es-module-loader/core/register-loader.js';
import { global, baseURI, CONFIG, PLAIN_RESOLVE, PLAIN_RESOLVE_SYNC, resolveIfNotPlain, resolvedPromise,
    extend, emptyModule, applyPaths, scriptLoad, getMapMatch, noop, preloadScript, isModule, isNode, isBrowser } from './common.js';
import { registerLastDefine, globalIterator, setAmdHelper } from './format-helpers.js';

export { ModuleNamespace }

export default SystemJSProductionLoader;

function SystemJSProductionLoader () {
  RegisterLoader.call(this);

  // internal configuration
  this[CONFIG] = {
    baseURL: baseURI,
    paths: {},
    map: {},
    submap: {},
    depCache: {}
  };

  setAmdHelper(this);
  if (isBrowser)
    global.define = this.amdDefine;
}

SystemJSProductionLoader.plainResolve = PLAIN_RESOLVE;
SystemJSProductionLoader.plainResolveSync = PLAIN_RESOLVE_SYNC;

var systemJSPrototype = SystemJSProductionLoader.prototype = Object.create(RegisterLoader.prototype);

systemJSPrototype.constructor = SystemJSProductionLoader;

systemJSPrototype[SystemJSProductionLoader.resolve = RegisterLoader.resolve] = function (key, parentKey) {
  var resolved = resolveIfNotPlain(key, parentKey || baseURI);
  if (resolved !== undefined)
    return Promise.resolve(resolved);

  // plain resolution
  var loader = this;
  return resolvedPromise
  .then(function () {
    return loader[PLAIN_RESOLVE](key, parentKey);
  })
  .then(function (resolved) {
    resolved = resolved || key;
    // if in the registry then we are done
    if (loader.registry.has(resolved))
      return resolved;

    // then apply paths
    // baseURL is fallback
    var config = loader[CONFIG];
    return applyPaths(config.baseURL, config.paths, resolved);
  });
};

systemJSPrototype.newModule = function (bindings) {
  return new ModuleNamespace(bindings);
};

systemJSPrototype.isModule = isModule;

systemJSPrototype.resolveSync = function (key, parentKey) {
  var resolved = resolveIfNotPlain(key, parentKey || baseURI);
  if (resolved !== undefined)
    return resolved;

  // plain resolution
  resolved = this[PLAIN_RESOLVE_SYNC](key, parentKey) || key;

  if (this.registry.has(resolved))
    return resolved;

  // then apply paths
  var config = this[CONFIG];
  return applyPaths(config.baseURL, config.paths, resolved);
};

systemJSPrototype[PLAIN_RESOLVE] = systemJSPrototype[PLAIN_RESOLVE_SYNC] = plainResolve;

systemJSPrototype[SystemJSProductionLoader.instantiate = RegisterLoader.instantiate] = coreInstantiate;

systemJSPrototype.config = function (cfg) {
  var config = this[CONFIG];

  if (cfg.baseURL) {
    config.baseURL = resolveIfNotPlain(cfg.baseURL, baseURI) || resolveIfNotPlain('./' + cfg.baseURL, baseURI);
    if (config.baseURL[config.baseURL.length - 1] !== '/')
      config.baseURL += '/';
  }

  if (cfg.paths)
    extend(config.paths, cfg.paths);

  if (cfg.map) {
    var val = cfg.map;
    for (var p in val) {
      if (!Object.hasOwnProperty.call(val, p))
        continue;

      var v = val[p];

      if (typeof v === 'string') {
        config.map[p] = v;
      }

      // object submap
      else {
        // normalize parent with URL and paths only
        var resolvedParent = resolveIfNotPlain(p, baseURI) || applyPaths(config.baseURL, config.paths, p);
        extend(config.submap[resolvedParent] || (config.submap[resolvedParent] = {}), v);
      }
    }
  }

  config.wasm = cfg.wasm === true;

  for (var p in cfg) {
    if (!Object.hasOwnProperty.call(cfg, p))
      continue;

    var val = cfg[p];

    switch (p) {
      case 'baseURL':
      case 'paths':
      case 'map':
      case 'wasm':
      break;

      case 'depCache':
        for (var p in val) {
          if (!Object.hasOwnProperty.call(val, p))
            continue;
          var resolvedParent = this.resolveSync(p, undefined);
          config.depCache[resolvedParent] = (config.depCache[resolvedParent] || []).concat(val[p]);
        }
      break;

      default:
        throw new TypeError('The SystemJS production build does not support the "' + p + '" configuration option.');
    }
  }
};

// getConfig configuration cloning
systemJSPrototype.getConfig = function (name) {
  var config = this[CONFIG];

  var map = {};
  extend(map, config.map);
  for (var p in config.submap) {
    if (!Object.hasOwnProperty.call(config.submap, p))
      continue;
    map[p] = extend({}, config.submap[p]);
  }

  var depCache = {};
  for (var p in config.depCache) {
    if (!Object.hasOwnProperty.call(config.depCache, p))
      continue;
    depCache[p] = [].concat(config.depCache[p]);
  }

  return {
    baseURL: config.baseURL,
    paths: extend({}, config.paths),
    depCache: depCache,
    map: map,
    wasm: config.wasm === true
  };
};

// ensure System.register and System.registerDynamic decanonicalize
systemJSPrototype.register = function (key, deps, declare) {
  if (typeof key === 'string')
    key = this.resolveSync(key, undefined);
  return RegisterLoader.prototype.register.call(this, key, deps, declare);
};

systemJSPrototype.registerDynamic = function (key, deps, executingRequire, execute) {
  if (typeof key === 'string')
    key = this.resolveSync(key, undefined);
  return RegisterLoader.prototype.registerDynamic.call(this, key, deps, executingRequire, execute);
};

function plainResolve (key, parentKey) {
  var config = this[CONFIG];

  // Apply contextual submap
  if (parentKey) {
    var parent = getMapMatch(config.submap, parentKey);
    var submap = config.submap[parent];
    var mapMatch = submap && getMapMatch(submap, key);

    if (mapMatch) {
      var target = submap[mapMatch] + key.substr(mapMatch.length);
      return resolveIfNotPlain(target, parent) || target;
    }
  }

  // Apply global map
  var map = config.map;
  var mapMatch = getMapMatch(map, key);

  if (mapMatch) {
    var target = map[mapMatch] + key.substr(mapMatch.length);
    return resolveIfNotPlain(target, parentKey || config.baseURL) || target;
  }
}

function instantiateWasm (loader, response, processAnonRegister) {
  return WebAssembly.compileStreaming(response).then(function (module) {
    var deps = [];
    var setters = [];
    var importObj = {};

    // we can only set imports if supported (eg early Safari doesnt support)
    if (WebAssembly.Module.imports)
      WebAssembly.Module.imports(module).forEach(function (i) {
        var key = i.module;
        setters.push(function (m) {
          importObj[key] = m;
        });
        if (deps.indexOf(key) === -1)
          deps.push(key);
      });

    loader.register(deps, function (_export) {
      return {
        setters: setters,
        execute: function () {
          _export(new WebAssembly.Instance(module, importObj).exports);
        }
      };
    });
    processAnonRegister();
  });
}

function doScriptLoad (loader, url, processAnonRegister) {
  // store a global snapshot in case it turns out to be global
  Object.keys(global).forEach(globalIterator, function (name, value) {
    globalSnapshot[name] = value;
  });

  return new Promise(function (resolve, reject) {
    return scriptLoad(url, 'anonymous', undefined, function () {

      // check for System.register call
      var registered = processAnonRegister();
      if (!registered) {
        // no System.register -> support named AMD as anonymous
        registerLastDefine(loader);
        registered = processAnonRegister();

        // still no registration -> attempt a global detection
        if (!registered) {
          var moduleValue = retrieveGlobal();
          loader.register([], function () {
            return {
              exports: moduleValue
            };
          });
          processAnonRegister();
        }
      }
      resolve();
    }, reject);
  });
}

function doEvalLoad (loader, url, source, processAnonRegister) {
  // store a global snapshot in case it turns out to be global
  Object.keys(global).forEach(globalIterator, function (name, value) {
    globalSnapshot[name] = value;
  });

  (0, eval)(source + '\n//# sourceURL=' + url);

  // check for System.register call
  var registered = processAnonRegister();
  if (!registered) {
    // no System.register -> support named AMD as anonymous
    registerLastDefine(loader);
    registered = processAnonRegister();

    // still no registration -> attempt a global detection
    if (!registered) {
      var moduleValue = retrieveGlobal();
      loader.register([], function () {
        return {
          exports: moduleValue
        };
      });
      processAnonRegister();
    }
  }
}

var globalSnapshot = {};
function retrieveGlobal () {
  var globalValue = { default: undefined };
  var multipleGlobals = false;
  var globalName = undefined;

  Object.keys(global).forEach(globalIterator, function (name, value) {
    if (globalSnapshot[name] === value)
      return;
    // update global snapshot as we go
    globalSnapshot[name] = value;

    if (value === undefined)
      return;

    if (multipleGlobals) {
      globalValue[name] = value;
    }
    else if (globalName) {
      if (globalValue.default !== value) {
        multipleGlobals = true;
        globalValue.__esModule = true;
        globalValue[globalName] = globalValue.default;
        globalValue[name] = value;
      }
    }
    else {
      globalValue.default = value;
      globalName = name;
    }
  });

  return globalValue;
}

function coreInstantiate (key, processAnonRegister) {
  var config = this[CONFIG];

  var depCache = config.depCache[key];
  if (depCache) {
    for (var i = 0; i < depCache.length; i++)
      this.resolve(depCache[i], key).then(preloadScript);
  }

  if (config.wasm) {
    var loader = this;
    return fetch(key)
    .then(function (res) {
      if (!res.ok)
        throw new Error('Fetch error: ' + res.status + ' ' + res.statusText);
      if (res.headers.get('content-type').indexOf('application/wasm') === -1) {
        return res.text()
        .then(function (source) {
          doEvalLoad(loader, key, source, processAnonRegister);
        });
      }
      return instantiateWasm(loader, res, processAnonRegister);
    });
  }

  return doScriptLoad(this, key, processAnonRegister);
}
