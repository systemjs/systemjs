
var TestPage = function(el) {
  this.$results = el.querySelectorAll('tr td.result');
  this.$summary = el.querySelector('.summary');
}
TestPage.render = function(o) {
  var _ = '<table id="' + o.id + '">'
    + '<tr><th>Test</th><th>Result</th>';
  
  for (var i = 0; i < o.tests.length; i++)
    _ += '<tr><td class="name">' + o.tests[i].name + '</td><td class="result"></td></tr>';

  _ += '</table>';
  _ += '<p class="summary"></p>'
  return _;
}
TestPage.prototype = {
  setResult: function(index, result) {
    if (result)
      this.$results[index].innerHTML = result;
    else
      this.$results[index].innerHTML = 'Passed';
  },
  setSummary: function(passed, failed) {
    this.$summary.innerHTML = passed + ' tests passed, ' + failed + ' tests failed.';
  }
};

exports.execute = function(tests) {
  // draw the test table
  document.body.innerHTML = TestPage.render({
    id: 'test-table',
    tests: tests
  });
  var testPage = new TestPage(document.body);
  
  // run the tests
  var curTest = 0;
  var passed = 0;
  var failed = 0;
  doNextTest = function() {
    tests[curTest].run(function() {
      var result = tests[curTest].confirm.apply(null, arguments);
      testPage.setResult(curTest, result);

      if (result)
        failed++;
      else
        passed++;
      testPage.setSummary(passed, failed);

      curTest++;
      if (curTest == tests.length)
        testPage.setSummary(passed, failed);
      else
        doNextTest();
    }, function(err) {
      setTimeout(function() {
        throw err;
      }, 1);
      failed++;
      testPage.setSummary(passed, failed);
      curTest++;
      if (curTest == tests.length)
        testPage.setSummary(passed, failed);
    });
  }
  doNextTest();
}