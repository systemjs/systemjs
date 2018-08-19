System.registerDynamic([], true, function(require, exports, module) {
  module.exports = function() {
    return 'ok';
  };
  module.exports.named = 'name!';
});
