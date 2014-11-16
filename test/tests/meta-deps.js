System.meta.b = {
  deps: ['a']
};

define('a', [], function() {
  window.MODULEA = 'a';
});

define('b', [], function() {
  return {
    a: window.MODULEA
  };
});
