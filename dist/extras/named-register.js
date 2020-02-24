/*
 * SystemJS named register extension
 * Supports System.register('name', [..deps..], function (_export, _context) { ... })
 * 
 * Names are written to the registry as-is
 * System.register('x', ...) can be imported as System.import('x')
 */
(function (global) {
  const System = global.System;
  setRegisterRegistry(System);
  const systemJSPrototype = System.constructor.prototype;
  const constructor = System.constructor;
  const SystemJS = function () {
    constructor.call(this);
    setRegisterRegistry(this);
  };
  SystemJS.prototype = systemJSPrototype;
  System.constructor = SystemJS;

  let firstNamedDefine;

  function setRegisterRegistry(systemInstance) {
    systemInstance.registerRegistry = Object.create(null);
  }

  const register = systemJSPrototype.register;
  systemJSPrototype.register = function (name, deps, declare) {
    if (typeof name !== 'string')
      return register.apply(this, arguments);
    const define = [deps, declare];
    this.registerRegistry[name] = define;
    if (!firstNamedDefine) {
      firstNamedDefine = define;
      setTimeout(function () {
        firstNamedDefine = null;
      });
    }
    return register.apply(this, arguments);
  };

  const resolve = systemJSPrototype.resolve;
  systemJSPrototype.resolve = function (id, parentURL) {
    try {
      // Prefer import map (or other existing) resolution over the registerRegistry
      return resolve.call(this, id, parentURL);
    } catch (err) {
      if (id in this.registerRegistry) {
        return id;
      }
      throw err;
    }
  };

  const instantiate = systemJSPrototype.instantiate;
  systemJSPrototype.instantiate = function (url, firstParentUrl) {
    const result = this.registerRegistry[url];
    if (result) {
      this.registerRegistry[url] = null;
      return result;
    } else {
      return instantiate.call(this, url, firstParentUrl);
    }
  };

  const getRegister = systemJSPrototype.getRegister;
  systemJSPrototype.getRegister = function () {
    // Calling getRegister() because other extras need to know it was called so they can perform side effects
    const register = getRegister.call(this);

    const result = firstNamedDefine || register;
    firstNamedDefine = null;
    return result;
  }
})(typeof self !== 'undefined' ? self : global);
