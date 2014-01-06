/*
  SystemJS Plugin Support

  Supports plugin syntax with "!"

  The plugin name is loaded as a module itself, and can override standard loader hooks
  for the plugin resource. See the plugin section of the systemjs readme.
*/
(function() {
  var systemNormalize = System.normalize;
  System.normalize = function(name, parentName, parentAddress) {
    name = name.trim();

    // if parent is a plugin, normalize against the parent plugin argument only
    var parentPluginIndex;
    if (parentName && (parentPluginIndex = parentName.indexOf('!')) != -1)
      parentName = parentName.substr(0, parentPluginIndex);

    // if this is a plugin, normalize the plugin name and the argument
    var pluginIndex = name.lastIndexOf('!');
    if (pluginIndex != -1) {
      var argumentName = name.substr(0, pluginIndex);

      // plugin name is part after "!" or the extension itself
      var pluginName = name.substr(pluginIndex + 1) || argumentName.substr(argumentName.lastIndexOf('.') + 1);

      // normalize the plugin name
      return new Promise(function(resolve) {
        resolve(System.normalize(pluginName)); 
      })
      // normalize the plugin argument
      .then(function(_pluginName) {
        pluginName = _pluginName;
        return System.normalize(argumentName, parentName, parentAddress);
      })
      .then(function(argumentName) {
        return argumentName + '!' + pluginName;
      });
    }

    // standard normalization
    return systemNormalize.call(this, name, parentName, parentAddress);
  }

  var systemLocate = System.locate;
  System.locate = function(load) {
    var name = load.name;

    // plugin
    var pluginIndex = name.lastIndexOf('!');
    if (pluginIndex != -1) {
      var pluginName = name.substr(pluginIndex + 1);

      // the name to locate is the plugin argument only
      load.name = name.substr(0, pluginIndex);

      // load the plugin module
      return System.load(pluginName)
      .then(function() {
        var plugin = System.get(pluginName);
        plugin = plugin.default || plugin;

        // store the plugin module itself on the metadata
        load.metadata.plugin = plugin;
        load.metadata.pluginName = pluginName;

        // run plugin locate if given
        if (plugin.locate)
          return plugin.locate.call(System, load);

        // otherwise use standard locate without '.js' extension adding
        else
          return new Promise(function(resolve) {
            resolve(System.locate(load));
          })
          .then(function(address) {
            return address.substr(0, address.length - 3);
          });
      });
    }

    return systemLocate.call(this, load);
  }

  var systemFetch = System.fetch;
  System.fetch = function(load) {
    // support legacy plugins
    var self = this;
    if (typeof load.metadata.plugin == 'function') {
      return new Promise(function(fulfill, reject) {
        load.metadata.plugin(load.name, load.address, function(url, callback, errback) {
          systemFetch.call(self, { name: load.name, address: url, metadata: {} }).then(callback, errback);
        }, fulfill, reject);
      });
    }
    return (load.metadata.plugin && load.metadata.plugin.fetch || systemFetch).call(this, load);
  }

  var systemTranslate = System.translate;
  System.translate = function(load) {
    var plugin = load.metadata.plugin;
    if (plugin && plugin.translate)
      return plugin.translate.call(this, load);

    return systemTranslate.call(this, load);
  }

})();