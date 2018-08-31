System.register(['./depc.js', './depb.js'], function (_export) {
  var reporter;
  return {
    setters: [function (_depC) {
      reporter = _depC.reporter;
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