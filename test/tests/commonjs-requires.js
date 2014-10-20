exports.d1 = require(
  './commonjs-d'
);

exports.d2 = (require
("./commonjs-d"));

exports.d3 = "require('not a dep')";