jspm loader
===========

RequireJS-style ES6 dynamic module loader, with out-the-box registry and plugin support.

For the loader documentation read below. For a complete overview of features, see [https://jspm.io](https://jspm.io).

A ~20KB module loader written to work for ES6 modules, but that can load AMD, CommonJS and global scripts detecting the format automatically.

The loader itself is 10KB, and it is built on top of the 11KB [ES6-loader polyfill](https://github.com/ModuleLoader/es6-module-loader).

Uses RequireJS-inspired configuration options including baseURL, map, shim (dependency config) and custom paths.

Supported Plugins:

* CSS `jspm.import('my/file.css!')`
* Image `jspm.import('some/image.png!image')`
* JSON `jspm.import('some/data.json!')`
* Text `jspm.import('some/text.txt!text')`
* WebFont `jspm.import('#google Port Lligat Slab, Droid Sans !font')`

To submit or request a new plugin, create an issue or pull request on the [Plugin Repository](https://github.com/jspm/plugins).

Including
---

For use over the CDN, simply use:

```html
  <script src="https://jspm.io/loader.js"></script>
```

To use locally, include [`es6-module-loader.js`](https://github.com/ModuleLoader/es6-module-loader/blob/master/lib/es6-module-loader.js) and [`esprima-es6.min.js`](https://github.com/ModuleLoader/es6-module-loader/blob/master/dist/esprima-es6.min.js) from the [ES6-loader polyfill](https://github.com/ModuleLoader/es6-module-loader) in the same folder as `loader.js`.

Then include it with a `<script>` tag:

```html
  <script src="path/to/loader.js"></script>
```

The 60KB Esprima parser is dynamically included when loading an ES6 module format only.

Without the parser, the polyfill and loader are roughly 20KB combined and minified.

Usage
---

### Requiring

The loader is simply a custom ES6 module loader, and can be used as one:

```javascript
  jspm.import(['jquery', './some', './modules'], function($, some, modules) {
  });
```

By default modules with relative syntax (`./` or `../`) are loaded relative to the current page URL.

Modules without relative syntax (eg `jquery`) are loaded from the [JSPM Registry](https://github.com/jspm/registry).

### Setting the baseURL

Just like RequireJS, provide configuration by setting the `jspm` global variable before the script is loaded, or call the `jspm.config` function:

```javascript
  jspm.config({
    baseURL: 'http://www.mysite.com'
  });
  jspm.import('./test');
  //loads http://www.mysite.com/test.js
```

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

Global script dependencies can be set using the [dependency configuration](#dependency-configuration). The global variables declared by any dependencies will then be present on the global object.

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

Modules defined with ES6 syntax will be parsed with the Esprima harmony parser, which is downloaded as needed.

es6.js:
```javascript
  import { dep as d } from './some-dep';

  export var exportName = 'value';
```

### Map Configuration

```javascript
  jspm.config({
    map: {
      'jquery': './lib/jquery',
      'backbone': './lib/backbone#backbone'
    }
  });
  
  jspm.import('jquery');          // loads ./lib/jquery.js
  
  jspm.import('backbone');        // loads ./lib/backbone/backbone.js
  jspm.import('backbone/module'); // loads ./lib/backbone/module.js
```

Map configuration simply provides an alias to a module.

Optionally a main entry point can be specified with a `#` symbol. This works like the RequireJS package configuration, allowing the main module to be loaded directly by name while also supporting submodules as with `backbone` in the example above.

### Dependency Configuration

Dependency configuration allows dependencies to be specified for existing legacy scripts, mostly to ensure global script load ordering.

Example:

```javascript
  jspm.config({
    depends: {
      'bootstrap': ['jquery']
    }
  });
  
  // loads jquery first, even though bootstrap has no module syntax
  jspm.import('bootstrap'); 
```

### ondemand / paths

The `ondemand` functionality provides what are paths configuration in RequireJS, defined by the ES6 `System` loader spec.

```javascript
  jspm.ondemand({
    'jquery': 'http://code.jquery.com/jquery-1.10.1.min.js'
  });
```

This syntax is likely still subject to change due to the specification being unconfirmed here.

### Transpiler Plugins

Transpiler plugins are supported for loading templates or languages that compile to JavaScript.

These are different from RequireJS in that they are extension-based plugin names:

```javascript
  jspm.import('some/module.coffee!')
```

Where `some/module.coffee` is a CoffeeScript file.

The plugin name can also be specified if not identical to the extension:

```javascript
  jspm.import('some/module.cs!coffee');
```

The plugin itself is loaded from the resource name `plugin:[pluginname]`. This `plugin` location or plugin itself can be mapped with standard configurations:

```javascript
  jspm.config({
    map: {
      'plugin:coffee': 'my/coffee/plugin',
    },
    locations: {
      'plugin': 'my/custom/plugins/folder'
    }
  });
```

### Writing a Plugin

lib/plugins/coffee.js:
```javascript
  var CoffeeScript = require('./coffee-script');

  module.exports = function(name, url, fetch, callback, errback) {
    fetch(url, function(source) {
      callback(CoffeeScript.compile(source));
    }, errback);
  }
```

License
---

MIT

