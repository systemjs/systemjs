define('named-in-anon', function() {
  return 'named';
});

define([], function() {

});

define(function() {
  return {
    anon: true
  };
});
