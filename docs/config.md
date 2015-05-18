### Configuration Options

Once loaded, we can set any of the loader's configuration options (listed below) in one of the following ways:

```javascript
System.config({
  optionA: {}
});
System.optionB = {};
```

#### babelOptions
Type: `Object`
Default: `{}`

Set the Babel transpiler options.

```javascript
System.config({
    babelOptions: {
    }
});
```

A list of options is available in the [Babel project documentation](https://babeljs.io/docs/usage/options/).

#### baseURL
Type: `String` 
Default: `./`

All module paths are resolved relative to `baseURL`. It defaults to the current page path.

_Ensure the `baseURL` is a path that contains all modules. Backtracking below the `baseURL` is not guaranteed to be supported in SystemJS and SystemJS Builder._

#### bundle
Type: `Object`

Bundles allow a collection of modules to be downloaded together as a package whenever any module from that collection is requested. Useful for splitting an application into sub-modules for production. Use with the [SystemJS Builder](https://github.com/systemjs/builder).

```javascript
System.bundles = {
    bundleA: ['dependencyA', 'dependencyB']  
};
```

A built bundle file must contain the exact named defines or named System.register statements for the modules it contains. Mismatched names will result in separate requests still being made.

#### depCache
Type: `Object`

An alternative to bundling. When a module specified in depCache is loaded, asynchronous loading of its listed dependencies begins. Useful for module dependencies that are ubiquitous and hosted on CDN's that you do not wish to bundle with your app.

```javascript
System.depCache['moduleA'] = ['moduleB']; // moduleA depends on moduleB
System.depCache['moduleB'] = ['moduleC']; // moduleB depends on moduleC

// when we do this import, depCache knows we also need moduleB and moduleC,
// it then directly requests those modules as well as soon as we request moduleA
System.import('moduleA')
```

Over HTTP/2 this approach may be preferable as it allows files to be individually cached in the browser meaning bundle optimizations are no longer a concern.

#### map
Type: `Object`

The map option allows you to map a module alias to its location. For example:

```javascript
System.config({
    map: {
        jquery: 'location/for/jquery'
    }
});

import $ from 'jquery';
System.import('jquery').then(function ($) {
    console.log($); // jQuery {}
});

```

You can alternatively provide a _contextual map configuration_. A contextual map configuration allows you to specify, for a particular module, which modules to use for its dependencies.

This can be used to ensure a specific version of a library, or a drop in replacement library, is used as a dependency for a module. For example:

```javascript
System.config({
    map: {
        backbone: {
            underscore: 'lodash', // Use lodash instead of underscore
            jquery: 'jquery@1.9.1' // Use legacy jquery
        }
    }
});
```

Contextual maps apply from the most specific module name match only.

Learn more [here](map-configuration.md).

#### meta
Type: `Object`
Default: `{}`

The meta option allows you to set ES6 Module Loader metadata options for modules. This option takes a key-value map from a module path to a metadata object.

```javascript
System.config({
    meta: {
        'github:angular/bower-angular@1.3.14': { // meta options for angular
            format: 'global', // options: amd, cjs, es6, global, register
            exports: 'angular', // if format === 'global', the name of the global
            deps: [
                // A list of dependencies for this module
                'jquery'
            ]
        }
    }
});
```

Learn more [here](meta.md).

#### paths *(unstable)*
Type: `Object`

_Note: This is a specification under discussion and not confirmed. This implementation will likely change. Currently, `paths` is expected to move to `sites` and drop wildcard support_

Provides aliases for locations. Similar to map, but for URI's, not modules. Currently supports wildcards.


```javascript
  System.paths['jquery'] = '//code.jquery.com/jquery-1.10.2.min.js';
  System.import('jquery').then(function($) {
    // ...
  });
```

Any reference to `jquery` in other modules will also use this same resource.

It is also possible to define wildcard paths rules. The most specific rule will be used:

```javascript
  System.paths['lodash/*'] = '/js/lodash/*.js'
  System.import('lodash/map').then(function(map) {
    // ...
  });
```

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
