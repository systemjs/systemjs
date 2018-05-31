if (typeof System === 'undefined') {
  global.System = require('../node-production.js');
  System.config({
    baseURL: 'test'
  });
}

var base;
if (typeof document !== 'undefined') {
  base = document.baseURI.substr(0, document.baseURI.lastIndexOf('/') + 1);
}
else {
  var cwd = process.cwd().replace(/\\/g, '/');
  base = 'file://' + (cwd[0] !== '/' ? '/' : '') + cwd + '/test/';
}

suite('SystemJS Standard Tests', function() {

  function ok(assertion, message) {
    if (!assertion)
      throw new Error(message);
  }

  test('System version', function () {
    ok(System.version.match(/^\d+\.\d+\.\d+(-\w+)?/));
  });

  test('Error handling2', function () {
    return System.import('tests/error-loader2.js').then(function () {
      throw new Error('Should fail');
    }, function (e) {
      if (typeof console != 'undefined' && console.error)
        console.error(e);
      ok(true);
    });
  });

  test('String encoding', function () {
    return System.import('tests/string-encoding.js').then(function (m) {
      ok(m.pi === decodeURI('%CF%80'));
      ok(m.emoji === decodeURI('%F0%9F%90%B6'));
    });
  });

  test('Paths configuration', function () {
    System.config({
      map: {
        'f/': 'a:',
        'g': 'https://site.com'
      },
      paths: {
        'a': 'b',
        'a:': 'c/',
        'b/': 'd/',
        'b.js': 'http://jquery.com/jquery.js',
        'https://site.com/': 'https://another.com/'
      }
    });

    return Promise.all([
      System.resolve('a'),
      System.resolve('f/b'),
      System.resolve('a/b'),
      System.resolve('b/c'),
      System.resolve('b'),
      System.resolve('b.js'),
      System.resolve('b.js/c'),
      System.resolve('g/x')
    ]).then(function (a) {
      ok(a[0] === base + 'b');
      ok(a[1] === base + 'c/b');
      ok(a[2] === base + 'b/b');
      ok(a[3] === base + 'd/c');
      ok(a[4] === base + 'b');
      ok(a[5] === 'http://jquery.com/jquery.js');
      ok(a[6] === 'http://jquery.com/jquery.js/c');
      ok(a[7] === 'https://another.com/x');
    });
  });

  test('Map configuration', function () {
    System.config({
      map: {
        'maptest': 'tests/map-test.js'
      }
    });
    return System.import('maptest').then(function (m) {
      ok(m.maptest == 'maptest', 'Mapped module not loaded');
    });
  });

  test('Map configuration subpath', function () {
    System.config({
      map: {
        'maptest': 'tests/map-test'
      }
    });
    return System.import('maptest/sub.js').then(function (m) {
      ok(m.maptest == 'maptestsub', 'Mapped folder not loaded');
    });
  });

  test('Contextual map configuration', function () {
    System.config({
      map: {
        'tests/contextual-test': 'tests/contextual-test/contextual-map.js',
        'tests/contextual-test/': {
          maptest: '../contextual-map-dep.js'
        }
      }
    });
    return System.import('tests/contextual-test').then(function (m) {
      ok(m.mapdep == 'mapdep', 'Contextual map dep not loaded');
    });
  });

  test('Contextual map configuration for a package that is a file', function () {
    System.config({
      map: {
        jquery: 'tests/jquery.js',
        'tests/jquery.js': {
          a: 'tests/amd-dep-A.js'
        }
      }
    });
    return System.import('tests/jquery.js').then(function (m) {
      ok(m.default == 10);
    });
  });

  test('System.register Circular', function () {
    return System.import('tests/register-circular1.js').then(function (m) {
      ok(m.q == 3, 'Binding not allocated');
      ok(m.r == 5, 'Binding not updated');
    });
  });

  test('System.register module name arg', function () {
    return System.import('tests/module-name.js').then(function (m) {
      ok(m.name == base + 'tests/module-name.js');
    });
  });

  test('System.register group linking test', function () {
    return Promise.resolve()
    .then(function () {
      return System.import('tests/group-test.js');
    })
    .then(function () {
      return System.import('group-a').then(function (m) {
        ok(m);
      });
    });
  });

  test('Loading named System.register', function () {
    return Promise.resolve()
    .then(function () {
      return System.import('tests/mixed-bundle.js');
    })
    .then(function () {
      return System.import('tree/third').then(function (m) {
        ok(m.some == 'exports');
      });
    });
  });

  test('Loading a System.registerdynamic module (not bundled)', function () {
    return System.import('tests/registerdynamic-main.js')
    .then(function (m) {
      ok(typeof m.dependency === 'function');
      ok(m.dependency() === 'ok');
    });
  });

  if (typeof process === 'undefined') {
    test('Global script loading', function () {
      return System.import('tests/global.js').then(function (m) {
        ok(m.jjQuery && m.another, 'Global objects not defined');
      });
    });

    test('Global script with var syntax', function () {
      return System.import('tests/global-single.js').then(function (m) {
        ok(m.default == 'bar', 'Wrong global value');
      });
    });

    test('Global script with multiple objects the same', function () {
      return System.import('tests/global-multi.js').then(function (m) {
        if (m.jjQuery)
          ok(false);
        ok(m.default.jquery == 'here', 'Multi globals not detected');
      });
    });

    test('Global script multiple objects different', function () {
      return System.import('tests/global-multi-diff.js').then(function (m) {
        ok(m.foo == 'barz');
        ok(m.baz == 'chaz');
        ok(m.zed == 'ted');
      });
    });

    test('Parallel Global loading', function () {
      var scriptsToLoad = [];
      for (var i = 1; i < 11; i++)
        scriptsToLoad.push('tests/globals/import' + i + '.js');

      return Promise.all(scriptsToLoad.map(function (s, index) {
        return SystemJS.import(s).then(m => {
          ok(m.default === index + 1, 'Invalid global value');
        });
      }));
    });

    test('Loading an AMD module', function () {
      return System.import('tests/amd-module.js').then(function (m) {
        ok(m.default.amd == true, 'Incorrect module');
        ok(m.default.dep.amd == 'dep', 'Dependency not defined');
      });
    });

    test('Loading AMD CommonJS form', function () {
      return System.import('tests/amd-cjs-module.js').then(function (m) {
        ok(m.default.test == 'hi', 'Not defined');
      });
    });

    test('Contextual dynamic import', function () {
      return System.import('tests/dynamic-import' + (typeof process === 'undefined' ? '-register' : '') + '.js').then(function (m) {
        return m.lazy();
      })
      .then(function (lazyValue) {
        console.log(lazyValue);
        ok(lazyValue === 5);
      });
    });
  }

  test('getConfig', function () {
    ok(System.getConfig().depCache);
  });

  // Node-specific tests
  if (typeof process !== 'undefined') {
    test('Node resolution', function () {
      return System.import('babel-core').then(function (babel) {
        ok(babel.default.transform);
      });
    });

    test('Node resolution via baseURL', function () {
      return System.import('tests/node-resolve.js').then(function (resolved) {
        ok(resolved.default.transform);
      });
    });
  }

  if (typeof WebAssembly !== 'undefined' && typeof process === 'undefined')
  test('Loading WASM', function () {
    System.config({
      wasm: true,
      map: {
        'example': 'tests/wasm/example.js'
      }
    });
    return System.import('tests/wasm/example.wasm')
    .then(function (m) {
      ok(m.exampleExport(1) === 2);
    });
  });

  test('Top-level await', function () {
    return System.import('tests/tla/main.js')
    .then(function (m) {
      ok(m.passed === true);
    });
  });
});

System.register([], function () { return function () {} });
