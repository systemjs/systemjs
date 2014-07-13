define([
  // with a single-line comment
  './amd-module',
  /* with a multi-line
     comment
   */
  './amd-module'
  // trailing single-line comment
  /* trailing multi-line
     comment */
], function () {
  return { amd: true };
});
