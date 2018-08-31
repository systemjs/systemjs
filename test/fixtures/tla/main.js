System.register(['./depa.js', './depb.js', './depc.js'], function (_export) {
  var reporter;

  return {
    setters: [,, function (_depC) {
      reporter = _depC.reporter;
      _export('passed', _depC.passed);
    }],
    execute: function () {
      reporter('main');
      return new Promise(resolve => setTimeout(resolve, 100))
      .then(function () {
        reporter('main');
      });
    }
  };
});