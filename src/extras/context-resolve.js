/**
 * Support for SystemJS createContext to have a synchronous resolve method
 * that matches the behavior of the native `import.meta.resolve` in Node 18+. 
 * see: https://nodejs.org/api/esm.html#importmetaresolvespecifier
 * Note Node: v20.0.0, v18.19.0 | This API now returns a string synchronously instead of a Promise.
 */

(function (global) {
  var systemJSPrototype = global.System.constructor.prototype;
  var createContext = systemJSPrototype.createContext;
  systemJSPrototype.createContext = function (parentId) {
    var loader = this;
    var context = createContext.call(this, parentId);
    return Object.assign(context, {
      resolve: function (id, parentUrl) {
        return loader.resolve(id, parentUrl || parentId)
      }
    });
  }
})(typeof self !== 'undefined' ? self : global)
