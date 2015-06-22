/*
  SystemJS Loader Plugin Support

  Supports plugin loader syntax with "!", or via metadata.loader

  The plugin name is loaded as a module itself, and can override standard loader hooks
  for the plugin resource. See the plugin section of the systemjs readme.
*/
(function() {

  // sync or async plugin normalize function
  function normalizePlugin(normalize, name, parentName, sync) {
    var loader = this;
    // if parent is a plugin, normalize against the parent plugin argument only
    var parentPluginIndex;
    if (parentName && (parentPluginIndex = parentName.indexOf('!')) != -1)
      parentName = parentName.substr(0, parentPluginIndex);

    // if this is a plugin, normalize the plugin name and the argument
    var pluginIndex = name.lastIndexOf('!');
    if (pluginIndex != -1) {
      var argumentName = name.substr(0, pluginIndex);
      var pluginName = name.substr(pluginIndex + 1) || argumentName.substr(argumentName.lastIndexOf('.') + 1);

      // note if normalize will add a default js extension
      // if so, remove for backwards compat
      // this is strange and sucks, but will be deprecated
      var defaultExtension = loader.defaultJSExtensions && argumentName.substr(argumentName.length - 3, 3) != '.js';

      if (sync) {
        argumentName = loader.normalizeSync(argumentName, parentName);
        pluginName = loader.normalizeSync(pluginName, parentName);

        if (defaultExtension && argumentName.substr(argumentName.length - 3, 3) == '.js')
          argumentName = argumentName.substr(0, argumentName.length - 3);

        return argumentName + '!' + pluginName;
      }
      else {
        return Promise.all([
          loader.normalize(argumentName, parentName),
          loader.normalize(pluginName, parentName)
        ])
        .then(function(normalized) {
          argumentName = normalized[0];
          if (defaultExtension && argumentName.substr(argumentName.length - 3, 3) == '.js')
            argumentName = argumentName.substr(0, argumentName.length - 3);
          return argumentName + '!' + normalized[1];
        });
      }
    }
    else {
      return normalize.call(loader, name, parentName);
    }
  }

  // async plugin normalize
  hook('normalize', function(normalize) {
    return function(name, parentName) {
      return normalizePlugin.call(this, normalize, name, parentName, false);
    };
  });

  hook('normalizeSync', function(normalizeSync) {
    return function(name, parentName) {
      return normalizePlugin.call(this, normalizeSync, name, parentName, true);
    };
  });

  hook('locate', function(locate) {
    return function(load) {
      var loader = this;

      var name = load.name;

      // plugin syntax
      var pluginSyntaxIndex = name.lastIndexOf('!');
      if (pluginSyntaxIndex != -1) {
        load.metadata.loader = name.substr(pluginSyntaxIndex + 1);
        load.name = name.substr(0, pluginSyntaxIndex);
      }

      return locate.call(loader, load)
      .then(function(address) {
        var plugin = load.metadata.loader;

        if (!plugin)
          return address;

        // only fetch the plugin itself if this name isn't defined
        if (loader.defined && loader.defined[name])
          return address;

        var pluginLoader = loader.pluginLoader || loader;

        // load the plugin module and run standard locate
        return pluginLoader['import'](plugin)
        .then(function(loaderModule) {
          // store the plugin module itself on the metadata
          load.metadata.loaderModule = loaderModule;
          load.metadata.loaderArgument = name;

          load.address = address;
          if (loaderModule.locate)
            return loaderModule.locate.call(loader, load);

          return address;
        });
      });
    };
  });

  hook('fetch', function(fetch) {
    return function(load) {
      var loader = this;
      if (load.metadata.loaderModule && load.metadata.loaderModule.fetch) {
        load.metadata.scriptLoad = false;
        return load.metadata.loaderModule.fetch.call(loader, load, function(load) {
          return fetch.call(loader, load);
        });
      }
      else {
        return fetch.call(loader, load);
      }
    };
  });

  hook('translate', function(translate) {
    return function(load) {
      var loader = this;
      if (load.metadata.loaderModule && load.metadata.loaderModule.translate)
        return Promise.resolve(load.metadata.loaderModule.translate.call(loader, load)).then(function(result) {
          if (typeof result == 'string')
            load.source = result;
          return translate.call(loader, load);
        });
      else
        return translate.call(loader, load);
    };
  });

  hook('instantiate', function(instantiate) {
    return function(load) {
      var loader = this;
      if (load.metadata.loaderModule && load.metadata.loaderModule.instantiate)
        return Promise.resolve(load.metadata.loaderModule.instantiate.call(loader, load)).then(function(result) {
          load.metadata.format = 'defined';
          load.metadata.execute = function() {
            return result;
          };
          return instantiate.call(loader, load);
        });
      else
        return instantiate.call(loader, load);
    };
  });

})();
