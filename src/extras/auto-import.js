/**
 * Auto-import the first call to System.register 
 */
(function (global) {
  var systemJSPrototype = global.System.constructor.prototype;
  var systemInstantiate = systemJSPrototype.instantiate;
  var systemRegister = systemJSPrototype.register;
  var systemGetRegister = systemJSPrototype.getRegister;

  // hook into System.register (but release it after first usage)
  systemJSPrototype.register = function (deps, declare) {
    // reset System.register for subsequent usage
    systemJSPrototype.register = systemRegister;

    // register normally
    systemRegister.call(this, deps, declare);

    // save the current url, and pass it to `importLastRegisterAs`
    var scripts = document.getElementsByTagName("script");
    var scriptUrl = scripts[scripts.length - 1].src || document.baseURI;
    systemJSPrototype.importLastRegisterAs.call(this, scriptUrl);
  };

  // import the last register, but use id and parentUrl as
  systemJSPrototype.importLastRegisterAs = function () {
    // retrieve last register
    var register = systemGetRegister.call(this);
    
    // hook into System.instantiate (but release it after first usage)
    systemJSPrototype.instantiate = function () {
      // reset System.instantiate for subsequent usage
      systemJSPrototype.instantiate = systemInstantiate;
      
      return new Promise(function (resolve) {
        // resolve with the last register
        resolve(register);
      });
    };

    // do the actual import
    systemJSPrototype.import.apply(this, arguments);
  };
})(typeof self !== "undefined" ? self : global);
