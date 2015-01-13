SystemJS
========

[![Gitter](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/systemjs/systemjs?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

Universal dynamic module loader - loads ES6 modules, AMD, CommonJS and global scripts in the browser and NodeJS.

Designed as a collection of extensions to the [ES6 module loader](https://github.com/ModuleLoader/es6-module-loader) which can also be applied individually.

* [Loads any module format](https://github.com/systemjs/systemjs/wiki/Module-Format-Support) with [exact circular reference and binding support](https://github.com/ModuleLoader/es6-module-loader/wiki/Circular-References-&-Bindings).
* Loads [ES6 modules compiled into the `System.register` bundle format for production](https://github.com/systemjs/systemjs/wiki/Production-Workflows), maintaining circular references support.
* Supports RequireJS-style [map](https://github.com/systemjs/systemjs/wiki/Map-Configuration), [paths](https://github.com/ModuleLoader/es6-module-loader/wiki/Configuring-the-Loader#paths-implementation), [bundles](https://github.com/systemjs/systemjs/wiki/Production-Workflows#bundle-extension) and [global shims](https://github.com/systemjs/systemjs/wiki/Module-Format-Support#globals-global).
* [Loader plugins](#plugins) allow loading assets through the module naming system such as CSS, JSON or images.

Designed to work with the [ES6 Module Loader polyfill](https://github.com/ModuleLoader/es6-module-loader) (9KB) for a combined total footprint of 16KB minified and gzipped.

Runs in IE8+ and NodeJS.

For discussion, [see the Google Group](https://groups.google.com/group/systemjs).

Documentation
---

* [Loader Configuration](https://github.com/ModuleLoader/es6-module-loader/wiki/Configuring-the-Loader)
* [Map Configuration](https://github.com/systemjs/systemjs/wiki/Map-Configuration)
* [Meta Configuration](https://github.com/systemjs/systemjs/wiki/Meta-Configuration)
* [Module Format Support](https://github.com/systemjs/systemjs/wiki/Module-Format-Support)
* [Relative Dynamic Loading](https://github.com/systemjs/systemjs/wiki/Relative-Dynamic-Loading)
* [Versions Extension](https://github.com/systemjs/systemjs/wiki/Versions-Extension)
* [Production Workflows](https://github.com/systemjs/systemjs/wiki/Production-Workflows)
* [Creating Plugins](https://github.com/systemjs/systemjs/wiki/Creating-a-Plugin)
* [Creating a Custom Module Format](https://github.com/systemjs/systemjs/wiki/Creating-a-Custom-Format-Extension)

Getting Started
---

### Setup

Download [`es6-module-loader.js`](https://github.com/ModuleLoader/es6-module-loader/blob/v0.11.0/dist/es6-module-loader.js) and [`traceur.js`](https://raw.githubusercontent.com/jmcriffey/bower-traceur/0.0.79/traceur.js) and locate them in the same folder as `system.js` from this repo.

We then include `dist/system.js` with a script tag in the page.

`es6-module-loader.js` will then be included from the same folder automatically and [Traceur](https://github.com/google/traceur-compiler) is dynamically included from `traceur.js` when loading an ES6 module only.

Alternatively, `es6-module-loader.js` or `traceur.js` can be included before `system.js` with a script tag in the page.

### Simple Application Structure

The standard application structure would be something like the following:

index.html:
```html
<script src="system.js"></script>
<script>
  // Identical to writing System.baseURL = ...
  System.config({

    // set all requires to "lib" for library code
    baseURL: '/lib/',
    
    // set "app" as an exception for our application code
    paths: {
      'app/*': '/app/*.js'
    }
  });

  System.import('app/app')
</script>
```

app/app.js:
```javascript
  // relative require for within the package
  require('./local-dep');    // -> /app/local-dep.js

  // library resource
  var $ = require('jquery'); // -> /lib/jquery.js

  // format detected automatically
  console.log('loaded CommonJS');
```

Module format detection happens in the order System.register, ES6, AMD, then CommonJS and falls back to global modules.

Named defines are also supported, with the return value for a module containing named defines being its last named define.

> _Note that when running locally, ensure you are running from a local server or a browser with local XHR requests enabled. If not you will get an error message._

> _For Chrome on Mac, you can run it with: `/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome --allow-file-access-from-files &> /dev/null &`_

> _In Firefox this requires navigating to `about:config`, entering `security.fileuri.strict_origin_policy` in the filter box and toggling the option to false._

### Loading ES6

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
    System.import('app/es6-file').then(function(m) {
      console.log(new m.q().es6); // yay
    });
  </script>
```

ES6 modules define named exports, provided as getters on a special immutable `Module` object.

To build for production, see the [production workflows](https://github.com/systemjs/systemjs/wiki/Production-Workflows).

[For further details about SystemJS module format support, see the wiki page](https://github.com/systemjs/systemjs/wiki/Module-Format-Support).

For further infomation on ES6 module loading, see the [ES6 Module Loader polyfill documentation](https://github.com/ModuleLoader/es6-module-loader).

### Plugins

Plugins handle alternative loading scenarios, including loading assets such as CSS or images, and providing custom transpilation scenarios.

Supported Plugins:

* [CSS](https://github.com/systemjs/plugin-css) `System.import('my/file.css!')`
* [Image](https://github.com/systemjs/plugin-image) `System.import('some/image.png!image')`
* [JSON](https://github.com/systemjs/plugin-json) `System.import('some/data.json!').then(function(json){})`
* [Text](https://github.com/systemjs/plugin-text) `System.import('some/text.txt!text').then(function(text) {})`

Additional Community Plugins:

* [JSX](https://github.com/floatdrop/plugin-jsx) `System.import('template.jsx!')`
* [Markdown](https://github.com/guybedford/plugin-md) `System.import('app/some/project/README.md!').then(function(html) {})`
* [WebFont](https://github.com/guybedford/plugin-font) `System.import('google Port Lligat Slab, Droid Sans !font')`
* [CoffeeScript](https://github.com/forresto/plugin-coffee) `System.import('./test.coffee!')`

Additional plugin submissions to the above are welcome.

[Read the guide here on creating plugins](https://github.com/systemjs/systemjs/wiki/Creating-a-Plugin).

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
});
```

If configuring `baseURL` for use in Windows, prepend `file:` i.e.

```javascipt
System.config({
 baseURL: 'file:' + path.resolve('../path')
});
```

#### Running the tests

To install the dependencies correctly, run `bower install` from the root of the repo, then open `test/test.html` in a browser with a local server
or file access flags enabled.

License
---

MIT

