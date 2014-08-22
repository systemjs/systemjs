(function(global) {

  global.dep = $;

  global.laterDep = function() {
    return $;
  }

})(typeof window == 'undefined' ? global : window);