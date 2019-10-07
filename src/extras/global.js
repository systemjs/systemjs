/*
 * SystemJS global script loading support
 * Extra for the s.js build only
 * (Included by default in system.js build)
 */
(function (global) {
  const systemJSPrototype = global.System.constructor.prototype;
  const isIE = navigator.userAgent.indexOf('Trident') !== -1;

  // safari unpredictably lists some new globals first or second in object order
  let firstGlobalProp, secondGlobalProp, lastGlobalProp;
  function getGlobalProp () {
    let cnt = 0;
    let lastProp;
    for (let p in global) {
      // do not check frames cause it could be removed during import
      if (
        !global.hasOwnProperty(p)
        || (!isNaN(p) && p < global.length)
        || (isIE && global[p] && global[p].parent === window)
      )
        continue;
      if (cnt === 0 && p !== firstGlobalProp || cnt === 1 && p !== secondGlobalProp)
        return p;
      cnt++;
      lastProp = p;
    }
    if (lastProp !== lastGlobalProp)
      return lastProp;
  }

  function noteGlobalProps () {
    // alternatively Object.keys(global).pop()
    // but this may be faster (pending benchmarks)
    firstGlobalProp = secondGlobalProp = undefined;
    for (let p in global) {
      // do not check frames cause it could be removed during import
      if (
        !global.hasOwnProperty(p)
        || (!isNaN(p) && p < global.length)
        || (isIE && global[p] && global[p].parent === window)
      )
        continue;
      if (!firstGlobalProp)
        firstGlobalProp = p;
      else if (!secondGlobalProp)
        secondGlobalProp = p;
      lastGlobalProp = p;
    }
    return lastGlobalProp;
  }

  const impt = systemJSPrototype.import;
  systemJSPrototype.import = function (id, parentUrl) {
    noteGlobalProps();
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
    const globalProp = getGlobalProp();
    if (!globalProp)
      return emptyInstantiation;

    let globalExport;
    try {
      globalExport = global[globalProp];
    }
    catch (e) {
      return emptyInstantiation;
    }

    return [[], function (_export) {
      return {
        execute: function () {
          _export({ default: globalExport, __useDefault: true });
        }
      };
    }];
  };
})(typeof self !== 'undefined' ? self : global);
