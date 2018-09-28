System.register(["./circular2.js"], function (_export, _context) {
  "use strict";

  var fn2, variable2, variable1, output;

  function fn1() {
    _export("output", output = variable2);
  }

  _export("fn1", fn1);

  _export("output", void 0);

  return {
    setters: [function (_circular2Js) {
      fn2 = _circular2Js.fn2;
      variable2 = _circular2Js.variable2;

      _export({
        output2: _circular2Js.output,
        output1: _circular2Js.output1
      });
    }],
    execute: function () {
      _export("variable1", variable1 = 'test circular 1');

      fn2();
    }
  };
});