import './fixtures/tracing.js';
import { parseImportMap, resolveImportMap } from '../src/common.js';
import assert from 'assert';
import { mergeImportMap } from '../src/features/import-map.js';

describe('Import Maps', function () {
  let importMap

  beforeEach(function () {
    importMap = parseImportMap({
      imports: {
        "x": "/y",
        "x/": "/src/x/",
        "p": "t",
        "p/": "t/",
        "m": "./m/index.js",
        "m/": "./m/",
        "https://site.com/x": "/x.js",
        "r": "r"
      },
      scopes: {
        "/scope/": {
          "x/": "y/"
        }
      }
    }, 'https://sample.com/src/');
  });

  it('Throws for unknown', function () {
    try {
      resolveImportMap('z', 'https://site.com', importMap);
    }
    catch (e) {
      assert.equal(e.message, 'Unable to resolve bare specifier "z" from https://site.com');
    }
  });

  it('Can map URLs', function () {
    assert.equal(resolveImportMap('/x', 'https://site.com/', importMap), 'https://sample.com/x.js');
  });

  it('Resolves packages with main sugar', function () {
    assert.equal(resolveImportMap('x', 'https://site.com', importMap), 'https://sample.com/y');
  });

  it('Resolves subpaths with main sugar', function () {
    assert.equal(resolveImportMap('x/z', 'https://site.com', importMap), 'https://sample.com/src/x/z');
  });

  it('Resolves packages with a path', function () {
    assert.equal(resolveImportMap('p/r', 'https://site.com', importMap), 'https://sample.com/src/t/r');
  });

  it('Throws resolving a package with no main', function () {
    try {
      resolveImportMap('p', 'https://site.com', importMap);
    }
    catch (e) {
      assert.equal(e.message, 'Package p has no main');
    }
  });

  it('Resolves packages with a main', function () {
    assert.equal(resolveImportMap('m', 'https://site.com', importMap), 'https://sample.com/src/m/index.js');
  });

  it('Resolves package subpaths for a main', function () {
    assert.equal(resolveImportMap('m/s', 'https://site.com', importMap), 'https://sample.com/src/m/s');
  });

  it('Resolves scoped packages', function () {
    assert.equal(resolveImportMap('x', 'https://sample.com/scope/y', importMap), 'https://sample.com/y');
  });

  it('Resolves scoped package subpaths', function () {
    assert.equal(resolveImportMap('x/sub', 'https://sample.com/scope/y', importMap), 'https://sample.com/scope/y/sub');
  });

  it('Overrides package resolution when two import maps define the same module', function () {
    const secondMap = parseImportMap({
      imports: {
        r: 'overridden-r',
      }
    }, 'https://sample.com/src/');
    const finalMap = mergeImportMap(importMap, secondMap);
    assert.equal(resolveImportMap('r', 'https://site.com', finalMap), 'https://sample.com/src/overridden-r');
  });

  it('Adds to an existing import map when there are two import maps', function () {
    const secondMap = parseImportMap({
      imports: {
        g: 'g',
      }
    }, 'https://sample.com/src/');
    const finalMap = mergeImportMap(importMap, secondMap);
    assert.equal(resolveImportMap('g', 'https://site.com', finalMap), 'https://sample.com/src/g');
  });

  it('Overrides an import map scope when two import maps define the same scope', function () {
    const secondMap = parseImportMap({
      scopes: {
        "/scope": {
          "x/": "z/"
        }
      }
    }, 'https://sample.com/src/');
    const finalMap = mergeImportMap(importMap, secondMap);
    assert.equal(resolveImportMap('x/file.js', 'https://sample.com/scope/something', finalMap), 'https://sample.com/scope/z/file.js');
  });

  it('Adds an import map scope when two import maps are merged', function () {
    const secondMap = parseImportMap({
      scopes: {
        "/other-scope": {
          "f": "/other-scope-path/f.js"
        }
      }
    }, 'https://sample.com/src/');
    const finalMap = mergeImportMap(importMap, secondMap);
    assert.equal(resolveImportMap('f', 'https://sample.com/other-scope/something', finalMap), 'https://sample.com/other-scope-path/f.js');
  });

});
