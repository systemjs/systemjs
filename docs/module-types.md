# Module Types

SystemJS supports loading modules that are in the following formats:

| Module Format | s.js | system.js | File Extension |
| ------------- | ---- | --------- | -------------- |
| [System.register](/docs/system-register.md) | :heavy_check_mark: | :heavy_check_mark: | * |
| [JSON Modules](https://github.com/whatwg/html/pull/4407) | [Module Types extra](/README.md#extras) | :heavy_check_mark: | *.json |
| [CSS Modules](https://github.com/w3c/webcomponents/blob/gh-pages/proposals/css-modules-v1-explainer.md) | [Module Types extra](/README.md#extras) | :heavy_check_mark: | *.css |
| [Web Assembly](https://github.com/WebAssembly/esm-integration/tree/master/proposals/esm-integration) | [Module Types extra](/README.md#extras) | :heavy_check_mark: | *.wasm |
| Global variable | [global extra](/README.md#extras) | :heavy_check_mark: | * |
| [AMD](https://github.com/amdjs/amdjs-api/wiki/AMD) | [AMD extra](/README.md#extras) | [AMD extra](/README.md#extras) | * |
| [UMD](https://github.com/umdjs/umd) | [AMD extra](/README.md#extras) | [AMD extra](/README.md#extras) | * |

### File Extension Limitations

When loading JSON modules, CSS modules and Web Assembly modules, the browser specifications require interpreting these modules based on checking their MIME type. Since SystemJS has to choose upfront whether to append a script element (for JS modules) or make a fetch request (for a JSON/CSS/Wasm module), it needs to know the module type upfront at resolution time.

Instead of reading the MIME type, the file extension is thus used specifically for the JSON, CSS and Web Assembly module cases.

## JSON Modules

[JSON modules](https://github.com/whatwg/html/pull/4407) are supported in both s.js and system.js.

### Example

**file.json**
```json
{
  "some": "json value"
}
```

```js
System.import('file.json').then(function (module) {
  console.log(module.default); // The json as a js object.
});
```

## CSS Modules

[CSS Modules](https://github.com/w3c/webcomponents/blob/gh-pages/proposals/css-modules-v1-explainer.md) are supported in both
s.js and system.js, [when a Constructable Style Sheets polyfill is present for browsers other than Chromium](#constructed-style-sheets-polyfill).

Note that the term CSS Modules refers to two separate things: (1) the browser spec, or (2) the webpack / postcss plugin.
The CSS modules implemented by SystemJS are the browser spec.

### Example
```css
/* file.css */
.brown {
  color: brown;
}
```

```js
System.import('file.css').then(function (module) {
  const styleSheet = module.default; // A CSSStyleSheet object
  document.adoptedStyleSheets = [...document.adoptedStyleSheets, styleSheet]; // now your css is available to be used.
});
```

### Constructable Style Sheets Polyfill

CSS modules export a [Constructable Stylesheet](https://developer.mozilla.org/en-US/docs/Web/API/CSSStyleSheet) instance as their
default export when imported.

Currently these are only available in new versions of Chromium based browsers (e.g., Chrome 73+), so usage in any other browsers will require a polyfill, such as the one at https://www.npmjs.com/package/construct-style-sheets-polyfill.

The polyfill can be conditionally loaded with an approach like:

```html
<script defer src="https://unpkg.com/construct-style-sheets-polyfill@2.1.0/adoptedStyleSheets.min.js"></script>
```

_Note that this polyfill does not currently work in IE11._