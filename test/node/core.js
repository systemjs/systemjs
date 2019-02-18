import assert from 'assert';
import path from 'path';

import { global, URL, pathToFileURL } from '../../src/common';
import '../../dist/system-node';

const rootUrl = pathToFileURL('/');
const baseUrl = pathToFileURL(path.resolve('./test') + '/');

const importMapUrl = new URL('./fixtures/browser/importmap.json', baseUrl);

const SystemLoader = global.System.constructor;

global.window = global;

describe('SystemJS Standard Tests - Node.js', function() {
  const baseURL = baseUrl.href;
  const rootURL = rootUrl.href;

  before(() => {
    global['window'] = global;
  });

  after(() =>{
    delete global['window'];
  });

  beforeEach(() => {
    global.System = new SystemLoader({ baseUrl, importMapUrl });
  });

  it('Syntax errors', function () {
    return System.import('fixtures/error-loader.js').then(function () {
      assert.fail('Should fail');
    }, function (e) {
      assert.ok(e);
      assert.ok(e instanceof ReferenceError);
    });
  });

  it('Fetch errors', function () {
    return System.import('fixtures/error-loader2.js').then(function () {
      assert.fail('Should fail');
    }, function (e) {
      assert.ok(e.message.indexOf('Error loading ') === 0);
      assert.ok(e.message.indexOf('non-existent') !== -1);
      assert.ok(e.message.indexOf('error-loader2.js') !== -1);
    });
  });

  it('String encoding', function () {
    return System.import('fixtures/string-encoding.js').then(function (m) {
      assert.equal(m.pi, decodeURI('%CF%80'));
      assert.equal(m.emoji, decodeURI('%F0%9F%90%B6'));
    });
  });


  it('Package maps', function () {
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


  it('Contextual package maps', function () {
    return System.import('fixtures/scope-test/index.js')
    .then(function (m) {
      assert.equal(m.mapdep, 'mapdep');
    });
  });

  it('Loading named System.register fails', function () {
    return System.import('fixtures/named-register.js')
    .then(function () {
      assert.fail('Should fail');
    })
    .catch(function (err) {
      assert.ok(err);
    });
  });

  it.skip('Global script loading', function () {
    return System.import('fixtures/global.js').then(function (m) {
      assert.ok(m.default);
      assert.equal(m.default.some, 'thing');
    });
  });

  it.skip('Parallel Global loading', function () {
    var scriptsToLoad = [];
    for (var i = 1; i < 11; i++)
      scriptsToLoad.push('fixtures/globals/import' + i + '.js');

    return Promise.all(scriptsToLoad.map(function (s, index) {
      return System.import(s).then(function (m) {
        assert.equal(m.default, index + 1);
      });
    }));
  });

  it.skip('Catches global script errors', function () {
    // mocha must ignore script errors as uncaught
    window.onerror = undefined;
    return System.import('fixtures/eval-err.js').then(function () {
      assert.fail('Should fail');
    }, function (e) {
      assert.ok(e);
      assert.equal(e.message, 'Global eval error');
    });
  });

  it('Contextual dynamic import', function () {
    return System.import('fixtures/dynamic-import-register.js').then(function (m) {
      return m.lazy();
    })
    .then(function (lazyValue) {
      assert.equal(lazyValue, 5);
    });
  });

  if (typeof Worker !== 'undefined') {
    it('Using SystemJS in a Web Worker', function () {
      const worker = new Worker('./browser/worker.js');

      return new Promise(function (resolve) {
        worker.onmessage = function (e) {
          assert.equal(e.data.p, 'p');
          resolve();
        };
      });
    });
  }

  if (typeof WebAssembly !== 'undefined') {
    it.skip('Loading WASM', function () {
      return System.import('fixtures/wasm/example.wasm')
      .then(function (m) {
        assert.equal(m.exampleExport(1), 2);
      });
    });
  }

  if (typeof WebAssembly !== 'undefined') {
    it.skip('Loading WASM over 4KB limit', function () {
      return System.import('fixtures/wasm/addbloated.wasm')
      .then(function (m) {
        assert.equal(m.addTwo(1, 1), 2);
      });
    });
  }
});
