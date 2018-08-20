System.register(['./depc.js', './depa.js'], function (_export) {
  var depA;
  return {
    setters: [function (_depC) {
      reporter = _depC.reporter;
    }, function (_depA) {
      depA = _depA;
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