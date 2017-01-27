if (typeof Promise === 'undefined')
  require('when/es6-shim/Promise');

var version = require('./package.json').version;

var isWindows = typeof process.platform != 'undefined' && process.platform.match(/^win/);

// set transpiler paths in Node
var nodeResolver = typeof process != 'undefined' && typeof require != 'undefined' && require.resolve;
function configNodePath(loader, module, nodeModule) {
  if (loader.paths[module])
    return;

  try {
    var match = nodeResolver(nodeModule + (module[module.length - 1] === '/' ? 'package.json' : '')).replace(/\\/g, '/');
  }
  catch(e) {}

  if (match)
    loader.paths[module] = 'file://' + (isWindows ? '/' : '') + match.substr(0, match.length - (module[module.length - 1] === '/' ? 12 : 0));
}

var SystemJSLoader = require('./dist/system.src').constructor;

// standard class extend SystemJSLoader to SystemJSNodeLoader
function SystemJSNodeLoader() {
  SystemJSLoader.call(this);

  if (nodeResolver) {
    configNodePath(this, 'traceur', 'traceur/bin/traceur.js');
    configNodePath(this, 'traceur-runtime', 'traceur/bin/traceur-runtime.js');
    configNodePath(this, 'babel', 'babel-core/browser.js');
    configNodePath(this, 'babel/external-helpers', 'babel-core/external-helpers.js');
    configNodePath(this, 'babel-runtime/', 'babel-runtime/');
  }
}
SystemJSNodeLoader.prototype = Object.create(SystemJSLoader.prototype);
SystemJSNodeLoader.prototype.constructor = SystemJSNodeLoader;

var System = new SystemJSNodeLoader();

System.version = version + ' Node';

if (typeof global != 'undefined')
  global.System = global.SystemJS = System;

module.exports = System;
