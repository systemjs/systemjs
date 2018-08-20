importScripts('../../dist/system.src.js');

SystemJS.config({
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
    "ts": "../../node_modules/plugin-typescript/lib",
    "typescript": "../../node_modules/typescript"
  },
  transpiler: 'ts'
});

System.import('es6-and-amd.js').then(function(m) {
  postMessage({
    amd: m.amd_module,
    es6: m.es6_module
  });
}, function(err) {
  console.error(err);
});
