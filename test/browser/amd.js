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

  test('Loading an AMD named define', function () {
    return System.import('fixtures/nameddefine.js').then(function (m1) {
      assert.ok(m1.default);
      assert.equal(m1.default.another, 'define');
    });
  });

  test('Loading an AMD bundle with multiple anonymous defines', function () {
    return System.import('fixtures/multiple-anonymous.js').then(function (m) {
      assert.ok(m.default);
      assert.equal(m.default.anon, true);
    });
  });

  test('AMD falls back to global support', function () {
    System.delete(System.resolve('fixtures/global.js'));
    delete self.jjQuery;
    return System.import('fixtures/global.js').then(function (m) {
      assert.ok(m.default);
      assert.equal(m.default.v, '2.0..0');
    });
  });

});