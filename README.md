SystemJS
========

Important: This fork depends on coordinated changes in "system-fetch.js" in  "https://github.com/ModuleLoader/es6-module-loader", so as things go with this fork calling "npm install" will not pull in the changes from es6-module-loader. The changes in this fork are found in core.js adding the new configuration option "basicAuth". To test though you can take "/dist/system.src.js" and "/dist/system-csp-production.src.js" from this fork directly. The coordinated changes for es6-module-loader can be found in "https://github.com/typhonrt/es6-module-loader".

This is a SystemJS fork adding the ability to pull in modules and other resources cross-domain that require HTTP basic authorization. The necessity for this addition is that I have an unbundled admin domain / site that references modules and resources from the main unbundled development site / domain. Both the admin and developer domain have basic authentication enabled. Since SystemJS uses XMLHttpRequest it's necessary to set authentication headers from the requesting domain (in my case the admin site). To fascilitate this process a new configuration option has been added. "basicAuth" which can contain one or more authentication credentials like the following:

```
   basicAuth:
   {
      "https://private.server.com/": { username: '<USERNAME>', password: '<PASSWORD>' },
      "https://private.server2.com/": { username: '<USERNAME>', password: '<PASSWORD>' }
   },
```

SystemJS when loading resources will add the authentication header with encoded username / password for urls matching the domains provided in the config parameters.

It should be noted that an associated .htaccess file needs to be defined or other web server configuraiton needs to be setup on the private server to be accessed. The following is an example .htaccess file with the relevant details:

```
AuthType Basic
AuthUserFile /home/username/private.server.com/.htpasswd
AuthName "Private"
<LimitExcept OPTIONS>
   require valid-user
</LimitExcept>

Header always add Access-Control-Allow-Origin "https://requesting.domain.com"
Header always add Access-Control-Allow-Headers "accept, origin, x-requested-with, authorization, content-type"
Header always add Access-Control-Allow-Methods "GET"
Header always add Access-Control-Allow-Credentials "true"
```

I have only tested these changes with Chrome & Safari on OSX. Note, that the above ```<LimitExcept OPTIONS>``` is necessary for Chrome as an OPTIONS request is sent and returned before the actual GET request. 

Please note that the code in this fork has been changed in libs and the make file run, but only the complete source versions of "/dist/system.src.js" and "/dist/system-csp-production.src.js" have the actual changes. The minified and other versions are not modified. Also note the important fact that this modification depends on changes in es6-module-loader as well, so if you run the make file you won't pull in those changes.

Please also note that I'm not a security expert. It seems OK to store the basic authorization credentials in the config.js file for the requesting site. Since in my case I have basic authorization setup for the requesting site the config.js file is not accessible without authentication on the requesting site.  

---------

_For upgrading to SystemJS 0.17 / 0.18, see the [SystemJS 0.17 release upgrade notes for more information](https://github.com/systemjs/systemjs/releases/tag/0.17.0), or read the updated [SystemJS Overview](docs/overview.md) guide._

Universal dynamic module loader - loads ES6 modules, AMD, CommonJS and global scripts in the browser and NodeJS. Works with both Traceur and Babel.

* [Loads any module format](docs/module-formats.md) with [exact circular reference and binding support](https://github.com/ModuleLoader/es6-module-loader/blob/v0.17.0/docs/circular-references-bindings.md).
* Loads [ES6 modules compiled into the `System.register` bundle format for production](docs/production-workflows.md), maintaining circular references support.
* Supports RequireJS-style [map](docs/overview.md#map-config), [paths](docs/overview.md#paths-config), [bundles](docs/production-workflows.md#bundle-extension) and [global shims](docs/module-formats.md#shim-dependencies).
* [Loader plugins](docs/overview.md#plugins) allow loading assets through the module naming system such as CSS, JSON or images.

Built on top of the [ES6 Module Loader polyfill](https://github.com/ModuleLoader/es6-module-loader).

~14KB minified and gzipped, runs in IE8+ and NodeJS.

For discussion, [see the Google Group](https://groups.google.com/group/systemjs).

For a list of guides and tools, see the [Third-Party Resources Wiki](https://github.com/systemjs/systemjs/wiki/Third-Party-Resources).

Documentation
---

* [ES6 Modules Overview](docs/es6-modules-overview.md)
* [SystemJS Overview](docs/overview.md)
* [Config API](docs/config-api.md)
* [Module Formats](docs/module-formats.md)
* [Production Workflows](docs/production-workflows.md)
* [System API](docs/system-api.md)
* [Creating Plugins](docs/creating-plugins.md)

Basic Use
---

### Browser

```html
<script src="system.js"></script>
<script>
  // set our baseURL reference path
  System.config({
    baseURL: '/app'
  });

  // loads /app/main.js
  System.import('main.js');
</script>
```

To load ES6, locate a transpiler ([`traceur.js`](https://github.com/jmcriffey/bower-traceur), ['browser.js' from Babel](https://github.com/babel/babel), or ['typescript.js' from TypeScript](https://github.com/Microsoft/TypeScript)) 
in the baseURL path, then set the transpiler:

```html
<script>
  System.config({
    // or 'traceur' or 'typescript'
    transpiler: 'babel',
    // or traceurOptions or typescriptOptions
    babelOptions: {

    }
  });
</script>
```

Alternatively a custom path to Babel or Traceur can also be set through paths:

```javascript
System.config({
  map: {
    traceur: 'path/to/traceur.js'
  }
});
```

### Polyfills

SystemJS relies on `Promise` and `URL` being present in the environment. When these are not available it will send a request out to the `system-polyfills.js` file located in the dist folder which will polyfill `window.Promise` and `window.URLPolyfill`.

This is typically necessary in IE, so ensure to keep this file in the same folder as SystemJS.

Alternatively the polyfills can be loaded manually or via other polyfill implementations as well.

### NodeJS

To load modules in NodeJS, install SystemJS with:

```
  npm install systemjs
```

If transpiling ES6, also install the transpiler:

```
  npm install traceur babel typescript 
```

We can then load modules equivalently to in the browser:

```javascript
var System = require('systemjs');

System.transpiler = 'traceur';

// loads './app.js' from the current directory
System.import('./app').then(function(m) {
  console.log(m);
});
```

If using TypeScript, set `global.ts = require('typescript')` before importing to ensure it is loaded correctly.

### Plugins

Supported loader plugins:

* [CSS](https://github.com/systemjs/plugin-css) `System.import('my/file.css')`
* [Image](https://github.com/systemjs/plugin-image) `System.import('some/image.png!image')`
* [JSON](https://github.com/systemjs/plugin-json) `System.import('some/data.json')`
* [Text](https://github.com/systemjs/plugin-text) `System.import('some/text.txt!text')`

Additional Plugins:

* [CoffeeScript](https://github.com/forresto/plugin-coffee) `System.import('./test.coffee')`
* [Jade](https://github.com/johnsoftek/plugin-jade)
* [Jade VirtualDOM](https://github.com/WorldMaker/system-jade-virtualdom)
* [JSX](https://github.com/floatdrop/plugin-jsx) `System.import('template.jsx')`
* [Markdown](https://github.com/guybedford/plugin-md) `System.import('app/some/project/README.md').then(function(html) {})`
* [WebFont](https://github.com/guybedford/plugin-font) `System.import('google Port Lligat Slab, Droid Sans !font')`
* [Handlebars](https://github.com/davis/plugin-hbs) `System.import('template.hbs!')`
* [Ember Handlebars](https://github.com/n-fuse/plugin-ember-hbs) `System.import('template.hbs!')`
* [raw](https://github.com/matthewbauer/plugin-raw) `System.import('file.bin!raw').then(function(data) {})`
* [jst](https://github.com/podio/plugin-jst) Underscore templates

[Read about using plugins here](docs/overview.md#plugin-loaders)
[Read the guide here on creating plugins](docs/creating-plugins.md).

#### Running the tests

To install the dependencies correctly, run `bower install` from the root of the repo, then open `test/test.html` in a browser with a local server
or file access flags enabled.

License
---

MIT

[travis-url]: https://travis-ci.org/systemjs/systemjs
[travis-image]: https://travis-ci.org/systemjs/systemjs.svg?branch=master
