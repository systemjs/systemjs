System.register('a', [], function (_export) {
  return {
    execute: function() {
      _export('b', 'c');
    }
  };
});