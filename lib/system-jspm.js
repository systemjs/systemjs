/*
  SystemJS jspm

  Defines jspm paths for SystemJS

  Allows requires of the form:
    System.import('jquery')
    System.import('npm:underscore')

  To work directly over CDN.
*/
System.paths['~/*'] = System.baseURL + '*.js';
System.baseURL = 'https://registry.jspm.io/';
System.paths['npm:*'] = 'https://npm.jspm.io/*.js';
System.paths['github:*'] = 'https://github.jspm.io/*.js';
