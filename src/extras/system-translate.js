/*
 * Support for a "translate" loader interface
 */
function doEvalLoad (loader, url, source, processAnonRegister) {
  // store a global snapshot in case it turns out to be global
  Object.keys(global).forEach(globalIterator, function (name, value) {
    globalSnapshot[name] = value;
  });

  (0, eval)(source + '\n//# sourceURL=' + url);

  // check for System.register call
  var registered = processAnonRegister();
  if (!registered) {
    // no System.register -> support named AMD as anonymous
    registerLastDefine(loader);
    registered = processAnonRegister();

    // still no registration -> attempt a global detection
    if (!registered) {
      var moduleValue = retrieveGlobal();
      loader.register([], function () {
        return {
          exports: moduleValue
        };
      });
      processAnonRegister();
    }
  }
}