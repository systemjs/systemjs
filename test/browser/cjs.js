suite('CommonJS tests', function () {

  test('Loading a CJS module', function () {
    return System.import('fixtures/cjs-modules/cjs-module.js').then(function (m) {
      assert.ok(m.default);
      assert.equal(m.default.cjs, true);
    });
  });

  test('Loading a CJS module with dependency', function () {
    return System.import('fixtures/cjs-modules/cjs-module-with-dep.js').then(function (m) {
      assert.ok(m.default);
      assert.equal(m.default.cjs, true);
      assert.equal(m.default.dep.cjs, 'dep');
    });
  });

});
