/*
  SystemJS Plugin Support

  Supports plugin syntax with "!"

  The plugin name is loaded as a module itself, and can override standard loader hooks
  for the plugin resource. See the plugin section of the systemjs readme.
*/
(function() {
  hook('normalize', function(normalize) {
    return function(name, parentName, parentAddress) {
      var loader = this;
      // if parent is a plugin, normalize against the parent plugin argument only
      var parentPluginIndex;
      if (parentName && (parentPluginIndex = parentName.indexOf('!')) != -1)
        parentName = parentName.substr(0, parentPluginIndex);

      return Promise.resolve(normalize.call(loader, name, parentName, parentAddress))
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
    };
  });

  hook('locate', function(locate) {
    return function(load) {
      var loader = this;

      var name = load.name;

      // only fetch the plugin itself if this name isn't defined
      if (this.defined && this.defined[name])
        return locate.call(this, load);

      // plugin
      var pluginIndex = name.lastIndexOf('!');
      if (pluginIndex != -1) {
        var pluginName = name.substr(pluginIndex + 1);

        // the name to locate is the plugin argument only
        load.name = name.substr(0, pluginIndex);

        var pluginLoader = loader.pluginLoader || loader;

        // load the plugin module
        // NB ideally should use pluginLoader.load for normalized,
        //    but not currently working for some reason
        return pluginLoader['import'](pluginName)
        .then(function() {
          var plugin = pluginLoader.get(pluginName);
          plugin = plugin['default'] || plugin;

          // store the plugin module itself on the metadata
          load.metadata.plugin = plugin;
          load.metadata.pluginName = pluginName;
          load.metadata.pluginArgument = load.name;

          // run plugin locate if given
          if (plugin.locate)
            return plugin.locate.call(loader, load);
          else
            return loader.locate(load);
        });
      }

      return locate.call(this, load);
    };
  });

  hook('fetch', function(fetch) {
    return function(load) {
      var loader = this;
      if (load.metadata.plugin && load.metadata.plugin.fetch && !load.metadata.pluginFetchCalled) {
        load.metadata.pluginFetchCalled = true;
        return load.metadata.plugin.fetch.call(loader, load, fetch);
      }
      else
        return fetch.call(loader, load);
    };
  });

  hook('translate', function(translate) {
    return function(load) {
      var loader = this;
      if (load.metadata.plugin && load.metadata.plugin.translate)
        return Promise.resolve(load.metadata.plugin.translate.call(loader, load)).then(function(result) {
          if (typeof result == 'string')
            load.source = result;
          return translate.call(loader, load);
        });
      else
        return translate.call(loader, load);
    }
  });

  hook('instantiate', function(instantiate) {
    return function(load) {
      var loader = this;
      if (load.metadata.plugin && load.metadata.plugin.instantiate)
        return Promise.resolve(load.metadata.plugin.instantiate.call(loader, load)).then(function(result) {
          load.metadata.format = 'defined';
          load.metadata.execute = function() {
            return result;
          };
          return instantiate.call(loader, load);
        });
      else
        return instantiate.call(loader, load);
    }
  });

})();
