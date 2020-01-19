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
      assert.equal(m.a, 'b');
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

  // https://github.com/systemjs/systemjs/issues/2073
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

  // https://github.com/systemjs/systemjs/issues/2073
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

  // https://github.com/systemjs/systemjs/issues/2107
  test('Loading a named register module as both top level import and linked dependency', function () {
    return System.import('named-register-single-execute').then(function (m) {
      assert.equal(m.bonjour, 'bonjour');
      assert.equal(window.namedRegisterExecutes, 1);
    }).then(function () {
      return System.import('./fixtures/browser/named-register-single-execute-as-dep.js')
    }).then(function (m) {
      assert.equal(m.bonjour, 'bonjour');
      assert.equal(window.namedRegisterExecutes, 1);
    });
  });

  // https://github.com/systemjs/systemjs/issues/2103
  test('loading named define module should work and should not instantiate it twice', function () {
    return System.import('fixtures/amd-named-single-execute.js').then(function (m) {
      assert.equal(m.default, 'The first named AMD module');
      assert.equal(numNamedAMDExecutions, 1);
    }).then(function () {
      return System.import('fixtures/amd-named-single-execute.js').then(function (m) {
        assert.equal(m.default, 'The first named AMD module');
        assert.equal(numNamedAMDExecutions, 1);
      });
    });
  });
});