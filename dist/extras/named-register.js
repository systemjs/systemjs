/*
 * SystemJS named register extension
 * Supports System.register('name', [..deps..], function (_export, _context) { ... })
 * 
 * Names are written to the registry as-is
 * System.register('x', ...) can be imported as System.import('x')
 */
(function () {
  const systemJSPrototype = System.constructor.prototype;

  const constructor = System.constructor;
  const SystemJS = function () {
    constructor.call(this);
    this.registerRegistry = Object.create(null);
  };
  SystemJS.prototype = systemJSPrototype;
  System = new SystemJS();

  let firstNamedDefine;

  function clearFirstNamedDefine () {
    firstNamedDefine = null;
  }

  const register = systemJSPrototype.register;
  systemJSPrototype.register = function (name, deps, declare) {
    if (typeof name !== 'string')
      return register.apply(this, arguments);
    const define = [deps, declare];
    this.registerRegistry[name] = define;
    if (!firstNamedDefine) {
      firstNamedDefine = define;
      setTimeout(clearFirstNamedDefine, 0);
    }
    return register.apply(this, arguments);
  };

  const resolve = systemJSPrototype.resolve;
  systemJSPrototype.resolve = function (id, parentURL) {
    if (id[0] === '/' || id[0] === '.' && (id[1] === '/' || id[1] === '.' && id[2] === '/'))
      return resolve.call(this, id, parentURL);
    if (id in this.registerRegistry)
      return id;
    return resolve.call(this, id, parentURL);
  };

  const instantiate = systemJSPrototype.instantiate;
  systemJSPrototype.instantiate = function (url, firstParentUrl) {
    return this.registerRegistry[url] || instantiate.call(this, url, firstParentUrl);
  };

  const getRegister = systemJSPrototype.getRegister;
  systemJSPrototype.getRegister = function () {
    return firstNamedDefine || getRegister.call(this);
  }
})();
