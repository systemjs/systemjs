/*
 * SystemJS global script loading support
 * Extra for the s.js build only
 * (Included by default in system.js build)
 */
(function (global) {

const systemJSPrototype = System.constructor.prototype;

function getLastGlobalProp () {
  // alternatively Object.keys(global).pop()
  // but this may be faster (pending benchmarks)
  let lastProp;
  for (let p in global)
    if (global.hasOwnProperty(p))
      lastProp = p;
  return lastProp;
}

let lastGlobalProp;
const impt = systemJSPrototype.import;
systemJSPrototype.import = function (id, parentUrl) {
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
  // note in Edge, deleting and re-adding a global does not change its ordering
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

})(typeof self !== 'undefined' ? self : global);