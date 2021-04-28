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

### Depcache

> Status: Non-standard Extension - https://github.com/guybedford/import-maps-extensions#depcache

Module loading suffers from the dependency waterfall problem which can cause performance issues.

The mitigation for this is preloading by including preload tags for all modules upfront to avoid their latency-bound discovery.

The problem is that preloading is not always possible, especially in lazy dynamic import scenarios.

To solve this problem, `depcache` allows defining the dependencies of a lazily loaded module upfront, so that when it is needed
the module loader can load all modules in parallel.

For example:

```html
<script type="systemjs-importmap">
{
  "imports": {
    "dep": "/path/to/dep.js"
  },
  "depcache": {
    "/path/to/dep.js": ["./dep2.js"],
    "/path/to/dep2.js": ["./dep3.js"],
    "/path/to/dep3.js": ["./dep4.js"],
    "/path/to/dep4.js": ["./dep5.js"]
  }
}
</script>
<script>
setTimeout(() => {
  System.import('dep');
}, 10000);
</script>
```

In the above example, `dep` is loaded lazily after 10 seconds, so we do not want any of `dep.js` or `dep2.js` etc using bandwidth during the initial critical page load.

At the 10 second mark, `dep` is loaded, and if we did not have depcache, we would only know to load `dep2.js` after it is received, and in turn for `dep3.js`, `dep4.js` and `dep5.js`.

With 50ms this might take 250ms for something that could be a single round trip.

With depcache, as soon as `dep` is loaded, SystemJS will trigger requests to all of `dep2.js` to `dep5.js` in parallel, which can be seen from the network tab when using this feature.

Note that for non-lazy-loading scenarios, [traditional script preloading](https://developer.mozilla.org/en-US/docs/Web/HTML/Preloading_content) techniques work better as they integrate directly into the browser preloader during the critical bootstrap of the page.

### Integrity

> Status: Non-standard Extension - https://github.com/guybedford/import-maps-extensions#integrity

For security it can be useful to ensure that all modules executed are based on [integrity checks](https://developer.mozilla.org/en-US/docs/Web/Security/Subresource_Integrity).

For statically loaded modules on startup, preload scripts support providing integrity which works fine for static module loads, but for lazy dynamic loading there is no way
to associate integrity with dynamic `import()` requests.

Putting integrity directly into the import map for these lazy import cases allows SystemJS to enable these comprehensive integrity checks for all modules executed.

The `"integrity"` property in the import map allows mapping a URL to its integrity value to use:

```html
<script type="systemjs-importmap">
{
  "imports": {
    "pkg": "/path/to/pkg.js"
  },
  "integrity": {
    "/path/to/pkg.js": "sha384-..."
  }
}
</script>
```

### Composition

> Status: Non-standard Extension - https://github.com/guybedford/import-maps-extensions#lazy-loading-of-import-maps

Multiple import maps are supported with each successive import map composing with the previous one.

Any existing mappings are replaced, although in future this may be an error.


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
    "y": "/path/to/y.js",
  }
}
</script>
```

Previous versions of the import maps spec had support for multiple import maps in a single web page ([explanation](https://github.com/WICG/import-maps/issues/199)). SystemJS added support for multiple import maps during that time and has decided to keep support for multiple import maps as an experimental feature ([discussion](https://github.com/systemjs/systemjs/issues/2095)). Note that the Chrome implementation of import maps does not yet allow for multiple maps, and use of multiple import maps within SystemJS should be considered experimental and subject to change.

### Handling Import Map Errors

For handling errors when fetching external import maps (specifically for [SystemJS Warning #W4](https://github.com/systemjs/systemjs/blob/master/docs/errors.md#w4)), we can use the `onerror` attribute in the `<script type="systemjs-importmap">` tag.

In the `onerror` attribute, specify a script to execute when there is an error.

```html
<script type="systemjs-importmap" onerror="handleError()" src="unable-to-reach/importmap.json"></script>

<script type="text/javascript">
  function handleError() {
    // Put error handling/retry logic here.
  }
</script>

<!-- Can also have inline definition for error handling script -->
<script type="systemjs-importmap" onerror='console.log("Running onerror script")' src="unable-to-reach/importmap.json"></script>
```

#### Spec and Implementation Feedback

Part of the benefit of giving users a working version of an early spec is being able to get real user feedback on the [import maps specification](https://github.com/wicg/import-maps/blob/master/spec.md).

All SystemJS extensions to import maps are based on proposals available in the [import maps extensions repo](https://github.com/guybedford/import-maps-extensions).

If you have suggestions, or notice cases where this implementation seems not to be following the spec properly feel free to post an issue.
