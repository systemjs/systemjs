export var esmDep = true;

(function(g) {
  g.esmDep = 'esm-dep';
})(typeof window != 'undefined' ? window : global);