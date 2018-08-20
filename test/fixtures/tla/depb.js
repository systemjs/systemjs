System.register(['./depc.js', './depa.js'], function (_export) {
  var reporter;
  return {
    setters: [function (_depC) {
      reporter = _depC.reporter;
    }],
    execute: function () {
      reporter('b');
      return new Promise(resolve => setTimeout(resolve, 20))
      .then(function () {
        reporter('b');
      });
    }
  };
});