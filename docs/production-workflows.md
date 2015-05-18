### Compiling Modules into a Bundle

[SystemJS builder](https://github.com/systemjs/builder) provides comprehensive support for compiling all module formats into a single bundle in a way that supports [circular references and zebra-striping](https://github.com/ModuleLoader/es6-module-loader/wiki/Circular-References-&-Bindings).

It also offers the ability to [create self-executing bundles](https://github.com/systemjs/builder#self-executing-sfx-bundles) that can run without needing SystemJS present at all by embedding a micro-loader implementation.

### DepCache

An alternative to bundling into a single bundle is to leave files as separate for loading in production.

The depcache extension allows specifying the dependencies of all modules upfront through configuration so that loads can happen in parallel.

```javascript
System.depCache['moduleA'] = ['moduleB']; // moduleA depends on moduleB
System.depCache['moduleB'] = ['moduleC']; // moduleB depends on moduleC

// when we do this import, depCache knows we also need moduleB and moduleC,
// it then directly requests those modules as well as soon as we request moduleA
System.import('moduleA')
```

Over HTTP/2 this approach may be preferable as it allows files to be individually cached in the browser meaning bundle optimizations are no longer a concern.

### Bundle Extension

It can be useful to load bundles of code on-demand instead of having them all included in the HTML page blocking the initial load.

The bundle extension will automatically download a bundle as soon as an attempt to import any module in that bundle is made.

```javascript
  // the bundle at build/core.js contains these modules
  System.bundles['build/core'] = ['jquery', 'app/app', 'app/dep', 'lib/third-party'];
  
  // when we load 'app/app' the bundle extension interrupts the loading process
  // and ensures that build/core.js is loaded first
  System.import('app/app');
  
  // this way a request to any one of 'jquery', 'app/app', 'app/dep', 'lib/third-party'
  // will delegate to the bundle and only a single request is made
```

A built file must contain the exact named defines or named `System.register` statements for the modules
it contains. Mismatched names will result in separate requests still being made.

### CSP-Compatible Production

SystemJS comes with a separate build for production only. This is fully CSP-compatible using script tag injection to load scripts, while still remaining an
extension of the ES6 Module Loader.

Replace the `system.js` file with `dist/system-csp.js`.

If we have compiled all our modules into a bundle we can do:

```html
  <script src="system-csp.js"></script>
  <script>
    System.bundles['bundle'] = ['app/main'];
    System.import('app/main').then(function(m) { 
      // loads app/main from the app-built bundle
    });
  </script>
```