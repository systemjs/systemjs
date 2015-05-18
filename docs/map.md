Map configuration alters the module name at the normalization stage. It is useful for creating aliases:

```javascript
  System.map['jquery'] = 'location/for/jquery';

  System.import('jquery')           // -> 'location/for/jquery'
  System.import('jquery/submodule') // -> `location/for/jquery/submodule'
```

The location used as the target of the map is any valid module name itself.

Contexual map configuration can also be used to provide maps only for certain modules, which is useful for version mappings:

```javascript  
  System.map['some-module'] = {
    jquery: 'jquery@2.0.3'
  };

  // some-module.js now gets 'jquery@2.0.3'
  // everything else still gets 'location/for/jquery'
```

Contextual maps apply from the most specific module name match only.