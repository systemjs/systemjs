define(['require'], function(require) {

  var cb, module;

  require('tests/amd-dynamic', function(_module) {
    module = _module;
    
    if (cb)
      cb(module);
  });

  return {
    onCallback: function(_cb) {
      if (module)
        _cb(module);
      else
        cb = _cb;
    }
  };
});