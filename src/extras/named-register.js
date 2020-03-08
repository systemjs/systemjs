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

  let lastNamedDefine, tmpRegister;

  function setRegisterRegistry(systemInstance) {
    systemInstance.registerRegistry = Object.create(null);
  }

  const register = systemJSPrototype.register;
  systemJSPrototype.register = function (name, deps, declare) {
    if (typeof name !== 'string')
      return register.apply(this, arguments);
    const define = [deps, declare];

    // We must call System.getRegister() here to give other extras a chance to
    // modify the define before it's put into the registerRegistry.
    // See https://github.com/systemjs/systemjs/issues/2073
    tmpRegister = define;
    this.registerRegistry[name] = System.getRegister();
    tmpRegister = null;

    lastNamedDefine = define;
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
    if (tmpRegister) {
      return tmpRegister;
    }

    // Calling getRegister() because other extras need to know it was called so they can perform side effects
    const register = getRegister.call(this);

    const result = lastNamedDefine || register;
    lastNamedDefine = null;
    return result;
  }
})(typeof self !== 'undefined' ? self : global);
