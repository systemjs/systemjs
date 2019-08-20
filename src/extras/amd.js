/*
 * Support for AMD loading
 */
(function (global) {
  const systemPrototype = System.constructor.prototype;
  
  const emptyInstantiation = [[], function () { return {} }];
  const requireExportsModule = ['require', 'exports', 'module'];

  //holds the last requested dependencies and executor
  let amdDefineDependencies, amdDefineExecutor; 
  let lastRegisterDeclare;

  function unsupportedRequire () {
    throw Error('AMD require not supported.');
  }

  function emptyFunction() {}
  
  /**
   * Define polyfill
   */
  global.define = function (name, deps, executor) {
    // define('', [], function () {})
    if (typeof name === 'string') {
      if (amdDefineDependencies) {
        if (!System.registerRegistry) {
          throw Error('Include the named register extension for SystemJS named AMD support.');
        }
        System.registerRegistry[name] = createAMDRegister(deps, executor);
        amdDefineDependencies = [];
        amdDefineExecutor = emptyFunction;       
        return;
      } else {
        if (System.registerRegistry) {
          System.registerRegistry[name] = createAMDRegister([].concat(deps), executor);
        }
        name = deps;
        deps = executor;
      }
    }
    // define([], function () {})
    if (name instanceof Array) {
      amdDefineDependencies = name;
      amdDefineExecutor = deps;
    }
    // define({})
    else if (typeof name === 'object') {
      amdDefineDependencies = [];
      amdDefineExecutor = function () { return name };
    }
    // define(function () {})
    else if (typeof name === 'function') {
      amdDefineDependencies = requireExportsModule;
      amdDefineExecutor = name;
    }
  };

  /**
   * Dynamically create an Registry for our AMD-Module
   */
  function createAMDRegister (deps, executor) {
    const exports = {};
    const module = { exports: exports };

    const _deps = handleDependencies(deps);

    const dependencies = _deps[0];
    const depModules = _deps[1];
    const setters = _deps[2];
    
    const _executor = executor;
    return [dependencies, function (_export) {
      _export({ default: exports, __useDefault: true });
      return {
        setters: setters,
        execute: function () {
          module.exports = _executor.apply(exports, depModules) || module.exports;
          if (exports !== module.exports) {
            _export('default', module.exports);
          }
        }
      };
    }];
  }

  /**
   * Handle Dependencies of said AMD Registry
   * @param {*} dependencies 
   * @returns [dependencies, depModules, setters]
   */
  function handleDependencies(dependencies) {
    const depModules = [];
    const setters = [];
    let splice = 0;

    for (let i = 0; i < dependencies.length; i++) {
      const id = dependencies[i];
      const index = setters.length;

      if (id === 'require') {
        depModules[i] = unsupportedRequire;
        splice++;
      } else if (id === 'module') {
        depModules[i] = module;
        splice++;
      } else if (id === 'exports') {
        depModules[i] = exports;
        splice++;
      } else {
        const idx = i;
        setters.push(function (ns) {
          depModules[idx] = ns;
        });
      }
      if (splice) {
        dependencies[index] = id;
      }
    }
    if (splice) {
      dependencies.length -= splice;
    }
	  if(dependencies.length > 0) {
      for(let j = 0; j < dependencies.length; j++) {
        if(dependencies[j].substr(dependencies[j].length-1) 
          && dependencies[j].indexOf("/") >= 0) {
          dependencies[j] = dependencies[j]+".js";
        }
      }
    }

    return [dependencies, depModules, setters];
  }

  /**
   * Hook System.register
   */
  (function hookSystemRegister(lastRegisterDeclare) {
    const systemRegister = systemPrototype.register;
    // hook System.register to know the last declaration binding
    // if we have named register support continue to use it
    if (systemRegister.length === 3) {
      systemPrototype.register = function (name, deps, declare) {
        if (typeof name !== 'string')
          lastRegisterDeclare = deps;
        systemRegister.apply(this, arguments);
      };
    } else {
      systemPrototype.register = function (deps, declare) {
        lastRegisterDeclare = declare;
        systemRegister.apply(this, arguments);
      };
    }
  })(lastRegisterDeclare);

  /**
   * Hook System.getRegister
   */
  (function hookGetRegister(amdDefineDependencies, amdDefineExecutor) {
    const getRegister = systemPrototype.getRegister;
    systemPrototype.getRegister = function () {
      const register = getRegister.call(this);
      // if its an actual System.register leave it
      if (register && register[1] === lastRegisterDeclare) {
        return register;
      }
  
      // otherwise AMD takes priority
      // no registration -> attempt AMD detection
      if (!amdDefineDependencies) {
        return register || emptyInstantiation;
      }
  
      const registration = createAMDRegister(amdDefineDependencies, amdDefineExecutor);
      amdDefineDependencies = null;
      return registration;
    };
  })(amdDefineDependencies, amdDefineExecutor);

})(typeof self !== 'undefined' ? self : global);