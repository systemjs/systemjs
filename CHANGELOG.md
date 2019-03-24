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

SystemJS 3.0.0 (2019/01/12)
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