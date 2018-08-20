importScripts('../../dist/system.src.js');

SystemJS.config({
  map: {
    'plugin-babel': '../../node_modules/systemjs-plugin-babel/plugin-babel.js',
    'systemjs-babel-build': '../../node_modules/systemjs-plugin-babel/systemjs-babel-browser.js'
  },
  transpiler: 'plugin-babel'
});

System.import('es6-and-amd.js').then(function(m) {
  postMessage({
    amd: m.amd_module,
    es6: m.es6_module
  });
}, function(err) {
  console.error(err);
});
