(function(g) {
  g.globalName = 'encapsulated global';
})(typeof window != 'undefined' ? window : global);