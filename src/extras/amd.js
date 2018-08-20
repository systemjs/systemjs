/*
 * Support for AMD loading
 */
const global = typeof self !== 'undefined' ? self : global;

const systemPrototype = System.constructor.prototype;

const emptyInstantiation = [[], function () { return {} }];

function unsupportedRequire () {
  throw new Error('AMD require not supported.');
}

const requireExportsModule = ['require', 'exports', 'module'];

const getRegister = systemPrototype.getRegister;
systemPrototype.getRegister = function () {
  const lastRegister = getRegister.call(this);
  if (lastRegister && lastRegister[1].length !== 0)
    return lastRegister;
  // no registration -> attempt AMD detection
  if (!amdDefineDeps)
    return emptyInstantiation;
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
      setters.push(function (ns) {
        depModules[i] = ns.default;
      });
    }
    if (splice)
      amdDefineDeps[index] = id;
  }
  if (splice)
    amdDefineDeps.length -= splice;
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
  // define('', [], function () {})
  if (typeof name === 'string') {
    if (amdDefineDeps)
      throw new Error('Named AMD not supported.');
    amdDefineDeps = deps;
    amdDefineExec = execute;
  }
  // define([], function () {})
  else if (name instanceof Array) {
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