export const hasSelf = typeof self !== 'undefined';

const envGlobal = hasSelf ? self : global;
export { envGlobal as global };

export let baseUrl;
if (typeof location !== 'undefined') {
  baseUrl = location.href.split('#')[0].split('?')[0];
  const lastSepIndex = baseUrl.lastIndexOf('/');
  if (lastSepIndex !== -1)
    baseUrl = baseUrl.slice(0, lastSepIndex + 1);
}

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
      pathname = parentUrl.slice(parentProtocol.length + 1);
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
 * Package name maps implementation
 *
 * Reduced implementation - only a single scope level is supported
 * 
 * To make lookups fast we pre-resolve the entire package name map
 * and then match based on backtracked hash lookups
 * 
 * path_prefix in scopes not supported
 * nested scopes not supported
 */

function resolveUrl (relUrl, parentUrl) {
  return resolveIfNotPlainOrUrl(relUrl, parentUrl) ||
      relUrl.indexOf(':') !== -1 && relUrl ||
      resolveIfNotPlainOrUrl('./' + relUrl, parentUrl);
}

export function createPackageMap (json, baseUrl) {
  if (json.path_prefix) {
    baseUrl = resolveUrl(json.path_prefix, baseUrl);
    if (baseUrl[baseUrl.length - 1] !== '/')
      baseUrl += '/';
  }
    
  const basePackages = json.packages || {};
  const scopes = {};
  if (json.scopes) {
    for (let scopeName in json.scopes) {
      const scope = json.scopes[scopeName];
      if (scope.path_prefix)
        throw new Error('Scope path_prefix not currently supported');
      if (scope.scopes)
        throw new Error('Nested scopes not currently supported');
      let resolvedScopeName = resolveUrl(scopeName, baseUrl);
      if (resolvedScopeName[resolvedScopeName.length - 1] === '/')
        resolvedScopeName = resolvedScopeName.substr(0, resolvedScopeName.length - 1);
      scopes[resolvedScopeName] = scope.packages || {};
    }
  }

  function getMatch (path, matchObj) {
    let sepIndex = path.length;
    do {
      const segment = path.slice(0, sepIndex);
      if (segment in matchObj)
        return segment;
    } while ((sepIndex = path.lastIndexOf('/', sepIndex - 1)) !== -1)
  }

  function applyPackages (id, packages, baseUrl) {
    const pkgName = getMatch(id, packages);
    if (pkgName) {
      const pkg = packages[pkgName];
      if (pkgName === id) {
        if (typeof pkg === 'string')
          return resolveUrl(pkg, baseUrl + pkgName + '/');
        if (!pkg.main)
          throw new Error('Package ' + pkgName + ' has no main');
        return resolveUrl(
          (pkg.path ? pkg.path + (pkg.path[pkg.path.length - 1] === '/' ? '' : '/') : pkgName + '/') + pkg.main,
          baseUrl
        );
      }
      else {
        return resolveUrl(
          (typeof pkg === 'string' || !pkg.path
            ? pkgName + '/'
            : pkg.path + (pkg.path[pkg.path.length - 1] === '/' ? '' : '/')
          ) + id.slice(pkgName.length + 1)
        , baseUrl);
      }
    }
  }

  return function (id, parentUrl) {
    const scopeName = getMatch(parentUrl, scopes);
    if (scopeName) {
      const scopePackages = scopes[scopeName];
      const packageResolution = applyPackages(id, scopePackages, scopeName + '/');
      if (packageResolution)
        return packageResolution;
    }
    return applyPackages(id, basePackages, baseUrl) || throwBare(id, parentUrl);
  };
}

export function throwBare (id, parentUrl) {
  throw new Error('Unable to resolve bare specifier "' + id + (parentUrl ? '" from ' + parentUrl : '"'));
}