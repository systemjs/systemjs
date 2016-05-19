importScripts('../../dist/system.src.js');

System.paths['traceur'] = '../../node_modules/traceur/bin/traceur.js';

console.log('importing');
System.import('es6-and-amd.js').then(function(m) {
  postMessage({
    amd: m.amd_module,
    es6: m.es6_module
  });
}, function(err) {
  console.error(err);
});
