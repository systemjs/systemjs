suite('Named exports', function () {
  System = new System.constructor();

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