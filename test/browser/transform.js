suite('Transform Loader', function() {
  System = new System.constructor();
  let translateCnt = 0;
  System.transform = function (url, source) {
    translateCnt++;
    return source;
  };

  suite('SystemJS standard tests', function () {

    test('String encoding', function () {
      return System.import('./fixtures/browser/string-encoding.js').then(function (m) {
        assert.equal(m.pi, decodeURI('%CF%80'));
        assert.equal(m.emoji, decodeURI('%F0%9F%90%B6'));
      });
    });

    test('Package maps', function () {
      return Promise.all([
        System.resolve('a'),
        System.resolve('f'),
        System.resolve('a/b'),
        System.resolve('b/c'),
        System.resolve('b.js'),
        System.resolve('b.js/c'),
        System.resolve('g/x')
      ]).then(function (a) {
        assert.equal(a[0], rootURL + 'b');
        assert.equal(a[1], 'a:');
        assert.equal(a[2], baseURL + 'fixtures/browser/a/b');
        assert.equal(a[3], rootURL + 'd/c');
        assert.equal(a[4], 'http://jquery.com/jquery.js');
        assert.equal(a[5], 'http://jquery.com/c');
        assert.equal(a[6], 'https://site.com/x');
      });
    });

    test('Contextual package maps', function () {
      return System.import('fixtures/scope-test/index.js')
      .then(function (m) {
        assert.equal(m.mapdep, 'mapdep');
      });
    });

    test('Loading named System.register fails', function () {
      return System.import('fixtures/named-register.js')
      .then(function () {
        assert.fail('Should fail');
      })
      .catch(function (err) {
        assert.ok(err);
      });
    });

    test('Global script loading', function () {
      return System.import('fixtures/global4.js').then(function (m) {
        assert.equal(m.default, 'global4');
      });
    });

    test('Contextual dynamic import', function () {
      return System.import('fixtures/dynamic-import-register.js').then(function (m) {
        return m.lazy();
      })
      .then(function (lazyValue) {
        assert.equal(lazyValue, 5);
      });
    });

    if (typeof WebAssembly !== 'undefined' && typeof process === 'undefined')
    test('Loading WASM', function () {
      return System.import('fixtures/wasm/example.wasm')
      .then(function (m) {
        assert.equal(m.exampleExport(1), 2);
      });
    });
    
    test('Loading CSS', function () {
      return System.import('./fixtures/css-modules/a.css')
      .then(function (m) {
        assert.ok(m);
        assert.ok(m.default instanceof CSSStyleSheet);
      });
    });

    test('Verification', function () {
      assert.equal(translateCnt, 8);
    });
  });
});
