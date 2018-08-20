System.register(['./depa.js', './depb.js', './depc.js'], function (_export) {
  var depA, depB, depC, reporter;

  return {
    setters: [function (_depA) {
      depA = _depA;
    }, function (_depB) {
      depB = _depB;
    }, function (_depC) {
      depC = _depC;
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