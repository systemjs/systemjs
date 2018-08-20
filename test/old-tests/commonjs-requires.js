exports.d6 = 
/**/require('./commonjs-d2.js');

exports.d1 = require(
  './commonjs-d.js'
);

exports.d2 = (require
("./commonjs-d.js"));

var regex = /  \/* /;

exports.d3 = "require('not a dep')";

exports.d4 = "text/* require('still not a dep') text";

exports.d5 = 'text \'quote\' require("yet still not a dep")';

var regexWithString = /asdfasdf " /;

var regexClose = /asdf " */;

// This comment triggered SystemJS to do a require because of this -> require('')
exports.d7 = 'export';

var p = false && require('" + "test" + "');

// this line shouldn't be detected
" = require(", "),\n        ";


/*

Unsolved breaking cases:

var regex = /  "  /; var string = "  /* " // one line;
require('asdf') // <- this will now be skipped as it will be in the '/*' comment
*//*

*/