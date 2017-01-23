global.System = require('../dist/system.src.js');

System.config({
  baseURL: 'test/',
  packages: {
    "ts": {
      "main": "plugin.js"
    },
    "actual-typescript": {
      "main": "lib/typescript.js",
      "meta": {
        "lib/typescript.js": {
          "exports": "ts"
        }
      }
    }
  },
  map: {
    "ts": "./node_modules/plugin-typescript/lib",
    "actual-typescript": "./node_modules/typescript",
    "typescript": "typescript-shim.js"
  },
  transpiler: 'ts'
});

require('./test');
