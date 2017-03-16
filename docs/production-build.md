## SystemJS Production Build

The SystemJS production build supports loading `System.register` and `System.registerDynamic` modules using
script tag loading, while also keeping support for Web Assembly when enabled via `System.config({ wasm: true })`.

The configuration options of `baseURL`, `paths`, `map`, `depCache` and `bundles` are supported identically to the
full development build, and as documented at the [configuration API page](config-api.md).

For contextual map configuration, the production build permits objects in the map configuration which act just
like package maps, allowing mappings within the package.

### Resolution Algorithm

The following is a detailed description of the production loader resolution algorithm in full, which can
also help to understand the SystemJS development build resolution as this resolution is a subset of that,
although with some subtle differences as well.

#### Plain Names

An important concept in the resolution algorithm is one of `plain names` or `bare names` as they are referred
to in the WhatWG loader specification. These are module names that do not start with `/` or `./` or `../` and
do not parse as URLs (`new URL(name)` fails).

#### Resolution Phases

The overall process of resolution is based on the steps for a given module `name`, being resolved to `parentName`.
If the module import is a top-level `System.import` call then `parentName` is set to the environment _baseURI_.

_paths_, _map_, and _contextual map_ targets are all fully normalized into URLs by the configuration system before running
the resolution algorithm, where the _map_ and _contextual map_ configurations themselves are normalized through _paths resolution_
if plain names.

**Core Resolution:**

_If a plain name, resolve with plain name resolution, otherwise resolve as a URL._

1. If `name` is not a _plain name_:
  1. Return the URL resolution of `name` relative to `parentName`
1. Otherwise, if `name` is a _plain name_:
  1. Return the _plain name resolution_ for `name` relative to `parentName`

**Plain name resolution:**

_Apply contextual map, then global map, then paths resolution._

1. If `parentName` is a _contextual map_ parent:
  1. If `name` matches any of the contextual maps for `parentName`:
    1. Set `name` to the mapping of the most specific _contextual map_ match in `name` replaced with its map target.
1. If `name` is still a _plain name_:
  1. If `name` matches any of the _global map_ mappings:
    1. Set `name` to the mapping of the most specific _global map_ match in `name` replaced with its map target.
1. If `name` is defined in the loader registry, return `name`
1. Otherwise, return the _paths resolution_ of `name`

**Paths resolution:**

_Apply paths, then baseURL at the very end only if still a plain name._

1. If `name` matches any _paths_:
  1. Return the mapping of the most specific _paths_ match in `name` replaced with its paths target.
1. If `name` is still a _plain name_:
  1. Return `baseURL` + `name`.
