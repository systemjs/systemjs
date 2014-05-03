"format cjs";
exports.translate = function(load) {
  load.source = 'require("tests/global"); exports.extra = "yay!"; \n' + load.source;
}
