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
  var requireContext = new Module(parentPath);
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
      __useDefault: true
    }));
  }

  // Try WASM load
  var buffer = require('fs').readFileSync(path);
  var bytes = new Uint8Array(buffer);

  // detect by leading bytes
  // Can be (new Uint32Array(fetched))[0] === 0x6D736100 when working in Node
  if (bytes[0] === 0 && bytes[1] === 97 && bytes[2] === 115) {
    return WebAssembly.compile(buffer).then(function (m) {
      var deps = [];
      var setters = [];
      var importObj = {};

      // we can only set imports if supported (eg Safari doesnt support)
      if (WebAssembly.Module.imports)
        WebAssembly.Module.imports(m).forEach(function (i) {
          var key = i.module;
          setters.push(function (m) {
            importObj[key] = m;
          });
          if (deps.indexOf(key) === -1)
            deps.push(key);
        });
      loader.register(deps, function (_export) {
        return {
          setters: setters,
          execute: function () {
            _export(new WebAssembly.Instance(m, importObj).exports);
          }
        };
      });
      processAnonRegister();
    });
  }

  throw new TypeError('SystemJS production does not support loading ES modules. For ES module support see the node-es-module-loader project.');
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
