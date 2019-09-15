System.register(['./live-binding-recover-error-2.js'], function (_export) {
  var x;

  function getX() {
    return x;
  }

  _export('getX', getX);

  return {
    setters: [function (_liveBinding2Js) {
      x = _liveBinding2Js.x;
    }],
    execute: function () {}
  };
});