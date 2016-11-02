importScripts('../../node_modules/bluebird/js/browser/bluebird.js');
importScripts('../../dist/system.src.js');

System.config({
  traceurOptions: {
    asyncFunctions: true
  },
  map: {
    'plugin-traceur': '../../node_modules/systemjs-plugin-traceur/plugin-traceur.js',
    'traceur': '../../node_modules/traceur/bin/traceur.js'
  },
  meta: {
    'traceur': {
      format: 'global',
      exports: 'traceur',
      scriptLoad: false
    }
  },
  transpiler: 'plugin-traceur'
});

System.import('es6-and-amd.js').then(function(m) {
  postMessage({
    amd: m.amd_module,
    es6: m.es6_module
  });
}, function(err) {
  console.error(err);
});
