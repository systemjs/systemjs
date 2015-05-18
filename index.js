if (typeof Promise === 'undefined')
  require('when/es6-shim/Promise');
if (typeof URL === 'undefined')
  require('es6-module-loader/src/url-polyfill');

module.exports = require('./dist/system.src');