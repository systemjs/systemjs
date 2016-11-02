SystemJS.config({
  baseURL: 'test/',
  packages: {
    "ts": {
      "main": "plugin.js"
    },
    "typescript": {
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
    "typescript": "./node_modules/typescript"
  },
  transpiler: 'ts'
});

require('./test');
