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

// This comment should not trigger SystemJS to do a require because of this -> require('comment is not a dep')
exports.d7 = 'export';

var p = false && require('" + "test" + "');

// this line shouldn't be detected
" = require(", "),\n        ";

exports.d8 = `string literal require("string literal not a dep")`;

var regexWithRequireText = /  require('regex string not a dep') /;

/*

Mixed exclusion blocks are handled correctly

var regex = /  "  /; var string = "  /* " // one line;
require('asdf') // <- this will now be skipped as it will be in the '/*' comment
*//*

*/