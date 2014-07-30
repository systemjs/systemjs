module.exports = F;
require('./cjs-exports-dep');
function F() {
  return 'export';
}
module.exports = require('./cjs-exports-dep');