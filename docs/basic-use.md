### Simple Application Structure

The standard application structure would be something like the following:

index.html:
```html
<script src="system.js"></script>
<script>
  // Identical to writing System.baseURL = ...
  System.config({

    // set all requires to "lib" for library code
    baseURL: '/lib/',
    
    // set "app" as an exception for our application code
    paths: {
      'app/*': '/app/*.js'
    }
  });

  System.import('app/app')
</script>
```

app/app.js:
```javascript
  // relative require for within the package
  require('./local-dep');    // -> /app/local-dep.js

  // library resource
  var $ = require('jquery'); // -> /lib/jquery.js

  // format detected automatically
  console.log('loaded CommonJS');
```

Module format detection happens in the order System.register, ES6, AMD, then CommonJS and falls back to global modules.

Named defines are also supported, with the return value for a module containing named defines being its last named define.

#### File access from files

> _Note that when running locally, ensure you are running from a local server or a browser with local XHR requests enabled. If not you will get an error message._

> _For Chrome on Mac, you can run it with: `/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome --allow-file-access-from-files &> /dev/null &`_

> _In Firefox this requires navigating to `about:config`, entering `security.fileuri.strict_origin_policy` in the filter box and toggling the option to false._

### Loading ES6

app/es6-file.js:
```javascript
  export class q {
    constructor() {
      this.es6 = 'yay';
    }
  }
```

```html
  <script>
    System.import('app/es6-file').then(function(m) {
      console.log(new m.q().es6); // yay
    });
  </script>
```

ES6 modules define named exports, provided as getters on a special immutable `Module` object.

To build for production, see the [production workflows](production-workflows.md).

[For further details about SystemJS module format support, see the wiki page](module-format-support.md).

For further infomation on ES6 module loading, see the [ES6 Module Loader polyfill documentation](https://github.com/ModuleLoader/es6-module-loader).