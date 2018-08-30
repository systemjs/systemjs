## Package Name Maps

Package name maps are the [current specification](https://github.com/domenic/package-name-maps) for mapping bare specifier names in the browser.

These are module specifiers like `"lodash"` which are not absolute URLs and do not start with `./`, `../` or `/`.

> Note the package name maps specification is still under active development and as such this implementation will be subject to change.

### Loading Package Name Maps

Package name maps can be loaded inline or from a separate URL using a `<script type="systemjs-packagemap">` tag:

```html
<!-- Separate src: -->
<script type="systemjs-packagemap" src="/path/to/packagemap.json">

<!-- Inline: -->
<script type="systemjs-packagemap">
{
  ...Package Map JSON...
}
</script>
```

It is important that the package map is included before SystemJS itself for it to be picked up properly.

### Packages

For base-level specifier mappings, we can use the `"packages"` property:

```html
<script type="systemjs-packagemap">
{
  "packages": {
    "lodash": "/path/to/lodash.js"
  }
}
</script>
```

The above will resolve any `import 'lodash'` call to the path we have provided.

For submodules, loading `import 'lodash/x'` will resolve to `/path/to/x.js`.

To more clearly define package folders we can use the expanded form of the packages configuration:

```html
<script type="systemjs-packagemap">
{
  "packages": {
    "lodash": {
      "main": "index.js",
      "path": "/path/to/lodash"
    }
  }
}
</script>
```

In this scenario `import 'lodash'` will resolve to `/path/to/lodash/index.js` while `import 'lodash/x'` will
resolve to `/path/to/lodash/x`.

### Scopes

Package name maps also provide support for scoped mappings, where the mapping should only be applied within
a specific base path.

For example, say that we want `lodash` to resolve to one version in `/app` and that `/lib/x` should resolve
a different version of lodash.

This can be achieved with scoped packages:

```html
<script type="systemjs-packagemap">
{
  "scopes": {
    "/app": {
      "packages": {
        "lodash": "/path/to/lodash@2.0.0.js"
      }
    },
    "/lib/x": {
      "packages": {
        "lodash": "/path/to/lodash@1.0.0.js"
      }
    }
  }
}
</script>
```

Scopes still fallback to applying the global packages, so we only need to do this for packages that are different
from their global resolutions.

### Path Prefix

For all mappings, we can define a base-level path prefix relative to which mappings apply:

```html
<script type="systemjs-packagemap">
{
  "path_prefix": "/path/to",
  "packages": {
    "lodash": {
      "path": "lodash",
      "main": "lodash.js"
    }
  }
}
</script>
```

Note that paths are loaded relative to their package names in certain cases, so this isn't always straightforward to
follow. Absolute URLs can often be safer.

### Excluded Features

The SystemJS implementation of package maps excludes a couple of features from the spec:

#### Nested Scopes

Nested scopes is the ability to define a `"scopes"` within a scope, which is not currently supported.

#### Scope Prefixes

The spec supports `path_prefix` defined within scopes for custom base-level resolution within any given scope.

Support for this feature is not included in this implementation.

#### Spec and Implemnetation Feedback

Part of the benefit of giving users a working version of an early spec is being able to get real user feedback on
the spec.

If you have suggestions, or notice cases where this implementation seems not
to be following the spec properly feel free to post an issue.
