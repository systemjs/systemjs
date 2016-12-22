#!/usr/bin/env node
var System = require('./index.js');
var path = require('path');

var args = process.argv.slice(2);

function importError (err) {
  setTimeout(function () {
    throw err;
  });
}

switch (args[0]) {
  case 'run':
    if (!args[1]) {
      console.error('No filename or module provided to run.');
      process.exit(1);
    }

    System.import(args[1])
    .catch(importError);
  break;

  case 'exec':
    var code = args.slice(1).join(' ');
    var i = 1;
    var key;
    while (System.registry.has(key = '<anon' + i + '>'))
      i++;
    System.define(key, code);
    System.import(key)
    .catch(importError);
  break;

  default:
    console.error('Invalid command ' + args[0]);
    console.error('');
    console.error('Usage:')
    console.error('  sjs run <filename>');
    console.error('  sjs exec <module code>');
    process.exit(1);
}
