#!/usr/bin/env node
var System = require('./index.js');
var path = require('path');

var args = process.argv.slice(2);

function importError (err) {
  setTimeout(function () {
    throw err;
  });
}
function readConfigFlags () {
  var flagIndex;

  flagIndex = args.indexOf('--config');
  if (flagIndex === -1)
    flagIndex = args.indexOf('-c');
  if (flagIndex !== -1) {
    var configFile = args.splice(flagIndex, 2)[1];

    var curSystem = global.System;
    var curSystemJS = global.SystemJS;
    global.System = global.SystemJS = System;
    require(configFile);
    global.System = curSystem;
    global.SystemJS = curSystemJS;
  }

  flagIndex = args.indexOf('--baseURL');
  if (flagIndex === -1)
    flagIndex = args.indexOf('-b');
  if (flagIndex !== -1) {
    System.config({
      baseURL: args.splice(flagIndex, 2)[1]
    });
  }

  /* flagIndex = args.indexOf('--paths');
  if (flagIndex === -1)
    flagIndex = args.indexOf('-p');
  if (flagIndex !== -1) {

  }

  flagIndex = args.indexOf('--map');
  if (flagIndex === -1)
    flagIndex = args.indexOf('-m');
  if (flagIndex !== -1) {

  }*/
}

switch (args[0]) {
  case 'run':
    readConfigFlags();
    if (!args[1]) {
      console.error('No filename or module provided to run.');
      process.exit(1);
    }

    System.import(args[1])
    .catch(importError);
  break;

  case 'exec':
    readConfigFlags();
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
    console.error('  sjs run <filename> [<Config Flags>]');
    console.error('  sjs exec <module code> [<Config Flags>]');
    console.error('');
    console.error('Config Flags:');
    console.error('  --config -c <configFile>');
    console.error('  --baseURL -b <baseURL>');
    // console.error('  --paths -p x/=path/to/ = x/ y=path/to/y/');
    // console.error('  --map -m x=y package={x=z}');
    process.exit(1);
}
