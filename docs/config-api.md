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
* [baseURL](#baseurl)
* [bundles](#bundles)
* [defaultJSExtensions](#defaultjsextensions)
* [depCache](#depcache)
* [map](#map)
* [meta](#meta)
* [packages](#packages)
* [packageConfigPaths](#packageconfigpaths)
* [paths](#paths)
* [pluginFirst](#pluginfirst)
* [production](#production)
* [traceurOptions](#traceuroptions)
* [transpiler](#transpiler)
* [transpilerRuntime](#transpilerruntime)
* [typescriptOptions](#typescriptoptions)
* [warnings](#warnings)

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

#### baseURL
Type: `String`
Default: `""`

The *baseURL* provides a mechanism for loading modules relative to a standard reference URL.

This can be useful for being able to refer to the same module from many different page URLs or environments:

```javascript
System.config({
  baseURL: '/modules'
});


// loads /modules/jquery.js
System.import('jquery.js');
```

Module names of the above form (i.e. without prelusive path information like `"./"`, `"../"` or `"/"`)
are referred to as _plain names_ and are always loaded baseURL-relative instead of parentURL relative
like one would expect with ordinary URLs.

> Note: always run the `System.config()` function instead of setting instance properties directly as this will set the correct normalized baseURL in the process.

For other *SystemJS* configuration options to work correctly, `baseURL` must not be set after
[`packages`](#packages), [`meta`](#meta), [`depCache`](#depcache), [`bundles`](#bundles) and
[`packageConfigPaths`](#packageconfigpaths) configuration options, if any of these are present.

> Note: as a rule of thumb, if you intend to use `baseURL`, always put it prior to any other
configuration option.

#### bundles
Type: `Object`
Default: `{}`

Bundles allow a collection of modules to be downloaded together as a package whenever any module from that collection is requested.
Useful for splitting an application into sub-modules for production. Use with the [SystemJS Builder](https://github.com/systemjs/builder).

```javascript
System.config({
  bundles: {
    bundleA: ['dependencyA', 'dependencyB']
  }
});
```

In the above any require to `dependencyA` or `dependencyB` will first trigger a `System.import('bundleA')` before proceeding with the load of `dependencyA` or `dependencyB`.

It is an alternative to including a script tag for a bundle in the page, useful for bundles that load dynamically where we want to trigger the bundle load automatically only when needed.

The bundle itself is a module which contains named System.register and define calls as an output of the builder. The dependency names the bundles config lists should be the same names that are explicitly defined in the bundle.

#### defaultJSExtensions
Type: `Boolean`
Default: `false`

Backwards-compatibility mode for the loader to automatically add '.js' extensions when not present to module requests.

This allows code written for SystemJS 0.16 or less to work easily in the latest version:

```javascript
System.defaultJSExtensions = true;

// requests ./some/module.js instead
System.import('./some/module');
```

> Note: this is a compatibility property for transitioning to using explicit extensions. Using it is deprecated.

#### depCache
Type: `Object`
Default: `{}`

The `depCache` option is an alternative to bundling, providing a solution to the latency issue of progressively loading dependencies.
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

> Due to the asynchronous loading of dependant modules, sequence of their content's availability is undefined and race conditions may apply.

#### map
Type: `Object`
Default: `{}`

The `map` option maps paths to tokens, thereby easing the use module references.

A token may not begin with path information, i.e. `"./"`, `"../"` or `"/"`, nor with server information,
like `protocol://server`. Yet, path separators within tokens are allowed and add to the token's
*validity*. Tokens with higher validity are preferred when matching them against an import reference:

```js
System.config({ map:  { "token1" : "/path/to/module"
                      , "token1/token2" : "/path/to/another/module"
                      }
              });
```
results in:
```js
import * from "token1/token2/token3"   // loads "/path/to/another/module/token3"
```

`map` is similar to [`paths`](#paths), but acts very early in the normalization process.
In addition, a map also applies to any subpaths, making it suitable for package folders as well.

> Note: map configuration used to support contextual submaps but this has been deprecated for package configuration.

#### meta
Type: `Object`
Default: `{}`

Module meta provides an API for SystemJS to understand how to load modules correctly.

Meta is how we set the module format of a module, or know how to shim dependencies of a global script.

```javascript
System.config({
  meta: {
    // meaning [baseURL]/vendor/angular.js when no other rules are present
    // path is normalized using map and paths configuration
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

* [`deps`](module-formats.md#shim-dependencies)
  (type: `Object`, default: `{}`):
  Dependencies to load before this module. Goes through regular paths and map normalization. Only supported for the `cjs`, `amd` and `global` formats.

* `esmExports`
  (type: `Boolean`, default: `false`):
  When loading a module that is not an ECMAScript Module, we set the module as the `default` export, but then also
  iterate the module object and copy named exports for it a well. Use this option to disable this iteration and copying of the exports.

* [`exports`](module-formats.md#exports)
  (type: `String`, default: `""`):
  For the `global` format, when automatic detection of exports is not enough, a custom exports meta value can be set.
  This tells the loader what global name to use as the module's export value.

* [`format`](module-formats.md)
  (type: `String`, default: `""`):
  Sets the format of the module to be loaded. See [Module Formats](module-formats.md).

* [`globals`](module-formats.md#custom-globals)
  (type: `Object`, default: `{}`):
  A map of global names to module names that should be defined only for the execution of this module.
    Enables use of legacy code that expects certain globals to be present.
    Referenced modules automatically becomes dependencies. Only supported for the `cjs` and `global` formats.

* `integrity`
  (type: `String`, default: `""`):
  The [subresource integrity](http://www.w3.org/TR/SRI/#the-integrity-attribute) attribute corresponding to the script integrity, describing the expected hash of the final code to be executed.
  For example, `System.config({ meta: { 'src/example.js': { integrity: 'sha256-e3b0c44...' }});` would throw an error if the translated source of `src/example.js` doesn't match the expected hash.

* [`loader`](overview.md#plugin-loaders)
  (type: `String`, default: `""`):
  Set a loader plug-in for this meta path.

* `nonce`
  (type: `String`, default: `""`):
  The [nonce](https://www.w3.org/TR/CSP2/#script-src-the-nonce-attribute) attribute to use when loading the script as a way to enable CSP.
  This should correspond to the "nonce-" attribute set in the Content-Security-Policy header.

* [`sourceMap`](creating-plugins.md)
  (type: `Object`, default: `{}`):
  For plug-in transpilers to set the source map of their transpilation.

> Note: more details on how to apply `meta` may be found [here](module-formats.md).

#### packages
Type: `Object`
Default: `{}`

Packages provide a convenient way to configure settings that are specific to a common path.

In particular, packages allow for setting contextual `map` configuration which only applies within the package itself.
This allows for full dependency encapsulation, ceasing the need for having all dependencies in a global namespace.

```javascript
System.config({
  packages: {
    // meaning [baseURL]/local/package when no other rules are present
    // path is normalized using map and paths configuration
    'local/package': {
      main: 'index.js',
      format: 'cjs',
      defaultExtension: 'js',
      map: {
        // use local jquery for all jquery requires in this package
        'jquery': './vendor/local-jquery.js',

        // import '/local/package/custom-import' should route to '/local/package/local/import/file.js'
        './custom-import': './local/import/file.js'
      },
      meta: {
        // sets meta for modules within the package
        'vendor/*': {
          'format': 'global'
        }
      }
    }
  }
});
```

* `configured`
  (type: `Boolean`, default: `false`):
  Won't load and process external package configuration from [packageConfigPaths](#packageconfigpaths)
  for this package.

* `defaultExtension`:
  (type: `String | Boolean`, default: `""`):
  The default extension to add to modules requested within the package.
  Takes preference over [`defaultJSExtensions`](#defaultjsextensions).
  Can be set to `defaultExtension: false` to opt-out of extension-adding when
  [`defaultJSExtensions`](#defaultjsextensions) is enabled.

* [`format`](module-formats.md):
  (type: `String`, default: `""`):
  The module format of the package. See [Module Formats](module-formats.md).

* `main`:
  (type: `String`, default: `""`):
  The main entry point of the package (so in the above example `import 'local/package'` is
  equivalent to `import 'local/package/index.js'`)

* `map`:
  (type: `Object`, default: `{}`):
  Local and relative map configurations scoped to the package. Apply for subpaths as well.
  Prelusive path information like `"./"`, `"../"` or `"/"` may be used (in contrast to global
  [map](#map) configuration option) and is advised.

* `meta`:
  (type: `Object`, default: `{}`):
  Package-scoped meta configuration with wildcard support. Modules are subpaths within the
  package path. This also provides an opt-out mechanism for `defaultExtension`, by adding modules
  here that should skip extension adding.

#### packageConfigPaths
Type: `Array`
Default: `[]`

Instead of providing package configuration information in the `packages` argument for `System.config()`
it may be desired to load package configuration from a separate configuration file.
 
Using `packageConfigPaths` a list of package configuration paths may be provided, which when matched
against a request, will pre-load and process a corresponding ".json" configuration file. This allows
dynamic loading of non-predetermined code, a key use case in SystemJS.

When a package matches `packageConfigPaths`, SystemJS will send a request for the package
configuration before sending a request for the package itself.

The package name itself is then retrieved by matching up to and including the last wildcard ("`*`")
or trailing slash of the provided package configuration path.

The most specific package configuration path will be used:

```js
  SystemJS.config({
		packageConfigPaths = [ 'packages/*.json'
                             , 'packages/abc/*/package.json'
                             , 'packages/abc/def/*/config.json'
                             ]
		});

  // will request and process 'packages/abc/def/xyz/config.json' config file
  // before issuing the request to 'packages/abc/def/xyz' package.
  SystemJS.import('packages/abc/def/xyz');

  // will request and process 'packages/abc/def/xyz/config.json' config file
  // before issuing the request to 'packages/abc/def/xyz' package.
  SystemJS.import('packages/abc/def/xyz/uvw');

  // will request and process 'packages/abc/def/package.json' config file
  // before issuing the request to 'packages/abc/def' package.
  SystemJS.import('packages/abc/def');

  // will request and process 'packages/abc.json' config file
  // before issuing the request to 'packages/abc' package.
  SystemJS.import('packages/abc');

  // trailing slashes are ignored. So 'packages/abc/' will
  // request and process 'packages/abc.json' config file
  // before issuing the request to 'packages/abc' package.
  SystemJS.import('packages/abc/');

  // no match - will request 'packages' package alone. (default)
  SystemJS.import('packages');

```

A package configuration file may contain any of the [`packages`](#packages) configuration
properties, e.g.:

```js
{ format: 'cjs'
, defaultExtension: 'js'
, main: 'index.js'
, map: { 'jquery': './vendor/local-jquery.js'
       , './custom-import': './local/import/file.js'
       }
}
```


Any existing package configurations for the package will deeply merge with the
package config, with the existing package configurations taking preference.

To opt-out of issuing a package configuration request for a package that matches
packageConfigPaths, use the `configured: true`  option in the corresponding
[packages](#packages) configuration.

#### paths
Type: `Object`
Default: `{}`

The [ES6 Module Loader](https://github.com/ModuleLoader/es6-module-loader/blob/master/docs/loader-config.md)
paths implementation, applied after normalization and supporting subpaths via wildcards.

The `paths` option maps paths to tokens, thereby easing the use module references.

A token may not begin with path information, i.e. `"./"`, `"../"` or `"/"`, nor with server information,
like `protocol://server`. Yet, path separators within tokens are allowed and add to the token's
*validity*. Tokens with higher validity are preferred when matching them against an import reference:

```js
System.config({ paths:  { "token1" : "/path/to/module"
                        , "token1/token2" : "/path/to/another/module"
                        }
              });
```
results in:
```js
import * from "token1/token2/token3"   // loads "/path/to/another/module/token3"
```

`paths` is similar to [map](#map), but acts as the final step in the normalization process.
A token is first processed by `map`. If, after this step, it is preluded by path information,
it's getting normalized (i.e. transformed into an absolute URL, considering [baseURL](#baseurl)).
Finally, if the token is not an absolute URL yet, it is getting matched against `paths`.

_It is usually advisable to use map configuration over paths unless you need strict control
over normalized module names._

#### pluginFirst
Type: `Boolean`
Default: `false`

Plug-ins may be loaded by using a special *plug-in syntax*:

```js
// using the Text plug-in to load 'some/file.txt' 
System.import('some/file.txt!text');
```

AMD, however, specifies a different plug-in syntax, which is reverse to *SystemJS*:

```js
// using the Text plug-in to load 'some/file.txt' 
System.import('text!some/file.txt');
```
Setting the `pluginFirst` property to `true` will have *SystemJS* read plug-in syntax
according to AMD specification.

#### production
Type: `Boolean`
Default: `false`

Set to `true` to indicate a production environment. 

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
Default: `"traceur"`

Sets the module name of the transpiler to be used for loading ES6 modules.

Represents a module name for `System.import` that must resolve to either Traceur, Babel or TypeScript.

When set to `traceur`, `babel` or `typescript`, loading will be automatically configured as far as possible.

#### transpilerRuntime
Type: `Boolean`
Default: `true`

If set to `false`, *SystemJS* will not load `traceur` and `babel` runtimes. If any of the two transpilers is
used, it must be loaded manually.

#### typescriptOptions
Type: `Object`
Default: `{}`

Sets the TypeScript transpiler options.

A list of options is available in the [TypeScript project documentation](https://github.com/Microsoft/TypeScript/wiki/Compiler%20Options).

#### warnings
Type: `Boolean`
Default: `false`

Enables output of loader warning messages.