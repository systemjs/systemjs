(function(){function errMsg(errCode, msg) {
  return (msg || "") + " (SystemJS Error#" + errCode + " " + "https://git.io/JvFET#" + errCode + ")";
}/*
 * Support for AMD loading
 */
(function (global) {
  var systemPrototype = global.System.constructor.prototype;

  var emptyInstantiation = [[], function () { return {} }];

  function unsupportedRequire () {
    throw Error( errMsg(5, 'AMD require not supported.'));
  }

  var tmpRegister, firstNamedDefine;

  function emptyFn () {}

  var requireExportsModule = ['require', 'exports', 'module'];

  function createAMDRegister (amdDefineDeps, amdDefineExec) {
    var exports = {};
    var module = { exports: exports };
    var depModules = [];
    var setters = [];
    var splice = 0;
    for (var i = 0; i < amdDefineDeps.length; i++) {
      var id = amdDefineDeps[i];
      var index = setters.length;
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
        createSetter(i);
      }
      if (splice)
        amdDefineDeps[index] = id;
    }
    if (splice)
      amdDefineDeps.length -= splice;
    var amdExec = amdDefineExec;
    return [amdDefineDeps, function (_export) {
      _export({ default: exports, __useDefault: true });
      return {
        setters: setters,
        execute: function () {
          var amdResult = amdExec.apply(exports, depModules);
          if (amdResult !== undefined)
            module.exports = amdResult;
          if (exports !== module.exports)
            _export('default', module.exports);
        }
      };
    }];

    // needed to avoid iteration scope issues
    function createSetter(idx) {
      setters.push(function (ns) {
        depModules[idx] = ns.__useDefault ? ns.default : ns;
      });
    }
  }

  // hook System.register to know the last declaration binding
  var lastRegisterDeclare;
  var systemRegister = systemPrototype.register;
  systemPrototype.register = function (name, deps, declare) {
    lastRegisterDeclare = typeof name === 'string' ? declare : deps;
    systemRegister.apply(this, arguments);
  };

  var instantiate = systemPrototype.instantiate;
  systemPrototype.instantiate = function() {
    // Reset "currently executing script"
    amdDefineDeps = null;
    return instantiate.apply(this, arguments);
  };

  var getRegister = systemPrototype.getRegister;
  systemPrototype.getRegister = function () {
    if (tmpRegister)
      return tmpRegister;

    var _firstNamedDefine = firstNamedDefine;
    firstNamedDefine = null;

    var register = getRegister.call(this);
    // if its an actual System.register leave it
    if (register && register[1] === lastRegisterDeclare)
      return register;

    var _amdDefineDeps = amdDefineDeps;
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
  var amdDefineDeps, amdDefineExec;
  global.define = function (name, deps, execute) {
    var depsAndExec;
    // define('', [], function () {})
    if (typeof name === 'string') {
      depsAndExec = getDepsAndExec(deps, execute);
      if (amdDefineDeps) {
        if (!System.registerRegistry) {
          throw Error( errMsg(6, 'Include the named register extension for SystemJS named AMD support.'));
        }
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
    depsAndExec = getDepsAndExec(name, deps);
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
})(typeof self !== 'undefined' ? self : global);}());