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
  var cwd = process.cwd();
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

  test('Support the empty module', function () {
    return System.import('@empty').then(function (m) {
      ok(m, 'No empty module');
    });
  });

  test('Loading an empty module', function () {
    return System.import('tests/empty.js').then(function (m) {
      if (typeof process !== 'undefined')
        ok(m);
      else
        throw new Error('Empty module should not supported in browsers.');
    }, function (err) {
      if (typeof process === 'undefined')
        ok(err);
      else
        throw new Error('Empty module should be supported in Node.');
    })
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

  test('Empty module', function () {
    return System.resolve('@empty').then(function (resolved) {
      ok(resolved == '@empty');
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
    System.config({
      bundles: {
        'tests/group-test.js': ['group-a']
      }
    });
    return Promise.resolve()
    .then(function () {
      if (typeof process !== 'undefined')
        return System.import('tests/group-test.js');
    })
    .then(function () {
      return System.import('group-a').then(function (m) {
        ok(m);
      });
    });
  });

  test('Loading bundle not containing the module', function () {
    System.config({
      bundles: {
        'tests/group-test.js': ['not-in-bundle']
      }
    });
    return System.import('tests/group-test.js').catch(function (e) {
      ok(e.toString().indexOf('Error: Module instantiation did not call an anonymous or correctly named System.register.') === 0);
    });
  });

  test('Loading named System.register', function () {
    System.config({
      bundles: {
        'tests/mixed-bundle.js': ['tree/third', 'tree/cjs', 'tree/jquery', 'tree/second', 'tree/global', 'tree/amd', 'tree/first']
      }
    });
    return Promise.resolve()
    .then(function () {
      if (typeof process !== 'undefined')
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

  if (typeof process === 'undefined')
  test('Contextual dynamic import', function () {
    return System.import('tests/dynamic-import' + (typeof process === 'undefined' ? '-register' : '') + '.js').then(function (m) {
      return m.lazy();
    })
    .then(function (lazyValue) {
      console.log(lazyValue);
      ok(lazyValue === 5);
    });
  });

  test('getConfig', function () {
    ok(System.getConfig().bundles);
  });

  if (typeof WebAssembly !== 'undefined')
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

  // Node-specific tests
  if (typeof process !== 'undefined') {
    test('Node resolution', function () {
      return System.import('babel-core').then(function (babel) {
        ok(babel.transform);
      });
    });

    test('Node resolution via baseURL', function () {
      return System.import('tests/node-resolve.js').then(function (resolved) {
        ok(resolved.transform);
      });
    });
  }
});

System.register([], function () { return function () {} });
