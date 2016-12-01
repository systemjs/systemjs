System.register(['./map-test-dep.js'], function (_export) {
  return {
    setters: [function (dep) {
      _export('maptest', dep.dep);
    }],
    execute: function () {}
  };
});
