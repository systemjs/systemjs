## Loader Hooks

### Hooking the Loader

The loader is designed to be hookable in a very light-weight way using only function extensions.

The standard pattern for this is:

```js
const existingHook = System.constructor.prototype.hookName;
System.constructor.prototype.hookName = function (args) {
  return Promise.resolve(existingHook.call(this, args))
  .then(function (existingHookResult) {
    // custom hook here
    return ...;
  });
};
```

When hooking the loader it is important to pay attention to the order in which hooks will apply, and to
keep existing hooks running where they provide necessary functionality.

In addition, some hooks are Promise-based, so Promise chaining
also needs to be carefully applied only where necessary.

### Core Hooks

#### createContext(url) -> Object

Used to populate the `import.meta` for a module, available at `_context.meta` in the [System.register module format](system-register.md).

The default implementation is:

```js
System.constructor.prototype.createContext = function (url) {
  return {
    url
  };
};
```

#### getRegister() -> [deps: String[], declare: Function]

> This hook is intended for custom module format integrations only.

This function stores the last call to `System.register`, and is the companion hook for that function.

It is important that this function is synchronous, as any event loop delay would result in uncertainty over which source evaluation
resulted in this registration call.

Custom module format support like AMD support is added by hooking the AMD registration in hook.

#### resolve(id, parentUrl) -> Promise<String>

In the minimal s.js implementation, resolve is implemented as a synchronous function, so Promise.resolve should be used when extending this loader.

Resolve should return a fully-valid URL for specification compatibility, but this is not enforced.

#### onload(url, error) (sync)

_This hook is not available in the s.js minimal loader build._

For tracing functionality this is called on completion or failure of each and every module loaded into the registry.

Such tracing can be used for analysis and to clear the loader registry using the `System.delete(url)` API to enable reloading and hot reloading workflows.

### Extras Hooks

#### transform(url, source) -> Promise<String>

This hook is provided by the [transform extra](../dist/extras/transform.js).

The default implementation is a pass-through transform that returns the fetched source.

For an example of a transform see the [Babel plugin transform](https://github.com/systemjs/systemjs-transform-babel).