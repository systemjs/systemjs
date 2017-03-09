import { envModule, setProduction, configNames } from './systemjs-loader.js';
import { extend, prepend, warn, resolveIfNotPlain, baseURI, CONFIG } from './common.js';
import { coreResolve } from './resolve.js';

/*
 Extend config merging one deep only

  loader.config({
    some: 'random',
    config: 'here',
    deep: {
      config: { too: 'too' }
    }
  });

  <=>

  loader.some = 'random';
  loader.config = 'here'
  loader.deep = loader.deep || {};
  loader.deep.config = { too: 'too' };


  Normalizes meta and package configs allowing for:

  SystemJS.config({
    meta: {
      './index.js': {}
    }
  });

  To become

  SystemJS.meta['https://thissite.com/index.js'] = {};

  For easy normalization canonicalization with latest URL support.

*/
var envConfigNames = ['browserConfig', 'nodeConfig', 'devConfig', 'buildConfig', 'productionConfig'];
function envSet(loader, cfg, envCallback) {
  for (var i = 0; i < envConfigNames.length; i++) {
    var envConfig = envConfigNames[i];
    if (cfg[envConfig] && envModule[envConfig.substr(0, envConfig.length - 6)])
      envCallback(cfg[envConfig]);
  }
}

function cloneObj (obj, maxDepth) {
  var clone = {};
  for (var p in obj) {
    var prop = obj[p];
    if (maxDepth > 1) {
      if (prop instanceof Array)
        clone[p] = [].concat(prop);
      else if (typeof prop === 'object')
        clone[p] = cloneObj(prop, maxDepth - 1);
      else if (p !== 'packageConfig')
        clone[p] = prop;
    }
    else {
      clone[p] = prop;
    }
  }
  return clone;
}

export function getConfigItem (config, p) {
  var cfgItem = config[p];

  // getConfig must return an unmodifiable clone of the configuration
  if (cfgItem instanceof Array)
    return config[p].concat([]);
  else if (typeof cfgItem === 'object')
    return cloneObj(cfgItem, 3)
  else
    return config[p];
}

export function getConfig (configName) {
  if (configName) {
    if (configNames.indexOf(configName) !== -1)
      return getConfigItem(this[CONFIG], configName);
    throw new Error('"' + configName + '" is not a valid configuration name. Must be one of ' + configNames.join(', ') + '.');
  }

  var cfg = {};
  for (var i = 0; i < configNames.length; i++) {
    var p = configNames[i];
    var configItem = getConfigItem(this[CONFIG], p);
    if (configItem !== undefined)
      cfg[p] = configItem;
  }
  return cfg;
}

export function setConfig (cfg, isEnvConfig) {
  var loader = this;
  var config = this[CONFIG];

  if ('warnings' in cfg)
    config.warnings = cfg.warnings;

  if ('wasm' in cfg)
    config.wasm = typeof WebAssembly !== 'undefined' && cfg.wasm;

  if ('production' in cfg || 'build' in cfg)
    setProduction.call(loader, !!cfg.production, !!(cfg.build || envModule && envModule.build));

  if (!isEnvConfig) {
    // if using nodeConfig / browserConfig / productionConfig, take baseURL from there
    // these exceptions will be unnecessary when we can properly implement config queuings
    var baseURL;
    envSet(loader, cfg, function(cfg) {
      baseURL = baseURL || cfg.baseURL;
    });
    baseURL = baseURL || cfg.baseURL;

    // always configure baseURL first
    if (baseURL) {
      config.baseURL = resolveIfNotPlain(baseURL, baseURI) || resolveIfNotPlain('./' + baseURL, baseURI);
      if (config.baseURL[config.baseURL.length - 1] !== '/')
        config.baseURL += '/';
    }

    if (cfg.paths)
      extend(config.paths, cfg.paths);

    envSet(loader, cfg, function(cfg) {
      if (cfg.paths)
        extend(config.paths, cfg.paths);
    });

    for (var p in config.paths) {
      if (config.paths[p].indexOf('*') === -1)
        continue;
      warn.call(config, 'Path config ' + p + ' -> ' + config.paths[p] + ' is no longer supported as wildcards are deprecated.');
      delete config.paths[p];
    }
  }

  if (cfg.defaultJSExtensions)
    warn.call(config, 'The defaultJSExtensions configuration option is deprecated.\n  Use packages defaultExtension instead.', true);

  if (typeof cfg.pluginFirst === 'boolean')
    config.pluginFirst = cfg.pluginFirst;

  if (cfg.map) {
    for (var p in cfg.map) {
      var v = cfg.map[p];

      if (typeof v === 'string') {
        var mapped = coreResolve.call(loader, config, v, undefined, false, false);
        if (mapped[mapped.length -1] === '/' && p[p.length - 1] !== ':' && p[p.length - 1] !== '/')
          mapped = mapped.substr(0, mapped.length - 1);
        config.map[p] = mapped;
      }

      // object map
      else {
        var pkgName = coreResolve.call(loader, config, p[p.length - 1] !== '/' ? p + '/' : p, undefined, true, true);
        pkgName = pkgName.substr(0, pkgName.length - 1);

        var pkg = config.packages[pkgName];
        if (!pkg) {
          pkg = config.packages[pkgName] = createPackage();
          // use '' instead of false to keep type consistent
          pkg.defaultExtension = '';
        }
        setPkgConfig(pkg, { map: v }, pkgName, false, config);
      }
    }
  }

  if (cfg.packageConfigPaths) {
    var packageConfigPaths = [];
    for (var i = 0; i < cfg.packageConfigPaths.length; i++) {
      var path = cfg.packageConfigPaths[i];
      var packageLength = Math.max(path.lastIndexOf('*') + 1, path.lastIndexOf('/'));
      var normalized = coreResolve.call(loader, config, path.substr(0, packageLength), undefined, false, false);
      packageConfigPaths[i] = normalized + path.substr(packageLength);
    }
    config.packageConfigPaths = packageConfigPaths;
  }

  if (cfg.bundles) {
    for (var p in cfg.bundles) {
      var bundle = [];
      for (var i = 0; i < cfg.bundles[p].length; i++)
        bundle.push(loader.normalizeSync(cfg.bundles[p][i]));
      config.bundles[p] = bundle;
    }
  }

  if (cfg.packages) {
    for (var p in cfg.packages) {
      if (p.match(/^([^\/]+:)?\/\/$/))
        throw new TypeError('"' + p + '" is not a valid package name.');

      var pkgName = coreResolve.call(loader, config, p[p.length - 1] !== '/' ? p + '/' : p, undefined, true, true);
      pkgName = pkgName.substr(0, pkgName.length - 1);

      setPkgConfig(config.packages[pkgName] = config.packages[pkgName] || createPackage(), cfg.packages[p], pkgName, false, config);
    }
  }

  if (cfg.depCache) {
    for (var p in cfg.depCache)
      config.depCache[loader.normalizeSync(p)] = [].concat(cfg.depCache[p]);
  }

  if (cfg.meta) {
    for (var p in cfg.meta) {
      // base wildcard stays base
      if (p[0] === '*') {
        extend(config.meta[p] = config.meta[p] || {}, cfg.meta[p]);
      }
      else {
        var resolved = coreResolve.call(loader, config, p, undefined, true, true);
        extend(config.meta[resolved] = config.meta[resolved] || {}, cfg.meta[p]);
      }
    }
  }

  if ('transpiler' in cfg)
    config.transpiler = cfg.transpiler;


  // copy any remaining non-standard configuration properties
  for (var c in cfg) {
    if (configNames.indexOf(c) !== -1)
      continue;
    if (envConfigNames.indexOf(c) !== -1)
      continue;

    // warn.call(config, 'Setting custom config option `System.config({ ' + c + ': ... })` is deprecated. Avoid custom config options or set SystemJS.' + c + ' = ... directly.');
    loader[c] = cfg[c];
  }

  envSet(loader, cfg, function(cfg) {
    loader.config(cfg, true);
  });
}

export function createPackage () {
  return {
    defaultExtension: undefined,
    main: undefined,
    format: undefined,
    meta: undefined,
    map: undefined,
    packageConfig: undefined,
    configured: false
  };
}

// deeply-merge (to first level) config with any existing package config
export function setPkgConfig (pkg, cfg, pkgName, prependConfig, config) {
  for (var prop in cfg) {
    if (prop === 'main' || prop === 'format' || prop === 'defaultExtension' || prop === 'configured') {
      if (!prependConfig || pkg[prop] === undefined)
        pkg[prop] = cfg[prop];
    }
    else if (prop === 'map') {
      (prependConfig ? prepend : extend)(pkg.map = pkg.map || {}, cfg.map);
    }
    else if (prop === 'meta') {
      (prependConfig ? prepend : extend)(pkg.meta = pkg.meta || {}, cfg.meta);
    }
    else if (Object.hasOwnProperty.call(cfg, prop)) {
      warn.call(config, '"' + prop + '" is not a valid package configuration option in package ' + pkgName);
    }
  }

  // default defaultExtension for packages only
  if (pkg.defaultExtension === undefined)
    pkg.defaultExtension = 'js';

  if (pkg.main === undefined && pkg.map && pkg.map['.']) {
    pkg.main = pkg.map['.'];
    delete pkg.map['.'];
  }
  // main object becomes main map
  else if (typeof pkg.main === 'object') {
    pkg.map = pkg.map || {};
    pkg.map['./@main'] = pkg.main;
    pkg.main['default'] = pkg.main['default'] || './';
    pkg.main = '@main';
  }

  return pkg;
}
