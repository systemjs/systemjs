## SystemJS API

For setting SystemJS configuration see the [Configuration API](config-api.md) page.

#### SystemJS.config
Type: `Function`

SystemJS configuration helper function. See the [Configuration API](config-api.md).

#### SystemJS.constructor
Type: `Function`

This represents the System base class, which can be extended or reinstantiated to create a custom System instance.

Example:

```javascript
  var clonedSystemJS = new SystemJS.constructor();
  clonedSystemJS.import('x'); // imports in a custom context
```

#### SystemJS.getConfig() -> Object

Returns a clone of the internal SystemJS configuration in use.

#### SystemJS.delete(moduleName) -> Boolean
Type: `Function`

Deletes a module from the registry by normalized name.
Returns true if the module was found in the registry before deletion.

```javascript
SystemJS.delete('http://site.com/normalized/module/name.js');
```

_Deprecated for `System.registry.delete(moduleName)`_

#### SystemJS.get(moduleName) -> Module
Type: `Function`

Returns a module from the registry by normalized name.

```javascript
SystemJS.get('http://site.com/normalized/module/name.js').exportedFunction();
```

_Deprecated for `System.registry.get(moduleName)`_

#### SystemJS.has(moduleName) -> Boolean
Type: `Function`

Returns whether a given module exists in the registry by normalized module name.

```javascript
if (SystemJS.has('http://site.com/normalized/module/name.js')) {
  // ...
}
```

_Deprecated for `System.registry.has(moduleName)`_

#### SystemJS.import(moduleName [, normalizedParentName]) -> Promise(Module)
Type: `Function`

Loads a module by name taking an optional normalized parent name argument.

Promise resolves to the ES module namespace value.

For loading relative to the current module, ES Modules define a `__moduleName` binding, so that:

```javascript
SystemJS.import('./local', __moduleName);
```

In CommonJS modules the above would be `module.id` instead.

This is non-standard, but covers a use case that will be provided by the spec.

#### SystemJS.isModule(Object) -> Boolean
Type: `Function`

Given any object, returns true if the object is either a SystemJS module or native JavaScript module object,
and false otherwise. Useful for interop scenarios.

#### SystemJS.newModule(Object) -> Module
Type: `Function`

Given a plain JavaScript object, return an equivalent `Module` object.

Useful when writing a custom `instantiate` hook or using `SystemJS.registry.set`.

#### SystemJS.register([name ,] deps, declare)
Type: `Function`

Declaration function for defining modules of the `System.register` polyfill module format.

[Read more on the format at the loader polyfill page](https://github.com/ModuleLoader/es6-module-loader/blob/v0.17.0/docs/system-register.md)

#### SystemJS.registerDynamic([name ,] deps, executingRequire, declare)
Type: `Function`

Companion module format to `System.register` for non-ES6 modules.

Provides a `<script>`-injection-compatible module format that any CommonJS or Global module can be converted into for CSP compatibility.

Output created by [SystemJS Builder](https://github.com/systemjs/builder) when creating bundles or self-executing bundles.

For example, the following CommonJS module:

```javascript
module.exports = require('pkg/module');
```

Can be written:

```javascript
System.registerDynamic(['pkg/module'], true, function(require, exports, module) {
  module.exports = require('pkg/module');
});
```

* `require` is a standard CommonJS-style require
* `exports` the CommonJS exports object, which is assigned to the `default` export of the module, with its own properties available as named exports.
* `module` represents the CommonJS module object, with `export` and `id` properties set.

#### SystemJS.registry

SystemJS registry object supporting:

- *`SystemJS.registry.set(resolvedKey, namespace)`*: Set a module namespace into the registry.
- *`SystemJS.registry.get(resolvedKey)`*: Get a module namespace (if any) from the registry.
- *`SystemJS.registry.has(resolvedKey)`*: Boolean indicating whether the given key is present in the registry.
- *`SystemJS.registry.delete(resolvedKey)``*: Removes the given module from the registry (if any), returning true or false.
- *`SystemJS.registry.keys`*: Function returning the keys iterator for the registry.
- *`SystemJS.registry.values`*: Function returning the values iterator for the registry.
- *`SystemJS.registry.entries`*: Function returning the entries iterator for the registry (keys and values).
- *`SystemJS.registry[Symbol.iterator]`*: In supported environments, provides registry entries iteration.

See also [SystemJS.newModule](#systemjsnewmoduleobject---module).

#### SystemJS.resolve(moduleName, [parentName]) -> Promise(string)
Type: `Function`

Resolves module name to normalized URL.

#### SystemJS.resolveSync(moduleName, [parentName]) -> string
Type: `Function`

Synchronous alternative to `SystemJS.resolve`.

#### SystemJS.set(moduleName, Module)
Type: `Function`

Sets a module into the registry directly and synchronously.

Typically used along with `SystemJS.newModule` to create a valid `Module` object:

```javascript
SystemJS.set('custom-module', SystemJS.newModule({ prop: 'value' }));
```

_Deprecated for `System.registry.set(moduleName)`_

> Note SystemJS stores all module names in the registry as normalized URLs. To be able to properly use the registry with `SystemJS.set` it is usually necessary to run `SystemJS.set(SystemJS.resolveSync('custom-module'), SystemJS.newModule({ prop: 'value' }));` to ensure that `SystemJS.import` behaves correctly.
