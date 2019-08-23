# CSS Modules

[CSS Modules](https://github.com/w3c/webcomponents/blob/gh-pages/proposals/css-modules-v1-explainer.md) are supported in both
s.js and system.js.

Note that the term CSS Modules refers to two separate things: (1) the browser spec, or (2) the webpack / postcss plugin.
The CSS modules implemented by SystemJS are the browser spec.

## Example
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