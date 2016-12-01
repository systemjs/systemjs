import { global, isBrowser } from './common.js';
import SystemJSProductionLoader from './systemjs-production-loader.js';

SystemJSProductionLoader.prototype.version = VERSION;

var System = new SystemJSProductionLoader();

global.SystemJS = System;

global.System = global.System || global.SystemJS;

if (typeof module !== 'undefined' && module.exports)
  module.exports = System;
