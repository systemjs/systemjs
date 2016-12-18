## Creating a Plugin

### Compiler plugins

The hooks compiler plugins can override are `locate`, `fetch`, `translate` and `instantiate`.

The behaviors of the hooks are:

* Locate: Overrides the location of the plugin resource
* Fetch: Called with third argument representing default fetch function, has full control of fetch output.
* Translate: Returns the translated source from `load.source`, can also set `load.metadata.sourceMap` for full source maps support.
* Instantiate: Providing this hook as a promise or function allows the plugin to hook instantiate. Any return value becomes the defined custom module object for the plugin call.

#### Sample CoffeeScript Plugin

For example, we can write a CoffeeScript plugin with the following:

coffee.js:
```javascript
var CoffeeScript = require('coffeescript');

exports.translate = function (load) {
  // optionally also set the sourceMap to support both builds and in-browser transpilation
  // load.metadata.sourceMap = generatedSourceMap;
  return CoffeeScript.compile(load.source);
}
```

```javascript
  System.import('app/main.coffee!coffee.js').then(function(main) {
    // main is now loaded from CoffeeScript
  });
```

#### Sample CSS Plugin

A CSS loading plugin can be written:

css.js:
```javascript
export.fetch = function (url) {
  return new Promise(function (resolve, reject) {
    var link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = url;
    link.onload = resolve;

    document.head.appendChild(link);
  })
  .then(function () {
    return '';
  });
}
```
