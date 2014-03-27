"cjs";
exports.translate = function(load) {
  return 'require("tests/global"); exports.extra = "yay!"; \n' + load.source;
}
