importScripts('../../node_modules/bluebird/js/browser/bluebird.core.js');
importScripts('../../dist/system.js');

System.import('../fixtures/register-modules/es6-withdep.js').then(function(m) {
  postMessage({
    p: m.p
  });
}, function(err) {
  console.error(err);
});