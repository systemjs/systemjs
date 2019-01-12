## Import Maps

Import maps are the [current specification](https://github.com/domenic/import-maps) for mapping bare specifier names in the browser.

This means module specifiers like `"lodash"` can be mapped to exact URLs for loading.

> Note the package name maps specification is still under active development and as such this implementation will be subject to change.

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
    "/path/to/lodash": {
      "lodash-dependency": "/path/to/scoped/package.js"
    }
  }
}
</script>
```

It is important that the package map is included before SystemJS itself for it to be picked up properly.

### Packages

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
  "packages": {
    "lodash": "/path/to/lodash/index.js",
    "lodash/": "/path/to/lodash/"
  }
}
</script>
```

In this scenario `import 'lodash'` will resolve to `/path/to/lodash/index.js` while `import 'lodash/x'` will
resolve to `/path/to/lodash/x`.

### Scopes

Import maps also provide support for scoped mappings, where the mapping should only be applied within
a specific base path.

For example, say that we want `lodash` to resolve to one version in `/app` and that `/lib/x` should resolve
a different version of lodash.

This can be achieved with scoped import maps:

```html
<script type="systemjs-packagemap">
{
  "scopes": {
    "/app": {
      "lodash": "/path/to/lodash@2.0.0.js"
    },
    "/lib/x": {
      "lodash": "/path/to/lodash@1.0.0.js"
    }
  }
}
</script>
```

Scopes still fallback to applying the global packages, so we only need to do this for packages that are different
from their global resolutions.

#### Spec and Implemnetation Feedback

Part of the benefit of giving users a working version of an early spec is being able to get real user feedback on
the spec.

If you have suggestions, or notice cases where this implementation seems not to be following the spec properly feel free to post an issue.

The edge cases are still being worked out, so there will still be work to do here too.

[Read the full specification for the exact behaviours further](https://github.com/domenic/import-maps/blob/master/spec.md).
