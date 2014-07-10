/*
 * SystemJS v0.6.7
 * 
 * Copyright (c) 2014 Guy Bedford
 * MIT License
 */

(function(__$global) {

__$global.upgradeSystemLoader = function() {
  __$global.upgradeSystemLoader = undefined;

  // indexOf polyfill for IE
  var indexOf = Array.prototype.indexOf || function(item) {
    for (var i = 0, l = this.length; i < l; i++)
      if (this[i] === item)
        return i;
    return -1;
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

  // clone the original System loader
  var originalSystem = __$global.System;
  var System = __$global.System = new LoaderPolyfill(originalSystem);
  System.baseURL = originalSystem.baseURL;
  System.paths = { '*': '*.js' };
  System.originalSystem = originalSystem;

  System.noConflict = function() {
    __$global.SystemJS = System;
    __$global.System = System.originalSystem;
  }

  /*
 * Instantiate registry extension
 *
 * Supports Traceur System.register 'instantiate' output for loading ES6 as ES5.
 *
 * - Creates the loader.register function
 * - Also supports metadata.format = 'register' in instantiate for anonymous register modules
 * - Also supports metadata.deps, metadata.execute and metadata.executingRequire
 *     for handling dynamic modules alongside register-transformed ES6 modules
 *
 * Works as a standalone extension, but benefits from having a more 
 * advanced __eval defined like in SystemJS polyfill-wrapper-end.js
 *
 * The code here replicates the ES6 linking groups algorithm to ensure that
 * circular ES6 compiled into System.register can work alongside circular AMD 
 * and CommonJS, identically to the actual ES6 loader.
 *
 */
function register(loader) {
  if (typeof indexOf == 'undefined')
    indexOf = Array.prototype.indexOf;
  if (typeof __eval == 'undefined')
    __eval = 0 || eval; // uglify breaks without the 0 ||

  // define exec for easy evaluation of a load record (load.name, load.source, load.address)
  // main feature is source maps support handling
  var curSystem;
  function exec(load) {
    var loader = this;
    if (load.name == '@traceur') {
      curSystem = System;
    }
    // support sourceMappingURL (efficiently)
    var sourceMappingURL;
    var lastLineIndex = load.source.lastIndexOf('\n');
    if (lastLineIndex != -1) {
      if (load.source.substr(lastLineIndex + 1, 21) == '//# sourceMappingURL=') {
        sourceMappingURL = load.source.substr(lastLineIndex + 22, load.source.length - lastLineIndex - 22);
        if (typeof toAbsoluteURL != 'undefined')
          sourceMappingURL = toAbsoluteURL(load.address, sourceMappingURL);
      }
    }

    __eval(load.source, loader.global, load.address, sourceMappingURL);

    // traceur overwrites System and Module - write them back
    if (load.name == '@traceur') {
      loader.global.traceurSystem = loader.global.System;
      loader.global.System = curSystem;
    }
  }
  loader.__exec = exec;

  function dedupe(deps) {
    var newDeps = [];
    for (var i = 0; i < deps.length; i++)
      if (indexOf.call(newDeps, deps[i]) == -1)
        newDeps.push(deps[i])
    return newDeps;
  }

  // There are two variations of System.register:
  // 1. System.register for ES6 conversion (2-3 params) - System.register([name, ]deps, declare)
  //    see https://github.com/ModuleLoader/es6-module-loader/wiki/System.register-Explained
  //
  // 2. System.register for dynamic modules (3-4 params) - System.register([name, ]deps, executingRequire, execute)
  // the true or false statement 

  // this extension implements the linking algorithm for the two variations identical to the spec
  // allowing compiled ES6 circular references to work alongside AMD and CJS circular references.

  // loader.register sets loader.defined for declarative modules
  var anonRegister;
  var calledRegister;
  function register(name, deps, declare, execute) {
    if (typeof name != 'string') {
      execute = declare;
      declare = deps;
      deps = name;
      name = null;
    }

    calledRegister = true;
    
    var register;

    // dynamic
    if (typeof declare == 'boolean') {
      register = {
        declarative: false,
        deps: deps,
        execute: execute,
        executingRequire: declare
      };
    }
    else {
      // ES6 declarative
      if (deps.length > 0 && declare.length != 1)
        throw 'Invalid System.register form for ' + name + '. Declare function must take one argument.';
      register = {
        declarative: true,
        deps: deps,
        declare: declare
      };
    }
    
    // named register
    if (name) {
      // we never overwrite an existing define
      if (!loader.defined[name])
        loader.defined[name] = register; 
    }
    // anonymous register
    else if (register.declarative) {
      if (anonRegister)
        throw 'Multiple anonymous System.register calls in the same module file.';
      anonRegister = register;
    }
  }

  // Registry side table - loader.defined
  // Registry Entry Contains:
  //    - deps 
  //    - declare for register modules
  //    - execute for dynamic modules, also after declare for declarative modules
  //    - executingRequire indicates require drives execution for circularity of dynamic modules
  //    - declarative optional boolean indicating which of the above
  //
  // Can preload modules directly on System.defined['my/module'] = { deps, execute, executingRequire }
  //
  // Then the entry gets populated with derived information during processing:
  //    - normalizedDeps derived from deps, created in instantiate
  //    - depMap array derived from deps, populated gradually in link
  //    - groupIndex used by group linking algorithm
  //    - module a raw module exports object with no wrapper
  //    - evaluated indiciating whether evaluation has happend for declarative modules
  // After linked and evaluated, entries are removed

  function defineRegister(loader) {
    if (loader.register)
      return;

    loader.register = register;

    if (!loader.defined)
      loader.defined = {};
    
    // script injection mode calls this function synchronously on load
    var onScriptLoad = loader.onScriptLoad;
    loader.onScriptLoad = function(load) {
      onScriptLoad(load);
      // anonymous define
      if (anonRegister)
        load.metadata.entry = anonRegister;
      
      if (anonRegister || calledRegister)
        load.metadata.format = load.metadata.format || 'register';
      if (calledRegister)
        load.metadata.registered = true;
    }
  }

  defineRegister(loader);

  function buildGroups(entry, loader, groups) {
    groups[entry.groupIndex] = groups[entry.groupIndex] || [];

    if (indexOf.call(groups[entry.groupIndex], entry) != -1)
      return;

    groups[entry.groupIndex].push(entry);

    for (var i = 0; i < entry.normalizedDeps.length; i++) {
      var depName = entry.normalizedDeps[i];
      var depEntry = loader.defined[depName];
      
      // not in the registry means already linked / ES6
      if (!depEntry || depEntry.evaluated)
        continue;
      
      // now we know the entry is in our unlinked linkage group
      var depGroupIndex = entry.groupIndex + (depEntry.declarative != entry.declarative);

      // the group index of an entry is always the maximum
      if (depEntry.groupIndex === undefined || depEntry.groupIndex < depGroupIndex) {
        
        // if already in a group, remove from the old group
        if (depEntry.groupIndex) {
          groups[depEntry.groupIndex].splice(groups[depEntry.groupIndex].indexOf(depEntry), 1);

          // if the old group is empty, then we have a mixed depndency cycle
          if (groups[depEntry.groupIndex].length == 0)
            throw new TypeError("Mixed dependency cycle detected");
        }

        depEntry.groupIndex = depGroupIndex;
      }

      buildGroups(depEntry, loader, groups);
    }
  }

  function link(name, loader) {
    var startEntry = loader.defined[name];

    startEntry.groupIndex = 0;

    var groups = [];

    buildGroups(startEntry, loader, groups);

    var curGroupDeclarative = !!startEntry.declarative == groups.length % 2;
    for (var i = groups.length - 1; i >= 0; i--) {
      var group = groups[i];
      for (var j = 0; j < group.length; j++) {
        var entry = group[j];

        // link each group
        if (curGroupDeclarative)
          linkDeclarativeModule(entry, loader);
        else
          linkDynamicModule(entry, loader);
      }
      curGroupDeclarative = !curGroupDeclarative; 
    }
  }

  function linkDeclarativeModule(entry, loader) {
    // only link if already not already started linking (stops at circular)
    if (entry.module)
      return;

    // declare the module with an empty depMap
    var depMap = [];

    var declaration = entry.declare.call(loader.global, depMap);
    
    entry.module = declaration.exports;
    entry.exportStar = declaration.exportStar;
    entry.execute = declaration.execute;

    var module = entry.module;

    // now link all the module dependencies
    // amending the depMap as we go
    for (var i = 0; i < entry.normalizedDeps.length; i++) {
      var depName = entry.normalizedDeps[i];
      var depEntry = loader.defined[depName];
      
      // part of another linking group - use loader.get
      if (!depEntry) {
        depModule = loader.get(depName);
      }
      // if dependency already linked, use that
      else if (depEntry.module) {
        depModule = depEntry.module;
      }
      // otherwise we need to link the dependency
      else {
        linkDeclarativeModule(depEntry, loader);
        depModule = depEntry.module;
      }

      if (entry.exportStar && indexOf.call(entry.exportStar, entry.normalizedDeps[i]) != -1) {
        // we are exporting * from this dependency
        (function(depModule) {
          for (var p in depModule) (function(p) {
            // if the property is already defined throw?
            Object.defineProperty(module, p, {
              enumerable: true,
              get: function() {
                return depModule[p];
              },
              set: function(value) {
                depModule[p] = value;
              }
            });
          })(p);
        })(depModule);
      }

      depMap[i] = depModule;
    }
  }

  // An analog to loader.get covering execution of all three layers (real declarative, simulated declarative, simulated dynamic)
  function getModule(name, loader) {
    var module;
    var entry = loader.defined[name];

    if (!entry) {
      module = loader.get(name);
      if (!module)
        throw "System Register: The module requested " + name + " but this was not declared as a dependency";
    }

    else {
      if (entry.declarative)
        ensureEvaluated(name, [], loader);
    
      else if (!entry.evaluated)
        linkDynamicModule(entry, loader);

      module = entry.module;
    }

    if (!module)
      return '';

    return module.__useDefault ? module['default'] : module;
  }

  function linkDynamicModule(entry, loader) {
    if (entry.module)
      return;

    entry.module = { 'default': {}, __useDefault: true };

    // AMD requires execute the tree first
    if (!entry.executingRequire) {
      for (var i = 0; i < entry.normalizedDeps.length; i++) {
        var depName = entry.normalizedDeps[i];
        var depEntry = loader.defined[depName];
        if (depEntry)
          linkDynamicModule(depEntry, loader);
      }
    }

    // lookup the module name if it is in the registry
    var moduleName;
    for (var d in loader.defined) {
      if (loader.defined[d] != entry)
        continue;
      moduleName = d;
      break;
    }

    // now execute
    entry.evaluated = true;
    var output = entry.execute.call(loader.global, function(name) {
      for (var i = 0; i < entry.deps.length; i++) {
        if (entry.deps[i] != name)
          continue;
        return getModule(entry.normalizedDeps[i], loader);
      }
    }, entry.module['default'], moduleName);
    
    if (output)
      entry.module['default'] = output;
  }

  // given a module, and the list of modules for this current branch,
  // ensure that each of the dependencies of this module is evaluated
  //  (unless one is a circular dependency already in the list of seen
  //   modules, in which case we execute it)
  // then evaluate the module itself
  // depth-first left to right execution to match ES6 modules
  function ensureEvaluated(moduleName, seen, loader) {
    var entry = loader.defined[moduleName];

    // if already seen, that means it's an already-evaluated non circular dependency
    if (entry.evaluated || !entry.declarative)
      return;

    seen.push(moduleName);

    for (var i = 0; i < entry.normalizedDeps.length; i++) {
      var depName = entry.normalizedDeps[i];
      if (indexOf.call(seen, depName) == -1) {
        if (!loader.defined[depName])
          loader.get(depName);
        else
          ensureEvaluated(depName, seen, loader);
      }
    }

    if (entry.evaluated)
      return;

    entry.evaluated = true;
    entry.execute.call(loader.global);
  }

  var registerRegEx = /System\.register/;

  var loaderFetch = loader.fetch;
  loader.fetch = function(load) {
    var loader = this;
    defineRegister(loader);
    if (loader.defined[load.name]) {
      load.metadata.format = 'defined';
      return '';
    }
    anonRegister = null;
    calledRegister = false;
    // the above get picked up by onScriptLoad
    return loaderFetch.call(loader, load);
  }

  var loaderTranslate = loader.translate;
  loader.translate = function(load) {
    this.register = register;

    this.__exec = exec;

    load.metadata.deps = load.metadata.deps || [];

    // we run the meta detection here (register is after meta)
    return Promise.resolve(loaderTranslate.call(this, load)).then(function(source) {
      
      // dont run format detection for globals shimmed
      // ideally this should be in the global extension, but there is
      // currently no neat way to separate it
      if (load.metadata.init || load.metadata.exports)
        load.metadata.format = load.metadata.format || 'global';

      // run detection for register format
      if (load.metadata.format == 'register' || !load.metadata.format && load.source.match(registerRegEx))
        load.metadata.format = 'register';
      return source;
    });
  }


  var loaderInstantiate = loader.instantiate;
  loader.instantiate = function(load) {
    var loader = this;

    var entry;

    // first we check if this module has already been defined in the registry
    if (loader.defined[load.name])
      entry = loader.defined[load.name];

    // picked up already by a script injection
    else if (load.metadata.entry)
      entry = load.metadata.entry;

    // otherwise check if it is dynamic
    else if (load.metadata.execute) {
      entry = {
        declarative: false,
        deps: load.metadata.deps || [],
        execute: load.metadata.execute,
        executingRequire: load.metadata.executingRequire // NodeJS-style requires or not
      };
    }

    // Contains System.register calls
    else if (load.metadata.format == 'register') {
      anonRegister = null;
      calledRegister = false;

      var System = loader.global.System = loader.global.System || loader;

      var curRegister = System.register;
      System.register = register;

      loader.__exec(load);

      System.register = curRegister;

      if (anonRegister)
        entry = anonRegister;

      if (!calledRegister && !load.metadata.registered)
        throw load.name + " detected as System.register but didn't execute.";
    }

    // named bundles are just an empty module
    if (!entry && load.metadata.format != 'es6')
      return {
        deps: [],
        execute: function() {
          return loader.newModule({});
        }
      };

    // place this module onto defined for circular references
    if (entry)
      loader.defined[load.name] = entry;

    // no entry -> treat as ES6
    else
      return loaderInstantiate.call(this, load);

    entry.deps = dedupe(entry.deps);

    // first, normalize all dependencies
    var normalizePromises = [];
    for (var i = 0; i < entry.deps.length; i++)
      normalizePromises.push(Promise.resolve(loader.normalize(entry.deps[i], load.name)));

    return Promise.all(normalizePromises).then(function(normalizedDeps) {

      entry.normalizedDeps = normalizedDeps;

      // create the empty dep map - this is our key deferred dependency binding object passed into declare
      entry.depMap = [];

      return {
        deps: entry.deps,
        execute: function() {
          // this avoids double duplication allowing a bundle to equal its last defined module
          if (entry.esmodule) {
            loader.defined[load.name] = undefined;
            return entry.esmodule;
          }

          // recursively ensure that the module and all its 
          // dependencies are linked (with dependency group handling)
          link(load.name, loader);

          // now handle dependency execution in correct order
          ensureEvaluated(load.name, [], loader);

          // remove from the registry
          loader.defined[load.name] = undefined;

          var module = loader.newModule(entry.module);

          // if the entry is an alias, set the alias too
          for (var name in loader.defined) {
            if (!loader.defined[name])
              continue;
            if (entry.declarative && loader.defined[name].execute != entry.execute)
              continue;
            if (!entry.declarative && loader.defined[name].declare != entry.declare);
              continue;
            loader.defined[name].esmodule = module;
          }
          // return the defined module object
          return module;
        }
      };
    });
  }
}
/*
 * SystemJS Core
 * Code should be vaguely readable
 * 
 */
function core(loader) {

  /*
    __useDefault
    
    When a module object looks like:
    newModule({
      __useDefault: true,
      default: 'some-module'
    })

    Then importing that module provides the 'some-module'
    result directly instead of the full module.

    Useful for eg module.exports = function() {}
  */
  var loaderImport = loader['import'];
  loader['import'] = function(name, options) {
    return loaderImport.call(this, name, options).then(function(module) {
      return module.__useDefault ? module['default'] : module;
    });
  }

  // support the empty module, as a concept
  loader.set('@empty', loader.newModule({}));

  /*
    Config
    Extends config merging one deep only

    loader.config({
      some: 'random',
      config: 'here',
      deep: {
        config: { too: 'too' }
      }
    });

    <=>

    loader.some = 'random';
    loader.config = 'here'
    loader.deep = loader.deep || {};
    loader.deep.config = { too: 'too' };
  */
  loader.config = function(cfg) {
    for (var c in cfg) {
      var v = cfg[c];
      if (typeof v == 'object') {
        this[c] = this[c] || {};
        for (var p in v)
          this[c][p] = v[p];
      }
      else
        this[c] = v;
    }
  }

  // override locate to allow baseURL to be document-relative
  var baseURI;
  if (typeof window == 'undefined') {
    baseURI = process.cwd() + '/';
  }
  else {
    baseURI = document.baseURI;
    if (!baseURI) {
      var bases = document.getElementsByTagName('base');
      baseURI = bases[0] && bases[0].href || window.location.href;
    }
  }

  var loaderLocate = loader.locate;
  var normalizedBaseURL;
  loader.locate = function(load) {
    if (this.baseURL != normalizedBaseURL) {
      normalizedBaseURL = toAbsoluteURL(baseURI, this.baseURL);

      if (normalizedBaseURL.substr(normalizedBaseURL.length - 1, 1) != '/')
        normalizedBaseURL += '/';
      this.baseURL = normalizedBaseURL;
    }

    return Promise.resolve(loaderLocate.call(this, load));
  }


  // Traceur conveniences
  var aliasRegEx = /^\s*export\s*\*\s*from\s*(?:'([^']+)'|"([^"]+)")/;
  var es6RegEx = /(?:^\s*|[}{\(\);,\n]\s*)(import\s+['"]|(import|module)\s+[^"'\(\)\n;]+\s+from\s+['"]|export\s+(\*|\{|default|function|var|const|let|[_$a-zA-Z\xA0-\uFFFF][_$a-zA-Z0-9\xA0-\uFFFF]*))/;

  var loaderTranslate = loader.translate;
  loader.translate = function(load) {
    var loader = this;

    if (load.name == '@traceur')
      return loaderTranslate.call(loader, load);

    // support ES6 alias modules ("export * from 'module';") without needing Traceur
    var match;
    if ((load.metadata.format == 'es6' || !load.metadata.format) && (match = load.source.match(aliasRegEx))) {
      load.metadata.format = 'cjs';
      load.source = 'module.exports = require("' + (match[1] || match[2]) + '");\n';
    }

    // detect ES6
    else if (load.metadata.format == 'es6' || !load.metadata.format && load.source.match(es6RegEx)) {
      load.metadata.format = 'es6';

      // dynamically load Traceur for ES6 if necessary
      if (!loader.global.traceur) {
        return loader['import']('@traceur').then(function() {
          return loaderTranslate.call(loader, load);
        });
      }
    }

    return loaderTranslate.call(loader, load);
  }

  // always load Traceur as a global
  var loaderInstantiate = loader.instantiate;
  loader.instantiate = function(load) {
    var loader = this;
    if (load.name == '@traceur') {
      loader.__exec(load);
      return {
        deps: [],
        execute: function() {
          return loader.newModule({});
        }
      };
    }
    return loaderInstantiate.call(loader, load);
  }
}
/*
  SystemJS Global Format

  Supports
    metadata.deps
    metadata.init
    metadata.exports

  Also detects writes to the global object avoiding global collisions.
  See the SystemJS readme global support section for further information.
*/
function global(loader) {
  function createHelpers(loader) {
    if (loader.has('@@global-helpers'))
      return;

    var hasOwnProperty = loader.global.hasOwnProperty;
    var moduleGlobals = {};

    var curGlobalObj;
    var ignoredGlobalProps;

    loader.set('@@global-helpers', loader.newModule({
      prepareGlobal: function(moduleName, deps) {
        // first, we add all the dependency modules to the global
        for (var i = 0; i < deps.length; i++) {
          var moduleGlobal = moduleGlobals[deps[i]];
          if (moduleGlobal)
            for (var m in moduleGlobal)
              loader.global[m] = moduleGlobal[m];
        }

        // now store a complete copy of the global object
        // in order to detect changes
        curGlobalObj = {};
        ignoredGlobalProps = ['indexedDB', 'sessionStorage', 'localStorage', 'clipboardData', 'frames'];
        for (var g in loader.global)
          if (!hasOwnProperty || loader.global.hasOwnProperty(g)) {
            try {
              curGlobalObj[g] = loader.global[g];
            } catch (e) {
              ignoredGlobalProps.push(g);
            }
          }
      },
      retrieveGlobal: function(moduleName, exportName, init) {
        var singleGlobal;
        var exports = {};

        // run init
        if (init) {
          var depModules = [];
          for (var i = 0; i < deps.length; i++)
            depModules.push(require(deps[i]));
          singleGlobal = init.apply(loader.global, depModules);
        }

        // check for global changes, creating the globalObject for the module
        // if many globals, then a module object for those is created
        // if one global, then that is the module directly
        if (exportName && !singleGlobal) {
          var firstPart = exportName.split('.')[0];
          singleGlobal = eval.call(loader.global, exportName);
          exports[firstPart] = loader.global[firstPart];
        }

        else {
          for (var g in loader.global) {
            if (~ignoredGlobalProps.indexOf(g))
              continue;
            if ((!hasOwnProperty || loader.global.hasOwnProperty(g)) && g != loader.global && curGlobalObj[g] != loader.global[g]) {
              exports[g] = loader.global[g];
              if (singleGlobal) {
                if (singleGlobal !== loader.global[g])
                  singleGlobal = undefined;
              }
              else if (singleGlobal !== false) {
                singleGlobal = loader.global[g];
              }
            }
          }
        }

        moduleGlobals[moduleName] = exports;

        return typeof singleGlobal != 'undefined' ? singleGlobal : exports;
      }
    }));
  }

  createHelpers(loader);

  var loaderInstantiate = loader.instantiate;
  loader.instantiate = function(load) {
    var loader = this;

    createHelpers(loader);

    var exportName = load.metadata.exports;

    if (!load.metadata.format)
      load.metadata.format = 'global';

    // global is a fallback module format
    if (load.metadata.format == 'global') {
      load.metadata.execute = function(require, exports, moduleName) {

        loader.get('@@global-helpers').prepareGlobal(moduleName, load.metadata.deps);

        if (exportName)
          load.source += '\nthis["' + exportName + '"] = ' + exportName + ';';

        // disable AMD detection
        var define = loader.global.define;
        loader.global.define = undefined;

        // ensure no NodeJS environment detection
        loader.global.module = undefined;
        loader.global.exports = undefined;

        loader.__exec(load);

        loader.global.define = define;

        return loader.get('@@global-helpers').retrieveGlobal(moduleName, exportName, load.metadata.init);
      }
    }
    return loaderInstantiate.call(loader, load);
  }
}
/*
 * Dependency Tree Cache
 * 
 * Allows a build to pre-populate a dependency trace tree on the loader of 
 * the expected dependency tree, to be loaded upfront when requesting the
 * module, avoinding the n round trips latency of module loading, where 
 * n is the dependency tree depth.
 *
 * eg:
 * System.depCache = {
 *  'app': ['normalized', 'deps'],
 *  'normalized': ['another'],
 *  'deps': ['tree']
 * };
 * 
 * System.import('app') 
 * // simultaneously starts loading all of:
 * // 'normalized', 'deps', 'another', 'tree'
 * // before "app" source is even loaded
 */

function depCache(loader) {
  loader.depCache = loader.depCache || {};

  loaderLocate = loader.locate;
  loader.locate = function(load) {
    var loader = this;

    if (!loader.depCache)
      loader.depCache = {};

    // load direct deps, in turn will pick up their trace trees
    var deps = loader.depCache[load.name];
    if (deps)
      for (var i = 0; i < deps.length; i++)
        loader.load(deps[i]);

    return loaderLocate.call(loader, load);
  }
}
  
register(System);
core(System);
global(System);
depCache(System);

  
  if (!System.paths['@traceur'])
    System.paths['@traceur'] = __$curScript && __$curScript.getAttribute('data-traceur-src')
      || (__$curScript && __$curScript.src 
        ? __$curScript.src.substr(0, __$curScript.src.lastIndexOf('/') + 1) 
        : System.baseURL + (System.baseURL.lastIndexOf('/') == System.baseURL.length - 1 ? '' : '/')
        ) + 'traceur.js';
};

function __eval(__source, __global, __address, __sourceMap) {
  try {
    __source = (__global != __$global ? 'with(__global) { (function() { ' + __source + ' \n }).call(__global); }' : __source)
      + '\n//# sourceURL=' + __address
      + (__sourceMap ? '\n//# sourceMappingURL=' + __sourceMap : '');
    eval(__source);
  }
  catch(e) {
    if (e.name == 'SyntaxError')
      e.message = 'Evaluating ' + __address + '\n\t' + e.message;
    if (System.trace && System.execute == false)
      e = 'Execution error for ' + __address + ': ' + e.stack || e;
    throw e;
  }
}

var __$curScript;

(function(global) {
  if (typeof window != 'undefined') {
    var scripts = document.getElementsByTagName('script');
    __$curScript = scripts[scripts.length - 1];

    if (!global.System || !global.LoaderPolyfill) {
      // determine the current script path as the base path
      var curPath = __$curScript.src;
      var basePath = curPath.substr(0, curPath.lastIndexOf('/') + 1);
      document.write(
        '<' + 'script type="text/javascript" src="' + basePath + 'es6-module-loader.js" data-init="upgradeSystemLoader">' + '<' + '/script>'
      );
    }
    else {
      global.upgradeSystemLoader();
    }
  }
  else {
    var es6ModuleLoader = require('es6-module-loader');
    global.System = es6ModuleLoader.System;
    global.Loader = es6ModuleLoader.Loader;
    global.upgradeSystemLoader();
    module.exports = global.System;
  }
})(__$global);

})(typeof window != 'undefined' ? window : global);
