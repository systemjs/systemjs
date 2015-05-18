### Meta Configuration

The ES6 module loader uses a special `metadata` object that is passed between hooks.

An example of meta config is the module format of a module, which is stored at `metadata.format`.

The meta extension opens up this object for setting defaults through `System.meta` as well as inline module syntax.

In this way, we can specify the module format of a module through config:

```javascript
  System.meta['some/module'] = {
    format: 'amd'
  };

  System.import('some/module') // always loaded as AMD even if it is a UMD module
```

Or the module can even specify its own meta:

some/module.js
```javascript
  "format amd";

  if (typeof module != 'undefined' && module.exports)
    module.exports = 'cjs';
  else
    define(function() { return 'amd' });
```

Since it is impossible to write 100% accurate module detection, this inline `format` hint provides a useful way of informing the module format of a module.

The format options are - `register`, `es6`, `amd`, `cjs`, `global`.