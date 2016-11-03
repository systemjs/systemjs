import { ModuleNamespace } from 'es-module-loader/core/loader-polyfill.js';
import RegisterLoader from 'es-module-loader/core/register-loader.js';
import { warn, nodeRequire, scriptSrc, isBrowser, global } from './common.js';

import { getConfig, setConfig } from './config.js';
import { coreResolve, normalize, normalizeSync } from './resolve.js';
import { instantiate } from './instantiate.js';
import formatHelpers from './format-helpers.js';

export default SystemJSLoader;

function SystemJSLoader (baseKey) {
  RegisterLoader.call(this, baseKey);

  // support baseURL
  this.baseURL = this.key;

  // configurations
  this.map = {};
  this.paths = {};
  this.packages = {};
  this.packageConfigPaths = [];
  this.depCache = {};
  this.meta = {};
  this.bundles = {};

  // internal state cache
  this._loader = {
    paths: {},
    loadedBundles: {}
  };

  // make the location of the system.js script accessible (if any)
  this.scriptSrc = scriptSrc;

  // global behaviour flags
  this.warnings = false;
  this.pluginFirst = false;

  this._nodeRequire = nodeRequire;

  // traceur is default transpiler
  this.transpiler = 'traceur';

  // support the empty module, as a concept
  this.set('@empty', this.newModule({}));

  setProduction.call(this, false, false);

  // add module format helpers
  formatHelpers(this);
}

export var envModule;
export function setProduction (isProduction, isBuilder) {
  this.set('@system-env', envModule = this.newModule({
    browser: isBrowser,
    node: !!this._nodeRequire,
    production: !isBuilder && isProduction,
    dev: isBuilder || !isProduction,
    build: isBuilder,
    'default': true
  }));
}

export var CREATE_METADATA = SystemJSLoader.createMetadata = RegisterLoader.createMetadata;
var RESOLVE = SystemJSLoader.resolve = RegisterLoader.resolve;
var INSTANTIATE = SystemJSLoader.instantiate = RegisterLoader.instantiate;

SystemJSLoader.prototype = Object.create(RegisterLoader.prototype);

SystemJSLoader.prototype.constructor = SystemJSLoader;

SystemJSLoader.prototype[CREATE_METADATA] = function () {
  return {
    registered: false,
    pluginName: undefined,
    pluginArgument: undefined,
    pluginModule: undefined,
    packageName: undefined,
    packageConfig: undefined,
    load: undefined
  };
};

SystemJSLoader.prototype[RESOLVE] = normalize;
SystemJSLoader.prototype.decanonicalize = SystemJSLoader.prototype.normalizeSync = normalizeSync;

SystemJSLoader.prototype[INSTANTIATE] = instantiate;

SystemJSLoader.prototype.config = setConfig;
SystemJSLoader.prototype.getConfig = getConfig;

SystemJSLoader.prototype.global = global;

/*
 * Backwards-compatible registry API, to be deprecated
 */
function registryWarn(loader, method) {
  warn.call(loader, 'SystemJS.' + method + ' is deprecated for SystemJS.registry.' + method);
}

SystemJSLoader.prototype.import = function () {
  return RegisterLoader.prototype.import.apply(this, arguments)
  .then(function (module) {
    return module.__useDefault ? module.default : module;
  });
};

SystemJSLoader.prototype.delete = function (moduleName) {
  registryWarn(this, 'delete');
  this.registry.delete(moduleName);
};
SystemJSLoader.prototype.get = function (moduleName) {
  registryWarn(this, 'get');
  return this.registry.get(moduleName);
};
SystemJSLoader.prototype.has = function (moduleName) {
  registryWarn(this, 'has');
  return this.registry.has(moduleName);
};
SystemJSLoader.prototype.set = function (moduleName, module) {
  registryWarn(this, 'set');
  return this.registry.set(moduleName, module);
};
SystemJSLoader.prototype.newModule = function (bindings) {
  return new ModuleNamespace(bindings);
};

// ensure System.register and System.registerDynamic decanonicalize
SystemJSLoader.prototype.register = function (key, deps, declare) {
  if (typeof key === 'string')
    key = coreResolve.call(this, key, undefined);
  return RegisterLoader.prototype.register.call(this, key, deps, declare);
};

SystemJSLoader.prototype.registerDynamic = function (key, deps, executingRequire, execute) {
  if (typeof key === 'string')
    key = coreResolve.call(this, key, undefined);
  return RegisterLoader.prototype.registerDynamic.call(this, key, deps, executingRequire, execute);
};
