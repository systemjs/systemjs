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
