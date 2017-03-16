import RegisterLoader from 'es-module-loader/core/register-loader.js';
import { getMapMatch, readMemberExpression, extendMeta, addToError, resolveIfNotPlain,
    baseURI, CONFIG, METADATA, applyPaths, resolvedPromise, getPackage } from './common.js';
import { setPkgConfig, createPackage } from './config.js';
import fetch from './fetch.js';

export function createMetadata () {
  return {
    pluginKey: undefined,
    pluginArgument: undefined,
    pluginModule: undefined,
    packageKey: undefined,
    packageConfig: undefined,
    load: undefined
  };
}

function getCoreParentMetadata (loader, config, parentKey) {
  var parentMetadata = createMetadata();

  if (parentKey) {
    // detect parent plugin
    // we just need pluginKey to be truthy for package configurations
    // so we duplicate it as pluginArgument - although not correct its not used
    var parentPluginIndex;
    if (config.pluginFirst) {
      if ((parentPluginIndex = parentKey.lastIndexOf('!')) !== -1)
        parentMetadata.pluginArgument = parentMetadata.pluginKey = parentKey.substr(0, parentPluginIndex);
    }
    else {
      if ((parentPluginIndex = parentKey.indexOf('!')) !== -1)
        parentMetadata.pluginArgument = parentMetadata.pluginKey = parentKey.substr(parentPluginIndex + 1);
    }
  }

  return parentMetadata;
}

function getParentMetadata (loader, config, parentKey) {
  var parentMetadata = createMetadata();

  if (parentKey) {
    // detect parent plugin
    // we just need pluginKey to be truthy for package configurations
    // so we duplicate it as pluginArgument - although not correct its not used
    var parentPluginIndex;
    if (config.pluginFirst) {
      if ((parentPluginIndex = parentKey.lastIndexOf('!')) !== -1)
        parentMetadata.pluginArgument = parentMetadata.pluginKey = parentKey.substr(0, parentPluginIndex);
    }
    else {
      if ((parentPluginIndex = parentKey.indexOf('!')) !== -1)
        parentMetadata.pluginArgument = parentMetadata.pluginKey = parentKey.substr(parentPluginIndex + 1);
    }

    // detect parent package
    parentMetadata.packageKey = getMapMatch(config.packages, parentKey);
    if (parentMetadata.packageKey)
      parentMetadata.packageConfig = config.packages[parentMetadata.packageKey];
  }

  return parentMetadata;
}

export function normalize (key, parentKey) {
  var config = this[CONFIG];

  var metadata = createMetadata();
  var parentMetadata = getParentMetadata(this, config, parentKey);

  var loader = this;

  return Promise.resolve()

  // boolean conditional
  .then(function () {
    // first we normalize the conditional
    var booleanIndex = key.lastIndexOf('#?');

    if (booleanIndex === -1)
      return Promise.resolve(key);

    var conditionObj = parseCondition.call(loader, key.substr(booleanIndex + 2));

    // in builds, return normalized conditional
    /*if (this.builder)
      return this.resolve(conditionObj.module, parentKey)
      .then(function (conditionModule) {
        conditionObj.module = conditionModule;
        return key.substr(0, booleanIndex) + '#?' + serializeCondition(conditionObj);
      });*/

    return resolveCondition.call(loader, conditionObj, parentKey, true)
    .then(function (conditionValue) {
      return conditionValue ? key.substr(0, booleanIndex) : '@empty';
    });
  })

  // plugin
  .then(function (key) {
    var parsed = parsePlugin(config.pluginFirst, key);

    if (!parsed)
      return packageResolve.call(loader, config, key, parentMetadata && parentMetadata.pluginArgument || parentKey, metadata, parentMetadata, false);

    metadata.pluginKey = parsed.plugin;

    return Promise.all([
      packageResolve.call(loader, config, parsed.argument, parentMetadata && parentMetadata.pluginArgument || parentKey, metadata, parentMetadata, true),
      loader.resolve(parsed.plugin, parentKey)
    ])
    .then(function (normalized) {
      metadata.pluginArgument = normalized[0];
      metadata.pluginKey = normalized[1];

      // don't allow a plugin to load itself
      if (metadata.pluginArgument === metadata.pluginKey)
        throw new Error('Plugin ' + metadata.pluginArgument + ' cannot load itself, make sure it is excluded from any wildcard meta configuration via a custom loader: false rule.');

      return combinePluginParts(config.pluginFirst, normalized[0], normalized[1]);
    });
  })
  .then(function (normalized) {
    return interpolateConditional.call(loader, normalized, parentKey, parentMetadata);
  })
  .then(function (normalized) {
    setMeta.call(loader, config, normalized, metadata);

    if (metadata.pluginKey || !metadata.load.loader)
      return normalized;

    // loader by configuration
    // normalizes to parent to support package loaders
    return loader.resolve(metadata.load.loader, normalized)
    .then(function (pluginKey) {
      metadata.pluginKey = pluginKey;
      metadata.pluginArgument = normalized;
      return normalized;
    });
  })
  .then(function (normalized) {
    loader[METADATA][normalized] = metadata;
    return normalized;
  });
}

// normalization function used for registry keys
// just does coreResolve without map
export function decanonicalize (config, key) {
  var parsed = parsePlugin(config.pluginFirst, key);

  // plugin
  if (parsed) {
    var pluginKey = decanonicalize.call(this, config, parsed.plugin);
    return combinePluginParts(config.pluginFirst, coreResolve.call(this, config, parsed.argument, undefined, false, false), pluginKey);
  }

  return coreResolve.call(this, config, key, undefined, false, false);
}

export function normalizeSync (key, parentKey) {
  var config = this[CONFIG];

  // normalizeSync is metadataless, so create metadata
  var metadata = createMetadata();
  var parentMetadata = parentMetadata || getParentMetadata(this, config, parentKey);

  var parsed = parsePlugin(config.pluginFirst, key);

  // plugin
  if (parsed) {
    metadata.pluginKey = normalizeSync.call(this, parsed.plugin, parentKey);
    return combinePluginParts(config.pluginFirst,
        packageResolveSync.call(this, config, parsed.argument, parentMetadata.pluginArgument || parentKey, metadata, parentMetadata, !!metadata.pluginKey),
        metadata.pluginKey);
  }

  return packageResolveSync.call(this, config, key, parentMetadata.pluginArgument || parentKey, metadata, parentMetadata, !!metadata.pluginKey);
}

export function coreResolve (config, key, parentKey, doMap, packageName) {
  var relativeResolved = resolveIfNotPlain(key, parentKey || baseURI);

  // standard URL resolution
  if (relativeResolved)
    return applyPaths(config.baseURL, config.paths, relativeResolved);

  // plain keys not starting with './', 'x://' and '/' go through custom resolution
  if (doMap) {
    var mapMatch = getMapMatch(config.map, key);

    if (mapMatch) {
      key = config.map[mapMatch] + key.substr(mapMatch.length);

      relativeResolved = resolveIfNotPlain(key, baseURI);
      if (relativeResolved)
        return applyPaths(config.baseURL, config.paths, relativeResolved);
    }
  }

  if (this.registry.has(key))
    return key;

  if (key.substr(0, 6) === '@node/')
    return key;

  var trailingSlash = packageName && key[key.length - 1] !== '/';
  var resolved = applyPaths(config.baseURL, config.paths, trailingSlash ? key + '/' : key);
  if (trailingSlash)
    return resolved.substr(0, resolved.length - 1);
  return resolved;
}

function packageResolveSync (config, key, parentKey, metadata, parentMetadata, skipExtensions) {
  // ignore . since internal maps handled by standard package resolution
  if (parentMetadata && parentMetadata.packageConfig && key[0] !== '.') {
    var parentMap = parentMetadata.packageConfig.map;
    var parentMapMatch = parentMap && getMapMatch(parentMap, key);

    if (parentMapMatch && typeof parentMap[parentMapMatch] === 'string') {
      var mapped = doMapSync(this, config, parentMetadata.packageConfig, parentMetadata.packageKey, parentMapMatch, key, metadata, skipExtensions);
      if (mapped)
        return mapped;
    }
  }

  var normalized = coreResolve.call(this, config, key, parentKey, true, true);

  var pkgConfigMatch = getPackageConfigMatch(config, normalized);
  metadata.packageKey = pkgConfigMatch && pkgConfigMatch.packageKey || getMapMatch(config.packages, normalized);

  if (!metadata.packageKey)
    return normalized;

  if (config.packageConfigKeys.indexOf(normalized) !== -1) {
    metadata.packageKey = undefined;
    return normalized;
  }

  metadata.packageConfig = config.packages[metadata.packageKey] || (config.packages[metadata.packageKey] = createPackage());

  var subPath = normalized.substr(metadata.packageKey.length + 1);

  return applyPackageConfigSync(this, config, metadata.packageConfig, metadata.packageKey, subPath, metadata, skipExtensions);
}

function packageResolve (config, key, parentKey, metadata, parentMetadata, skipExtensions) {
  var loader = this;

  return resolvedPromise
  .then(function () {
    // ignore . since internal maps handled by standard package resolution
    if (parentMetadata && parentMetadata.packageConfig && key.substr(0, 2) !== './') {
      var parentMap = parentMetadata.packageConfig.map;
      var parentMapMatch = parentMap && getMapMatch(parentMap, key);

      if (parentMapMatch)
        return doMap(loader, config, parentMetadata.packageConfig, parentMetadata.packageKey, parentMapMatch, key, metadata, skipExtensions);
    }

    return resolvedPromise;
  })
  .then(function (mapped) {
    if (mapped)
      return mapped;

    // apply map, core, paths, contextual package map
    var normalized = coreResolve.call(loader, config, key, parentKey, true, true);

    var pkgConfigMatch = getPackageConfigMatch(config, normalized);
    metadata.packageKey = pkgConfigMatch && pkgConfigMatch.packageKey || getMapMatch(config.packages, normalized);

    if (!metadata.packageKey)
      return Promise.resolve(normalized);

    if (config.packageConfigKeys.indexOf(normalized) !== -1) {
      metadata.packageKey = undefined;
      metadata.load = createMeta();
      metadata.load.format = 'json';
      // ensure no loader
      metadata.load.loader = '';
      return Promise.resolve(normalized);
    }

    metadata.packageConfig = config.packages[metadata.packageKey] || (config.packages[metadata.packageKey] = createPackage());

    // load configuration when it matches packageConfigPaths, not already configured, and not the config itself
    var loadConfig = pkgConfigMatch && !metadata.packageConfig.configured;

    return (loadConfig ? loadPackageConfigPath(loader, config, pkgConfigMatch.configPath, metadata) : resolvedPromise)
    .then(function () {
      var subPath = normalized.substr(metadata.packageKey.length + 1);

      return applyPackageConfig(loader, config, metadata.packageConfig, metadata.packageKey, subPath, metadata, skipExtensions);
    });
  });
}

function createMeta () {
  return {
    extension: '',
    deps: undefined,
    format: undefined,
    loader: undefined,
    scriptLoad: undefined,
    globals: undefined,
    nonce: undefined,
    integrity: undefined,
    sourceMap: undefined,
    exports: undefined,
    encapsulateGlobal: false,
    crossOrigin: undefined,
    cjsRequireDetection: true,
    cjsDeferDepsExecute: false,
    esModule: false
  };
}

function setMeta (config, key, metadata) {
  metadata.load = metadata.load || createMeta();

  // apply wildcard metas
  var bestDepth = 0;
  var wildcardIndex;
  for (var module in config.meta) {
    wildcardIndex = module.indexOf('*');
    if (wildcardIndex === -1)
      continue;
    if (module.substr(0, wildcardIndex) === key.substr(0, wildcardIndex)
        && module.substr(wildcardIndex + 1) === key.substr(key.length - module.length + wildcardIndex + 1)) {
      var depth = module.split('/').length;
      if (depth > bestDepth)
        bestDepth = depth;
      extendMeta(metadata.load, config.meta[module], bestDepth !== depth);
    }
  }

  // apply exact meta
  if (config.meta[key])
    extendMeta(metadata.load, config.meta[key], false);

  // apply package meta
  if (metadata.packageKey) {
    var subPath = key.substr(metadata.packageKey.length + 1);

    var meta = {};
    if (metadata.packageConfig.meta) {
      var bestDepth = 0;
      getMetaMatches(metadata.packageConfig.meta, subPath, function (metaPattern, matchMeta, matchDepth) {
        if (matchDepth > bestDepth)
          bestDepth = matchDepth;
        extendMeta(meta, matchMeta, matchDepth && bestDepth > matchDepth);
      });

      extendMeta(metadata.load, meta, false);
    }

    // format
    if (metadata.packageConfig.format && !metadata.pluginKey && !metadata.load.loader)
      metadata.load.format = metadata.load.format || metadata.packageConfig.format;
  }
}

function parsePlugin (pluginFirst, key) {
  var argumentKey;
  var pluginKey;

  var pluginIndex = pluginFirst ? key.indexOf('!') : key.lastIndexOf('!');

  if (pluginIndex === -1)
    return;

  if (pluginFirst) {
    argumentKey = key.substr(pluginIndex + 1);
    pluginKey = key.substr(0, pluginIndex);
  }
  else {
    argumentKey = key.substr(0, pluginIndex);
    pluginKey = key.substr(pluginIndex + 1) || argumentKey.substr(argumentKey.lastIndexOf('.') + 1);
  }

  return {
    argument: argumentKey,
    plugin: pluginKey
  };
}

// put key back together after parts have been normalized
function combinePluginParts (pluginFirst, argumentKey, pluginKey) {
  if (pluginFirst)
    return pluginKey + '!' + argumentKey;
  else
    return argumentKey + '!' + pluginKey;
}

/*
 * Package Configuration Extension
 *
 * Example:
 *
 * SystemJS.packages = {
 *   jquery: {
 *     main: 'index.js', // when not set, package key is requested directly
 *     format: 'amd',
 *     defaultExtension: 'ts', // defaults to 'js', can be set to false
 *     modules: {
 *       '*.ts': {
 *         loader: 'typescript'
 *       },
 *       'vendor/sizzle.js': {
 *         format: 'global'
 *       }
 *     },
 *     map: {
 *        // map internal require('sizzle') to local require('./vendor/sizzle')
 *        sizzle: './vendor/sizzle.js',
 *        // map any internal or external require of 'jquery/vendor/another' to 'another/index.js'
 *        './vendor/another.js': './another/index.js',
 *        // test.js / test -> lib/test.js
 *        './test.js': './lib/test.js',
 *
 *        // environment-specific map configurations
 *        './index.js': {
 *          '~browser': './index-node.js',
 *          './custom-condition.js|~export': './index-custom.js'
 *        }
 *     },
 *     // allows for setting package-prefixed depCache
 *     // keys are normalized module keys relative to the package itself
 *     depCache: {
 *       // import 'package/index.js' loads in parallel package/lib/test.js,package/vendor/sizzle.js
 *       './index.js': ['./test'],
 *       './test.js': ['external-dep'],
 *       'external-dep/path.js': ['./another.js']
 *     }
 *   }
 * };
 *
 * Then:
 *   import 'jquery'                       -> jquery/index.js
 *   import 'jquery/submodule'             -> jquery/submodule.js
 *   import 'jquery/submodule.ts'          -> jquery/submodule.ts loaded as typescript
 *   import 'jquery/vendor/another'        -> another/index.js
 *
 * Detailed Behaviours
 * - main can have a leading "./" can be added optionally
 * - map and defaultExtension are applied to the main
 * - defaultExtension adds the extension only if the exact extension is not present

 * - if a meta value is available for a module, map and defaultExtension are skipped
 * - like global map, package map also applies to subpaths (sizzle/x, ./vendor/another/sub)
 * - condition module map is '@env' module in package or '@system-env' globally
 * - map targets support conditional interpolation ('./x': './x.#{|env}.js')
 * - internal package map targets cannot use boolean conditionals
 *
 * Package Configuration Loading
 *
 * Not all packages may already have their configuration present in the System config
 * For these cases, a list of packageConfigPaths can be provided, which when matched against
 * a request, will first request a ".json" file by the package key to derive the package
 * configuration from. This allows dynamic loading of non-predetermined code, a key use
 * case in SystemJS.
 *
 * Example:
 *
 *   SystemJS.packageConfigPaths = ['packages/test/package.json', 'packages/*.json'];
 *
 *   // will first request 'packages/new-package/package.json' for the package config
 *   // before completing the package request to 'packages/new-package/path'
 *   SystemJS.import('packages/new-package/path');
 *
 *   // will first request 'packages/test/package.json' before the main
 *   SystemJS.import('packages/test');
 *
 * When a package matches packageConfigPaths, it will always send a config request for
 * the package configuration.
 * The package key itself is taken to be the match up to and including the last wildcard
 * or trailing slash.
 * The most specific package config path will be used.
 * Any existing package configurations for the package will deeply merge with the
 * package config, with the existing package configurations taking preference.
 * To opt-out of the package configuration request for a package that matches
 * packageConfigPaths, use the { configured: true } package config option.
 *
 */

function addDefaultExtension (config, pkg, pkgKey, subPath, skipExtensions) {
  // don't apply extensions to folders or if defaultExtension = false
  if (!subPath || !pkg.defaultExtension || subPath[subPath.length - 1] === '/' || skipExtensions)
    return subPath;

  var metaMatch = false;

  // exact meta or meta with any content after the last wildcard skips extension
  if (pkg.meta)
    getMetaMatches(pkg.meta, subPath, function (metaPattern, matchMeta, matchDepth) {
      if (matchDepth === 0 || metaPattern.lastIndexOf('*') !== metaPattern.length - 1)
        return metaMatch = true;
    });

  // exact global meta or meta with any content after the last wildcard skips extension
  if (!metaMatch && config.meta)
    getMetaMatches(config.meta, pkgKey + '/' + subPath, function (metaPattern, matchMeta, matchDepth) {
      if (matchDepth === 0 || metaPattern.lastIndexOf('*') !== metaPattern.length - 1)
        return metaMatch = true;
    });

  if (metaMatch)
    return subPath;

  // work out what the defaultExtension is and add if not there already
  var defaultExtension = '.' + pkg.defaultExtension;
  if (subPath.substr(subPath.length - defaultExtension.length) !== defaultExtension)
    return subPath + defaultExtension;
  else
    return subPath;
}

function applyPackageConfigSync (loader, config, pkg, pkgKey, subPath, metadata, skipExtensions) {
  // main
  if (!subPath) {
    if (pkg.main)
      subPath = pkg.main.substr(0, 2) === './' ? pkg.main.substr(2) : pkg.main;
    else
      // also no submap if key is package itself (import 'pkg' -> 'path/to/pkg.js')
      // NB can add a default package main convention here
      // if it becomes internal to the package then it would no longer be an exit path
      return pkgKey;
  }

  // map config checking without then with extensions
  if (pkg.map) {
    var mapPath = './' + subPath;

    var mapMatch = getMapMatch(pkg.map, mapPath);

    // we then check map with the default extension adding
    if (!mapMatch) {
      mapPath = './' + addDefaultExtension(loader, pkg, pkgKey, subPath, skipExtensions);
      if (mapPath !== './' + subPath)
        mapMatch = getMapMatch(pkg.map, mapPath);
    }
    if (mapMatch) {
      var mapped = doMapSync(loader, config, pkg, pkgKey, mapMatch, mapPath, metadata, skipExtensions);
      if (mapped)
        return mapped;
    }
  }

  // normal package resolution
  return pkgKey + '/' + addDefaultExtension(loader, pkg, pkgKey, subPath, skipExtensions);
}

function validMapping (mapMatch, mapped, path) {
  // allow internal ./x -> ./x/y or ./x/ -> ./x/y recursive maps
  // but only if the path is exactly ./x and not ./x/z
  if (mapped.substr(0, mapMatch.length) === mapMatch && path.length > mapMatch.length)
    return false;

  return true;
}

function doMapSync (loader, config, pkg, pkgKey, mapMatch, path, metadata, skipExtensions) {
  if (path[path.length - 1] === '/')
    path = path.substr(0, path.length - 1);
  var mapped = pkg.map[mapMatch];

  if (typeof mapped === 'object')
    throw new Error('Synchronous conditional normalization not supported sync normalizing ' + mapMatch + ' in ' + pkgKey);

  if (!validMapping(mapMatch, mapped, path) || typeof mapped !== 'string')
    return;

  return packageResolveSync.call(this, config, mapped + path.substr(mapMatch.length), pkgKey + '/', metadata, metadata, skipExtensions);
}

function applyPackageConfig (loader, config, pkg, pkgKey, subPath, metadata, skipExtensions) {
  // main
  if (!subPath) {
    if (pkg.main)
      subPath = pkg.main.substr(0, 2) === './' ? pkg.main.substr(2) : pkg.main;
    // also no submap if key is package itself (import 'pkg' -> 'path/to/pkg.js')
    else
      // NB can add a default package main convention here
      // if it becomes internal to the package then it would no longer be an exit path
      return Promise.resolve(pkgKey);
  }

  // map config checking without then with extensions
  var mapPath, mapMatch;

  if (pkg.map) {
    mapPath = './' + subPath;
    mapMatch = getMapMatch(pkg.map, mapPath);

    // we then check map with the default extension adding
    if (!mapMatch) {
      mapPath = './' + addDefaultExtension(loader, pkg, pkgKey, subPath, skipExtensions);
      if (mapPath !== './' + subPath)
        mapMatch = getMapMatch(pkg.map, mapPath);
    }
  }

  return (mapMatch ? doMap(loader, config, pkg, pkgKey, mapMatch, mapPath, metadata, skipExtensions) : resolvedPromise)
  .then(function (mapped) {
    if (mapped)
      return Promise.resolve(mapped);

    // normal package resolution / fallback resolution for no conditional match
    return Promise.resolve(pkgKey + '/' + addDefaultExtension(loader, pkg, pkgKey, subPath, skipExtensions));
  });
}

function doMap (loader, config, pkg, pkgKey, mapMatch, path, metadata, skipExtensions) {
  if (path[path.length - 1] === '/')
    path = path.substr(0, path.length - 1);

  var mapped = pkg.map[mapMatch];

  if (typeof mapped === 'string') {
    if (!validMapping(mapMatch, mapped, path))
      return resolvedPromise;
    return packageResolve.call(loader, config, mapped + path.substr(mapMatch.length), pkgKey + '/', metadata, metadata, skipExtensions)
    .then(function (normalized) {
      return interpolateConditional.call(loader, normalized, pkgKey + '/', metadata);
    });
  }

  // we use a special conditional syntax to allow the builder to handle conditional branch points further
  /*if (loader.builder)
    return Promise.resolve(pkgKey + '/#:' + path);*/

  // we load all conditions upfront
  var conditionPromises = [];
  var conditions = [];
  for (var e in mapped) {
    var c = parseCondition(e);
    conditions.push({
      condition: c,
      map: mapped[e]
    });
    conditionPromises.push(RegisterLoader.prototype.import.call(loader, c.module, pkgKey));
  }

  // map object -> conditional map
  return Promise.all(conditionPromises)
  .then(function (conditionValues) {
    // first map condition to match is used
    for (var i = 0; i < conditions.length; i++) {
      var c = conditions[i].condition;
      var value = readMemberExpression(c.prop, conditionValues[i].__useDefault ? conditionValues[i].default : conditionValues[i]);
      if (!c.negate && value || c.negate && !value)
        return conditions[i].map;
    }
  })
  .then(function (mapped) {
    if (mapped) {
      if (!validMapping(mapMatch, mapped, path))
        return resolvedPromise;
      return packageResolve.call(loader, config, mapped + path.substr(mapMatch.length), pkgKey + '/', metadata, metadata, skipExtensions)
      .then(function (normalized) {
        return interpolateConditional.call(loader, normalized, pkgKey + '/', metadata);
      });
    }

    // no environment match -> fallback to original subPath by returning undefined
  });
}

// check if the given normalized key matches a packageConfigPath
// if so, loads the config
var packageConfigPaths = {};

// data object for quick checks against package paths
function createPkgConfigPathObj (path) {
  var lastWildcard = path.lastIndexOf('*');
  var length = Math.max(lastWildcard + 1, path.lastIndexOf('/'));
  return {
    length: length,
    regEx: new RegExp('^(' + path.substr(0, length).replace(/[.+?^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '[^\\/]+') + ')(\\/|$)'),
    wildcard: lastWildcard !== -1
  };
}

// most specific match wins
function getPackageConfigMatch (config, normalized) {
  var pkgKey, exactMatch = false, configPath;
  for (var i = 0; i < config.packageConfigPaths.length; i++) {
    var packageConfigPath = config.packageConfigPaths[i];
    var p = packageConfigPaths[packageConfigPath] || (packageConfigPaths[packageConfigPath] = createPkgConfigPathObj(packageConfigPath));
    if (normalized.length < p.length)
      continue;
    var match = normalized.match(p.regEx);
    if (match && (!pkgKey || (!(exactMatch && p.wildcard) && pkgKey.length < match[1].length))) {
      pkgKey = match[1];
      exactMatch = !p.wildcard;
      configPath = pkgKey + packageConfigPath.substr(p.length);
    }
  }

  if (!pkgKey)
    return;

  return {
    packageKey: pkgKey,
    configPath: configPath
  };
}

function loadPackageConfigPath (loader, config, pkgConfigPath, metadata, normalized) {
  var configLoader = loader.pluginLoader || loader;

  // ensure we note this is a package config file path
  // it will then be skipped from getting other normalizations itself to ensure idempotency
  if (config.packageConfigKeys.indexOf(pkgConfigPath) === -1)
    config.packageConfigKeys.push(pkgConfigPath);

  return configLoader.import(pkgConfigPath)
  .then(function (pkgConfig) {
    setPkgConfig(metadata.packageConfig, pkgConfig, metadata.packageKey, true, config);
    metadata.packageConfig.configured = true;
  })
  .catch(function (err) {
    throw addToError(err, 'Unable to fetch package configuration file ' + pkgConfigPath);
  });
}

function getMetaMatches (pkgMeta, subPath, matchFn) {
  // wildcard meta
  var wildcardIndex;
  for (var module in pkgMeta) {
    // allow meta to start with ./ for flexibility
    var dotRel = module.substr(0, 2) === './' ? './' : '';
    if (dotRel)
      module = module.substr(2);

    wildcardIndex = module.indexOf('*');
    if (wildcardIndex === -1)
      continue;

    if (module.substr(0, wildcardIndex) === subPath.substr(0, wildcardIndex)
        && module.substr(wildcardIndex + 1) === subPath.substr(subPath.length - module.length + wildcardIndex + 1)) {
      // alow match function to return true for an exit path
      if (matchFn(module, pkgMeta[dotRel + module], module.split('/').length))
        return;
    }
  }
  // exact meta
  var exactMeta = pkgMeta[subPath] && Object.hasOwnProperty.call(pkgMeta, subPath) ? pkgMeta[subPath] : pkgMeta['./' + subPath];
  if (exactMeta)
    matchFn(exactMeta, exactMeta, 0);
}


/*
 * Conditions Extension
 *
 *   Allows a condition module to alter the resolution of an import via syntax:
 *
 *     import $ from 'jquery/#{browser}';
 *
 *   Will first load the module 'browser' via `SystemJS.import('browser')` and
 *   take the default export of that module.
 *   If the default export is not a string, an error is thrown.
 *
 *   We then substitute the string into the require to get the conditional resolution
 *   enabling environment-specific variations like:
 *
 *     import $ from 'jquery/ie'
 *     import $ from 'jquery/firefox'
 *     import $ from 'jquery/chrome'
 *     import $ from 'jquery/safari'
 *
 *   It can be useful for a condition module to define multiple conditions.
 *   This can be done via the `|` modifier to specify an export member expression:
 *
 *     import 'jquery/#{./browser.js|grade.version}'
 *
 *   Where the `grade` export `version` member in the `browser.js` module  is substituted.
 *
 *
 * Boolean Conditionals
 *
 *   For polyfill modules, that are used as imports but have no module value,
 *   a binary conditional allows a module not to be loaded at all if not needed:
 *
 *     import 'es5-shim#?./conditions.js|needs-es5shim'
 *
 *   These conditions can also be negated via:
 *
 *     import 'es5-shim#?./conditions.js|~es6'
 *
 */

var sysConditions = ['browser', 'node', 'dev', 'build', 'production', 'default'];

function parseCondition (condition) {
  var conditionExport, conditionModule, negation;

  var negation;
  var conditionExportIndex = condition.lastIndexOf('|');
  if (conditionExportIndex !== -1) {
    conditionExport = condition.substr(conditionExportIndex + 1);
    conditionModule = condition.substr(0, conditionExportIndex);

    if (conditionExport[0] === '~') {
      negation = true;
      conditionExport = conditionExport.substr(1);
    }
  }
  else {
    negation = condition[0] === '~';
    conditionExport = 'default';
    conditionModule = condition.substr(negation);
    if (sysConditions.indexOf(conditionModule) !== -1) {
      conditionExport = conditionModule;
      conditionModule = null;
    }
  }

  return {
    module: conditionModule || '@system-env',
    prop: conditionExport,
    negate: negation
  };
}

function resolveCondition (conditionObj, parentKey, bool) {
  // import without __useDefault handling here
  return RegisterLoader.prototype.import.call(this, conditionObj.module, parentKey)
  .then(function (condition) {
    var m = readMemberExpression(conditionObj.prop, condition);

    if (bool && typeof m !== 'boolean')
      throw new TypeError('Condition did not resolve to a boolean.');

    return conditionObj.negate ? !m : m;
  });
}

var interpolationRegEx = /#\{[^\}]+\}/;
function interpolateConditional (key, parentKey, parentMetadata) {
  // first we normalize the conditional
  var conditionalMatch = key.match(interpolationRegEx);

  if (!conditionalMatch)
    return Promise.resolve(key);

  var conditionObj = parseCondition.call(this, conditionalMatch[0].substr(2, conditionalMatch[0].length - 3));

  // in builds, return normalized conditional
  /*if (this.builder)
    return this.normalize(conditionObj.module, parentKey, createMetadata(), parentMetadata)
    .then(function (conditionModule) {
      conditionObj.module = conditionModule;
      return key.replace(interpolationRegEx, '#{' + serializeCondition(conditionObj) + '}');
    });*/

  return resolveCondition.call(this, conditionObj, parentKey, false)
  .then(function (conditionValue) {
    if (typeof conditionValue !== 'string')
      throw new TypeError('The condition value for ' + key + ' doesn\'t resolve to a string.');

    if (conditionValue.indexOf('/') !== -1)
      throw new TypeError('Unabled to interpolate conditional ' + key + (parentKey ? ' in ' + parentKey : '') + '\n\tThe condition value ' + conditionValue + ' cannot contain a "/" separator.');

    return key.replace(interpolationRegEx, conditionValue);
  });
}
