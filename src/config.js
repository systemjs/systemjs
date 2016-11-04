import SystemJSLoader, { envModule, setProduction, CONFIG, configNames } from './systemjs-loader.js';
import { extend, warn, resolveUrlToParentIfNotPlain, baseURI } from './common.js';
import { coreResolve, normalizePaths } from './resolve.js';

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

function cloneObj (obj, depth) {
  var clone = {};
  for (var p in obj) {
    if (!obj.hasOwnProperty(p))
      continue;
    var prop = obj[p];
    if (depth > 1) {
      if (typeof prop === 'object')
        clone[p] = cloneObj(prop, depth - 1);
      else
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
    return cloneObj(cfgItem, p === 'packages' ? 3 : 1)
  else
    return config[p];
}

export function getConfig (configName) {
  if (configName) {
    if (configNames.indexOf(configName) !== -1)
      return getConfigItem.call(this[CONFIG], configName);
    throw new Error('"' + configName + '" is not a valid configuration name to get. Must be one of ' + configNames.join(', ') + '.');
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
      if (config.pathsLocked)
        warn.call(config, 'baseURL should be set before other config to avoid conflicts.');
      config.baseURL = resolveUrlToParentIfNotPlain(baseURL, baseURI) || resolveUrlToParentIfNotPlain('./' + baseURL, baseURI);
    }

    var pathsExtended = false;

    if (cfg.paths) {
      extend(config.paths, cfg.paths);
      pathsExtended = true;
    }

    envSet(loader, cfg, function(cfg) {
      if (cfg.paths) {
        extend(config.paths, cfg.paths);
        pathsExtended = true;
      }
    });

    // last pathing additions
    if (config.pathsLocked && pathsExtended) {
      // warn.call(config, 'paths should be set before other config to avoid conflicts.')
      normalizePaths(config);
    }
  }

  if (cfg.defaultJSExtensions)
    warn.call(config, 'The defaultJSExtensions configuration option has been removed, use packages configuration defaultExtension instead.', true);

  if (typeof cfg.pluginFirst === 'boolean')
    config.pluginFirst = cfg.pluginFirst;

  if (cfg.map) {
    for (var p in cfg.map) {
      var v = cfg.map[p];

      if (typeof v === 'string')
        config.map[p] = coreResolve.call(loader, config, v, undefined, false);

      // object map
      else
        setPkgConfig(loader, config, coreResolve.call(loader, config, p, undefined, true), { map: v }, false);
    }
  }

  if (cfg.packageConfigPaths) {
    var packageConfigPaths = [];
    for (var i = 0; i < cfg.packageConfigPaths.length; i++) {
      var path = cfg.packageConfigPaths[i];
      var packageLength = Math.max(path.lastIndexOf('*') + 1, path.lastIndexOf('/'));
      var normalized = coreResolve.call(loader, config, path.substr(0, packageLength), undefined, false);
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

      var prop = coreResolve.call(loader, config, p, undefined, true);

      // allow trailing slash in packages
      if (prop[prop.length - 1] === '/')
        prop = prop.substr(0, prop.length - 1);

      setPkgConfig(loader, config, prop, cfg.packages[p], false);
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
        var resolved = coreResolve.call(loader, config, p, undefined, true);
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

    config[c] = cfg[c];
  }

  envSet(loader, cfg, function(cfg) {
    loader.config(cfg, true);
  });
}


function extendPkgConfig (pkgCfgA, pkgCfgB, pkgName, loader, config, warnInvalidProperties) {
  for (var prop in pkgCfgB) {
    if (prop === 'main' || prop === 'format' || prop === 'defaultExtension') {
      pkgCfgA[prop] = pkgCfgB[prop];
    }
    else if (prop === 'map') {
      extend(pkgCfgA.map = pkgCfgA.map || {}, pkgCfgB.map);
    }
    else if (prop === 'meta') {
      extend(pkgCfgA.meta = pkgCfgA.meta || {}, pkgCfgB.meta);
    }
    else if (prop === 'depCache') {
      for (var d in pkgCfgB.depCache) {
        var dNormalized;

        if (d.substr(0, 2) == './')
          dNormalized = pkgName + '/' + d.substr(2);
        else
          dNormalized = coreResolve.call(loader, config, d);
        config.depCache[dNormalized] = (config.depCache[dNormalized] || []).concat(pkgCfgB.depCache[d]);
      }
    }
    else if (warnInvalidProperties && envConfigNames.indexOf(prop) === -1 && pkgCfgB.hasOwnProperty(prop)) {
      warn.call(config, '"' + prop + '" is not a valid package configuration option in package ' + pkgName);
    }
  }
}

// deeply-merge (to first level) config with any existing package config
export function setPkgConfig (loader, config, pkgName, cfg, prependConfig) {
  var pkg;

  // first package is config by reference for fast path, cloned after that
  if (!config.packages[pkgName]) {
    pkg = config.packages[pkgName] = cfg;
  }
  else {
    var basePkg = config.packages[pkgName];
    pkg = config.packages[pkgName] = {};

    extendPkgConfig(pkg, prependConfig ? cfg : basePkg, pkgName, loader, config, prependConfig);
    extendPkgConfig(pkg, prependConfig ? basePkg : cfg, pkgName, loader, config, !prependConfig);
  }

  if (!('main' in pkg) && pkg.map && pkg.map['.']) {
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
