suite('Reload extra tests', function () {
  const virtualModules = {};
  const importObservers = {};

  // wait for an import to reach the registry to test race conditions
  function waitForImportStart(id) {
    return new Promise(function (resolve) {
      importObservers[id] = resolve;
    });
  }

  // allow bypassing network for testing
  const instantiate = System.constructor.prototype.instantiate;
  System.constructor.prototype.instantiate = function (url, parent) {
    const id = this.resolve(url, parent);

    if (id in virtualModules) {
      const virtualModule = virtualModules[id];
      delete virtualModules[id];

      return new Promise(function (resolve, reject) {
        // respond after configured timeout
        setTimeout(function () {
          if (virtualModule[0] === null) {
            reject(new Error());
          } else {
            resolve(virtualModule[0]);
          }
        }, virtualModule[1]);

        // notify observer that we started an import response
        if (id in importObservers) {
          importObservers[id]();
          delete importObservers[id];
        }
      });
    }

    return instantiate.apply(this, arguments);
  };

  test('Updates the module exports and the reference in the registry', function () {
    const id = System.resolve('./fixtures/browser/reload/export.js');

    return System.import(id)
      .then(function (moduleA) {
        assert.equal(moduleA.x, 'x');
      })
      .then(function () {
        virtualModules[id] = [[[], function (_exports) {
          _exports('x', 'y');
          return {};
        }]];
        return System.reload(id);
      })
      .then(function (newModule) {
        assert.equal(newModule.x, 'y');
        assert.equal(newModule, System.get(id));
      });
  });

  test('Updates module execution', function () {
    const id = System.resolve('./fixtures/browser/reload/execute.js');
    window.reloadExecute = [];

    return System.import(id)
      .then(function () {
        assert.equal(reloadExecute.length, 1);
        assert.equal(reloadExecute[0], 'x');
      })
      .then(function () {
        virtualModules[id] = [[[], function (_exports) {
          window.reloadExecute.push('y');
          return {};
        }]];
        return System.reload(id);
      })
      .then(function () {
        assert.equal(reloadExecute.length, 2);
        assert.equal(reloadExecute[1], 'y');
        delete window.reloadExecute;
      });
  });

  test('Updates live bindings between modules', function () {
    const id1 = System.resolve('./fixtures/browser/reload/live-binding-1.js');
    const id2 = System.resolve('./fixtures/browser/reload/live-binding-2.js');
    let liveBinding1;

    return System.import(id1)
      .then(function (_liveBinding1) {
        liveBinding1 = _liveBinding1;
        assert.equal(liveBinding1.getY(), 2);
      })
      .then(function () {
        virtualModules[id2] = [[[], function (_export) {
          return {
            execute: function () {
              _export('x', 2);
            },
          };
        }]];

        return System.reload(id2);
      })
      .then(function (liveBinding2) {
        assert.equal(liveBinding2.x, 2);
        assert.equal(liveBinding1.getY(), 4);
      });
  });

  test('Updates removed exports', function () {
    const id1 = System.resolve('./fixtures/browser/reload/removed-export-1.js');
    const id2 = System.resolve('./fixtures/browser/reload/removed-export-2.js');
    let removedExport1;

    return System.import(id1)
      .then(function (_removedExport1) {
        removedExport1 = _removedExport1;
        assert.equal(removedExport1.getX(), 'x');
        assert.equal(removedExport1.getY(), 'y');
      })
      .then(function () {
        virtualModules[id2] = [[[], function (_exports) {
          _exports('x', 'x');
          return {};
        }]];

        return System.reload(id2);
      })
      .then(function () {
        assert.equal(removedExport1.getX(), 'x');
        assert.equal(removedExport1.getY(), undefined);
      });
  });

  test('Handles race conditions, single', function () {
    const id = System.resolve('./fixtures/browser/reload/race-single.js');
    virtualModules[id] = [[[], function (_exports) {
      _exports('x', 'x');
      return {};
    }], 20];

    System.import(id);

    return waitForImportStart(id)
      .then(function () {
        virtualModules[id] = [[[], function (_exports) {
          _exports('x', 'y');
          return {};
        }], 10];

        return System.reload(id);
      })
      .then(function (second) {
        assert.equal(second.x, 'y');
        assert.equal(second, System.get(id));
      });
  });

  test('Handles race conditions, multiple', function () {
    const id = System.resolve('./fixtures/browser/reload/race-multiple.js');
    virtualModules[id] = [[[], function (_exports) {
      _exports('x', 'x');
      return {};
    }], 10];

    // initiate request
    System.import(id);

    return waitForImportStart(id)
      .then(function () {
        virtualModules[id] = [[[], function (_exports) {
          _exports('x', 'y');
          return {};
        }], 20];

        // initiate second request while the other one is still pending
        System.reload(id);
      })
      .then(function () {
        // initiate a third request while the other two are still pending
        return waitForImportStart(id).then(function () {
          virtualModules[id] = [[[], function (_exports) {
            _exports('x', 'z');
            return {};
          }], 5];

          return System.reload(id)
        });
      })
      .then(function (third) {
        // finally the third loaded module should resolve
        assert.equal(third.x, 'z');
        assert.equal(third, System.get(id));
      });
  });

  test('Can recover from an initial error', function () {
    const id = System.resolve('./fixtures/browser/reload/error.js');
    virtualModules[id] = [null, 5];
    let didFail = false;

    return System.import(id)
      .catch(function () {
        didFail = true;
        // first request fails
      })
      .then(function () {
        // reload succeeds
        virtualModules[id] = [[[], function (_exports) {
          _exports('x', 'x');
          return {};
        }]];
        return System.reload(id);
      })
      .then(function (first) {
        assert.equal(didFail, true);
        assert.equal(first.x, 'x');
        assert.equal(first, System.get(id));
      });
  });

  test('Can recover from a reload error', function () {
    const id = System.resolve('./fixtures/browser/reload/error.js');
    virtualModules[id] = [[[], function (_exports) {
      _exports('x', 'x');
      return {};
    }]];

    return System.import(id)
      .then(function (first) {
        // first import succeeds
        assert.equal(first.x, 'x');
      })
      .then(function () {
        // reload fails
        virtualModules[id] = [null, 5];
        return System.reload(id).catch(function () { });
      })
      .then(function () {
        // reload succeeds and recovers
        virtualModules[id] = [[[], function (_exports) {
          _exports('x', 'y');
          return {};
        }]];
        return System.reload(id);
      })
      .then(function (third) {
        assert.equal(third.x, 'y');
      });
  });

  test('Can restore live bindings after reload errors', function () {
    const id1 = System.resolve('./fixtures/browser/reload/live-binding-reload-error-1.js');
    const id2 = System.resolve('./fixtures/browser/reload/live-binding-reload-error-2.js');
    let liveBinding1;

    return System.import(id1)
      .then(function (_liveBinding1) {
        liveBinding1 = _liveBinding1;
        assert.equal(liveBinding1.getX(), 'x');
      })
      .then(function () {
        // reload live binding 2 fails
        virtualModules[id2] = [null];
        return System.reload(id2).catch(function () { });
      })
      .then(function () {
        // reload live binding 2 succeeds
        virtualModules[id2] = [[[], function (_export) {
          _export('x', 'y');
          return {};
        }]];
        return System.reload(id2);
      })
      .then(function (liveBinding2) {
        assert.equal(liveBinding2.x, 'y');
        assert.equal(liveBinding1.getX(), 'y');
      });
  });
});