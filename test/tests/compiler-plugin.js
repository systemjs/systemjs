"format cjs";
exports.translate = function(load) {
  load.source = 'require("tests/global.js"); exports.extra = "yay!"; \n' + load.source;
}
