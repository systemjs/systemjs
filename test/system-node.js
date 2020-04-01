import { System as globalSystem, setBaseUrl, applyImportMap } from '../src/system-node.js';
import { resetBaseUrl } from '../src/common.js';
import assert from 'assert';
import path from 'path';

describe('NodeJS version of SystemJS', () => {
  let System;

  beforeEach(() => {
    System = new globalSystem.constructor();
    resetBaseUrl();
  });

  describe('resolve', () => {
    it('throws an error if base url is not set and no parentUrl provided', () => {
      assert.throws(() => System.resolve('./foo.js'))
    });

    it('works if a full url is provided', () => {
      assert.equal(System.resolve("https://unpkg.com/systemjs/dist/system.js"), "https://unpkg.com/systemjs/dist/system.js");
    });

    it('works if a full file path is provided', () => {
      assert.equal(System.resolve("file://Users/name/foo.js"), "file://Users/name/foo.js");
    });

    it('works with relative file path and specified parentUrl', () => {
      assert.equal(System.resolve('./foo.js', 'http://localhost:8321/path/'), 'http://localhost:8321/path/foo.js');
    });

    it('allows the base URL to be set to a valid full URL', () => {
      setBaseUrl('http://localhost:9650/some-prefix/');
      assert.equal(System.resolve('./foo.js'), 'http://localhost:9650/some-prefix/foo.js');
    });
  });

  describe('import maps', () => {
    it('can load a module from the network', async () => {
      applyImportMap(System, {imports: {"rxjs": "https://unpkg.com/@esm-bundle/rxjs@6.5.4-fix.0/system/rxjs.min.js"}});
      const rxjs = await System.import("rxjs");
      assert.ok(rxjs.Observable);
    });

    it('can load a module from disk without setting base url', async () => {
      console.log(0)
      applyImportMap(System, {imports: {"foo": 'file://' + path.join(process.cwd(), 'test/fixtures/register-modules/export.js')}});
      console.log(1)
      const foo = await System.import('foo');
      console.log(2)
      assert.equal(foo.p, 5);
    });
  });
});