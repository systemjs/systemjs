/*
 * SystemJS
 * 
 * Copyright (c) 2013 Guy Bedford
 * MIT License
 */

(function(global) {

global.upgradeSystemLoader = function() {
  global.upgradeSystemLoader = undefined;// Define an IE-friendly shim good-enough for purposes
var indexOf = Array.prototype.indexOf || function(item) { 
  for (var i = 0, thisLen = this.length; i < thisLen; i++) {
    if (this[i] === item)
      return i;
  }
  return -1;
}

var lastIndexOf = Array.prototype.lastIndexOf || function(c) {
  for (var i = this.length - 1; i >= 0; i--) {
    if (this[i] === c) {
      return i;
    }
  }
  return -i;
}/*
  SystemJS Core
  Adds normalization to the import function, as well as __useDefault support
*/
function core(loader) {
  var curSystem = System;

  /*
    __useDefault
    
    When a module object looks like:
    new Module({
      __useDefault: true,
      default: 'some-module'
    })

    Then the import of that module is taken to be the 'default' export and not the module object itself.

    Useful for module.exports = function() {} handling
  */
  var checkUseDefault = function(module) {
    if (!(module instanceof Module)) {
      var out = [];
      for (var i = 0; i < module.length; i++)
        out[i] = checkUseDefault(module[i]);
      return out;
    }
    return module.__useDefault ? module['default'] : module;
  }
  
  // a variation on System.get that does the __useDefault check
  loader.getModule = function(key) {
    return checkUseDefault(loader.get(key));  
  }

  // support the empty module, as a concept
  loader.set('@empty', Module({}));
  
  
  var loaderImport = loader['import'];
  loader['import'] = function(name, options) {
    // patch loader.import to do normalization
    return new Promise(function(resolve) {
      resolve(loader.normalize.call(this, name, options && options.name, options && options.address))
    })
    // add useDefault support
    .then(function(name) {
      return Promise.resolve(loaderImport.call(loader, name, options)).then(function(module) {
        return checkUseDefault(module);
      });
    });
  }

  // Absolute URL parsing, from https://gist.github.com/Yaffle/1088850
  function parseURI(url) {
    var m = String(url).replace(/^\s+|\s+$/g, '').match(/^([^:\/?#]+:)?(\/\/(?:[^:@]*(?::[^:@]*)?@)?(([^:\/?#]*)(?::(\d*))?))?([^?#]*)(\?[^#]*)?(#[\s\S]*)?/);
    // authority = '//' + user + ':' + pass '@' + hostname + ':' port
    return (m ? {
      href     : m[0] || '',
      protocol : m[1] || '',
      authority: m[2] || '',
      host     : m[3] || '',
      hostname : m[4] || '',
      port     : m[5] || '',
      pathname : m[6] || '',
      search   : m[7] || '',
      hash     : m[8] || ''
    } : null);
  }
  function toAbsoluteURL(base, href) {
    function removeDotSegments(input) {
      var output = [];
      input.replace(/^(\.\.?(\/|$))+/, '')
        .replace(/\/(\.(\/|$))+/g, '/')
        .replace(/\/\.\.$/, '/../')
        .replace(/\/?[^\/]*/g, function (p) {
          if (p === '/..')
            output.pop();
          else
            output.push(p);
      });
      return output.join('').replace(/^\//, input.charAt(0) === '/' ? '/' : '');
    }

    href = parseURI(href || '');
    base = parseURI(base || '');

    return !href || !base ? null : (href.protocol || base.protocol) +
      (href.protocol || href.authority ? href.authority : base.authority) +
      removeDotSegments(href.protocol || href.authority || href.pathname.charAt(0) === '/' ? href.pathname : (href.pathname ? ((base.authority && !base.pathname ? '/' : '') + base.pathname.slice(0, base.pathname.lastIndexOf('/') + 1) + href.pathname) : base.pathname)) +
      (href.protocol || href.authority || href.pathname ? href.search : (href.search || base.search)) +
      href.hash;
  }
  var baseURI;
  if (typeof window == 'undefined') {
    baseURI = __dirname;
  }
  else {
    baseURI = document.baseURI;
    if (!baseURI) {
      var bases = document.getElementsByTagName('base');
      baseURI = bases[0] && bases[0].href || window.location.href;
    }
  }

  // System.meta provides default metadata
  System.meta = {};

  // override locate to allow baseURL to be document-relative
  var loaderLocate = loader.locate;
  var normalizedBaseURL;
  loader.locate = function(load) {
    if (this.baseURL != normalizedBaseURL)
      this.baseURL = normalizedBaseURL = toAbsoluteURL(baseURI, this.baseURL);

    var meta = System.meta[load.name];
    for (var p in meta)
      load.metadata[p] = meta[p];

    return Promise.resolve(loaderLocate.call(this, load));
  }

  // define exec for custom instan
  loader.__exec = function(load) {
    try {
      Function('global', 'with(global) { ' + load.source + ' \n }'
      + (load.address && !load.source.match(/\/\/[@#] ?(sourceURL|sourceMappingURL)=([^\n'"]+)/)
      ? '\n//# sourceURL=' + load.address : '')).call(loader.global, loader.global);
    }
    catch(e) {
      if (e.name == 'SyntaxError')
        e.message = 'Evaluating ' + load.address + '\n\t' + e.message;
      throw e;
    }
    // traceur overwrites System - write it back
    if (load.name == '@traceur') {
      loader.global.traceurSystem = loader.global.System;
      loader.global.System = curSystem;
    }
  }
}function amdScriptLoader(loader) {

  var head = document.getElementsByTagName('head')[0];

  // override fetch to use script injection
  loader.fetch = function(load) {
    // if already defined, skip
    if (loader.defined[load.name])
      return '';

    // script injection fetch system
    return new Promise(function(resolve, reject) {
      var s = document.createElement('script');
      s.async = true;
      s.addEventListener('load', function(evt) {
        if (lastAnonymous)
          loader.defined[load.name] = lastAnonymous;
        lastAnonymous = null;
        resolve('');
      }, false);
      s.addEventListener('error', function(err) {
        reject(err);
      }, false);
      s.src = load.address;
      head.appendChild(s);
    });
  }
  var lastAnonymous = null;
  loader.global.define = function(name, deps, factory) {
    // anonymous define
    if (typeof name != 'string') {
      factory = deps;
      deps = name;
      name = null;
    }

    if (!(deps instanceof Array)) {
      factory = deps;
      deps = [];
    }

    if (typeof factory != 'function')
      factory = (function(factory) {
        return function() { return factory; }
      })(factory);

    for (var i = 0; i < deps.length; i++)
      if (lastIndexOf.call(deps, deps[i]) != i)
        deps.splice(i--, 1);

    var instantiate = {
      deps: deps,
      execute: function() {
        var args = [];
        for (var i = 0; i < arguments.length; i++)
          args.push(loader.getModule(arguments[i]));

        var output = factory.apply(this, args);
        return new loader.global.Module(output && output.__esModule ? output : { __useDefault: true, 'default': output });
      }
    };

    if (name)
      loader.defined[name] = instantiate;
    else
      lastAnonymous = instantiate;
  }
  loader.global.define.amd = {};  

  // no translate at all
  loader.translate = function() {}

  // instantiate defaults to null
  loader.instantiate = function() {
    return {
      deps: [],
      execute: function() {
        return new Module({});
      }
    };
  }


  /*
    AMD-compatible require
    To copy RequireJS, set window.require = window.requirejs = loader.requirejs
  */
  var require = loader.requirejs = function(names, callback, errback, referer) {
    // in amd, first arg can be a config object... we just ignore
    if (typeof names == 'object' && !(names instanceof Array))
      return require.apply(null, Array.prototype.splice.call(arguments, 1, arguments.length - 1));

    // amd require
    if (names instanceof Array)
      Promise.all(names.map(function(name) {
        return loader['import'](name, referer);
      })).then(function(mods) {
        return callback.apply(this, mods);
      }, errback);

    // commonjs require
    else if (typeof names == 'string')
      return loader.getModule(names);

    else
      throw 'Invalid require';
  }

}
/*
  System bundles

  Allows a bundle module to be specified which will be dynamically 
  loaded before trying to load a given module.

  For example:
  System.bundles['mybundle'] = ['jquery', 'bootstrap/js/bootstrap']

  Will result in a load to "mybundle" whenever a load to "jquery"
  or "bootstrap/js/bootstrap" is made.

  In this way, the bundle becomes the request that provides the module
*/

function bundles(loader) {
  // bundles support (just like RequireJS)
  // bundle name is module name of bundle itself
  // bundle is array of modules defined by the bundle
  // when a module in the bundle is requested, the bundle is loaded instead
  // of the form System.bundles['mybundle'] = ['jquery', 'bootstrap/js/bootstrap']
  loader.bundles = loader.bundles || {};

  var loaderFetch = loader.fetch;
  loader.fetch = function(load) {
    // if this module is in a bundle, load the bundle first then
    for (var b in loader.bundles) {
      if (indexOf.call(loader.bundles[b], load.name) == -1)
        continue;
      // we do manual normalization in case the bundle is mapped
      // this is so we can still know the normalized name is a bundle
      return Promise.resolve(loader.normalize(b))
      .then(function(normalized) {
        loader.bundles[normalized] = loader.bundles[normalized] || loader.bundles[b];
        return loader.load(normalized);
      })
      .then(function() {
        return '';
      });
    }
    return loaderFetch.apply(this, arguments);
  }

  var loaderLocate = loader.locate;
  loader.locate = function(load) {
    if (loader.bundles[load.name])
      load.metadata.bundle = true;
    return loaderLocate.call(this, load);
  }

  var loaderInstantiate = loader.instantiate;
  loader.instantiate = function(load) {
    // if it is a bundle itself, it doesn't define anything
    if (load.metadata.bundle)
      return {
        deps: [],
        execute: function() {
          loader.__exec(load);
          return new Module({});
        }
      };

    return loaderInstantiate.apply(this, arguments);
  }

}/*
  Implementation of the loader.register bundling method

  This allows the output of Traceur to populate the
  module registry of the loader loader
*/

function register(loader) {

  // instantiation cache for loader.register
  loader.defined = {};

  // register a new module for instantiation
  loader.register = function(name, deps, execute) {
    loader.defined[name] = {  
      deps: deps,
      execute: function() {
        return Module(execute.apply(this, arguments));
      }
    };
  }
  
  var loaderFetch = loader.fetch;
  loader.fetch = function(load) {
    // if the module is already defined, skip fetch
    if (loader.defined[load.name])
      return '';
    return loaderFetch.apply(this, arguments);
  }

  var loaderInstantiate = loader.instantiate;
  loader.instantiate = function(load) {
    // if the module has been defined by a bundle, use that
    if (loader.defined[load.name]) {
      var instantiateResult = loader.defined[load.name];
      delete loader.defined[load.name];
      return instantiateResult;
    }

    return loaderInstantiate.apply(this, arguments);
  }

}
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
  // match x, x.y, x.y.z, x.y.z-prerelease.1
  var semverRegEx = /^(\d+)(?:\.(\d+)(?:\.(\d+)(?:-([0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*))?)?)?$/;

  var semverCompare = function(v1, v2) {
    var v1Parts = v1.split('.');
    var v2Parts = v2.split('.');
    var prereleaseIndex;
    if (v1Parts[2] && (prereleaseIndex = indexOf.call(v1Parts[2], '-')) != -1)
      v1Parts.splice(2, 1, v1Parts[2].substr(0, prereleaseIndex), v1Parts[2].substr(prereleaseIndex + 1));
    if (v2Parts[2] && (prereleaseIndex = indexOf.call(v2Parts[2], '-')) != -1)
      v2Parts.splice(2, 1, v2Parts[2].substr(0, prereleaseIndex), v2Parts[2].substr(prereleaseIndex + 1));
    for (var i = 0; i < Math.max(v1Parts.length, v2Parts.length); i++) {
      if (!v1Parts[i])
        return 1;
      else if (!v2Parts[i])
        return -1;
      if (v1Parts[i] != v2Parts[i])
        return parseInt(v1Parts[i]) > parseInt(v2Parts[i]) ? 1 : -1;
    }
    return 0;
  }
  
  var loaderNormalize = loader.normalize;

  loader.versions = loader.versions || {};

  // hook normalize and store a record of all versioned packages
  loader.normalize = function(name, parentName, parentAddress) {
    var packageVersions = loader.versions;
    // run all other normalizers first
    return Promise.resolve(loaderNormalize.call(this, name, parentName, parentAddress)).then(function(normalized) {
      
      var version, semverMatch, nextChar, versions;
      var index = normalized.indexOf('@');

      // see if this module corresponds to a package already in our versioned packages list
      
      // no version specified - check against the list (given we don't know the package name)
      if (index == -1) {
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
core(System);
productionAMD(System);
bundles(System);
register(System);
versions(System);
};

(function() {
  if (!global.System || global.System.registerModule) {
    if (typeof window != 'undefined') {
      // determine the current script path as the base path
      var scripts = document.getElementsByTagName('script');
      var curPath = scripts[scripts.length - 1].src;
      var basePath = curPath.substr(0, curPath.lastIndexOf('/') + 1);
      document.write(
        '<' + 'script type="text/javascript" src="' + basePath + 'es6-module-loader.js" data-init="upgradeSystemLoader">' + '<' + '/script>'
      );
    }
    else {
      var es6ModuleLoader = require('es6-module-loader');
      global.System = es6ModuleLoader.System;
      global.Loader = es6ModuleLoader.Loader;
      global.Module = es6ModuleLoader.Module;
      module.exports = global.System;
      global.upgradeSystemLoader();
    }
  }
  else {
    global.upgradeSystemLoader();
  }
})();


})(typeof window != 'undefined' ? window : global);