importScripts('../../dist/system.src.js');

System.baseURL = '../';
System.paths['typescript'] = '../node_modules/typescript/bin/typescript.js';
System.meta['typescript'] = { format: 'global', exports: 'ts' };
System.transpiler = 'typescript';

System.normalizeSync('test');

System.import('tests/es6-and-amd.js').then(function(m) {
  postMessage({
    amd: m.amd_module,
    es6: m.es6_module
  });
}, function(err) {
  console.error(err);
});
