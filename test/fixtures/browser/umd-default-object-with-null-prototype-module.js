(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
      define(['./amd-dep.js'], factory);
  } else {
    throw 'Test suit only supports amd';
  }
}(typeof self !== 'undefined' ? self : this, function (amdDep) {
  const umdExportObject = Object.create(null);
  umdExportObject.dep = amdDep;
  umdExportObject.umd = true;
  return umdExportObject;
}));
