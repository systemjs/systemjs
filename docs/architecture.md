SystemJS Architectural Overview
---

To explain the architecture of SystemJS, requires first understanding [how ES modules load in the browser](#How-ES-Modules-Load-in-the-Browser), [what the module loader is](#What-is-the-ModuleLoader),
and [why you might want to use it](#Why-use-a-Module-Loader).

The heart of the module loader architecture is the [module registry](#Module-Registry). Around this module registry the module loader exposes a 
[dynamic loading API](#Dynamic-Loading-API) for loading new modules into the page on-demand.

These registry and loader API features are all provided by the in-progress [WhatWG module loader specification](https://github.com/whatwg/loader).
This module loader is not yet implemented in any implementations so we use a [polyfill for this loader](http://github.com/ModuleLoader/es6-module-loader).
The process of moving from a polyfill for a specification, to using the actual specification may not be a smooth API transition, so SystemJS
is also designed to cushion the [transition into a native module loader](#the-transition-to-a-native-loader).

SystemJS then provides on top of this polyfill a specific module [resolution algorithm](#SystemJS-Resolution-Algorithm), 
[loading mechanisms](#SystemJS-Loading-Mechanisms) and custom [API methods](#SystemJS-API-Methods) to enable loading existing modules for compatibility, 
and to support common use-cases.

## How ES Modules Load in the Browser

The simplest way to load a module in the browser is through the soon-to-be-implemented module tag, which works very similarly to a script tag
but with support for module syntax:

```html
<script type="module">
  import $ from 'https://code.jquery.com/jquery-2.2.0.min.js';
  $(document.body).html('hello world');
</script>
```

or

```html
<script type="module" src="./hello-world.js"></script>
```

The browser will first load all the module's dependencies before executing its dependencies, and then finally executing the module itself.

When importing a module, the module specifier (`https://code.jquery.com/jquery-2.2.0.min.js` and `./hello-world.js` above) is resolved just like a URL.

## What is the Module Loader?

The module loader is a [draft specification](http://github.com/whatwg/loader) providing an API for loading modules into the page dynamically 
after the initial page load (avoiding having to manually inject a `<script type="module">` tag into the page).

But more importantly, the module loader provides an API to hook into the registry, resolution and loading pipeline of modules.

The module loader is based on the principles of the [Extensible Web Manifesto](https://extensiblewebmanifesto.org/).
By opening up the module loading primitives to allow developers deeper control over the module loading process, provides developers with
the full flexibility to solve the difficult problems that come up as part of handling dynamic module loading in the browser, and enables
the creation of truly modular applications.

If all we had was the ability to load modules from URLs, we would need to hard-code versioned paths into our URLs, we wouldn't be able to 
hook into the loading lifecycle to load other resources or module formats through the module pipeline including CommonJS, AMD or existing global modules,
code from bundles, or provide hints for network optimizations.

SystemJS is a project providing an end-user solution based on the possibilities of these new module loader primitives.

## Why use a Module Loader?

_Most web applications today don't need or use a module loader in the browser, so why should we use one?_

Typically a site will load all the scripts for a page upfront, and then allow the JavaScript interactivity to take over from there once this initial load has completed.

It inevitably comes up after a while of doing this that you don't want to load every single piece of code that the application will need on page load as it becomes
a performance concern. Rather you want to just load the code needed to display the first interactions to the user. Then as the user interacts with the page, you can
load new code as it is needed only.

This is very much the case for SPAs, where each route of the app will have its own code that should be loaded only when navigating to that route, without reloading the full page.

The solution to handling any type of deferred dynamic loading like this is exactly to use a module loader.

_If code-splitting workflows run without a module loader, why should we use a module loader?_

Whenever any new chunk of code is loaded after the initial page load, this is already module loading in some form.
The important point to bear in mind is that when loading new code into the page, we don't want to reload any code we've already loaded. That is, shared modules like Lodash
should not have to be loaded again when our second route in the app also requires it.

The module loader provides us with a shared registry that will store Lodash for use by all future code within the current page, and it will also allow us to 
load the new code through the dynamic loading API.

Current code-splitting techniques use exactly the same principle, but do not utilize the concept of a shared module loader registry to manage the code splitting.
It really comes down to the difference between using a standards-based approach of a module loader registry, or using a custom registry here. Either way you're effectively
using a registry and loader.

SystemJS aims to provide a path to standardized module workflows around these techniques, in order to build modular apps on a standardized future.

_Why use a dynamic module loader if you don't expect to need any dynamic module loading?_

The stance of SystemJS is that dynamic loading of modules forms the general case for code linking in the browser.

If we can write our code based on this general workflow, and solve the many scenarios and use cases for module loading based on this general case, then we can always
optimize our code later for upfront loading through bundling or even building through [Rollup](http://rollupjs.org) naturally in SystemJS Builder at any point later on.

By writing our code based on standards and conventions for the most general linking scenario, we allow the greatest flexibility.
It ensures that any module loading problem solved for this scenario can be solved in all scenarios.
You never know when a piece of code from that simple demo might evolve into something you want to dynamically load in your next SPA project.

The additional benefit of this approach is that when all modules in the workflow support dynamic loading,
it is possible to move the entire development workflow itself into the browser.
This can be useful for easy prototyping workflows and to help lower the barriers to entry into web development as well.

## Module Registry

The heart of the module loader is the module registry. The module registry stores a map of module names to _Module Namespace_ objects.

> The _Module Namespace_ object is the same module namespace [defined by the ES6 modules specification]((https://tc39.github.io/ecma262/#sec-module-namespace-exotic-objects)).
This is the object (`M`) you get when writing `import * as M from 'some-module'`.

Every single module that is loaded in the browser will have a module namespace entry in this module registry. Even when a module is loaded with a script tag in the page via:

```html
<script type="module" src="/some/module.js"></script>
```

It will get registered into this shared registry with the module loader, under its absolute URL - `https://www.site.com/some/module.js`.

When two modules reference the same module as a dependency, the registry allows modules to share that same dependency by effectively referencing the same
_Module Namespace_ object.

The loader specification also comes with some methods for inspecting, and manipulating the registry map directly to enable certain use cases
such as hot-reloading which involves removing and updating modules from the registry.

## The Transition to a Native Loader

_The current module loader specification is still not yet stable, so how can we build and run production apps on top of it?_

The approach SystemJS takes to this problem is to follow the spec in delayed breaking upgrades. Ideally the path to a native loader should
be possible in just a couple of small breaking changes like this. In line with this, we don't immediately upgrade SystemJS to track each small change in the
module loader specification, rather we only release major updates when it is deemed that the spec has reached a point of stability by tracking
the specification work very closely.

For example, we still use an older polyfill implementation for the specification, while 
[working on the latest specification work in a separate branch](https://github.com/ModuleLoader/es6-module-loader/tree/1.0). This allows SystemJS
itself to be a stable production-ready project providing a slow major upgrade path like any other project, towards spec alignment.

The other thing to be careful of is that the polyfill itself does not interfere with the native loader when it lands in browsers.

While SystemJS defines the `System` global it is recommended to use `SystemJS.import` for API calls as we can guarantee that this global name
will not clash and conflict with the native loader when it is implemented on the `System` global in future.

## SystemJS Resolution Algorithm

_Everything described up until this point relates to the native module loader specification. Now we can explain the design decisions in SystemJS itself._

The core of SystemJS its [resolution algorithm](resolution-algorithm.md). Previously we noted that the module specifiers as resolved like URLs, 
so how can SystemJS have its own resolution algorithm on top of this existing URL resolution?

The resolution algorithm can be considered an extension of URL resolution. The module specification is designed to enable this.
For example, the `<script type="module">` tag currently treats names without any URL syntax
(`./x`, `/x`, `//x` and `https://x` can all be considered to use URL syntax), as special _plain names_.

These plain names (`import 'x'`) are reserved in the resolution to allow a custom resolution to be defined.

The SystemJS resolution algorithm is inspired by the work of previous AMD loaders, and in particular RequireJS, to provide an extension of URL
normalization that can cater to a wide variety of module resolution use cases.

Unlike running traditional module resolution on a filesystem, module resolution in the browser is constrained by latency. The standard technique
for looking up a custom name like `import _ from 'lodash'` would be to run through a series of local folder paths which may contain the module, or to
run through a hierarchy of folders. In the browser this would result in many requests back and fourth which would not be good for user experience due to the delay.

AMD loaders solved this problem by using a feature called map configuration. It involves providing configuration to the loader at startup that
tells the loader where to find the module:

```javascript
SystemJS.config({
  map: {
    lodash: 'https://path/to/lodash.js'
  }
});
```

The map target above could also have been a relative URL, but note that even through the SystemJS custom resolution, all specifiers resolve into
a URL when it goes into the module registry.

The SystemJS configuration options which affect resolution are `map`, `paths`, `packages` and `packageConfigPaths`.

[Read further here for the full description of the SystemJS resolution algorithm](resolution-algorithm.md).

There is one other feature that affects resolution and that is [conditional loading](conditional-loading.md). SystemJS comes with a comprehensive
system for various conditional loading scenarios to enable the branching of code trees between environment variations. 
This is designed to cater to workflows from internationalization to cross-platform code differences, but is a purely optional feature of the project.

_What if I don't like the way SystemJS resolves modules?_

That is a completely valid viewpoint, and the resolution system is a design decision in SystemJS. Resolution edge cases are welcome to be discussed in the issue queue. 
If you think another resolution algorithm entirely is preferable, then that would be a motivation to look at another project or approach.

## SystemJS Loading Mechanisms

With the resolution algorithm in place, the remaining configuration features of SystemJS focus on telling SystemJS
how to load a given module once it has been resolved to a URL.

The goals here in designing SystemJS were:

1. As far as possible SystemJS should be able to automatically determine the correct configuration to load a given module,
   and this configuration should be fully exposed to the user for manually specifying how to load the module.
2. It should be possible to load any existing module through SystemJS without having to modify the original source code.
3. Any custom resource should be possible to load through SystemJS via a plugin system.
4. SystemJS should work as a performant production loader, supporting configuration of
   the optimimum network profile and loading code from bundles.
5. SystemJS should enable modular package configuration o avoid the complexity that comes
   with scaling the loader configuration for large code-bases and shared libraries.

### 1. Module Configuration

To support the various ways of loading a module, each module needs the ability to be individually configured.

In order to enable these features, SystemJS uses a meta configuration system which associates meta configuration with each individual module load.

For example, all modules in a specific path can have their module format configured:

```javascript
SystemJS.config({
  meta: {
    'app/*': {
      format: 'cjs'
    }
  }
});
```

In the above, we say that all modules within an import path of `import 'app/...'` should be loaded as CommonJS modules.

When setting the configuration, SystemJS normalizes this meta configuration into URLs like in the module registry, so that the configuration
SystemJS stores becomes `'https://site.com/base/app/*': { 'format': 'cjs' }`.

The default module format for all modules in SystemJS is `format: 'detect'` which does source-based detection of the module.

The full list of meta configuration options is provided at the [config API section](config-api.md#meta).

### 2. Module Format Support

There are four different formats in JavaScript that code can be written as - ES Modules, CommonJS, AMD or a global.
In supporting all of these SystemJS supports one other format, System.register, which is a module format that was created
as a compile-to-format for ES modules to run with the exact same specified semantics for circular references and live bindings
but in all browsers today. Like AMD, System.register works as a fully CSP-compatible module format as well.

> In future [wasm](https://en.wikipedia.org/wiki/WebAssembly) support may be provided by this same module format configuration option.

#### Format Detection

If every module loaded by SystemJS required the user to first indicate which of these formats it was, that would add significant
friction to the development process so the first problem is to create a simple detection approach that is both performant and useful.

Module format detection is not possible to be perfectly accurate, but SystemJS applies a detection algorithm that works as a 
good heuristic and reliably matches the user intent in the majority of cases. This exact process is is based on regular expression detections
of the source code itself and is described in more detail in the [module formats section](module-formats.md#module-format-detection).

Module format detection does not actually need to be used at all though, ideally setting the module format through SystemJS configuration 
is the better approach, but this is a convenience tradeoff given to the user to make.

#### Format Interpretation

Once SystemJS knows what module format a module should be treated as, SystemJS then provides the module loading support for the given format.

By default the evaluation method used by SystemJS uses XHR to load the source text and then eval for execution. By having the original source
code as text SystemJS can apply format detection, and then also modify the source text before execution which is necessary for certain module
format support features. For example, in NodeJS, when you execute a CommonJS module, NodeJS implicitly wraps that module with a wrapper looking something like:

```javascript
(function(require, exports, module) {
  ...module code...
})(thisRequire, thisExports, thisModule);
```

Using this same type of source code transformation in SystemJS is what enables us to load CommonJS modules directly in the browser.

For further details on the exact format support features and options for each of the module formats, see the [module formats section](module-formats.md#es-modules).

#### CSP Support

There are certain features that are lost when using XHR and eval over script tags:

1. When loading code from external servers, this requires the `Allow-control-allow-origin: '*'` 
  header to be set, which isn't required when injecting `<script src="...">` tags directly into the head of the browser.
2. Using a Content Security Policy will typically disable the use of eval stopping SystemJS from working.
3. There is no longer the ability to use [Sub-Resource Integrity](https://developer.mozilla.org/en-US/docs/Web/Security/Subresource_Integrity) verification.

From a conceptual viewpoint, the above are given allowance by virtue of the fact that the module loader specification itself
effectively makes these assumptions. The ability to set a translate hook in the loader as provided by the specification
is already equivalent to inline eval permissions.

For practical purposes, SystemJS provides configuration options to support all of the above features:

* Setting `scriptLoad: true` metadata for a module will switch SystemJS to use `<script src>` tag injection for fetching and execution.
  This is only supported for the non source-modifying formats - AMD, global (without defined exports or global dependencies) and 
  System.register modules or bundles.
* SystemJS comes with a build variation, System-CSP-Production, which is effectively a version of the loader with `scriptLoad: true`
  as the only loading option and all the source modification features removed for a slightly smaller build size.
* Setting `nonce: 'asdf'` metadata for modules allows the use of CSP nonces. SystemJS will then use XHR with `<script>` tag source text injection setting 
  allowing for CSP support while still supporting source text rewriting.
* When setting `integrity: 'sha384-...'` SystemJS will use `<script>` tag source text injection like with nonces above, but supporting Sub-Resource Integrity verification.
  The integrity hash is based on the modified source, not the original source (if there was modification) for this to validate correctly.

In addition, SystemJS builder provides the ability to run the compilation process that SystemJS does in the browser, but as a precompilation. This is available
through `builder.compile('moduleName')`, and supports all module formats and features. In this way any module can be pre-compiled into a format that
supports the `scriptLoad: true` feature directly or for loading through the System-CSP-Production build for full CSP and cross-origin support.

The output of compilation is anonymous modules of the form:

```javascript
System.register([], function(_export) {
  ...
});
```

for ES modules, or for CommonJS and globals,

```javascript
System.registerDynamic([], true, function(require, exports, module) {
  ...
});
```

There can only be one of these _anonymous_ registration statements in a given module file.

### 3. Production Workflows

The standard implementation of module loading in browsers, by the spec, has a natural performance bottleneck and that is the module latency problem.

Consider loading a module `x.js` that has a dependency on `y.js` that in turn has a dependency on `z.js`.
The browser will first load x, discover the dependency on y and then load y, before discovering the dependency on z.
In this way, z is only loaded after two times the latency to the server. That is, due to this tiered discovery process, 
we have capped the load time for any module by n times latency, where n is the tree depth of its dependency tree.

For a production application this seems at first sight to make modules as designed in the spec completely unusable.

There are two ways SystemJS solves this problem: using a `depCache` or using `bundles`. Both approaches are made possible
by the lifecycle hooks offered by the loader specification.

depCache solves this dependency discovery problem by simply caching the dependency tree upfront through SystemJS configuration.

In the example above with loading `x.js`, the depCache would look like:

```javascript
SystemJS.config({
  depCache: {
    'x.js': ['y.js'],
    'y.js': ['z.js']
  }
});
```

In this way, as soon as I request `SystemJS.import('x.js')`, SystemJS immediately triggers that it has a depCache and starts preloading `y.js` and in turn `z.js` as well,
solving the latency problem.

Bundles provide a traditional multiplexing of the JS modules into a single file, just like you would get with Browserify or Webpack
but designed to populate the module loader registry and supporting all SystemJS module configuration features instead of a custom registry system.

This uses named System.register statements in the file to define and cache modules into the registry, of the form:

```javascript
System.register('x.js', ['y.js'], function(_export) {
  ...
});

System.register('y.js', ...)

...
```

Read more on these techniques at the [production workflows documentation page](production-workflows.md).

### 4. Plugin System

It can be really useful to be able to load other resources such as JSON, templates or even something like [CSS modules](https://github.com/css-modules/css-modules)
through the same module syntax and resolution algorithm as JavaScript modules. 
Sharing the resolution algorithm for these other resources allows them to be fully encapsulated for portability in the same way modules provide for JavaScript.

Configuring a plugin is done through meta configuration. For example to load all `.hbs` files in our app code as Handlebars templates, we can write:

```javascript
SystemJS.config({
  meta: {
    'app/*.hbs': {
      loader: 'handlebars'
    }
  }
})
```

The loader reference references the Handlebars plugin, which is itself imported via `SystemJS.import('handlebars')` just like any other module.

Because the metadata for a module is extensible, plugins can also define their own metadata options for compiling modules. Plugins also build through
SystemJS builder just like any other module, providing their compilation as part of bundling.

To read about the [plugin API for creating plugins at the documentation page](creating-plugins.md).

### 5. Package Configuration

With all of the configuration options SystemJS provides, the final problem is that this configuration system itself does not scale.

If I want to load packages from many different third-party sources, coupled with my own code, adding a separate `meta` configuration entry
for each change quickly turns into a maintenance problem.

The problem here is that we really need a configuration system that is itself modular and portable.

SystemJS provides this through _package configuration_.

Package configuration treats a folder as a package, which can then have all the configuration for all the modules within that package folder coupled together
into a single configuration object.

For example, if all my local application code is contained in the `app/` folder, I can create a package config for it:

```javascript
SystemJS.config({
  packages: {
    'app': {
      format: 'cjs',
      main: 'index.js',
      meta: {
        '*.hbs': {
          loader: 'handlebars'
        }
      },
      map: {
        lodash: 'https://cdnjs.cloudflare.com/ajax/libs/lodash.js/4.3.0/lodash.js',
        handlebars: 'path/to/handlebars-plugin.js'
      }
    }
  }
});
```

In this way, I've grouped all my configuration into one place, and ensured it is not at all mixed up with configurations for other
third-party packages.

If we don't want to manually be copying and pasting and maintaining these configurations in a single configuration file, 
we can load these package configurations themselves as JSON module files.

This package configuration for my app can then be stored in its own JSON file at `app/systemjs.json`, and we use the `packageConfigPaths` configuration
option to load this package configuration on-demand:

```javascript
SystemJS.config({
  packageConfigPaths: ['app/systemjs.json']
});
```

With the above an import to `SystemJS.import('app')` or `SystemJS.import('app/template.hbs') will detect this is a request into the package, 
and first dynamically load the package configuration itself,
before continuing the module resolution and loading process. When using SystemJS builder, this package configuration then builds correctly into the bundle like another module.

This provides support for modular configuration through package management workflows, 
without needing to store all packages configurations in the central configuration file, as is used by [jspm](http://jspm.io/).

Read more on [packages configuration](config-api.md#packages) or [packageConfigPaths configuration](config-api.md#packageconfigpaths) at the config API documentation page.