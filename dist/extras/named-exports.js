/*
 * Named exports support for legacy module formats in SystemJS 2.0
 */
(function () {
  const systemPrototype = System.constructor.prototype;
  
  // hook System.register to know the last declaration binding
  let lastRegisterDeclare;
  const systemRegister = systemPrototype.register;
  systemPrototype.register = function (name, deps, declare) {
    lastRegisterDeclare = typeof name === 'string' ? declare : deps;
    systemRegister.apply(this, arguments);
  };

  const getRegister = systemPrototype.getRegister;
  systemPrototype.getRegister = function () {
    const register = getRegister.call(this);
    // if it is an actual System.register call, then its ESM
    // -> dont add named exports
    if (!register || register[1] === lastRegisterDeclare || register[1].length === 0)
      return register;
    
    // otherwise it was provided by a custom instantiator
    // -> extend the registration with named exports support
    const registerDeclare = register[1];
    register[1] = function (_export, _context) {
      // hook the _export function to note the default export
      let defaultExport, hasDefaultExport = false;
      const declaration = registerDeclare.call(this, function (name, value) {
        if (typeof name === 'object' && name.__useDefault)
          defaultExport = name.default, hasDefaultExport = true;
        else if (name === 'default')
          defaultExport = value;
        else if (name === '__useDefault')
          hasDefaultExport = true;
        _export(name, value);
      }, _context);
      // hook the execute function
      const execute = declaration.execute;
      if (execute)
        declaration.execute = function () {
          execute.call(this);
          // do a bulk export of the default export object
          // to export all its names as named exports
          if (hasDefaultExport && typeof defaultExport === 'object')
            for (let name in defaultExport) {
              // default is not a named export
              if (name !== 'default') {
                _export(name, defaultExport[name]);
              }
            }
        };
      return declaration;
    };
    return register;
  };
})();