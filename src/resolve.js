import SystemJSLoader, { CREATE_METADATA } from './systemjs-loader.js';
import { urlResolve, isRel, isAbsolute, getMapMatch, applyPaths, readMemberExpression, extendMeta, addToError } from './common.js';
import { setPkgConfig } from './config.js';
import fetch from './fetch.js';

function getParentMetadata (loader, metadata, parentName) {
  var parentMetadata = loader[CREATE_METADATA]();

  if (parentName) {
    // detect parent plugin
    // we just need pluginName to be truthy for package configurations
    // so we duplicate it as pluginArgument - although not correct its not used
    var parentPluginIndex;
    if (loader.pluginFirst) {
      if ((parentPluginIndex = parentName.lastIndexOf('!')) !== -1)
        parentMetadata.pluginArgument = parentMetadata.pluginName = parentName.substr(0, parentPluginIndex);
    }
    else {
      if ((parentPluginIndex = parentName.indexOf('!')) !== -1)
        parentMetadata.pluginArgument = parentMetadata.pluginName = parentName.substr(parentPluginIndex + 1);
    }

    // detect parent package
    parentMetadata.packageName = getPackage(loader, parentName);
    if (parentMetadata.packageName)
      parentMetadata.packageConfig = loader.packages[parentMetadata.packageName];
  }

  return parentMetadata;
}

export function normalize (name, parentName, metadata, parentMetadata) {
  metadata = metadata || this[CREATE_METADATA]();
  parentMetadata = parentMetadata || getParentMetadata(this, metadata, parentName);

  var loader = this;
  return booleanConditional.call(loader, name, parentName)
  .then(function (name) {
    // pluginResolve wraps packageResolve wraps coreResolve
    return pluginResolve.call(loader, name, parentName, metadata, parentMetadata);
  })
  .then(function (normalized) {
    return interpolateConditional.call(loader, normalized, parentName);
  })
  .then(function (normalized) {
    setMeta.call(loader, normalized, metadata);

    if (metadata.pluginName || !metadata.load.loader)
      return normalized;

    // loader by configuration
    // normalizes to parent to support package loaders
    return loader.normalize(metadata.load.loader, normalized, loader[CREATE_METADATA](), metadata)
    .then(function (pluginName) {
      metadata.pluginName = pluginName;
      metadata.pluginArgument = normalized;
      return normalized;
    });
  })
  .then(function (normalized) {
    return normalized;
  });
}

export function normalizeSync (name, parentName) {
  // normalizeSync is metadataless, so create metadata
  var metadata = this[CREATE_METADATA]();
  var parentMetadata = parentMetadata || getParentMetadata(this, metadata, parentName);

  var parsed = parsePlugin(this, name);

  // plugin
  if (parsed) {
    metadata.pluginName = this.normalizeSync(parsed.plugin, parentName);
    return combinePluginParts(this,
        packageResolveSync.call(this, parsed.argument, parentMetadata.pluginArgument || parentName, metadata, parentMetadata), metadata.pluginName);
  }

  return packageResolveSync.call(this, name, parentMetadata.pluginArgument || parentName, metadata, parentMetadata);
}

export function coreResolve (name, parentName) {
  // standard URL resolution
  if (isRel(name))
    return urlResolve(name, parentName);
  else if (isAbsolute(name))
    return name;

  // plain names not starting with './', '://' and '/' go through custom resolution
  var mapMatch = getMapMatch(this.map, name);

  if (mapMatch) {
    name = this.map[mapMatch] + name.substr(mapMatch.length);

    if (isRel(name))
      return urlResolve(name);
    else if (isAbsolute(name))
      return name;
  }

  if (this.registry.has(name))
    return name;

  if (name.substr(0, 6) === '@node/')
    return name;

  return applyPaths(this, name) || this.baseURL + name;
}

function pluginResolve (name, parentName, metadata, parentMetadata) {
  var loader = this;

  var parsed = parsePlugin(loader, name);

  if (!parsed)
    return packageResolve.call(this, name, parentMetadata && parentMetadata.pluginArgument || parentName, metadata, parentMetadata);

  return Promise.all([
    packageResolve.call(this, parsed.argument, parentMetadata && parentMetadata.pluginArgument || parentName, metadata, parentMetadata),
    this.resolve(parsed.plugin, parentName)
  ])
  .then(function (normalized) {
    metadata.pluginArgument = normalized[0];
    metadata.pluginName = normalized[1];

    // don't allow a plugin to load itself
    if (metadata.pluginArgument === metadata.pluginName)
      throw new Error('Plugin ' + metadata.pluginArgument + ' cannot load itself, make sure it is excluded from any wildcard meta configuration via a custom loader: false rule.');

    return combinePluginParts(loader, normalized[0], normalized[1]);
  });
}

function packageResolveSync (name, parentName, metadata, parentMetadata) {
  // ignore . since internal maps handled by standard package resolution
  if (parentMetadata && parentMetadata.packageConfig && name[0] !== '.') {
    var parentMap = parentMetadata.packageConfig.map;
    var parentMapMatch = parentMap && getMapMatch(parentMap, name);

    if (parentMapMatch && typeof parentMap[parentMapMatch] === 'string') {
      var mapped = doMapSync(this, parentMetadata.packageConfig, parentMetadata.packageName, parentMapMatch, name, !!metadata.pluginName);
      if (mapped)
        return mapped;
    }
  }

  var normalized = coreResolve.call(this, name, parentName);

  var pkgConfigMatch = getPackageConfigMatch(this, normalized);
  metadata.packageName = pkgConfigMatch && pkgConfigMatch.packageName || getPackage(this, normalized);

  if (!metadata.packageName)
    return normalized;

  metadata.packageConfig = this.packages[metadata.packageName] || {};

  var subPath = normalized.substr(metadata.packageName.length + 1);

  return applyPackageConfigSync(this, metadata.packageConfig, pkgName, subPath, !!metadata.pluginName);
}

function packageResolve (name, parentName, metadata, parentMetadata) {
  var loader = this;

  return Promise.resolve()
  .then(function () {
    // ignore . since internal maps handled by standard package resolution
    if (parentMetadata && parentMetadata.packageConfig && name.substr(0, 2) !== './') {
      var parentMap = parentMetadata.packageConfig.map;
      var parentMapMatch = parentMap && getMapMatch(parentMap, name);

      if (parentMapMatch)
        return doMap(loader, parentMetadata.packageConfig, parentMetadata.packageName, parentMapMatch, name, !!metadata.pluginName);
    }

    return Promise.resolve();
  })
  .then(function (mapped) {
    if (mapped)
      return mapped;

    // apply map, core, paths, contextual package map
    var normalized = coreResolve.call(loader, name, parentName);

    var pkgConfigMatch = getPackageConfigMatch(loader, normalized);
    metadata.packageName = pkgConfigMatch && pkgConfigMatch.packageName || getPackage(loader, normalized);

    if (!metadata.packageName)
      return Promise.resolve(normalized);

    var packageConfig = loader.packages[metadata.packageName];

    // if package is already configured or not a dynamic config package, use existing package config
    var isConfigured = packageConfig && (packageConfig.configured || !pkgConfigMatch);
    return (isConfigured ? Promise.resolve(packageConfig) : loadPackageConfigPath(loader, pkgConfigMatch.configPath, metadata))
    .then(function (packageConfig) {
      metadata.packageConfig = packageConfig;
      var subPath = normalized.substr(metadata.packageName.length + 1);

      return applyPackageConfig(loader, metadata.packageConfig, metadata.packageName, subPath, !!metadata.pluginName);
    });
  });
}

function setMeta (name, metadata) {
  metadata.load = {
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
    cjsDeferDepsExecute: false
  };

  // apply wildcard metas
  var bestDepth = 0;
  var wildcardIndex;
  for (var module in this.meta) {
    wildcardIndex = module.indexOf('*');
    if (wildcardIndex === -1)
      continue;
    if (module.substr(0, wildcardIndex) === name.substr(0, wildcardIndex)
        && module.substr(wildcardIndex + 1) === name.substr(name.length - module.length + wildcardIndex + 1)) {
      var depth = module.split('/').length;
      if (depth > bestDepth)
        bestDepth = depth;
      extendMeta(metadata.load, this.meta[module], bestDepth !== depth);
    }
  }

  // apply exact meta
  if (this.meta[name])
    extendMeta(metadata.load, this.meta[name]);

  // apply package meta
  if (metadata.packageName) {
    var subPath = name.substr(metadata.packageName.length + 1);

    var meta = {};
    if (metadata.packageConfig.meta) {
      var bestDepth = 0;

      // NB support a main shorthand in meta here?
      getMetaMatches(metadata.packageConfig.meta, subPath, function (metaPattern, matchMeta, matchDepth) {
        if (matchDepth > bestDepth)
          bestDepth = matchDepth;
        extendMeta(meta, matchMeta, matchDepth && bestDepth > matchDepth);
      });

      extendMeta(metadata.load, meta);
    }

    // format
    if (metadata.packageConfig.format && !metadata.pluginName)
      metadata.load.format = metadata.load.format || metadata.packageConfig.format;
  }
}

function parsePlugin (loader, name) {
  var argumentName;
  var pluginName;

  var pluginIndex = name.lastIndexOf('!');

  if (pluginIndex === -1)
    return;

  if (loader.pluginFirst) {
    argumentName = name.substr(pluginIndex + 1);
    pluginName = name.substr(0, pluginIndex);
  }
  else {
    argumentName = name.substr(0, pluginIndex);
    pluginName = name.substr(pluginIndex + 1) || argumentName.substr(argumentName.lastIndexOf('.') + 1);
  }

  return {
    argument: argumentName,
    plugin: pluginName
  };
}

// put name back together after parts have been normalized
function combinePluginParts (loader, argumentName, pluginName) {
  if (loader.pluginFirst)
    return pluginName + '!' + argumentName;
  else
    return argumentName + '!' + pluginName;
}

/*
 * Package Configuration Extension
 *
 * Example:
 *
 * SystemJS.packages = {
 *   jquery: {
 *     main: 'index.js', // when not set, package name is requested directly
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
 *     // keys are normalized module names relative to the package itself
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
 * a request, will first request a ".json" file by the package name to derive the package
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
 * The package name itself is taken to be the match up to and including the last wildcard
 * or trailing slash.
 * The most specific package config path will be used.
 * Any existing package configurations for the package will deeply merge with the
 * package config, with the existing package configurations taking preference.
 * To opt-out of the package configuration request for a package that matches
 * packageConfigPaths, use the { configured: true } package config option.
 *
 */
function getPackage (loader, normalized) {
  // use most specific package
  var curPkg, curPkgLen = 0, pkgLen;
  for (var p in loader.packages) {
    if (normalized.substr(0, p.length) === p && (normalized.length === p.length || normalized[p.length] === '/')) {
      pkgLen = p.split('/').length;
      if (pkgLen > curPkgLen) {
        curPkg = p;
        curPkgLen = pkgLen;
      }
    }
  }
  return curPkg;
}

function addDefaultExtension (loader, pkg, pkgName, subPath, skipExtensions) {
  // don't apply extensions to folders or if defaultExtension = false
  if (!subPath || subPath[subPath.length - 1] === '/' || skipExtensions || pkg.defaultExtension === false)
    return subPath;

  var metaMatch = false;

  // exact meta or meta with any content after the last wildcard skips extension
  if (pkg.meta)
    getMetaMatches(pkg.meta, subPath, function (metaPattern, matchMeta, matchDepth) {
      if (matchDepth === 0 || metaPattern.lastIndexOf('*') !== metaPattern.length - 1)
        return metaMatch = true;
    });

  // exact global meta or meta with any content after the last wildcard skips extension
  if (!metaMatch && loader.meta)
    getMetaMatches(loader.meta, pkgName + '/' + subPath, function (metaPattern, matchMeta, matchDepth) {
      if (matchDepth === 0 || metaPattern.lastIndexOf('*') !== metaPattern.length - 1)
        return metaMatch = true;
    });

  if (metaMatch)
    return subPath;

  // work out what the defaultExtension is and add if not there already
  // NB reconsider if default should really be ".js"?
  var defaultExtension = '.' + (pkg.defaultExtension || 'js');
  if (subPath.substr(subPath.length - defaultExtension.length) !== defaultExtension)
    return subPath + defaultExtension;
  else
    return subPath;
}

function applyPackageConfigSync (loader, pkg, pkgName, subPath, skipExtensions) {
  // main
  if (!subPath) {
    if (pkg.main)
      subPath = pkg.main.substr(0, 2) === './' ? pkg.main.substr(2) : pkg.main;
    // also no submap if name is package itself (import 'pkg' -> 'path/to/pkg.js')
    else
      // NB can add a default package main convention here when defaultJSExtensions is deprecated
      // if it becomes internal to the package then it would no longer be an exit path
      return pkgName;
  }

  // map config checking without then with extensions
  if (pkg.map) {
    var mapPath = './' + subPath;

    var mapMatch = getMapMatch(pkg.map, mapPath);

    // we then check map with the default extension adding
    if (!mapMatch) {
      mapPath = './' + addDefaultExtension(loader, pkg, pkgName, subPath, skipExtensions);
      if (mapPath !== './' + subPath)
        mapMatch = getMapMatch(pkg.map, mapPath);
    }
    if (mapMatch) {
      var mapped = doMapSync(loader, pkg, pkgName, mapMatch, mapPath, skipExtensions);
      if (mapped)
        return mapped;
    }
  }

  // normal package resolution
  return pkgName + '/' + addDefaultExtension(loader, pkg, pkgName, subPath, skipExtensions);
}

function validMapping (mapMatch, mapped, pkgName, path) {
  // disallow internal to subpath maps
  if (mapMatch === '.')
    throw new Error('Package ' + pkgName + ' has a map entry for "." which is not permitted.');

  // allow internal ./x -> ./x/y or ./x/ -> ./x/y recursive maps
  // but only if the path is exactly ./x and not ./x/z
  if (mapped.substr(0, mapMatch.length) === mapMatch && path.length > mapMatch.length)
    return false;

  return true;
}

function doMapSync (loader, pkg, pkgName, mapMatch, path, skipExtensions) {
  if (path[path.length - 1] === '/')
    path = path.substr(0, path.length - 1);
  var mapped = pkg.map[mapMatch];

  if (typeof mapped === 'object')
    throw new Error('Synchronous conditional normalization not supported sync normalizing ' + mapMatch + ' in ' + pkgName);

  if (!validMapping(mapMatch, mapped, pkgName, path) || typeof mapped !== 'string')
    return;

  // package map to main / base-level
  if (mapped === '.')
    mapped = pkgName;

  // internal package map
  else if (mapped.substr(0, 2) === './')
    return pkgName + '/' + addDefaultExtension(loader, pkg, pkgName, mapped.substr(2) + path.substr(mapMatch.length), skipExtensions);

  // external map reference
  return loader.normalizeSync(mapped + path.substr(mapMatch.length), pkgName + '/');
}

function applyPackageConfig (loader, pkg, pkgName, subPath, skipExtensions) {
  // main
  if (!subPath) {
    if (pkg.main)
      subPath = pkg.main.substr(0, 2) === './' ? pkg.main.substr(2) : pkg.main;
    // also no submap if name is package itself (import 'pkg' -> 'path/to/pkg.js')
    else
      // NB can add a default package main convention here when defaultJSExtensions is deprecated
      // if it becomes internal to the package then it would no longer be an exit path
      return Promise.resolve(pkgName);
  }

  // map config checking without then with extensions
  var mapPath, mapMatch;

  if (pkg.map) {
    mapPath = './' + subPath;
    mapMatch = getMapMatch(pkg.map, mapPath);

    // we then check map with the default extension adding
    if (!mapMatch) {
      mapPath = './' + addDefaultExtension(loader, pkg, pkgName, subPath, skipExtensions);
      if (mapPath !== './' + subPath)
        mapMatch = getMapMatch(pkg.map, mapPath);
    }
  }

  return (mapMatch ? doMap(loader, pkg, pkgName, mapMatch, mapPath, skipExtensions) : Promise.resolve())
  .then(function (mapped) {
    if (mapped)
      return Promise.resolve(mapped);

    // normal package resolution / fallback resolution for no conditional match
    return Promise.resolve(pkgName + '/' + addDefaultExtension(loader, pkg, pkgName, subPath, skipExtensions));
  });
}

function doStringMap (loader, pkg, pkgName, mapMatch, mapped, path, skipExtensions) {
  // NB the interpolation cases should strictly skip subsequent interpolation
  // package map to main / base-level
  if (mapped === '.')
    mapped = pkgName;

  // internal package map
  else if (mapped.substr(0, 2) === './')
    return Promise.resolve(pkgName + '/' + addDefaultExtension(loader, pkg, pkgName, mapped.substr(2) + path.substr(mapMatch.length), skipExtensions))
    .then(function (name) {
      return interpolateConditional.call(loader, name, pkgName + '/');
    });

  // external map reference
  return loader.resolve(mapped + path.substr(mapMatch.length), pkgName + '/');
}

function doMap (loader, pkg, pkgName, mapMatch, path, skipExtensions) {
  if (path[path.length - 1] === '/')
    path = path.substr(0, path.length - 1);

  var mapped = pkg.map[mapMatch];

  if (typeof mapped === 'string') {
    if (!validMapping(mapMatch, mapped, pkgName, path))
      return Promise.resolve();
    return doStringMap(loader, pkg, pkgName, mapMatch, mapped, path, skipExtensions);
  }

  // we use a special conditional syntax to allow the builder to handle conditional branch points further
  if (loader.builder)
    return Promise.resolve(pkgName + '/#:' + path);

  // we load all conditions upfront
  var conditionPromises = [];
  var conditions = [];
  for (var e in mapped) {
    var c = parseCondition(e);
    conditions.push({
      condition: c,
      map: mapped[e]
    });
    conditionPromises.push(loader.import(c.module, pkgName));
  }

  // map object -> conditional map
  return Promise.all(conditionPromises)
  .then(function (conditionValues) {
    // first map condition to match is used
    for (var i = 0; i < conditions.length; i++) {
      var c = conditions[i].condition;
      var value = readMemberExpression(c.prop, conditionValues[i]);
      if (!c.negate && value || c.negate && !value)
        return conditions[i].map;
    }
  })
  .then(function (mapped) {
    if (mapped) {
      if (!validMapping(mapMatch, mapped, pkgName, path))
        return;
      return doStringMap(loader, pkg, pkgName, mapMatch, mapped, path, skipExtensions);
    }

    // no environment match -> fallback to original subPath by returning undefined
  });
}

// check if the given normalized name matches a packageConfigPath
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
function getPackageConfigMatch (loader, normalized) {
  var pkgName, exactMatch = false, configPath;
  for (var i = 0; i < loader.packageConfigPaths.length; i++) {
    var packageConfigPath = loader.packageConfigPaths[i];
    var p = packageConfigPaths[packageConfigPath] || (packageConfigPaths[packageConfigPath] = createPkgConfigPathObj(packageConfigPath));
    if (normalized.length < p.length)
      continue;
    var match = normalized.match(p.regEx);
    if (match && (!pkgName || (!(exactMatch && p.wildcard) && pkgName.length < match[1].length))) {
      pkgName = match[1];
      exactMatch = !p.wildcard;
      configPath = pkgName + packageConfigPath.substr(p.length);
    }
  }

  if (!pkgName)
    return;

  return {
    packageName: pkgName,
    configPath: configPath
  };
}

var fetchedConfig = {};
function loadPackageConfigPath (loader, pkgConfigPath, metadata) {
  if (fetchedConfig[pkgConfigPath])
    return fetchedConfig[pkgConfigPath];

  return fetchedConfig[pkgConfigPath] = fetch(pkgConfigPath)
  .then(function (pkgConfig) {
    try {
      pkgConfig = JSON.parse(pkgConfig);
    }
    catch (e) {
      throw new Error('Unable to parse JSON for package configuration file ' + pkgConfigPath);
    }

    var configLoader = loader.pluginLoader || loader;
    configLoader.registry.set(pkgConfig, configLoader.newModule({ default: pkgConfig, __useDefault: true }));

    return setPkgConfig(loader, metadata.packageName, pkgConfig, true);
  }, function (err) {
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
  var exactMeta = pkgMeta[subPath] && pkgMeta.hasOwnProperty && pkgMeta.hasOwnProperty(subPath) ? pkgMeta[subPath] : pkgMeta['./' + subPath];
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
    if (sysConditions.indexOf(conditionModule) != -1) {
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

function serializeCondition (conditionObj) {
  return conditionObj.module + '|' + (conditionObj.negate ? '~' : '') + conditionObj.prop;
}

function resolveCondition (conditionObj, parentName, bool) {
  return this.load(conditionObj.module, parentName)
  .then(function (condition) {
    var m = readMemberExpression(conditionObj.prop, condition);

    if (bool && typeof m !== 'boolean')
      throw new TypeError('Condition ' + serializeCondition(conditionObj) + ' did not resolve to a boolean.');

    return conditionObj.negate ? !m : m;
  });
}

var interpolationRegEx = /#\{[^\}]+\}/;
function interpolateConditional (name, parentName) {
  // first we normalize the conditional
  var conditionalMatch = name.match(interpolationRegEx);

  if (!conditionalMatch)
    return Promise.resolve(name);

  var conditionObj = parseCondition.call(this, conditionalMatch[0].substr(2, conditionalMatch[0].length - 3));

  // in builds, return normalized conditional
  if (this.builder)
    return this.resolve(conditionObj.module, parentName)
    .then(function (conditionModule) {
      conditionObj.module = conditionModule;
      return name.replace(interpolationRegEx, '#{' + serializeCondition(conditionObj) + '}');
    });

  return resolveCondition.call(this, conditionObj, parentName, false)
  .then(function (conditionValue) {
    if (typeof conditionValue !== 'string')
      throw new TypeError('The condition value for ' + name + ' doesn\'t resolve to a string.');

    if (conditionValue.indexOf('/') !== -1)
      throw new TypeError('Unabled to interpolate conditional ' + name + (parentName ? ' in ' + parentName : '') + '\n\tThe condition value ' + conditionValue + ' cannot contain a "/" separator.');

    return name.replace(interpolationRegEx, conditionValue);
  });
}

function booleanConditional (name, parentName) {
  // first we normalize the conditional
  var booleanIndex = name.lastIndexOf('#?');

  if (booleanIndex === -1)
    return Promise.resolve(name);

  var conditionObj = parseCondition.call(this, name.substr(booleanIndex + 2));

  // in builds, return normalized conditional
  if (this.builder)
    return this.resolve(conditionObj.module, parentName)
    .then(function (conditionModule) {
      conditionObj.module = conditionModule;
      return name.substr(0, booleanIndex) + '#?' + serializeCondition(conditionObj);
    });

  return resolveCondition.call(this, conditionObj, parentName, true)
  .then(function (conditionValue) {
    return conditionValue ? name.substr(0, booleanIndex) : '@empty';
  });
}
