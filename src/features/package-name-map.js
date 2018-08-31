/*
 * Package name map support for SystemJS
 * 
 * <script type="systemjs-packagemap">{}</script>
 * OR
 * <script type="systemjs-packagemap" src=package.json></script>
 * 
 * Only supports loading the first package map
 */
import { resolveIfNotPlainOrUrl, baseUrl as pageBaseUrl, createPackageMap } from '../common.js';
import { systemJSPrototype } from '../system-core.js';

let packageMapPromise, packageMapResolve;
if (typeof document !== 'undefined') {
  const scripts = document.getElementsByTagName('script');
  for (let i = 0; i < scripts.length; i++) {
    const script = scripts[i];
    if (script.type !== 'systemjs-packagemap')
      continue;

    if (!script.src) {
      packageMapResolve = createPackageMap(JSON.parse(script.innerHTML), pageBaseUrl);
      packageMapPromise = Promise.resolve();
    }
    else {
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
    }
    break;
  }
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