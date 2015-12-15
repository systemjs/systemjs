hookConstructor(function(constructor) {
  return function() {
    var loader = this;
    constructor.call(loader);

    if (typeof window != 'undefined' && typeof document != 'undefined' && window.location)
      var windowOrigin = location.protocol + '//' + location.hostname + (location.port ? ':' + location.port : '');

    loader.set('@@cjs-helpers', loader.newModule({
      getPathVars: function(moduleId) {
        // remove any plugin syntax
        var pluginIndex = moduleId.lastIndexOf('!');
        var filename;
        if (pluginIndex != -1)
          filename = moduleId.substr(0, pluginIndex);
        else
          filename = moduleId;

        var dirname = filename.split('/');
        dirname.pop();
        dirname = dirname.join('/');

        if (filename.substr(0, 8) == 'file:///') {
          filename = filename.substr(7);
          dirname = dirname.substr(7);

          // on windows remove leading '/'
          if (isWindows) {
            filename = filename.substr(1);
            dirname = dirname.substr(1);
          }
        }
        else if (windowOrigin && filename.substr(0, windowOrigin.length) === windowOrigin) {
          filename = filename.substr(windowOrigin.length);
          dirname = dirname.substr(windowOrigin.length);
        }

        return {
          filename: filename,
          dirname: dirname
        };
      }
    }))
  };
});