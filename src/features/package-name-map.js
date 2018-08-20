/*
 * Package name map support for SystemJS
 * 
 * <script type="systemjs-packagemap">{}</script>
 * OR
 * <script type="systemjs-packagemap" src=package.json></script>
 * 
 * Only supports loading the first package map
 */
import { resolveIfNotPlainOrUrl, baseUrl as pageBaseUrl } from '../common.js';
import { systemJSPrototype } from '../system-core.js';

let packageMapPromise, packageMapResolve;
const scripts = document.getElementsByTagName('script');
for (let i = 0; i < scripts.length; i++) {
  const script = scripts[i];
  if (script.type !== 'systemjs-packagemap')
    continue;

  if (!script.src)
    packageMapResolve = createPackageMap(JSON.parse(script.innerHTML), pageBaseUrl);
  else
    packageMapPromise = fetch(script.src)
    .then(function (res) {
      return res.json();
    })
    .then(function (json) {
      packageMapResolve = createPackageMap(json, script.src);
      packageMapPromise = undefined;
    }, function () {
      packageMapResolve = throwBare;
      packageMapPromise = undefined;
    });
  break;
}
if (!packageMapPromise)
  packageMapResolve = throwBare;

function throwBare (id, parentUrl) {
  throw new Error('Unable to resolve bare specifier "' + id + (parentUrl ? '" from ' + parentUrl : '"'));
}

systemJSPrototype.resolve = function (id, parentUrl) {
  parentUrl = parentUrl || pageBaseUrl;

  const resolvedIfNotPlainOrUrl = resolveIfNotPlainOrUrl(id, parentUrl);
  if (resolvedIfNotPlainOrUrl)
    return resolvedIfNotPlainOrUrl;
  if (id.indexOf(':') !== -1)
    return id;

  // now just left with plain
  // (if not package map, packageMapResolve just throws)
  if (packageMapPromise)
    return packageMapPromise
    .then(function () {
      return packageMapResolve(id, parentUrl);
    });

  return packageMapResolve(id, parentUrl);
};

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

function createPackageMap (json, baseUrl) {
  if (json.path_prefix) {
    baseUrl = resolveUrl(json.path_prefix, pageBaseUrl);
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
      scopes[resolveUrl(scopeName, baseUrl)] = scope.packages || {};
    }
  }

  function getMatch (path, matchObj) {
    let sepIndex = path.length;
    do {
      const segment = path.substr(0, sepIndex);
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
          ) + id.substr(pkgName.length + 1)
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
