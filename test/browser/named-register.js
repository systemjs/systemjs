suite('Named System.register', function() {
  suiteSetup(function() {
    return System.import('../../dist/extras/named-register.js').then(function() {});
  });

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

  // https://github.com/systemjs/systemjs/issues/2115
  test('loading a module after manual named register should return the loaded module', function () {
    define('a-named-thing', [], function () {
      return "named thing right before import";
    });

    return System.import('fixtures/amd-named-thing-as-dep.js').then(function (m) {
      assert.equal(m.default, 'The module depending on the named thing');
    });
  });

  // https://github.com/systemjs/systemjs/issues/2118
  test('named define without dependencies specified', function () {
    define('named-define-no-deps', function () {
      return 'The named-define-no-deps module';
    });

    return System.import('named-define-no-deps').then(function (m) {
      assert.equal(m.default, 'The named-define-no-deps module');
    });
  });

  // https://github.com/systemjs/systemjs/issues/2118
  test('named define with object', function () {
    define('named-define-object', { hello: 'there' });

    return System.import('named-define-object').then(function (m) {
      assert.equal(m.hello, 'there');
    });
  });

  test('named define() called by code outside of SystemJS modules during import', function () {
    const importPromise = System.import('fixtures/anonymous-define.js');

    define('outside-systemjs', {thing: 'wrong'});

    return importPromise.then(function (m) {
      assert.equal(m.default.thing, 'correct');
    });
  });

  test('named System.register() called by code outside of SystemJS modules during import', function () {
    const importPromise = System.import('fixtures/anonymous-register.js');

    System.register('named-register-outside-systemjs', [], function (_export) {
      _export('thing', 'wrong');
      return {};
    });

    return importPromise.then(function (m) {
      assert.equal(m.thing, 'correct');
    });
  });

  test('Ensure registerRegistry is cleaned up after import', function () {
    return System.import('./fixtures/browser/named-bundle.js').then(function (m) {
      assert.equal(m.a, 'b');
      return System.import('b');
    })
    .then(function (m) {
      assert.equal(m.b, 'b');
      assert.equal(System.registerRegistry['b'], null);
    });
  });

  test('Ensure resolve still works after registerRegistry cleanup', function () {
    return System.import('./fixtures/browser/named-bundle.js').then(function (m) {
      assert.equal(m.a, 'b');
      return System.import('b');
    })
    .then(function (m) {
      assert.equal(m.b, 'b');
      assert.equal(System.resolve('b'), 'b');
    });
  });

  test('Ensure import still works after registerRegistry cleanup', function () {
    return System.import('./fixtures/browser/named-bundle.js').then(function (m) {
      assert.equal(m.a, 'b');
      return System.import('b');
    })
    .then(function (m) {
      assert.equal(m.b, 'b');
      return System.import('b');
    })
    .then(function (m) {
      assert.equal(m.b, 'b');
    });
  });

  // https://github.com/systemjs/systemjs/issues/2349
  test('Bundles with named register do not instantiate last module more than once', function () {
    // First import the module via URL
    return System.import('./fixtures/browser/named-instantiate-count.js').then(function (urlModule) {
      // Then import the same module via named register name
      return System.import('named-instantiate-count').then(function (namedModule) {
        assert.equal(urlModule.getInstantiateCount(), 1);
        assert.equal(namedModule.getInstantiateCount(), 1);
        assert.equal(urlModule, namedModule);
      });
    });
  });

  // https://github.com/systemjs/systemjs/issues/2349
  test('Named bundles that self import', function () {
    // First import the module via URL
    return System.import('./fixtures/browser/named-self-import.js').then(function (urlModule) {
      // Then import the same module via named register name
      return System.import('named-self-import').then(function (namedModule) {
        assert.equal(urlModule.getInstantiateCount(), 1);
        assert.equal(namedModule.getInstantiateCount(), 1);
        assert.equal(urlModule, namedModule);
      });
    });
  });
});