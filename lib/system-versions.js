/*
  SystemJS Semver Version Addon

  Supports requesting a module from a package that contains a version suffix
  with the following semver ranges:
    module       - any version
    module@1     - major version 1, any minor (not prerelease)
    module@1.2   - minor version 1.2, any patch (not prerelease)
    module@1.2.3 - exact version

  It is assumed that these modules are provided by the server / file system.

  First checks the already-requested packages to see if there are any packages 
  that would match the same package and version range.

  This provides a greedy algorithm as a simple fix for sharing version-managed
  dependencies as much as possible, which can later be optimized through map 
  configuration created out of deeper version tree analysis.

  Compatible version request support is then also provided for:

    module@^1.2.3        - module@1, >=1.2.3
    module@^1.2          - module@1, >=1.2.0
    module@^1            - module@1
    module@^0.5.3        - module@0.5, >= 0.5.3
    module@^0.0.1        - module@0.0.1

  The ^ symbol is always normalized out to a normal version request.

  This provides comprehensive semver compatibility.

  Note this addon should be provided after all other normalize overrides.

  The full list of versions can be found at System.versions providing an insight
  into any possible version forks.

  It is also possible to create version solution hints on the System global:

  System.versions = {
    jquery: ['1.9.2', '2.0.3'],
    bootstrap: '3.0.1'
  };

  Versions can be an array or string for a single version.

  When a matching semver request is made (jquery@1.9, jquery@1, bootstrap@3)
  they will be converted to the latest version match contained here, if present.

  Prereleases in this versions list are also allowed to satisfy ranges when present.
*/

(function() {
  // match x, x.y, x.y.z, x.y.z-prerelease.1
  var semverRegEx = /^(\d+)(?:\.(\d+)(?:\.(\d+)(?:-([0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*))?)?)?$/;

  var semverCompare = function(v1, v2) {
    var v1Parts = v1.split('.');
    var v2Parts = v2.split('.');
    var prereleaseIndex;
    if (v1Parts[2] && (prereleaseIndex = v1Parts[2].indexOf('-')) != -1)
      v1Parts.splice(2, 1, v1Parts[2].substr(0, prereleaseIndex), v1Parts[2].substr(prereleaseIndex + 1));
    if (v2Parts[2] && (prereleaseIndex = v2Parts[2].indexOf('-')) != -1)
      v2Parts.splice(2, 1, v2Parts[2].substr(0, prereleaseIndex), v2Parts[2].substr(prereleaseIndex + 1));
    for (var i = 0; i < Math.max(v1Parts.length, v2Parts.length); i++) {
      if (!v1Parts[i])
        return true;
      else if (!v2Parts[i])
        return false;
      if (v1Parts[i] != v2Parts[i])
        return v1Parts[i] > v2Parts[i];
    }
    return true;
  }
  
  var systemNormalize = System.normalize;

  System.versions = {};

  // hook normalize and store a record of all versioned packages
  System.normalize = function(name, parentName, parentAddress) {
    var packageVersions = System.versions;
    // run all other normalizers first
    return Promise.resolve(systemNormalize.call(this, name, parentName, parentAddress)).then(function(normalized) {
      
      var version, semverMatch, nextChar, versions;
      var index = normalized.indexOf('@');

      // see if this module corresponds to a package already in out versioned packages list
      
      // no version specified - check against the list (given we don't know the package name)
      if (index == -1) {
        for (var p in packageVersions) {
          versions = packageVersions[p];
          if (typeof versions == 'string')
            versions = [versions];
          if (normalized.substr(0, p.length) != p)
            continue;

          nextChar = normalized.charAt(p.length);

          if (nextChar && nextChar != '/')
            continue;

          // match -> take latest version
          return p + '@' + versions[versions.length - 1] + normalized.substr(p.length);
        }
        return normalized;
      }

      // get the version info
      version = normalized.substr(index + 1).split('/')[0];

      var minVersion;
      if (version.substr(0, 1) == '^') {
        version = version.substr(1);
        minVersion = true;
      }

      semverMatch = version.match(semverRegEx);

      // translate '^' handling as described above
      if (minVersion) {
        if (semverMatch[1] > 0) {
          minVersion = version;
          version = semverMatch[0];
          semverMatch = [semverMatch[1]];
        }
        else if (semverMatch[2] > 0) {
          minVersion = version;
          semverMatch = [0, semverMatch[2]];
        }
        else {
          semverMatch = [semverMatch[1]]
          minVersion = false;
        }
        version = semverMatch.join('.');

        // remove the ^ now
        normalized = normalized.substr(0, index + 1) + version;
      }

      // if not a semver, we cant help
      if (!semverMatch)
        return normalized;

      var packageName = normalized.substr(0, index);

      versions = packageVersions[packageName] || [];

      if (typeof versions == 'string')
        versions = [versions];

      // look for a version match
      // if an exact semver, theres nothing to match, just record it
      if (!semverMatch[3] || minVersion)
        for (var i = versions.length - 1; i >= 0; i--) {
          var curVersion = versions[i];
          // if I have requested x.y, find an x.y.z-b
          // if I have requested x, find any x.y / x.y.z-b
          if (curVersion.substr(0, version.length) == version && curVersion.charAt(version.length) == '.') {
            // if a minimum version, then check too
            if (!minVersion || minVersion && semverCompare(curVersion, minVersion))
              return packageName + '@' + curVersion + normalized.substr(packageName.length + version.length + 1);
          }
        }

      // record the package and semver for reuse since we're now asking the server
      // x.y and x versions will now be latest by default, so they are useful in the version list
      if (versions.indexOf(version) == -1) {
        versions.push(version);
        versions.sort(semverCompare);
        packageVersions[packageName] = versions.length == 1 ? versions[0] : versions;

        // could also add a catch here to another System.import, so if the import fails we can remove the version
      }

      return normalized;
    });
  }

})();