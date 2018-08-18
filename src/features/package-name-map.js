/*
 * Package name map support for SystemJS
 * 
 * <script type="systemjs-packagemap">{}</script>
 * OR
 * <script type="systemjs-packagemap" src=package.json></script>
 * 
 * Only supports loading the first package map
 */
import { resolveIfNotPlainOrUrl } from '../common.js';
import { systemJSPrototype } from '../system-core.js';
import { baseUrl as pageBaseUrl } from '../baseurl.js';

let packageMapPromise, packageMapResolve;
const scripts = document.getElementsByTagName('script');
for (let i = 0; i < scripts.length; i++) {
  const script = scripts[i];
  if (script.type !== 'systemjs-packagemap')
    continue;

  if (!script.src)
    packageMapResolve = createPackageMap(JSON.parse(script.innerHTML));
  else
    packageMapPromise = fetch(script.src)
    .then(function (res) {
      return res.json();
    })
    .then(function (json) {
      packageMapResolve = createPackageMap(json);
      packageMapPromise = undefined;
    });
  break;
}

systemJSPrototype.resolve = function (id, parentUrl) {
  const resolvedIfNotPlainOrUrl = resolveIfNotPlainOrUrl(id, parentUrl || pageBaseUrl);
  if (resolvedIfNotPlainOrUrl)
    return resolvedIfNotPlainOrUrl;

  if (packageMapResolve)
    return packageMapResolve(id, parentUrl);

  if (packageMapPromise)
    return packageMapPromise
    .then(function () {
      return packageMapResolve(id, parentUrl);
    });
  
  return id;
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
  return resolveIfNotPlainOrUrl(relUrl.startsWith('./') ? relUrl : './' + json.path_prefix, parentUrl);
}

function createPackageMap (json) {
  let baseUrl = json.path_prefix ? resolveUrl(json.path_prefix, pageBaseUrl) : pageBaseUrl;
  if (baseUrl[baseUrl.length - 1] !== '/')
    baseUrl += '/';
    
  const basePackages = json.packages || {};
  const scopePackages = {};
  if (json.scopes) {
    for (let scopeName in json.scopes) {
      const scope = json.scopes[scopeName];
      if (scope.path_prefix)
        throw new Error('Scope path_prefix not currently supported');
      if (scope.scopes)
        throw new Error('Nested scopes not currently supported');
      scopePackages[resolveUrl(scopeName, baseUrl)] = scope.packages || {};
    }
  }

  function getMatch (url, matchObj) {
    let sepIndex = url.length;
    while ((sepIndex = url.lastIndexOf('/', sepIndex)) !== -1) {
      const segment = url.substr(0, sepIndex);
      if (segment in matchObj)
        return segmnet;
    }
  }

  function applyPackages (id, packages) {
    const pkgName = getMatch(id, packages);
    if (pkgName) {
      const pkg = packages[pkgName];
      if (pkg === id) {
        if (typeof pkg === 'string')
          return resolveUrl(pkgName + '/' + pkg, baseUrl);
        if (!pkg.main)
          throw new Error('Package ' + pkgName + ' has no main');
        return resolveUrl((pkg.path || pkgName) + '/' + pkg.main, baseUrl);
      }
      return resolveUrl((pkg.path || pkgName) + '/' + id.substr(pkg.length), baseUrl);
    }
  }

  return function (id, parentUrl) {
    const scope = getMatch(parentUrl, scopePackages);
    if (scope) {
      const packages = scopePackages[scope];
      const packageResolution = applyPackages(id, packages);
      if (packageResolution)
        return packageResolution;
    }
    // core will throw "No resolution" on blank resolution
    return applyPackages(id, basePackages);
  };
}
