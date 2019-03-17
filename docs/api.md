## SystemJS API

### Core API (s.js & system.js)

#### System.constructor
Type: `Function`

This represents the System base class, which can be extended or reinstantiated to create a custom System instance.

Example:

```js
  var clonedSystem = new System.constructor();
  clonedSystem.import('x'); // imports in a custom context
```

#### System.import(id [, parentURL]) -> Promise(Module)
Type: `Function`

Loads a module by name taking an optional normalized parent URL argument.

Promise resolves to the ES module namespace value.

_Note: If provided, `parentURL` must be a valid URL, or URL resolution may break._

#### System.register(deps, declare)
Type: `Function`

Declaration function for defining modules of the `System.register` polyfill module format.

[Read more on the format at the loader polyfill page](system-register.md)

_Note: Named System.register is not supported, only anonymous definitions._

#### System.resolve(id [, parentURL]) -> Promise(string)
Type: `Function`

Resolves a module specifier relative to an optional parent URL, returning the resolved URL.

### Registry API (system.js only)

#### System.delete(id) -> Boolean
Type: `Function`

Deletes a module from the registry by ID.

Returns true if the module was found in the registry before deletion.

```js
System.delete('http://site.com/normalized/module/name.js');
```

#### System.get(id) -> Module
Type: `Function`

Retrieve a loaded module from the registry by ID.

```js
System.get('http://site.com/normalized/module/name.js').exportedFunction();
```

Module records with an error state will return `null`.

#### System.has(id) -> Boolean
Type: `Function`

Determine if a given ID is available in the loader registry.

Module records that have an error state in the registry still return `true`,
while module records with in-progress loads will return `false`.

```js
System.has('http://site.com/normalized/module/name.js');
```

#### System.set(id, module) -> Module
Type: `Function`

Sets a module in the registry by ID.

```js
System.set('http://site.com/normalized/module/name.js', {
  exportedFunction: value
});
```

`module` is an object of names to set as the named exports.

If `module` is an existing Module Namespace, it will be used by reference.
