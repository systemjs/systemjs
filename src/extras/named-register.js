/*
 * SystemJS named register extension
 * Supports System.register('name', [..deps..], function (_export, _context) { ... })
 * 
 * Names are resolved origin-relative, so
 * System.register(['x']) must be imported as System.import('/x')
 */
(function () {
  const systemJSPrototype = System.constructor.prototype;

  const registerRegistry = Object.create(null);

  const register = systemJSPrototype.register;
  systemJSPrototype.register = function (name, deps, declare) {
    if (typeof name !== 'string')
      return register.apply(this, arguments);
    
    registerRegistry['bundle:' + name] = [deps, declare];
  };

  const instantiate = systemJSPrototype.instantiate;
  systemJSPrototype.instantiate = function (url, firstParentUrl) {
    return registerRegistry[url] || instantiate.call(this, url, firstParentUrl);
  };
})();