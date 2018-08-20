"bundle"

if (typeof define !== 'undefined')
  define(function () {
    throw new Error('AMD shouldnt define');
  });

System.registerDynamic('asdf', [], true, function () {
  return {
    bundle: 'module'
  };
});
