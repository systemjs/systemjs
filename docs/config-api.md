## Configuration API

### Configuration Options

* [baseURL](#baseurl)
* [bundles](#bundles)
* [depCache](#depcache)
* [map](#map)
* [meta](#meta)
* [packages](#packages)
* [packageConfigPaths](#packageconfigpaths)
* [pluginFirst](#pluginFirst)
* [paths](#paths)
* [transpiler](#transpiler)
* [warnings](#warnings)

#### baseURL
Type: `String`
Default: Environment baseURI

The _baseURL_ provides a mechanism for knowing where to load plain modules names from, regardless of which parent module they
are being loaded from.

For example:

```javascript
SystemJS.config({
  baseURL: '/modules'
});

System.import('x');
```

will load `x` from `/modules/x`.

Plain modules are module names like the above, which do not begin with `/`, `./`, `../` and are not absolute URLs.

Relative URLs are still resolved relative to the parent module, or for a top-level import, relative to the environment baseURI.

#### bundles
Type: `Object`
Default: `{}`

Bundles allow a collection of modules to be downloaded together as a package whenever any module from that collection is requested.
Useful for splitting an application into sub-modules for production. Use with the [SystemJS Builder](https://github.com/systemjs/builder).

```javascript
SystemJS.config({
  bundles: {
    bundleA: ['dependencyA', 'dependencyB']
  }
});
```

In the above any require to `dependencyA` or `dependencyB` will first trigger a `SystemJS.import('bundleA')` before proceeding with the load of `dependencyA` or `dependencyB`.

It is an alternative to including a script tag for a bundle in the page, useful for bundles that load dynamically where we want to trigger the bundle load automatically only when needed.

The bundle itself is a module which contains named System.register and define calls as an output of the builder. The dependency names the bundles config lists should be the same names that are explicitly defined in the bundle.

#### depCache
Type: `Object`
Default: `{}`

The `depCache` option is an alternative to bundling, providing a solution to the latency issue of progressively loading dependencies.
When a module specified in depCache is loaded, asynchronous loading of its pre-cached dependency list begins in parallel.

```javascript
SystemJS.config({
  depCache: {
    moduleA: ['moduleB'], // moduleA depends on moduleB
    moduleB: ['moduleC'] // moduleB depends on moduleC
  }
});

// when we do this import, depCache knows we also need moduleB and moduleC,
// it then directly requests those modules as well as soon as we request moduleA
SystemJS.import('moduleA')
```

Over HTTP/2 this approach may be preferable as it allows files to be individually cached in the browser meaning bundle optimizations are no longer a concern.

#### map
Type: `Object`
Default: `{}`

The map option is similar to paths, but acts very early in the normalization process. It allows you to map a module alias to a
location or package:

```javascript
SystemJS.config({
  map: {
    jquery: '//code.jquery.com/jquery-2.1.4.min.js'
  }
});
```

```javascript
import $ from 'jquery';
```

Map configuration only applies to plain names, as described in the baseURL section above, although maps can contain `/` separators.

In addition, a map also applies to any subpaths, making it suitable for package folders as well:

```javascript
SystemJS.config({
  map: {
    package: 'local/package'
  }
});
```

```javascript
// loads /local/package/path.js
SystemJS.import('package/path.js');
```

Contexual map configuration allows mappings to only apply to certain packages:

```javascript
SystemJS.config({
  map: {
    'local/package': {
      x: 'vendor/x.js'
    },
    'another/package': {
      x: 'vendor/y.js'
    }
  }
});
```

Means that `import "x"` within the file `local/package/index.js` will load from `vendor/x.js`, while the same import in `another/package/file.js`
will load `vendor/y.js`. This type of configuration enables multi-version support.

Contextual map configuration is equivalent to the package map configuration.

#### meta
Type: `Object`
Default: `{}`

Module meta provides an API for SystemJS to understand how to load modules correctly.

Meta is how we set the module format of a module, or know how to shim dependencies of a global script.

```javascript
SystemJS.config({
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
SystemJS.config({
  meta: {
    '/vendor/*': { format: 'global' }
  }
});
```

* [`authorization`]: This can be a custom authorization header string for XHR requests made by SystemJS.
* `crossOrigin`: When scripts are loaded from a different domain (e.g. CDN) the global error handler (`window.onerror`)
  has very limited information about errors to [prevent unintended leaking]
  (https://developer.mozilla.org/en/docs/Web/API/GlobalEventHandlers/onerror#Notes).
  In order to mitigate this, the `<script>` tags need to set [`crossorigin` attribute]
  (https://developer.mozilla.org/en-US/docs/Web/HTML/Element/script#attr-crossorigin) and the server needs to
  [enable CORS](http://enable-cors.org/).
  The [valid values](https://developer.mozilla.org/en-US/docs/Web/HTML/CORS_settings_attributes) are
  `"anonymous"` and `"use-credentials"`.
* [`deps`](module-formats.md#shim-dependencies):
  Dependencies to load before this module. Goes through regular paths and map normalization. Only supported for the `cjs`, `amd` and `global` formats.
* `esModule`: When loading a legacy module (non-ES module), this informs SystemJS to allow that module to be loaded with named imports (`import {name} from 'cjs.js'`),
  the same as if the module had an `exports.__esModule = true` flag.
* [`exports`](module-formats.md#exports):
  For the `global` format, when automatic detection of exports is not enough, a custom exports meta value can be set.
  This tells the loader what global name to use as the module's export value.
* [`format`](module-formats.md):
  Sets in what format the module is loaded.
* [`globals`](module-formats.md#custom-globals):
  A map of global names to module names that should be defined only for the execution of this module.
    Enables use of legacy code that expects certain globals to be present.
    Referenced modules automatically becomes dependencies. Only supported for the `cjs` and `global` formats.
* `integrity`: The [subresource integrity](http://www.w3.org/TR/SRI/#the-integrity-attribute) attribute corresponding to the script integrity, describing the expected hash of the final code to be executed.
  For example, `SystemJS.config({ meta: { 'src/example.js': { integrity: 'sha256-e3b0c44...' }});` would throw an error if the translated source of `src/example.js` doesn't match the expected hash.
* [`loader`](getting-started.md#plugin-loaders):
  Set a loader for this meta path.
* `nonce`: The [nonce](https://www.w3.org/TR/CSP2/#script-src-the-nonce-attribute) attribute to use when loading the script as a way to enable CSP.
  This should correspond to the "nonce-" attribute set in the Content-Security-Policy header.
* [`sourceMap`](creating-plugins.md):
  For plugin transpilers to set the source map of their transpilation.
* `scriptLoad`: Set to `true` to load the module using `<script>` tag injection (`importScript()` in a worker context) instead of using `fetch` and `eval`. This enables [CSP](https://www.w3.org/TR/CSP2/) support but disables the native loading of CommonJS modules and global modules where the export name is not declared via metadata. _Note that scriptLoad is not supported in IE<11._

#### packages
Type: `Object`
Default: `{}`

Packages provide a convenience for setting meta and map configuration that is specific to a common path.

In particular, packages allow for setting contextual `map` configuration which only applies within the package itself.
This allows for full dependency encapsulation, removing the need to have all dependencies in a global namespace.

```javascript
SystemJS.config({
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

* `defaultExtension` (Type: `String | Boolean`): The default extension to add to modules requested within the package.
* `format` (Type: `String`): The module format of the package. See [Module Formats](https://github.com/systemjs/systemjs/blob/master/docs/module-formats.md).
* `main` (Type: `String`): The main entry point of the package (so `import 'local/package'` is equivalent to `import 'local/package/index.js'`)
* `map` (Type: `Object`): Local and relative map configurations scoped to the package. Apply for subpaths as well.
* `meta` (Type: `Object`): Package-scoped meta configuration with wildcard support. Modules are subpaths within the package path.
  This also provides an opt-out mechanism for `defaultExtension`, by adding modules here that should skip extension adding.

#### packageConfigPaths
Type: `Array`
Default: `[]`

Instead of providing package configuration information in the `packages` argument for `System.config()`,
this option allows specifying where a config file can be loaded to get the configuration for a package.

For example:

```javascript
SystemJS.config({
  packageConfigPaths: [
    'packages/*.json',
    'packages/abc/*/package.json',
    'packages/abc/def/*/config.json'
  ]
});
```

Will result in the following cases applying from least to most specific:

* `SystemJS.import('packages')` will not load any package configuration.
* `SystemJS.import('packages/x')` will load its package configuration from the file `packages/x.json`.
* `SystemJS.import('packages/abc/d')` loading its package configuration from the file `packages/abc/d/package.json`.
* `SystemJS.import('packages/abc/def/g')` loading its package configuration from the file `pacakge/abc/def/g/config.json`.

The package configuration is loaded as a standard JSON file, with the configuration then applied
before continuing with the resolution of the original import.

#### paths
Type: `Object`
Default: `{}`

Paths allow creating mappings that apply after `map` configuration:

```javascript
SystemJS.config({
  paths: {
    'app/': 'https://code.mycdn.com/app-1.2.3/'
  }
});
```

`paths` is similar to [map](#map), but acts as the final step in the normalization process.
A token is first processed by `map`. If, after this step, it is preluded by path information,
it's getting normalized (i.e. transformed into an absolute URL, considering [baseURL](#baseurl)).
Finally, if the token is not an absolute URL yet, it is getting matched against `paths`.

_It is usually advisable to use map configuration over paths unless you need strict control
 +over normalized module names._

#### pluginFirst
Type: `Boolean`
Default: `false`

Plugins may be loaded via plugin syntax `some/file.txt!text`

AMD and Webpack however use a different plug-in syntax, which is in reverse to SystemJS - `text!some/file.txt`.

Setting the `pluginFirst` property to `true` makes SystemJS follow the AMD-style plugin rules.

#### transpiler
Type: `String`
Default: `undefined`

Sets the module name of the transpiler plugin to be used for loading ES6 modules.

Represents a module name for `SystemJS.import` that must resolve to a valid plugin that supports transpilation of ES modules.

### warnings
Type: `Boolean`
Default: `false`

Enables the output of warnings to the console, including deprecation messages.

#### wasm
Type: `Boolean`
Default: `false`

When enabled, and in a browser that supports WebAssembly, all module loads will first be checked for Web Assembly binary headers
and executed as WebAssembly in browsers if so.
