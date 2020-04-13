(function(){/*
 * SystemJS named register extension
 * Supports System.register('name', [..deps..], function (_export, _context) { ... })
 * 
 * Names are written to the registry as-is
 * System.register('x', ...) can be imported as System.import('x')
 */
(function (global) {
  var System = global.System;
  setRegisterRegistry(System);
  var systemJSPrototype = System.constructor.prototype;
  var constructor = System.constructor;
  var SystemJS = function () {
    constructor.call(this);
    setRegisterRegistry(this);
  };
  SystemJS.prototype = systemJSPrototype;
  System.constructor = SystemJS;

  var firstNamedDefine;

  function setRegisterRegistry(systemInstance) {
    systemInstance.registerRegistry = Object.create(null);
  }

  var register = systemJSPrototype.register;
  systemJSPrototype.register = function (name, deps, declare) {
    if (typeof name !== 'string')
      return register.apply(this, arguments);
    var define = [deps, declare];
    this.registerRegistry[name] = define;
    if (!firstNamedDefine) {
      firstNamedDefine = define;
      Promise.resolve().then(function () {
        firstNamedDefine = null;
      });
    }
    return register.apply(this, arguments);
  };

  var resolve = systemJSPrototype.resolve;
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

  var instantiate = systemJSPrototype.instantiate;
  systemJSPrototype.instantiate = function (url, firstParentUrl) {
    var result = this.registerRegistry[url];
    if (result) {
      this.registerRegistry[url] = null;
      return result;
    } else {
      return instantiate.call(this, url, firstParentUrl);
    }
  };

  var getRegister = systemJSPrototype.getRegister;
  systemJSPrototype.getRegister = function () {
    // Calling getRegister() because other extras need to know it was called so they can perform side effects
    var register = getRegister.call(this);

    var result = firstNamedDefine || register;
    firstNamedDefine = null;
    return result;
  };
})(typeof self !== 'undefined' ? self : global);}());