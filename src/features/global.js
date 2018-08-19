/*
 * Support for global loading
 */
import { global } from '../common.js';
import { systemJSPrototype } from '../system-core';

let lastGlobalProp;
let lastGlobalCheck = -1;
const instantiate = systemJSPrototype.instantiate;
systemJSPrototype.instantiate = function (url) {
  // snapshot the global list, debounced every 50ms
  const now = Date.now();
  if (now - lastGlobalCheck > 50) {
    lastGlobalProp = Object.keys(global).pop();
    lastGlobalCheck = now;
  }
  return instantiate.call(this, url);
};

const getRegister = systemJSPrototype.getRegister;
systemJSPrototype.getRegister = function () {
  const lastRegister = getRegister.call(this);
  if (lastRegister)
    return lastRegister;
  
  // no registration -> attempt a global detection as difference from snapshot
  // when multiple globals, we take the global value to be the last defined new global object property
  // for performance, this will not support multi-version / global collisions as previous SystemJS versions did
  const globalProp = Object.keys(global).pop();
  lastGlobalCheck = Date.now();
  if (lastGlobalProp === globalProp)
    return;
  
  lastGlobalProp = globalProp;
  let globalExport;
  try {
    globalExport = global[globalProp];
  }
  catch (e) {
    return;
  }

  return [[], function (_export) {
    return { execute: function () { _export('default', globalExport) } };
  }];  
};