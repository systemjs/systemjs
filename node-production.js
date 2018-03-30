/*
 * Experimental Node production build
 */

var SystemProduction = require('./dist/system-production.src.js');
var path = require('path');
var Module = require('module');

var isWindows = process.platform.match(/^win/);
function fileUrlToPath (fileUrl) {
  if (fileUrl.substr(0, 7) !== 'file://')
    return;
  if (isWindows)
    return fileUrl.substr(8).replace(/\//g, '/');
  else
    return fileUrl.substr(7);
}
function pathToFileUrl (filePath) {
  return 'file://' + (isWindows ? '/' : '') + (isWindows ? filePath.replace(/\\/g, '/') : filePath);
}

var SystemJSProductionLoader = SystemProduction.constructor;

function SystemJSProductionNodeLoader () {
  SystemJSProductionLoader.call(this);
}

SystemJSProductionNodeLoader.prototype = Object.create(SystemJSProductionLoader.prototype);
SystemJSProductionNodeLoader.prototype.constructor = SystemJSProductionNodeLoader;

SystemJSProductionNodeLoader.prototype.version = SystemJSProductionLoader.prototype.version + ' Node Production';

var plainResolveSync = SystemJSProductionLoader.prototype[SystemJSProductionLoader.plainResolveSync];

// add node_modules loading to plain resolve
SystemJSProductionNodeLoader.prototype[SystemJSProductionLoader.plainResolve] =
SystemJSProductionNodeLoader.prototype[SystemJSProductionLoader.plainResolveSync] = function (key, parentKey) {
  // SystemJS map takes preference
  // SystemJS map targets entirely skip Node resolution process
  var resolved = plainResolveSync.call(this, key, parentKey);
  if (resolved !== undefined)
    return resolved;

  var parentPath = parentKey ? fileUrlToPath(parentKey) : process.cwd();
  var requireContext = new Module(decodeURI(parentPath));
  requireContext.paths = Module._nodeModulePaths(parentPath);

  try {
    resolved = Module._resolveFilename(key.substr(0, 5) === 'file:' ? fileUrlToPath(key) : key, requireContext, true);
  }
  catch (e) {
    if (e.code === 'MODULE_NOT_FOUND')
      return;
    throw e;
  }

  // core modules are returned as plain non-absolute paths -> convert into node:fs etc to have a URL
  return path.isAbsolute(resolved) ? pathToFileUrl(resolved) : 'node:' + resolved;
};

SystemJSProductionNodeLoader.prototype[SystemJSProductionLoader.instantiate] = function (key, processAnonRegister) {
  var loader = this;

  var path = fileUrlToPath(key);
  var curSystem = global.System;
  global.System = loader;
  var nodeModule = tryNodeLoad(key.substr(0, 5) === 'node:' ? key.substr(5) : path);
  global.System = curSystem;

  if (nodeModule) {
    // if it was System.register, then ignore the node loaded exports
    if (processAnonRegister())
      return;
    // CommonJS
    return Promise.resolve(loader.newModule({
      default: nodeModule,
      __useDefault: nodeModule
    }));
  }

  throw new TypeError('SystemJS production does not support loading ES or WASM modules in Node.');
};

function tryNodeLoad (path) {
  try {
    return require(path);
  }
  catch (e) {
    if (e instanceof SyntaxError &&
        // covers "Unexpected token [import|export]" as well as "Invalid or unexpected token" for WASM
        (e.message.indexOf('nexpected token') !== -1 ||
        // for Node 4 and less
        e.message.indexOf('Unexpected reserved word') !== -1))
      return;
    throw e;
  }
}

module.exports = new SystemJSProductionNodeLoader();
