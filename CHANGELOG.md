SystemJS 6.8.3
* Allow deletion of uninstantiated modules whose top level parent import finished. (https://github.com/systemjs/systemjs/pull/2291)

SystemJS 6.8.2
* Fix deleting modules after link failure. (https://github.com/systemjs/systemjs/pull/2288)
* Ensure onload hooks retain catches (https://github.com/systemjs/systemjs/pull/2289)
* Footprint improvement for browser (https://github.com/systemjs/systemjs/pull/2290)

SystemJS 6.8.1
* Support System.firstGlobalProp on System instance (https://github.com/systemjs/systemjs/commit/4883c708280f1a7785f065b46852fa806938a2dc)
* Webpack usage update (https://github.com/systemjs/systemjs/commit/ca781b854fbb253e5f8477ce9b4fbc8c3c43f03c)

SystemJS 6.8.0
* System.firstGlobalProp for global loading extra (https://github.com/systemjs/systemjs/commit/48351aa83c48fdd22b63000d417dedc2329f2340, @joeldenning)
* Graceful import map loading errors (https://github.com/systemjs/systemjs/commit/9edebd1969842dcc95a12d4137677c6bc9fe2bae, @naltatis)
* Sourcemap normalization for fetch loader (https://github.com/systemjs/systemjs/commit/97621d724cc7c892d9dee2cff6b27553326c8169)
* Dispatch script loading errors for `<script type="systemjs-module">` (https://github.com/systemjs/systemjs/commit/f0fe5a473414b995082688c30a876c602e32d901, @dmail)

SystemJS 6.7.1
* Fix auto import race condition (https://github.com/systemjs/systemjs/pull/2266)

SystemJS 6.7.0
* Implement integrity attribute for systemjs-importmap scripts (https://github.com/systemjs/systemjs/commit/78072e594ebebab9124aa9fedd7e17d8303835e1)
* Deprecate the transform and use default extras (https://github.com/systemjs/systemjs/commit/5f7571a76bef210d096e672c9f011d94871a6827)
* Fetch hooks brought into core, module types extra refactoring (https://github.com/systemjs/systemjs/commit/281fdf0653663c58145f880131dceaf479add553)
* Inline named exports extra behaviours into core and deprecate (https://github.com/systemjs/systemjs/commit/3eefa2daa8d203e8d886bae7dc587eed148c5808)

SystemJS 6.6.1
* IE11 support bug fix (https://github.com/systemjs/systemjs/pull/2247)

SystemJS 6.6.0
* Fix autoimport dynamic import conflicts (https://github.com/systemjs/systemjs/pull/2245)
* Set "type": "script" in package.json (https://github.com/systemjs/systemjs/pull/2246)

SystemJS 6.5.1
* Fix depcache hook (https://github.com/systemjs/systemjs/pull/2242)

SystemJS 6.5.0
* import.meta.resolve implementation (https://github.com/systemjs/systemjs/pull/2230)
* Import maps integrity feature (https://github.com/systemjs/systemjs/pull/2229)

SystemJS 6.4.3
* Define an "s.js" entry in "exports" (https://github.com/systemjs/systemjs/pull/2226)
* Fixup use of const for older browsers (https://github.com/systemjs/systemjs/issues/2227)

SystemJS 6.4.2
* Fix and simplify auto import domready resets (https://github.com/systemjs/systemjs/pull/2225)

SystemJS 6.4.1
* Fix auto import handling of dynamic import races during loading phase (https://github.com/systemjs/systemjs/pull/2223)
* Fix crossOrigin script attribute loading in Safari (https://github.com/systemjs/systemjs/pull/2222)

SystemJS 6.4.0
* Dynamic import map extra support (https://github.com/systemjs/systemjs/pull/2217 @stevenvachon)
* Depcache support in import maps for automated preloading (https://github.com/systemjs/systemjs/pull/2134)
* Auto Import feature for `<script src="system-register-module.js">` loading for better load performance (https://github.com/systemjs/systemjs/pull/2216, https://github.com/systemjs/systemjs/pull/2210 @tmsns)
* Fix onload behaviour with flag for error source (https://github.com/systemjs/systemjs/pull/2204 @smartrejames)
* Fix Object.prototype mutation (https://github.com/systemjs/systemjs/pull/2206 @stevenvachon)

SystemJS 6.3.3
* Better error message when content-type header is missing (https://github.com/systemjs/systemjs/pull/2197 via @brandones)
* Make setters optional (#2193 via @guybedford) 

SystemJS 6.3.2
* Named exports extra now supports non-objects. (https://github.com/systemjs/systemjs/pull/2186 via @Sauloxd)

SystemJS 6.3.1
* Fix error code mixup (https://github.com/systemjs/systemjs/pull/2169)
* Fix bug in system-node.cjs where prepareImport overwrote import map (https://github.com/systemjs/systemjs/pull/2170)
* Adding full dist directory to package.json exports (https://github.com/systemjs/systemjs/pull/2173)
* Increasing timeout for test:node script (https://github.com/systemjs/systemjs/pull/2174)
* Switching to node-fetch to avoid caching bugs in make-fetch-happen (https://github.com/systemjs/systemjs/pull/2171)

SystemJS 6.3.0
* s.js now has full import map support (https://github.com/systemjs/systemjs/pull/2150)
* New system-node.cjs loader designed to run in NodeJS. (https://github.com/systemjs/systemjs/pull/2150, https://github.com/systemjs/systemjs/pull/2158)
* SystemJS now has error codes, along with documentation for each error code (https://github.com/systemjs/systemjs/pull/2151)
* Fix bug in Chrome 45 where const/let disallowed unless in strict mode (https://github.com/systemjs/systemjs/pull/2162)
* Add warning for calling System.set with non-URL id (https://github.com/systemjs/systemjs/pull/2161)

SystemJS 6.2.6
* Address race condition with named register modules (https://github.com/systemjs/systemjs/pull/2144)

SystemJS 6.2.5
* Fix problem where a falsy exported value from AMD modules didn't work (https://github.com/systemjs/systemjs/pull/2130)

SystemJS 6.2.4
* Fix problem where System.delete did not remove named register modules. (https://github.com/systemjs/systemjs/pull/2125 @k-j-kim)

SystemJS 6.2.3
* Fix another race condition with named registers. (https://github.com/systemjs/systemjs/pull/2121)

SystemJS 6.2.2
* Supporting multiple define variations for named modules. Resolves #2118. (https://github.com/systemjs/systemjs/pull/2119)

SystemJS 6.2.1
* Fix problem with named register modules (resolves #2115) (https://github.com/systemjs/systemjs/pull/2116)

SystemJS 6.2.0
* Adding new createScript / fetch / shouldFetch hooks (https://github.com/systemjs/systemjs/pull/2058)
* Fixing race conditions with named register modules (https://github.com/systemjs/systemjs/pull/2114)

SystemJS 6.1.10
* Fixing bug where named AMD modules were instantiated twice (https://github.com/systemjs/systemjs/pull/2104)
* Save bytes with setTimeout (https://github.com/systemjs/systemjs/pull/2105)
* Prefer import map resolution over registryRegistry resolution (https://github.com/systemjs/systemjs/pull/2108)

SystemJS 6.1.9
* Fix bug where url query params and hash broke module type file extension check (https://github.com/systemjs/systemjs/pull/2096 @LarsDenBakker)

SystemJS 6.1.8
* Ensure that __esModule is copied to ns even if it isn't enumerable. Improves webpack interop when using libraryTarget system.

SystemJS 6.1.7
* Fix problem where banner comment in output files had wrong version number

SystemJS 6.1.6
* Fix IE11 regression in 6.1.5 (https://github.com/systemjs/systemjs/pull/2077 @kouts)

SystemJS 6.1.5
* Support registry delete returning update function (https://github.com/systemjs/systemjs/pull/2020 @guybedford)
* Fixing bug where named-exports didn't work on named registers. (https://github.com/systemjs/systemjs/pull/2074 @joeldenning)

SystemJS 6.1.4 (2019/10/12)
* Fix IE global detection to ignore IFrames (https://github.com/systemjs/systemjs/pull/2035, @kduret)
* Remove stray console.log (https://github.com/systemjs/systemjs/pull/2046, @joeldenning)

SystemJS 6.1.3 (2019/10/06)
* Fix relative resolution of LHS URLs in import maps (https://github.com/systemjs/systemjs/pull/2039)
* Fix named register extra to extend rather than reinstantiate the SystemJS instance (https://github.com/systemjs/systemjs/pull/2042)
* Update extras to extend the global System instance explicitly (https://github.com/systemjs/systemjs/pull/2043)

SystemJS 6.1.2 (2019/09/22)
* Bug fix for named AMD modules (https://github.com/systemjs/systemjs/pull/2029)
* Bug fix for IE11 regression bug (https://github.com/systemjs/systemjs/pull/2033)

SystemJS 6.1.1 (2019/09/13)
* Fixes a bug where imports before the import map load might not apply the import map (https://github.com/systemjs/systemjs/issues/2024, @joeldenning)
* Fixes the module-types extra output which was incorrectly referencing an import (https://github.com/systemjs/systemjs/issues/2027, @joeldenning)

SystemJS 6.1.0 (2019/09/11) - Minor Changes
* Add support for `<script type="systemjs-module" src="import:foo">` (https://github.com/systemjs/systemjs/pull/2015)

**SystemJS 6.0.0 (2019/08/29) - Major Changes**
* Cascading import maps implementation (https://github.com/systemjs/systemjs/pull/2009)
* New module types extra for CSS, JSON and Wasm (https://github.com/systemjs/systemjs/pull/2006)
* CSS modules implementation (https://github.com/systemjs/systemjs/pull/1997)
* Deps argument added to onload hook (https://github.com/systemjs/systemjs/pull/1998)
* System.resolve is now synchronous by default (https://github.com/systemjs/systemjs/pull/1996, @joeldenning)
* The first named System.regiser in a bundle will now define the bundle module itself (https://github.com/systemjs/systemjs/pull/1984, @joeldenning)
* Named exports extra fix not to alter the default export (https://github.com/systemjs/systemjs/pull/1983, @joeldenning)

**SystemJS 5.0.0 (2019/07/30) - Major Change**
* Import map scopes now resolve relative to the base, not the scope (https://github.com/systemjs/systemjs/pull/1975)

SystemJS 4.1.1 (2019/07/30)
* Fix bug in named exports extra with AMD exports (https://github.com/systemjs/systemjs/pull/1978)
* Ensure that global frames are not detected in global extra (https://github.com/systemjs/systemjs/pull/1973, @kduret)

SystemJS 4.1.0 (2019/07/14)
* Added a new "Use Default" extra. (https://github.com/systemjs/systemjs/pull/1969)
* Fix typo in comment. (https://github.com/systemjs/systemjs/pull/1970 @kouts)

SystemJS 4.0.2 (2019/07/08)
* Fix bug thrown in strict mode. (https://github.com/systemjs/systemjs/pull/1966 @joeldenning)

SystemJS 4.0.1 (2019/07/06)
* Fix IE11 regression related to loading json files (https://github.com/systemjs/systemjs/pull/1963, @joeldenning)
* Fix bug where System.import() rejected incorrectly, due to unrelated errors (https://github.com/systemjs/systemjs/pull/1961 @joeldenning)

**SystemJS 4.0.0 (2019/06/29) - Major Changes**
* Support `<base href>` setting baseURL (https://github.com/systemjs/systemjs/pull/1957, @LarsDenBakker)
* Use `Error` over `new Error` to reduce footprint (https://github.com/systemjs/systemjs/pull/1951, @joeldenning)
* Support AMD importing ESM with an internal interop signifier (https://github.com/systemjs/systemjs/pull/1941)
* Support JSON module imports (https://github.com/systemjs/systemjs/pull/1950, @joeldenning)

SystemJS 3.1.6 (2019/04/21)
* Add "type": "module" package.json property

SystemJS 3.1.5 (2019/04/19)
* Fix Import Maps in IE11 (https://github.com/systemjs/systemjs/commits/2cd549b68824447a, @kouts)

SystemJS 3.1.4 (2019/04/19)
* Further IE11 bug fixes (https://github.com/systemjs/systemjs/commits/4c2ec2f6f6a662, https://github.com/systemjs/systemjs/pull/1936 @joeldenning)
* Fix AMD define mutation bug (https://github.com/systemjs/systemjs/commits/0ec9da6b46d38da, https://github.com/systemjs/systemjs/issues/1932)

SystemJS 3.1.3 (2019/04/18)
* Add Web Worker support to the s.js build (https://github.com/systemjs/systemjs/commits/cbea1530a194d7)
* Fix an IE11 bug due to object shorthand (https://github.com/systemjs/systemjs/commits/551b2e8ec7bda1)

SystemJS 3.1.2 (2019/04/13)
* Fix an async execution bug in s.js (https://github.com/systemjs/systemjs/issues/1924, https://github.com/systemjs/systemjs/commits/c274caa172b03b24)

SystemJS 3.1.1 (2019/04/07)
* Fix a Promise chaining bug with top-level await in s.js (https://github.com/systemjs/systemjs/issues/1921, https://github.com/systemjs/systemjs/commits/cc44badb954)
* Support registry iteration (https://github.com/systemjs/systemjs/issues/1918, 984dcd1c0fe, 532fdbddede7c2, 1af0f13f58, @joeldenning)
* Support late loading of import maps (https://github.com/systemjs/systemjs/issues/1916, @joeldenning)

SystemJS 3.1.0 (2019/03/24)
* Ensure resolve always returns a promise (https://github.com/systemjs/systemjs/commits/42ea052e9a97, @joeldenning)
* Fix error handling for AMD scripts (https://github.com/systemjs/systemjs/commits/56d515a2885ebce6b)

SystemJS 3.0.2 (2019/03/17)
* Support for multiple import maps ([#1912](https://github.com/systemjs/systemjs/pull/1912), @joeldenning)
* Bug fix to URL imports when not applied by package map ([#a0d53c95](https://github.com/systemjs/systemjs/commits/a0d53c956b751c))

SystemJS 3.0.1 (2019/03/01)
* Ensure that instantiate errors can be cleared with loader.delete (#1902)
* Fix undefined err bug on errors ([#1898](https://github.com/systemjs/systemjs/pull/1898))
* Add loader.has / loader.set API ([#1899](https://github.com/systemjs/systemjs/pull/1899), 6b85a8c4)

**SystemJS 3.0.0 (2019/01/12) - Major Changes**
* Implement new Import Maps specification replacing Package Name Maps ([#1893](https://github.com/systemjs/systemjs/pull/1893))

SystemJS 2.1.2 (2019/01/12)
* Fix empty bundle registration for named register extension ([#1885](https://github.com/systemjs/systemjs/pull/1885), @paulmelnikow)

SystemJS 2.1.1 (2018/11/01)
* Add AMD named define support to named register extension / amd extension combination ([#1870](https://github.com/systemjs/systemjs/pull/1870), 0f1adb38)

SystemJS 2.1.0 (2018/11/01)
* Adjust named register to no longer use "bundle:" scheme but to define bare specifier names directly in registry ([#1871](https://github.com/systemjs/systemjs/pull/1871), bc63fbb0)

SystemJS 2.0.2 (2018/10/06)
* Add Named register extra ([#1855](https://github.com/systemjs/systemjs/pull/1855), b34c8290)
* Fix WASM 4KB limit and Safari instantiation ([#1857](https://github.com/systemjs/systemjs/pull/1857), cb25b39f)
* Fix global detection in Safari ([#1858](https://github.com/systemjs/systemjs/pull/1858), 989a04f1)
