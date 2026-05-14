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

  describe('source map support', () => {
    it('remaps stack traces for modules with source maps', async () => {
      const url = 'file://' + path.join(process.cwd(), 'test/fixtures/register-modules/sourcemap-throwing.js');
      const mod = await System.import(url);
      try {
        mod.throwError();
        assert.fail('should have thrown');
      } catch (e) {
        assert.equal(e.message, 'source map test error');
        assert.ok(
          e.stack.includes('sourcemap-original.js'),
          'Expected stack trace to reference sourcemap-original.js but got:\n' + e.stack
        );
      }
    });

    it('evicts source map cache on System.delete', async () => {
      const { readFileSync, writeFileSync } = await import('fs');
      const mapPath = path.join(process.cwd(), 'test/fixtures/register-modules/sourcemap-throwing.js.map');
      const originalMap = readFileSync(mapPath, 'utf-8');

      const url = 'file://' + path.join(process.cwd(), 'test/fixtures/register-modules/sourcemap-throwing.js');

      // First import — triggers source map URL caching
      const mod1 = await System.import(url);
      try { mod1.throwError(); } catch (e) {
        assert.ok(e.stack.includes('sourcemap-original.js'), 'Initial source map should work');
      }

      // Swap the .map file to point to a different source name
      const altMap = originalMap.replace('sourcemap-original.js', 'sourcemap-alt.js');
      writeFileSync(mapPath, altMap);

      try {
        // Delete — should evict caches
        System.delete(url);

        // Re-import — should re-cache the URL and lazily read the modified .map
        const mod2 = await System.import(url);
        try { mod2.throwError(); } catch (e) {
          assert.ok(
            e.stack.includes('sourcemap-alt.js'),
            'Expected stack trace to reference sourcemap-alt.js (proving cache was evicted) but got:\n' + e.stack
          );
        }
      } finally {
        // Restore original .map file
        writeFileSync(mapPath, originalMap);
      }
    });

    it('preserves stack traces for modules without source maps', async () => {
      const url = 'file://' + path.join(process.cwd(), 'test/fixtures/register-modules/deperror.js');
      try {
        await System.import(url);
        assert.fail('should have thrown');
      } catch (e) {
        assert.ok(
          e.stack.includes('deperror.js'),
          'Expected stack trace to reference deperror.js but got:\n' + e.stack
        );
      }
    });
  });

  describe('import maps', () => {
    it('can load a module from the network', async () => {
      applyImportMap(System, {imports: {"rxjs": "https://cdn.jsdelivr.net/npm/@esm-bundle/rxjs@6.5.4-fix.0/system/rxjs.min.js"}});
      const rxjs = await System.import("rxjs");
      assert.ok(rxjs.Observable);
    });

    it('can load a module from disk without setting base url, before prepareImport is called', async () => {
      System.addImportMap({imports: {"foo": 'file://' + path.join(process.cwd(), 'test/fixtures/register-modules/export.js')}});
      const foo = await System.import('foo');
      assert.equal(foo.p, 5);
    });
  });
});
