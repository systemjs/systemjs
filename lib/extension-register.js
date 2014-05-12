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
 * Works as a standalone extension provided there is a
 * loader.__exec(load) like the one set in SystemJS core
 *
 */
function register(loader) {
  if (typeof indexOf == 'undefined')
    indexOf = Array.prototype.indexOf;
  if (typeof __eval == 'undefined')
    __eval = eval;

  // define exec for easy evaluation of a load record (load.name, load.source, load.address)
  // main feature is source maps support handling
  var curSystem, curModule;
  function exec(load) {
    var loader = this;
    if (load.name == '@traceur') {
      curSystem = System;
      curModule = Module;
    }
    // support sourceMappingURL (efficiently)
    var sourceMappingURL;
    var lastLineIndex = load.source.lastIndexOf('\n');
    if (lastLineIndex != -1) {
      if (load.source.substr(lastLineIndex + 1, 21) == '//# sourceMappingURL=')
        sourceMappingURL = toAbsoluteURL(load.address, load.source.substr(lastLineIndex + 22, load.source.length - lastLineIndex - 23));
    }

    __eval(load.source, loader.global, load.address, sourceMappingURL);

    // traceur overwrites System and Module - write them back
    if (load.name == '@traceur') {
      loader.global.traceurSystem = loader.global.System;
      loader.global.System = curSystem;
      //loader.global.Module = curModule;
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

  // Registry side table
  // Registry Entry Contains:
  //    - deps 
  //    - declare for register modules
  //    - execute for dynamic modules, also after declare for register modules
  //    - declarative boolean indicating which of the above
  //    - normalizedDeps derived from deps, created in instantiate
  //    - depMap array derived from deps, populated gradually in link
  //    - groupIndex used by group linking algorithm
  //    - module a raw module exports object with no wrapper
  //    - evaluated indiciating whether evaluation has happend for declarative modules
  // After linked and evaluated, entries are removed
  var lastRegister;
  function register(name, deps, declare) {
    if (typeof name != 'string') {
      declare = deps;
      deps = name;
      name = null;
    }
    if (declare.length == 0)
      throw 'Invalid System.register form. Ensure setting --modules=instantiate if using Traceur.';

    if (!loader.defined)
      loader.defined = {};

    lastRegister = {
      deps: deps,
      declare: declare,
      declarative: true,
    };

    if (name)
      loader.defined[name] = lastRegister;
  }
  loader.defined = loader.defined || {};
  loader.register = register;

  function buildGroups(entry, loader, groups) {
    groups[entry.groupIndex] = groups[entry.groupIndex] || [];

    if (indexOf.call(groups[entry.groupIndex], entry) != -1)
      return;

    groups[entry.groupIndex].push(entry);

    for (var i = 0; i < entry.normalizedDeps.length; i++) {
      var depName = entry.normalizedDeps[i];
      var depEntry = loader.defined[depName];
      
      // not in the registry means already linked / ES6
      if (!depEntry)
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

    if (!entry)
      module = loader.get(name);

    else {
      if (entry.declarative)
        ensureEvaluated(name, [], loader);
    
      else if (!entry.evaluated)
        linkDynamicModule(entry, loader);
      module = entry.module;
    }

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
    try {
      entry.evaluated = true;
      var output = entry.execute(function(name) {
        for (var i = 0; i < entry.deps.length; i++) {
          if (entry.deps[i] != name)
            continue;
          return getModule(entry.normalizedDeps[i], loader);
        }
      }, entry.module['default'], moduleName);
    }
    catch(e) {
      throw e;
    }
    
    if (output && output.__esModule)
      entry.module = output;
    else if (output)
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
    delete entry.execute;
  }

  var registerRegEx = /System\.register/;

  var loaderFetch = loader.fetch;
  loader.fetch = function(load) {
    var loader = this;
    if (loader.defined && loader.defined[load.name]) {
      load.metadata.format = 'defined';
      return '';
    }
    lastRegister = null;
    return Promise.resolve(loaderFetch.call(loader, load)).then(function(source) {
      if (lastRegister)
        load.metadata.format = 'defined';
      return source;
    });
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
    
    if (loader.defined[load.name])
      entry = loader.defined[load.name];

    else if (load.metadata.execute) {
      loader.defined[load.name] = entry = {
        deps: load.metadata.deps || [],
        execute: load.metadata.execute,
        executingRequire: load.metadata.executingRequire // NodeJS-style requires or not
      };
    }
    else if (load.metadata.format == 'register') {
      lastRegister = null;
      
      loader.__exec(load);

      // for a bundle, take the last defined module
      // in the bundle to be the bundle itself
      if (lastRegister)
        loader.defined[load.name] = entry = lastRegister;
    }
    else if (load.metadata.format == 'defined') 
      loader.defined[load.name] = entry = lastRegister;

    if (!entry)
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
            delete loader.defined[load.name];
            return entry.esmodule;
          }

          // recursively ensure that the module and all its 
          // dependencies are linked (with dependency group handling)
          link(load.name, loader);

          // now handle dependency execution in correct order
          ensureEvaluated(load.name, [], loader);

          // remove from the registry
          delete loader.defined[load.name];

          var module = Module(entry.module);

          // if the entry is an alias, set the alias too
          for (var name in loader.defined) {
            if (loader.defined[name].execute != entry.execute)
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
