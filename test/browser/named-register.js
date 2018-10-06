suite('Named System.register', function() {
  test('Loading a named System.register bundle', function () {
    return System.import('./fixtures/browser/named-bundle.js').then(function (m) {
      assert.equal(Object.keys(m).length, 0);
      return System.import('bundle:a');
    })
    .then(function (m) {
      assert.equal(m.a, 'b');
    });
  });
});