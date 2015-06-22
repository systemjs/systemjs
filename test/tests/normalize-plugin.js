exports.normalize = function(name, parentName) {
  return name;
};
exports.fetch = function(load) {
  return 'exports.name = "' + load.name.split('!')[0] + '";';
}