System.register(['./depc.js', './depb.js'], function (_export) {
  var depB;
  return {
    setters: [function (_depC) {
      reporter = _depC.reporter;
    }, function (_depB) {
      depB = _depB;
    }],
    execute: function () {
      reporter('a');
      return new Promise(resolve => setTimeout(resolve, 10))
      .then(function () {
        reporter('a');
      });
    }
  };
});