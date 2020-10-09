import nodeSystem from '../dist/system-node.cjs';
import assert from 'assert';
import path from 'path';
import { pathToFileURL } from 'url';

const { System: globalSystem, setBaseUrl, applyImportMap } = nodeSystem;

describe('NodeJS version of SystemJS', () => {
  let System;

  beforeEach(() => {
    System = new globalSystem.constructor();
  });

  describe('resolve', () => {
    it('provides a default base url if one is not specified', () => {
      assert.equal(System.resolve('./foo.js'), pathToFileURL(process.cwd()).href + '/foo.js');
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
      setBaseUrl(System, 'http://localhost:9650/some-prefix/');
      assert.equal(System.resolve('./foo.js'), 'http://localhost:9650/some-prefix/foo.js');
    });
  });

  describe('import maps', () => {
    it('can load a module from the network', async () => {
      applyImportMap(System, {imports: {"rxjs": "https://unpkg.com/@esm-bundle/rxjs@6.5.4-fix.0/system/rxjs.min.js"}});
      const rxjs = await System.import("rxjs");
      assert.ok(rxjs.Observable);
    });

    it('can load a module from disk without setting base url, before prepareImport is called', async () => {
      applyImportMap(System, {imports: {"foo": 'file://' + path.join(process.cwd(), 'test/fixtures/register-modules/export.js')}});
      const foo = await System.import('foo');
      assert.equal(foo.p, 5);
    });
  });
});