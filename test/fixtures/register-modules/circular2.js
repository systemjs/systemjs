System.register(["./circular1.js"], function (_export, _context) {
  "use strict";

  var fn1, variable1, variable2, output;

  function fn2() {
    _export("output", output = variable1);
  }

  _export("fn2", fn2);

  _export("output", void 0);

  return {
    setters: [function (_circular1Js) {
      fn1 = _circular1Js.fn1;
      variable1 = _circular1Js.variable1;

      _export({
        output1: _circular1Js.output,
        output2: _circular1Js.output2
      });
    }],
    execute: function () {
      _export("variable2", variable2 = 'test circular 2');

      fn1();
    }
  };
});