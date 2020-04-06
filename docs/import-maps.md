## Import Maps

Import maps are the [current specification](https://github.com/domenic/import-maps) for mapping bare specifier names in the browser.

This means module specifiers like `"lodash"` can be mapped to exact URLs for loading.

> Note the import maps specification is still under active development and as such this implementation will be subject to change.

### Loading Import Maps

Import maps can be loaded inline or from a separate URL using a `<script type="systemjs-importmap">` tag:

```html
<!-- Separate src: -->
<script type="systemjs-importmap" src="/path/to/importmap.json">

  <!-- Inline: -->
  <script type="systemjs-importmap">
  {
    "imports": {
      "lodash": "/path/to/lodash/index.js",
      "lodash/": "/path/to/lodash/"
    },
    "scopes": {
      "/path/to/lodash/": {
        "lodash-dependency": "/path/to/scoped/package.js"
      }
    }
  }
</script>
```

> The import map is fixed as soon as the first `System.resolve` (or indirectly through `System.import`) is called. At this point no new import maps can be loaded currently, although this is under specification discussion at https://github.com/WICG/import-maps/issues/92.

### Imports

For base-level specifier mappings, we can use the `"imports"` property:

```html
<script type="systemjs-importmap">
  {
    "imports": {
      "lodash": "/path/to/lodash/index.js"
    }
  }
</script>
```

The above will resolve any `import 'lodash'` call to the path we have provided.

For submodules, loading `import 'lodash/x'` will not be supported in the above.

To more clearly define package folders we can use package folder mappings:

```html
<script type="systemjs-importmap">
  {
    "imports": {
      "lodash": "/path/to/lodash/index.js",
      "lodash/": "/path/to/lodash/"
    }
  }
</script>
```

In this scenario `import 'lodash'` will resolve to `/path/to/lodash/index.js` while `import 'lodash/x'` will
resolve to `/path/to/lodash/x`.

Note that the _right hand side_ of the import map must always be a valid relative, absolute or full URL (`./x`, `/x`, `https://site.com/x`).

Bare specifiers such as `x` on the right hand side will not match and throw an error.

### Scopes

Import maps also provide support for scoped mappings, where the mapping should only be applied within
a specific base path.

For example, say that we want `lodash` to resolve to one version in `/app` and that `/lib/x` should resolve
a different version of lodash.

This can be achieved with scoped import maps:

```html
<script type="systemjs-importmap">
  {
    "scopes": {
      "/app/": {
        "lodash": "/path/to/lodash@2.0.0.js"
      },
      "/lib/x/": {
        "lodash": "/path/to/lodash@1.0.0.js"
      }
    }
  }
</script>
```

> Note scopes must end with a trailing `/` to match all subpaths within that path.

Scopes still fallback to applying the global imports, so we only need to do this for imports that are different
from their global resolutions.

### Composition

_Note: This is an advanced feature, which is not necessary for most use cases._

Multiple import maps are supported with each successive import map composing with the previous one.

When composing import maps, they are combined in order, with the _right hand side_ resolutions of the new import map applying the resolution
rules of the import map that came before.

This means import maps can reference resolutions from previous import maps:

```html
<script type="systemjs-importmap">
  {
    "imports": {
      "x": "/path/to/x.js"
    }
  }
</script>
<script type="systemjs-importmap">
  {
    "imports": {
      "y": "x" // resolves to /path/to/x.js
    }
  }
</script>
```

#### Multiple import maps

Previous versions of the import maps spec had support for multiple import maps in a single web page ([explanation](https://github.com/WICG/import-maps/issues/199)). SystemJS added support for multiple import maps during that time and has decided to keep support for multiple import maps as an experimental feature ([discussion](https://github.com/systemjs/systemjs/issues/2095)). Note that the Chrome implementation of import maps does not yet allow for multiple maps, and use of multiple import maps within SystemJS should be considered experimental and subject to change.

#### Spec and Implementation Feedback

Part of the benefit of giving users a working version of an early spec is being able to get real user feedback on the spec.

If you have suggestions, or notice cases where this implementation seems not to be following the spec properly feel free to post an issue.

See the [import maps specification](https://github.com/domenic/import-maps/blob/master/spec.md) for exact resolution behaviours.
