/*
  SystemJS Semver Version Addon

  When requesting a module from a package that contains a version suffix
  with the following semver ranges:
    module      - any version
    module@1    - major version 1, any minor
    module@1.2  - minor version 1.2, any patch

  First check the already-requested packages to see if there are any packages 
  that would match the same package and version range.

  If so, request from this same version directly.

  This provides a greedy algorithm as a simple fix for sharing version-managed
  dependencies as much as possible, which can later be optimized through map 
  configuration created out of deeper version tree analysis.

  Note this addon should be provided after all other normalize overrides.

  The full list of versions can be found at System.versions providing an insight
  into any possible version forks.

  It is also possible to create version solution hints on the System global:

  System.versions = {
    jquery: ['1.9.2'],
    bootstrap: ['3.0.1']
  };

  When a matching semver request is made (jquery@1.9, jquery@1, bootstrap@3)
  they will be converted into one of these more specific versions first.
*/

(function() {
  // match x, x.y and x.y.z
  var semverRegEx = /^(\d+)(?:\.(\d+))?(?:\.(\d+))?$/;

  var semverCompare = function(v1, v2) {
    var v1Parts = v1.split('.');
    var v2Parts = v2.split('.');

    if (v1Parts[0] != v2Parts[0])
      return v1Parts[0] > v2Parts[0];

    if (!v1Parts[1])
      return false;

    if (!v2Parts[1])
      return true;

    if (v1Parts[1] != v2Parts[1])
      return v1Parts[1] > v2Parts[1];

    if (!v1Parts[2])
      return false;

    if (!v2Parts[2])
      return true;

    if (v1Parts[2] != v2Parts[2])
      return v1Parts[2] > v2Parts[2];

    return true;
  }
  
  var systemNormalize = System.normalize;

  var packageVersions = System.versions = {};

  // hook normalize and store a record of all versioned packages
  System.normalize = function(name, parentName, parentAddress) {
    // run all other normalizers first
    return Promise.resolve(systemNormalize.call(this, name, parentName, parentAddress)).then(function(normalized) {
      
      var version, semverMatch, nextChar;
      var index = normalized.indexOf('@');

      // see if this module corresponds to a package already in out versioned packages list
      
      // no version specified - check against the list
      if (index == -1) {
        for (var p in packageVersions) {
          if (normalized.substr(0, p.length) != p)
            continue;

          nextChar = normalized.charAt(p.length);

          if (nextChar && nextChar != '/')
            continue;

          // match -> take any version
          return p + '@' + packageVersions[p][0] + normalized.substr(p.length);
        }
        return normalized;
      }

      // get the version info
      version = normalized.substr(index + 1).split('/')[0];
      semverMatch = version.match(semverRegEx);

      // if not a semver, we cant help
      if (!semverMatch)
        return normalized;

      var packageName = normalized.substr(0, index);
      var versions = packageVersions[packageName] = packageVersions[packageName] || [];


      // look for a version match
      // if an exact semver, theres nothing to match, just record it
      if (!semverMatch[3])
        for (var i = versions.length - 1; i >= 0; i--) {
          var curVersion = versions[i];
          // if I have requested x.y, find an x.y.z
          // if I have requested x, find any x.y / x.y.z
          if (curVersion.substr(0, version.length) == version && curVersion.charAt(version.length) == '.')
            return packageName + '@' + curVersion + normalized.substr(packageName.length + version.length + 1);
        }

      // record the package and semver for reuse
      if (versions.indexOf(version) == -1) {
        versions.push(version);

        // if there is a x.y of this version in the list, remove that now
        if (semverMatch[2] && (index = versions.indexOf(semverMatch[1] + '.' + semverMatch[2])) != -1)
          versions.splice(index, 1);

        // if there is an x of this version in the list, remove that now
        if ((index = versions.indexOf(semverMatch[1])) != -1)
          versions.splice(index, 1);

        versions.sort(semverCompare);
      }

      return normalized;
    });
  }

})();