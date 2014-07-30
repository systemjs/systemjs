define(["./amd-dep","require"],function(amdDep, req){
	var amdCJS = req("./amd-cjs-module");
	return {
		name: "require2",
		amdCJS: amdCJS,
		amdDep: amdDep
	};
});
