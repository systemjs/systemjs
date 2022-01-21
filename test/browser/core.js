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
      assert.ok(e);
      console.log(e);
      assert.ok(e.message.indexOf('Error loading ') !== -1);
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

  test('import.meta.resolve package maps', function () {
    return System.import('fixtures/resolve.js').then(function (m) {
      return m.resolve('a')
    })
    .then(function (resolved) {
      assert.equal(resolved, rootURL + 'b');
    });
  });

  test('import.meta.resolve package maps paths', function () {
    return System.import('fixtures/resolve.js').then(function (m) {
      return m.resolve('a/')
    })
    .then(function (resolved) {
      assert.equal(resolved, baseURL + 'fixtures/browser/a/');
    });
  });

  test('Contextual package maps', function () {
    return System.import('fixtures/scope-test/index.js')
    .then(function (m) {
      assert.equal(m.mapdep, 'mapdep');
    });
  });

  test('import.meta.resolve contextual package maps', function () {
    return System.import('fixtures/resolve.js').then(function (m) {
      return m.resolve('maptest', baseURL + 'fixtures/browser/scope-test/index.js')
    })
    .then(function (resolved) {
      assert.equal(resolved, baseURL + 'fixtures/browser/contextual-map-dep.js');
    });
  });

  test('import.meta.resolve contextual package maps fail', function () {
    return System.import('fixtures/resolve.js').then(function (m) {
      return m.resolve('maptest')
    })
    .then(function (resolved) {
      assert.ok(false);
    }, function (error) {
      assert.equal(error.message.indexOf('Unable to resolve'), 0);
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

  test('firstGlobalProp option', function () {
    Object.getPrototypeOf(System).firstGlobalProp = true;
    return System.import('fixtures/multiple-globals.js').then(function (m) {
      delete Object.getPrototypeOf(System).firstGlobalProp;
      assert.ok(m.default);
      assert.equal(m.default.foo1, 'foo1');
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

  test('Errors for bad Content-Type headers', function () {
    return System.import('fixtures/content-type-none.json')
    .catch(function (err) {
      assert.ok(/Unknown Content-Type.*error#4/i.test(err));
    })
    .then(function () {
      return System.import('fixtures/content-type-xml.json')
    })
    .catch(function (err) {
      assert.ok(/Unknown Content-Type.*error#4/i.test(err));
    })
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

  test('should load a css module', function () {
    return System.import('fixturesbase/css-modules/a.css').then(function (m) {
      assert.ok(m);
      assert.ok(isCSSStyleSheet(m.default));
      document.adoptedStyleSheets = document.adoptedStyleSheets.concat(m.default);
    });
  });

  test('should support application/javascript css module override', function () {
    return System.import('fixturesbase/css-modules/javascript.css').then(function (m) {
      assert.ok(m);
      assert.ok(m.css, 'module');
    });
  });

  test('should throw when trying to load an HTML module', function () {
    return System.import('/test/test.html').then(function () {
      throw Error("Loading html modules isn't implemented, but attempting to do so didn't throw an Error");
    }, function (err) {
      assert.ok(err);
    });
  });

  test('should load <script type=systemjs-module>', function () {
    const resolved = System.resolve('/test/fixtures/browser/systemjs-module-script.js');
    assert.ok(System.has(resolved));
    assert.equal(System.get(resolved).foo, 'bar');
  });

  test('should remove import: prefix from <script type=systemjs-module>', function () {
    const resolved = System.resolve('/test/fixtures/browser/systemjs-module-script2.js');
    assert.ok(System.has(resolved));
    assert.equal(System.get(resolved).hello, 'there');
  });

  test('should load <script type=systemjs-module> that is in the dom before systemjs is loaded', function () {
    const resolved = System.resolve('/test/fixtures/browser/systemjs-module-early.js');
    assert.ok(System.has(resolved));
    assert.equal(System.get(resolved).hi, 'bye');
  });

  test('should load auto import', function () {
    const resolved = System.resolve('/test/fixtures/browser/auto-import.js');
    assert.ok(System.has(resolved));
    assert.equal(System.get(resolved).auto, 'import');
  });

  test('import.meta.resolve', function () {
    return System.import('fixtures/resolve.js').then(function (m) {
      return m.resolve('./test.js')
    })
    .then(function (resolved) {
      assert.equal(resolved, baseURL + 'fixtures/browser/test.js');
    });
  });

  test('non-enumerable __esModule property export (issue 2090)', function () {
    return System.import('fixtures/__esModule.js').then(function (m) {
      // Even though __esModule is not enumerable on the exported object, it should be preserved on the systemjs namespace
      assert.ok(m.__esModule);
    });
  });

  test('should support depcache', function () {
    return System.import('/test/fixtures/browser/depcache.js').then(function (m) {
      assert.ok(m);
      assert.equal(m.default, '10th module');
    });
  });

  test('should not get confused by filenames in url hash when resolving module type', function () {
    return System.import('fixturesbase/css-modules/hash.css?foo=bar.html').then(function (m) {
      assert.ok(m);
      assert.ok(isCSSStyleSheet(m.default));
    });
  });

  test('should not get confused by filenames in search params hash when resolving module type', function () {
    return System.import('fixturesbase/css-modules/search-param.css?param=foo.html').then(function (m) {
      assert.ok(m);
      assert.ok(isCSSStyleSheet(m.default));
    });
  });

  // https://github.com/systemjs/systemjs/issues/2286
  test('should allow deletion of modules that failed to instantiate', function () {
    return System.import('fixtures/link-error.js').then(
      function () {
        throw Error('Link error expected');
      },
      function () {
        assert.ok(System.delete(System.resolve('fixtures/link-error.js')));
        assert.ok(System.delete(System.resolve('fixtures/link-error-child.js')));
        assert.ok(System.delete(System.resolve('fixtures/not-found.js')));
        assert.ok(System.delete(System.resolve('fixtures/link-error-child2.js')));
      }
    );
  });

  test('Calls the fetch hook when fetching import maps', function () {
    const importMapSrc = 'https://example.com/importmap-test.js';
    const scriptElement = document.createElement('script');
    scriptElement.type = 'systemjs-importmap';
    scriptElement.src = importMapSrc;
    document.head.appendChild(scriptElement);

    const originalFetch = System.constructor.prototype.fetch;

    let fetchHookCalled = false;

    System.constructor.prototype.fetch = function(url) {
      if (url === importMapSrc) {
        fetchHookCalled = true;
      }

      return originalFetch.apply(this, arguments);
    }

    // Reprocess import maps
    System.prepareImport(true);

    System.constructor.prototype.fetch = originalFetch;

    assert.ok(fetchHookCalled);
  });

  var isIE11 = typeof navigator !== 'undefined' && navigator.userAgent.indexOf('Trident') !== -1;

  function isCSSStyleSheet(obj) {
    if (isIE11) {
      return obj.cssRules;
    } else {
      return obj instanceof CSSStyleSheet;
    }
  }
});
