define('d', [], function () {
  return { b: 'b' };
});

define('c', ['exports', 'd'], function (exports, b) {
  exports.a = b.b;
});
