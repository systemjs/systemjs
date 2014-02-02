SystemJS
===========

Extensions for the new ES6 System browser loader, which will be natively provided in browsers. _Note that parts of the specification are still being completed, so that this project is subject to change._

A small (10KB minfied) collection of extensions to the System loader, for supporting AMD, CommonJS and global script loading, aiming to ease the transition to ES6.

Extensions are self-contained additions to the `System` global, which can be applied individually (see [lib](https://github.com/guybedford/systemjs/tree/master/lib)) or all together ([dist/system.js](https://github.com/guybedford/systemjs/blob/master/dist/system.js)).

* **Formats:** Dynamically load AMD, CommonJS and global scripts (as well as ES6 modules) detecting the format automatically, or with format hints.
* **Map:** Map configuration.
* **Plugins:** A dynamic plugin system for modular loading rules.
* **Versions:** Multi-version support for semver compatible version ranges (`@^1.2.3` syntax).

Designed to work with the [ES6 Module Loader polyfill](https://github.com/ModuleLoader/es6-module-loader) (17KB minified) for a combined footprint of 27KB.

Runs in the browser and NodeJS.

Contents
---

1. [Getting Started](#getting-started)
2. [Working with Modules](#working-with-modules)
  * [Paths Configuration](#creating-path-rules)
  * [Loading ES6 Modules](#loading-es6-modules)
3. [SystemJS Features](#systemjs-features)
  * [Module Format Hints](#module-format-hints)
  * [Loading Global Scripts](#loading-global-scripts)
  * [AMD Compatibilty Layer](#amd-compatibility-layer)
  * [Map Config](#map-config)
  * [Plugins](#plugins)
  * [NodeJS Use](#nodejs-usage)
3. [Build Workflows](#build-workflows)
  * [Compiling ES6 to ES5 and AMD](#compiling-es6-to-es5-and-amd)
  * [Compiling into a single file](#building-amd-modules-into-a-single-file)
  * [AMD Named Define Production Support](#enabling-amd-production-support)
4. [Advanced Customization](#advanced-customization)

Getting Started
---

### Including the Loader

Download [`es6-module-loader.js`](https://github.com/ModuleLoader/es6-module-loader/blob/master/dist/es6-module-loader.js) and [`traceur.js`](https://github.com/ModuleLoader/es6-module-loader/blob/master/dist/traceur.js) from the [ES6-loader polyfill](https://github.com/ModuleLoader/es6-module-loader) and locate them in the same folder as `system.js` from this repo.

Then include `dist/system.js` with a script tag in the page:

```html
  <script src="system.js"></script>
```

`es6-module-loader.js` will then be included automatically and the [Traceur](https://github.com/google/traceur-compiler) parser is dynamically included from `traceur.js` when loading an ES6 module only.

### Write and Load a Module

app/test.js:
```javascript
  define(function() {
    return {
      isAMD: 'yup'
    };
  });
```

In the `index.html` page we can then load a module with:

```html
<script>
  System.import('app/test').then(function(test) {
    console.log(test.isAMD); // yup
  });
</script>
```
The module file at URL `app/test.js` will be loaded, its module format detected and any dependencies in turn loaded before returning the defined module.

The entire loading class is implemented identically to the ES6 module specification, with the module format detection rules being the only addition.

> _Note that when running locally, ensure you are running from a local server or a browser with local XHR requests enabled. If not you will get an error message._

> _For Chrome on Mac, you can run it with: `/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome --allow-file-access-from-files &> /dev/null &`_

> _In Firefox this requires navigating to `about:config`, entering `security.fileuri.strict_origin_policy` in the filter box and toggling the option to false._


Working with Modules
----

> Most of what is discussed in this section is simply the basics of using the new `System` loader. Only the extra module format support and plugin system is additional to this browser specification.

Modules are dependency-managed JavaScript files. They are loaded by a **module name** reference.

Each module name directly corresponds to a JavaScript file URL, but without the `.js` extension, and with some additional resolution rules.

The default resolution rule is:

<pre>
  my/module -> resolve(pageURL, 'my/module') + '.js'
</pre>

### Creating Path Rules

The `System` loader specification describes a paths configuration system.

_Note: The implementation is currently in discussion only and not yet specified, thus it is subject to change._

Typically one would like all modules to be loaded from a library folder containing different modules. We can set this up with:

```javascript
  System.paths['*'] = '/lib/*.js';
```

This is useful to reference shared library scripts like `jquery`, `underscore` etc.

We then create a path for our local application scripts in their own separate folder, which can also be set up with paths config:

```javascript
  System.paths['app/*'] = '/app/*.js';
```

Non-wildcard paths are also supported, and the most specific rule will always be used.

In this example, we can now write local application code in its own folder (`app`), without conflict with library code (`js`):

app/main.js:
```javascript
  define(['jquery'], function($) {
    return {
      // ...
    };
  });
```

index.html:
```html
  <script>
    System.paths['*'] = '/lib/*.js';
    System.paths['app/*'] = '/app/*.js'; 
  </script>
  <script>
    System.import('main');
  </script>
```

This will load `/app/main.js`, which in turn is only loaded after loading the dependency `/lib/jquery.js`.

### Writing Modular Code

For SystemJS it is recommended to write modular code in either AMD or CommonJS. Both are equally supported by SystemJS, with the format detected automatically.

For example, we can write modular CommonJS:

app/module.js:
```javascript
  var subModule = require('./submodule/submodule');
  //...
  subModule.someMethod();
  //...
```

app/submodule/submodule.js:
```javascript
  exports.someMethod = function() {

  }
```

and load this with `System.import('app/module')` in the page.

> Note: always use relative requires of the form `./` or `../` to reference modules in the same package. This is important within any package for modularity.

### Loading ES6 Modules

SystemJS is an ES6 module loader. It will detect and load ES6 modules, parsing them with Traceur dynamically. This allows for dynamic loading of ES6 without a build step, although a build step still needs to be run to transpile ES6 back to ES5 and AMD for production.

A very simple example:

app/es6-file.js:
```javascript
  export class q {
    constructor() {
      this.es6 = 'yay';
    }
  }
```

```html
  <script>
    System.import('es6-file').then(function(m) {
      console.log(new m.q().es6); // yay
    });
  </script>
```

ES6 modules define named exports, provided as getters on a special immutable `Module` object.

For the production build workflow, see the [compiling ES6 to ES5 and AMD](#compiling-es6-to-es5-and-amd).

For further examples of loading ES6 modules, see the [ES6 Module Loader polyfill documentation](https://github.com/ModuleLoader/es6-module-loader).

SystemJS Features
---

### Module Format Hints

The module format detection is well-tested over a large variety of libraries including complex UMD patterns. It will detect in order ES6, AMD, then CommonJS and fall back to global modules.

It is still impossible to write 100% accurate detection though.

For this reason, it is also possible to write modules with the module format specified. The module format is provided as a string, as the first line of code (excluding comments) in a file:

```javascript
"amd";
define(['some-dep'], function() {
  return {};
});
```

Similarly, `"global"`, `"cjs"` and `"es6"` can be used in module files to set the detection.

It is recommended to use a format hint only in the few cases where the format detection would otherwise fail.

### Loading Global Scripts

#### Automatic Global Detection

When no module format is detected, or when the `"global"` hint is present, modules are treated as global scripts.

Any properties written to the global object (`window`, `this`, or the outer scope) will be detected and stored. Then any dependencies of the global will have these properties rewritten before execution.

In this way, global collissions are avoided. Multiple versions of jQuery can run on the same page, for example.

When only one new property is added to the global object, that is taken to be the global module.

When many properties are written to the global object, the collection of those properties becomes the global module.

This provides loading as expected in the majority of cases:

app/sample-global.js:
```javascript
  hello = 'world';
```

```javascript
  System.import('app/sample-global').then(function(sampleGlobal) {
    console.log(sampleGlobal); // 'world'
  });
```

#### Specifying the Global Export Name

The automatic detection handles most cases, but there are still scenarios where it is necessary to define the exported global name.

To specify the exported name, provide an `"export"` string, directly beneath the `"global"` hint.

app/my-global.js:
```javascript
  "global";
  "export MyGlobal.obj";

  window.MyGlobal = {
    obj: "hello world"
  };

  window.__some__other_global = true;
```

```javascript
  System.import('app/my-global').then(function(m) {
    console.log(m); // 'hello world'
  });
```

#### Specifying Global Imports

Global modules can also specify dependencies using this same hint system.

We write an `"import"` string, directly beneath the `"global"` hint.

js/jquery-plugin.js:
```javascript
  "global";
  "import jquery";
  "export $";

  $.fn.myPlugin = function() {
    // ...
  }
```

```javascript
  System.import('jquery-plugin').then(function($) {
    $('#some-el').myPlugin();
  });
```

The primary use for having all this information in the module is that global scripts can be converted into modular scripts with complete accuracy by an automated process based on simple configuration instead of manual conversion.

This information can equally be provided through configuration with `System.shim[module/name] = { deps: [], exports: '' }`, but it is recommended to inline it within the file for stronger modularity.

### AMD Compatibility Layer

As part of providing AMD support, SystemJS provides a small AMD compatibility layer, with the goal of supporting as much of the RequireJS test suite as possible to ensure functioning of existing AMD code.

To create the `requirejs` and `require` globals as AMD globals, simply include the following `<script>` tag immediately after the inclusion of the System loader:

```html
  <script>
    require = requirejs = System.require;
  </script>
```

This should replicate a fair amount of the dynamic RequireJS functionality, and support is improving over time.

_Note that AMD-style plugins are not yet supported._

### Map Config

Map configuration alters the module name at the normalization stage. It is useful for creating aliases and version mappings.

Example:

```javascript
  System.map['jquery'] = 'app/jquery@1.8.3';

  System.import('jquery') // behaves identical to System.import('app/jquery@1.8.2')
```

Map configuration also affects submodules:

```javascript
  System.import('jquery/submodule') // normalizes to -> `app/jquery@1.82/submodule'
```

### Plugins

Plugins handle alternative loading scenarios, including loading assets such as CSS or images, and providing custom transpilation scenarios.

Plugins are indicated by `!` syntax, which unlike RequireJS is appended at the end of the module name, not the beginning.

The plugin name is just a module name itself, and if not specified, is assumed to be the extension name of the module.

Supported Plugins:

* [CSS](https://github.com/jspm/plugin-css) `System.import('my/file.css!')`
* [Image](https://github.com/jspm/plugin-image) `System.import('some/image.png!image')`
* [JSON](https://github.com/jspm/plugin-json) `System.import('some/data.json!').then(function(json){})`
* [Markdown](https://github.com/jspm/plugin-md) `System.import('app/some/project/README.md!').then(function(html) {})`
* [Text](https://github.com/jspm/plugin-text) `System.import('some/text.txt!text').then(function(text) {})`
* [WebFont](https://github.com/jspm/plugin-font) `System.import('google Port Lligat Slab, Droid Sans !font')`

Links will be provided soon!

Note that the AMD compatibility layer could provide a mapping from AMD plugins into SystemJS plugins that provide the same functionality as associated SystemJS plugins.

### NodeJS Usage

To load modules in NodeJS, install SystemJS with:

```
  npm install systemjs
```

We can then load modules equivalently to in the browser:

```javascript
var System = require('systemjs');

// loads './app.js' from the current directory
System.import('./app').then(function(m) {
  console.log(m);
}, function(e) {
  console.log(e);
});
```

Build Workflows
-----

### Compiling ES6 to ES5 and AMD

If writing an application in ES6, we can compile back into AMD and ES5 by installing Traceur globally and using the command-line tool:

Install Traceur:

```
  npm install traceur -g
```

Build the application into AMD and ES5:

```
  traceur --dir app app-built --modules=amd
```

This will compile all ES6 files in the directory `app` into corresponding AMD files in `app-built`.

In our application HTML, we now need to include [`traceur-runtime.js`](https://github.com/ModuleLoader/es6-module-loader/blob/master/dist/traceur-runtime.js) before es6-module-loader.js:

```html
  <script src="traceur-runtime.js"></script>
  <script src="es6-module-loader.js"></script>
```

Now the application will continue to behave identically without needing to compile ES6 in the browser.

The next step for production is to then compile all of these separate AMD files into a single file for production, described below.


### Building AMD modules into a single file

#### Using the r.js Optimizer

To build separate AMD modules into a single file, we can use the [RequireJS optimizer](https://github.com/jrburke/r.js):

Install the optimzer:

```
  npm install requirejs -g
```

Build modules into a single file (assuming the main entry point is `app-built/main`):

```
  r.js -o name=app-built/main out=app-built.js paths.app=app-built
```

_If not compiling from ES6, replace `app-built` with `app`, and the last argument setting `paths.app` is not necessary._

This will build all dependencies of `app-built/main` into a single file, `app-built.js` located in the same folder as the `app` folder.

#### Enabling AMD Production Support

SystemJS comes with a separate build for AMD production only. This is fully CSP-compatible using script tag injection to load scripts, while still remaining an
extension of the ES6 Module Loader.

Replace the `system.js` file with `dist/system-production.js`.

We then also add configuration so SystemJS knows to load `app-built` instead of `app/main`:

```html
  <script src="system-production.js"></script>
  <script>
    System.bundles['app-built'] = ['app/main'];
    System.import('app/main').then(function(m) { 
      //... 
    });
  </script>
```

The `bundles` configuration tells the loader that when getting a load to `app/main`, it should load the `app-built` bundle first to get that module.

Additional modules that may be primary endpoints can also be added to the list.

_Note that this build workflow doesn't fully support plugins, CommonJS or global script loading. A build workflow specific to the ES6 Module Loader is needed in these scenarios, which
is currently under development._

Advanced Customization
------

### Custom Loader Addons

SystemJS is simply a build of a collection of separate addons. Different build collections can be customized for different loading scenarios in the Makefile.

Alternatively individual addons can also just be applied individually copying them from the [lib folder](https://github.com/guybedford/systemjs/tree/master/lib).

To understand the loader hooks, read the [custom loader section of the ES6 Module Loader readme](https://github.com/ModuleLoader/es6-module-loader#creating-a-custom-loader).

### Custom Format Support

The order in which module format detection is performed, is provided by the `System.formats`. The default value is `['amd', 'cjs', 'global']`.

To add a new module format, specify it in the `System.formats` array, and then provide a `System.format` rule for it.

The format rule provides two functions - detection which returns dependencies if detection passes, and an execution function.

```javascript
  System.formats = ['amd', 'cjs', 'myformat', 'global'];

  System.format.myformat = {
    detect: function(source, load) {
      if (!source.match(formatRegEx))
        return false;

      // return the array of dependencies
      return getDeps(source);
    },
    execute: function(load, depMap, global, execute) {
      // provide any globals
      global.myFormatGlobal = function(dep) {
        return depMap[dep];
      }

      // alter the source before execution
      load.source = '(function() {' + load.source + '}();';

      // execute source code
      execute();

      // clean up any globals
      delete global.myFormatGlobal;

      // return the defined module object
      return global.module;
    }
  }
```

For further examples, see the internal AMD or CommonJS support implemented in this way here.

### Creating a Plugin

A plugin is just a set of overrides for the loader hooks of the ES6 module specification.

The hooks plugins can override are `locate`, `fetch` and `translate`.

Read more on the loader hooks at the [ES6 Module Loader polyfill page](https://github.com/ModuleLoader/es6-module-loader#creating-a-custom-loader).

#### Sample CoffeeScript Plugin

For example, we can write a CoffeeScript plugin with the following (CommonJS as an example, any module format works fine):

js/coffee.js:
```javascript
  var CoffeeScript = require('coffeescript');

  exports.translate = function(load) {
    return CoffeeScript.compile(load.source);
  }
```

By overriding the `translate` hook, we now support CoffeeScript loading with:

```
 - js/
   - coffee.js             our plugin above
   - coffeescript.js       the CoffeeScript compiler
 - app/
   - main.coffee
```

Then assuming we have a `app` [path config](#Paths Configuration) set to the `/app` folder, and the baseURL set to `/js/`, we can write:

```javascript
  System.import('app/main.coffee!').then(function(main) {
    // main is now loaded from CoffeeScript
  });
```

#### Sample CSS Plugin

A CSS plugin, on the other hand, would override the fetch hook:

js/css.js:
```javascript
  exports.fetch = function(load) {
    // return a thenable for fetching (as per specification)
    // alternatively return new Promise(function(resolve, reject) { ... })
    return {
      then: function(resolve, reject) {
        var cssFile = load.address;

        var link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = cssFile;
        link.onload = resolve;

        document.head.appendChild(link);
      }
    };
  }
```

Each loader hook can either return directly or return a thenable for the value.

The other loader hooks are also treated identically to the specification.


License
---

MIT

