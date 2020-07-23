/**
 * Auto-import <script src="system-module.js"></script> registrations
 * Allows the browser preloader to work directly with SystemJS optimization
 */
import { systemJSPrototype, REGISTRY } from '../system-core.js';
import { hasDocument } from '../common.js';

var autoImports = {};

var systemRegister = systemJSPrototype.register;
systemJSPrototype.register = function (deps, declare) {
  if (hasDocument && document.readyState === 'loading' && typeof deps !== 'string') {
    var scripts = document.getElementsByTagName('script');
    var lastScript = scripts[scripts.length - 1];
    if (lastScript && lastScript.src) {
      // Only import if not already in the registry.
      // This avoids re-importing an inline dynamic System.import dependency.
      // There is still a risk if a user dynamically injects a custom System.register script during DOM load that does an
      // anomymous registration that is able to execute before DOM load completion, and thus is incorrectly matched to the
      // last script when it wasn't causing a System.import of that last script, but this is deemed an acceptable edge case
      // since due to custom user registration injection.
      // Not using document.currentScript is done to ensure IE11 equivalence.
      if (!this[REGISTRY][lastScript.src]) {
        autoImports[lastScript.src] = [deps, declare];
        // Auto import = immediately import the registration
        // It is up to the user to manage execution order for deep preloading.
        this.import(lastScript.src);
      }
      return;
    }
  }
  return systemRegister.call(this, deps, declare);
};

var systemInstantiate = systemJSPrototype.instantiate;
systemJSPrototype.instantiate = function (url) {
  var autoImport = autoImports[url];
  if (autoImport) {
    delete autoImports[url];
    return autoImport;
  }
  return systemInstantiate.apply(this, arguments);
};
