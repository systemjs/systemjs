System.register([], function (_export) {
  return {
    setters: [],
    execute: function () {
      _export({
        exampleImport: function (i) {
          return i + 1;
        }
      });
    }
  };
});
