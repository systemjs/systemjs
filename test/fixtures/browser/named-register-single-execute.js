window.namedRegisterExecutes = 0;

System.register('named-register-single-execute', [], function(_export) {
  return {
    execute: function() {
      window.namedRegisterExecutes++;
      _export('bonjour', 'bonjour');
    }
  };
});