/*
 * SystemJS context.import.resolve as synchronous function
 */


// SystemJS defines dynamic `import.meta.resolve` as being asynchronous, but this is not the case in node 18+
// it also is different than System.resolve's behavior, which is synchronous
// see: https://nodejs.org/api/esm.html#importmetaresolvespecifier
// Note Node: v20.0.0, v18.19.0	| This API now returns a string synchronously instead of a Promise.

(function (global) {
  var systemJSPrototype = global.System.constructor.prototype;

  var createContext = systemJSPrototype.createContext;

  systemJSPrototype.createContext = function (parentId) {
    const loader = this;
    const context = createContext.call(this, parentId);
    return {
      ...context,
      resolve: function (id, parentUrl) {
        return loader.resolve(id, parentUrl || parentId)
      }
    }
  }
})(typeof self !== 'undefined' ? self : global)

