import { errMsg } from './err-msg.js';

export var hasSymbol = typeof Symbol !== 'undefined';
export var hasSelf = typeof self !== 'undefined';
export var hasDocument = typeof document !== 'undefined';

var envGlobal = hasSelf ? self : global;
export { envGlobal as global };

// Loader-scoped baseUrl and import map supported in Node.js only
export var BASE_URL = hasSymbol ? Symbol() : '_';
export var IMPORT_MAP = hasSymbol ? Symbol() : '#';

export var baseUrl;

if (hasDocument) {
  var baseEl = document.querySelector('base[href]');
  if (baseEl)
    baseUrl = baseEl.href;
}

if (!baseUrl && typeof location !== 'undefined') {
  baseUrl = location.href.split('#')[0].split('?')[0];
  var lastSepIndex = baseUrl.lastIndexOf('/');
  if (lastSepIndex !== -1)
    baseUrl = baseUrl.slice(0, lastSepIndex + 1);
}

if (!process.env.SYSTEM_BROWSER && !baseUrl && typeof process !== 'undefined') {
  var cwd = process.cwd();
  // TODO: encoding edge cases
  baseUrl = 'file://' + (cwd[0] === '/' ? '' : '/') + cwd.replace(/\\/g, '/') + '/';
}

var backslashRegEx = /\\/g;
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
    var parentProtocol = parentUrl.slice(0, parentUrl.indexOf(':') + 1);
    // Disabled, but these cases will give inconsistent results for deep backtracking
    //if (parentUrl[parentProtocol.length] !== '/')
    //  throw Error('Cannot resolve');
    // read pathname from parent URL
    // pathname taken to be part after leading "/"
    var pathname;
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
    var segmented = pathname.slice(0, pathname.lastIndexOf('/') + 1) + relUrl;

    var output = [];
    var segmentIndex = -1;
    for (var i = 0; i < segmented.length; i++) {
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

export function resolveUrl (relUrl, parentUrl) {
  return resolveIfNotPlainOrUrl(relUrl, parentUrl) || (relUrl.indexOf(':') !== -1 ? relUrl : resolveIfNotPlainOrUrl('./' + relUrl, parentUrl));
}

function resolveAndComposePackages (packages, outPackages, baseUrl, parentMap, parentUrl) {
  for (var p in packages) {
    var resolvedLhs = resolveIfNotPlainOrUrl(p, baseUrl) || p;
    var rhs = packages[p];
    // package fallbacks not currently supported
    if (typeof rhs !== 'string')
      continue;
    var mapped = resolveImportMap(parentMap, resolveIfNotPlainOrUrl(rhs, baseUrl) || rhs, parentUrl);
    if (!mapped) {
      if (process.env.SYSTEM_PRODUCTION)
        targetWarning('W1', p, rhs);
      else
        targetWarning('W1', p, rhs, 'bare specifier did not resolve');
    }
    else
      outPackages[resolvedLhs] = mapped;
  }
}

export function resolveAndComposeImportMap (json, baseUrl, outMap) {
  if (json.imports)
    resolveAndComposePackages(json.imports, outMap.imports, baseUrl, outMap, null);

  var u;
  for (u in json.scopes || {}) {
    var resolvedScope = resolveUrl(u, baseUrl);
    resolveAndComposePackages(json.scopes[u], outMap.scopes[resolvedScope] || (outMap.scopes[resolvedScope] = {}), baseUrl, outMap, resolvedScope);
  }

  for (u in json.depcache || {})
    outMap.depcache[resolveUrl(u, baseUrl)] = json.depcache[u];
  
  for (u in json.integrity || {})
    outMap.integrity[resolveUrl(u, baseUrl)] = json.integrity[u];
}

function getMatch (path, matchObj) {
  if (matchObj[path])
    return path;
  var sepIndex = path.length;
  do {
    var segment = path.slice(0, sepIndex + 1);
    if (segment in matchObj)
      return segment;
  } while ((sepIndex = path.lastIndexOf('/', sepIndex - 1)) !== -1)
}

function applyPackages (id, packages) {
  var pkgName = getMatch(id, packages);
  if (pkgName) {
    var pkg = packages[pkgName];
    if (pkg === null) return;
    if (id.length > pkgName.length && pkg[pkg.length - 1] !== '/') {
      if (process.env.SYSTEM_PRODUCTION)
        targetWarning('W2', pkgName, pkg);
      else
        targetWarning('W2', pkgName, pkg, "should have a trailing '/'");
    }
    else
      return pkg + id.slice(pkgName.length);
  }
}

function targetWarning (code, match, target, msg) {
  console.warn(errMsg(code, process.env.SYSTEM_PRODUCTION ? [target, match].join(', ') : "Package target " + msg + ", resolving target '" + target + "' for " + match));
}

export function resolveImportMap (importMap, resolvedOrPlain, parentUrl) {
  var scopes = importMap.scopes;
  var scopeUrl = parentUrl && getMatch(parentUrl, scopes);
  while (scopeUrl) {
    var packageResolution = applyPackages(resolvedOrPlain, scopes[scopeUrl]);
    if (packageResolution)
      return packageResolution;
    scopeUrl = getMatch(scopeUrl.slice(0, scopeUrl.lastIndexOf('/')), scopes);
  }
  return applyPackages(resolvedOrPlain, importMap.imports) || resolvedOrPlain.indexOf(':') !== -1 && resolvedOrPlain;
}
