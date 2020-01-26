System.register(['named-register-single-execute'], function (_export) {
  let dep;

  return {
    setters: [
      function(m) {
        dep = m;
      }
    ],
    execute: function() {
      _export('bonjour', dep.bonjour);
    }
  };
});