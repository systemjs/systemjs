define(function(require, exports) {
  var circular1 = require('./amd-circular1');
  exports.fn = function() {
    return circular1.val;
  }
});