import { init, parse } from 'es-module-lexer';

/*
 * Interop for ESM to return the module export
 */
(function (global) {
  var systemJSPrototype = global.System.constructor.prototype;
  var originalInstantiate = systemJSPrototype.instantiate;

  function checkEsm(url) {
    return fetch(url, { credentials: 'same-origin' })
      .then(function (res) {
        if (!res.ok)
          throw Error(errMsg(7,  'Fetch error: ' + res.status + ' ' + res.statusText + (parent ? ' loading from ' + parent : '')));
        return Promise.all([res.text(), init]);
      })
      .then(function ([source]) {
        var [imports, exports] = parse(source);
        return imports.length || exports.length;
      });
  }

  function loadEsm(url) {
    return import(url).then(function (exported) {
      return [
        [],
        function (_export) {
          return {
            execute() {
              _export(exported);
            }
          };
        },
      ];
    });
  }

  systemJSPrototype.instantiate = function (url) {
    return checkEsm(url).then(function (isEsm) {
      return isEsm ? loadEsm(url) : originalInstantiate.call(systemJSPrototype, url);
    });
  };

})(typeof self !== 'undefined' ? self : global);
