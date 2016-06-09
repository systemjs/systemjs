var systemjs = require('../index.js');

var num = 5;

var startTime, endTime;

startTime = Date.now();
require('./config-example/config.js');
endTime = Date.now();
console.log('Configured in ' + (endTime - startTime) + 'ms');

require('./config-example/pkg-configs.js');

var normalizeData = require('./config-example/normalize-data.js');

// decanonicalize the parentNames (we're not measuring decanonicalize)
var normalizationCnt = 0;
normalizeData.forEach(function(item) {
  normalizationCnt += item[1].length;
  item[0] = System.decanonicalize(item[0]);
});

// simulated System.register normalization test
// timed normalize of 'x', ['./dep'] cases
function test() {
  return Promise.all(normalizeData.map(function(item) {
    var parentName = item[0];
    var deps = item[1];
    return Promise.all(deps.map(function(dep) {
      return System.normalize(dep, parentName);
    }));
  }));
}

return Promise.resolve()
.then(function() {
  starTime = Date.now();
  return test()
  .then(function() {
    endTime = Date.now();
    console.log(normalizationCnt + ' first run normalizations in ' + (endTime - startTime) + 'ms');
    console.log((endTime - startTime) / normalizationCnt + 'ms per normalization');
  });
})
.then(function() {
  startTime = Date.now();
  var testPromise = Promise.resolve();
  for (var i = 0; i < num; i++)
    testPromise = testPromise.then(test);
  return testPromise
  .then(function() {
    endTime = Date.now();

    var time = (endTime - startTime) / num;

    console.log(normalizationCnt + ' subsequent normalizations in ' + time + 'ms');
    console.log(time / normalizationCnt + 'ms per normalization');

    /* System.perfSummary(function(evt) {
      return evt.name.match(/^normalize\:/);
    }); */
  })
  .catch(function(e) {
    console.error(e.stack || e);
  });

});