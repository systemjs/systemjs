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
