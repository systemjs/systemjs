## System.register

### What it is

System.register can be considered as a new module format designed to support the exact semantics of ES6 modules within ES5.

This format provides support for:

* Dynamic `import()`
* `import.meta`, including `import.meta.url` and `import.meta.resolve`
* Top-level await
* Live bindings updates, including through reexports, star exports and namespace imports, and any combination of these
* Circular references including function hoisting (where functions in non-executed modules can be used in circular reference cases)

By ensuring we cover all of these semantics, the guarantee is that if code works in browsers in ES modules, the associated
System.register code can work with s.js providing a legacy fallback workflow that doesn't randomly break at semantic edge cases.

This format was originally developed out of collaboration in Traceur, and is supported as an output in Babel, TypeScript, Webpack, and RollupJS.

**This module format is optimized for semantic equivalence, security and performance.**

The general structure of the format is the following:

```js
System.register(['dependency'], function (_export, _context) {
  var dep;
  return {
    setters: [function (_dep) {
      dep = _dep;
    }],
    execute: function () {
      _export({
        name: 'value'
      });
    }
  };
});
```

A global callback is used to fully support CSP policies in browsers.

Setters are used over getters to push live bindings since despite being more verbose they offer better runtime performance and
better handle circularity cases without deadlock.

#### Dynamic Import

The `_context` object contains `_context.import` function corresponding to the contextual dynamic import for the module.

Any `import()` in an ES module can thus be replaced by `_context.import()` to get a semantically identical behaviour for System modules.

### import.meta

The `_context` object contains a `_context.meta` allowing any use of `import.meta` in the ES module to be converted into a `_context.meta` in the System module for semantic equivalence.

#### import.meta.url: String

`_context.meta.url` provides the full URL to the current module as a String.

This is useful for referencing assets by URL in a way that is supported in many modules environments:

```js
const assetUrl = new URL('./asset.ext', import.meta.url);
```

#### import.meta.resolve: (id, parentUrl?) => Promise<String>

> `import.meta.resolve` currently has no specification or browser implementation and may still change.

`_context.meta.resolve` implements `import.meta.resolve` similarly to Node.js.

This can be used to resolve import map resolutions or assets:

```js
const resolvedDep = await import.meta.resolve('dep');
const localAsset = await import.meta.resolve('./asset.ext');
const depPath = await import.meta.resolve('dep/');
```

#### Top-level await

Top-level await can be supported by returning a Promise from the `execute` function or making `execute` an asynchronous function.

This can fully support synchronous subgraph execution remaining synchronous while also allowing the runtime to support the exact loading semantics desired. Currently SystemJS supports variant B of the spec.

### Format Definition

The module wrapper takes the following structure:

```js
System.register([...deps...], function (_export, _context) {
  return {
    setters: [...setters...],
    execute: function () {

    }
  };
});
```

where:

* `deps: String[]` - The array of module dependency strings, unresolved.
* `setters: Function[]` - The array of functions to be called whenever one of the bindings of a dependency is updated. It is indexed in the same order as `deps`. Setter functions can be undefined for dependencies that have no exports.
* `execute: Function` - This is called at the exact point of code execution, while the outer wrapper is called early, allowing the wrapper to export function declarations before execution.
* `execute: AsyncFunction` - If using an asynchronous function for execute, top-level await execution support semantics are provided following [variant B of the specification](https://github.com/tc39/proposal-top-level-await#variant-b-top-level-await-does-not-block-sibling-execution).
* `_export: (name: String, value: any) => value` - The direct form of the export function can be used to export bindings - `_export('exportName', value)`. It returns the set value for ease of use in expressions.
* `_export: ({ [name: String]: any }) => value` - The bulk form of the export function allows setting an object of exports. This is not just sugar, but improves performance by calling fewer setter functions when used, so should be used whenever possible by implementations over the direct export form.
* `_context.meta: Object` - This is an object representing the value of `import.meta` for a module execution. By default it will have `import.meta.url` present in SystemJS.
* `_context.import: (id: String) => Promise<Module>` This is the contextual dynamic import function available to the module as the replacement for `import()`.

> Note as of SystemJS 2.0 support for named `System.register(name, deps, declare)` is no longer supported, as instead code optimization approaches that combine modules
  like with [Rollup's code-splitting workflows](https://rollupjs.org/guide/en#experimental-code-splitting) are recommended instead.

#### Why the System.register name

Since `System` is the loader name, `System.register` is a function that allows us to _define_ a module directly into the loader instance. When code is executed, we only need to assume that `System` is in the scope of execution.

The advantage is the same as the AMD `define` in that it can support browsers with CSP policies that do not support custom JS evaluation, only script tags from authorized hosts.

### Semantic Cases

For an example of how this format can be used to deal with semantics, consider the following ES module code and its associated transform:

```js
import { p as q } from './dep';

var s = 'local';

export function func() {
  return q;
}

export class C {
}
```

->

```js
System.register(['./dep'], function($__export, $__moduleContext) {
  var s, C, q;
  function func() {
    return q;
  }
  $__export('func', func);
  return {
    setters: [
    // every time a dependency updates an export, 
    // this function is called to update the local binding
    // the setter array matches up with the dependency array above
    function(m) {
      q = m.p;
    }
    ],
    execute: function() {
      // use the export function to update the exports of this module
      s = 'local';
      $__export('C', C = $traceurRuntime.createClass(...));
    }
  };
});
```

Initial exports and changes to exports are pushed through the setter function, `$__export`. Values of dependencies and 
changes to dependency bindings are set through the dependency setters, `setters`, corresponding to the `$__export` calls of dependencies.

Functions and variables get hoisted into the declaration scope. This outer function sets up all the bindings, 
and the execution is entirely separated from this process. Hoisted functions are immediately exported. 
All of the modules in the tree first run this first function setting up all the bindings. 
Then we separately run all the execution functions left to right from the bottom of the tree ending at circular references.

In this way we get the live binding and circular reference support exactly as expected by the spec, 
while supporting ES3 environments for the module syntax conversion.

#### Deferred Execution

The use of `return { setters: ..., execute: ... }` is done instead of direct execution to allow bindings to be fully propogated
through the module tree before running execution functions. This separation of setting up bindings, and then running execution
allows us to match the exact ES module execution semantics.

This enables supporting the edge cases of for example:

a.js
```javascript
import {b} from './b.js';
export function a() {
  b();
}
```

b.js
```javascript
import {a} from './a.js';
export function b() {
  console.log('b');
}
a();
```

If a.js is imported first, then b.js will execute first. In ES module execution, b.js will successfully call the function export 
from a.js before a.js has even executed since function bindings are setup before execution. This is supported fully by 
the deferred loading step in this System.register approach.

It can be argued that this full support of ES module circular references is unnecessary. There is minimal additional performance
cost to this extra return statement though and it ensures that during the transition period where ES modules and traditional
environments are running side-by-side, that the best parity is provided between the systems.

#### Let and Uninitialized Bindings

Due to the hoisting of variable declarations into the outer scope, it is assumed that `let` or `const` should be converted into `var` statements. While TDZ errors are not maintained (it is possible to set a variable before it is declared), the primary goal of the module format is that functional ES module code should be fully supported through System.register, and the converse that functional System.register code be functional ES module code is not a requirement of the format. As such, since functional ES module code should not have to rely on top-level TDZ errors for normal operation, this seems a suitable compromise for the format.

Top-level bindings that are uninitialized should still be exported with undefined values to ensure they contribute the module shape.

For example:

```js
export let x;
export function p () {
  x = 10;
}
```

Could be written:

```js
  System.register([], function($__export, $__moduleContext) {
    var x;
    function p() {
      x = 10;
    }
    $__export({
      x: undefined,
      p: p
    });
    return {
      // setters: [], // (setters can be optional when empty)
      execute: function() {
      }
    };
  });
```

Although in the case of not having any dependencies, it could be equally valid to omit hoisting entirely.
