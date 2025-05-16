suite('Context Resolve', function () {
  suiteSetup(function() {
    return System.import('../../dist/extras/context-resolve.js').then(function() {});
  });

  test('Updated resolve returns a string value', function () {
    return System.import('fixtures/resolve.js').then(function (m) {
      const value = m.resolve('a')
      return typeof value
    })
    .then(function (type) {
      assert.equal(type, 'string');
    });
  });

  test('Updated resolve returns a original properties', function () {
    return System.import('fixtures/resolve.js').then(function (m) {
      return m.url
    }).then(function (url) {
      const test = url.match(/(\/resolve\.js)$/);
      assert.equal(test[0], '/resolve.js');
    });
  });
})