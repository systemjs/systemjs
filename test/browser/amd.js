suite('AMD tests', function () {

  test('Loading an AMD module', function () {
    return System.import('fixtures/amd-module.js').then(function (m) {
      assert.ok(m.default);
      assert.equal(m.default.amd, true);
      assert.equal(m.default.dep.amd, 'dep');
    });
  });

  test('Loading AMD exports dependency', function () {
    return System.import('fixtures/amd-exports.js').then(function (m) {
      assert.ok(m.default);
      assert.equal(m.default.test, 'hi');
      assert.equal(m.default.dep.amd, 'dep');
    });
  });

  test('AMD Circular', function () {
    return System.import('fixtures/amd-circular1.js').then(function (m) {
      assert.ok(m.default);
      assert.equal(m.default.outFunc(), 5);
    });
});

});