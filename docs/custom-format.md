The [register extension](https://github.com/systemjs/systemjs/blob/master/lib/register.js) handles all module format processing through the metadata object.

To create a custom format extension, create a new instantiate extension that sets metadata for the register extension:

```javascript
  var systemInstantiate = System.instantiate;
  System.instantiate = function(load) {

    // only detect the format if it has not already been detected as this format or as
    // another format already (ES6 and System.register detection always happen first)
    if (load.metadata.format == 'myformat' || 
        !load.metadata.format && load.source.match(myFormatRegEx)) {

      load.metadata.deps = ['./unnormalized', 'dependencies'];

      // main execution function
      load.metadata.execute = function(require, exports, moduleName) {

        // the require function takes unnormalized dependencies as in deps
        var module = require('./unnormalized');

        // we set exports gradually for circular reference support
        exports.val = 'here';

        // alternatively, if circular reference support is not important,
        // just return the exports object directly
        return { 'screw': 'circular references' };
      }

      // only necessary for CommonJS, where the require function itself drives execution
      load.metadata.executingRequire = true;
    }

    // pass the metadata on to the register extension for instantiate handling now
    return systemInstantiate.call(this, load);
  }
```