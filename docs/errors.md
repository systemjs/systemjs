# SystemJS Errors

This page explains possible SystemJS errors that you may encounter.

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

### Unable to resolve specifier from Import Map

SystemJS Error #2 occurs when you attempt to load a module that doesn't have a URL associated with it.

The most common reason this error occurs in when a module is missing from your import map. To fix it, add the module to your import map:

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

For more detailed information about "specifiers" and "resolution", see Error #3.

## 3

## Cannot resolve A from B

SystemJS Error #3 occurs when you are not using import maps and attempt to load a module that doesn't have a URL associated with it.

A "specifier" is the string name of a module. A specifier may be a URL (`/thing.js` or `https://unpkg.com/vue`) or a "bare specifier" (`vue`). Error #3 most commonly occurs when using bare specifiers.

"Resolution" refers to converting a specifier into a URL. This happens in any of the following scenarios:

- a module is loaded directly - `System.import('specifier')`
- a module is loaded as a dependency - `System.register(['specifier'], ...)` or `define(['specifier'], ...)`
- a module is resolved manually - `System.resolve('specifier')`

To fix this error, you may either use [import maps](/docs/import-maps.md) or [hook System.resolve](/docs/hooks.md#resolveid-parenturl---string):

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

## 4

### Unable to load module

SystemJS Error #4 occurs when a module could not be downloaded and/or executed.

SystemJS loads modules by appending `<script>` elements to the DOM and waiting for `load` and `error` events. When error #4 is thrown, the script's `error` event fired.

Here are common reasons why a module could not be downloaded:

- **The url for the module is incorrect**. You can check this by opening up the module's URL in its own browser tab and verifying that a javascript file is shown. The module URL can be found in the browser's devtool console and network tab, or by calling `System.resolve('name')` in the browser console to view the full URL. Be sure to check port number! Also, verify that the URL returns javascript instead of HTML.
- **The url is correct, but the web server that hosts it isn't running**. This often occurs when you're attempting to download a module from localhost, but haven't started up the web server (ie webpack-dev-server or `npm start`). Be sure to check the port number!
- **The url is correct and the web server is running, but CORS is not enabled**. [CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS) is a security mechanism that browsers use to protect users. The server you are downloading the module from may need to enable cors by sending an [`Access-Control-Allow-Origin` header](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Access-Control-Allow-Origin).
- **The url is correct, web server running, CORS enabled, but host check fails**. This one is usually specific to webpack-dev-server, which has a [host check](https://webpack.js.org/configuration/dev-server/#devserverdisablehostcheck). You should disable that host check to be able to load modules cross origin.
- **The javascript file was successfully downloaded, but failed during initial execution**. A syntax error, errant function call, or any other javascript error that occurs during initial execution could cause the module to fail to load.

## 5

### Invalid import map cascading - bare specifier did not resolve

SystemJS Error #5 occurs when an import map attempts invalid cascading.

Most commonly, this error occurs through accidental attempted usage of import map cascading (details below), by specifying an invalid URL in the import map.

```html
<!-- INVALID -->
<!-- You must add ./ to relative URLs in import maps -->
<script type="systemjs-importmap">
{
  "imports": {
    "thing1": "thing.js"
  }
}
</script>

<!-- VALID -->
<script type="systemjs-importmap">
{
  "imports": {
    "thing1": "./thing.js"
  }
}
</script>
```

[Import Map cascading](https://github.com/WICG/import-maps/issues/137) is an advanced, experimental feature of systemjs import maps. With cascading, one module's URL can be derived from another's.

```html
<!-- Valid cascading -->
<script type="systemjs-importmap">
{
  "imports": {
    "foo": "/url.js",
    "bar": "foo"
  }
}
</script>

<!-- Invalid cascading, by referencing a bare specifier as a module's value, that can't be resolved -->
<!-- "foo" is not a valid URL, nor can it be found in the import map -->
<script type="systemjs-importmap">
{
  "imports": {
    "bar": "foo"
  }
}
</script>
```

## 6

### Invalid address for package

SystemJS Error #6 occurs when an import map has an invalid URL for a [package via trailing slash](https://github.com/WICG/import-maps#packages-via-trailing-slashes).

"Packages via trailing slashes" are a way mapping a bare module specifier to a URL directory, to allow for module-relative imports such as `import 'my-package/sub-module.js';`.

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

SystemJS Error #6 is logged by SystemJS to implement [Step 6.1 of this part of the import maps spec](https://wicg.github.io/import-maps/#sort-and-normalize-a-specifier-map).

## 7

### AMD require is not supported

SystemJS Error #7 occurs when you attempt to use the [AMD require() function](https://github.com/amdjs/amdjs-api/wiki/require). SystemJS supports much of AMD's core functionality, but does not currently support all of the extensions to AMD, including AMD require.

## 8

### Named AMD modules require the named-register extra

SystemJS Error #8 occurs when you attempt to register a named AMD module, but have not included the [named-register extra](/README.md#extras).

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

## 9

### Failed to fetch module - wrong HTTP status

SystemJS Error #9 occurs when SystemJS attempted to load a module with [`fetch()`](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API), but the HTTP response status was not >= 200 and < 300.

SystemJS uses `fetch()` instead of `<script>` to load modules whenever the [shouldFetch hook](/docs/hooks.md##shouldfetchurl---boolean) returns true. By default, this occurs only when the file extension indicates it is a [CSS, JSON, HTML, or WASM module](/docs/module-types.md).

SystemJS checks the HTTP [Response object](https://developer.mozilla.org/en-US/docs/Web/API/Response) to check if the HTTP response status is ["ok"](https://developer.mozilla.org/en-US/docs/Web/API/Response/ok), and throws Error #9 if it is not ok.

To diagnose the problem, identify which module failed to load. Then check the browser console and network tab of your devtools to find the HTTP status. In order for the module to successfully load, the status needs to be >= 200 and < 300.

## 10

### Invalid content-type header

SystemJS Error #10 occurs when SystemJS attempted to load a module with [`fetch()`](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API), but the [content-type](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Type) HTTP response header was invalid.

SystemJS uses `fetch()` instead of `<script>` to load modules whenever the [shouldFetch hook](/docs/hooks.md##shouldfetchurl---boolean) returns true. By default, this occurs only when the file extension indicates it is a [CSS, JSON, HTML, or WASM module](/docs/module-types.md).

SystemJS checks the HTTP [Response object](https://developer.mozilla.org/en-US/docs/Web/API/Response) to check the content-type header. The header must be one of the following:

- `application/javascript`
- `application/json`
- `text/css`
- `application/wasm`

To diagnose the problem, identify which module failed to load. Then check the browser console and network tab of your devtools to find the HTTP status. In order for the module to successfully load, the status needs to be >= 200 and < 300.

## 11

### Transform extra failed to fetch module - wrong HTTP status

SystemJS Error #9 occurs when SystemJS attempted to load a module with [`fetch()`](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API), but the HTTP response status was not >= 200 and < 300.

This error is specific to fetches caused by the [transform extra](/README.md#extras), not by the `shouldFetch` or `fetch` hooks.

SystemJS checks the HTTP [Response object](https://developer.mozilla.org/en-US/docs/Web/API/Response) to check if the HTTP response status is ["ok"](https://developer.mozilla.org/en-US/docs/Web/API/Response/ok), and throws Error #11 if it is not ok.

To diagnose the problem, identify which module failed to load. Then check the browser console and network tab of your devtools to find the HTTP status. In order for the module to successfully load, the status needs to be >= 200 and < 300.

## 12

## Module did not instantiate

SystemJS Error #9 occurs when a module fails to instantiate.

Instantiation refers to downloading and executing the code for a module. The instantiation for a single module refers to an array that represents the module's dependencies, exports, and code.

SystemJS has various methods of instantiating modules, generally involving either a `<script>` or `fetch()`. Custom module instantiation can be implemented by [hooking System.instantiate](/docs/hooks.md#instantiateurl-parenturl---promise).

Error #12 occurs when the instantiate hook returns a Promise that resolves with no value. This generally does not occur when using the built-in SystemJS functionality and is more common to custom implementations of System.instantiate.