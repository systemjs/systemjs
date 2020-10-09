suite('Named exports', function () {
  suiteSetup(function() {
    return System.import('../../dist/extras/amd.js').then(function() {});
  });

  test('Loading an AMD module with named exports', function () {
    return System.import('fixtures/amd-module.js').then(function (m) {
      assert.ok(m.default);
      assert.equal(m.dep, m.default.dep);
      assert.equal(m.amd, true);
    });
  });

  test('Loading an AMD exports module with named exports', function () {
    return System.import('fixtures/amd-exports.js').then(function (m) {
      assert.ok(m.default);
      assert.equal(m.dep, m.default.dep);
      assert.equal(m.test, 'hi');
    });
  });

  test('Loading an UMD module with default function and named exports', function () {
    return System.import('fixtures/umd-default-function-with-named-exports-module.js').then(function (m) {
      assert.ok(m.default);
      assert.equal(m.default.name, 'umdExportFunctionName')
      assert.equal(m.dep, m.default.dep);
      assert.equal(m.umd, true);
    });
  });

  test('Loading an UMD module with default object and named exports', function () {
    return System.import('fixtures/umd-default-object-with-named-exports-module.js').then(function (m) {
      assert.ok(m.default);
      assert.equal(m.dep, m.default.dep);
      assert.equal(m.umd, true);
      assert.equal(m.default.hasOwnProperty, Object.prototype.hasOwnProperty)
    });
  });

  test('Loading an UMD module with default with object null prototype', function () {
    return System.import('fixtures/umd-default-object-with-null-prototype-module.js').then(function (m) {
      assert.ok(m.default);
      assert.equal(m.dep, m.default.dep);
      assert.equal(m.umd, true);
      assert.equal(m.default.hasOwnProperty, undefined)
    });
  });

  test('Loading a global with named exports support', function () {
    return System.import('fixtures/global3.js').then(function (m) {
      assert.ok(m.default);
      assert.equal(m.default.some, 'thing');
    });
  });

  test('System.register untouched', function () {
    return System.import('fixtures/register-default.js').then(function (m) {
      assert.ok(m.default);
      assert.equal(m.default.name, 'value');
      assert.equal(m.name, undefined);
    });
  });

});