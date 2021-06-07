# SystemJS Errors

This page lists the SystemJS errors that you may encounter.

## 1

### Import Map contains invalid JSON

SystemJS Error #1 occurs when you have a `<script type="systemjs-importmap"></script>` element in your HTML page that has invalid JSON content (See [import maps documentation](https://github.com/systemjs/systemjs/blob/master/docs/import-maps.md)).

A common mistake that causes this a trailing comma on the last module in the import map, which is invalid JSON.

```html
<!-- Make sure the JSON content is valid! -->
<script type="systemjs-importmap">
  {
    "imports": {
      "foo": "/foo.js",
      "bar": "/bar.js"
    }
  }
</script>
```

Note that this error also can occur for external import maps (those with `src=""` attribute). Check the network tab of your browser devtools to verify that the response body for the external import map is valid json.

## 2

### Module did not instantiate

SystemJS Error #2 occurs when a module fails to instantiate.

This occurs when the instantiate hook returns a Promise that resolves with no value. This generally occurs when a module was downloaded and executed but did not call [`System.register()`](/docs/api.md#systemregisterdeps-declare) (or `define()` for AMD modules). To fix, ensure that the module calls System.register during its initial, top-level execution.

Instantiation refers to downloading and executing the code for a module. The instantiation for a single module refers to an array that represents the module's dependencies, exports, and code.

SystemJS has various methods of instantiating modules, generally involving either a `<script>` or `fetch()`. A module should generally call [`System.register()`](/docs/api.md#systemregisterdeps-declare) during top-level execution, as the primary means of instantiating itself. Custom module instantiation can be implemented by [hooking System.instantiate](/docs/hooks.md#instantiateurl-parenturl---promise).

## 3

### Unable to load module

SystemJS Error #3 occurs when a module could not be downloaded and/or executed.

SystemJS loads modules by appending `<script>` elements to the DOM and waiting for `load` and `error` events. When error #3 is thrown, the script's `error` event fired.

Here are common reasons why a module could not be loaded:

- **The url for the module is incorrect**. You can check this by opening up the module's URL in its own browser tab and verifying that a javascript file is shown. The module URL can be found in the browser devtools (the console and network tabs), or by calling `System.resolve('name')` in the browser console to view the full URL. Be sure to check port number! Also, verify that the URL returns javascript instead of HTML.
- **The url is correct, but the web server that hosts it isn't running**. This often occurs when you're attempting to download a module from localhost, but haven't started up the web server (ie webpack-dev-server or `npm start`). Be sure to check the port number!
- **The url is correct and the web server is running, but CORS is not enabled**. [CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS) is a security mechanism that browsers use to protect users. The server you are downloading the module from may need to enable cors by sending an [`Access-Control-Allow-Origin` header](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Access-Control-Allow-Origin).
- **The url is correct, web server running, CORS enabled, but host check fails**. This one is usually specific to webpack-dev-server, which has a [host check](https://webpack.js.org/configuration/dev-server/#devserverdisablehostcheck). You should disable that host check to be able to load modules cross origin.
- **The javascript file was successfully downloaded, but failed during initial, top-level, execution**. A syntax error, errant function call, or any other javascript error that occurs during initial execution could cause the module to fail to load. This error is from within the module itself and can be found in the browser console.

## 4

### Invalid content-type header

SystemJS Error #4 occurs when SystemJS attempted to load a module with [`fetch()`](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API), but the [content-type](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Type) HTTP response header was invalid.

SystemJS uses `fetch()` instead of `<script>` to load modules whenever the [shouldFetch hook](/docs/hooks.md##shouldfetchurl---boolean) returns true. By default, this occurs only when the file extension indicates it is a [CSS, JSON, HTML, or WASM module](/docs/module-types.md).

SystemJS checks the HTTP [Response object](https://developer.mozilla.org/en-US/docs/Web/API/Response) to check the content-type header. The header must be one of the following:

- `application/javascript` (Other accepted JS MIME types include `text/javascript`)
- `application/json`
- `text/css`
- `application/wasm`

To diagnose the problem, identify which module failed to load. Then check the browser console and network tab of your devtools to find the HTTP status. In order for the module to successfully load, the status needs to be >= 200 and < 300.

## 5

### AMD require is not supported

SystemJS Error #5 occurs when you attempt to use the [AMD require() function](https://github.com/amdjs/amdjs-api/wiki/require). SystemJS supports much of AMD's core functionality, but does not currently support all of the extensions to AMD, including AMD require. This could be implemented in a custom extension for your organization, if needed.

## 6

### Named AMD modules require the named-register extra

SystemJS Error #6 occurs when you attempt to register a named AMD module, but have not included the [named-register extra](/README.md#extras).

A named AMD module is created by calling `define('name', ...)`.

To diagnose, first determine which module is the named AMD module. You can do so by checking the stacktrace in the browser console, or by placing a breakpoint in your devtools to pause on all uncaught exceptions.

A common cause of this issue is that you are using webpack's [`output.library` option](https://webpack.js.org/configuration/output/#outputlibrary) or rollup's [`output.name` option](https://rollupjs.org/guide/en/#outputname), which both result in named AMD define. If your module is being imported by SystemJS, there is no benefit to keeping the library name, and you should remove it.

Another common cause of this issue is for a third party scripts to call `define()` as part of their UMD build. Such scripts may call `define()` even when not triggered by `System.import()`, which can cause this error. In such cases, consider removing the SystemJS AMD extra entirely, so that they do not call `define()` at all.

If none of those apply to your situation, consider adding the named-register extra:

```html
<script src="https://unpkg.com/systemjs/dist/system.js"></script>
<script src="https://unpkg.com/systemjs/dist/extras/amd.js"></script>
<script src="https://unpkg.com/systemjs/dist/extras/named-register.js"></script>
```

## 7

### Failed to fetch module - wrong HTTP status

SystemJS Error #7 occurs when SystemJS attempted to load a module with [`fetch()`](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API), but the HTTP response status was not >= 200 and < 300.

This error occurs when using either the module-types or transform extras. The module-types extension is included in `system.js`, but not in `s.js`.

When using the transform extra, SystemJS uses `fetch()` to load all modules. However, when using the module-types extension (included in system.js), SystemJS uses `fetch()` instead of `<script>` to load modules whenever the [shouldFetch hook](/docs/hooks.md##shouldfetchurl---boolean) returns true. By default, this occurs only when the file extension indicates it is a [CSS, JSON, HTML, or WASM module](/docs/module-types.md).

SystemJS checks the HTTP [Response](https://developer.mozilla.org/en-US/docs/Web/API/Response) object to check if the HTTP response status is ["ok"](https://developer.mozilla.org/en-US/docs/Web/API/Response/ok), and throws Error #7 if it is not ok.

To diagnose the problem, identify which module failed to load. Then check the browser console and network tab of your devtools to find the HTTP status. In order for the module to successfully load, the status needs to be >= 200 and < 300.

## 8

### Unable to resolve bare specifier

SystemJS Error #8 occurs when you attempt to load a module that doesn't have a URL associated with it.

Bare specifiers must be defined by import maps in SystemJS. To fix the warning, add the module to your import map:

```html
<script type="systemjs-importmap">
  {
    "imports": {
      "vue": "https://unpkg.com/vue"
    }
  }
</script>
<script>
  // The "vue" specifier will now be "resolved" to https://unpkg.com/vue
  System.import('vue');
</script>
```

A "specifier" is the string name of a module. A specifier may be a URL (`/thing.js` or `https://unpkg.com/vue`) or a "bare specifier" (`vue`). Warning #W1 most commonly occurs when using bare specifiers.

"Resolution" refers to converting a specifier into a URL. This happens in any of the following scenarios:

- a module is loaded directly - `System.import('specifier')`
- a module is loaded as a dependency - `System.register(['specifier'], ...)` or `define(['specifier'], ...)`
- a module is resolved manually - `System.resolve('specifier')`

To fix this warning, you may either use [import maps](/docs/import-maps.md) or [hook System.resolve](/docs/hooks.md#resolveid-parenturl---string):

```html
<script src="/system.js"></script>
<script>
  (function () {
    const originalResolve = System.constructor.prototype.resolve;
    System.constructor.prototype.resolve = function (id) {
      try {
        return originalResolve.apply(this, arguments);
      } catch (err) {
        return otherResolution(id);
      }
    };

    function otherResolution (id) {
      return '/some-url.js';
    }
  })()
</script>
```

## 9

### Invalid call to AMD define

SystemJS Error #9 occurs when the global `define` function was called with invalid arguments.

`window.define` is a global variable available in [AMD environments](https://en.wikipedia.org/wiki/Asynchronous_module_definition), and is created by the SystemJS [amd.js extra](https://github.com/systemjs/systemjs/blob/master/dist/extras/amd.js). It is a function called by modules in AMD or UMD format.

With SystemJS, the following calls to define() are valid:

```js
// First argument is array of dependencies.
// Second argument is the execution function that
// returns the module's exports.
define(['lodash'], function(lodash) {
  return {
    myExport: 'val1'
  };
});

// First argument is array of dependencies - "exports" is a special AMD dependency.
// Second argument is the execution function that modifies the exports variable.
define(['exports'], function(exports) {
  exports.myExport = 'val1'
});

// First argument is a function. This is a shorthand for
// define([], function () {})
// Useful for modules without any dependencies.
define(function () {
  return {
    myExport: 'val1'
  };
});

// First argument is object. Each property on the object represents an exported value
// from the module.
define({
  myExport: 'val1'
});

// Including a string module name as the first argument is valid
// This is a "named define". Include the named-register.js extra
// to be able to load modules by their name.
define("my-module", [], function () {});
define("my-module", function () {});
define("my-module", {
  myExport: 'val1'
});
```

SystemJS Error #9 occurs when the arguments passed to define do not match any of the above valid patterns. For example, calling define with a string or number as its first argument is invalid:

```js
// INVALID
// A number is not a valid argument to define()
define(123);

// INVALID
// A string is not a valid argument to define()
define("asdfasdf");
```

# SystemJS Warnings

This sections lists the SystemJS warnings that you may encounter.

## W1

### Unable to resolve bare specifier

SystemJS Warning #1 occurs when there is an error resolving a bare specifier on the right hand side of an import map. See [Error #8](#8) for more detail on fixing bare specifier errors.

Import maps are fully parsed and resolved at initialization time, with validation warnings output in line with the import maps specification. Any resolution errors in the import map are displayed as validation warnings and those import map entries are then ignored in the resolution process.

## W2

### Invalid package target - should have trailing slash

SystemJS Warning #W2 occurs when an import map [trailing-slash package path mapping](https://github.com/WICG/import-maps#packages-via-trailing-slashes) on the left hand side with a trailing slash maps into a target address without a trailing slash (`/`).

Trailing slash path mappings for packages are a way of mapping any subpath of the bare module specifier within a directory, allowing for imports such as `import 'my-package/moduleA.js'` and `import 'my-package/moduleB.js'` without needing explicit entries in the import map for both modules.

```html
<!-- Valid package - the URL address ends with / -->
<script type="systemjs-importmap">
{
  "imports": {
    "foo/": "/some-url/",
  }
}
</script>

<!-- Invalid package - the URL address does not end with / -->
<script type="systemjs-importmap">
{
  "imports": {
    "foo/": "/some-url",
  }
}
</script>
```

SystemJS Warning #W2 is logged by SystemJS to implement [Step 6.1 of this part of the import maps spec](https://wicg.github.io/import-maps/#sort-and-normalize-a-specifier-map).

## W3

### ID is not a valid URL to set in the registry

SystemJS Warning #W3 occurs when you call `System.set(id, module)` with an invalid id.

The SystemJS module registry is similar to a browser's module registry, which identifies modules by URL. As such, the module id passed to System.set should be a URL, not a bare specifier. Note that you should set full URLs in the module registry, not page-relative URLs.

Setting non-URL IDs is not recommended, but can be supported by hooking the resolve function to ensure these IDs can be resolved. Typically System.resolve will always return a URL making these modules unloadable otherwise.

```js
// bare specifiers are invalid
System.set('foo', { some: 'value' });

// page-relative URLs are invalid
System.set('/foo.js', { some: 'value' });
System.set('./foo.js', { some: 'value' });

// Full urls are valid
System.set('http://example.com/foo.js', { some: 'value' });
```


## W4

### Unable to fetch external Import Map

SystemJS Warning #W4 occurs when it failed downloading an external import map via `fetch()`.

Reason for this can be a network issue (DNS failed, timeout, server down), a security restriction (CORS, CSP) or a non 2xx status code from the server providing the file.

System.js treats failing import maps as a warning. It skips the failed import map and moves on processing the next one if present.

```js
// references an unreachable import map
<script type="systemjs-importmap" src="https://hostname.invalid/importmap.json"></script>
```

## W5

### Import Map contains invalid JSON

SystemJS Warning W5 occurs when you have a `<script type="systemjs-importmap"></script>` element in your HTML page that has invalid JSON content (See [import maps documentation](https://github.com/systemjs/systemjs/blob/master/docs/import-maps.md)).

A common mistake that causes this a trailing comma on the last module in the import map, which is invalid JSON.

```html
<!-- Make sure the JSON content is valid! -->
<script type="systemjs-importmap">
  {
    "imports": {
      "foo": "/foo.js",
      "bar": "/bar.js"
    }
  }
</script>
```

Note that this error also can occur for external import maps (those with `src=""` attribute). Check the network tab of your browser devtools to verify that the response body for the external import map is valid json.

## W6

### Include named-register.js for full named define support

SystemJS Warning W6 occurs when a named [AMD module](https://en.wikipedia.org/wiki/Asynchronous_module_definition) is registered with SystemJS without having included the [SystemJS named-register.js extra](https://github.com/systemjs/systemjs/blob/master/dist/extras/named-register.js).

An AMD module is one that calls the global `define()` function to register itself as a module. A named AMD module is one that calls `define()` with a string name as its first argument.

```js
// A named AMD module called my-module-name
define('my-module-name', [], function () {});
```

If you're only using named AMD modules as part of a script loaded by System.import() that contains exactly one module, then you do not need to include the named-register.js extra. However, if named AMD modules are created separately from a System.import() call, or if there are multiple named AMD modules in the same file, then you'll need the named-register.js extra to be able to access all of the named modules.

The reason for this is that SystemJS generally identifies modules by their URLs - one URL per module. Import Maps are the primary method to alias a bare specifier to a URL, but it's also possible to identify modules by a name without specifying a URL for each module, by creating named System.register or named AMD modules.

When the SystemJS amd.js extra's `define` function is given a named AMD module, the module is identified by the URL of the currently executing script, if the script was loaded via `System.import()`. However, if the script was not loaded by `System.import()` or if there are multiple defines in the same script, then the module(s) will not have a URL associated with them and therefore will not be accessible by any identifier. To solve this problem, the named-register.js tracks all named modules (including named AMD modules and named System.register modules) by name, rather than by URL. This makes it possible to have one script that registers multiple named modules.