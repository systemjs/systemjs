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

  loader._extensions.push(versions);

  var semverRegEx = /^(\d+)(?:\.(\d+)(?:\.(\d+)(?:-([\da-z-]+(?:\.[\da-z-]+)*)(?:\+([\da-z-]+(?:\.[\da-z-]+)*))?)?)?)?$/i;
  var numRegEx = /^\d+$/;

  function toInt(num) {
    return parseInt(num, 10);
  }

  function parseSemver(v) {
    var semver = v.match(semverRegEx);
    if (!semver)
      return {
        tag: v
      };
    else
      return {
        major: toInt(semver[1]),
        minor: toInt(semver[2]),
        patch: toInt(semver[3]),
        pre: semver[4] && semver[4].split('.')
      };
  }

  var parts = ['major', 'minor', 'patch'];
  function semverCompareParsed(v1, v2) {
    // not semvers - tags have equal precedence
    if (v1.tag && v2.tag)
      return 0;

    // semver beats non-semver
    if (v1.tag)
      return -1;
    if (v2.tag)
      return 1;

    // compare version numbers
    for (var i = 0; i < parts.length; i++) {
      var part = parts[i];
      var part1 = v1[part];
      var part2 = v2[part];
      if (part1 == part2)
        continue;
      if (isNaN(part1))
        return -1;
      if (isNaN(part2))
        return 1;
      return part1 > part2 ? 1 : -1;
    }

    if (!v1.pre && !v2.pre)
      return 0;

    if (!v1.pre)
      return 1;
    if (!v2.pre)
      return -1;

    // prerelease comparison
    for (var i = 0, l = Math.min(v1.pre.length, v2.pre.length); i < l; i++) {
      if (v1.pre[i] == v2.pre[i])
        continue;

      var isNum1 = v1.pre[i].match(numRegEx);
      var isNum2 = v2.pre[i].match(numRegEx);
      
      // numeric has lower precedence
      if (isNum1 && !isNum2)
        return -1;
      if (isNum2 && !isNum1)
        return 1;

      // compare parts
      if (isNum1 && isNum2)
        return toInt(v1.pre[i]) > toInt(v2.pre[i]) ? 1 : -1;
      else
        return v1.pre[i] > v2.pre[i] ? 1 : -1;
    }

    if (v1.pre.length == v2.pre.length)
      return 0;

    // more pre-release fields win if equal
    return v1.pre.length > v2.pre.length ? 1 : -1;
  }

  // match against a parsed range object
  // saves operation repetition
  // doesn't support tags
  // if not semver or fuzzy, assume exact
  function matchParsed(range, version) {
    var rangeVersion = range.version;

    if (rangeVersion.tag)
      return rangeVersion.tag == version.tag;

    // if the version is less than the range, it's not a match
    if (semverCompareParsed(rangeVersion, version) == 1)
      return false;

    // now we just have to check that the version isn't too high for the range
    if (isNaN(version.minor) || isNaN(version.patch))
      return false;

    // if the version has a prerelease, ensure the range version has a prerelease in it
    // and that we match the range version up to the prerelease exactly
    if (version.pre) {
      if (!(rangeVersion.major == version.major && rangeVersion.minor == version.minor && rangeVersion.patch == version.patch))
        return false;
      return range.semver || range.fuzzy || rangeVersion.pre.join('.') == version.pre.join('.');
    }

    // check semver range
    if (range.semver) {
      // ^0
      if (rangeVersion.major == 0 && isNaN(rangeVersion.minor))
        return version.major < 1;
      // ^1..
      else if (rangeVersion.major >= 1)
        return rangeVersion.major == version.major;
      // ^0.1, ^0.2
      else if (rangeVersion.minor >= 1)
        return rangeVersion.minor == version.minor;
      // ^0.0.0
      else
        return (rangeVersion.patch || 0) == version.patch;
    }

    // check fuzzy range
    if (range.fuzzy)
      return version.major == rangeVersion.major && version.minor < (rangeVersion.minor || 0) + 1;

    // exact match
    // eg 001.002.003 matches 1.2.3
    return !rangeVersion.pre && rangeVersion.major == version.major && rangeVersion.minor == version.minor && rangeVersion.patch == version.patch;
  }

  /*
   * semver       - is this a semver range
   * fuzzy        - is this a fuzzy range
   * version      - the parsed version object
   */
  function parseRange(range) {
    var rangeObj = {};

    ((rangeObj.semver = range.substr(0, 1) == '^') 
        || (rangeObj.fuzzy = range.substr(0, 1) == '~')
    ) && (range = range.substr(1));

    var rangeVersion = rangeObj.version = parseSemver(range);

    if (rangeVersion.tag)
      return rangeObj;

    // 0, 0.1 behave like ~0, ~0.1
    if (!rangeObj.fuzzy && !rangeObj.semver && (isNaN(rangeVersion.minor) || isNaN(rangeVersion.patch)))
      rangeObj.fuzzy = true;

    // ~1, ~0 behave like ^1, ^0
    if (rangeObj.fuzzy && isNaN(rangeVersion.minor)) {
      rangeObj.semver = true;
      rangeObj.fuzzy = false;
    }

    // ^0.0 behaves like ~0.0
    if (rangeObj.semver && !isNaN(rangeVersion.minor) && isNaN(rangeVersion.patch)) {
      rangeObj.semver = false;
      rangeObj.fuzzy = true;
    }

    return rangeObj;
  }

  function semverCompare(v1, v2) {
    return semverCompareParsed(parseSemver(v1), parseSemver(v2));
  }

  loader.versions = loader.versions || {};

  var loaderNormalize = loader.normalize;
  // NOW use modified match algorithm if possible
  loader.normalize = function(name, parentName, parentAddress) {
    if (!this.versions)
      this.versions = {};
    var packageVersions = this.versions;

    // strip the version before applying map config
    var stripVersion, stripSubPathLength;
    var versionIndex = name.indexOf('!') != -1 ? 0 : name.lastIndexOf('@');
    if (versionIndex > 0) {
      var parts = name.substr(versionIndex + 1, name.length - versionIndex - 1).split('/');
      stripVersion = parts[0];
      stripSubPathLength = parts.length;
      name = name.substr(0, versionIndex) + name.substr(versionIndex + stripVersion.length + 1, name.length - versionIndex - stripVersion.length - 1);
    }

    // run all other normalizers first
    return Promise.resolve(loaderNormalize.call(this, name, parentName, parentAddress)).then(function(normalized) {
      
      var index = normalized.indexOf('!') != -1 ? 0 : normalized.indexOf('@');

      // if we stripped a version, and it still has no version, add it back
      if (stripVersion && (index == -1 || index == 0)) {
        var parts = normalized.split('/');
        parts[parts.length - stripSubPathLength] += '@' + stripVersion;
        normalized = parts.join('/');
        index = normalized.indexOf('@');
      }

      // see if this module corresponds to a package already in our versioned packages list
      
      // no version specified - check against the list (given we don't know the package name)
      var nextChar, versions;
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
      var packageName = normalized.substr(0, index);
      var range = normalized.substr(index + 1).split('/')[0];
      var rangeLength = range.length;
      var parsedRange = parseRange(normalized.substr(index + 1).split('/')[0]);
      versions = packageVersions[normalized.substr(0, index)] || [];
      if (typeof versions == 'string')
        versions = [versions];

      // find a match in our version list
      for (var i = versions.length - 1; i >= 0; i--) {
        if (matchParsed(parsedRange, parseSemver(versions[i])))
          return packageName + '@' + versions[i] + normalized.substr(index + rangeLength + 1);
      }

      // no match found -> send a request to the server
      var versionRequest;
      if (parsedRange.semver) {
        versionRequest = parsedRange.version.major == 0 && !isNaN(parsedRange.version.minor) ? '0.' + parsedRange.version.minor : parsedRange.version.major;
      }
      else if (parsedRange.fuzzy) {
        versionRequest = parsedRange.version.major + '.' + parsedRange.version.minor;
      }
      else {
        versionRequest = range;
        versions.push(range);
        versions.sort(semverCompare);
        packageVersions[packageName] = versions.length == 1 ? versions[0] : versions;
      }

      return packageName + '@' + versionRequest + normalized.substr(index + rangeLength + 1);
    });
  }
}
