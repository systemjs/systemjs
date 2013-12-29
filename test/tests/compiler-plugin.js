"cjs";
exports.translate = function(load) {
  return 'import { d } from "./default1"; export var extra = "yay!"; \n' + load.source;
}