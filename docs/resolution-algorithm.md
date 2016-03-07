SystemJS Resolution Algorithm
---

All module requests in SystemJS run through the same resolution algorithm.

Note that the `defaultJSExtensions` property is being deprecated so is not described here as part of the resolution algorithm.

The resolution algorithm consists of the following features:

* Map
* Paths
* URL Normalization
* BaseURL
* Packages
* Conditional Normalizations

## When Resolution is used

When using `System.import`, or `import 'x'` syntax, the resolution algorithm is run against the parent module request.

When using `System.load`, no resolution is run.

`System.normalizeSync` implements the exact resolution algorithm, except for any plugin or conditional loading features.

## Canonical Form

Canonical form is defined as a request that only needs to go through the following steps to be turned into URL:

* baseURL
* Paths

A module in canonical form is converted into a URL for the module registry by using DECANONICALIZE, which is normalization
that only applies plugin normalization, paths, baseURL and URL normalization.

## Resolution Algorithm Pseudo-Code

The resolution algorithm in SystemJS is a function of the request and parent, and the following loader configurations:


- Assumption:: System.paths are absolute URLs!!

* SystemJS.baseURL - absolute URL, with a trailing slash
* SystemJS.packageConfigPaths, absolute URLs with wildcards
* SystemJS.packages - key of absolute URL to package to package config
* SystemJS.paths - hash of paths to targets
* SystemJS.map - hash of paths to targets
* SystemJS.meta - absolute URLs with wildcards

The System.config function will ensure that the above configurations are of the correct structure, by passing configurations
themselves through DECANONICALIZE.

The current resolution algorithm is designed to cater to a wide array of package support features
so that many existing code patterns can be supported as well as new use cases as well.

The resolution may be simplified in future through the removal of features. Features that may be removed include:

* Boolean conditional support (experimental)
* Plugin syntax (legacy and compatibility)
* Default extension adding within packages (compatibility)

> _parent_ is set to undefined for a top-level SystemJS.import('x')

> The registry is assumed to contain on startup the system modules _"@empty"_ (`new Module({})`) and 
_"@system-env"_ (`new Module({ production: true/false, node: true/false, browser: true/false })`).

### 1. Resolution

#### 1.1. RESOLVE(request, parent)

> Defines the plugin and boolean conditional syntax wrappers around core resolve.

1 If _request_ contains the boolean conditional syntax substring _"#?"_ then,
  1. Set _request_ to the result of _RESOLVE_BOOLEAN_CONDITIONAL(request, parent)_
1. Let _pluginSyntax_ be _undefined_
1. If _request_ contains the plugin syntax _"!"_ then,
  1. Set _pluginSyntax_ to the result of _RESOLVE_PLUGIN_SYNTAX(request, parent)_
  1. Set _request_ to _pluginSyntax.requestArgument_
1. Let _resolved_ be the value of _CORE_RESOLVE(request, parent)_
1. If _pluginSyntax_ is not _undefined_ then,
  1. If _IS_SYSTEM_MODULE(resolved)_ reject with a new _Error_
  1. Return the string _resolved + "!" + pluginSyntax.resolvedPlugin_
1. Return _resolved_

#### 1.2. CORE_RESOLVE(request, parent)

> Defines the comprehensive core SystemJS normalization algorithm.

1. Let _resolved_ be _undefined_
1. If _IS_PLAIN_NAME(request)_ is _true_ then,
  1. Set _resolved_ to the resolution of _NAME_RESOLVE(request, parent)_
1. Else,
  1. Let _resolutionParent_ be equal to _parent_
  1. If _resolutionParent_ is _undefined_ then,
    1. Set _resolutionParent_ to the environment baseURI
  1. Set _resolved_ to the resolution of _URL_RESOLVE(request, resolutionParent)_
1. Let _packageResolution_ be the resolution of _RESOLVE_PACKAGE(resolved)_
1. If _packageResolution_ is not _undefined_ then,
  1. Return _packageResolution_
1. Return the result of _RESOLVE_CONDITIONAL_INTERPOLATION(resolved, parent)_

#### 1.3. NAME_RESOLVE(request, parent)

> Give a plain name like `jquery`, determines its resolution.

1. Assert _IS_PLAIN_NAME(request)_ is _true_
1. If _parent_ is not _undefined_ then,
  1. Let _contextualResolution_ be the result of _RESOLVE_CONTEXTUAL_PACKAGE_MAP(request, parent)_
  1. If _contextualResolution_ is not _undefined_ then,
    1. Return _contextualResolution_
1. Let _mapResolution_ be the result of _RESOLVE_GLOBAL_MAP(request)_
1. If _mapResolution_ is not _undefined_ then,
  1. If _IS_PLAIN_NAME(mapResolution)_ is _false_ then,
    1. Let _baseURI_ be the environment baseURI
    1. Return the resolution of _URL_RESOLVE(mapResolution, baseURI)_
  1. Else,
    1. Set _request_ to _mapResolution_
1. If _IS_SYSTEM_MODULE(request)_ then,
  1. Return _request_
1. Return the result of _RESOLVE_PATHS(request)_

### 2. Helper Functions

#### 2.1. IS_PLAIN_NAME(request)

1. If _request_ is equal to _"."_ or _".."_, or begins with the string _"./"_, _"../", _"/"_ or _"*://"_, 
  where `*` consists of any valid URI protocol characters, _return false_
1. Else, return _true_

#### 2.2 URL_RESOLVE(request, parent)

> Standard URI normalization, with an exception to treat "#" as a normal URI character.

1. Pre-encode any _"#"_ characters in both _request_ and _parent_
1. Let _resolved_ be the standard URI resolution of _request_ to _parent_
1. Return _resolved_ with previous _"#"_ encodings decoded

#### 2.3 IS_SYSTEM_MODULE(request)

1. If _IS_PLAIN_NAME(request)_ is _true_,
  1. If there is already an entry in the module registry for the module _request_ return _true_
1. Return _false_

#### 2.4 RESOLVE_CONTEXTUAL_PACKAGE_MAP(request, parent)

> Contextual package map is the ability for `import 'jquery'` to have its own unique map when the parent
  module importing is within a package itself. This unique package map is called contextual map configuration.

1. Assert _parent_ is not _undefined_
1. Assert _IS_PLAIN_NAME(request)_
1. Let _parentPackageURL_ be _GET_PACKAGE_MATCH(parent)_
1. If _parentPackageURL_ is _undefined_ then,
  1. Return _undefined_
1. Let _mapResolution_ be the resolved value of _RESOLVE_PACKAGE_MAP(request, parentPackageURL)_
1. If _mapResolution_ is _undefined_ then,
  1. Return _undefined_
1. Assert _mapResolution_ is a string
1. Return _mapResolution_

#### 2.5 RESOLVE_GLOBAL_MAP(request)

> Map configuration is exactly as defined in AMD loaders and supports matching both files and folders.
  This makes it suitable for both the use case `map: { jquery: '//cdn.jquery.com/jquery-x.y.z.js' }`
  and the use case `map: { jquery: '/path/to/jquery' }` where "/path/to/jquery" is a folder
  or package that we import from with `import 'jquery/x.js'`. Map only ever applies once throughout the
  entire pipeline so any cyclical or double mapping edge cases are avoided.

1. Assert _IS_PLAIN_NAME(request)_
1. Let _mapMatch_ be the value of _GET_MAP_MATCH(request, SystemJS.map)_
1. If _mapMatch_ is _undefined_ then,
  Return _undefined_
1. Let _map_ be the string _SystemJS.map[mapMatch]_
1. Assert the last character of _map_ is not _"/"_
1. Let _subPath_ be the string _request.substr(mapMatch.length)_
1. Return the string _map + subPath_

#### 2.5.1 GET_MAP_MATCH(request, map)

1. Assert that _map_ is an object
1. Let _bestMatch_ be _undefined_
1. For each key _key_ in _map_,
  1. If _request_ starts with the substring _key_ then,
    1. If _request.length_ is equal to _key.length_ or _request[key.length]_ is equal to the string _"/"_ then,
      1. If _bestMatch_ is _undefined_ or _key.length_ is greater than _bestMatch.length_ then,
        1. Set _bestMatch_ to _key_
1. Return _bestMatch_

#### 2.6 RESOLVE_PATHS(request)

> While wildcard paths are currently supported in SystemJS these are being deprecated for paths targets with a trailing "/"
  to indicate folder paths. Paths targets are baseURI-relative, unless they are plain names in which case they are baseURL-relative.

1. Assert _IS_PLAIN_NAME(request)_
1. Let _paths_ be the value of _SystemJS.paths_
1. Assert that _paths_ is an object
1. Let _bestMatch_ be _undefined_
1. For each _key_, _path_ pair in _paths_,
  1. Assert _path_ is a valid URI
  1. If _path_ does not end with a trailing _"/"_ then,
    1. If _request_ is equal to _key_ then,
      1. Return _path_
  1. Else if _request_ starts with the string prefix _key_ then,
    1. If _bestMatch.length_ is less than _key.length_ then,
      1. Set _bestMatch_ to _key_
1. If _bestMatch_ is not _undefined_ then,
  1. Let _path_ be equal to _paths[bestMatch]_
  1. Return _request_ with the _key_ prefix replaced by _path_
1. Return _BASE_URL_RESOLVE(request)_

#### 2.6.1 BASE_URL_RESOLVE(request)

1. Assert _IS_PLAIN_NAME(request)_ is _true_
1. Assert that _SystemJS.baseURL_ is a string
1. Assert that the last character of _SystemJS.baseURL_ is _"/"_
1. Return the string _SystemJS.baseURL + request_

#### 2.8 RESOLVE_PLUGIN_SYNTAX(request, parent)

> Plugin syntax is the same syntax used in AMD or Webpack but with a reversed order (`a.js!plugin`).
  This order may be reversed to match these cases in the next breaking change.
  For normalization here we normalize the plugin and module argument parts separately.

1. Assert _request_ contains the plugin syntax character _"!"_
1. Let _pluginModule_ be the string to the right of the last _"!"_ character in _request_
1. Let _requestArgument_ be the string to the left of the last _"!"_ character in _request_
1. If _pluginModule_ is an empty string then,
  1. Let _pluginModule_ be the string to the right of the last _"."_ character in _request_ if any
  1. If _pluginModule_ is still an empty string, reject the operation with a new _TypeError_
1. Let _resolvedPlugin_ be the resolved value of _RESOLVE(pluginModule, parent)_
1. Let _o_ be a new plain object
1. Set _o.requestArgument_ to _requestArgument_
1. Set _o.resolvedPlugin_ to _resolvedPlugin_
1. Return _o_

#### 2.9 RESOLVE_BOOLEAN_CONDITIONAL(request, parent)

> A boolean conditional is a request of the form `import 'a.js#?b.js'` which means
  that we only want to import `a.js` if `b.js` resolves to a module containing `export default true`.
  The standard use case for this is loading global environment polyfills.
  This feature is still experimental and may be deprecated in future depending on use.

1. Assert _request_ contains the substring _"#?"_
1. Let _booleanCondition_ be the string to the right of the last _"#?"_ substring in _request_
1. Let _booleanResolution_ be the string to the left of the last _"#?"_ substring in _request_
1. Let _conditionValue_ be the resolved value of _RESOLVE_CONDITION(booleanCondition, parent)_
1. If _conditionValue_ is not a boolean, reject the operation with a new _TypeError_
1. If _conditionValue_ is _true_, set _request_ to the string _booleanResolution_
1. If _conditionValue_ is _false_, set _request_ to string _"@empty"_
1. Return _request_

#### 2.10 RESOLVE_CONDITION(condition, parent)

> Conditions are of the general form "~conditionModule|conditionExport", where "~" indicates
  optional boolean condition negation and "|conditionExport" indicates a specific export of the 
  conditional module. When no export is specified (eg "conditionModule"), the default export is used.

1. Let _negation_ be _false_
1. If _condition_ starts with the string _"~"_ then,
  1. Set _negation_ to _true_
  1. Set _condition_ to _condition.substr(1)_
1. Let _conditionExport_ be the substring after the last instance of _"|"_ in _condition_
1. Set _condition_ to the substring before the last instance of _"|"_ in _condition_
1. If _condition_ is an empty string then,
  1. Set _condition_ to _"@system-env"_
1. If _conditionExport_ is an empty string then,
  1. Set _conditionExport_ to _"default"_
1. Let _conditionModule_ be the resolution of _SystemJS.import(condition, parent)_
1. If _conditionExport_ is not an export of _conditionModule_ reject with a new _Error_
1. Let _conditionValue_ be the value of _conditionModule[conditionExport]_
1. If _negation_ is _true_ then,
  1. If _conditionValue_ is not of type _boolean_ reject with a new _Error_
  1. Set _conditionValue_ to the negation of _conditionValue_
1. Return _conditionValue_

#### 2.11 RESOLVE_CONDITIONAL_INTERPOLATION(url, parent)

> Conditional interpolation syntax is for loads of the form `import 'x-#{y}.js'`, where
  the default export for y is substituted into the require. This is run as the last normalization
  to ensure that interpolation substitution resolves deterministically as a final-stage URL interpolation, 
  independent of all other resolution configuration.

1. If _request_ contains the conditional interpolation syntax substring _"#{*}"_,
  where `*` consists of any non `}` characters, then,
  1. Let _interpolationCondition_ be the contents of `*` from the last match of _"#{*}"_ within _request_
  1. Let _interpolationValue_ be the resolved value of _RESOLVE_CONDITION(interpolationCondition, parent)_
  1. If _interpolationValue_ is not a string, reject the RESOLVE promise with a _TypeError_
  1. Set _request_ to the value of substituting the contents of `*` from the last match of _"#{*}"_ within _request_
    with the value of _interpolationValue_
1. Return _request_

#### 2.12 RESOLVE_PACKAGE(url)

> Package matches are done in URL space. The most specific package match, if any, is used
  as the package, and then package resolution rules are followed within that path.
  Package configurations can be dynamically loaded on-demand via the use of packageConfigPaths.

1. Let _packageConfigPath_ be the value of _GET_PACKAGE_CONFIG_PATH(url)_
1. Let _packageURL_ be the value of _GET_PACKAGE_MATCH(url)_
1. Let _packageConfig_ be the value of _SystemJS.packages[packageURL]_
1. Assert that _packageConfig_ is _undefined_ or an object
1. If _packageConfigPath_ is not _undefined_ then,
  1. If _packageConfig_ is _undefined_ or _packageConfig.configured_ is not set to _true_ then,
    1. Resolve the promise _LOAD_PACKAGE_CONFIG(packageURL, packageConfigPath)_
    1. Set _packageURL_ to _GET_PACKAGE_MATCH(url)_
    1. Set _packageConfig_ to the value of _SystemJS.packages[packageURL]_
1. If _packageConfig_ is not _undefined_ then,
  1. Let _subPath_ be the value of _url.substr(packageURL.length + 1)_
  1. Set _url_ to the value of _RESOLVE_PACKAGE_SUBPATH(packageURL, subPath)_
1. Return _url_

##### 2.12.1 GET_PACKAGE_MATCH(url)

1. Let _bestPackageMatch_ be an empty string
1. For each _packageURL_ in _SystemJS.packages_ do,
  1. Assert that _packageURL_ is a valid URI
  1. Assert the last character of _packageURL_ is not _"/"_
  1. If _url_ is equal to _packageURL_ or _url_ starts with _packageURL + "/"_ then,
    1. If _bestPackageMatch.length_ is less than _packageURL.length_ then,
      1. Set _bestPackageMatch_ to _packageURL_
1. Return _bestPackageMatch_

##### 2.12.2 GET_PACKAGE_CONFIG_PATH(url)

> Package config paths provide a simple scheme for specifying dynamic config loading for packages.
  Two use cases of packageConfigPath values are supported in the same scheme
  - i) "package/package.json" means that if loading "package/x", we must first load the 
  config file "package/package.json" and ii) "packages/*/package.json" means that if loading 
  "packages/x/y" then we must first load the config file "packages/x/package.json".
  Multiple "*" wildcards are also supported in the package pattern, which match any character
  except a "/" separator. packageConfigPaths are normalized into full URLs by System.config.

1. Let _packageConfigPaths_ be the value of _SystemJS.packageConfigPaths_
1. Let _bestMatch_ be _undefined_
1. Assert _packageConfigPaths_ is an _Array_
1. For each entry _configPath_ of the _packageConfigPaths_ array,
  1. Assert that _configPath_ is a valid URI
  1. Let _lastWildcardIndex_ be the last index of the string _"*"_ in _configPath_
  1. Let _lastSeparatorIndex_ be the last index of the string _"/"_ in _configPath_
  1. Let _pkgBoundaryIndex_ be the maximum of _lastWildcardIndex + 1_ and _lastSeparatorIndex_
  1. Let _packagePattern_ be the substring prefix of _configPath_ of length _pkgBoundaryIndex_
  1. Let _packageMatch_ be the substring prefix of _url_ matched with _packagePattern_,
    where _"*"_ wildcards greedily match any character except _"/"_
  1. If _packageMatch_ is not _undefined_ then,
    1. If _packageMatch.length_ is equal to _url.length_ or _url[packageMatch.length]_ equals _"/"_ then,
      1. If _bestMatch_ is _undefined_ or _packageMatch.length_ is greater than _bestMatch.length then,
        1. Set _bestMatch_ to _packageMatch_
1. Return _bestMatch_

##### 2.12.3 LOAD_PACKAGE_CONFIG(packageURL, configURL)

> We load the config file itself through SystemJS.load, which allows config files themselves to be bundled

_SystemJS.load is a variation of SystemJS.import that assumes an already-normalized module name_

1. If _SystemJS.meta[configURL]_ is undefined, set _SystemJS.meta[configURL]_ to a new object
1. Let _meta_ be the value of _SystemJS.meta[configURL]_
1. Set _meta.format_ to the value _"json"_
1. Let _loadedConfig_ be the default export of resolving the promise _SystemJS.load(configURL)_
1. If _SystemJS.packages[packageURL]_ is not defined, set it to an empty object
1. Let _packageConfig_ be the value of _SystemJS.packages[packageURL]_
1. For each _key_, _value_ pair in the object `loadedConfig`,
  1. If _key_ is not already a value in _packageConfig_, set _packageConfig[key]_ to _value_
  1. Else if _key_ is _"map"_ or _"meta"_ then merge the object _value_ into _packageConfig[key]_,
    without overwriting any existing values in _packageConfig[key]_.

##### 2.12.4 RESOLVE_PACKAGE_SUBPATH(packageURL, subPath)

> When loading a subpath within a package, we support package config mains, internal subpath maps
  (checked both before and after the default extension is added) and default extension adding.

1. Let _packageConfig_ be the value of _SystemJS.packages[packageURL]_
1. Assert _packageConfig_ is an object
1. If _subPath_ is an empty string then,
  1. If _packageConfig.main_ is not undefined then,
    1. Assert _packageConfig.main_ does not start with _"."_ or _"/"_
    1. Set _subPath_ to _packageConfig.main_
  1. Else return _packageURL_
1. Let _mapResolution_ be the value of _RESOLVE_PACKAGE_MAP("./" + subPath, packageURL)_
1. If _mapResolution_ is _undefined then,
  1. Let _defaultExtension_ be _GET_DEFAULT_PACKAGE_EXTENSION(packageURL, subPath)_
  1. If _defaultExtension_ is not an empty string then,
    1. Set _mapResolution_ to the value of _RESOLVE_PACKAGE_MAP("./" + subPath + defaultExtension, packageURL)_
1. If _mapResolution is not _undefined_ then,
  1. Return _mapResolution_
1. Return _packageURL + '/' + subPath + GET_DEFAULT_PACKAGE_EXTENSION(packageURL, subPath)_

##### 2.12.5 GET_DEFAULT_PACKAGE_EXTENSION(packageURL, subPath)

> Default extensions in package subpaths are only added when the subpath does not match
  a meta configuration of the package or a global meta configuration that specifies the file suffix.
  This allows global and package meta configurations like `meta: { '*.css': { loader: 'css' } }`
  or `meta: { 'file.css': true }` to opt-out of the default extension adding in packages.
  Ideally this wouldn't be necessary if default extension adding did not exist, but the reality
  is that it is still needed.

1. Let _packageConfig_ be the value of _SystemJS.packages[packageURL]_
1. Assert _packageConfig_ is an object
1. Let _defaultExtension_ be the value of _packageConfig.defaultExtension_
1. If _defaultExtension_ is _undefined_ then,
  1. Set _defaultExtension_ to _"js"_
1. Assert _defaultExtension_ is a string
1. Let _packageMeta_ be the value of _packageConfig.meta_
1. If _packageMeta_ is not _undefined_ then,
  1. Let _packageMetaMatches_ be the value of _GET_META_MATCHES(subPath, packageMeta)_
  1. For each value _metaMatch_ in the array _packageMetaMatches_,
    1. If the last character of _metaMatch_ is not _"*"_ then,
      1. Set _defaultExtension_ to _""_
1. Let _globalMeta_ be the value of _SystemJS.meta_
1. Let _globalMetaMatches_ be the value of _GET_META_MATCHES(packageURL + "/" + subPath, globalMeta)_
1. For each value _metaMatch_ in the array _globalMetaMatches_,
  1. If the last character of _metaMatch_ is not _"*"_ then,
    1. Set _defaultExtension_ to _""_
1. Return _defaultExtension_

##### 2.12.6 GET_META_MATCHES(path, meta)

1. Assert _meta_ is an object
1. Let _metaMatches_ be a new Array
1. For each key _metaPattern_ in _meta_,
  1. If _path_ matches _metaPattern_ exactly where _"*"_ is any character not _"/"_
    1. Add _metaPattern_ to the array _metaMatches_
1. Return _metaMatches_

##### 2.12.7 RESOLVE_PACKAGE_MAP(request, packageURL)

> Package map is identical to global map, but supports two additional features.
  Firstly, packages can map relative syntax - "./x" can be used as both a target pattern
  or destination mapping which is package-relative, and secondly, package maps can use conditional
  objects to allow conditional package resolutions. When package maps map to a plain name,
  that name itself will run through the full resolution algorithm so that package map can
  chain with global map. Double mapping of package map itself is impossible.

1. Let _packageMap_ be the value of _SystemJS.packages[packageURL].map_
1. If _packageMap_ is _undefined_ then,
  1. Return _undefined_
1. Let _mapMatch_ be _GET_MAP_MATCH(request, packageMap)_
1. If _mapMatch_ is _undefined_ then,
  1. Return _undefined_
1. Assert _mapMatch_ is a string
1. Let _mapValue_ be the value of _packageMap[mapMatch]_
1. If _mapValue_ is of type _object_ then, 
  1. Let _packageCondition_ be "@system-env"
  1. If _packageMap.@env_ is a value of type string then,
    1. Set _packageCondition_ to _packageMap.@env_
  1. For each key _condition_ in _mapValue_,
    1. Let _negate_ be equal to _false_
    1. If _condition[0]_ is equal to _"~"_ then,
      1. Set _negate_ to _true_
    1. Let _conditionExport_ be equal to _condition_
    1. If _negate_ is equal to _true then,
      1. Set _conditionExport_ to _condition.substr(1)_
    1. Let _fullCondition_ be the string _packageCondition + "|" + conditionExport_
    1. If _negate_ is equal to _true_ then,
      1. Set _fullCondition_ to _"~" + fullCondition_
    1. Let _conditionValue_ be the resolution of _RESOLVE_CONDITION(fullCondition)_
    1. If _conditionValue_ is not of type _boolean_, reject with a new _Error_
    1. If _conditionValue_ is equal to _true_ then,
      1. Set _mapValue_ to the value of _mapValue[condition]_
      1. _Break For_
  1. If _mapValue_ is of type _object_ then,
    1. Return _undefined_
1. Assert _mapValue_ is a string
1. Call _VALIDATE_PACKAGE_MAP(mapMatch, mapValue)_, rejecting with any error on abrupt completion
1. If _IS_PLAIN_NAME(mapValue)_ then,
  1. Return _RESOLVE(mapValue)_
1. Else,
  1. If _mapValue_ starts with the string _"./"_ and _mapValue.length > 2_ then,
    1. Let _subPath_ be the string _mapValue.substr(2)_
    1. Return _packageURL + '/' + subPath + GET_DEFAULT_PACKAGE_EXTENSION(packageURL, subPath)_
  1. Return _URL_RESOLVE(mapValue, packageURL)_

##### 2.12.8 VALIDATE_PACKAGE_MAP(mapMatch, mapValue)

> We disallow recursive relative package map of the form "./x" -> "./x/y"
  by throwing an error in these cases. We also disallow "." as a key in map config.

1. If _mapMatch_ is equal to the string _"."_ then,
  1. Throw a new _Error_
1. If _mapMatch_ starts with the string _"./"_ and does not end with the string _"/"_ then,
  1. If _mapValue_ is equal to the string _mapMatch_ then,
    1. Throw a new _Error_
  1. If _mapValue[mapMatch.length]_ is equal to _"/"_ then,
    1. Throw a new _Error_

### 3. DECANONICALIZE(request, parent)

> Decanonicalize is the reduced normalization used to convert `System.register('name')` into a full URL registry name.
  It is designed to allow a well-defined 1-1 mapping between a plain name scheme and the URLs in the registry
  making it suitable for portable module transport without having to directly use URLs.
  It just applies resolution of paths and baseURL configs.

1. Let _pluginSyntax_ be _undefined_
1. If _request_ contains the plugin syntax _"!"_ then,
  1. Set _pluginSyntax_ to the result of _DECANONICALIZE_PLUGIN_SYNTAX(request, parent)_
  1. Set _request_ to _pluginSyntax.requestArgument_
1. Assert _IS_PLAIN_NAME(request)_
1. Let _resolved_ be _undefined_
1. If _IS_SYSTEM_MODULE(request)_ then,
  1. Set _resolved_ to _request_
1. Else,
  1. Set _resolved_ to the result of _RESOLVE_PATHS(request)_
1. If _pluginSyntax_ is not _undefined_ then,
  1. If _IS_SYSTEM_MODULE(resolved)_ reject with a new _Error_
  1. Return the string _resolved + "!" + pluginSyntax.resolvedPlugin_
1. Return _resolved_
```

#### 3.1 DECANONICALIZE_PLUGIN_SYNTAX(request, parent)

> This operation is identical to RESOLVE_PLUGIN_SYNTAX, except calling DECANONICALIZE on the plugin instead of RESOLVE.

1. Assert _request_ contains the plugin syntax character _"!"_
1. Let _pluginModule_ be the string to the right of the last _"!"_ character in _request_
1. Let _requestArgument_ be the string to the left of the last _"!"_ character in _request_
1. If _pluginModule_ is an empty string then,
  1. Let _pluginModule_ be the string to the right of the last _"."_ character in _request_ if any
  1. If _pluginModule_ is still an empty string, reject the operation with a new _TypeError_
1. Let _resolvedPlugin_ be the resolved value of _DECANONICALIZE(pluginModule, parent)_
1. Let _o_ be a new plain object
1. Set _o.requestArgument_ to _requestArgument_
1. Set _o.resolvedPlugin_ to _resolvedPlugin_
1. Return _o_



