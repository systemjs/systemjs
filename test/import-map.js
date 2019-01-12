import { parseImportMap, resolveImportMap } from '../src/common.js';
import assert from 'assert';

describe('Import Maps', function () {
  const importMap = parseImportMap({
    imports: {
      "x": "/y",
      "x/": "/src/x/",
      "p": "t",
      "p/": "t/",
      "m": "./m/index.js",
      "m/": "./m/",
      "https://site.com/x": "/x.js"
    },
    scopes: {
      "/scope": {
        "x/": "y/"
      }
    }
  }, 'https://sample.com/src/');

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

  it ('Resolves scoped package subpaths', function () {
    assert.equal(resolveImportMap('x/sub', 'https://sample.com/scope/y', importMap), 'https://sample.com/scope/y/sub');
  });

});
