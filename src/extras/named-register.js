/*
 * SystemJS named register extension
 * Supports System.register('name', [..deps..], function (_export, _context) { ... })
 *
 * Names are written to the registry as-is
 * System.register('x', ...) can be imported as System.import('x')
 */

import { global } from '../common';

const systemJSPrototype = global.System.constructor.prototype;

const constructor = global.System.constructor;
function SystemJS(options) {
  constructor.call(this, options);
  this.registerRegistry = Object.create(null);
}

SystemJS.prototype = Object.create(systemJSPrototype);
SystemJS.prototype.onstructor = SystemJS;

const register = systemJSPrototype.register;
SystemJS.prototype.register = function (name, deps, declare) {
  if (typeof name !== 'string')
    return register.apply(this, arguments);

  this.registerRegistry[name] = [deps, declare];

  // Provide an empty module to signal success.
  return register.call(this, [], function () { return {}; });
};

const resolve = systemJSPrototype.resolve;
SystemJS.prototype.resolve = function (id, parentURL) {
  if (id[0] === '/' || id[0] === '.' && (id[1] === '/' || id[1] === '.' && id[2] === '/'))
    return resolve.call(this, id, parentURL);
  if (id in this.registerRegistry)
    return id;
  return resolve.call(this, id, parentURL);
};

const instantiate = systemJSPrototype.instantiate;
SystemJS.prototype.instantiate = function (url, firstParentUrl) {
  return this.registerRegistry[url] || instantiate.call(this, url, firstParentUrl);
};

global.System = new SystemJS();
