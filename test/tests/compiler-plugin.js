exports.translate = function(load) {
  return 'export var extra = "yay!"; \n' + load.source;
}