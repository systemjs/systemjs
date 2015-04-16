"format global";

(function(global) {

QUnit.config.testTimeout = 2000;

QUnit.module("SystemJS");

if (typeof window == 'undefined') {
  System.baseURL = 'test';
}

function err(e) {
  setTimeout(function() {
    if (typeof window == 'undefined')
      console.log(e.stack);
    else
      throw e.stack || e;
    start();
  });
}

var ie8 = typeof navigator != 'undefined' && navigator.appVersion && navigator.appVersion.indexOf('MSIE 8') != -1;

asyncTest('Error handling', function() {
  System['import']('tests/error-loader').then(err, function(e) {
    ok(true);
    start();
  });
});

asyncTest('Error handling2', function() {
  System['import']('tests/error-loader2').then(err, function(e) {
    console.error(e);
    ok(true);
    start();
  });
});

if (!ie8)
asyncTest('Global script loading', function() {
  System['import']('tests/global').then(function(m) {
    ok(m.jjQuery && m.another, 'Global objects not defined');
    start();
  }, err);
});

if (!ie8)
asyncTest('Global script with var syntax', function() {
  System['import']('tests/global-single').then(function(m) {
    ok(m == 'bar', 'Wrong global value');
    start();
  }, err);
});

asyncTest('Global script with multiple objects the same', function() {
  System['import']('tests/global-multi').then(function(m) {
    ok(m.jquery == 'here', 'Multi globals not detected');
    start();
  }, err);
});

if (!ie8)
asyncTest('Global script multiple objects different', function() {
  System['import']('tests/global-multi-diff').then(function(m) {
    ok(m.foo == 'barz');
    ok(m.baz == 'chaz');
    ok(m.zed == 'ted');
    start();
  }, err);
});

asyncTest('Global script loading with inline shim', function() {
  System['import']('tests/global-inline-dep').then(function(m) {
    ok(m == '1.8.3', 'Global dependency not defined');
    start();
  }, err);
});

asyncTest('Global script with inline exports', function() {
  System['import']('tests/global-inline-export').then(function(m) {
    ok(m == 'r', 'Inline export not applied');
    start();
  }, err);
});

asyncTest('Global script with shim config', function() {
  System.meta['tests/global-shim-config'] = { deps: ['./global-shim-config-dep'] };
  System['import']('tests/global-shim-config').then(function(m) {
    ok(m == 'shimmed', 'Not shimmed');
    start();
  }, err);
});

if (!ie8)
asyncTest('Global script with inaccessible properties', function() {
  Object.defineProperty(System.global, 'errorOnAccess', {
    configurable: true,
    enumerable: true,
    get: function() { throw Error('This property is inaccessible'); },
  });

  System['import']('tests/global-inaccessible-props').then(function(m) {
    ok(m == 'result of global-inaccessible-props', 'Failed due to a inaccessible property');

    delete System.global.errorOnAccess;
    start();
  }, err);
});

asyncTest('Global script loading that detects as AMD with shim config', function() {
  System.meta['tests/global-shim-amd'] = { format: 'global' };
  System['import']('tests/global-shim-amd').then(function(m) {
    ok(m == 'global', 'Not shimmed');
    start();
  }, err);
});

if (!ie8)
asyncTest('Meta should override meta syntax', function() {
  System.meta['tests/meta-override'] = { format: 'es6' };
  System['import']('tests/meta-override').then(function(m) {
    ok(m.p == 'value', 'Not ES6');
    start();
  }, err);
});

asyncTest('Support the empty module', function() {
  System['import']('@empty').then(function(m) {
    ok(m, 'No empty module');
    start();
  }, err);
});

asyncTest('Global script with shim config exports', function() {
  System.meta['tests/global-shim-config-exports'] = { exports: 'p' };
  System['import']('tests/global-shim-config-exports').then(function(m) {
    ok(m == 'export', 'Exports not shimmed');
    start();
  }, err);
});

asyncTest('Map configuration', function() {
  System.map['maptest'] = 'tests/map-test';
  System['import']('maptest').then(function(m) {
    ok(m.maptest == 'maptest', 'Mapped module not loaded');
    start();
  }, err);
});

asyncTest('Map configuration subpath', function() {
  System.map['maptest'] = 'tests/map-test';
  System['import']('maptest/sub').then(function(m) {
    ok(m.maptest == 'maptestsub', 'Mapped folder not loaded');
    start();
  }, err);
});

asyncTest('Contextual map configuration', function() {
  System.map['tests/contextual-map'] = {
    maptest: 'tests/contextual-map-dep'
  };
  System['import']('tests/contextual-map').then(function(m) {
    ok(m.mapdep == 'mapdep', 'Contextual map dep not loaded');
    start();
  }, err);
});

asyncTest('Submodule contextual map configuration', function() {
  System.map['tests/subcontextual-map'] = {
    dep: 'tests/subcontextual-mapdep'
  };
  System['import']('tests/subcontextual-map/submodule').then(function(m) {
    ok(m == 'submapdep', 'Submodule contextual map not loaded');
    start();
  }, err);
});

asyncTest('Contextual map with shim', function() {
  System.meta['tests/shim-map-test'] = {
    deps: ['shim-map-dep']
  };
  System.map['tests/shim-map-test'] = {
    'shim-map-dep': 'tests/shim-map-test-dep'
  };
  System['import']('tests/shim-map-test').then(function(m) {
    ok(m == 'depvalue', 'shim dep not loaded');
    start();
  }, err);
});

asyncTest('Prefetching', function() {
  throws(System['import']('tests/prefetch'));
  start();
});

asyncTest('Package loading shorthand', function() {
  System.map['tests/package'] = 'tests/some-package';
  System['import']('tests/package/').then(function(m) {
    ok(m.isPackage);
    start();
  }, err);
});

asyncTest('Loading an AMD module', function() {
  System['import']('tests/amd-module').then(function(m) {
    ok(m.amd == true, 'Incorrect module');
    ok(m.dep.amd == 'dep', 'Dependency not defined');
    start();
  }, err);
});

asyncTest('AMD detection test', function() {
  System['import']('tests/amd-module-2').then(function(m) {
    ok(m.amd);
    start();
  }, err);
});

asyncTest('AMD detection test with comments', function() {
  System['import']('tests/amd-module-3').then(function(m) {
    ok(m.amd);
    start();
  }, err);
});

asyncTest('AMD detection test with byte order mark (BOM)', function() {
  System['import']('tests/amd-module-bom').then(function(m) {
    ok(m.amd);
    start();
  }, err);
});

asyncTest('AMD with dynamic require callback', function() {
  System['import']('tests/amd-dynamic-require').then(function(m) {
    m.onCallback(function(m) {
      ok(m === 'dynamic');
      start();
    });
  });
});

System.bundles['tests/amd-bundle'] = ['bundle-1', 'bundle-2'];
asyncTest('Loading an AMD bundle', function() {
  System['import']('bundle-1').then(function(m) {
    ok(m.defined == true);
    start();
  }, err);

  stop();
  System['import']('bundle-2').then(function(m) {
    ok(m.defined == true);
    start();
  }, err);
});

asyncTest('Loading an AMD named define', function() {
  System['import']('tests/nameddefine').then(function(m1){
    ok(m1.converter, 'Showdown not loaded');
    System['import']('another-define').then(function(m2) {
      ok(m2.named === 'define', 'Another module is not defined');
      start();
    }, err);
  }, err);
});


asyncTest('Loading AMD CommonJS form', function() {
  System['import']('tests/amd-cjs-module').then(function(m) {
    ok(m.test == 'hi', 'Not defined');
    start();
  }, err);
});

asyncTest('Loading a CommonJS module', function() {
  System['import']('tests/common-js-module').then(function(m) {
    ok(m.hello == 'world', 'module value not defined');
    ok(m.first == 'this is a dep', 'dep value not defined');
    start();
  }, err);
});

asyncTest('Loading a CommonJS module with this', function() {
  System['import']('tests/cjs-this').then(function(m) {
    ok(m.asdf == 'module value');
    start();
  }, err);
});

asyncTest('CommonJS setting module.exports', function() {
  System['import']('tests/cjs-exports').then(function(m) {
    ok(m.e == 'export');
    start();
  }, err);
});

asyncTest('CommonJS detection variation', function() {
  System['import']('tests/commonjs-variation').then(function(m) {
    ok(m.e === System.get('@empty'));
    start();
  }, err);
});

asyncTest('CommonJS detection test with byte order mark (BOM)', function() {
  System['import']('tests/cjs-exports-bom').then(function(m) {
    ok(m.foo == 'bar');
    start();
  }, err);
});

asyncTest('CommonJS module detection test with byte order mark (BOM)', function() {
  System['import']('tests/cjs-module-bom').then(function(m) {
    ok(m.foo == 'bar');
    start();
  }, err);
});

asyncTest('CommonJS require variations', function() {
  System['import']('tests/commonjs-requires').then(function(m) {
    ok(m.d1 == 'd');
    ok(m.d2 == 'd');
    ok(m.d3 == "require('not a dep')");
    // ok(m.d4 == "text require('still not a dep') text");
    // ok(m.d5 == 'text \'quote\' require("yet still not a dep")');
    start();
  }, err);
});

asyncTest('Loading a UMD module', function() {
  System['import']('tests/umd').then(function(m) {
    ok(m.d == 'hi', 'module value not defined');
    start();
  }, err);
});

asyncTest('Loading AMD with format hint', function() {
  System['import']('tests/amd-format').then(function(m) {
    ok(m.amd == 'amd', 'AMD not loaded');
    start();
  }, err);
});

asyncTest('Loading CJS with format hint', function() {
  System['import']('tests/cjs-format').then(function(m) {
    ok(m.cjs == 'cjs', 'CJS not loaded');
    start();
  }, err);
});

asyncTest('Versions support', function() {
  System.versions['tests/versioned'] = '2.0.3';
  System['import']('tests/versioned@^2.0.3').then(function(m) {
    ok(m.version == '2.3.4', 'Version not loaded');
    start();
  }, err);
});

asyncTest('Versions 2', function() {
  System['import']('tests/zero@0').then(function(m) {
    ok(m == '0');
    start()
  }, err);
})

asyncTest('Version with map', function() {
  System.versions['tests/mvd'] = '2.0.0';
  System.map['tests/map-version'] = {
    'tests/mvd': 'tests/mvd@^2.0.0'
  };
  System['import']('tests/map-version').then(function(m) {
    ok(m == 'overridden map version');
    start();
  }, err);
});

asyncTest('Simple compiler Plugin', function() {
  System.map['coffee'] = 'tests/compiler-plugin';
  System['import']('tests/compiler-test.coffee!').then(function(m) {
    ok(m.output == 'plugin output', 'Plugin not working.');
    ok(m.extra == 'yay!', 'Compiler not working.');
    start();
  }, err);
});

asyncTest('Versioned plugin', function() {
  System.versions['tests/versioned-plugin-test'] = '1.2.3';
  System['import']('tests/versioned-plugin-test/main').then(function(m) {
    ok(m.output == 'plugin output');
    ok(m.versionedPlugin == true);
    start();
  }, err);
})

asyncTest('Mapping to a plugin', function() {
  System.map['pluginrequest'] = 'tests/compiled.coffee!';
  System.map['coffee'] = 'tests/compiler-plugin';
  System['import']('pluginrequest').then(function(m) {
    ok(m.extra == 'yay!', 'Plugin not applying.');
    start();
  }, err);
});

asyncTest('Mapping a plugin argument', function() {
  System.map['bootstrap'] = 'tests/bootstrap@^3.1.1';
  System.versions['tests/bootstrap'] = '3.1.1';
  System.map['coffee'] = 'tests/compiler-plugin';
  System['import']('bootstrap/test.coffee!coffee').then(function(m) {
    ok(m.extra == 'yay!', 'not working');
    start();
  }, err);
});

asyncTest('Advanced compiler plugin', function() {
  System['import']('tests/compiler-test!tests/advanced-plugin').then(function(m) {
    ok(m == 'custom fetch:tests/compiler-test!tests/advanced-plugin', m);
    start();
  }, err);
});

asyncTest('Plugin as a dependency', function() {
  System.map['css'] = 'tests/css';
  System['import']('tests/cjs-loading-plugin').then(function(m) {
    ok(m.pluginSource == 'this is css');
    start();
  }, err);
});

asyncTest('Plugin version stripping', function() {
  System.normalize('some/module@1.2.3!some/plugin@3.4.5.jsx').then(function(normalized) {
    ok(normalized == 'some/module@1.2.3!some/plugin@3.4.5.jsx');
    start();
  }, err);
})

asyncTest('AMD Circular', function() {
  System['import']('tests/amd-circular1').then(function(m) {
    ok(m.outFunc() == 5, 'Expected execution');
    start();
  })['catch'](err);
});

asyncTest('CJS Circular', function() {
  System['import']('tests/cjs-circular1').then(function(m) {
    ok(m.first == 'second value');
    ok(m.firstWas == 'first value', 'Original value');
    start();
  }, err);
});

asyncTest('System.register Circular', function() {
  System['import']('tests/register-circular1').then(function(m) {
    ok(m.q == 3, 'Binding not allocated');
    ok(m.r == 5, 'Binding not updated');
    start();
  }, err);
});

asyncTest('System.register group linking test', function() {
  System.bundles['tests/group-test'] = ['group-a'];
  System['import']('group-a').then(function(m) {
    ok(m);
    start();
  }, err);
});

System.bundles['tests/mixed-bundle'] = ['tree/third', 'tree/cjs', 'tree/jquery', 'tree/second', 'tree/global', 'tree/amd', 'tree/first'];

asyncTest('Loading AMD from a bundle', function() {
  System['import']('tree/amd').then(function(m) {
    ok(m.is == 'amd');
    start();
  }, err);
});


System.bundles['tests/mixed-bundle'] = ['tree/third', 'tree/cjs', 'tree/jquery', 'tree/second', 'tree/global', 'tree/amd', 'tree/first'];
asyncTest('Loading CommonJS from a bundle', function() {
  System['import']('tree/cjs').then(function(m) {
    ok(m.cjs === true);
    start();
  }, err);
});

asyncTest('Loading a Global from a bundle', function() {
  System['import']('tree/global').then(function(m) {
    ok(m === 'output');
    start();
  }, err);
});

asyncTest('Loading named System.register', function() {
  System['import']('tree/third').then(function(m) {
    ok(m.some == 'exports');
    start();
  }, err);
});
asyncTest('Loading System.register from ES6', function() {
  System['import']('tree/first').then(function(m) {
    ok(m.p == 5);
    start();
  }, err);
});

//asyncTest('Loading from jspm', function() {
//  System.paths['npm:*'] = 'https://npm.jspm.io/*.js';
//  System['import']('npm:underscore').then(function(m) {
//    ok(m && typeof m.chain == 'function', 'Not loaded');
//    start();
//  }, err);
//});


asyncTest('AMD simplified CommonJS wrapping with an aliased require', function() {
  System['import']('tests/amd-simplified-cjs-aliased-require1').then(function(m) {
    ok(m.require2,"got dependency from aliased require");
    ok(m.require2.amdCJS,"got dependency from aliased require listed as a dependency");
    start();
  }, err);
});

asyncTest('Loading dynamic modules with __esModule flag set', function() {
  System['import']('tests/es-module-flag').then(function() {
    m = System.get('tests/es-module-flag');
    ok(m.exportName == 'export');
    ok(m['default'] == 'default export');
    ok(m.__esModule === true);
    start();
  }, err);
});

if (ie8)
  return;

asyncTest('Async functions', function() {
  System.babelOptions = { stage: 0 };
  System.traceurOptions = { asyncFunctions: true };
  System['import']('tests/async').then(function(m) {
    ok(true);
    start();
  });
});

asyncTest('Wrapper module support', function() {
  System['import']('tests/wrapper').then(function(m) {
    ok(m['default'] == 'default1', 'Wrapper module not defined.');
    start();
  }, err);
});

asyncTest('ES6 plugin', function() {
  System['import']('tests/blah!tests/es6-plugin').then(function(m) {
    ok(m == 'plugin');
    start();
  }, err);
});

asyncTest('ES6 detection', function() {
  System['import']('tests/es6-detection1').then(function(m) {
    ok(true);
    start();
  }, err);
});

asyncTest('Basic exporting & importing', function() {
  var m1, m2, m3, m4, err;
  var checkComplete = function() {
    if (m1 && m2 && m3 && m4 && err) {
      ok(m1['default'] == 'default1', 'Error defining default 1');
      ok(m2['default'] == 'default2', 'Error defining default 2');
      ok(m3['default'] == 'default3', 'Error defining default 3');
      ok(m4.test == 'default3', 'Error defining module');
      start();
    }
  };
  System['import']('tests/default1').then(function(_m1) {
    if (m1 === undefined)
      m1 = null;
    else
      m1 = _m1;
    checkComplete();
  })['catch'](err);
  System['import']('tests/default1').then(function(_m1) {
    if (m1 === undefined)
      m1 = null;
    else
      m1 = _m1;
    checkComplete();
  })['catch'](err);
  System['import']('tests/default2').then(function(_m2) {
    m2 = _m2;
    checkComplete();
  })['catch'](err);
  System['import']('tests/asdf').then(function() {
  }, function(_err) {
    err = _err;
    checkComplete();
  })['catch'](err);
  System['import']('tests/default3').then(function(_m3) {
    m3 = _m3;
    checkComplete();
  })['catch'](err);
  System['import']('tests/module').then(function(_m4) {
    m4 = _m4;
    checkComplete();
  })['catch'](err);
});

asyncTest('Export Star', function(assert) {
  System['import']('tests/export-star').then(function(m) {
    ok(m.foo == 'foo');
    ok(m.bar == 'bar');
    start();
  }, err);
});

asyncTest('Importing a mapped loaded module', function() {
  System.map['default1'] = 'tests/default1';
  System['import']('default1').then(function(m) {
    System['import']('default1').then(function(m) {
      ok(m, 'no module');
      start();
    }, err);
  }, err);
});

asyncTest('Loading empty ES6', function() {
  System['import']('tests/empty-es6').then(function(m) {
    ok(m && emptyES6);
    start();
  }, err);
})

asyncTest('Loading ES6 with format hint', function() {
  System['import']('tests/es6-format').then(function(m) {
    expect(0);
    start();
  }, err);
});

asyncTest('Loading ES6 loading AMD', function() {
  System['import']('tests/es6-loading-amd').then(function(m) {
    ok(m.amd == true);
    start();
  })
});

asyncTest('Loading AMD with import *', function() {
  System['import']('tests/es6-import-star-amd').then(function(m) {
    ok(m.g == true);
    start();
  }, err);
});

asyncTest('Loading ES6 and AMD', function() {
  System['import']('tests/es6-and-amd').then(function(m) {
    ok(m.amd_module == 'AMD Module');
    ok(m.es6_module == 'ES6 Module');
    start();
  }, err);
});

asyncTest('Module Name meta', function() {
  System['import']('tests/reflection').then(function(m) {
    ok(m.myname == 'tests/reflection', 'Module name not returned');
    start();
  }, err);
});

asyncTest('Relative dyanamic loading', function() {
  System['import']('tests/reldynamic').then(function(m) {
    return m.dynamicLoad();
  })
  .then(function(m) {
    ok(m.dynamic == 'module', 'Dynamic load failed');
    start();
  })
  ['catch'](err);
});

asyncTest('ES6 Circular', function() {
  System['import']('tests/es6-circular1').then(function(m) {
    ok(m.q == 3, 'Binding not allocated');
    if (System.transpiler != '6to5') ok(m.r == 3, 'Binding not updated');
    start();
  }, err);
});

asyncTest('AMD & CJS circular, ES6 Circular', function() {
  System['import']('tests/all-circular1').then(function(m) {
    if (System.transpiler != '6to5') ok(m.q == 4);
    ok(m.o.checkObj() == 'changed');
    start();
  }, err);
});

asyncTest('AMD -> System.register circular -> ES6', function() {
  System['import']('tests/all-layers1').then(function(m) {
    ok(m == true)
    start();
  }, err);
});

asyncTest('Metadata dependencies work for named defines', function() {
  System['import']('tests/meta-deps').then(function(m) {
    return System['import']('b');
  }).then(function(m) {
    ok(m.a === 'a');
    start();
  });
});

asyncTest('Loading an AMD module that requires another works', function() {
  expect(0);
  System['import']('tests/amd-require').then(function(){
    // Just getting this far means it is working.
    start();
  });
});

asyncTest('Loading a connected tree that connects ES and CJS modules', function(){
	System['import']('tests/connected-tree/a').then(function(a){
		ok(a.name === "a");
		start();
	});
});

asyncTest('Loading two bundles that have a shared dependency', function() {
  System.bundles["tests/shared-dep-bundles/a"] = ["lib/shared-dep", "lib/a"];
  System.bundles["tests/shared-dep-bundles/b"] = ["lib/shared-dep", "lib/b"];
  expect(0);
  System['import']('lib/a').then(function() {
    System['import']('lib/b').then(function() {
      //If it gets here it's fine
      start();
    }, err);
  }, err);
});

asyncTest("System.clone", function() {
  var ClonedSystem  = System.clone();

  System.map['maptest'] = 'tests/map-test';
  ClonedSystem.map['maptest'] = 'tests/map-test-dep';

  var systemDef = System['import']('maptest');
  var cloneDef = ClonedSystem['import']('maptest');

  Promise.all([systemDef, cloneDef]).then(function(modules){
    var m = modules[0];
    var mClone = modules[1];
    ok(m.maptest == 'maptest', 'Mapped module not loaded');
    ok(mClone.dep == 'maptest', 'Mapped module not loaded');
    ok(mClone !== m, "different modules");
    start();
  });
});

if(typeof window !== 'undefined' && window.Worker) {
  asyncTest('Using SystemJS in a Web Worker', function() {
    var worker = new Worker('tests/worker-' + System.transpiler + '.js');
    worker.onmessage = function(e) {
      ok(e.data.amd === 'AMD Module');
      ok(e.data.es6 === 'ES6 Module');
      start();
    };
  });
}

})(typeof window == 'undefined' ? global : window);
