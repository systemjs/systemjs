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

    // save the current url
    // if it was not a external file, the script was inline so use baseURI
    var scripts = document.getElementsByTagName("script");
    var scriptUrl = scripts[scripts.length - 1].src || document.baseURI;
    
    // do the actual import
    systemJSPrototype.import.call(this, scriptUrl);
  };
})(typeof self !== "undefined" ? self : global);
