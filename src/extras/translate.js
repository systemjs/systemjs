/*
 * Support for a "translate" loader interface
 */
(function () {
  const systemJSPrototype = System.constructor.prototype;

  const instantiate = systemJSPrototype.instantiate;
  systemJSPrototype.instantiate = function (url) {
    if (url.slice(-5) === '.wasm')
      return instantiate.call(this, url);

    const loader = this;
    return fetch(url)
    .then(function (res) {
      if (!res.ok)
        throw new Error('Fetch error: ' + res.status + ' ' + res.statusText);
      return res.text();
    })
    .then(function (source) {
      return loader.translate.call(this, url, source);
    })
    .then(function (source) {
      (0, eval)(source + '\n//# sourceURL=' + url);
      return loader.getRegister();
    });
  };

  // Hookable translate function!
  System.translate = function (_id, source) {
    return source;
  };
})();