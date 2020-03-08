/*
 * Support for AMD loading
 */
(function (global) {
  const systemPrototype = global.System.constructor.prototype;

  function unsupportedRequire () {
    throw Error('AMD require not supported.');
  }

  let tmpRegister;

  const requireExportsModule = ['require', 'exports', 'module'];

  function createAMDRegister (amdDefineDeps, amdDefineExec) {
    const exports = {};
    const module = { exports: exports };
    const depModules = [];
    const setters = [];
    let splice = 0;
    for (let i = 0; i < amdDefineDeps.length; i++) {
      const id = amdDefineDeps[i];
      const index = setters.length;
      if (id === 'require') {
        depModules[i] = unsupportedRequire;
        splice++;
      }
      else if (id === 'module') {
        depModules[i] = module;
        splice++;
      }
      else if (id === 'exports') {
        depModules[i] = exports;
        splice++;
      }
      else {
        // needed for ie11 lack of iteration scope
        const idx = i;
        setters.push(function (ns) {
          depModules[idx] = ns.__useDefault ? ns.default : ns;
        });
      }
      if (splice)
        amdDefineDeps[index] = id;
    }
    if (splice)
      amdDefineDeps.length -= splice;
    const amdExec = amdDefineExec;
    return [amdDefineDeps, function (_export) {
      _export({ default: exports, __useDefault: true });
      return {
        setters: setters,
        execute: function () {
          const amdResult = amdExec.apply(exports, depModules);
          if (amdResult !== undefined)
            module.exports = amdResult;
          if (exports !== module.exports)
            _export('default', module.exports);
        }
      };
    }];
  }

  // hook System.register to know the last declaration binding
  let lastRegisterDeclare;
  const systemRegister = systemPrototype.register;
  systemPrototype.register = function (name, deps, declare) {
    lastRegisterDeclare = typeof name === 'string' ? declare : deps;
    systemRegister.apply(this, arguments);
  };

  const instantiate = systemPrototype.instantiate;
  systemPrototype.instantiate = function() {
    // Reset "currently executing script"
    amdDefineDeps = null;
    return instantiate.apply(this, arguments);
  };

  const getRegister = systemPrototype.getRegister;
  systemPrototype.getRegister = function () {
    if (tmpRegister)
      return tmpRegister;

    const _lastAMDRegister = lastAMDRegister;
    lastAMDRegister = null;

    const register = getRegister.call(this);
    // if its an actual System.register leave it
    if (register && register[1] === lastRegisterDeclare)
      return register;

    // Otherwise AMD takes priority
    return _lastAMDRegister || register;
  };

  let lastAMDRegister;

  global.define = function (name, deps, execute) {
    const isNamed = typeof name === 'string';
    const depsAndExec = isNamed ? getDepsAndExec(deps, execute) : getDepsAndExec(name, deps);
    lastAMDRegister = createAMDRegister(depsAndExec[0], depsAndExec[1]);

    if (isNamed && System.registerRegistry) {
      addToRegisterRegistry(name, lastAMDRegister);
    }
  };
  global.define.amd = {};

  function getDepsAndExec(arg1, arg2) {
    // define([], function () {})
    if (arg1 instanceof Array) {
      return [arg1, arg2];
    }
    // define({})
    else if (typeof arg1 === 'object') {
      return [[], function () { return arg1 }];
    }
    // define(function () {})
    else if (typeof arg1 === 'function') {
      return [requireExportsModule, arg1];
    }
  }

  function addToRegisterRegistry(name, define) {
    // We must call System.getRegister() here to give other extras, such as the named-exports extra,
    // a chance to modify the define before it's put into the registerRegistry.
    // See https://github.com/systemjs/systemjs/issues/2073
    tmpRegister = define;
    System.registerRegistry[name] = System.getRegister();
    tmpRegister = null;
  }
})(typeof self !== 'undefined' ? self : global);
