import { global, isBrowser, isWorker } from './common.js';
import SystemJSProductionLoader from './systemjs-production-loader.js';

SystemJSProductionLoader.prototype.version = VERSION;

var System = new SystemJSProductionLoader();

// only set the global System on the global in browsers
if (isBrowser || isWorker) {
  global.SystemJS = System;

  // dont override an existing System global
  if (!global.System) {
    global.System = System;
  }
  // rather just extend or set a System.register on the existing System global
  else {
    var register = global.System.register;
    global.System.register = function () {
      if (register)
        register.apply(this, arguments);
      System.register.apply(this, arguments);
    };
  }
}

if (typeof module !== 'undefined' && module.exports)
  module.exports = System;
