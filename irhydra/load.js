var System = require('../node');

function load () {
  var loader = new System.constructor();
  return loader.import('./test/tests/register-circular1.js');
}

var i = 100;

function again () {
  i--;
  if (i)
    return load().then(again);
}

again();
