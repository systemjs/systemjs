"bundle";
(function() {
var define = System.amdDefine;
define("tests/lib/modD.js", ["require", "exports", "module"], function(require, exports, module) {
  'use strict';
  exports.D = "D";
});

})();
(function() {
var define = System.amdDefine;
define("tests/lib/modB.js", ["require", "exports", "module", "../modC.js", "./modD.js"], function(require, exports, module) {
  'use strict';
  require('../modC.js');
  require('./modD.js');
  exports.B = "B";
});

})();