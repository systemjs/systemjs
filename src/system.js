import { global, isBrowser, isWorker } from './common.js';
import SystemJSLoader from './systemjs-loader.js';

SystemJSLoader.prototype.version = VERSION;

var System = new SystemJSLoader();

// only set the global System on the global in browsers
if (isBrowser || isWorker)
  global.SystemJS = global.System = System;

if (typeof module !== 'undefined' && module.exports)
  module.exports = System;
