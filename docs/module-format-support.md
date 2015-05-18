### Format Detection

When loading from CommonJS, AMD or globals, SystemJS will detect the format automatically.

Any module type can be loaded from any other type thanks to [zebra-striping](https://github.com/ModuleLoader/es6-module-loader/wiki/Circular-References-&-Bindings#zebra-striping).

When loading CommonJS, AMD or globals from ES6, use the `default` import syntax:

app/es6-loading-commonjs:
```javascript
import _ from './underscore';
```

Where underscore.js is located in the same folder.

To skip format detection and enforce interpretation of a module as a specific format, use [meta configuration](meta.md).

This means either including `"format es6";` at the top of the script, or writing `System.meta['normalized/module/name'] = { format: 'es6' }`.

The name of each format for the above usage is included in brackets for each section below.

### CommonJS (cjs)

* The `module`, `exports`, `require`, `global`, `__dirname` and `__filename` variables are all provided.
* `module.id` is set.

For comprehensive handling of NodeJS modules, a conversion process is needed to make them SystemJS-compatible, such as the one used by jspm.

### AMD (amd)

* AMD support includes all AMD structural variations including the [CommonJS wrapper form](http://requirejs.org/docs/api.html#cjsmodule).
* The special `module`, `exports`, and `require` module names are handled at the AMD format level and are not defined in the primary loader registry. `module.uri` and `module.id` are provided with `module.config` as a no-op.
* Named defines are supported and will write directly into the loader registry.
* A single named define will write into the loader registry but also be treated as the value of the module loaded if the names do not match. This enables loading a module containing `define('jquery', ...`.

#### RequireJS Support

To use SystemJS side-by-side in a RequireJS project, make sure to include RequireJS after ES6 Module Loader but before SystemJS.

Conversely, to have SystemJS provide a RequireJS-like API in an application set:

```javascript
window.define = System.amdDefine;
window.require = window.requirejs = System.amdRequire;
```

`require.config` is supported only as a no-op.

### Globals (global)

When a module is loaded as a global, it is allowed to write the the environment global, and then the global object is detected automatically from the change in the environment global properties:

app/sample-global.js
```javascript
  hello = 'world';
```

```javascript
  System.import('app/sample-global').then(function(m) {
    m == 'world';
  });
```

The global is then re-written back to the window before executing any dependencies, allowing for multi-version global module support.

The global is still left defined, as there are some closures that require asynchronous access to the global name that can't be scoped. An explicit global shimming to avoid this is in progress - https://github.com/systemjs/systemjs/issues/148.

When multiple global properties are detected, the module object becomes the collection of those objects:

app/multi-global.js
```javascript
  first = 'global1';
  var second = 'global2';
```

```javascript
System.import('app/multi-global').then(function(m) {
  m.first == 'global1';
  m.second == 'global2';
});
```

Global dependencies can be specified with the `deps` [meta config](#meta-configuration):

app/another-global.js
```javascript
  $(document).fn();
  this.is = 'a global dependent on jQuery';
```

```javascript
  System.meta['app/another-global'] = { deps: ['jquery'] };
```

Note that the name used in `System.meta` must be the fully normalized name that is returned by `Promise.resolve(System.normalize('module-name')).then(console.log.bind(console))`.

The `exports` meta config can also be set (using inline meta as an example):

app/more-global.js
```javascript
  "format global";
  "deps jquery";
  "exports my.export";

  (function(global) {
    global.my = {
      export: 'value'
    };
    $(document).fn();
  })(typeof window != 'undefined' ? window : global);
```

There is also supports for the `init` function meta config just like RequireJS as well.

#### IE8 Support

In IE8, automatic global detection does not work for globals declared as variables or implicitly:

```javascript
  var someGlobal = 'IE8 wont detect this';
  anotherGlobal = 'unless using an explicit shim';
```

IF IE8 support is needed, these exports will need to be declared manually with configuration.