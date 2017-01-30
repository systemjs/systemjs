import RegisterLoader from 'es-module-loader/core/register-loader.js';
import { warn, isBrowser, global, baseURI, CONFIG, METADATA, ModuleNamespace, emptyModule, isModule } from './common.js';

import { getConfig, getConfigItem, setConfig } from './config.js';
import { decanonicalize, normalize, normalizeSync } from './resolve.js';
import { instantiate, nodeRequire } from './instantiate.js';
import formatHelpers from './format-helpers.js';

export default SystemJSLoader;

var scriptSrc;

// Promise detection and error message
if (typeof Promise === 'undefined')
  throw new Error('SystemJS needs a Promise polyfill.');

if (typeof document !== 'undefined') {
  var scripts = document.getElementsByTagName('script');
  var curScript = scripts[scripts.length - 1];
  if (document.currentScript && (curScript.defer || curScript.async))
    curScript = document.currentScript;

  scriptSrc = curScript && curScript.src;
}
// worker
else if (typeof importScripts !== 'undefined') {
  try {
    throw new Error('_');
  }
  catch (e) {
    e.stack.replace(/(?:at|@).*(http.+):[\d]+:[\d]+/, function(m, url) {
      scriptSrc = url;
    });
  }
}
// node
else if (typeof __filename !== 'undefined') {
  scriptSrc = __filename;
}

function SystemJSLoader () {
  RegisterLoader.call(this);

  // NB deprecate
  this._loader = {};

  // internal metadata store
  this[METADATA] = {};

  // internal configuration
  this[CONFIG] = {
    baseURL: baseURI,
    paths: {},

    packageConfigPaths: [],
    packageConfigKeys: [],
    map: {},
    packages: {},
    depCache: {},
    meta: {},
    bundles: {},

    production: false,

    transpiler: undefined,
    loadedBundles: {},

    // global behaviour flags
    warnings: false,
    pluginFirst: false,

    // enable wasm loading and detection when supported
    wasm: false
  };

  // make the location of the system.js script accessible (if any)
  this.scriptSrc = scriptSrc;

  this._nodeRequire = nodeRequire;

  // support the empty module, as a concept
  this.registry.set('@empty', emptyModule);

  setProduction.call(this, false, false);

  // add module format helpers
  formatHelpers(this);
}

export var envModule;
export function setProduction (isProduction, isBuilder) {
  this[CONFIG].production = isProduction;
  this.registry.set('@system-env', envModule = this.newModule({
    browser: isBrowser,
    node: !!this._nodeRequire,
    production: !isBuilder && isProduction,
    dev: isBuilder || !isProduction,
    build: isBuilder,
    'default': true
  }));
}

SystemJSLoader.prototype = Object.create(RegisterLoader.prototype);

SystemJSLoader.prototype.constructor = SystemJSLoader;

// NB deprecate normalize
SystemJSLoader.prototype[SystemJSLoader.resolve = RegisterLoader.resolve] = SystemJSLoader.prototype.normalize = normalize;

SystemJSLoader.prototype.load = function (key, parentKey) {
  warn.call(this[CONFIG], 'System.load is deprecated.');
  return this.import(key, parentKey);
};

// NB deprecate decanonicalize, normalizeSync
SystemJSLoader.prototype.decanonicalize = SystemJSLoader.prototype.normalizeSync = SystemJSLoader.prototype.resolveSync = normalizeSync;

SystemJSLoader.prototype[SystemJSLoader.instantiate = RegisterLoader.instantiate] = instantiate;

SystemJSLoader.prototype.config = setConfig;
SystemJSLoader.prototype.getConfig = getConfig;

SystemJSLoader.prototype.global = global;

SystemJSLoader.prototype.import = function () {
  return RegisterLoader.prototype.import.apply(this, arguments)
  .then(function (m) {
    return m.__useDefault ? m.default: m;
  });
};

export var configNames = ['baseURL', 'map', 'paths', 'packages', 'packageConfigPaths', 'depCache', 'meta', 'bundles', 'transpiler', 'warnings', 'pluginFirst', 'production', 'wasm'];

var hasProxy = typeof Proxy !== 'undefined';
for (var i = 0; i < configNames.length; i++) (function (configName) {
  Object.defineProperty(SystemJSLoader.prototype, configName, {
    get: function () {
      var cfg = getConfigItem(this[CONFIG], configName);

      if (hasProxy && typeof cfg === 'object')
        cfg = new Proxy(cfg, {
          set: function (target, option) {
            throw new Error('Cannot set SystemJS.' + configName + '["' + option + '"] directly. Use SystemJS.config({ ' + configName + ': { "' + option + '": ... } }) rather.');
          }
        });

      //if (typeof cfg === 'object')
      //  warn.call(this[CONFIG], 'Referencing `SystemJS.' + configName + '` is deprecated. Use the config getter `SystemJS.getConfig(\'' + configName + '\')`');
      return cfg;
    },
    set: function (name) {
      throw new Error('Setting `SystemJS.' + configName + '` directly is no longer supported. Use `SystemJS.config({ ' + configName + ': ... })`.');
    }
  });
})(configNames[i]);

/*
 * Backwards-compatible registry API, to be deprecated
 */
function registryWarn(loader, method) {
  warn.call(loader[CONFIG], 'SystemJS.' + method + ' is deprecated for SystemJS.registry.' + method);
}
SystemJSLoader.prototype.delete = function (key) {
  registryWarn(this, 'delete');
  this.registry.delete(key);
};
SystemJSLoader.prototype.get = function (key) {
  registryWarn(this, 'get');
  return this.registry.get(key);
};
SystemJSLoader.prototype.has = function (key) {
  registryWarn(this, 'has');
  return this.registry.has(key);
};
SystemJSLoader.prototype.set = function (key, module) {
  registryWarn(this, 'set');
  return this.registry.set(key, module);
};
SystemJSLoader.prototype.newModule = function (bindings) {
  return new ModuleNamespace(bindings);
};
SystemJSLoader.prototype.isModule = isModule;

// ensure System.register and System.registerDynamic decanonicalize
SystemJSLoader.prototype.register = function (key, deps, declare) {
  if (typeof key === 'string')
    key = decanonicalize.call(this, this[CONFIG], key);
  return RegisterLoader.prototype.register.call(this, key, deps, declare);
};

SystemJSLoader.prototype.registerDynamic = function (key, deps, executingRequire, execute) {
  if (typeof key === 'string')
    key = decanonicalize.call(this, this[CONFIG], key);
  return RegisterLoader.prototype.registerDynamic.call(this, key, deps, executingRequire, execute);
};
