suite('Named System.register', function() {
  test('Loading a named System.register bundle', function () {
    return System.import('./fixtures/browser/named-bundle.js').then(function (m) {
      assert.equal(m.a, 'b');
      return System.import('b');
    })
    .then(function (m) {
      assert.equal(m.b, 'b');
    });
  });

  test('Loading a named AMD bundle', function () {
    return System.import('./fixtures/browser/named-amd.js').then(function (m) {
      assert.equal(Object.keys(m).length, 2);
      return System.import('c');
    })
    .then(function (m) {
      assert.equal(m.default.a, 'b');
    });
  });

  test('Loading a single named System.register module', function () {
    return System.import('./fixtures/browser/single-named-module.js').then(function (m) {
      assert.equal(Object.keys(m).length, 1);
      assert.equal(m.b, 'c');
    });
  });

  test('Loading a named AMD module with named-exports enabled (no dependencies)', function () {
    define('named-amd-define-no-deps', [], function() {
      return {foo: 'bar'};
    });

    return System.import('named-amd-define-no-deps').then(function (m) {
      assert.ok(m.default);
      assert.ok(m.default.foo);
      assert.ok(m.foo);
    });
  });

  test('Loading a named AMD module with named-exports enabled (with dependencies)', function () {
    define('named-amd-define-with-deps', ['b'], function() {
      return {foo: 'bar'};
    });

    return System.import('named-amd-define-with-deps').then(function (m) {
      assert.ok(m.default);
      assert.ok(m.default.foo);
      assert.ok(m.foo);
    });
  });
});