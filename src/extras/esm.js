/*
 * Interop for ESM to return the module export
 */
(function (global) {
  var systemJSPrototype = global.System.constructor.prototype;

  var originalCreateScript = systemJSPrototype.createScript;
  systemJSPrototype.createScript = function() {
    var script = originalCreateScript.apply(this, arguments);
    script.type = 'module';
    return script;
  };

  function loadEsm(url) {
    return import(url).then(function (esModule) {
      if (Object.keys(esModule).length === 0) {
        throw new Error('No export found');
      }

      return [
        [],
        function(_export) {
          return {
            execute() {
              _export(esModule);
            }
          };
        }
      ];
    });
  }

  var originalInstantiate = systemJSPrototype.instantiate;
  systemJSPrototype.instantiate = function(url, parentUrl) {
    var loader = this;

    return originalInstantiate
      .apply(this, arguments)
      .then(function(lastRegister) {
        return loadEsm(loader.resolve(url, parentUrl))
          .catch(function () {
            return lastRegister;
          });
      });
  };

})(typeof self !== 'undefined' ? self : global);
