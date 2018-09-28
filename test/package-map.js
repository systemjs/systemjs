import { createPackageMap } from '../src/common.js';
import assert from 'assert';

describe('Package Name Maps', function () {
  const packageMapResolve = createPackageMap({
    packages: {
      "x": "/y",
      "p": {
        "path": "t"
      },
      "m": {
        "main": "index.js"
      }
    },
    scopes: {
      "/scope": {
        packages: {
          "x": "/y"
        }
      }
    }
  }, 'https://sample.com/src/');

  it('Throws for unknown', function () {
    try {
      packageMapResolve('z', 'https://site.com');
    }
    catch (e) {
      assert.equal(e.message, 'Unable to resolve bare specifier "z" from https://site.com');
    }
  });

  it('Resolves packages with main sugar', function () {
    assert.equal(packageMapResolve('x', 'https://site.com'), 'https://sample.com/y');
  });

  it('Resolves subpaths with main sugar', function () {
    assert.equal(packageMapResolve('x/z', 'https://site.com'), 'https://sample.com/src/x/z');
  });

  it('Resolves packages with a path', function () {
    assert.equal(packageMapResolve('p/r', 'https://site.com'), 'https://sample.com/src/t/r');
  });

  it('Throws resolving a package with no main', function () {
    try {
      packageMapResolve('p', 'https://site.com');
    }
    catch (e) {
      assert.equal(e.message, 'Package p has no main');
    }
  });

  it('Resolves packages with a main', function () {
    assert.equal(packageMapResolve('m', 'https://site.com'), 'https://sample.com/src/m/index.js');
  });

  it('Resolves package subpaths for a main', function () {
    assert.equal(packageMapResolve('m/s', 'https://site.com'), 'https://sample.com/src/m/s');
  });

  it('Resolves scoped packages', function () {
    assert.equal(packageMapResolve('x', 'https://sample.com/scope/y'), 'https://sample.com/y');
  });

  it ('Resolves scoped package subpaths', function () {
    assert.equal(packageMapResolve('x/sub', 'https://sample.com/scope/y'), 'https://sample.com/scope/x/sub');
  });

});
