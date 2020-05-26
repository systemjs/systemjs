suite('ESM tests', function () {

  test('Export default', function () {
    return System.import('fixtures/es-modules/export-default.js').then(function (m) {
      assert.equal(typeof m.default, 'function');
      assert.equal(m.default(), 'test');
    });
  });

  test('Named export, no import', function () {
    return System.import('fixtures/es-modules/no-imports.js').then(function (m) {
      assert.equal(m.asdf, 'asdf');
    });
  });

  test('Named export', function () {
    return System.import('fixtures/es-modules/s.js').then(function (m) {
      assert.equal(m.a, 'a');
      assert.equal(m.b, 'b');
      assert.equal(m.c, 'c');
      assert.equal(m.s, 's');
    });
  });

  test('Named export & named re-export 1', function () {
    return System.import('fixtures/es-modules/_e.js').then(function (m) {
      assert.equal(m.c, 'c');
      assert.equal(m.e, 'e');
    });
  });

  test('Named export & named re-export 2', function () {
    return System.import('fixtures/es-modules/_f.js').then(function (m) {
      assert.equal(m.f, 'f');
      assert.equal(m.g, 'g');
    });
  });

  test('Named export & re-exports', function () {
    return System.import('fixtures/es-modules/_h.js').then(function (m) {
      assert.equal(m.a, 'a');
      assert.equal(m.h, 'h');
      assert.equal(m.i, 'i');
    });
  });

  test('Named import, no export', function () {
    return System.import('fixtures/es-modules/direct.js').then(function (m) {
      assert.ok(m);
    });
  });

  test('Named import, no export', function () {
    return System.import('fixtures/es-modules/reexport-binding.js').then(function (m) {
      assert.ok(m);
    });
  });

  test('Named export class', function () {
    return System.import('fixtures/es-modules/es6-file.js').then(function (m) {

      assert.equal(m.default, 4);

      assert.equal(typeof m.q, 'function');
      assert.equal(m.q.name, 'q');

      var instance = new m.q();
      try {
        instance.foo();
      } catch (err) {
        assert.equal(err, 'g');
      }
    });
  });

  test('Export imported', function () {
    return System.import('fixtures/es-modules/import.js').then(function (m) {
      assert.equal(typeof m.a, 'function');
      assert.equal(m.a.name, 'bar');
      assert.equal(m.a(), undefined);

      assert.equal(m.b, 4);
      assert.equal(m.c, 5);
      assert.equal(m.d, 4);

      assert.equal(typeof m.q, 'object');
      assert.equal(JSON.stringify(m.q), '{"m":{},"p":5,"q":{},"s":4,"t":4}');
    });
  });

  test('Named re-export', function () {
    return System.import('fixtures/es-modules/es6-withdep.js').then(function (m) {
      assert.equal(m.p, 'p');
    });
  });

  test('Named export and export star twice', function () {
    return System.import('fixtures/es-modules/export-star2.js').then(function (m) {
      assert.equal(m.bar, 'bar');

      assert.equal(typeof m.foo, 'function');
      assert.equal(m.foo.name, 'foo');
      assert.equal(m.foo(), undefined);
    });
  });

  test('Export module URL', function () {
    return System.import('fixtures/es-modules/moduleUrl.js').then(function (m) {
      assert.equal(m.url, 'http://localhost:8080/test/fixtures/browser/es-modules/moduleUrl.js');
    });
  });

  test('Fail on loading non-existent file', function () {
    return System.import('fixtures/es-modules/load-non-existent.js').catch(function (err) {
      assert.ok(err);
    });
  });

  test('Cyclic 1', function () {
    return System.import('fixtures/es-modules/circular1.js').then(function (m) {
      assert.equal(typeof m.fn1, 'function');
      assert.equal(m.fn1.name, 'fn1');
      assert.equal(m.fn1(), undefined);

      assert.equal(m.output, 'test circular 2');
      assert.equal(m.output1, 'test circular 2');
      assert.equal(m.output2, 'test circular 1');
      assert.equal(m.variable1, 'test circular 1');
    });
  });

  test('Cyclic 2', function () {
    return System.import('fixtures/es-modules/circular2.js').then(function (m) {
      assert.equal(typeof m.fn2, 'function');
      assert.equal(m.fn2.name, 'fn2');
      assert.equal(m.fn2(), undefined);

      assert.equal(m.output, 'test circular 1');
      assert.equal(m.output1, 'test circular 2');
      assert.equal(m.output2, 'test circular 1');
      assert.equal(m.variable2, 'test circular 2');
    });
  });

  test('should update cyclic dependencies', function () {
    return System.import('fixtures/es-modules/even.js').then(function (m) {
      assert.equal(m.counter, 1);
      assert.ok(m.even(10));

      // Named exports won't update since it's a primitive
      // assert.equal(m.counter, 7);
      // assert.ok(!m.even(15));
      // assert.equal(m.counter, 15);
    });
  });

  // test('Import erroneous module', function () {
  //   return System.import('fixtures/es-modules/deperror.js').catch(function (err) {
  //     assert.ok(err);
  //   });
  // });

  // test('Module with erroneous dependency', function () {
  //   return System.import('fixtures/es-modules/main.js').catch(function (err) {
  //     assert.ok(err);
  //   });
  // });
});