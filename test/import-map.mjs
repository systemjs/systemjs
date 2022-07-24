import { resolveAndComposeImportMap, resolveImportMap, resolveIfNotPlainOrUrl } from '../src/common.js';
import assert from 'assert';

// function resolveImportMap (importMap, resolvedOrPlain, parentUrl);

function doResolveImportMap (id, parentUrl, importMap) {
  return resolveImportMap(importMap, resolveIfNotPlainOrUrl(id, parentUrl) || id, parentUrl);
}


describe('Import Maps', function () {
  const firstImportMap = { imports: {}, scopes: {} };
  resolveAndComposeImportMap({
    imports: {
      "./asdf": "./asdf-asdf",
      "t": "./src/t",
      "t/": "./src/t/",
      "r": "./src/r"
    },
    scopes: {
      "/": {
        "y/": "./src/y/"
      }
    }
  }, 'https://sample.com/', firstImportMap);

  const baseImportMap = {
    imports: Object.assign({}, firstImportMap.imports),
    scopes: {
      "/": Object.assign({}, firstImportMap.scopes["https://sample.com/"])
    }
  };
  resolveAndComposeImportMap({
    imports: {
      "x": "/y",
      "x/": "/src/x/",
      "p": "t",
      "p/": "t/",
      "m": "./m/index.js",
      "m/": "./m/",
      "https://site.com/x": "/x.js",
      "r": "r",
      "g": "./g"
    },
    scopes: {
      "/": firstImportMap.scopes["https://sample.com/"],
      "/scope/": {
        "x/": "y/"
      }
    }
  }, 'https://sample.com/src/', baseImportMap);

  it('Throws for unknown', function () {
    try {
      doResolveImportMap('z', 'https://site.com', baseImportMap);
    }
    catch (e) {
      assert.equal(e.message, 'Unable to resolve bare specifier "z" from https://site.com');
    }
  });

  it('Can map URLs', function () {
    assert.equal(doResolveImportMap('/x', 'https://site.com/', baseImportMap), 'https://sample.com/x.js');
  });

  it('Can map relative URLs', function () {
    assert.equal(doResolveImportMap('/asdf', 'https://sample.com/', baseImportMap), 'https://sample.com/asdf-asdf');
  });

  it('Resolves packages with main sugar', function () {
    assert.equal(doResolveImportMap('x', 'https://site.com', baseImportMap), 'https://sample.com/y');
  });

  it('Resolves subpaths with main sugar', function () {
    assert.equal(doResolveImportMap('x/z', 'https://site.com', baseImportMap), 'https://sample.com/src/x/z');
  });

  it('Resolves packages with a path', function () {
    assert.equal(doResolveImportMap('p/r', 'https://site.com', baseImportMap), 'https://sample.com/src/t/r');
  });

  it('Throws resolving a package with no main', function () {
    try {
      doResolveImportMap('p', 'https://site.com', baseImportMap);
    }
    catch (e) {
      assert.equal(e.message, 'Package p has no main');
    }
  });

  it('Resolves packages with a main', function () {
    assert.equal(doResolveImportMap('m', 'https://site.com', baseImportMap), 'https://sample.com/src/m/index.js');
  });

  it('Resolves package subpaths for a main', function () {
    assert.equal(doResolveImportMap('m/s', 'https://site.com', baseImportMap), 'https://sample.com/src/m/s');
  });

  it('Resolves scoped packages', function () {
    assert.equal(doResolveImportMap('x', 'https://sample.com/scope/y', baseImportMap), 'https://sample.com/y');
  });

  it('Resolves scoped package subpaths', function () {
    assert.equal(doResolveImportMap('x/sub', 'https://sample.com/scope/y', baseImportMap), 'https://sample.com/src/y/sub');
  });

  it('Overrides package resolution when two import maps define the same module', function () {
    const newMap = { imports: Object.assign({}, baseImportMap.imports), scopes: {} };
    resolveAndComposeImportMap({
      imports: {
        r: './overridden-r',
      }
    }, 'https://sample.com/src/', newMap);
    assert.equal(doResolveImportMap('r', 'https://site.com', newMap), 'https://sample.com/src/overridden-r');
  });

  it('Adds to an existing import map when there are two import maps', function () {
    const newMap = { imports: Object.assign({}, baseImportMap.imports), scopes: {} };
    resolveAndComposeImportMap({
      imports: {
        g: 'g',
      }
    }, 'https://sample.com/src/', newMap);
    assert.equal(doResolveImportMap('g', 'https://site.com', newMap), 'https://sample.com/src/g');
  });

  it('Supports scopes as exact ids', function () {
    const newMap = { imports: Object.assign({}, baseImportMap.imports), scopes: baseImportMap.scopes };
    resolveAndComposeImportMap({
      scopes: {
        "/scope": {
          "x/": "./z/"
        }
      }
    }, 'https://sample.com/src/', newMap);
    assert.equal(doResolveImportMap('x/file.js', 'https://sample.com/scope', newMap), 'https://sample.com/src/z/file.js');
    assert.equal(doResolveImportMap('x/file.js', 'https://sample.com/scope/', newMap), 'https://sample.com/src/y/file.js');
  });

  it('Overrides an import map scope when two import maps define the same scope', function () {
    const newMap = { imports: Object.assign({}, baseImportMap.imports), scopes: {} };
    resolveAndComposeImportMap({
      scopes: {
        "/scope/": {
          "x/": "./z/"
        }
      }
    }, 'https://sample.com/src/', newMap);
    assert.equal(doResolveImportMap('x/file.js', 'https://sample.com/scope/something', newMap), 'https://sample.com/src/z/file.js');
  });

  it('Adds an import map scope when two import maps are merged', function () {
    const newMap = { imports: Object.assign({}, baseImportMap.imports), scopes: {} };
    resolveAndComposeImportMap({
      scopes: {
        "/other-scope/": {
          "f": "/other-scope-path/f.js"
        }
      }
    }, 'https://sample.com/src/', newMap);
    assert.equal(doResolveImportMap('f', 'https://sample.com/other-scope/something', newMap), 'https://sample.com/other-scope-path/f.js');
  });

});
