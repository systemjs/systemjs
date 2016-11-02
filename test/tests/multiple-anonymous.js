define('named-in-anon', function() {
  return 'named';
});

define([], function() {

});

define(['named-in-anon'], function(named) {
  return {
    anon: true,
    named: named
  };
});
