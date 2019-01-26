/*
* SystemJS - NodeJS 3.0.0
*/
'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var fs = _interopDefault(require('fs'));
var _path = _interopDefault(require('path'));
var url = _interopDefault(require('url'));
var fileUrl = _interopDefault(require('file-url'));
var assert = require('assert');
var isBuiltinModule = _interopDefault(require('is-builtin-module'));
var vm = _interopDefault(require('vm'));
var stripShebang = _interopDefault(require('strip-shebang'));

const hasSelf = typeof self !== 'undefined';

const envGlobal = hasSelf ? self : global;

let baseUrl;
if (typeof location !== 'undefined') {
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
    //  throw new Error('Cannot resolve');
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
  return resolveIfNotPlainOrUrl(relUrl, parentUrl) ||
      relUrl.indexOf(':') !== -1 && relUrl ||
      resolveIfNotPlainOrUrl('./' + relUrl, parentUrl);
}

function resolvePackages(pkgs) {
  var outPkgs = {};
  for (var p in pkgs) {
    var value = pkgs[p];
    // TODO package fallback support
    if (typeof value !== 'string')
      continue;
    outPkgs[resolveIfNotPlainOrUrl(p) || p] = value;
  }
  return outPkgs;
}

function parseImportMap (json, baseUrl) {
  const imports = resolvePackages(json.imports) || {};
  const scopes = {};
  if (json.scopes) {
    for (let scopeName in json.scopes) {
      const scope = json.scopes[scopeName];
      let resolvedScopeName = resolveUrl(scopeName, baseUrl);
      if (resolvedScopeName[resolvedScopeName.length - 1] !== '/')
        resolvedScopeName += '/';
      scopes[resolvedScopeName] = resolvePackages(scope) || {};
    }
  }

  return { imports: imports, scopes: scopes, baseUrl: baseUrl };
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

function applyPackages (id, packages, baseUrl) {
  const pkgName = getMatch(id, packages);
  if (pkgName) {
    const pkg = packages[pkgName];
    if (pkg === null)

    if (id.length > pkgName.length && pkg[pkg.length - 1] !== '/')
      console.warn("Invalid package target " + pkg + " for '" + pkgName + "' should have a trailing '/'.");
    return resolveUrl(pkg + id.slice(pkgName.length), baseUrl);
  }
}

function resolveImportMap (id, parentUrl, importMap) {
  const urlResolved = resolveIfNotPlainOrUrl(id, parentUrl);
  if (urlResolved)
    id = urlResolved;
  const scopeName = getMatch(parentUrl, importMap.scopes);
  if (scopeName) {
    const scopePackages = importMap.scopes[scopeName];
    const packageResolution = applyPackages(id, scopePackages, scopeName);
    if (packageResolution)
      return packageResolution;
  }
  return applyPackages(id, importMap.imports, importMap.baseUrl) || urlResolved || throwBare(id, parentUrl);
}

function throwBare (id, parentUrl) {
  throw new Error('Unable to resolve bare specifier "' + id + (parentUrl ? '" from ' + parentUrl : '"'));
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
 * - System.onload(id, err?) handler for tracing / hot-reloading
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
systemJSPrototype.import = function (id, parentUrl) {
  const loader = this;
  return Promise.resolve(loader.resolve(id, parentUrl))
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
      throw new Error('Module ' + id + ' did not instantiate');
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

  // disable unhandled rejections
  linkPromise.catch(function () {});

  // Captial letter = a promise function
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
    // in such a case, pC should be used, and pLo, pLi will be emptied
    e: undefined,

    // On execution we have populated:
    // the execution error if any
    eE: undefined,
    // in the case of TLA, the execution promise
    E: undefined,

    // On execution, pLi, pLo, e cleared

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
    if (load.eE)
      throw load.eE;
    if (load.E)
      return load.E;
    return;
  }

  // deps execute first, unless circular
  let depLoadPromises;
  load.d.forEach(function (depLoad) {
    {
      const depLoadPromise = postOrderExec(loader, depLoad, seen);
      if (depLoadPromise)
        (depLoadPromises = depLoadPromises || []).push(depLoadPromise);
    }
  });
  if (depLoadPromises) {
    return load.E = Promise.all(depLoadPromises).then(doExec);
  }

  return doExec();

  function doExec () {
    try {
      let execPromise = load.e.call(nullContext);
      if (execPromise) {
        execPromise.then(function () {
            load.C = load.n;
            load.E = null;
          });
        execPromise.catch(function () {});
        return load.E = load.E || execPromise;
      }
      // (should be a promise, but a minify optimization to leave out Promise.resolve)
      load.C = load.n;
    }
    catch (err) {
      load.eE = err;
      throw err;
    }
    finally {
      load.L = load.I = undefined;
      load.e = null;
    }
  }
}

envGlobal.System = new SystemJS();

const URL = global.URL
  ? global.URL
  : url.URL;


const pathToFileURL = url.pathToFileURL
  ? url.pathToFileURL
  : function pathToFileURL(path) {
    const theUrl = new URL(fileUrl(path));
    if (path.endsWith(_path.sep)) {
      theUrl.pathname += '/';
    }
    return theUrl;
  };

const DEFAULT_BASEURL = pathToFileURL(process.cwd() + '/');


function fileExists(path) {
  try {
    fs.accessSync(path);
    return fs.statSync(path).isFile();
  } catch (err) {
    return false;
  }
}


function isURL(value) {
  if (value instanceof URL) {
    return true;
  }

  if (typeof value === 'string') {
    try {
      new URL(value);
      return true;
    } catch (err) {}
  }

  return false;
}

systemJSPrototype.get = function (id) {
  const load = this[REGISTRY][id];
  if (load && load.e === null && !load.E) {
    if (load.eE)
      return null;
    return load.n;
  }
};

// Delete function provided for hot-reloading use cases
systemJSPrototype.delete = function (id) {
  const load = this.get(id);
  if (load === undefined)
    return false;
  // remove from importerSetters
  // (release for gc)
  if (load && load.d)
    load.d.forEach(function (depLoad) {
      const importerIndex = depLoad.i.indexOf(load);
      if (importerIndex !== -1)
        depLoad.i.splice(importerIndex, 1);
    });
  return delete this[REGISTRY][id];
};

// This implements the logic described here:

const EXTENSIONS = ['.mjs', '.js', '.json'];


function isPath(value) {
  if (value === '.') {
    return true;
  }
  return /^\.{0,2}\//.test(value);
}

function createNodeResolver({ baseUrl = DEFAULT_BASEURL, resolveBareNames = true } = {}) {
  const FILE_CACHE = new Map();
  let resolveDepth = 0;

  function checkFileExists(path) {
    if (!FILE_CACHE.has(path)) {
      FILE_CACHE.set(path, fileExists(path));
    }
    return FILE_CACHE.get(path);
  }

  function doPathSearch(specifier) {
    try {
      return doFileSearch(specifier);
    } catch (err) {
      // continue...
    }

    try {
      return doDirectorySearch(specifier);
    } catch (err) {
      // continue...
    }

    throw new Error(`Cannot resolve '${specifier}'`);
  }


  function doFileSearch(specifier) {
    if (checkFileExists(specifier)) {
      return specifier;
    }

    const matchingExtension = EXTENSIONS.find(ext => {
      const searchable = new URL(specifier);
      searchable.pathname += ext;
      return checkFileExists(searchable);
    });

    if (matchingExtension) {
      const searchable = new URL(specifier);
      searchable.pathname += matchingExtension;
      return searchable;
    }

    throw new Error(`Cannot resolve '${specifier}'`);
  }


  function doDirectorySearch(specifier) {
    const dir = new URL(specifier);

    if (!dir.pathname.endsWith('/')) {
      dir.pathname += '/';
    }

    let searchable = new URL('./package.json', dir);
    if (checkFileExists(searchable)) {
      const pkgContent = fs.readFileSync(searchable, 'utf8');
      const pkg = JSON.parse(pkgContent);
      if ('main' in pkg) {
        const main = new URL(pkg.main, dir);
        return doPackageMainSearch(main);
      }
    }

    try {
      return doIndexSearch(dir);
    } catch (err) {
      // continue...
    }

    throw new Error(`Cannot resolve directory '${specifier}'`);
  }


  function doPackageMainSearch(specifier) {
    try {
      return doFileSearch(specifier);
    } catch (err) {
      // continue...
    }

    try {
      return doIndexSearch(specifier);
    } catch (err) {
      // continue...
    }

    throw new Error(`Cannot resolve '${specifier}`);
  }


  function doIndexSearch(specifier) {
    let searchable = new URL(specifier);

    if (!searchable.pathname.endsWith('/')) {
      searchable.pathname += '/';
    }

    searchable = new URL('./index', searchable);

    try {
      return doFileSearch(searchable);
    } catch (err) {
      // continue...
    }

    throw new Error(`Cannot resolve index '${specifier}'`);
  }


  function doModuleSearch(specifier, parentUrl) {
    if (isBuiltinModule(specifier)) {
      return new URL(`builtin:${specifier}`);
    }

    const pkg = new URL('./', parentUrl);
    const searchable = new URL(`./node_modules/${specifier}`, pkg);

    try {
      return doFileSearch(searchable);
    } catch (err) {
      // continue...
    }

    try {
      return doDirectorySearch(searchable);
    } catch (err) {
      // continue...
    }

    const parent = new URL('../', pkg);
    if (parent.href.startsWith(baseUrl.href)) {
      // Do not search above the baseUrl.
      try {
        return doModuleSearch(specifier, parent);
      } catch (err) {
        // continue...
      }
    }

    throw new Error(`Cannot resolve '${specifier}' from '${parentUrl}'`);
  }


  function resolve(specifier, parentUrl = baseUrl) {
    try {
      resolveDepth += 1;

      assert.ok(specifier, 'missing specifier');
      assert.ok(typeof specifier === 'string', 'specifier must be a string');

      assert.ok(parentUrl, 'missing parentUrl');
      assert.ok(parentUrl instanceof URL, 'parentUrl must be a URL');

      try {
        return new URL(specifier);
      } catch (err) {
        // continue...
      }

      if (isPath(specifier)) {
        return doPathSearch(new URL(specifier, parentUrl));
      }

      if (resolveBareNames) {
        return doModuleSearch(specifier, parentUrl);
      }

      return null;
    } finally {
      resolveDepth -= 1;
      if (resolveDepth === 0) {
        FILE_CACHE.clear();
      }
    }
  }

  Object.defineProperty(resolve, 'baseURL', {value: baseUrl});

  return resolve;
}

/*
 * Import map support for SystemJS on Node.js
 *
 * Only supports loading the first import map
 */


function createImportMapResolver({ baseUrl$$1 = DEFAULT_BASEURL, importMapConfig}) {
  let importMapUrl;
  let importMap;

  if (isURL(importMapConfig)) {
    importMapUrl = new URL(importMapConfig);
  } else {
    importMapUrl = new URL('./systemjs-importmap.json', baseUrl$$1);
  }

  if (fileExists(importMapUrl)) {
    const importMapRaw = fs.readFileSync(importMapUrl, 'utf8');
    const importMapData = JSON.parse(importMapRaw);
    importMap = parseImportMap(importMapData, importMapUrl.href);
  } else {
    importMap = { imports: {}, scopes: {} };
  }

  function resolve(id, parentUrl = baseUrl$$1) {
    return resolveImportMap(id, `${parentUrl}`, importMap);
  }

  Object.defineProperty(resolve, 'baseURL', {value: baseUrl$$1});

  return resolve;
}

const SystemJS$1 = systemJSPrototype.constructor;


function detectFormat(url$$1) {
  const ext = _path.extname(url$$1.pathname);
  let format = null;

  if (ext === '.mjs') {
    format = 'esm';
  } else if (ext === '.json') {
    format = 'json';
  } else if (ext === '.js') {
    format = 'cjs';
  } else if (url$$1.protocol === 'builtin:') {
    return 'builtin';
  }

  return format;
}


function createFileURLReader(url$$1) {
  let CACHED_CONTENT;

  function read(force = false) {
    if (force === true || CACHED_CONTENT === undefined) {
      if (fileExists(read.url)) {
        CACHED_CONTENT = fs.readFileSync(read.url, 'utf8');
      } else {
        throw new Error(`File '${read.url.href}' does not exist.`);
      }
    }
    return CACHED_CONTENT;
  }

  try {
    read.url = new URL(url$$1);
  } catch (err) {
    read.url = pathToFileURL(url$$1);
  }

  read.format = detectFormat(read.url);

  return read;
}


function wrapEsModuleSource(source) {
  const content_before = '(function (System) { ';
  const content_actual = stripShebang(source);
  const content_after = '\n});';

  return `${content_before}${content_actual}${content_after}`;
}


function loadRegisterModule(getContent, loader) {
  const { url: url$$1 } = getContent;
  const source = getContent();

  const wrapper = wrapEsModuleSource(source);

  const runOptions = {
    displayErrors: true,
    filename: `${url$$1}`,
    lineOffset: 0,
  };

  const moduleVars = [
    loader,    /* System */
  ];

  vm.runInThisContext(wrapper, runOptions)(...moduleVars);
}


function loadBuiltinModule(getContent, loader) {
  const { url: url$$1 } = getContent;
  const name = url$$1.pathname;

  const nodeModule = require(name);

  const registration = [[], function declare(_export) {
    return {
      execute() {
        _export('default', nodeModule);
        _export(nodeModule);
      },
    };
  }];

  loader.register(...registration);
}


function loadJSONModule(getContent, loader) {
  const registration = [[], function declare(_export) {
    return {
      execute() {
        _export('default', JSON.parse(getContent()));
      },
    };
  }];

  loader.register(...registration);
}


class NodeLoader extends SystemJS$1 {
  constructor({ baseUrl$$1 = DEFAULT_BASEURL, importMapConfig } = {}) {
    super();

    const _baseUrl = new URL(baseUrl$$1);
    if (!_baseUrl.pathname.endsWith('/')) {
      _baseUrl.pathname += '/';
    }
    this.baseUrl = _baseUrl;

    const resolverConfig = {
      baseUrl: this.baseUrl,
      importMapConfig,
    };

    this.resolvers = [
      createImportMapResolver(resolverConfig),
      createNodeResolver(resolverConfig),
    ];
  }

  resolve(id, parentUrl) {
    let resolved;

    for (let resolver of this.resolvers) {
      try {
        resolved = resolver(id, parentUrl);
        if (resolved) {
          return resolved;
        }
      } catch (err) {
        // Do nothing. Continue...
      }
    }

    throw new Error(`Cannot resolve "${id}"${parentUrl ? ` from ${parentUrl}` : ''}`);
  }


  async instantiate(url$$1, firstParentUrl) {
    assert.ok(url$$1, 'missing url');
    assert.ok(url$$1 instanceof URL || typeof url$$1 === 'string', 'url must be a URL or string');

    url$$1 = new URL(url$$1);

    const getContent = createFileURLReader(url$$1);

    try {
      switch(getContent.format) {
        case 'builtin':
          loadBuiltinModule(getContent, this);
          break;

        case 'json':
          loadJSONModule(getContent, this);
          break;

        default:
          loadRegisterModule(getContent, this);
      }
    } catch (err) {
      if (err instanceof ReferenceError) {
        throw err;
      }
      throw new Error(`Error loading ${url$$1}${firstParentUrl ? ' from ' + firstParentUrl : ''}`);
    }

    return this.getRegister();
  }
}

envGlobal.System = new NodeLoader();

module.exports = NodeLoader;
