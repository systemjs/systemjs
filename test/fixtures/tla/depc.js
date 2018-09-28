System.register([], function (_export) {
  var reporter;

  var state = 0;
  var expected = ['c', 'b', 'c', 'b', 'a', 'a', 'main', 'main'];
  var failed = false;
  function reporter (name) {
    if (expected[state++] !== name)
      failed = true;
  }
  _export('reporter', reporter);

  return {
    setters: [],
    execute: function () {
      reporter('c');
      return new Promise(resolve => setTimeout(resolve, 10))
      .then(function () {
        reporter('c');
        _export('passed', !failed);
      });
    }
  };
});