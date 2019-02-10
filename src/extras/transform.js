import { detectFormat} from '../utils/formats';

/*
 * Support for a "transform" loader interface
 */
const systemJSPrototype = System.constructor.prototype;

const resolve = systemJSPrototype.resolve;
systemJSPrototype.resolve = function(url, parent) {
  return resolve.call(this, url, parent);
};

const instantiate = systemJSPrototype.instantiate;
systemJSPrototype.instantiate = function (url, parent) {
  if (url.slice(-5) === '.wasm') {
    return instantiate.call(this, url, parent);
  }

  const context = { parent };

  return this.fetch(context, url)
    .catch(({ code, message }) => {
      throw new Error(`Fetch error: ${code} ${message}${parent ? ` loading from ${parent}` : ''}`);
    })
    .then(source => this.detectFormat(context, url, source))
    .then(source => {
      if (this.transform.length === 3) {
        return this.transform(context, url, source);
      }
      return this.transform(url, source);
    })
    .then(source => this.evaluate(context, url, source))
    .then(registration => registration || this.getRegister());
};


// Hookable fetch function
systemJSPrototype.fetch = function(context, url) {
  const options = {
    credentials: 'same-origin',
  };

  return fetch(url, options).then(function (res) {
    if (res.ok) {
      return res.text();
    }

    throw {
      url,
      code: res.status,
      message: res.statusText,
    };
  }).catch(function(err) {
    throw err;
  });
};


// Hookable file format detection
systemJSPrototype.detectFormat = function(context, url, source) {
  context.format = detectFormat(url, source);
  return source;
};


// Hookable transform function!
systemJSPrototype.transform = function(context, url, source) {
  return source;
};

// Hookable evaluate function
systemJSPrototype.evaluate = function(context, url, source) {
  const wrapped = `${source}\n//# sourceURL=${url}`;
  (0, eval)(wrapped);
};
