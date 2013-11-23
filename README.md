jspm loader
===========

RequireJS-style ES6 dynamic module loader, built on top the [ES6-loader polyfill](https://github.com/ModuleLoader/es6-module-loader).

For the loader documentation read below. For a complete overview of features, see [https://jspm.io](https://jspm.io).

* ~10KB module loader built on top of the ~11KB polyfill.
* Loads ES6 modules, AMD, CommonJS and global scripts detecting the format automatically and efficiently.
* Uses RequireJS-inspired configuration options including baseURL, map, shim and custom paths.

Can be used as a stand-alone ES6 RequireJS-style module loader, but also comes with [jspm registry](https://github.com/jspm/registry) and CDN support out of the box optionally.

This allows loading say `jquery`, `npm:underscore@1.5` or `github:my/custom-repo/name` without any installation necessary.

Including
---

**CDN Version**

Include the following script in the page:

```html
  <script src="https://jspm.io/loader.js"></script>
```

**Locally Hosted**

Download [`es6-module-loader.js`](https://github.com/ModuleLoader/es6-module-loader/blob/master/dist/es6-module-loader.js) and [`traceur.js`](https://github.com/ModuleLoader/es6-module-loader/blob/master/dist/traceur.js) from the [ES6-loader polyfill](https://github.com/ModuleLoader/es6-module-loader) and locate them in the same folder as `loader.js` from this repo.

Then include `loader.js` with a script tag:

```html
  <script src="/path/to/loader.js"></script>
```

The [Traceur](https://github.com/google/traceur-compiler) parser is dynamically included when loading an ES6 module format only.

Without the parser, the polyfill and loader are roughly 20KB combined and minified.

Usage
---

### Requiring

The loader is simply a custom ES6 module loader, and can be used as one:

```javascript
  jspm.import(['jquery', './some', './modules'], function($, some, modules) {
  });
```

By default modules with relative syntax (`./` or `../`) are loaded relative to the current page URL (the default `baseURL`).

Modules without relative syntax (eg `jquery` above) are loaded from the registry URL.

### Setting the baseURL and registryURL

Just like RequireJS, provide configuration by setting the `jspm` global variable before the script is loaded, or call the `jspm.config` function:

```javascript
  jspm.config({
    baseURL: 'http://www.mysite.com'
  });
  jspm.import('./test');
  //loads http://www.mysite.com/test.js
```

The registry URL can also be customized with

```javascript
  jspm.config({
    registryURL: 'http://www.mysite.com/lib'
  });
  jspm.import('jquery');
  // loads http://www.mysite.com/lib/jquery.js
```

By default the registry URL is set to the [jspm CDN registry](https://github.com/jspm/registry).

### CDN Endpoints

By default, the following CDN endpoints are already provided:

```javascript
jspm.config({
  endpoints: {
    github: 'https://github.jspm.io',
    npm: 'https://npm.jspm.io',
    cdnjs: 'https://cdnjs.cloudflare.com/ajax/libs'
  }
});
```

To submit a new CDN endpoint, feel free to provide a pull request.

The Github and NPM automatically use SPDY push to provide module dependencies. The endpoints have the following URL format:

```
  https://npm.jspm.io/[module name]@[version]/[file path]
  https://github.jspm.io/[username]/[repo]@[version]/[file path]
```

Thus scripts can be loaded directly from NPM with:

```javascript
  jspm.import('npm:underscore@2.0');
```

Typically a minor version is specified only (eg @2.2), which will load the latest revision. This is the recommended way of loading a resource as it allows patches but not breaking changes in the dependency tree.

If no version is specified, the latest stable version is loaded. Otherwise a complete version or tagname can also be provided.

The CDN endpoints don't need to be used with the jspm loader, they can also be used with scripts, stylesheets or HTML imports in the page.

The benefits of having SPDY push dependencies mean that imported resources in styles, scripts and HTML imports don't require a separate round trip. Script dependencies are traced automatically and provided with this support.


### Loading Global Scripts

When loading a global script, any global variables declared are returned on the module object by the `import` function.

some-global.js:
```javascript
  window.globalVar = 'hello';
  this.anotherGlobal = 'world';
```

```javascript
  jspm.import(['./some-global'], function(someGlobal) {
    console.log(someGlobal.globalVar);
    console.log(someGlobal.anotherGlobal);
  });
```

Global script dependencies can be set using the [shim configuration](#shim-configuration). The global variables declared by any dependencies will then be present on the global object.

When setting global script dependencies, the globals are carefully stored and retrieved so that multiple versions of the same global name can be used by different global scripts (for example having multiple versions of jQuery).

### Loading CommonJS & AMD

When loading a script that contains `AMD` or `CommonJS` module syntax, the loader will detect these statements and treat any imports and exports accordingly.

amd.js:
```javascript
  define(['./some-dep'], function(dep) {
    return { property: 'object' };
  });
```

cjs.js:
```javascript
  var dep = require('./some-dep');

  exports.property = 'object';
```

```javascript
  jspm.import(['./cjs'], function(cjsModule) {
    // ...
  });
```

### AMD Compatibility

The goal is to support as much of the RequireJS test suite as possible.

To create the `requirejs` and `require` globals as AMD globals, simply include the following `<script>` tag immediately after the inclusion of the jspm loader:

```html
  <script>
    require = requirejs = jspm.require;
  </script>
```

This should replicate much RequireJS functionality, and more will be covered in future.

### Loading ES6

Modules defined with ES6 syntax will be parsed with the Traceur parser, which is downloaded as needed.

es6.js:
```javascript
  import { dep as d } from './some-dep';

  export var exportName = 'value';
```

### Map Configuration

Map configuration simply provides an alias to a module.

For example:

```javascript
  jspm.config({
    map: {
      'jquery': './lib/jquery',
      'backbone': './lib/backbone'
    }
  });
  
  jspm.import('jquery');          // loads [baseURL]/lib/jquery.js
  jspm.import('backbone/module'); // loads [baseURL]/lib/backbone/module.js
```

### Shim Configuration

Shim configuration allows dependencies to be specified for existing global legacy scripts, to ensure global script load ordering.

Example:

```javascript
  jspm.config({
    shim: {
      './lib/jquery': true,
      './lib/bootstrap/js/bootstrap': ['jquery']
    }
  });
  
  // loads jquery first, before loading bootstrap
  // ensures that jquery is executed as a global script, not as AMD
  jspm.import('bootstrap'); 
```

When a script is shimmed, it is treated as a global script only, and no AMD, CJS or ES6 processing is done. Setting the shim to `true` can be useful to ensure a script is treated as a global exporter.

This is mostly identical to the RequireJS shim configuration.

The global object defined by the library is detected automatically, but this can also be specified:

```javascript
  jspm.config({
    shim: {
      './lib/jquery': {
        exports: 'jQuery'
      },
      './lib/jquery-plugin': {
        imports: ['./lib/jquery']
        exports: 'jQuery.somePlugin'
      }
    }
  });
```

### Included Plugins

Supported Plugins:

* CSS `jspm.import('my/file.css!')`
* Image `jspm.import('some/image.png!image')`
* JSON `jspm.import('some/data.json!')`
* Text `jspm.import('some/text.txt!text')`
* WebFont `jspm.import('#google Port Lligat Slab, Droid Sans !font')`

By default, plugins are loaded from the [jspm registry](https://github.com/jspm/registry), as the name `!pluginName`.

To submit a plugin, create a pull request on the registry page.

### Cache Busting

When developing locally, you may want to automatically cache bust the local URLs.

For this, set the `urlArgs` configuration option:

```javascript
  jspm.config({
    urlArgs: '?bust=' + new Date().getTime()
  });

  jspm.import('./test');  // requests [baseURL]/test.js?bust=1383745775497
```

### ondemand / paths

The `ondemand` functionality provides what are paths configuration in RequireJS, defined by the ES6 `System` loader spec.

```javascript
  jspm.ondemand({
    'jquery': 'http://code.jquery.com/jquery-1.10.1.min.js'
  });
```

This syntax is likely still subject to change due to the specification being unconfirmed here.

### Endpoints

The endpoints configuration option allows for custom server paths:

```javascript
  jspm.config({
    baseURL: 'http://mysite.com/js'
    endpoints: {
      'lib': 'http://mysite.com/lib',
    }
  });

  jspm.import('lib:some-module');
```

Endpoints can also be configured to a module format, and a custom normalization function.

```javascript
  jspm.config({
    endpoints: {
      'node': {
        location: 'node-modules',
        normalize: function(name) {
          // auto add index.js as the main entry point
          if (name.split('/').length == 1)
            name = name + '/index';
          // allow .js extensions in require names
          if (name.substr(name.length - 3, 3) == '.js')
            name = name.substr(0, name.length - 3);
          return name;
        },
        format: 'cjs'
      }
    }
  });

  jspm.import('node:some-module') // loads [baseURL]/node-modules/some-module/index.js as commonJS
```

The benefit of specifying the module format for a location is that the script format detection scripts
can be skipped, saving on a little processing.

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

