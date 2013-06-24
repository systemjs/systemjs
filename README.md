require-es6
===========

RequireJS-style ES6 loader.

Provides as ES6 module loader that can load ES6, AMD, CommonJS and global modules.

Uses a similar interface to RequireJS including paths, map and package config.

Designed to work with the [ES6-loader polyfill](https://github.com/guybedford/es6-loader).

Including
---

Include `es6-loader.js` and `esprima-es6.js` (from [ES6-loader polyfill](https://github.com/guybedford/es6-loader)) in the same folder as `require-es6.js`.

Then include it with a `<script>` tag:

```html
  <script src="path/to/require-es6.js"></script>
```

The 70KB Esprima parser is dynamically included when loading an ES6 module only.
Without the parser, the polyfill and loader are 20KB combined and minified.

Usage
---

### Requiring

Requiring works identically to RequireJS:

```javascript
  requireES6(['some', 'modules'], function(some, modules) {
  });
```

### Configuration

Just like RequireJS, provide configuration by setting the requireES6 variable before the script is loaded, or call the `requireES6.config` function:

```javascript
  requireES6.config({
    baseURL: 'http://www.mysite.com',
    paths: {
      'app': 'http://www.anothersite.com'
    },
    map: {
      'jquery': 'app/jquery'
    }
  });
```

### Package Configuration

Package configuration is designed to be entirely modular. `map`, `paths` and `shimDep` configurations are set at the per package level:

```javascript
  requireES6.config({
    packages: {
      mypackage: {
        path: 'package/path',
        main: 'themain',
        map: {
          jquery: 'jquery-1.3.2' // map config for all modules in the package
        }
      }
    }
  });
  
  requireES6('mypackage/jquery');
```

### Shim Configuration

When loading a global script, the script is run such that its global definitions are contained to the loader global
and do not leak out onto the window object.

The defined globals are then turned into the defined module for that script.

In this way, one can load a global script naturally like any other script. This process is done automatically.

Example:

```javascript
  import { $: jQuery } from 'http://code.jquery.com/jquery-1.10.1.min.js';
  
  // ...
```

the above works without any configuration because jQuery defines the `jQuery` global which is turned into a module variable automatically.

To provide dependencies for global modules, use the `shimDep` configuration.

### All Configuration Options

```javascript
  requireES6.config({
    baseURL: '//git.jspm.io',

    // override loader hooks
    // adjusted so they work for plugin resources properly (plugins hack the fetch hook out of necessity)
    normalize: function(name, o) {
      // access the super
      this.normalize(name, o)
    },

    resolve: function(name, o) {
    },

    fetch: function(url, o) {
    },

    translate: function(source, o) {
    },

    link: function(source, o) {
    },

    paths: {
      'app': '//localhost:327'
    },

    // map config - acts before normalization
    map: {
      'jquery': '//code.jquery.com/jquery-1.10.1.min.js',
      'jquery-2': '//code.jquery.com/jquery-2.10.1.min.js',
      'css': 'guybedford/require-css/master/css'
    },

    // global dependencies
    // applies to module name after normalization
    shimDeps: {
      'jquery': ['hbs']
    },

    // acts at normalization level, after map config
    // packages sit in canonical name space, so deep names can override
    // this doesn't apply to map config in the same way
    packages: {
      'css': {
        path: 'guybedford/require-css/master'
        main: 'css'
      },
      'less': {
        path: 'guybedford/require-less/master',
        main: './less',

        // package mapping
        map: {
          'jquery': 'jquery-2'
        },

        // for global scripts, set dependencies
        shimDeps: {
          'less': 'jquery'
        }
      },
      'less/subpackage': { // allow subpackages for sub-map config etc. most specific wins
        main: 'googhttps',
      },
      'mymodule': {
        path: 'app',
        main: 'main'
      }
    }
  });
```
