## Configuration API

### Setting Configuration

Once SystemJS has loaded, configuration can be set on SystemJS by using the configuration function `System.config`:

```javascript
System.config({
  configA: {},
  configB: 'value'
});
```

This is a helper function which normalizes configuration and sets configuration properties on the SystemJS instance.

`System.config({ prop: 'value' })` is mostly equivalent to `System.prop = value` except that it will extend configuration objects,
and certain properties will be normalized to be stored correctly.

For this reason it is usually advisable to use `System.config` instead of setting instance properties directly.

### Configuration Options

* [babelOptions](#babeloptions)
* [bundle](#bundle)
* [defaultJSExtensions](#defaultjsextensions)
* [depCache](#depcache)
* [map](#map)
* [meta](#meta)
* [packages](#packages)
* [paths](#paths)
* [traceurOptions](#traceuroptions)
* [transpiler](#transpiler)
* [typescriptOptions](#typescriptoptions)

#### babelOptions
Type: `Object`
Default: `{}`

Set the Babel transpiler options when [System.transpiler](#transpiler) is set to `babel`:

```javascript
System.config({
  babelOptions: {
    stage: 1
  }
});
```

A list of options is available in the [Babel project documentation](https://babeljs.io/docs/usage/options/).

#### bundle
Type: `Object`

Bundles allow a collection of modules to be downloaded together as a package whenever any module from that collection is requested. 
Useful for splitting an application into sub-modules for production. Use with the [SystemJS Builder](https://github.com/systemjs/builder).

```javascript
System.config({
  bundles: {
    bundleA: ['dependencyA', 'dependencyB']
  }
});
```

A built bundle file must contain the exact named defines or named System.register statements for the modules it contains.
Mismatched names will result in separate requests still being made.

#### defaultJSExtensions

Backwards-compatibility mode for the loader to automatically add '.js' extensions when not present to module requests.

This allows code written for SystemJS 0.16 or less to work easily in the latest version:

```javascript
System.defaultJSExtensions = true;

// requests ./some/module.js instead
System.import('./some/module');
```

Note that this is a compatibility property for transitioning to using explicit extensions and will be deprecated in future.

#### depCache
Type: `Object`

An alternative to bundling providing a solution to the latency issue of progressively loading dependencies.
When a module specified in depCache is loaded, asynchronous loading of its pre-cached dependency list begins in parallel.

```javascript
System.config({
  depCache: {
    moduleA: ['moduleB'], // moduleA depends on moduleB
    moduleB: ['moduleC'] // moduleB depends on moduleC
  }
});

// when we do this import, depCache knows we also need moduleB and moduleC,
// it then directly requests those modules as well as soon as we request moduleA
System.import('moduleA')
```

Over HTTP/2 this approach may be preferable as it allows files to be individually cached in the browser meaning bundle optimizations are no longer a concern.

#### map
Type: `Object`

The map option is similar to paths, but acts very early in the normalization process. It allows you to map a module alias to a
location or package:

```javascript
System.config({
  map: {
    jquery: '//code.jquery.com/jquery-2.1.4.min.js'
  }
});
```

```javascript
import $ from 'jquery';

```

In addition, a map also applies to any subpaths, making it suitable for package folders as well:

```javascript
System.config({
  map: {
    package: 'local/package'
  }
});
```

```javascript
// loads /local/package/path.js
System.import('package/path.js');
```

> Note map configuration used to support contextual submaps but this has been deprecated for package configuration.

#### meta
Type: `Object`
Default: `{}`

Module meta provides an API for SystemJS to understand how to load modules correctly.

Meta is how we set the module format of a module, or know how to shim dependencies of a global script.

```javascript
System.config({
  meta: {
    // meaning [baseURL]/vendor/angular.js when no other rules are present
    'vendor/angular.js': {
      format: 'global', // load this module as a global
      exports: 'angular', // the global property to take as the module value
      deps: [
        // dependencies to load before this module
        'jquery'
      ]
    }
  }
});
```

Wildcard meta is also supported and is additive from least to most specific match:

```javascript
System.config({
  meta: {
    '/vendor/*': { format: 'global' }
  }
});
```

#### packages
Type: `Object`
Default: `{}`

Packages provide a convenience for setting meta and map configuration that is specific to a common path.

In addition packages allow for setting contextual map configuration which only applies within the package itself.
This allows for full dependency encapsulation without always needing to have all dependencies in a global namespace.

```javascript
System.config({
  packages: {
    // meaning [baseURL]/local/package when no other rules are present
    'local/package': {
      // when importing the package by name, load /local/package/index.js
      main: 'index.js',
      // all modules are CommonJS format
      format: 'cjs',
      // when requesting a module in the package with no extension, add ".js" automatically
      // this takes preference over defaultJSExtensions compatibility mode for the package
      defaultExtension: 'js',
      // just like map but only for requires within this package
      map: {
        // use local jquery for all jquery requires in this package
        'jquery': './vendor/local-jquery.js'
        
        // import '/local/package/custom-import' should route to '/local/package/local/import/file.js'
        './custom-import': './local/import/file.js'
      }
      meta: {
        // set meta for loading the local vendor files
        'vendor/*': {
          'format': 'global'
        }
      }
    }
  }
});
```

#### paths
Type: `Object`

The [ES6 Module Loader](https://github.com/ModuleLoader/es6-module-loader/blob/master/docs/loader-config.md) paths implementation, applied after normalization and supporting subpaths via wildcards.

_It is usually advisable to use map configuration over paths unless you need strict control over normalized module names._

#### traceurOptions
Type: `Object`
Default: `{}`

Set the Traceur compilation options.

```javascript
System.config({
    traceurOptions: {
    }
});
```

A list of options is available in the [Traceur project documentation](https://github.com/google/traceur-compiler/wiki/Options-for-Compiling).

#### transpiler
Type: `String`
Default: `traceur`

Sets the module name of the transpiler to be used for loading ES6 modules.

Represents a module name for `System.import` that must resolve to either Traceur, Babel or TypeScript.

When set to `traceur`, `babel` or `typescript`, loading will be automatically configured as far as possible.

#### typescriptOptions
Type: `Object`
Default: `{}`

Sets the TypeScript transpiler options.

A list of options is available in the [TypeScript project documentation](https://github.com/Microsoft/TypeScript/wiki/Compiler%20Options).
