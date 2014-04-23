exports.instantiate = function(load) {
    
    return {
			deps: [],
			execute: function(){
				var head = document.head || document.getElementsByTagName('head')[0],
					style = document.createElement('style');
				
				style.type = 'text/css';
				if (style.styleSheet){
				  style.styleSheet.cssText = load.source;
				} else {
				  style.appendChild(document.createTextNode(load.source));
				}
				head.appendChild(style);
				return new System.global.Module({});
		}
	};
};

exports.buildType = "css";
