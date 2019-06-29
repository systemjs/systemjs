suite('SystemJS Standard Tests', function() {
  
  test('Syntax errors', function () {
    // mocha must ignore script errors as uncaught
		window.onerror = undefined;
    return System.import('fixtures/error-loader.js').then(function () {
      assert.fail('Should fail');
    }, function (e) {
      assert.ok(e);
      assert.ok(e instanceof ReferenceError);
    });
  });

  test('Fetch errors', function () {
    return System.import('fixtures/error-loader2.js').then(function () {
      assert.fail('Should fail');
    }, function (e) {
      console.log(e.message);
      assert.ok(e);
      assert.ok(e.message.indexOf('Error loading ') === 0);
      assert.ok(e.message.indexOf('non-existent') !== -1);
      assert.ok(e.message.indexOf('error-loader2.js') !== -1);
    });
  });

  test('String encoding', function () {
    return System.import('fixtures/string-encoding.js').then(function (m) {
      assert.equal(m.pi, decodeURI('%CF%80'));
      assert.equal(m.emoji, decodeURI('%F0%9F%90%B6'));
    });
  });


  test('Import full URL', function () {
    return System.import(window.location.href.substr(0, window.location.href.lastIndexOf('/')) + '/fixtures/browser/string-encoding.js').then(function () {
      assert.ok(true);
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
    return System.import('fixtures/global.js').then(function (m) {
      assert.ok(m.default);
      assert.equal(m.default.some, 'thing');
    });
  });

  test('Parallel Global loading', function () {
    var scriptsToLoad = [];
    for (var i = 1; i < 11; i++)
      scriptsToLoad.push('fixtures/globals/import' + i + '.js');

    return Promise.all(scriptsToLoad.map(function (s, index) {
      return System.import(s).then(function (m) {
        assert.equal(m.default, index + 1);
      });
    }));
  });

  test('Catches global script errors', function () {
    // mocha must ignore script errors as uncaught
		window.onerror = undefined;
    return System.import('fixtures/eval-err.js').then(function () {
      assert.fail('Should fail');
    }, function (e) {
      assert.ok(e);
      assert.equal(e.message, 'Global eval error');
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

  test('JSON modules', function () {
    return System.import('fixtures/json.json').then(function (m) {
      assert.equal(m.default.json, 'module');
    })
    .then(function () {
      return System.import('fixtures/json-error.json');
    })
    .catch(function (err) {
      assert.ok(err instanceof SyntaxError);
    })
    .then(function () {
      return System.import('fixtures/json-error.json');
    })
    .catch(function (err) {
      assert.ok(err instanceof SyntaxError);
    });
  });

  if (typeof Worker !== 'undefined')
  test('Using SystemJS in a Web Worker', function () {
    const worker = new Worker('./browser/worker.js');

    return new Promise(function (resolve) {
      worker.onmessage = function (e) {
        assert.equal(e.data.p, 'p');
        resolve();
      };
    });
  });

  if (typeof WebAssembly !== 'undefined' && typeof process === 'undefined')
  test('Loading WASM', function () {
    return System.import('fixtures/wasm/example.wasm')
    .then(function (m) {
      assert.equal(m.exampleExport(1), 2);
    });
  });

  if (typeof WebAssembly !== 'undefined' && typeof process === 'undefined')
  test('Loading WASM over 4KB limit', function () {
    return System.import('fixtures/wasm/addbloated.wasm')
    .then(function (m) {
      assert.equal(m.addTwo(1, 1), 2);
    });
  });
});
