System.registerDynamic([], false, function($__require, $__exports, $__module) {
  var _retrieveGlobal = System.registry.get("@@global-helpers").prepareGlobal($__module.id, null, null);
  (function() {
    var foo = this["foobar"];
    var foo = 'foo';
    this["foobar"] = foo;
  })();
  return _retrieveGlobal();
})
