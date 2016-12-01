import { ModuleNamespace } from 'es-module-loader/core/loader-polyfill.js';
import RegisterLoader from 'es-module-loader/core/register-loader.js';
import { global, baseURI, CONFIG, PLAIN_RESOLVE, PLAIN_RESOLVE_SYNC, resolveIfNotPlain, resolvedPromise,
    extend, emptyModule, applyPaths, scriptLoad, protectedCreateNamespace, getMapMatch, noop } from './common.js';

export { ModuleNamespace }

export default SystemJSProductionLoader;

function SystemJSProductionLoader () {
  RegisterLoader.call(this, baseURI);

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

  Object.defineProperty(this, 'baseURL', {
    get: function () {
      return this[CONFIG].baseURL
    }
  });

  // support the empty module, as a concept
  this.registry.set('@empty', emptyModule);
}

var RESOLVE = SystemJSProductionLoader.resolve = RegisterLoader.resolve;
var INSTANTIATE = SystemJSProductionLoader.instantiate = RegisterLoader.instantiate;
SystemJSProductionLoader.plainResolve = PLAIN_RESOLVE;
SystemJSProductionLoader.plainResolveSync = PLAIN_RESOLVE_SYNC;

var systemJSPrototype = SystemJSProductionLoader.prototype = Object.create(RegisterLoader.prototype);

systemJSPrototype.constructor = SystemJSProductionLoader;

systemJSPrototype[RESOLVE] = function (key, parentKey) {
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
    // then apply paths
    // baseURL is fallback
    return applyPaths(loader[CONFIG], resolved || key);
  });
};

systemJSPrototype.resolveSync = function (key, parentKey) {
  var resolved = resolveIfNotPlain(key, parentKey || baseURI);
  if (resolved !== undefined)
    return resolved;

  // plain resolution
  resolved = this[PLAIN_RESOLVE_SYNC](key, parentKey);

  // then apply paths
  return applyPaths(this[CONFIG], resolved || key);
};

systemJSPrototype[PLAIN_RESOLVE] = systemJSPrototype[PLAIN_RESOLVE_SYNC] = plainResolve;

systemJSPrototype[INSTANTIATE] = coreInstantiate;

systemJSPrototype.config = function (cfg) {
  var config = this[CONFIG];

  if (cfg.baseURL)
    config.baseURL = resolveIfNotPlain(cfg.baseURL, baseURI) || resolveIfNotPlain('./' + cfg.baseURL, baseURI);

  if (cfg.paths) {
    var val = cfg.paths;
    for (var p in val) {
      if (!Object.hasOwnProperty.call(val, p))
        continue;
      config.paths[p] = val[p];
    }
  }

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
        var resolvedParent = resolveIfNotPlain(p, baseURI) || applyPaths(config, p);
        var submap = config.submap[resolvedParent] || (config.submap[resolvedParent] = {});

        for (var s in v) {
          if (!Object.hasOwnProperty.call(v, s))
            continue;

          submap[s] = v[s];
        }
      }
    }
  }

  for (var p in cfg) {
    if (!Object.hasOwnProperty.call(cfg, p))
      continue;

    var val = cfg[p];

    switch (p) {
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
        config.wasm = !!val;
      break;

      default:
        throw new TypeError('The SystemJS production build does not support the "' + p + '" configuration option.');
    }
  }
};

// getConfig configuration cloning
/* systemJSPrototype.getConfig = function () {
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
    (bundles[config.bundles[p]] = bundles[config.bundles[p]] || []).push(p);
  }

  return {
    baseURL: config.baseURL,
    paths: extend({}, config.paths),
    depCache: depCache,
    bundles: cloneArrays(config.bundles),
    map: map,
    wasm: config.wasm
  };
}; */

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

function throwUninstantiated (key, wasm) {
  throw new Error('Module "' + key + '" is not a valid System.register ' + (wasm ? 'or WASM' : '') + 'source.');
}

function instantiateIfWasm (url) {
  return fetch(url)
  .then(function(res) {
    if (res.ok)
      return res.arrayBuffer();
    else
      throw new Error('Fetch error: ' + res.status + ' ' + res.statusText);
  })
  .then(function (fetched) {
    var bytes = new Uint8Array(fetched);
    // detect by leading bytes
    if (bytes[0] === 0 && bytes[1] === 97 && bytes[2] === 115) {
      return WebAssembly.compile(bytes).then(function (m) {
        /* TODO handle imports when `WebAssembly.Module.imports` is implemented
        if (WebAssembly.Module.imports) {
          var deps = [];
          var setters = [];
          var importObj = {};
          WebAssembly.Module.imports(m).forEach(function (i) {
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
                _export(new WebAssembly.Instance(m, importObj).exports);
              }
            };
          });
        }*/
        // for now we just load WASM without dependencies
        var wasmModule = new WebAssembly.Instance(m, {});
        return new ModuleNamespace(wasmModule.exports);
      });
    }

    // not wasm -> convert buffer into utf-8 string to execute as a module
    // TextDecoder compatibility matches WASM currently. Need to keep checking this.
    // The TextDecoder interface is documented at http://encoding.spec.whatwg.org/#interface-textdecoder
    return new TextDecoder('utf-8').decode(bytes);
  });
}

var supportsPreload = (function () {
  var relList = document.createElement('link').relList;
  if (relList && relList.supports) {
    try {
      return relList.supports('preload');
    }
    catch (e) {}
  }
  return false;
})();

function preloadScript (url) {
  if (supportsPreload) {
    var link = document.createElement('link');
    link.rel = 'preload';
    link.href = url;
    link.as = 'script';
    document.head.appendChild(link);
  }
  else {
    // lazy fallback is to parse and execute JS twice
    // because we are loading System.register, network time saving should
    // still beat the double parse cost
    // also System.register is supposed to be fully wrapped,
    // so there should be no double execution cost
    scriptLoad(url, 'anonymous', undefined, noop, noop);
  }
}

var loadedBundles = {};
function coreInstantiate (key, processAnonRegister) {
  var config = this[CONFIG];

  var wasm = config.wasm;

  var bundle = config.bundles[key];
  if (bundle) {
    var bundleUrl = this.resolveSync(bundle, undefined);
    return (loadedBundles[bundleUrl] || (loadedBundles[bundleUrl] = new Promise(function (resolve, reject) {
      return scriptLoad(bundleUrl, 'anonymous', undefined, resolve, reject);
    })))
    .then(function () {
      if (!processAnonRegister())
        throwUninstantiated(key, wasm);
    });
  }

  var depCache = config.depCache[key];
  if (depCache) {
    var preloadFn = wasm ? fetch : preloadScript;
    for (var i = 0; i < depCache.length; i++)
      this.resolve(depCache[i], key).then(preloadFn);
  }

  if (wasm)
    return instantiateIfWasm(key)
    .then(function (sourceOrModule) {
      if (typeof sourceOrModule !== 'string')
        return sourceOrModule;

      (0, eval)(sourceOrModule + '\n\/\/# sourceURL=' + key);

      if (!processAnonRegister())
        throwUninstantiated(key, wasm);
    });

  return new Promise(function (resolve, reject) {
    scriptLoad(key, 'anonymous', undefined, resolve, reject);
  })
  .then(function () {
    if (!processAnonRegister())
      throwUninstantiated(key, wasm);
  });
}
