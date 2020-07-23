import assert from 'assert';
import fs from 'fs';
import path from 'path';
import { resolveIfNotPlainOrUrl, IMPORT_MAP } from '../src/common.js';
import '../src/features/registry.js';
import { REGISTRY } from '../src/system-core.js';
import '../src/features/resolve.js';

const SystemLoader = System.constructor;

SystemLoader.prototype[IMPORT_MAP] = { imports: {}, scopes: {} };
SystemLoader.prototype.prepareImport = () => {};

describe('Core API', function () {
  const loader = new SystemLoader();
  loader.resolve = x => x;

  it('Should be an instance of itself', function () {
    assert(loader instanceof SystemLoader);
  });

  it('Supports loading', async function () {
    loader.instantiate = x => [[], _export => ({ execute () { _export('y', 42) } })];
    const x = await loader.import('x');
    assert.equal(x.y, 42);
  });

  it('Supports reloading cached modules', async function () {
    loader.instantiate = null;
    const x = await loader.import('x');
    assert.equal(x.y, 42);
  });

  it('Supports toStringTag on module namespaces', async function () {
    const x = await loader.import('x');
    assert.equal(x[Symbol.toStringTag], 'Module');
  });

  // TODO: namespace Object property definitions

  it('Supports System.register', async function () {
    loader.instantiate = x => {
      loader.register([], _export => ({ execute () { _export('y', 42) } }));
      return loader.getRegister();
    };
    const y = await loader.import('y');
    assert.equal(y.y, 42);
  });

  it('Supports createContext hook', async function () {
    loader.instantiate = x => {
      loader.register([], (_export, _context) => ({ execute () { _export('meta', _context.meta) } }));
      return loader.getRegister();
    };
    const createContext = loader.createContext;
    loader.createContext = function (id) {
      const context = createContext(id);
      context.custom = 'yay';
      return context;
    };
    const x = await loader.import('meta-test');
    assert.equal(x.meta.custom, 'yay');
  });

  describe('Tracing API', function () {
    it('Supports tracing loads', async function () {
      loader.instantiate = x => [[], _export => ({ execute () { _export('y', 42) } })];
      const loaded = [];
      loader.onload = function (err, x) {
        loaded.push(x);
      };
      const z = await loader.import('z');
      assert.equal(z.y, 42);
      assert.equal(loaded.length, 1);
      assert.equal(loaded[0], 'z');
    });

    it('Supports tracing load failures', async function () {
      loader.instantiate = x => { throw new Error('Problem') };
      const errors = [];
      loader.onload = function (err, id, deps) {
        console.log(err);
        errors.push(err);
      };
      try {
        await loader.import('f');
        assert.fail('Should have caught');
      }
      catch (e) {
        assert.equal(e.err, errors[0].err);
      }
    });

    it('Caches load failures', async function () {
      let err;
      try {
        await loader.import('f');
        assert.fail('Should have caught');
      }
      catch (e) {
        err = e;
      }
      try {
        await loader.import('f');
        assert.fail('Should have caught');
      }
      catch (e) {
        assert.equal(e, err);
      }
    });

    it("Should indicate the error source", async function () {
      loader.instantiate = (x) => {
        if (x === "b") {
          throw new Error("Instantiate Error");
        }
        return [
          ["b"],
          function (_e, _c) {
            return {
              setters: function () {},
              execute: function () {},
            };
          },
        ];
      };

      let sourceId;
      loader.onload = function (err, id, deps, isSource) {
        if (err && isSource) sourceId = id;
      };

      try {
        await loader.import("a");
        assert.fail("Should have caught");
      } catch (err) {
        assert.equal(sourceId, "b");
        delete loader[REGISTRY]["a"];
        delete loader[REGISTRY]["b"];
      }
    });

    it("Should fire onload for all errored sources and their parents just once through", async function () {
      let instantiateThrown;
      loader.instantiate = (x) => {
        if (!instantiateThrown && x === "b") {
          instantiateThrown = true;
          throw new Error("Instantiate Error");
        }
        return [
          ["b"],
          function (_e, _c) {
            return {
              setters: function () {},
              execute: function () {
                throw new Error("Execute Error");
              },
            };
          },
        ];
      };

      const errors = [];
      loader.onload = function (err, id, deps) {
        if (err) errors.push(id);
      };

      try {
        await loader.import("b");
        assert.fail("Should have caught");
      } catch (err) {
        assert.match(err.message, /instantiate/i);
        assert.equal(errors.length, 1);
        assert.equal(errors.length, 1);
        assert.equal(errors[0], "b");
      }

      try {
        await loader.import("a");
        assert.fail("Should have caught");
      } catch (err) {
        assert.equal(errors.length, 2);
        assert.equal(errors[1], "a");
      }

      delete loader[REGISTRY]["a"];
      delete loader[REGISTRY]["b"];
      errors.length = 0;

      try {
        await loader.import("a");
        assert.fail("Should have caught");
      } catch (err) {
        assert.match(err.message, /execute/i);
        assert.equal(errors.length, 2);
        assert.equal(errors[0], "b");
        assert.equal(errors[1], "a");
      }
    });
  });

  describe('Registry API', function () {
    it('Supports System.get', function () {
      assert.equal(loader.get('x').y, 42);
    });

    it('Supports System.has', function () {
      assert.equal(loader.has('x'), true);
    });

    it('Supports System.delete', function () {
      loader.delete('x');
      assert.equal(loader.get('x'), undefined);
    });

    it('Supports System.set', async function () {
      const _x = loader.set('http://x', { y: 43 });
      const x = await loader.import('http://x');
      assert.equal(x.y, 43);
      assert.equal(x, _x);
    });

    it('warns with invalid System.set', async function () {
      let numCalls = 0, lastWarn;
      const originalWarn = console.warn;
      console.warn = msg => {
        numCalls++;
        lastWarn = msg;
      };
      loader.set('bare-specifier', { y: 43 });
      console.warn = originalWarn;
      assert.equal(numCalls, 1);
      assert.match(lastWarn.message, /is not a valid URL to set in the module registry/);
    });

    it('does not warn with valid System.set', async function () {
      let numCalls = 0, lastWarn;
      const originalWarn = console.warn;
      console.warn = msg => {
        numCalls++;
        lastWarn = msg;
      };
      loader.set('http://localhost:8080/bare-specifier.js', { y: 43 });
      console.warn = originalWarn;
      assert.equal(numCalls, 0);
    });

    it('Supports System.resolve', async function () {
      const resolveReturnValue = System.resolve('http://x');
      const resolvedX = await resolveReturnValue;
      assert(typeof resolveReturnValue === 'string');
      assert.equal(resolvedX, 'http://x');
    });

    it('Supports iteration', async function () {
      loader.set('http://h', {a: 'b'});
      await loader.import('http://h');

      let foundH = false;
      for (let entry of loader.entries()) {
        if (entry[0] === 'http://h' && entry[1].a === 'b') {
          foundH = true;
        }
      }

      assert(foundH);
    });

    it('Supports System.entries', async function () {
      loader.set('http://i', {a: 'b'});
      await loader.import('http://i');

      assert([...loader.entries()].some(entry => entry[0] === 'http://i' && entry[1].a === 'b'));
    })
  });
});

describe('Loading Cases', function() {
  const loader = new SystemLoader();
  const baseUrl = path.resolve('test/fixtures').replace(/\\/g, '/') + '/';
  loader.resolve = (id, parent) => resolveIfNotPlainOrUrl(id, parent || baseUrl);
  loader.instantiate = async function (path) {
    const source = await new Promise((resolve, reject) => fs.readFile(path, (err, source) => err ? reject(err) : resolve(source.toString())));
    global.System = loader;
    eval(source + '//# sourceURL=' + path);
    return this.getRegister();
  };

  describe('Simple tests', function() {
    it('Should import a module', async function () {
      const m = await loader.import('./register-modules/no-imports.js');
      assert(m);
      assert.equal(m.asdf, 'asdf');
    });

    it('Should import a module cached', async function () {
      const m1 = await loader.import('./register-modules/no-imports.js');
      const m2 = await loader.import('./register-modules/no-imports.js');
      assert.equal(m1.asdf, 'asdf');
      assert.equal(m1, m2);
    });

    it('should import an es module with its dependencies', async function () {
      const m = await loader.import('./register-modules/es6-withdep.js');
      assert.equal(m.p, 'p');
    });

    it('should import without bindings', async function () {
      const m = await loader.import('./register-modules/direct.js');
      assert(!!m);
    });

    it('should support various es syntax', async function () {
      const m = await loader.import('./register-modules/es6-file.js');

      assert.equal(typeof m.q, 'function');

      let thrown = false;
      try {
        new m.q().foo();
      }
      catch(e) {
        thrown = true;
        assert.equal(e, 'g');
      }

      if (!thrown)
        throw new Error('Supposed to throw');
    });

    it('should resolve various import syntax', async function () {
      const m = await loader.import('./register-modules/import.js');
      assert.equal(typeof m.a, 'function');
      assert.equal(m.b, 4);
      assert.equal(m.c, 5);
      assert.equal(m.d, 4);
      assert.equal(typeof m.q, 'object');
      assert.equal(typeof m.q.foo, 'function');
    });

    it('should support import.meta.url', async function () {
      const m = await loader.import('./register-modules/moduleUrl.js');
      assert.equal(m.url, path.resolve('test/fixtures/register-modules/moduleUrl.js').replace(/\\/g, '/'));
    });
  });

  describe('Circular dependencies', function() {
    it('should resolve circular dependencies', async function () {
      const m1 = await loader.import('./register-modules/circular1.js');
      const m2 = await loader.import('./register-modules/circular2.js');

      assert.equal(m1.variable1, 'test circular 1');
      assert.equal(m2.variable2, 'test circular 2');

      assert.equal(m2.output, 'test circular 1');
      assert.equal(m1.output, 'test circular 2');
      assert.equal(m2.output1, 'test circular 2');
      assert.equal(m1.output2, 'test circular 1');

      assert.equal(m1.output1, 'test circular 2');
      assert.equal(m2.output2, 'test circular 1');
    });

    it('should update circular dependencies', async function () {
      const m = await loader.import('./register-modules/even.js');
      assert.equal(m.counter, 1);
      assert(m.even(10));
      assert.equal(m.counter, 7);
      assert(!m.even(15));
      assert.equal(m.counter, 15);
    });
  });

  describe('Loading order', function() {
    async function assertLoadOrder(module, exports) {
      const m = await loader.import('./register-modules/' + module);
      exports.forEach(function(name) {
        assert.equal(m[name], name);
      });
    }

    it('should load in order (a)', async function () {
      await assertLoadOrder('a.js', ['a', 'b']);
    });

    it('should load in order (c)', async function () {
      await assertLoadOrder('c.js', ['c', 'a', 'b']);
    });

    it('should load in order (s)', async function () {
      await assertLoadOrder('s.js', ['s', 'c', 'a', 'b']);
    });

    it('should load in order (_a)', async function () {
      await assertLoadOrder('_a.js', ['b', 'd', 'g', 'a']);
    });

    it('should load in order (_e)', async function () {
      await assertLoadOrder('_e.js', ['c', 'e']);
    });

    it('should load in order (_f)', async function () {
      await assertLoadOrder('_f.js', ['g', 'f']);
    });

    it('should load in order (_h)', async function () {
      await assertLoadOrder('_h.js', ['i', 'a', 'h']);
    });
  });

  describe('Top-level await', function () {
    it('Should support top-level await', async function () {
      const m = await loader.import('./tla/main.js');
      assert.equal(m.passed, true);
    });
    it('should support async graphs', async function () {
      const loader = new SystemLoader();
      loader.resolve = function (id) { return id };
      loader.instantiate = function (id) {
        if (id === 'main') {
          return [
            ['dep'],
            function(_export, _context) {
              var value
              return {
                setters: [
                  function(dep) {
                    value = dep.default
                  },
                ],
                execute: async function() {
                  _export('default', value);
                },
              }
            },
          ]
        }

        if (id === 'dep') {
          return [
            [],
            function(_export, _context) {
              return {
                setters: [],
                execute: async function() {
                  _export("default", 42)
                },
              }
            },
          ]
        }
      };

      const m = await loader.import('main');
      assert.equal(m.default, 42);
    });
  });

  describe('Export variations', function () {
    it('should resolve different export syntax', async function () {
      const m = await loader.import('./register-modules/export.js');
      assert.equal(m.p, 5);
      assert.equal(typeof m.foo, 'function');
      assert.equal(typeof m.q, 'object');
      assert.equal(typeof m.default, 'function');
      assert.equal(m.s, 4);
      assert.equal(m.t, 4);
      assert.equal(typeof m.m, 'object');
    });

    it('should resolve "export default"', async function () {
      const m = await loader.import('./register-modules/export-default.js');
      assert.equal(m.default(), 'test');
    });

    it('should support simple re-exporting', async function () {
      const m = await loader.import('./register-modules/reexport1.js');
      assert.equal(m.p, 5);
    });

    it('should support re-exporting binding', async function () {
      await loader.import('./register-modules/reexport-binding.js');
      const m = await loader.import('./register-modules/rebinding.js');
      assert.equal(m.p, 4);
    });

    it('should support re-exporting with a new name', async function () {
      const m = await loader.import('./register-modules/reexport2.js');
      assert.equal(m.q, 4);
      assert.equal(m.z, 5);
    });

    it('should support re-exporting', async function () {
      const m = await loader.import('./register-modules/export-star.js');
      assert.equal(m.foo, 'foo');
      assert.equal(m.bar, 'bar');
    });

    // TODO: Fix Babel output for this one
    // Plus add tests for reexporting live bindings, namespaces exported themselves with reexports with live bindings
    it.skip('should support re-exporting overwriting', async function () {
      var m = await loader.import('./register-modules/export-star2.js');
      assert.equal(m.bar, 'bar');
      assert.equal(typeof m.foo, 'function');
    });
  });

  describe('Errors', function () {
    const testPath = path.resolve('test/fixtures').replace(/\\/g, '/') + '/';

    async function getImportError(module) {
      try {
        await loader.import(module);
        assert.fail('Should have failed');
      }
      catch(e) {
        return e.toString();
      }
    }

    it('Should throw if instantiate hook doesnt instantiate', async function () {
      const loader = new SystemLoader();
      loader.resolve = x => x;
      loader.instantiate = () => {};
      try {
        await loader.import('x');
        assert.fail('Should have failed');
      }
      catch (e) {
        assert.ok(e.toString().includes('Module x did not instantiate'));
      }
    });

    it('should give a plain name error', async function () {
      // prototype fallback
      delete loader.resolve;
      const err = await getImportError('plain-name');
      assert.ok(err.toString().includes("Unable to resolve bare specifier 'plain-name'"));
    });

    it('should throw if on syntax error', async function () {
      loader.resolve = (id, parentUrl) => resolveIfNotPlainOrUrl(id, parentUrl || testPath);
      const err = await getImportError('./register-modules/main.js');
      assert.equal(err, 'Error: dep error');
    });

    it('should throw what the script throws', async function () {
      const err = await getImportError('./register-modules/deperror.js');
      assert.equal(err, 'Error: dep error');
    });

    it('Should support System.delete for retrying execution errors', async function () {
      const loader = new SystemLoader();
      loader.resolve = x => x;
      let thrown = false;
      loader.instantiate = () => {
        loader.register([], _export => ({
          execute () {
            if (!thrown) {
              thrown = true;
              throw new Error('Execution Error');
            }
            _export('ok', true);
          }
        }));
        return loader.getRegister();
      };
      try {
        await loader.import('x');
        assert.fail('Should have failed');
      }
      catch (e) {
        assert.equal(e.toString(), 'Error: Execution Error');
      }
      loader.delete('x');
      const m = await loader.import('x');
      assert(m.ok);
    });

    it('Should always support retrying instantiation errors', async function () {
      const loader = new SystemLoader();
      loader.resolve = x => x;
      let thrown = false;
      loader.instantiate = () => {
        if (!thrown) {
          thrown = true;
          throw new Error('Instantiate Error');
        }
        loader.register([], _export => ({ execute () { _export('ok', true) } }));
        return loader.getRegister();
      };
      try {
        await loader.import('x');
        assert.fail('Should have failed');
      }
      catch (e) {
        assert.equal(e.toString(), 'Error: Instantiate Error');
      }
      loader.delete('x');
      const m = await loader.import('x');
      assert(m.ok);
    });

    it('404 error', async function () {
      const err = await getImportError('./register-modules/load-non-existent.js');
      assert.equal(err, 'Error: ENOENT: no such file or directory, open \'' + testPath.replace(/\//g, path.sep) + 'register-modules' + path.sep + 'non-existent.js\'');
    });
  });
});
