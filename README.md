jspm loader
===========

Next-generation module loading in all browsers today.

* Loads ES6 modules, AMD, CommonJS and global scripts detecting the format automatically.
* Optionally load modules directly from GitHub or npm with [jspm registry](https://github.com/jspm/registry) and CDN support out of the box.
* Uses RequireJS-inspired configuration options including baseURL, map, shim and custom paths.
* Built on top of the standards-compliant [ES6 Module Loader polyfill](https://github.com/ModuleLoader/es6-module-loader).
* ~25KB total size minified, ~15KB for loader.js and ~11KB for es6-module-loader.js.

For the loader documentation and getting started guide, read below. 

For a basic introduction and explanation with examples, see [https://jspm.io](https://jspm.io).

Getting Started
---

1. [Including the Loader](#including-the-loader)
2. [Setting the Configuration](#setting-the-configuration)
3. [Loading Application Code from the baseURL](#loading-application-code-from-the-baseurl)
4. [Loading External Packages from Endpoints](#loading-external-packages-from-endpoints)
5. [Map Configuration](#map-configuration)
6. [Loading External Packages from the jspm Registry](#loading-external-packages-from-the-jspm-registry)
7. [Installing Packages Locally](#installing-packages-locally)
8. [Package Configuration](#package-configuration)
9. [Cache Busting](#cache-busting)
10. [Plugins](#plugins)

### Including the Loader

The loader can be included from the CDN or locally. The CDN version can be useful for quick experimentation and is also suitable for production use.

#### CDN Version

Include the following script in the page:

```html
  <script src="https://jspm.io/loader.js"></script>
```

#### Locally Hosted

Download [`es6-module-loader.js`](https://github.com/ModuleLoader/es6-module-loader/blob/master/dist/es6-module-loader.js) and [`traceur.js`](https://github.com/ModuleLoader/es6-module-loader/blob/master/dist/traceur.js) from the [ES6-loader polyfill](https://github.com/ModuleLoader/es6-module-loader) and locate them in the same folder as `loader.js` from this repo.

Then include `loader.js` with a script tag:

```html
  <script src="loader.js"></script>
```

`es6-module-loader.js` will then be included automatically and the [Traceur](https://github.com/google/traceur-compiler) parser is dynamically included from `traceur.js` when loading an ES6 module only.

### Setting the Configuration

Typically one would include a configuration file immediately after the loader script, although this can be done inline as well.

```html
  <script src="config.js"></script>
```

config.js:
```javascript
  jspm.config({
    baseURL: '/lib'
  });
```

The `baseURL` sets the folder where local scripts will be loaded. By default it is set to the HTML page URL.

### Loading Application Code from the baseURL

Modules are dependency-managed JavaScript files. They are loaded by a **module name** reference.

Each module name directly corresponds to a JavaScript file URL, but without the `.js` extension, and with baseURL rules.

For example, modules can be loaded from the baseURL with the syntax `~`:

<pre>
  ~/my/module -> [baseURL]/my/module.js
</pre>

In the `index.html` page we can then load a module from the baseURL folder with:

```html
<script>
  // loads [baseURL]/test.js returning the defined module object.
  jspm.import('~/test', function(test) {
    console.log(test);
  });
</script>
```

Since we set the baseURL to `/lib`, we can write:

lib/test.js:
```javascript
  define(function() {
    return {
      isAMD: 'yup'
    };
  });
```

> _Note that when running locally, ensure you are running from a local server or a browser with local XHR requests enabled. If not you will get an error message._

> _For Chrome on Mac, you can run it with: `/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome --allow-file-access-from-files &> /dev/null &`_

> _In Firefox this requires navigating to `about:config`, entering `security.fileuri.strict_origin_policy` in the filter box and toggling the option to false._

#### Writing Modular Code

It is recommended to write modular code in either AMD or CommonJS. Both are equally supported by jspm, with the format detected automatically.

For example, we can write modular CommonJS:

/lib/app.js:
```javascript
  var subModule = require('./submodule/submodule');
  //...
  subModule.someMethod();
  //...
```

/lib/submodule/submodule.js:
```javascript
  exports.someMethod = function() {

  }
```

and load this with `jspm.import('~/app')` in the page.

> Note: always use relative requires of the form `./` or `../` to reference modules in the same package. This is important within any package for modularity.

#### AMD Compatibility

jspm provides an AMD compatibility layer, with the goal of supporting as much of the RequireJS test suite as possible to ensure functioning of existing AMD code.

To create the `requirejs` and `require` globals as AMD globals, simply include the following `<script>` tag immediately after the inclusion of the jspm loader:

```html
  <script>
    require = requirejs = jspm.require;
  </script>
```

This should replicate a fair amount of RequireJS functionality, and support is improving over time.

Note that AMD-style plugins are not supported.

#### Loading ES6 Modules

jspm is an ES6 module loader. It will detect and load ES6 modules, parsing them with Traceur dynamically. This allows for dynamic loading of ES6 without a build step, although a build step still needs to be run to transpile ES6 back to ES5 and AMD for production.

The CDN and CLI provide support for converting ES6 modules into ES5 with AMD. Simply add the following to the package.json:

```javascript
{
  "buildConfig": {
    "traceur": true,
    "uglify": true
  }
}
```

Then either run a CLI build with `jspm build`, or upload the package to the CDN to have the build done there.

The CLI build configuration is explained further at the [project page](https://github.com/jspm/jspm-cli#building-application-code), there is also a [sample repo demonstrating the ES6 build here](https://github.com/jspm/demo-es6).

Read more about ES6 modules and module loaders at the [ES6 Module Loader polyfill repo](https://github.com/ModuleLoader/es6-module-loader).

#### Loading Globals

Global scripts can also be loaded with jspm, and any globals they write to the `window` object will be converted into a special separate module object for the global.

This provides careful protection against global collisions, allowing global scripts to write to the same global variables without conflict.

Most global scripts will still need some [shim configuration](#shim-configuration) as in RequireJS to set their dependencies.

### Loading External Packages from Endpoints

Endpoints provide collections of packages that can be downloaded or served over CDN.

Currently the following endpoints are supported:

* GitHub: `jspm.import('github:name/repo@version')`
* npm: `jspm.import('npm:repo@version')`
* cdnJS: `jspm.import('cdnjs:name/version')`

Use of these endpoints is entirely optional, and custom endpoints can easily be created or overrided in the loader.

GitHub and npm both have endpoint services provided by jspm, allowing easy access to their modules.

The following will work without any installation necessary:

```javascript
  // load the latest stable version of underscore from npm
  jspm.import('npm:lodash-node/modern/objects/isEqual', function($) {
  });

  // load the latest stable version of Bootstrap, from the 'js' folder in the Bootstrap release on GitHub
  jspm.import('github:twbs/bootstrap/js/bootstrap', function(bootstrap) {
  });

  // load the latest minor version of jquery from GitHub
  jspm.import('github:components/jquery@2.0/jquery', function($) {
  });
```

In the above examples, the following module names are converted directly into the following URLs:

<pre>
  npm:lodash-node/modern/objects/isEqual -> https://npm.jspm.io/lodash-node/modern/objects/isEqual.js
  github:twbs/bootstrap/js/bootstrap     -> https://github.jspm.io/twbs/bootstrap/js/bootstrap.js
  github:components/jquery@2.0/jquery    -> https://github.jspm.io/components/jquery@2.0/jquery.js
</pre>

The endpoint servers then provide the correct modular code from the package and version specified.

The CDN runs over SPDY so that all requests can travel over a single connection, and SPDY push is used to send module dependencies so that a new round trip is not needed everytime a dependency of a module is discovered.

To create a custom endpoint, use the configuration:

```javascript
  jspm.config({
    endpoints: {
      myendpoint: 'https://some-url.com'
    }
  });
  // now jspm.import('myendpoint:hello') -> https://some-url.com/hello.js
```

> Endpoints are independent CDNs. Other examples of services that would be appropriate for endpoints include Bitbucket, Google Code, etc. 
  The NodeJS server running the npm and GitHub CDNs will be open sourced when ready to allow anyone to host a custom service endpoint, 
  as well as a mirror of the GitHub or npm endpoints. For more information about endpoints, [read the wiki here](https://github.com/jspm/registry/wiki/Endpoint-Conventions).

### Map Configuration

Instead of writing `github:components/jquery@2.0`, typically one would write `jquery` in all local application code.

We then _map_ `jquery -> github:components/jquery@2.0` with global map config for our application.

```javascript
  jspm.config({
    baseURL: '/lib',
    map: {
      jquery: 'github:components/jquery@2.0'
    }
  });
```

This means that any import/require for `jquery` in any module will now get the exact jQuery version we want.

This is far better than specifying the full endpoint directly as it makes it very easy to update jQuery to a new version or endpoint. This is the most important configuration option for dependency-managed packages.

### Loading External Packages from the jspm Registry

It can be difficult to know exactly what the most maintained endpoint is for a specific package and remember this endpoint each time.

Instead of needing to know `github:twbs/bootstrap` is the maintained package endpoint for Bootstrap, the jspm registry provides a simple service to remember the main endpoint for a package.

We simply write:

```javascript
  jspm.import('bootstrap');
```

And if no other map configuration applies, the loader will convert this into the URL:

<pre>
  bootstrap -> https://registry.jspm.io/bootstrap.js
</pre>

This module simply forwards to the correct location at `github:twbs/bootstrap`.

Use of the [jspm registry](https://github.com/jspm/registry) is also entirely optional. The `registryURL` can also be changed to be a local folder or another URL with the configuration:

```javascript
  jspm.config({
    registryURL: '/public-libs'
  });
```

> The registry is still growing, and a list of the modules currently in the registry can be [found here](https://github.com/jspm/registry/blob/master/registry.json). Additions can be made with pull requests, or requested as issues.

#### Setting Package Sources and Versions

The jspm registry, GitHub and npm endpoints use simple version conventions to provide version-managed packages.

When no version is specified, the latest stable version is used.

Otherwise an `@` sign can be used to indicate a version.

Examples:

**Latest Stable Version**

```javascript
  jspm.import('jquery');
  jspm.import('npm:underscore');
```

**Latest Revision of Minor Version**

```javascript
  jspm.import('jquery@2.0');
  jspm.import('bootstrap@3.0');
```

**Exact Version**

This supports both version names and semvers:

```javascript
  jspm.import('jquery@2.1.0-beta2');
  jspm.import('bootstrap@3.0.1');
```

Generally it is advised to write import/requires without any version or endpoint specified, and then use the package map configuration to set the endpoint and minor version.

This provides the most flexibility.

For example, in config.js:

```javascript
jspm.config({
  baseURL: '/lib',
    map: {
      'jquery': 'jquery@2.1',
      'bootstrap': 'github:twbs/bootstrap@3.0',
      'underscore': 'npm:underscore@1.5'
    }
  }
});
```

### Installing Packages Locally

While the CDN endpoints make it very convenient to create and load modules without the friction of installation, it is easy to switch to installing packages locally at any time.

With the [jspm CLI](https://github.com/jspm/jspm-cli), any endpoint package or registry package can be directly installed:

```
  jspm install jquery bootstrap underscore
```

The CLI will then update the `config.js` configuration file, as well as the `package.json` and all packages will then be loaded locally from the same server.

To get started with the CLI, [follow the guide at the jspm CLI page](https://github.com/jspm/jspm-cli).

### Package Configuration

All other configuration in jspm is package-specific to ensure complete configuration modularity.

**Package configuration is injected automatically from the package.json file by both the CDN and the [jspm CLI](https://github.com/jspm/jspm-cli) when installing packages locally.**

This configuration allows for easy usage of external packages without having to manually set up complex configuration.

The package-specific configuration options set the _main entry point_, _module format_, _map_ and _shim_.

For example, here is the package configuration that is injected when downloading Bootstrap:

```javascript
  jspm.config({
    packages: {
      'github:twbs/bootstrap@3.0.1': {
        main: 'js/bootstrap',
        format: 'global',
        shim: {
          'js/bootstrap': ['jquery']
        }
      }
    }
  });
```

Map configuration can also be set at the package level, allowing for dependency version support and avoiding name conflicts in dependencies.

[Read more about configuring external packages for jspm here.](https://github.com/jspm/registry/wiki/Configuring-Packages-for-jspm).

#### Main Entry Point

This sets the _main entry point_ for the package. When the package is requested directly by name, eg:

```javascript
  jspm.import('bootstrap')
```

this will then load `js/bootstrap.js`, as if we had written:

```javascript
  jspm.import('bootstrap/js/bootstrap')
```

#### Format

jspm automatically detects the module format of files using regular expression detection techniques, but this comes with processing cost and perhaps the detected format may not be the format intended.

Setting the `format` property for a package will disable any detection and ensure that the module files are treated accordingly.

The options for format are:
* `es6`
* `amd`
* `cjs`
* `global`

#### Map Configuration

Map configuration set within a package will only apply to dependencies of that package.

This is useful when two packages may refer to the same module name, but expect different underlying versions or implementations.

#### Shim Configuration

Shim configuration allows dependencies for global scripts to be enforced, just like RequireJS.

In the example,
```
  jspm.import('bootstrap/js/bootstrap')
```

will load Bootstrap only after loading jQuery.

More advanced shim configuration can also be set, allowing the exporter to be defined as well:

```javascript
  jspm.config({
    packages: {
      'github:components/jquery@2.0.3': {
        shim: {
          'lib/jquery': {
            exports: 'jQuery'
          }
        }
      },
      'github:some/jquery-plugin@1.1.1': {
        shim: {
          imports: ['./jquery'],
          exports: 'jQuery.somePlugin'
        }
      }
  });
```

### Cache Busting

When developing locally, you may want to automatically cache bust the local URLs.

For this, set the `urlArgs` configuration option:

```javascript
  jspm.config({
    urlArgs: '?bust=' + new Date().getTime()
  });

  jspm.import('./test');  // requests [baseURL]/test.js?bust=1383745775497
```

### Plugins

Supported Plugins:

* CSS `jspm.import('my/file.css!')`
* Image `jspm.import('some/image.png!image')`
* JSON `jspm.import('some/data.json!')`
* Text `jspm.import('some/text.txt!text')`
* WebFont `jspm.import('#google Port Lligat Slab, Droid Sans !font')`

The name of the plugin is by default the file extension before the `!`, or the name can be provided after with `!pluginName` when the plugin name is not the same as the resource extension name.

By default, plugins are loaded from the [jspm registry](https://github.com/jspm/registry), as the exact plugin name.

To submit a plugin, create a pull request on the registry page.

### Custom Plugins

Custom transpiler plugins allow for loading templates or languages that compile to JavaScript.

These are different from RequireJS in that they are extension-based plugin names:

```javascript
  jspm.import('some/module.coffee!')
```

Where `some/module.coffee` is a CoffeeScript file.

The plugin name can also be specified if not identical to the extension:

```javascript
  jspm.import('some/module.cs!coffee');
```

The plugin itself is loaded from the resource name `[pluginname]`. This name itself can be mapped with standard configuration:

```javascript
  jspm.config({
    map: {
      'coffee': 'my/custom/coffee/plugin',
    }
  });
```

Otherwise, plugins are loaded from the registry.

### Writing a Plugin

[baseURL]/my/custom/coffee/plugin.js:
```javascript
  var CoffeeScript = require('./coffee-script');

  module.exports = function(name, url, fetch, callback, errback) {
    fetch(url, function(source) {
      callback(CoffeeScript.compile(source));
    }, errback);
  }
```

Note the plugin here is written as CommonJS for an example only - any module format will work.

License
---

MIT

