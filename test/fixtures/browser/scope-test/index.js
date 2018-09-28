System.register(['maptest'], function (_export) {
  return {
    setters: [function (map) {
      for (var p in map)
        _export(p, map[p]);
    }],
    execute: function () {}
  };
});
