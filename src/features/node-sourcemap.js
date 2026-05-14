import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { SourceMap } from 'module';

export var hasSourceMapSupport = typeof SourceMap === 'function';

if (hasSourceMapSupport) {
  var sourceMapUrls = Object.create(null);
  var sourceMapCache = Object.create(null);

  var getSourceMap = function (fileName) {
    if (sourceMapCache[fileName]) return sourceMapCache[fileName];
    var mapUrl = sourceMapUrls[fileName];
    if (!mapUrl) return;
    try {
      var mapSource = readFileSync(fileURLToPath(mapUrl), 'utf-8');
      sourceMapCache[fileName] = new SourceMap(JSON.parse(mapSource));
      return sourceMapCache[fileName];
    } catch (e) {
      // Remove bad entry so we don't retry
      delete sourceMapUrls[fileName];
    }
  };

  var originalPrepareStackTrace = Error.prepareStackTrace;
  Error.prepareStackTrace = function (error, callSites) {
    var hasMapping = callSites.some(function (callSite) {
      var fileName = callSite.getScriptNameOrSourceURL();
      return fileName && (sourceMapCache[fileName] || sourceMapUrls[fileName]);
    });

    if (!hasMapping) {
      return originalPrepareStackTrace
        ? originalPrepareStackTrace(error, callSites)
        : error + '\n' + callSites.map(function (s) { return '    at ' + s; }).join('\n');
    }

    var mappedStack = callSites.map(function (callSite) {
      var fileName = callSite.getScriptNameOrSourceURL();
      var lineNumber = callSite.getLineNumber() || 0;
      var columnNumber = callSite.getColumnNumber() || 0;
      var sm = fileName && getSourceMap(fileName);

      if (sm) {
        var entry = sm.findEntry(lineNumber - 1, columnNumber - 1);
        if (entry && entry.originalSource) {
          var source = entry.originalSource;
          var line = entry.originalLine + 1;
          var column = entry.originalColumn + 1;
          var fnName = callSite.getFunctionName();
          return '    at ' + (fnName ? fnName + ' ' : '') + '(' + source + ':' + line + ':' + column + ')';
        }
      }

      return '    at ' + callSite;
    });

    return error + '\n' + mappedStack.join('\n');
  };

  // Clean up source map caches when modules are deleted
  var origDelete = global.System.constructor.prototype.delete;
  global.System.constructor.prototype.delete = function (id) {
    delete sourceMapUrls[id];
    delete sourceMapCache[id];
    if (origDelete) {
      return origDelete.apply(this, arguments);
    }
    return false;
  };
} else {
  console.warn('SystemJS source map support requires Node.js 20 or later');
}

export var addSourceMapUrl = hasSourceMapSupport
  ? function (url, source) {
    var match = source.match(/\/\/[#@]\s*sourceMappingURL=(.+)\s*$/m);
    if (match) {
      sourceMapUrls[url] = new URL(match[1], url).href;
    }
  }
  : function () {};
