import { global, isBrowser } from './common.js';
import SystemJSLoader from './systemjs-loader.js';

SystemJSLoader.prototype.version = VERSION;

var System = new SystemJSLoader();

global.SystemJS = System;

global.System = global.System || global.SystemJS;

if (typeof module !== 'undefined' && module.exports)
  module.exports = System;
