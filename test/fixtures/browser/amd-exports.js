define('name', ['exports', './amd-dep.js', './amd-module.js'], function(exports, dep, mod) {
  exports.test = 'hi';
  exports.dep = dep;
  exports.mod = mod;
});