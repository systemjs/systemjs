/*
  SystemJS Plugin Support

  Supports plugin syntax with "!"

  The plugin name is loaded as a module itself, and can override standard loader hooks
  for the plugin resource. See the plugin section of the systemjs readme.
*/
function plugins(loader) {
  var loaderNormalize = loader.normalize;
  loader.normalize = function(name, parentName, parentAddress) {
    // if parent is a plugin, normalize against the parent plugin argument only
    var parentPluginIndex;
    if (parentName && (parentPluginIndex = parentName.indexOf('!')) != -1)
      parentName = parentName.substr(0, parentPluginIndex);

    return Promise.resolve(loaderNormalize(name, parentName, parentAddress))
    .then(function(name) {
      // if this is a plugin, normalize the plugin name and the argument
      var pluginIndex = name.lastIndexOf('!');
      if (pluginIndex != -1) {
        var argumentName = name.substr(0, pluginIndex);

        // plugin name is part after "!" or the extension itself
        var pluginName = name.substr(pluginIndex + 1) || argumentName.substr(argumentName.lastIndexOf('.') + 1);

        // normalize the plugin name relative to the same parent
        return new Promise(function(resolve) {
          resolve(loader.normalize(pluginName, parentName, parentAddress)); 
        })
        // normalize the plugin argument
        .then(function(_pluginName) {
          pluginName = _pluginName;
          return loader.normalize(argumentName, parentName, parentAddress);
        })
        .then(function(argumentName) {
          return argumentName + '!' + pluginName;
        });
      }

      // standard normalization
      return name;
    });
  }

  var loaderLocate = loader.locate;
  loader.locate = function(load) {
    var name = load.name;

    // plugin
    var pluginIndex = name.lastIndexOf('!');
    if (pluginIndex != -1) {
      var pluginName = name.substr(pluginIndex + 1);

      // the name to locate is the plugin argument only
      load.name = name.substr(0, pluginIndex);

      // load the plugin module
      return loader.load(pluginName)
      .then(function() {
        var plugin = loader.get(pluginName);
        plugin = plugin['default'] || plugin;

        // store the plugin module itself on the metadata
        load.metadata.plugin = plugin;
        load.metadata.pluginName = pluginName;
        load.metadata.pluginArgument = load.name;

        // run plugin locate if given
        if (plugin.locate)
          return plugin.locate.call(loader, load);

        // otherwise use standard locate without '.js' extension adding
        else
          return new Promise(function(resolve) {
            resolve(loader.locate(load));
          })
          .then(function(address) {
            return address.substr(0, address.length - 3);
          });
      });
    }

    return loaderLocate.call(this, load);
  }

  var loaderFetch = loader.fetch;
  loader.fetch = function(load) {
    // support legacy plugins
    var self = this;
    if (typeof load.metadata.plugin == 'function') {
      return new Promise(function(fulfill, reject) {
        load.metadata.plugin(load.metadata.pluginArgument, load.address, function(url, callback, errback) {
          loaderFetch.call(self, { name: load.name, address: url, metadata: {} }).then(callback, errback);
        }, fulfill, reject);
      });
    }
    return (load.metadata.plugin && load.metadata.plugin.fetch || loaderFetch).call(this, load);
  }

  var loaderTranslate = loader.translate;
  loader.translate = function(load) {
    var plugin = load.metadata.plugin;
    if (plugin && plugin.translate)
      return plugin.translate.call(this, load);

    return loaderTranslate.call(this, load);
  }

}