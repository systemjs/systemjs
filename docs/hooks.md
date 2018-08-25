## Loader Hooks

### Core Hooks

#### createContext

#### getRegister

#### onload

### Extras Hooks

#### translate

### Extending the Loader

Extensions to the loader are made by amending its prototype (`System.constructor.prototype`).

In addition to the hooks listed here, it is also possible to extend any of the [API methods of the loader](api.md) with these hooking patterns as well.

The base loader provides the initial core hooks, while extensions can also define their own hooks in the same way to provide an extensible hookable loader.

Hooks can be added via a duck-typing pattern:

```js
const systemJSPrototype = System.constructor.prototype;
const import = systemJSPrototype.import ;
systemJSPrototype.import = function (id, parentURL) {
  return Promise.resolve(import.call(this, id, parentURL))
  .then(function (module) {
    return module;
  });
}
```

where hook code could come before or after previous code, but care should be taken to ensure that the previous hook continues to run under its same original assumptions and constraints.

Note that some hooks are sync, so should not use promise resolution.