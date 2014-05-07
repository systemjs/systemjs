"format cjs";
exports.translate = function(load, systemTranslate) {
  load.source = 'require("tests/global"); exports.extra = "yay!"; \n' + load.source;
  return systemTranslate.call(this, load);
}
