exports.obj = { circular: 'mess' };
var setter = require('./all-circular3');
exports.set = function() {
  setter.setObj();
}
