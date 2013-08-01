(function() {
  var syncLoad = function(url) {
    document.write('<' + 'script src="' + url + '">' + '<' + '/script>');
  }

  var scripts = document.getElementsByTagName('script');
  var curScript = scripts[scripts.length - 1];

  window.curMain = curScript.getAttribute('data-main')

  var curURLParts = window.location.pathname.split('/');

  while (curURLParts.pop() != 'tests-requirejs');

  var testPath = curURLParts.join('/');

  while (curURLParts.pop() != 'test');

  var basePath = curURLParts.join('/');
  curURLParts.pop();
  var deepBasePath = curURLParts.join('/');

  // load the es6 polyfill synchronously
  syncLoad(deepBasePath + '/es6-module-loader/lib/es6-module-loader.js');

  // then load jspm synchronously
  syncLoad(basePath + '/loader.js');

  // then wrap a dummy requirejs
  syncLoad(testPath + '/requirejs-wrapper.js');
})();