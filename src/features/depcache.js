import { IMPORT_MAP } from '../common.js';
import { systemJSPrototype, getOrCreateLoad } from '../system-core.js';
import { importMap } from './import-maps.js';

var systemInstantiate = systemJSPrototype.instantiate;
systemJSPrototype.instantiate = function (url, firstParentUrl) {
  var preloads = (!process.env.SYSTEM_BROWSER && this[IMPORT_MAP] || importMap).depcache[url];
  if (preloads) {
    for (var i = 0; i < preloads.length; i++)
      getOrCreateLoad(this, this.resolve(preloads[i], url), url);
  }
  return systemInstantiate.call(this, url, firstParentUrl);
};