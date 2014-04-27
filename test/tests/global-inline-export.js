"global";
"export p.r";

(function(window) {

  window.p = {
    r: 'r'
  };
})(typeof window != 'undefined' ? window : global);