System.register(['./export.js', './reexport1.js', './reexport2.js'], function (_export, _context) {
  "use strict";

  var d, p, z, r, q;
  return {
    setters: [function (_exportJs) {
      //console.log(_exportJs);
      d = _exportJs.default;
    }, function (_reexport1Js) {
      p = _reexport1Js.s;
      q = _reexport1Js;
    }, function (_reexport2Js) {
      z = _reexport2Js.z;
      r = _reexport2Js.q;
    }],
    execute: function () {
      _export('a', d);

      _export('b', p);

      _export('c', z);

      _export('d', r);

      _export('q', q);
    }
  };
});
