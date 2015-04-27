SystemJS
========

[![Gitter](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/systemjs/systemjs?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

_For upgrading to SystemJS 0.16, see the [ES6 Module Loader 0.16 release upgrade notes for more information](https://github.com/ModuleLoader/es6-module-loader/releases/tag/v0.16.0), or read the updated [Getting Started](#getting-started) guide below._

Universal dynamic module loader - loads ES6 modules, AMD, CommonJS and global scripts in the browser and NodeJS. Works with both Traceur and Babel.

* [Loads any module format](https://github.com/systemjs/systemjs/wiki/Module-Format-Support) with [exact circular reference and binding support](https://github.com/ModuleLoader/es6-module-loader/wiki/Circular-References-&-Bindings).
* Loads [ES6 modules compiled into the `System.register` bundle format for production](https://github.com/systemjs/systemjs/wiki/Production-Workflows), maintaining circular references support.
* Supports RequireJS-style [map](https://github.com/systemjs/systemjs/wiki/Map-Configuration), [paths](https://github.com/ModuleLoader/es6-module-loader/wiki/Configuring-the-Loader#paths-implementation), [bundles](https://github.com/systemjs/systemjs/wiki/Production-Workflows#bundle-extension) and [global shims](https://github.com/systemjs/systemjs/wiki/Module-Format-Support#globals-global).
* [Loader plugins](#plugins) allow loading assets through the module naming system such as CSS, JSON or images.

Designed to work with the [ES6 Module Loader polyfill](https://github.com/ModuleLoader/es6-module-loader) (9KB) for a combined total footprint of 16KB minified and gzipped.

Runs in IE8+ and NodeJS.

For discussion, [see the Google Group](https://groups.google.com/group/systemjs).

For a list of guides and tools, see [Third-Party Resources](https://github.com/systemjs/systemjs/wiki/Third-Party-Resources).

Documentation
---

* [Basic Use](https://github.com/systemjs/systemjs/wiki/Basic-Use)
* [Configuration Options](https://github.com/systemjs/systemjs/wiki/Configuration-Options)
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

### Browser Use

Download [`es6-module-loader.js`](https://github.com/ModuleLoader/es6-module-loader/blob/v0.16.0/dist/es6-module-loader.js) into the same folder as `system.js`.

Load SystemJS with a single script tag:

```html
<script src="system.js"></script>
```

It will then load `es6-module-loader.js` itself.

To load ES6, locate [`traceur.js`](https://raw.githubusercontent.com/jmcriffey/bower-traceur/0.0.87/traceur.js) in the baseURL path and it will be loaded when needed.

For use with Babel, locate the `browser.js` file at `babel.js` in the baseURL and set:

```html
<script>
  System.transpiler = 'babel';
</script>
```

Alternatively a custom path to Babel or Traceur can also be set through paths:

```javascript
System.config({
  paths: {
    traceur: 'path/to/traceur.js'
  }
});
```

### NodeJS Use

To load modules in NodeJS, install SystemJS with:

```
  npm install systemjs traceur
```

(making sure to also install Traceur or Babel as needed, as they are not included as dependencies as of SystemJS 0.16)

We can then load modules equivalently to in the browser:

```javascript
var System = require('systemjs');

/* 
 * Include
 *   System.transpiler = 'babel';
 * to use Babel instead of Traceur
 */

// loads './app.js' from the current directory
System.import('./app').then(function(m) {
  console.log(m);
});
```

If configuring the `baseURL` for use in Windows, prepend `file:` i.e.

```javascipt
System.config({
 baseURL: 'file:' + path.resolve('../path')
});
```

### Plugins

Plugins handle alternative loading scenarios, including loading assets such as CSS or images, and providing custom transpilation scenarios.

Supported Plugins:

* [CSS](https://github.com/systemjs/plugin-css) `System.import('my/file.css!')`
* [Image](https://github.com/systemjs/plugin-image) `System.import('some/image.png!image')`
* [JSON](https://github.com/systemjs/plugin-json) `System.import('some/data.json!').then(function(json){})`
* [Text](https://github.com/systemjs/plugin-text) `System.import('some/text.txt!text').then(function(text) {})`

Additional Plugins:

* [CoffeeScript](https://github.com/forresto/plugin-coffee) `System.import('./test.coffee!')`
* [Jade](https://github.com/johnsoftek/plugin-jade)
* [JSX](https://github.com/floatdrop/plugin-jsx) `System.import('template.jsx!')`
* [Markdown](https://github.com/guybedford/plugin-md) `System.import('app/some/project/README.md!').then(function(html) {})`
* [WebFont](https://github.com/guybedford/plugin-font) `System.import('google Port Lligat Slab, Droid Sans !font')`
* [Ember Handlebars](https://github.com/n-fuse/plugin-ember-hbs) `System.import('template.hbs!')`

Plugins are loaded from the module name of the extension. To set them up, you'll most likely want to add map configuration. For example:

```javascript
System.map['css'] = 'path/to/css/plugin';
```

Loading through plugin is indicated with `!` at the end of the name:

```javascript
System.import('file.css!');      // will use the "css" plugin, assumed from the extension
System.import('file.css!text');  // will use the "text" plugin, instead of checking the extension
```

[Read the guide here on creating plugins](https://github.com/systemjs/systemjs/wiki/Creating-a-Plugin).

#### Running the tests

To install the dependencies correctly, run `bower install` from the root of the repo, then open `test/test.html` in a browser with a local server
or file access flags enabled.

License
---

MIT

