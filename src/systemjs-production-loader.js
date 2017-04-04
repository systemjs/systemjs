import { ModuleNamespace } from 'es-module-loader/core/loader-polyfill.js';
import RegisterLoader from 'es-module-loader/core/register-loader.js';
import { global, baseURI, CONFIG, PLAIN_RESOLVE, PLAIN_RESOLVE_SYNC, resolveIfNotPlain, resolvedPromise,
    extend, emptyModule, applyPaths, scriptLoad, protectedCreateNamespace, getMapMatch, noop, preloadScript, isModule, isNode, checkInstantiateWasm } from './common.js';

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
    bundles: {},
    depCache: {},
    wasm: false
  };

  // support the empty module, as a concept
  this.registry.set('@empty', emptyModule);
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

systemJSPrototype.import = function () {
  return RegisterLoader.prototype.import.apply(this, arguments)
  .then(function (m) {
    return m.__useDefault ? m.default: m;
  });
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

  for (var p in cfg) {
    if (!Object.hasOwnProperty.call(cfg, p))
      continue;

    var val = cfg[p];

    switch (p) {
      case 'baseURL':
      case 'paths':
      case 'map':
      break;

      case 'bundles':
        for (var p in val) {
          if (!Object.hasOwnProperty.call(val, p))
            continue;
          var v = val[p];
          for (var i = 0; i < v.length; i++)
            config.bundles[this.resolveSync(v[i], undefined)] = p;
        }
      break;

      case 'depCache':
        for (var p in val) {
          if (!Object.hasOwnProperty.call(val, p))
            continue;
          var resolvedParent = this.resolveSync(p, undefined);
          config.depCache[resolvedParent] = (config.depCache[resolvedParent] || []).concat(val[p]);
        }
      break;

      case 'wasm':
        config.wasm = typeof WebAssembly !== 'undefined' && !!val;
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

  var bundles = {};
  for (var p in config.bundles) {
    if (!Object.hasOwnProperty.call(config.bundles, p))
      continue;
    bundles[p] = [].concat(config.bundles[p]);
  }

  return {
    baseURL: config.baseURL,
    paths: extend({}, config.paths),
    depCache: depCache,
    bundles: bundles,
    map: map,
    wasm: config.wasm
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
    return resolveIfNotPlain(target, parent) || target;
  }
}

function doScriptLoad (url, processAnonRegister) {
  return new Promise(function (resolve, reject) {
    return scriptLoad(url, 'anonymous', undefined, function () {
      processAnonRegister();
      resolve();
    }, reject);
  });
}

var loadedBundles = {};
function coreInstantiate (key, processAnonRegister) {
  var config = this[CONFIG];

  var wasm = config.wasm;

  var bundle = config.bundles[key];
  if (bundle) {
    var loader = this;
    var bundleUrl = loader.resolveSync(bundle, undefined);
    if (loader.registry.has(bundleUrl))
      return;
    return loadedBundles[bundleUrl] || (loadedBundles[bundleUrl] = doScriptLoad(bundleUrl, processAnonRegister).then(function () {
      // bundle treated itself as an empty module
      // this means we can reload bundles by deleting from the registry
      if (!loader.registry.has(bundleUrl))
        loader.registry.set(bundleUrl, loader.newModule({}));
      delete loadedBundles[bundleUrl];
    }));
  }

  var depCache = config.depCache[key];
  if (depCache) {
    var preloadFn = wasm ? fetch : preloadScript;
    for (var i = 0; i < depCache.length; i++)
      this.resolve(depCache[i], key).then(preloadFn);
  }

  if (wasm) {
    var loader = this;
    return fetch(key)
    .then(function(res) {
      if (res.ok)
        return res.arrayBuffer();
      else
        throw new Error('Fetch error: ' + res.status + ' ' + res.statusText);
    })
    .then(function (fetched) {
      return checkInstantiateWasm(loader, fetched, processAnonRegister)
      .then(function (wasmInstantiated) {
        if (wasmInstantiated)
          return;
        // not wasm -> convert buffer into utf-8 string to execute as a module
        // TextDecoder compatibility matches WASM currently. Need to keep checking this.
        // The TextDecoder interface is documented at http://encoding.spec.whatwg.org/#interface-textdecoder
        var source = new TextDecoder('utf-8').decode(new Uint8Array(fetched));
        (0, eval)(source + '\n//# sourceURL=' + key);
        processAnonRegister();
      });
    });
  }

  return doScriptLoad(key, processAnonRegister);
}
