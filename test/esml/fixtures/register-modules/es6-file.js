System.register(['./test-file.js'], function (_export, _context) {
  "use strict";

  var Q, p;
  return {
    setters: [function (_testFileJs) {
      Q = _testFileJs;
    }],
    execute: function () {
      class q {
        foo() {
          throw 'g';
          console.log('class method');
        }
      }

      _export('q', q);

      _export('default', 4);

      p = 5;
    }
  };
});