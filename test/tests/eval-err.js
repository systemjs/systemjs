(function (g) {
  g.errCnt = g.errCnt || 0;
  g.errCnt++;
  throw new Error('Eval error ' + g.errCnt);
})(typeof self !== 'undefined' ? self : global);
