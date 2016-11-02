import { global, isBrowser } from './common.js';
import SystemJSLoader from './systemjs-loader.js';

SystemJSLoader.prototype.version = VERSION;

var System = new SystemJSLoader();

global.System = global.SystemJS = System;

if (typeof module !== 'undefined' && module.exports)
  module.exports = System;
