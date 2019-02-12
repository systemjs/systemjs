import path from 'path';
import url from 'url';

import fileUrlFromPath from 'file-url';
import SourceMapSupport from 'source-map-support';

export const isBrowser = typeof window !== 'undefined' && typeof document !== 'undefined';
export const isNode = typeof process !== 'undefined' && process.versions && process.versions.node;
export const isWorker = typeof document === 'undefined' && typeof window === 'undefined' && typeof self !== 'undefined';

export const hasSelf = typeof self !== 'undefined';

const envGlobal = hasSelf ? self : global;
export { envGlobal as global };

export const URL = global.URL
  ? global.URL
  : url.URL;

export const pathToFileURL = url.pathToFileURL
  ? url.pathToFileURL
  : function pathToFileURL(filePath) {
    const fileUrl = new URL(fileUrlFromPath(filePath));
    if (!filePath.endsWith(path.sep)) {
      fileUrl.pathname += '/';
    }
    return fileUrl;
  };

export const fileURLToPath = url.fileURLToPath
  ? url.fileURLToPath
  : function fileURLToPath(fileUrl) {
    return fileUrl.pathname;
  };

export function urlToPath(url) {
  url = new URL(url);
  if (url.protocol === 'file:') {
    return fileUrlFromPath(url);
  }
  return url.pathname;
}

function getDefaultBaseUrl() {
  let url;

  if (typeof location !== 'undefined') {
    url = location.href.split('#')[0].split('?')[0];
    const lastSepIndex = url.lastIndexOf('/');
    if (lastSepIndex !== -1) {
      url = url.slice(0, lastSepIndex + 1);
    }
  } else if (isNode) {
    url = pathToFileURL(process.cwd() + '/');
  }

  return url;
}

export function basename(moduleUrl) {
  const filePath = urlToPath(moduleUrl);
  return path.basename(filePath);
}

export function dirname(moduleUrl) {
  const filePath = urlToPath(moduleUrl);
  return path.dirname(filePath);
}

export const sourceMapSources = {};

SourceMapSupport.install({
  retrieveSourceMap: function(source) {
    if (!sourceMapSources[source])
      return null;

    return {
      url: source.replace('!transpiled', ''),
      map: sourceMapSources[source]
    };
  }
});


export const baseUrl = getDefaultBaseUrl();
export const DEFAULT_BASEURL = baseUrl;

const backslashRegEx = /\\/g;
export function resolveIfNotPlainOrUrl (relUrl, parentUrl) {
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

export function parseImportMap (json, baseUrl) {
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

export function resolveImportMap (id, parentUrl, importMap) {
  const urlResolved = resolveIfNotPlainOrUrl(id, parentUrl || DEFAULT_BASEURL);
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

export function throwBare (id, parentUrl) {
  throw new Error('Unable to resolve bare specifier "' + id + (parentUrl ? '" from ' + parentUrl : '"'));
}
