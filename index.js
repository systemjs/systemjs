if (typeof Promise === 'undefined')
  require('when/es6-shim/Promise');

var System = require('./dist/system.src');

try {
  System.paths.traceur = 'file:' + require.resolve('traceur/bin/traceur.js');
}
catch(e) {}
try {
  System.paths.babel = 'file:' + require.resolve('babel-core/browser.js');
}
catch(e) {}
try {
  System.paths.babel = System.paths.babel || 'file:' + require.resolve('babel/browser.js');
}
catch(e) {}

module.exports = System;