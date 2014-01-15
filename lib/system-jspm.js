/*
  SystemJS jspm

  Defines jspm paths for SystemJS

  Allows requires of the form:
    System.import('jquery')
    System.import('npm:underscore')

  To work directly over CDN.
*/
System.paths['*'] = 'https://registry.jspm.io/*.js';
System.paths['~/*'] = '*.js';
System.paths['npm:*'] = 'https://npm.jspm.io/*.js';
System.paths['github:*'] = 'https://github.jspm.io/*.js';
