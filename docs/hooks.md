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

#### createScript(url) -> HTMLScriptElement

When SystemJS loads a module, it creates a `<script>` tag and injects it into the head.

`createScript` allows hooking this script tag creation, will by default implement `return Object.assign(document.createElement('script'), { url, crossOrigin: 'anonymous' })`.

This allows, for example, including custom integrity or authentication attributes.

Note that this hook does not apply to [module types](module-types.md), which use the default browser fetch implementation.

#### prepareImport() -> Promise

This function is called before any `System.import` or dynamic import, returning a Promise that is resolved before continuing to perform the import.

This is used in SystemJS core to ensure that import maps are loaded so that the `System.resolve` function remains synchronous.

#### instantiate(url, parentUrl) -> Promise

This function downloads and executes the code for a module. The promise must resolve with a "register" array, as described in the `getRegister` documentation.

The default system.js implementation is to append a script tag that downloads and executes the module's code, subsequently resolving the promise with the most recent register: `resolve(System.getRegister())`.

If you're making your own implementation of `instantiate`, you only need to resolve the Promise with the registration. Calling `getRegister()` is not necessary if you can get the registration in other ways.

If you need to hook the code fetching or transformation process (eg for supporting new file types), also see the see the [fetch hook](https://github.com/systemjs/systemjs/blob/master/docs/hooks.md#shouldfetchurl---boolean), as you may not need to change `instantiate()`.

By default, SystemJS modules are not registered by name to match ES Modules. Instead, registration of modules is done by matching a `System.register` call to its caller URL using a synchronous callback.

<details>
  <summary>Execution order (read this if you want to correctly overwrite `instantiate`)</summary>

See below for an outline of the loading lifecycle provided by this default `instantiate` implementation:

```js
var lastRegister;
systemJSPrototype.register = function (deps, declare) { lastRegister = [deps, declare] };
/* getRegister provides the last anonymous System.register call */
systemJSPrototype.getRegister = function () {
  var _lastRegister = lastRegister;
  lastRegister = undefined;
  return _lastRegister;
};
```

> app.js

```js
System.import("./library.js"); System.import("./code.js");
```

For the given app.js, the correct execution order looks like this:


```js
// Event Loop 0                                                         // lastRegister is undefined
[app.js] System.import("./library.js")
  => [system.js] System.instantiate("./library.js") => Promise_ID_0
  => ...load library.js...

// Event Loop 0                                                         // lastRegister is undefined
[app.js] System.import("./code.js")
  => [system.js] System.instantiate("./code.js") => Promise_ID_1
  => ...load code.js...

// Event Loop N                                                         // lastRegister is undefined
[library.js]: System.register(module_library)                           // lastRegister is module_library
  => [system.js]: (Notified by a callback that library.js has executed) // lastRegister is module_library
  => [system.js]: let temp = getRegister()                              // lastRegister is undefined, temp is module_library
  => [system.js]: Promise_ID_0 resolved by temp                         // lastRegister is undefined, "library.js" loaded

// Event Loop N                                                         // lastRegister is undefined
[code.js]: System.register(module_code)                                 // lastRegister is module_code
  => [system.js]: (Notified by a callback that code.js has executed)    // lastRegister is module_code
  => [system.js]: let temp = getRegister()                              // lastRegister is undefined, temp is module_code
  => [system.js]: Promise_ID_1 resolved by temp                         // lastRegister is undefined, "code.js" loaded
```

The **WRONG** execution order may look like: (ends with wrong module registered and [Module did not instantiate](https://github.com/systemjs/systemjs/blob/master/docs/errors.md#2) error).

```js
// Event Loop 0                                                     // lastRegister is undefined
[app.js] System.import("./library.js")
  => [system.js] System.instantiate("./library.js") => Promise_ID_0
  => ...load library.js...

// Event Loop 0                                                     // lastRegister is undefined
[app.js] System.import("./code.js")
  => [system.js] System.instantiate("./code.js") => Promise_ID_1
  => ...load code.js...

// Event Loop N                                                     // lastRegister is undefined
[library.js]: System.register(module_library)                       // lastRegister is module_library
[code.js]: System.register(module_code)                             // lastRegister is module_code !!! module_library has been overwrittened !!!

// Event Loop M
[system.js]: (Notified by a callback that library.js has executed)  // lastRegister is module_code
  => [system.js]: let temp = getRegister()                          // lastRegister is undefined, temp is module_code
  => [system.js]: Promise_ID_0 resolved by temp                     // lastRegister is undefined, !!! "library.js" loaded with content of "code.js" !!!

// Event Loop X
[system.js]: (Notified by a callback that code.js has executed)     // lastRegister is undefined
  => [system.js]: let temp = getRegister()                          // lastRegister is undefined, temp is undefined
  => [system.js]: throw "Module did not instantiate"
```

</details>

If in your environment it is not possible to maintain the execution order (for example, involves the interaction of multiple event loops), you can make the call to the instantiate in a sequent way (Notice: this will slow down the module loading speed if they need to loaded by the network). Here is another [example that implementing System.instantiate](https://github.com/Jack-Works/webextension-systemjs/blob/master/src/content-script.ts#L10-L26) for a speical environment that cannot use `<script>` tag.

#### getRegister() -> [deps: String[], declare: Function]

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

#### fetch(url) -> Promise<Response>

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
