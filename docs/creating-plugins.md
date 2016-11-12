### Creating a Plugin

As of SystemJS 0.20, plugins are modules with a `load` method:

```javascript
export function load (key, processAnonRegister) {

}
```

The `load` method supports the same return values as the [es-module-loader instantiate hook](https://github.com/ModuleLoader/es-module-loader#instantiate-hook).

Within this hook, plugins can fetch `key` as a source text, or do any other custom work necessary to output a valid module object, System.register module
or System.registerDynamic module.

Plugins written to the [plugin API prior to SystemJS 0.20](https://github.com/systemjs/systemjs/blob/0.19.41/docs/creating-plugins.md) that implement the full loader hooks are still supported, but this API will be deprecated in future releases.

### Building plugins

Prior to SystemJS 0.19 plugins were designed to run at build time as well as in the browser.

As of SystemJS 0.20, the `load` hook of the plugin API is designed only for runtime plugins, and will not run at build time.

Build time plugins as a concept are no longer supported as the caching requirements for build tools are completely different to browser loading workflows.

#### Sample CSS Plugin

A CSS loading plugin can be written with for example:

js/css.js:
```javascript
  exports.fetch = function (key) {
    return new Promise(function (resolve, reject) {
      var link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = key;
      link.onload = resolve;
    });
  };
```
