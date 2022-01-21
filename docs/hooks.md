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

When hooking the loader it is important to pay attention to the order in which hooks will apply, and to keep existing hooks running where they provide necessary functionality.

In addition, some hooks are Promise-based, so Promise chaining also needs to be carefully applied only where necessary.

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

#### createScript(url) -> HTMLScriptElement | Promise\<HTMLScriptElement>

When SystemJS loads a module, it creates a `<script>` tag and injects it into the head.

`createScript` allows hooking this script tag creation, will by default implement `return Object.assign(document.createElement('script'), { url, crossOrigin: 'anonymous' })`.

This allows, for example, including custom integrity or authentication attributes.

This hook could be asynchronous and you can fetch asynchronously some data and return your script tag.

Note that this hook does not apply to [module types](module-types.md), which use the default browser fetch implementation.

#### prepareImport() -> Promise

This function is called before any `System.import` or dynamic import, returning a Promise that is resolved before continuing to perform the import.

This is used in SystemJS core to ensure that import maps are loaded so that the `System.resolve` function remains synchronous.

#### instantiate(url, parentUrl) -> Promise

This function downloads and executes the code for a module. The promise must resolve with a "register" array, as described in the `getRegister` documentation.

The default system.js implementation is to append a script tag that downloads and executes the module's code, subsequently resolving the promise with the most recent register: `resolve(System.getRegister())`. [Example](https://github.com/systemjs/systemjs/blob/master/src/features/script-load.js).

#### getRegister(url) -> [deps: String[], declare: Function]

> This hook is intended for custom module format integrations only.

This function stores the last call to `System.register`, and is the companion hook for that function.

It is important that this function is synchronous, as any event loop delay would result in uncertainty over which source evaluation
resulted in this registration call.

Custom module format support like AMD support is added by hooking the AMD registration in hook.

#### resolve(id, parentUrl) -> String

In both s.js and system.js, resolve is implemented as a synchronous function.

Resolve should return a fully-valid URL for specification compatibility, but this is not enforced.

#### shouldFetch(url) -> Boolean

This hook is used to determine if a module should be loaded by adding a `<script>` tag to the page (the normal SystemJS behaviour which is the fastest and supports CSP), or if the module should be loaded by using `fetch` and `eval` instead.

When using the [module types extra](./module-types.md), this will return true for files ending in `.css`, `.json` and `.wasm`,
so that it can support these types through the fetch hook.

Setting:

```js
System.shouldFetch = function () { return true; };
```

will enforce loading all JS files through `fetch`, allowing custom fetch hook implementation behaviours.

#### fetch(url, options) -> Promise<Response>

The default fetch implementation used in SystemJS is simply `System.fetch = window.fetch`, which can be further hooked to enable
arbitrary transformation.

For an example of how to hook this behaviour, see the [module types extra source code](../src/extras/module-types.js).

#### onload(err, id, deps, isErrSource) (sync)

_This hook is not available in the s.js minimal loader build._

For tracing functionality this is called on completion or failure of each and every module loaded into the registry.

`err` is defined for any module load error at instantiation (including fetch and resolution errors), execution or dependency execution.

`deps` is available for errored modules that did not error on instantiation.

`isErrSource` is used to indicate if `id` is the error source or not.

Such tracing can be used for analysis and to clear the loader registry using the `System.delete(url)` API to enable reloading and hot reloading workflows.
