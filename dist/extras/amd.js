/*
 * Support for AMD loading
 */
(function (global) {
  const systemPrototype = global.System.constructor.prototype;

  const emptyInstantiation = [[], function () { return {} }];

  function unsupportedRequire () {
    throw Error('AMD require not supported.');
  }

  let tmpRegister, firstNamedDefine;

  function emptyFn () {}

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

    const _firstNamedDefine = firstNamedDefine;
    firstNamedDefine = null;

    const register = getRegister.call(this);
    // if its an actual System.register leave it
    if (register && register[1] === lastRegisterDeclare)
      return register;

    const _amdDefineDeps = amdDefineDeps;
    amdDefineDeps = null;

    // If the script registered a named module, return that module instead of re-instantiating it.
    if (_firstNamedDefine)
      return _firstNamedDefine;

    // otherwise AMD takes priority
    // no registration -> attempt AMD detection
    if (!_amdDefineDeps)
      return register || emptyInstantiation;

    return createAMDRegister(_amdDefineDeps, amdDefineExec);
  };
  let amdDefineDeps, amdDefineExec;
  global.define = function (name, deps, execute) {
    // define('', [], function () {})
    if (typeof name === 'string') {
      const depsAndExec = getDepsAndExec(deps, execute);
      if (amdDefineDeps) {
        if (!System.registerRegistry)
          throw Error('Include the named register extension for SystemJS named AMD support.');
        addToRegisterRegistry(name, createAMDRegister(depsAndExec[0], depsAndExec[1]));
        amdDefineDeps = [];
        amdDefineExec = emptyFn;
        return;
      }
      else {
        if (System.registerRegistry)
          addToRegisterRegistry(name, createAMDRegister([].concat(depsAndExec[0]), depsAndExec[1]));
        name = deps;
        deps = execute;
      }
    }
    const depsAndExec = getDepsAndExec(name, deps);
    amdDefineDeps = depsAndExec[0];
    amdDefineExec = depsAndExec[1];
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
    if (!firstNamedDefine) {
      firstNamedDefine = define;
      Promise.resolve().then(function () {
        firstNamedDefine = null;
      });
    }

    // We must call System.getRegister() here to give other extras, such as the named-exports extra,
    // a chance to modify the define before it's put into the registerRegistry.
    // See https://github.com/systemjs/systemjs/issues/2073
    tmpRegister = define;
    System.registerRegistry[name] = System.getRegister();
    tmpRegister = null;
  }
})(typeof self !== 'undefined' ? self : global);
