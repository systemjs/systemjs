### Creating a Plugin

A plugin is just a set of overrides for the loader hooks of the ES6 module specification.

The hooks plugins can override are `locate`, `fetch`, `translate` and `instantiate`.

Read more about loader extensions and hooks at the [ES6 Module Loader polyfill wiki](https://github.com/ModuleLoader/es6-module-loader/wiki/Extending-the-ES6-Loader).

The behavior of the hooks is:

* Locate: Overrides the location of the plugin resource
* Fetch: Called with third argument representing default fetch function, has full control of fetch output.
* Translate: Returning undefined, assumes `load.source` was modified, and runs default translate hooks as well. Returning a source skips running the default hooks.
* Instantiate: Providing this hook as a promise or function allows the plugin to hook instantiate. Any return value becomes the defined custom module object for the plugin call.

### Plugin Hook APIs

#### locate(load) -> address

load.metadata, load.name and load.address are already set

#### Sample CoffeeScript Plugin

For example, we can write a CoffeeScript plugin with the following (CommonJS as an example, any module format works fine):

js/coffee.js:
```javascript
  var CoffeeScript = require('coffeescript');

  exports.translate = function(load) {
    load.source = CoffeeScript.compile(load.source);
  }
```

By overriding the `translate` hook, we now support CoffeeScript loading with:

```
 - js/
   - coffee.js             our plugin above
   - coffeescript.js       the CoffeeScript compiler
 - app/
   - main.coffee
```

```javascript
  System.import('app/main.coffee!').then(function(main) {
    // main is now loaded from CoffeeScript
  });
```

#### Sample CSS Plugin

A CSS plugin, on the other hand, could override the fetch hook:

js/css.js:
```javascript
  exports.fetch = function(load, fetch) {
    return new Promise(function(resolve, reject) {
      var cssFile = load.address;

      var link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = cssFile;
      link.onload = resolve;

      document.head.appendChild(link);
    });
  }
```

Each loader hook can either return directly or return a promise for the value.

The other loader hooks are also treated otherwise identically to the specification.