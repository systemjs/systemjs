/*
  SystemJS Semver Version Addon
  
  1. Uses Semver convention for major and minor forms

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
  dependencies as much as possible, which can later be optimized through version
  hint configuration created out of deeper version tree analysis.
  
  2. Semver-compatibility syntax (caret operator - ^)

  Compatible version request support is then also provided for:

    module@^1.2.3        - module@1, >=1.2.3
    module@^1.2          - module@1, >=1.2.0
    module@^1            - module@1
    module@^0.5.3        - module@0.5, >= 0.5.3
    module@^0.0.1        - module@0.0.1

  The ^ symbol is always normalized out to a normal version request.

  This provides comprehensive semver compatibility.
  
  3. System.versions version hints and version report

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

function versions(loader) {
  if (typeof indexOf == 'undefined')
    indexOf = Array.prototype.indexOf;

  // match x, x.y, x.y.z, x.y.z-prerelease.1+build
  var semverRegEx = /^(\d+)(?:\.(\d+)(?:\.(\d+)(?:-([\da-z-]+(?:\.[\da-z-]+)*)(?:\+([\da-z-]+(?:\.[\da-z-]+)*))?)?)?)?$/i;
  var numRegEx = /^\d+$/;

  function toInt(num) {
    return parseInt(num, 10);
  }

  var semverCompare = function(v1, v2) {
    var semver1 = v1.match(semverRegEx);
    var semver2 = v2.match(semverRegEx);

    // not semvers - just sort string tags
    if (!semver1 && !semver2)
      return semver1 > semver2 ? 1 : -1;

    // semver beats non-semver
    if (!semver1)
      return -1;
    if (!semver2)
      return 1;

    // compare version numbers
    for (var i = 1; i <= 3; i++) {
      if (semver1[i] == semver2[i])
       continue;
      // missing numbers take lower precedence
      if (!semver1[i])
        return -1;
      else if (!semver2[i])
        return 1;
      return toInt(semver1[i]) > toInt(semver2[i]) ? 1 : -1;
    }

    if (semver1[4] == semver2[4])
      return 0;

    // compare prereleases
    if (!semver1[4])
      return 1;
    if (!semver2[4])
      return -1;

    // prerelease comparison
    var prerelease1 = semver1[4].split('.');
    var prerelease2 = semver2[4].split('.');
    for (var i = 0, l = Math.min(prerelease1.length, prerelease2.length); i < l; i++) {
      if (prerelease1[i] == prerelease2[i])
        continue;

      var isNum1 = prerelease1[i].match(numRegEx);
      var isNum2 = prerelease2[i].match(numRegEx);
      
      // numeric has lower precedence
      if (isNum1 && !isNum2)
        return -1;
      if (isNum2 && !isNum1)
        return 1;
    
      // compare parts
      if (isNum1 && isNum2)
        return toInt(prerelease1[i]) > toInt(prerelease2[i]) ? 1 : -1;
      else
        return prerelease1[i] > prerelease2[i] ? 1 : -1;
    }
    
    if (prerelease1.length == prerelease2.length)
      return 0;
    
    // more pre-release fields win if equal
    return prerelease1.length > prerelease2.length ? 1 : -1;
  }
  

  loader.versions = loader.versions || {};

  var loaderNormalize = loader.normalize;
  loader.normalize = function(name, parentName, parentAddress) {
    if (!loader.versions)
      loader.versions = {};
    var packageVersions = this.versions;

    // strip the version before applying map config
    var stripVersion, stripSubPathLength;
    if (name.indexOf('@') > 0) {
      var versionIndex = name.lastIndexOf('@');
      var parts = name.substr(versionIndex + 1, name.length - versionIndex - 1).split('/');
      stripVersion = parts[0];
      stripSubPathLength = parts.length;
      name = name.substr(0, versionIndex) + name.substr(versionIndex + stripVersion.length + 1, name.length - versionIndex - stripVersion.length - 1);
    }

    // run all other normalizers first
    return Promise.resolve(loaderNormalize.call(this, name, parentName, parentAddress)).then(function(normalized) {
      
      var version, semverMatch, nextChar, versions;
      var index = normalized.indexOf('@');

      // if we stripped a version, and it still has no version, add it back
      if (stripVersion && (index == -1 || index == 0)) {
        var parts = normalized.split('/');
        parts[parts.length - stripSubPathLength] += '@' + stripVersion;
        normalized = parts.join('/');
        index = normalized.indexOf('@');
      }

      // see if this module corresponds to a package already in our versioned packages list
      
      // no version specified - check against the list (given we don't know the package name)
      if (index == -1 || index == 0) {
        for (var p in packageVersions) {
          versions = packageVersions[p];
          if (normalized.substr(0, p.length) != p)
            continue;

          nextChar = normalized.substr(p.length, 1);

          if (nextChar && nextChar != '/')
            continue;

          // match -> take latest version
          return p + '@' + (typeof versions == 'string' ? versions : versions[versions.length - 1]) + normalized.substr(p.length);
        }
        return normalized;
      }

      // get the version info
      version = normalized.substr(index + 1).split('/')[0];
      var versionLength = version.length;

      var minVersion;
      if (version.substr(0, 1) == '^') {
        version = version.substr(1);
        minVersion = true;
      }

      semverMatch = version.match(semverRegEx);

      // if not a semver, we cant help
      if (!semverMatch)
        return normalized;

      // translate '^' in range to simpler range form
      if (minVersion) {
        // ^0 -> 0
        // ^1 -> 1
        if (!semverMatch[2])
          minVersion = false;
        
        if (!semverMatch[3]) {
          
          // ^1.1 -> ^1.1.0
          if (semverMatch[2] > 0)
            semverMatch[3] = '0';

          // ^0.1 -> 0.1
          // ^0.0 -> 0.0
          else
            minVersion = false;
        }
      }

      if (minVersion) {
        // >= 1.0.0
        if (semverMatch[1] > 0) {
          if (!semverMatch[2])
            version = semverMatch[1] + '.0.0';
          if (!semverMatch[3])
            version = semverMatch[1] + '.0';
          minVersion = version;
          semverMatch = [semverMatch[1]];
        }
        // >= 0.1.0
        else if (semverMatch[2] > 0) {
          minVersion = version;
          semverMatch = [0, semverMatch[2]];
        }
        // >= 0.0.0
        else {
          // NB compatible with prerelease is just prelease itself?
          minVersion = false;
          semverMatch = [0, 0, semverMatch[3]];
        }
        version = semverMatch.join('.');
      }

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
          if (curVersion.substr(0, version.length) == version && curVersion.substr(version.length, 1).match(/^[\.\-]?$/)) {
            // if a minimum version, then check too
            if (!minVersion || minVersion && semverCompare(curVersion, minVersion) != -1)
              return packageName + '@' + curVersion + normalized.substr(packageName.length + versionLength + 1);
          }
        }

      // no match
      // record the package and semver for reuse since we're now asking the server
      // x.y and x versions will now be latest by default, so they are useful in the version list
      if (indexOf.call(versions, version) == -1) {
        versions.push(version);
        versions.sort(semverCompare);

        normalized = packageName + '@' + version + normalized.substr(packageName.length + versionLength + 1);

        // if this is an x.y.z, remove any x.y, x
        // if this is an x.y, remove any x
        if (semverMatch[3] && (index = indexOf.call(versions, semverMatch[1] + '.' + semverMatch[2])) != -1)
          versions.splice(index, 1);
        if (semverMatch[2] && (index = indexOf.call(versions, semverMatch[1])) != -1)
          versions.splice(index, 1);

        packageVersions[packageName] = versions.length == 1 ? versions[0] : versions;
      }

      return normalized;
    });
  }
}
