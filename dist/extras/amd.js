/*
 * Support for AMD loading
 */
(function (global) {
  const systemPrototype = System.constructor.prototype;

  const emptyInstantiation = [[], function () { return {} }];

  function unsupportedRequire () {
    throw new Error('AMD require not supported.');
  }

  function unsupportedNamed () {
    throw new Error('Named AMD not supported.');
  }

  const requireExportsModule = ['require', 'exports', 'module'];

  // hook System.register to know the last declaration binding
  let lastRegisterDeclare;
  const systemRegister = systemPrototype.register;
  systemPrototype.register = function (deps, declare) {
    lastRegisterDeclare = declare;
    systemRegister.call(this, deps, declare);
  };

  const getRegister = systemPrototype.getRegister;
  systemPrototype.getRegister = function () {
    const register = getRegister.call(this);
    // if its an actual System.register leave it
    if (register && register[1] === lastRegisterDeclare)
      return register;

    // otherwise AMD takes priority
    // no registration -> attempt AMD detection
    if (!amdDefineDeps)
      return register || emptyInstantiation;

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
          depModules[idx] = ns.default;
        });
      }
      if (splice)
        amdDefineDeps[index] = id;
    }
    if (splice)
      amdDefineDeps.length -= splice;
    const amdExec = amdDefineExec;
    const registration = [amdDefineDeps, function (_export) {
      _export('default', exports);
      return {
        setters: setters,
        execute: function () {
          _export('default', amdExec.apply(exports, depModules) || module.exports);
        }
      };
    }];
    amdDefineDeps = null;
    return registration;
  };
  let amdDefineDeps;
  let amdDefineExec;
  global.define = function (name, deps, execute) {
    // define('', [], function () {})
    if (typeof name === 'string') {
      if (amdDefineDeps) {
        amdDefineDeps = [];
        amdDefineExec = unsupportedNamed;
        return;
      }
      else {
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
})(typeof self !== 'undefined' ? self : global);