'format global';
'deps ./global-dep';


(function(window) {
  window.newDep = jjQuery.v;
})(typeof window != 'undefined' ? window : global);