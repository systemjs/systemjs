# SystemJS

[![Build Status][travis-image]][travis-url]
[![Gitter](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/systemjs/systemjs?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)
[![Sponsor](https://cdn.canopytax.com/images/canopy-sponsorship.svg)](https://canopytax.github.io/post/systemjs-sponsorship/?utm_source=systemjs)

Configurable module loader enabling backwards compatibility workflows for ES modules in browsers. If you're interested in modern workflows for ES module compatible browsers only, see [ES Module Shims](https://github.com/guybedford/es-module-shims).

[Read the SystemJS 2.0 announcement post](https://guybedford.com/systemjs-2.0)

_[For the previous release see the SystemJS 0.21.x branch](https://github.com/systemjs/systemjs/tree/0.21)_

_SystemJS is [currently sponsored by Canopy Tax](https://canopytax.github.io/post/systemjs-sponsorship/?utm_source=systemjs)._

SystemJS provides two hookable base builds:

#### 1. s.js minimal loader

The minimal [1.5KB s.js loader](dist/s.min.js) provides a workflow where code written for production workflows of native ES modules in browsers ([like Rollup code-splitting builds](https://rollupjs.org/guide/en#code-splitting)), can be transpiled to the [System.register module format](docs/system-register.md) to work in older browsers that don't supporting native modules, including IE11++.

Since the ES module semantics such as live bindings, circular references, contextual metadata, dynamic import and top-level await [can all be fully supported this way](docs/system-register.md#semantics), while supporting CSP and cross-origin support, this workflow can be relied upon as a polyfill-like path.

* Loads and resolves modules as URLs, throwing for bare specifier names (eg `import 'lodash'`) like the native module loader.
* Loads System.register modules.
* Core hookable extensible loader supporting [custom extensions](docs/hooks.md).

#### 2. system.js loader

The [3KB system.js loader](dist/system.min.js) loader builds on the s.js core and adds support for upcoming module specifications (currently [import maps](https://github.com/domenic/import-maps) and [WASM integration](https://github.com/WebAssembly/esm-integration) with module loading) as well as development and convenience features.

* Support for loading [bare specifier names](docs/import-maps.md) through import maps (formerly package maps, formerly map configuration), loaded via `<script type="system-importmap">` (requires a `fetch` polyfill for eg IE11).
* Includes the [global loading extra](#extras) for loading global scripts, useful for loading library dependencies traditionally loaded with script tags.
* [Tracing hooks](docs/hooks.md#trace-hooks) and [registry deletion API](docs/api.md#registry) for reloading workflows
* Supports loading WASM based on the `.wasm` file extension

#### Extras

The following [pluggable extras](dist/extras) are provided which can be dropped in with either the s.js or system.js loader:

* [AMD loading](dist/extras/amd.js) support (through `Window.define` which is created).
* [Global loading](dist/extras/global.js) support for loading global scripts and detecting the defined global as the default export. Useful for loading common library scripts from CDN like `System.import('//unpkg.com/lodash')`. _(Already included in the system.js loader build)_.
* [Named exports](dist/extras/named-exports.js) convenience extension support for global and AMD module formats (`import { x } from './global.js'` instead of `import G from './global.js'; G.x`)
* [Named register](dist/extras/named-register.js) supports `System.register('name', ...)` named bundles which can then be imported as `System.import('name')` (as well as AMD named define support)
* [Transform loader](dist/extras/transform.js) support, using fetch and eval, supporting a hookable `loader.transform`

Since all loader features are hookable, custom extensions can be easily made following the same approach as the bundled extras. See the [hooks documentation](docs/hooks.md) for more information.

For discussion, join the [Gitter Room](https://gitter.im/systemjs/systemjs).

## Installation

```
npm install systemjs
```

## Documentation

* [Import Maps](docs/import-maps.md)
* [API](docs/api.md)
* [System.register](docs/system-register.md)
* [Loader Hooks](docs/hooks.md)

## Example Usage

### Loading a System.register module

```html
<script src="system.js"></script>
<script>
  System.import('/js/main.js');
</script>
```

where `main.js` is a module available in the System.register module format.

### Bundling workflow

For an example of a bundling workflow, see the Rollup Code Splitting starter project - https://github.com/rollup/rollup-starter-code-splitting.

### Import Maps

Say `main.js` depends on loading `'lodash'`, then we can define an import map:

```html

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
<!-- SystemJS must be loaded after the import map -->
<script src="system.js"></script>
<script>
  System.import('/js/main.js');
</script>
```

### Browser transpilation

To load ES modules directly in older browsers with SystemJS we can install and use the Babel plugin:

```html
<script src="system.js"></script>
<script src="extras/transform.js"></script>
<script src="plugin-babel/dist/babel-transform.js"></script>
<script>
  // main and all its dependencies will now run through transform before loading
  System.import('/js/main.js');
</script>
```

## Compatibility with Webpack

Code-splitting builds on top of native ES modules, like Rollup offers, are an alternative to the Webpack-style chunking approach - offering a way to utilize the native module loader for loading shared and dynamic chunks instead of using a custom registry and loader as Webpack bundles include. Scope-level optimizations can be performed on ES modules when they are combined, while ensuring no duplicate code is loaded through dynamic loading and code-sharing in the module registry, using the features of the native module loader and its dynamic runtime nature.

There is currently no support for SystemJS in Webpack. If building code using the `System` global in Webpack, the following config is needed to avoid rewriting:

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

## Loader Extensions

This list can be extended to include third-party loader extensions. Feel free to [post a PR to share your work](https://github.com/systemjs/systemjs/edit/3.0/README.md).

* [transform-babel](https://github.com/systemjs/systemjs-transform-babel) Supports ES module transformation into System.register with Babel.
* [json-plugin](https://github.com/Jamaks/systemjs2-json-plugin) JSON loader plugin

## How is SystemJS related to jspm.io?

SystemJS was initially developed as a universal module loader alongside jspm which provides a package manager and ES module CDN exploring native ES module workflows. SystemJS was the core loader enabling this experimentation of workflows from unbuilt development loading in browsers to production and CDN loading of ES modules.

SystemJS is now used as the legacy loader for backwards compatibility in older browsers for jspm.io. All npm packages are available for loading in SystemJS through `https://system-dev.jspm.io/[packagename]` and `https://system-unsafe-production.jspm.io/[packagename]` where they are transformed from CommonJS into the System module format with their package resolutions inlined for usage in all browsers. This CDN can be useful in sandboxes or dev workflows, but note it is not optimized for production loading.

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
