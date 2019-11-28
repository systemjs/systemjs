/*
 * Support for AMD loading
 */
(function (global) {
  const systemPrototype = global.System.constructor.prototype;

  const emptyInstantiation = [[], function () { return {} }];

  function unsupportedRequire () {
    throw Error('AMD require not supported.');
  }

  let tmpRegister;

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
          module.exports = amdExec.apply(exports, depModules) || module.exports;
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

    const register = getRegister.call(this);
    // if its an actual System.register leave it
    if (register && register[1] === lastRegisterDeclare)
      return register;

    // otherwise AMD takes priority
    // no registration -> attempt AMD detection
    if (!amdDefineDeps)
      return register || emptyInstantiation;

    const registration = createAMDRegister(amdDefineDeps, amdDefineExec);
    amdDefineDeps = null;
    return registration;
  };
  let amdDefineDeps, amdDefineExec;
  global.define = function (name, deps, execute) {
    // define('', [], function () {})
    if (typeof name === 'string') {
      if (amdDefineDeps) {
        if (!System.registerRegistry)
          throw Error('Include the named register extension for SystemJS named AMD support.');
        addToRegisterRegistry(name, createAMDRegister(deps, execute));
        amdDefineDeps = [];
        amdDefineExec = emptyFn;
        return;
      }
      else {
        if (System.registerRegistry)
          addToRegisterRegistry(name, createAMDRegister([].concat(deps), execute));
        name = deps;
        deps = execute;
      }
    }
    // define([], function () {})
    if (name instanceof Array) {
      amdDefineDeps = name;
      amdDefineExec = deps;
    }
    // define({})
    else if (typeof name === 'object') {
      amdDefineDeps = [];
      amdDefineExec = function () { return name };
    }
    // define(function () {})
    else if (typeof name === 'function') {
      amdDefineDeps = requireExportsModule;
      amdDefineExec = name;
    }
  };
  global.define.amd = {};

  function addToRegisterRegistry(name, define) {
    // We must call System.getRegister() here to give other extras, such as the named-exports extra,
    // a chance to modify the define before it's put into the registerRegistry.
    // See https://github.com/systemjs/systemjs/issues/2073
    tmpRegister = define;
    System.registerRegistry[name] = System.getRegister();
    tmpRegister = null;
  }
})(typeof self !== 'undefined' ? self : global);
