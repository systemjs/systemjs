define(['./amd-circular2.js'], function(dep) {
  var depFunc = dep.fn;
  this.val = 5;
  this.outFunc = function() {
    return depFunc();
  }
});