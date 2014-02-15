"cjs";
exports.translate = function(load) {
  return 'import { d } from "tests/default1"; export var extra = "yay!"; \n' + load.source;
}