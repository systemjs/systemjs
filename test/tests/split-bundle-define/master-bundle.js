define('master',['slave'], function(slave){
	return {name: "master", slave: slave};
});
