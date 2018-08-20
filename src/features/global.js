/*
 * Support for global loading
 */
import { global } from '../common.js';
import { systemJSPrototype } from '../system-core';

function getLastGlobalProp () {
  let lastProp;
  for (let p in global)
    if (global.hasOwnProperty(p))
      lastProp = p;
  return lastProp;
}

let lastGlobalProp;
const impt = systemJSPrototype.import;
systemJSPrototype.import = function (id, parentUrl) {
  if (!lastGlobalProp)
    lastGlobalProp = getLastGlobalProp();
  return impt.call(this, id, parentUrl);
};

const emptyInstantiation = [[], function () { return {} }];

const getRegister = systemJSPrototype.getRegister;
systemJSPrototype.getRegister = function () {
  const lastRegister = getRegister.call(this);
  if (lastRegister)
    return lastRegister;
  
  // no registration -> attempt a global detection as difference from snapshot
  // when multiple globals, we take the global value to be the last defined new global object property
  // for performance, this will not support multi-version / global collisions as previous SystemJS versions did
  const globalProp = getLastGlobalProp();
  if (lastGlobalProp === globalProp)
    return emptyInstantiation;
  
  lastGlobalProp = globalProp;
  let globalExport;
  try {
    globalExport = global[globalProp];
  }
  catch (e) {
    return emptyInstantiation;
  }

  return [[], function (_export) {
    return { execute: function () { _export('default', globalExport) } };
  }];
};