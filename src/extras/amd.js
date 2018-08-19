/*
 * Support for AMD loading
 */
const global = typeof self !== 'undefined' ? self : global;

const getRegister = System.prototype.getRegister;
System.prototype.getRegister = function () {
  const lastRegister = getRegister.call(this);
  if (lastRegister)
    return lastRegister;
  // no registration -> attempt AMD detection
  if (!amdDefineDeps)
    return;
  const exports = {};
  const module = { exports: exports };
  const depModules = [];
  const setters = [];
  for (let i = 0; i < amdDefineDeps.length; i++) {
    const id = amdDefineDeps[i];
    if (id === 'require')
      throw new Error('AMD require not supported.');
    if (id === 'module') {
      depModules[i] = module;
    }
    else if (id === 'exports') {
      depModules[i] = exports;
    }
    else {
      const index = setters.length;
      setters.push(function (ns) {
        depModules[index] = ns.default;
      });
    }
  }
  const amdExec = amdDefineExec;
  return [amdDefineDeps, function (_export) {
    _export('default', exports);
    return {
      setters: setters,
      execute: function () {
        _export('default', amdExec.apply(exports, depModules) || module.exports);
      }
    };
  }];
};
let amdDefineDeps;
let amdDefineExec;
global.define = function (name, deps, execute) {
  if (typeof name === 'string') {
    if (amdDefineDeps)
      throw new Error('Named AMD not supported.');
    amdDefineDeps = deps;
    amdDefineExec = execute;
  }
  else {
    amdDefineDeps = name;
    amdDefineExec = deps;
  }
};