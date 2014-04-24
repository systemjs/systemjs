//template.plug!plug
define('amd-dependency', function () {
    return {
    	name: "amd-dependency"
    };
});
//main
define('tests/amd-bundle', function(require, exports, module) {
	var res = require("amd-dependency");
	return {
		name: 'tests/amd-bundle',
		dep: res
	};
});