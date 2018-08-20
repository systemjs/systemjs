suite('Named exports', function () {

  test('Loading an AMD module with named exports', function () {
    System.delete(System.resolve('fixtures/amd-module.js'));
    return System.import('fixtures/amd-module.js').then(function (m) {
      assert.ok(m.default);
      assert.equal(m.dep, m.default.dep);
      assert.equal(m.amd, true);
    });
  });

  test('Loading a global with named exports support', function () {
    System.delete(System.resolve('fixtures/global.js'));
    delete self.jjQuery;
    console.log('GLOBAL');
    return System.import('fixtures/global.js').then(function (m) {
      console.log(m);
      assert.ok(m.default);
      assert.equal(m.default.v, '2.0..0');
    });
  });

  test('System.register untouched', function () {
    /* System.delete(System.resolve('fixtures/amd-module.js'));
    return System.import('fixtures/amd-module.js').then(function (m) {
      assert.ok(m.default);
      assert.equal(m.dep, m.default.dep);
      assert.equal(m.amd, true);
    });*/
  });

});