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
  if (!loader.__exec)
    throw "loader.__exec(load) needs to be provided for loader.register. See SystemJS core for an implementation example.";

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
    if (declare.length == 0)
      throw 'Invalid System.register form. Ensure setting --modules=instantiate if using Traceur.';

    if (!loader.defined)
      loader.defined = {};

    if (typeof name != 'string') {
      declare = deps;
      deps = name;
      name = null;
    }

    lastRegister = {
      deps: deps,
      declare: declare,
      declarative: true
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

      if (depEntry.groupIndex === undefined) {
        depEntry.groupIndex = depGroupIndex;
      }
      else if (depEntry.groupIndex != depGroupIndex) {
        throw new TypeError('System.register mixed dependency cycle');
      }

      buildGroups(entry, loader, groups);
    }
  }

  function link(name, loader) {
    var startEntry = loader.defined[name];

    startEntry.groupIndex = 0;

    var groups = [];

    buildGroups(startEntry, loader, groups);

    var curGroupDeclarative = startEntry.declarative == groups.length % 2;
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

    var declaration = load.declare.call(loader.global, depMap);
    
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
    var entry = loader.defined[name];

    if (!entry)
      return loader.get(name);

    if (entry.declarative)
      ensureEvaluated(name, [], loader);
    
    else if (!entry.evaluated)
      linkDynamicModule(entry, loader);

    return entry.module;
  }

  function linkDynamicModule(entry, loader) {
    if (entry.module)
      return;

    entry.module = {};

    // AMD requires execute the tree first
    if (!entry.executingRequire) {
      for (var i = 0; i < entry.normalizedDeps.length; i++) {
        var depName = entry.normalizedDeps[i];
        var depEntry = loader.defined[depName];
        linkDynamicModule(depEntry, loader);
      }
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
      }, entry.module, name);
    }
    catch(e) {
      throw e;
    }
    
    if (output)
      entry.module = output;
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
    if (!entry.declarative || entry.evaluated || indexOf.call(seen, moduleName) != -1)
      return;

    seen.push(moduleName);

    for (var i = 0; i < entry.normalizedDeps.length; i++) {
      var depName = entry.normalizedDeps[i];
      
      // circular -> execute now if not already executed
      if (indexOf.call(seen, depName) != -1) {
        var depEntry = loader.defined[depName];
        if (depEntry && !depEntry.evaluated) {
          depEntry.execute.call(loader.global);
          delete depEntry.execute;
        }
      }
      // in turn ensure dependencies are evaluated
      else
        ensureEvaluated(depName, seen);
    }

    // we've evaluated all dependencies so evaluate this module now
    entry.execute.call(loader.global);
    entry.evaluated = true;
  }

  var registerRegEx = /System\.register/;

  var loaderTranslate = loader.translate;
  loader.translate = function(load) {
    loader.register = register;

    load.metadata.deps = load.metadata.deps || [];

    // run detection for register format here
    if (load.metadata.format == 'register' || !load.metadata.format && load.source.match(registerRegEx))
      load.metadata.format = 'register';

    return loaderTranslate.call(this, load);
  }


  var loaderInstantiate = loader.instantiate;
  loader.instantiate = function(load) {
    var loader = this;

    var entry;
    
    if (loader.defined[load.name])
      loader.defined[load.name] = entry = loader.defined[load.name];

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
            if (!loader.has(name))
              loader.set(name, module);
          }
          // return the defined module object
          return module;
        }
      };
    });
  }
}
