import { errMsg } from '../err-msg.js';

/*
 * Support for a "transform" loader interface
 *
 * Note: This extra is deprecated and will be removed in the next major.
 */
(function (global) {
  var systemJSPrototype = global.System.constructor.prototype;

  var instantiate = systemJSPrototype.instantiate;
  systemJSPrototype.instantiate = function (url, parent, meta) {
    if (url.slice(-5) === '.wasm')
      return instantiate.call(this, url, parent, meta);

    var loader = this;
    return fetch(url, { credentials: 'same-origin' })
    .then(function (res) {
      if (!res.ok)
        throw Error(errMsg(7, process.env.SYSTEM_PRODUCTION ? [res.status, res.statusText, parent].join(', ') : 'Fetch error: ' + res.status + ' ' + res.statusText + (parent ? ' loading from ' + parent : '')));
      return res.text();
    })
    .then(function (source) {
      return loader.transform.call(this, url, source);
    })
    .then(function (source) {
      (0, eval)(source + '\n//# sourceURL=' + url);
      return loader.getRegister(url);
    });
  };

  // Hookable transform function!
  systemJSPrototype.transform = function (_id, source) {
    return source;
  };
})(typeof self !== 'undefined' ? self : global);
