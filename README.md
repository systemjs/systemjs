# SystemJS

[![Build Status][travis-image]][travis-url]
[![Gitter](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/systemjs/systemjs?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)
[![Sponsor](https://cdn.canopytax.com/images/canopy-sponsorship.svg)](https://canopytax.github.io/post/systemjs-sponsorship/?utm_source=systemjs)

Configurable module loader enabling backwards compatibility workflows for ES modules in browsers. If you're interested in modern workflows for ES module compatible browsers only, see [ES Module Shims](https://github.com/guybedford/es-module-shims).

Release Links:

* [Latest 6.x Major Release](https://github.com/systemjs/systemjs/releases/tag/6.0.0)
* [SystemJS 2.0 Announcement Post](https://guybedford.com/systemjs-2.0)
* [SystemJS 0.21](https://github.com/systemjs/systemjs/tree/0.21)

_SystemJS is [currently sponsored by Canopy Tax](https://canopytax.github.io/post/systemjs-sponsorship/?utm_source=systemjs)._

For discussion, join the [Gitter Room](https://gitter.im/systemjs/systemjs).

## Overview

SystemJS provides two hookable base builds:

#### 1. s.js minimal loader

The minimal [1.5KB s.js loader](dist/s.min.js) provides a workflow where code written for production workflows of native ES modules in browsers ([like Rollup code-splitting builds](https://rollupjs.org/guide/en#code-splitting)), can be transpiled to the [System.register module format](docs/system-register.md) to work in older browsers that don't supporting native modules, including IE11++.

Since the ES module semantics such as live bindings, circular references, contextual metadata, dynamic import and top-level await [can all be fully supported this way](docs/system-register.md#semantics), while supporting CSP and cross-origin support, this workflow can be relied upon as a polyfill-like path.

* Loads and resolves modules as URLs, throwing for bare specifier names (eg `import 'lodash'`) like the native module loader.
* Loads System.register modules.
* Core hookable extensible loader supporting [custom extensions](docs/hooks.md).

#### 2. system.js loader

The [3KB system.js loader](dist/system.min.js) loader builds on the s.js core and adds support for upcoming module specifications (currently [import maps](https://github.com/domenic/import-maps) and [Wasm integration](https://github.com/WebAssembly/esm-integration) with module loading) as well as development and convenience features.

* Support for loading [bare specifier names](docs/import-maps.md) through import maps (formerly package maps, formerly map configuration), loaded via `<script type="systemjs-importmap">` (requires a `fetch` polyfill for eg IE11).
* Includes the [global loading extra](#extras) for loading global scripts, useful for loading library dependencies traditionally loaded with script tags.
* [Tracing hooks](docs/hooks.md#trace-hooks) and [registry deletion API](docs/api.md#registry) for reloading workflows.
* Supports loading Wasm, CSS and JSON [module types](docs/module-types.md).

#### Extras

The following [pluggable extras](dist/extras) can be dropped in with either the s.js or system.js loader:

* [AMD loading](dist/extras/amd.js) support (through `Window.define` which is created).
* [Named exports](dist/extras/named-exports.js) convenience extension support for global and AMD module formats (`import { x } from './global.js'` instead of `import G from './global.js'; G.x`)
* [Named register](dist/extras/named-register.js) supports `System.register('name', ...)` named bundles which can then be imported as `System.import('name')` (as well as AMD named define support)
* [Transform loader](dist/extras/transform.js) support, using fetch and eval, supporting a hookable `loader.transform`
* [Use default](dist/extras/use-default.js) provides a convenience interop for AMD modules to return the direct AMD
  binding instead of a `{ default: amdModule }` object from `System.import`.

The following extras are included in system.js loader by default, and can be added to the s.js loader for a smaller tailored footprint:

* [Global loading](dist/extras/global.js) support for loading global scripts and detecting the defined global as the default export. Useful for loading common library scripts from CDN like `System.import('//unpkg.com/lodash')`.
* [Module Types](dist/extras/module-types.js) `.css`, `.wasm`, `.json` [module type](docs/module-types.md) loading support in line with the existing modules specifications.

Since all loader features are hookable, custom extensions can be easily made following the same approach as the bundled extras. See the [hooks documentation](docs/hooks.md) for more information.

## Installation

```
npm install systemjs
```

## Documentation

* [Import Maps](docs/import-maps.md)
* [API](docs/api.md)
* [System.register](docs/system-register.md)
* [Loader Hooks](docs/hooks.md)
* [Module Types](docs/module-types.md)

## Example Usage

### Loading a System.register module
You can load [System.register](/docs/system-register.md) modules with a script element in your HTML:

```html
<script type="systemjs-module" src="/js/main.js"></script>
<script type="systemjs-module" src="import:name-of-module"></script>
<script src="system.js"></script>
```
Using an [`import:` URL](https://github.com/WICG/import-maps/#import-urls) the `src` attribute in HTML can reference [import maps](/docs/import-maps.md).
### Loading with System.import
You can also dynamically load modules at any time with `System.import()`:

```js
System.import('/js/main.js');
```

where `main.js` is a module available in the System.register module format.

### Bundling workflow

For an example of a bundling workflow, see the Rollup Code Splitting starter project - https://github.com/rollup/rollup-starter-code-splitting.

### Import Maps

Say `main.js` depends on loading `'lodash'`, then we can define an import map:

```html
<script src="system.js"></script>
<script type="systemjs-importmap">
{
  "imports": {
    "lodash": "https://unpkg.com/lodash@4.17.10/lodash.js"
  }
}
</script>
<!-- Alternatively:
<script type="systemjs-importmap" src="path/to/map.json">
-->
<script>
  System.import('/js/main.js');
</script>
```

## Community Projects

A list of projects that use or work with SystemJS in providing modular browser workflows. [Post a PR](https://github.com/systemjs/systemjs/edit/master/README.md).

* [es-dev-server](https://github.com/open-wc/open-wc/tree/master/packages/es-dev-server) - A web server for developing without a build step.
* [import map overrides](https://github.com/joeldenning/import-map-overrides/) - Dynamically inject an import map stored in local storage so that you can override the URL for any module. Can be useful for running development modules on localhost against the server.
* [js-env](https://github.com/jsenv/jsenv-core) - Collection of development tools providing a unified workflow to write JavaScript for the web, node.js or both at the same time.
* [jspm.io](https://jspm.io) - `https://system-dev.jspm.io/[name]` provides a CDN serving npm modules for SystemJS.
* [jspm.org](https://jspm.org) - Package manager for native modules, using SystemJS for backwards compatibility.
* [single-spa](https://single-spa.js.org/) - JavaScript framework for front-end microservices.
* [systemjs-webpack-interop](https://github.com/joeldenning/systemjs-webpack-interop) - npm lib for setting webpack public path and creating webpack configs that work well with SystemJS.

## Loader Extensions

This list can be extended to include third-party loader extensions. [Post a PR](https://github.com/systemjs/systemjs/edit/master/README.md).

* [transform-babel](https://github.com/systemjs/systemjs-transform-babel) Supports ES module transformation into System.register with Babel.
* [systemjs-css-extra](https://github.com/systemjs/systemjs-css-extra) CSS loader plugin

## Compatibility with Webpack

Code-splitting builds on top of native ES modules, like Rollup offers, are an alternative to the Webpack-style chunking approach - offering a way to utilize the native module loader for loading shared and dynamic chunks instead of using a custom registry and loader as Webpack bundles include. Scope-level optimizations can be performed on ES modules when they are combined, while ensuring no duplicate code is loaded through dynamic loading and code-sharing in the module registry, using the features of the native module loader and its dynamic runtime nature.

[systemjs-webpack-interop](https://github.com/joeldenning/systemjs-webpack-interop) is a community-maintained npm library that might help you get webpack and systemjs working well together.

As of webpack@4.30.0, it is now possible to compile webpack bundles to System.register format, by modifying your webpack config:

```js
{
  output: {
    libraryTarget: 'system', 
  }
}
```

If building code using the `System` global in Webpack, the following config is needed to avoid rewriting:

```js
{
  module: {
    rules: [
      { parser: { system: false } }
    ]
  }
}
```

## Polyfills for Older Browsers

### Promises

Both builds of SystemJS need Promises in the environment to work, which aren't supported in older browsers like IE11.

Promises can be conditionally polyfilled using, for example, [Bluebird](http://bluebirdjs.com/docs/getting-started.html) (generally the fastest Promise polyfill):

```html
<script>
  if (typeof Promise === 'undefined')
    document.write('<script src="node_modules/bluebird/js/browser/bluebird.core.js"><\/script>');
</script>
```

> Generally `document.write` is not recommended when writing web applications, but for this use case
  it works really well and will only apply in older browsers anyway.

### Fetch

To support import maps in the system.js build, a fetch polyfill is need. The [GitHub polyfill](https://github.github.io/fetch/) is recommended:

```html
<script>
  if (typeof fetch === 'undefined')
    document.write('<script src="node_modules/whatwg-fetch/fetch.js"><\/script>');
</script>
```

### Constructable Stylesheets

If using CSS modules, a Constructable Stylesheets polyfill is needed - [see the module types documentation](docs/module-types.md#constructable-style-sheets-polyfill) for further info.

## Contributing to SystemJS

Project bug fixes and changes are welcome for discussion, provided the project footprint remains minimal.

To run the tests:

```
npm run build && npm run test
```

## Changes

For the changelog, see [CHANGELOG.md](CHANGELOG.md).

## License

MIT

[travis-url]: https://travis-ci.org/systemjs/systemjs
[travis-image]: https://travis-ci.org/systemjs/systemjs.svg?branch=master
