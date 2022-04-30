"format global";

const assert = require('assert');

suite('SystemJS Standard Tests', function() {

  function ok(assertion, message) {
    if (!assertion)
      throw new Error(message);
  }

  test('System version', function () {
    ok(System.version.match(/^\d+\.\d+\.\d+(-\w+)?/));
  });

  test('Object.prototype.toString(new Module())== "[object Module]"', function () {
    return System.import('tests/global.js').then(function () {
      var m = System.registry.get(System.normalizeSync('tests/global.js'));
      ok(!Symbol.toStringTag || Object.prototype.toString.call(m) == '[object Module]');
    });
  });

  test('Error handling', function () {
    return System.import('tests/error-loader.js').then(function () {
      throw new Error('Should fail');
    }, function (e) {
      ok(true);
    });
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

  test('Eval error caching', function () {
    var g = typeof self !== 'undefined' ? self : global;
    return System.import('tests/eval-err.js').then(function (m) {
      throw new Error('Should fail');
    }, function (e) {
      ok(g.errCnt === 1);

      return System.import('tests/eval-err-parent.js')
      .then(function (m) {
        throw new Error('Should fail');
      }, function (e) {
        ok(g.errCnt === 1);
        ok(g.peerExecuted === true);
        ok(System.delete(System.resolveSync('tests/eval-err.js')));

        return System.import('tests/eval-err.js')
        .then(function (m) {
          throw new Error('Should fail');
        }, function (e) {
          ok(g.errCnt === 2);
        });
      });
    });
  });

  if (typeof process !== 'undefined')
  test('Load error clearing', function () {
    require('fs').unlinkSync('test/tests/error-module.js', 'exportxx function hello () {}');
    return System.import('tests/error-module.js').then(function () {
      throw new Error('Should not error first time');
    }, function (err) {
      ok(err);

      require('fs').writeFileSync('test/tests/error-module.js', 'export function hello () { return "world" }');

      return System.import('tests/error-module-parent.js').then(function (m) {
        throw new Error('Should error the second time');
      }, function (err) {
        ok(err);

        ok(System.registry.delete(System.resolveSync('tests/error-module.js')));
        return System.import('tests/error-module-parent.js').then(function (m) {
          ok(true);
        });
      });
    });
  });

  test('Global script loading', function () {
    return System.import('tests/global.js').then(function (m) {
      ok(m.jjQuery && m.another, 'Global objects not defined');
    });
  });

  test('Global script with var syntax', function () {
    return System.import('tests/global-single.js').then(function (m) {
      ok(m == 'bar', 'Wrong global value');
    });
  });

  test('Global script with multiple objects the same', function () {
    return System.import('tests/global-multi.js').then(function (m) {
      ok(m.jquery == 'here', 'Multi globals not detected');
    });
  });

  test('Global script multiple objects different', function () {
    return System.import('tests/global-multi-diff.js').then(function (m) {
      ok(m.foo == 'barz');
      ok(m.baz == 'chaz');
      ok(m.zed == 'ted');
    });
  });

  test('Global script loading with inline shim', function () {
    return System.import('tests/global-inline-dep.js').then(function (m) {
      ok(m == '1.8.3', 'Global dependency not defined');
    });
  });

  test('Global script with inline exports', function () {
    return System.import('tests/global-inline-export.js').then(function (m) {
      ok(m == 'r', 'Inline export not applied');
    });
  });

  test('Global script with shim config', function () {
    System.config({
      meta: {
        'tests/global-shim-config.js': {
          deps: ['./global-shim-config-dep.js']
        }
      }
    });
    // System. = { deps: ['./global-shim-config-dep.js'] };
    return System.import('tests/global-shim-config.js').then(function (m) {
      ok(m == 'shimmed', 'Not shimmed');
    });
  });

  test('Global script with inaccessible properties', function () {
    Object.defineProperty(System.global, 'errorOnAccess', {
      configurable: true,
      enumerable: true,
      get: function () { throw Error('This property is inaccessible'); },
    });

    return System.import('tests/global-inaccessible-props.js').then(function (m) {
      ok(m == 'result of global-inaccessible-props', 'Failed due to a inaccessible property');

      delete System.global.errorOnAccess;
    });
  });

  test('Global script loading that detects as AMD with shim config', function () {
    System.config({
      meta: {
        'tests/global-shim-amd.js': { format: 'global' }
      }
    });

    return System.import('tests/global-shim-amd.js').then(function (m) {
      ok(m == 'global', 'Not shimmed');
    });
  });

  test('Global script with exports as an array', function () {
    System.config({
      meta: {
        'tests/global-exports-array.js': {
          exports: ['A', 'B']
        }
      }
    });

    return System.import('tests/global-exports-array.js').then(function (m) {
      ok(m.A == 'A');
      ok(m.B == 'B');
      ok(!m.C);
    });
  });

  test('Global with encapsulated execution', function () {
    System.config({
      meta: {
        'tests/global-encapsulation.js': {
          encapsulateGlobal: true
        }
      }
    });

    return System.import('tests/global-encapsulation.js').then(function (m) {
      ok(m == 'encapsulated global');
      ok(System.global.globalName === undefined);
    });
  });

  test('Meta should override meta syntax', function () {
    System.config({
      meta: {
        'tests/meta-override.js': { format: 'esm' }
      }
    });
    return System.import('tests/meta-override.js').then(function (m) {
      ok(m.p == 'value', 'Not ES6');
    });
  });

  test('SystemJS.isModule', function () {
    System.config({
      meta: {
        'tests/meta-override.js': { format: 'esm' }
      }
    });
    return System.import('tests/meta-override.js').then(function (m) {
      ok(System.isModule(m));
    });
  });

  test('String encoding', function () {
    return System.import('tests/string-encoding.js').then(function (m) {
      ok(m.pi === decodeURI('%CF%80'));
      ok(m.emoji === decodeURI('%F0%9F%90%B6'));
    });
  });

  if (typeof process !== 'undefined')
  test('Importing non-ascii paths in Node', function () {
    return System.import('tests/副本.js').then(function (m) {
      ok(m.p === 5);
    });
  });

  test('Support the empty module', function () {
    return System.import('@empty').then(function (m) {
      ok(m, 'No empty module');
    });
  });

  test('Global script with shim config exports', function () {
    System.config({
      meta: {
        'tests/global-shim-config-exports.js': {
          exports: 'p'
        }
      }
    });
    return System.import('tests/global-shim-config-exports.js').then(function (m) {
      ok(m == 'export', 'Exports not shimmed');
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
      var base = System.resolveSync('');
      ok(base.length > 10);
      ok(a[0] === base + 'b');
      ok(a[1] === base + 'c/b');
      ok(a[2] === base + 'b/b');
      ok(a[3] === base + 'd/c');
      ok(a[4] === base + 'd');
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
        'tests/contextual-test': {
          '.': './contextual-map.js',
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
      packages: {
        'tests/jquery.js': {
          meta: {
            '*': {
              deps: ['a']
            }
          },
          map: {
            'a': 'tests/amd-dep-A.js'
          }
        }
      },
      map: {
        jquery: 'tests/jquery.js'
      }
    });
    return System.import('tests/jquery.js').then(function (m) {
      ok(m.default == 10);
    });
  });

  test('Relative map and package config', function () {
    System.config({
      map: {
        helloworld: './'
      },
      packages: {
        helloworld: {
          main: './helloworld.js'
        }
      }
    });

    return System.normalize('helloworld').then(function (normalized) {
      ok(normalized.substr(normalized.length - 14, 14) === '/helloworld.js' && normalized[normalized.length - 15] !== '/');
    });
  });

  test('Package with json loader', function () {
    System.config({
      paths: {
        'app/': 'tests/json-pkg/'
      },
      packages: {
        app: {
          format: 'register',
          meta: {
            '*.json': {
              loader: 'tests/json-loader.js'
            }
          }
        }
      }
    });

    return System.import('app/json.json').then(function (m) {
      ok(m.val === 'val');
    });
  });

  test('Package map with shim', function () {
    System.config({
      packages: {
        'tests/shim-package': {
          meta: {
            '*': {
              deps: ['shim-map-dep']
            }
          },
          map: {
            'shim-map-dep': '../shim-map-test-dep.js'
          }
        }
      }
    });
    return System.import('tests/shim-package/shim-map-test.js').then(function (m) {
      ok(m == 'depvalue', 'shim dep not loaded');
    });
  });

  test('Loading an AMD module', function () {
    System.config({
      meta: {
        'tests/amd-module.js': {
          format: 'amd'
        }
      }
    });
    return System.import('tests/amd-module.js').then(function (m) {
      ok(m.amd == true, 'Incorrect module');
      ok(m.dep.amd == 'dep', 'Dependency not defined');
    });
  });

  test('AMD detection test', function () {
    return System.import('tests/amd-module-2.js').then(function (m) {
      ok(m.amd);
    });
  });

  test('AMD detection test with comments', function () {
    return System.import('tests/amd-module-3.js').then(function (m) {
      ok(m.amd);
    });
  });

  test('AMD detection test with byte order mark (BOM)', function () {
    return System.import('tests/amd-module-bom.js').then(function (m) {
      ok(m.amd);
    });
  });

  test('AMD with dynamic require callback', function () {
    return System.import('tests/amd-dynamic-require.js').then(function (m) {
      return new Promise(function (resolve, reject) {
        m.onCallback(function (m) {
          ok(m === 'dynamic');
          resolve();
        });
      });
    });
  });

  test('Loading an AMD wildcard bundle fail if not match', function () {
    System.config({
      bundles: {
        'tests/amd-bundle.js': ['bundle-*.css']
      }
    });
    return Promise.all([
      System.import('bundle-x/path/to/bundle-module-1').then(function (m) {
        throw new Error('Should fail');
      }, function(e) {
        if (typeof console != 'undefined' && console.error)
          console.error(e);
        ok(true);
      })
    ]);
  });

  test('Loading an AMD bundle', function () {
    System.config({
      map: {
        helloworld: './'
      },
      packages: {
        helloworld: {
          main: './helloworld.js',
          defaultExtension: false
        }
      }
    });
    System.config({
      bundles: {
        'tests/amd-bundle.js': ['bundle-*']
      }
    });
    return Promise.all([
      System.import('bundle-1').then(function (m) {
        ok(m.defined == true);
      }),
      System.import('bundle-2').then(function (m) {
        ok(m.defined == true);
      }),
      System.import('bundle-x/path/to/bundle-module-2').then(function (m) {
        ok(m.defined == true);
      })
    ]);
  });

  test('Loading an AMD named define', function () {
    return System.import('tests/nameddefine.js').then(function (m1) {
      ok(m1.converter, 'Showdown not loaded');
      return System.import('another-define').then(function (m2) {
        ok(m2.named === 'define', 'Another module is not defined');
      });
    });
  });

  test('Loading an AMD bundle with an anonymous define', function () {
    return System.import('tests/anon-named.js').then(function (m) {
      ok(m.anon == true);
    });
  });

  test('Loading an AMD bundle with multiple anonymous defines', function () {
    return System.import('tests/multiple-anonymous.js').then(function (m) {
      ok(m.anon);
      ok(m.named === 'named');
    });
  });

  test('Loading AMD CommonJS form', function () {
    return System.import('tests/amd-cjs-module.js').then(function (m) {
      ok(m.test == 'hi', 'Not defined');
    });
  });

  test('AMD contextual require toUrl', function () {
    return System.import('tests/amd-contextual.js').then(function (m) {
      ok(m.name == System.baseURL + 'tests/amd-contextual.js');
      ok(m.rel == System.baseURL + 'rel-path.js');
    });
  });

  test('AMD race condition test', function () {
    System.config({
      bundles: {
        "tests/out.js": ["tests/lib/modB.js"]
      }
    });

    var resolve;
    var p = new Promise(function (_resolve) {
      resolve = _resolve;
    });

    var completed = 0;
    function completeImport() {
      if (++completed == 3) {
        ok(true);
        resolve();
      }
    }

    System.import('tests/modA.js').then(completeImport);
    setTimeout(function () {
      System.import('tests/modC.js').then(completeImport);
      System.import('tests/lib/modB.js').then(completeImport);
    }, 10);

    return p;
  });

  test('Loading a CommonJS module', function () {
    return System.import('tests/common-js-module.js').then(function (m) {
      ok(m.hello == 'world', 'module value not defined');
      ok(m.first == 'this is a dep', 'dep value not defined');
    });
  });

  test('CommonJS mapping test', function () {
    System.config({
      map: {
        // baseURI in NodeJS tests is different
        wire: typeof process !== 'undefined' ? './test/tests/wire/index.js' : '../test/tests/wire/index.js'
      },
      packages: {
        wire: { format: 'cjs' }
      }
    });

    return System.import('wire').then(function (m) {
      ok(m);
    });
  });

  test('Loading a CommonJS module with this', function () {
    return System.import('tests/cjs-this.js').then(function (m) {
      ok(m.asdf == 'module value')
    });
  });

  test('Falsy __useDefault CJS Module', function () {
    return System.import('tests/falsy_use_default/a.js').then(function (m) {
      ok(m === 0);
    });
  });

  test('CommonJS setting module.exports', function () {
    return System.import('tests/cjs-exports.js').then(function (m) {
      ok(m.e == 'export');
    });
  });

  test('CommonJS detection variation 1', function () {
    return System.import('tests/commonjs-variation.js').then(function (m) {
      ok(m.e === System.registry.get('@empty'));
    });
  });

  test('CommonJS detection variation 2', function () {
    return System.import('tests/commonjs-variation2.js').then(function (m) {
      // we no longer extend unenumerable properties
      ok(m.OpaqueToken);
      ok(m);
    });
  });

  test('CommonJS detection test with byte order mark (BOM)', function () {
    return System.import('tests/cjs-exports-bom.js').then(function (m) {
      ok(m.foo == 'bar');
    });
  });

  test('CommonJS module detection test with byte order mark (BOM)', function () {
    return System.import('tests/cjs-module-bom.js').then(function (m) {
      ok(m.foo == 'bar');
    });
  });

  test('CommonJS require variations', function () {
    return System.import('tests/commonjs-requires.js').then(function (m) {
      ok(m.d1 == 'd');
      ok(m.d2 == 'd');
      ok(m.d3 == "require('not a dep')");
      ok(m.d4 == "text/* require('still not a dep') text");
      ok(m.d5 == 'text \'quote\' require("yet still not a dep")');
      ok(m.d6 == 'd6');
      ok(m.d7 == 'export');
      ok(m.d8 == `string literal require("string literal not a dep")`);
    });
  });

  test('CommonJS require variations in minified files', function () {
    return System.import('tests/commonjs-minified-requires.js').then(function (m) {
      assert.equal(m.d0, 'd6');
      assert.equal(m.d1, 'd');
      assert.equal(m.d2, 'd');
      assert.equal(m.d3, "require('not a dep')");
      assert.equal(m.d4, "text/* require('still not a dep') text");
      assert.equal(m.d5, 'text \'quote\' require("yet still not a dep")');
      assert.equal(m.d6, `in single quoted text require("also not a dep 1")`);
      assert.equal(m.d6a, 'd');
      assert.equal(m.d7, `in double quoted text require('also not a dep 2')`);
      assert.equal(m.d7a, 'd');
      assert.equal(m.d8, `in string literal text require('also not a dep 3')`);
      assert.equal(m.d8a, 'd');
      assert.equal(m.d9, 'd');
      assert.equal(m.d10, 'end');
    });
  });

  test('CommonJS globals', function () {
    System.config({
      meta: {
        'tests/commonjs-globals.js': {
          globals: {
            process: './cjs-process.js'
          }
        }
      }
    });
    return System.import('tests/commonjs-globals.js').then(function (m) {
      ok(m.process.env.NODE_ENV)
    });
  });

  test('CommonJS require.resolve', function () {
    return System.import('tests/cjs-resolve.js').then(function (m) {
      ok(m.substr(m.length - 12, 12) == 'test/tests/a');
    });
  })

  test('Loading a UMD module', function () {
    return System.import('tests/umd.js').then(function (m) {
      ok(m.d == 'hi', 'module value not defined');
    });
  });

  test('Loading AMD with format hint', function () {
    return System.import('tests/amd-format.js').then(function (m) {
      ok(m.amd == 'amd', 'AMD not loaded');
    });
  });

  test('Loading CJS with format hint', function () {
    return System.import('tests/cjs-format.js').then(function (m) {
      ok(m.cjs == 'cjs', 'CJS not loaded');
    });
  });

  test('CommonJS globals', function () {
    return System.import('tests/cjs-globals.js').then(function (m) {
      ok(m.filename.match(/tests\/cjs-globals\.js$/));
      ok(m.dirname.match(/\/tests$/));
      ok(m.global === (typeof self !== 'undefined' ? self : global));
    });
  });

  test('Versions', function () {
    return System.import('tests/zero@0.js').then(function (m) {
      ok(m == '0');
    });
  });

  test('Loading a module with # in the name', function () {
    return System.import('tests/#.js').then(function (m) {
      ok(m == '#');
    });
  });

  test('Instantiation plugin', function () {
    System.registry.set('instantiate-plugin', System.newModule({
      fetch: function () {
        return ''
      },
      instantiate: function (key) {
        return {
          value: 'plugin'
        };
      }
    }));
    return System.import('test!instantiate-plugin').then(function (m) {
      ok(m.value === 'plugin');
    });
  });

  test('Locate plugin', function () {
    return System.import('tests/x!tests/locate-plugin.js').then(function (m) {
      ok(m.x === 'x');
    });
  });

  test('Simple compiler Plugin', function () {
    System.config({
      map: {
        'coffee': 'tests/compiler-plugin.js'
      }
    });
    return System.import('tests/compiler-test.coffee!').then(function (m) {
      ok(m.output == 'plugin output', 'Plugin not working.');
      ok(m.extra == 'yay!', 'Compiler not working.');
    });
  });

  test('Mapping a plugin argument', function () {
    System.config({
      map: {
        bootstrap: 'tests/bootstrap@3.1.1',
        coffee: 'tests/compiler-plugin.js'
      }
    });
    return System.import('bootstrap/test.coffee!coffee').then(function (m) {
      ok(m.extra == 'yay!', 'not working');
    });
  });

  test('Using pluginFirst config', function () {
    System.config({
      pluginFirst: true,
      map: {
        bootstrap: 'tests/bootstrap@3.1.1',
        coffee: 'tests/compiler-plugin.js'
      }
    });
    return System.import('coffee!bootstrap/test.coffee').then(function (m) {
      ok(m.extra == 'yay!', 'not working');
      System.config({
        pluginFirst: false
      });
    });
  });

  test('Advanced compiler plugin', function () {
    return System.import('tests/compiler-test.js!tests/advanced-plugin.js').then(function (m) {
      ok(m == 'custom fetch:' + System.baseURL + 'tests/compiler-test.js!' + System.baseURL + 'tests/advanced-plugin.js', m);
    });
  });

  test('Plugin as a dependency', function () {
    System.config({
      map: {
        css: 'tests/css.js'
      }
    });
    return System.import('tests/cjs-loading-plugin.js').then(function (m) {
      ok(m.pluginSource == 'this is css');
    });
  });

  test('Text plugin', function () {
    System.config({
      meta: {
        '*.html': {
          loader: 'tests/text-plugin.js'
        }
      }
    });

    return System.import('tests/test-text.html').then(function (m) {
      ok(m[0] === '<');
    });
  });

  if (typeof process === 'undefined') {
    test('Disallow scriptLoad with plugin', function () {
      System.config({
        meta: {
          "*.js": {
            scriptLoad: true,
            format: "register"
          },
          "tests/text-plugin.js": {
            scriptLoad: false,
            format: "cjs"
          }
        }
      });
      return System.import('tests/script-load-test.js!tests/text-plugin.js').then(function (m) {
        ok(m.startsWith("define"));
      }).finally(function () {

        //Cleanup after tests
        System.config({
          meta: {
            "*.js": {
              scriptLoad: undefined,
              format: undefined
            },
            "tests/text-plugin.js": {
              scriptLoad: undefined,
              format: undefined
            }
          }
        });
      });
    })
  }

  test('AMD Circular', function () {
    return System.import('tests/amd-circular1.js').then(function (m) {
      ok(m.outFunc() == 5, 'Expected execution');
    });
  });

  test('CJS Circular', function () {
    return System.import('tests/cjs-circular1.js').then(function (m) {
      ok(m.first == 'second value');
      ok(m.firstWas == 'first value', 'Original value');
    });
  });

  test('System.register Circular', function () {
    System.config({
      meta: {
        'tests/register-circular1.js': {
          scriptLoad: true
        }
      }
    });
    return System.import('tests/register-circular1.js').then(function (m) {
      ok(m.q == 3, 'Binding not allocated');
      ok(m.r == 5, 'Binding not updated');
    });
  });

  test('System.register regex test', function () {
    return System.import('tests/register-regex.js').then(function (m) {
      ok(true);
    });
  });

  test('System.register regex test 2', function () {
    return System.import('tests/register-regex-2.js').then(function (m) {
      ok(m);
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

  System.config({
    bundles: {
      'tests/mixed-bundle.js': ['tree/third', 'tree/cjs', 'tree/jquery', 'tree/second', 'tree/global', 'tree/amd', 'tree/first']
    }
  });

  test('Bundle meta', function () {
    return System.import('tests/bundle-meta.js').then(function () {
      return System.import('asdf').then(function (m) {
        ok(m.bundle === 'module');
      });
    });
  });

  test('Loading AMD from a bundle', function () {
    return System.import('tree/amd').then(function (m) {
      ok(m.is == 'amd');
    });
  });

  test('Loading CommonJS from a bundle', function () {
    return System.import('tree/cjs').then(function (m) {
      ok(m.cjs === true);
    });
  });

  test('Loading a Global from a bundle', function () {
    return System.import('tree/global').then(function (m) {
      ok(m === 'output');
    });
  });

  test('Loading named System.register', function () {
    return System.import('tree/third').then(function (m) {
      ok(m.some == 'exports');
    });
  });
  test('Loading System.register from ES6', function () {
    System.config({
      meta: {
        'tree/first': {
          format: 'esm'
        }
      }
    });
    return System.import('tree/first').then(function (m) {
      ok(m.p == 5);
    });
  });

  test('AMD simplified CommonJS wrapping with an aliased require', function () {
    return System.import('tests/amd-simplified-cjs-aliased-require1.js').then(function (m) {
      ok(m.require2,"got dependency from aliased require");
      ok(m.require2.amdCJS,"got dependency from aliased require listed as a dependency");
    });
  });

  test('Loading dynamic modules with __esModule flag set', function () {
    return System.import('tests/es-module-flag.js').then(function (d) {
      m = System.registry.get(System.normalizeSync('tests/es-module-flag.js'));
      ok(m.default == 'default export');
      ok(m.exportName === 'export');
      ok(d.default == 'default export');
      ok(d.exportName == 'export');
    });
  });

  test('ES6 named export loading of CJS', function () {
    return System.import('tests/es-named-import-cjs.js').then(function (m) {
      ok(m.cjsFuncValue === 'named export');
    });
  });

  // TypeScript does not support async functions yet
  test('Async functions', function () {
    System.babelOptions = { stage: 0 };
    System.traceurOptions = { asyncFunctions: true };
    return System.import('tests/async.js').then(function (m) {
      ok(true);
    });
  });

  test('Wrapper module support', function () {
    return System.import('tests/wrapper.js').then(function (m) {
      ok(m.d == 'default1', 'Wrapper module not defined.');
    });
  });

  test('ES6 plugin', function () {
    return System.import('tests/blah.js!tests/es6-plugin.js').then(function (m) {
      ok(m == 'plugin');
    });
  });

  test('ES6 detection', function () {
    return System.import('tests/es6-detection1.js').then(function (m) {
      ok(true);
    });
  });

  test('Basic exporting & importing', function () {
    return Promise.all([
      System.import('tests/default1.js').then(function (m1) {
        ok(m1.default == 'default1', 'Error defining default 1');
      }),
      System.import('tests/default2.js').then(function (m2) {
        ok(m2.default == 'default2', 'Error defining default 2');
      }),
      System.import('tests/asdf.js').then(function () {
        throw new Error('Passed');
      }, function (err) {
        ok(err);
      }),
      System.import('tests/default3.js').then(function (m3) {
        ok(m3.default);
      }),
      System.import('tests/module.js').then(function (m4) {
        ok(m4.test == 'default3', 'Error defining module');
      })
    ]);
  });

  test('Export Star', function () {
    return System.import('tests/export-star.js')
    .then(function (m) {
      ok(m.foo == 'foo');
      ok(m.bar == 'bar');
    });
  });

  test('Importing a mapped loaded module', function () {
    System.config({
      map: {
        'default1': 'tests/default1.js'
      }
    });
    return System.import('default1').then(function (m) {
      return System.import('default1').then(function (m) {
        ok(m, 'no module');
      });
    });
  });

  test('Loading empty ES6', function () {
    return System.import('tests/empty-es6.js').then(function (m) {
      ok(m && emptyES6);
    });
  })

  test('Loading ES6 with format hint', function () {
    return System.import('tests/es6-format.js');
  });

  test('Loading ES6 loading AMD', function () {
    return System.import('tests/es6-loading-amd.js').then(function (m) {
      ok(m.amd == true);
    })
  });

  test('Loading AMD with import *', function () {
    return System.import('tests/es6-import-star-amd.js').then(function (m) {
      ok(m.g == true);
    });
  });

  test('Loading ES6 and AMD', function () {
    return System.import('tests/es6-and-amd.js').then(function (m) {
      ok(m.amd_module == 'AMD Module');
      ok(m.es6_module == 'ES6 Module');
    });
  });

  test('ES module deps support', function () {
    System.config({
      meta: {
        'tests/esm-with-deps.js': {
          deps: ['tests/esm-dep.js']
        }
      }
    });
    return System.import('tests/esm-with-deps.js').then(function (m) {
      ok(m.p == 5);
      ok(System.global.esmDep == 'esm-dep');
    });
  });

  test('Module Name meta', function () {
    return System.import('tests/reflection.js').then(function (m) {
      ok(m.myname == System.normalizeSync('tests/reflection.js'), 'Module name not returned');
    });
  });

  test('Relative dyanamic loading', function () {
    return System.import('tests/reldynamic.js').then(function (m) {
      return m.dynamicLoad();
    })
    .then(function (m) {
      ok(m.dynamic == 'module', 'Dynamic load failed');
    });
  });

  test('ES6 Circular', function () {
    return System.import('tests/es6-circular1.js').then(function (m) {
      ok(m.q == 3, 'Binding not allocated');
      ok(m.r == 3, 'Binding not updated');
    });
  });

  test('AMD & CJS circular, ES6 Circular', function () {
    return System.import('tests/all-circular1.js').then(function (m) {
      ok(m.q == 4);
      ok(m.o.checkObj() == 'changed');
    });
  });

  test('AMD -> System.register circular -> ES6', function () {
    return System.import('tests/all-layers1.js').then(function (m) {
      ok(m == true)
    });
  });

  test('Loading an AMD module that requires another works', function () {
    return System.import('tests/amd-require.js');
  });

  test('Loading a connected tree that connects ES and CJS modules', function () {
  	return System.import('tests/connected-tree/a.js').then(function (a){
  		ok(a.name === "a");
  	});
  });

  test('Loading two bundles that have a shared dependency', function () {
    System.config({
      bundles: {
        "tests/shared-dep-bundles/a.js": ["lib/shared-dep", "lib/a"],
        "tests/shared-dep-bundles/b.js": ["lib/shared-dep", "lib/b"]
      }
    });
    return System.import('lib/a').then(function () {
      return System.import('lib/b');
    });
  });

  test("System clone", function () {
    var clonedSystem = new System.constructor();

    clonedSystem.config({
      baseURL: System.baseURL
    });

    System.config({
      map: {
        maptest: 'tests/map-test.js'
      }
    });
    clonedSystem.config({
      map: {
        'maptest': 'tests/map-test-dep.js'
      }
    });

    Promise.all([
      System.import('maptest'),
      clonedSystem.import('maptest')
    ])
    .then(function (modules) {
      var m = modules[0];
      var mClone = modules[1];

      ok(m.maptest == 'maptest', 'Mapped module not loaded');
      ok(mClone.dep == 'maptest', 'Mapped module not loaded');
      ok(mClone !== m, "different modules");
    });
  });

  test('Custom loader instance System scoped', function () {
    var customSystem = new System.constructor();

    customSystem.config(System.getConfig());

    return customSystem.import('tests/loader-scoping.js')
    .then(function (m) {
      ok(m.loader == customSystem);
    });;
  });

  if (typeof window !== 'undefined' && window.Worker) {
    test('Using SystemJS in a Web Worker', function () {
      this.timeout(10000);
      var worker = new Worker('./tests/worker-' + System.transpiler.replace('plugin-', '') + '.js');

      return new Promise(function (resolve, reject) {
        worker.onmessage = function (e) {
          ok(e.data.amd === 'AMD Module');
          ok(e.data.es6 === 'ES6 Module');
          resolve();
        };
      });
    });
  }

  test("Duplicate entries", function () {
    return System.import('tests/duplicateDeps/m1.js')
    .then(function (m) {
      var r = m.foo() + ":" + m.f3();
      ok(r === "3:3", "duplicate entries in dependency list not handled correctly");
    });
  });

  // new features!!
  test('Named imports for non-es6', function () {
    return System.import('tests/es6-cjs-named-export.js')
    .then(function (m) {
      ok(m.someExport == undefined);
    });
  });

  test('Globals', function () {
    System.config({
      meta: {
        'tests/with-global-deps.js': {
          globals: {
            '$$$': 'tests/dep.js'
          }
        }
      }
    });

    return System.import('tests/with-global-deps.js')
    .then(function (m) {
      for (var p in m)
        ok(false);
      ok(!System.global.$$$);
    });
  });

  test('Scriptload precompiled global with exports still defined', function () {
    System.config({
      meta: {
        'tests/global-single-compiled.js': {
          scriptLoad: true,
          exports: 'foobar',
          format: typeof global != 'undefined' ? 'register' : 'global'
        }
      }
    });
    return System.import('tests/global-single-compiled.js').then(function (m) {
      ok(m == 'foo');
    });
  });

  test('Multi-format deps meta', function () {
    return System.import('tests/amd-extra-deps.js').then(function (m) {
      ok(m.join(',') == '10,5');
    });
  });


  test('Wildcard meta', function () {
    System.config({
      meta: {
        'tests/cs/main.js': {
          deps: ['./dep.js']
        },
        'tests/cs/*': {
          loader: 'tests/cs-loader.js'
        }
      }
    });
    return System.import('tests/cs/main.js').then(function (m) {
      ok(m == 'cs');
    });
  });

  test('Package configuration pathed package name', function () {
    System.config({
      paths: {
        'app/': 'tests/modules/'
      },
      packages: {
        'app': {
          format: 'register',
          defaultExtension: 'js'
        }
      }
    });

    return System.import('app/start').then(function (m) {
      ok(m.m == 'm');
    })
  });

  test('Package configuration main normalization', function () {
    SystemJS.config({
      paths: {
        "npm:": "jspm_packages/npm/",
        "app/": "src/"
      },
      packages: {
        "app": {
          "format": "system",
          "main": "index.js"
        }
      }
    });

    ok(System.normalizeSync('app') === System.baseURL + 'src/index.js');
  });

  test('esModule meta option', function () {
    System.config({
      meta: {
        'tests/es-module-meta.js': {
          esModule: true
        }
      }
    });
    return System.import('tests/es-module-meta.js').then(function () {
      var m = System.registry.get(System.resolveSync('tests/es-module-meta.js'));
      ok(m.asdf === 'asdf');
    });
  });

  test('esModule meta option for AMD', function () {
    System.config({
      meta: {
        'tests/es-module-meta-amd.js': {
          esModule: true
        }
      }
    });
    return System.import('tests/es-module-meta-amd.js').then(function () {
      var m = System.registry.get(System.resolveSync('tests/es-module-meta-amd.js'));
      ok(m.asdf === 'asdf');
    });
  })

  test('Package configuration CommonJS config example', function () {
    System.config({
      map: {
        'global-test': 'tests/testpkg/test.ts'
      },
      //packageConfigPaths: ['tests/testpk*.json'],
      packageConfigPaths: ['tests/testpkg/system.json'],
      packages: {
        'tests/testpkg': {
          map: {
            ".": './noext',
            "testpkg": "."
          },
          asdf: 'asdf'
        }
      }
    });

    return Promise.all([
      System.import('tests/testpkg'),
      System.import('tests/testpkg/json'),
      System.import('tests/testpkg/dir/test'),
      System.import('tests/testpkg/dir2'),
      System.import('tests/testpkg/dir/'),
      System.import('tests/testpkg/env-module'),
      System.import('tests/testpkg/self'),
      System.import('tests/testpkg/conditional1'),
      System.import('tests/testpkg/conditional2'),
      System.import('tests/testpkg/self-load.js'),
      System.import('tests/testpkg/dir/self-load.js')
    ]).then(function (m) {
      ok(m[0].prop == 'value');
      ok(m[1].prop == 'value');
      ok(m[2] == 'ts');
      ok(m[3].json == 'index');
      ok(m[4] == 'dirindex');
      ok(m[5] == (typeof window != 'undefined' ? 'browser' : 'not browser'));
      ok(m[6].prop == 'value');
      ok(m[7] == 'interpolated!');
      ok(m[8] == 'interpolated!');
      ok(m[9].a.prop == 'value' && m[9].b.prop == 'value');
      ok(m[10].a.prop == 'value' && m[10].b.prop == 'value');
    });
  });

  test('Package edge cases', function () {

    var clonedSystem = new System.constructor();
    clonedSystem.config({
      baseURL: System.baseURL
    });

    var pkgCfg = { defaultExtension: 'asdf' };

    try {
      clonedSystem.config({
        packages: {
          '//': pkgCfg
        }
      });
      ok(false);
    }
    catch(e) {
      ok(e.toString().indexOf('not a valid package name') != -1);
    }

    try {
      clonedSystem.config({
        packages: {
          'https://': pkgCfg
        }
      });
      ok(false);
    }
    catch(e) {
      ok(e.toString().indexOf('not a valid package name') != -1);
    }

    clonedSystem.config({
      packages: {
        'https://cdn.jquery.com': pkgCfg,
        '//cdn.jquery.com': pkgCfg
      }
    });

    clonedSystem.config({
      packages: {
        // both equivalent:
        '.': pkgCfg,
        './': pkgCfg,

        '/': pkgCfg,

        // this is now a nested package
        // but our trailling / should avoid extension rules
        // both equivalent:
        '../': pkgCfg,
        '..': pkgCfg
      }
    });

    // ensure trailing "/" is equivalent to "tests/testpkg"
    clonedSystem.config({
      packageConfigPaths: ['tests/*.json']
    });

    // we now have nested packages:
    // testpkg/ within test/ within / root://
    // we're testing that we always select the rules of the inner package
    return clonedSystem.import('tests/testpkg2/').then(function (m) {
      ok(m.asdf == 'asdf');
    });
  });

  test('Base package test', function () {
    var clonedSystem = new System.constructor();
    clonedSystem.config({
      packages: {
        '/': { defaultExtension: 'js' }
      }
    });

    return clonedSystem.resolve('foo').then(function (resolved) {
      ok(resolved.startsWith(clonedSystem.baseURL.substr(0, clonedSystem.baseURL.lastIndexOf('/') - 1)));
    });
  });

  test('Package map circular cases', function () {
    System.config({
      map: {
        tp3: 'tests/testpkg3'
      },
      packages: {
        'tests/testpkg3': {
          defaultExtension: 'js',
          map: {
            './lib': './lib/asdf.js',
            './lib/': './lib/index.js',
            './lib/p': './lib/q.js',
            './src/': './src/index.js',
            './bin': './bin/index.js'
          }
        }
      }
    });

    return Promise.all([
      System.normalize('tp3/lib'),
      System.normalize('tp3/lib/'),
      System.normalize('tp3/lib/q'),
      System.normalize('tp3/lib/p'),

      System.normalize('../lib', System.baseURL + 'tests/testpkg3/asdf/x.js'),
      System.normalize('../lib/', System.baseURL + 'tests/testpkg3/asdf/x.js'),
      System.normalize('../lib/x', System.baseURL + 'tests/testpkg3/asdf/x.js'),

      System.normalize('.', System.baseURL + 'tests/testpkg3/lib/a'),
      System.normalize('./', System.baseURL + 'tests/testpkg3/lib/x'),
      System.normalize('./p', System.baseURL + 'tests/testpkg3/lib/x'),
      System.normalize('./q', System.baseURL + 'tests/testpkg3/lib/x'),

      System.normalize('./lib', System.baseURL + 'tests/testpkg3/x.js'),
      System.normalize('./lib/', System.baseURL + 'tests/testpkg3/x.js'),
      System.normalize('./lib/p', System.baseURL + 'tests/testpkg3/x.js'),
      System.normalize('./lib/q', System.baseURL + 'tests/testpkg3/x.js'),

      System.normalize('../lib/', System.baseURL + 'tests/testpkg3/lib/x.js'),
      System.normalize('../lib/x', System.baseURL + 'tests/testpkg3/lib/x.js'),
      System.normalize('tp3/lib/q', System.baseURL + 'tests/testpkg3/lib/x.js'),

      System.normalize('./src', System.baseURL + 'tests/testpkg3/'),
      System.normalize('./src/', System.baseURL + 'tests/testpkg3/'),
      System.normalize('./src/x', System.baseURL + 'tests/testpkg3/'),

      System.normalize('tp3/src'),
      System.normalize('tp3/src/'),
      System.normalize('tp3/src/x'),

      System.normalize('./bin', System.baseURL + 'tests/testpkg3/'),
      System.normalize('./bin/', System.baseURL + 'tests/testpkg3/'),
      System.normalize('./bin/x', System.baseURL + 'tests/testpkg3/'),

      System.normalize('tp3/bin'),
      System.normalize('tp3/bin/'),
      System.normalize('tp3/bin/x'),

      System.normalize('.', System.baseURL + 'tests/testpkg3/bin/x')
    ])
    .then(function (n) {
      ok(n[0] == System.baseURL + 'tests/testpkg3/lib/asdf.js');
      ok(n[1] == System.baseURL + 'tests/testpkg3/lib/index.js');
      ok(n[2] == System.baseURL + 'tests/testpkg3/lib/q.js');
      ok(n[3] == System.baseURL + 'tests/testpkg3/lib/q.js');

      ok(n[4] == System.baseURL + 'tests/testpkg3/lib/asdf.js');
      ok(n[5] == System.baseURL + 'tests/testpkg3/lib/index.js');
      ok(n[6] == System.baseURL + 'tests/testpkg3/lib/x.js');

      ok(n[7] == System.baseURL + 'tests/testpkg3/lib/index.js');
      ok(n[8] == System.baseURL + 'tests/testpkg3/lib/index.js');
      ok(n[9] == System.baseURL + 'tests/testpkg3/lib/q.js');
      ok(n[10] == System.baseURL + 'tests/testpkg3/lib/q.js');

      ok(n[11] == System.baseURL + 'tests/testpkg3/lib/asdf.js');
      ok(n[12] == System.baseURL + 'tests/testpkg3/lib/index.js');
      ok(n[13] == System.baseURL + 'tests/testpkg3/lib/q.js');
      ok(n[14] == System.baseURL + 'tests/testpkg3/lib/q.js');

      ok(n[15] == System.baseURL + 'tests/testpkg3/lib/index.js');
      ok(n[16] == System.baseURL + 'tests/testpkg3/lib/x.js');
      ok(n[17] == System.baseURL + 'tests/testpkg3/lib/q.js');

      ok(n[18] == System.baseURL + 'tests/testpkg3/src.js');
      ok(n[19] == System.baseURL + 'tests/testpkg3/src/index.js');
      ok(n[20] == System.baseURL + 'tests/testpkg3/src/x.js');

      ok(n[21] == System.baseURL + 'tests/testpkg3/src.js');
      ok(n[22] == System.baseURL + 'tests/testpkg3/src/index.js');
      ok(n[23] == System.baseURL + 'tests/testpkg3/src/x.js');

      ok(n[24] == System.baseURL + 'tests/testpkg3/bin/index.js');
      ok(n[25] == System.baseURL + 'tests/testpkg3/bin/index.js');
      ok(n[26] == System.baseURL + 'tests/testpkg3/bin/x.js');

      ok(n[27] == System.baseURL + 'tests/testpkg3/bin/index.js');
      ok(n[28] == System.baseURL + 'tests/testpkg3/bin/index.js');
      ok(n[29] == System.baseURL + 'tests/testpkg3/bin/x.js');

      ok(n[30] == System.baseURL + 'tests/testpkg3/bin/index.js');
    });

  });

  test('Conditional loading', function () {
    System.registry.set('env', System.newModule({ 'browser': 'ie' }));

    return System.import('tests/branch-#{env|browser}.js')
    .then(function (m) {
      ok(m.branch == 'ie');
    });
  });

  test('Boolean conditional false', function () {
    System.registry.set('env', System.newModule({ 'js': { 'es5': true } }));

    return System.import('tests/branch-boolean.js#?env|~js.es5')
    .then(function (m) {
      ok(m === System.registry.get('@empty'));
    });
  });

  test('Boolean conditional true', function () {
    System.registry.set('env', System.newModule({ 'js': { 'es5': true } }));

    System.config({
      paths: {
        'branch-boolean.js': 'tests/branch-boolean.js'
      }
    });

    return System.import('branch-boolean.js#?env|js.es5')
    .then(function (m) {
      ok(m.default === true);
    });
  });

  test('Loading a System.registerdynamic module (not bundled)', function () {
    return System.import('tests/registerdynamic-main.js')
    .then(function (m) {
      ok(typeof m.dependency === 'function');
      ok(m.dependency() === 'ok');
    });
  });

  test('Importing a script with right integrity passes', function () {
    System.config({
      meta: {
        'tests/csp/integrity-1.js': {
          format: 'amd',
          integrity: 'sha256-/AfZ2eZSJyVU4HFktUpbsTEoSJF1hL5eGKjgdXZnNTw='
        }
      }
    });
    return System.import('tests/csp/integrity-1.js')
    .then(function (m) {
      ok(m.integrity === 'integrity');
    });
  });

  if (typeof process === 'undefined' && navigator.userAgent.indexOf('Trident/7.0') === -1)
  test('Importing a script with wrong integrity fails', function () {
    System.config({
      meta: {
        'tests/csp/integrity-2.js': {
          format: 'amd',
          integrity: 'sha256-abc',
          scriptLoad: System.baseURL.substr(0, 8) === 'file:///'
        }
      }
    });
    return System.import('tests/csp/integrity-2.js')
    .then(function (m) {
      throw new Error('Was supposed to fail');
    }, function (e) {
      ok(typeof e !== 'undefined');
    });
  });

  if (typeof process != 'undefined') {
    test('Loading Node core modules', function () {
      return System.import('@node/fs')
      .then(function (m) {
        ok(m.writeFile);
      });
    });

    test('No global define leak in Node', function () {
      ok(typeof define == 'undefined');
    });
  }

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
});
