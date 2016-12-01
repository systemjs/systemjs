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
    })
  })

  test('Support the empty module', function () {
    return System.import('@empty').then(function (m) {
      ok(m, 'No empty module');
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
      ok(m.name == System.baseURL + 'tests/module-name.js');
    });
  });

  test('System.register group linking test', function () {
    System.config({
      bundles: {
        'tests/group-test.js': ['group-a']
      }
    });
    return System.import('group-a').then(function (m) {
      ok(m);
    });
  });

  test('Loading named System.register', function () {
    System.config({
      bundles: {
        'tests/mixed-bundle.js': ['tree/third', 'tree/cjs', 'tree/jquery', 'tree/second', 'tree/global', 'tree/amd', 'tree/first']
      }
    });
    return System.import('tree/third').then(function (m) {
      ok(m.some == 'exports');
    });
  });

  test('Loading a System.registerdynamic module (not bundled)', function () {
    return System.import('tests/registerdynamic-main.js')
    .then(function (m) {
      ok(typeof m.dependency === 'function');
      ok(m.dependency() === 'ok');
    });
  });

  if (typeof WebAssembly !== 'undefined')
  test('Loading WASM', function () {
    System.config({ wasm: true });
    return System.import('tests/answer.wasm')
    .then(function (m) {
      ok(m.getAnswer() === 42);
    });
  });
});

System.register([], function () { return function () {} });
