import assert from 'assert';
import { resolveIfNotPlainOrUrl } from '../src/common.js';

describe('Simple normalization tests', function () {
  it('Should resolve relative with protocol', function () {
    assert.equal(resolveIfNotPlainOrUrl('./x:y', 'https://x.com/y'), 'https://x.com/x:y');
  });
  it('Should convert \ into /', function () {
    assert.equal(resolveIfNotPlainOrUrl('./a\\b', 'https://x.com/z'), 'https://x.com/a/b')
  });
  it('Should resolve relative windows paths', function () {
    assert.equal(resolveIfNotPlainOrUrl('./test.js', 'file:///C:/some/path/'), 'file:///C:/some/path/test.js');
  });
  it('Should resolve unix file paths as file:/// URLs', function () {
    assert.equal(resolveIfNotPlainOrUrl('/some/file/path.js', 'file:///home/path/to/project'), 'file:///some/file/path.js');
  });
  it('Should support resolving plain URI forms', function () {
    assert.equal(resolveIfNotPlainOrUrl('./asdf', 'npm:lodash/'), 'npm:lodash/asdf');
  });
  it('Should support backtracking exactly to the base in plain URI forms', function () {
    assert.equal(resolveIfNotPlainOrUrl('../', 'npm:lodash/asdf/y'), 'npm:lodash/');
  });
  it('Should support "." for resolution', function () {
    assert.equal(resolveIfNotPlainOrUrl('.', 'https://www.google.com/asdf/asdf'), 'https://www.google.com/asdf/');
  });
  it('Should support ".." resolution', function () {
    assert.equal(resolveIfNotPlainOrUrl('..', 'https://www.google.com/asdf/asdf/asdf'), 'https://www.google.com/asdf/');
  });
  it('Should support "./" for resolution', function () {
    assert.equal(resolveIfNotPlainOrUrl('./', 'https://www.google.com/asdf/asdf'), 'https://www.google.com/asdf/');
  });
  it('Should support "../" resolution', function () {
    assert.equal(resolveIfNotPlainOrUrl('../', 'https://www.google.com/asdf/asdf/asdf'), 'https://www.google.com/asdf/');
  });
  it('Should leave a trailing "/"', function () {
    assert.equal(resolveIfNotPlainOrUrl('./asdf/', 'file:///x/y'), 'file:///x/asdf/');
  });
  it('Should leave a trailing "//"', function () {
    assert.equal(resolveIfNotPlainOrUrl('./asdf//', 'file:///x/y'), 'file:///x/asdf//');
  });
  it('Should support a trailing ".."', function () {
    assert.equal(resolveIfNotPlainOrUrl('../..', 'path/to/test/module.js'), 'path/');
  });
});

import fs from 'fs';
var testCases = eval('(' + fs.readFileSync('test/fixtures/url-resolution-cases.json') + ')');

describe('URL resolution selected WhatWG URL spec tests', function () {
  testCases.forEach(function (test) {
    if (typeof test === 'string')
      return;

    // ignore cases where input contains newlines
    if (test.input.match(/[\n]/) || test.base.match(/[\n]/))
      return;

    // if its a protocol input case that should fail or alter through validation, we obviously don't do that
    if (test.input.indexOf(':') !== -1 && (test.failure || test.input !== test.href))
      return;

    // we don't handle hashes
    if (test.input.indexOf('#') !== -1)
      return;

    // we don't handle C| automatically converting into file:///c:/
    if (test.input.indexOf('C|') !== -1)
      return;

    // we don't handle percent encoding
    if (test.href && test.href.indexOf('%') !== -1 && test.input.indexOf('%') === -1)
      return;

    // we don't give special handling to names starting with "?"
    if (test.input[0] === '?')
      return;

    // we don't convert backslashes to forward slashes in general
    if (test.input.indexOf('\\') !== -1)
      return;

    // we don't support automatically adding "/" to the end of protocol URLs
    if (!test.failure && test.href.endsWith('/') && !test.input.endsWith('/') && test.input[0] !== '.')
      return;

    // we don't support automatically working out that file URLs always need to be ///
    if (test.input == '//' && !test.failure && test.base.startsWith('file:///'))
      return;

    if (test.base.indexOf(':') !== -1 && test.base[test.base.indexOf(':') + 1] !== '/' && test.failure) {
      // we don't fail on the cases that should fail for resolving against package:x/y, as we support and treat this as a plain parent normalization
      if (test.input.indexOf(':') === -1 && test.input.indexOf('/') === -1 && test.input.indexOf('.') === -1)
        return;
      // we don't support backtracking failures
      if (test.input.startsWith('../') || test.input.startsWith('/'))
        return;
    }

    // we don't do whitespace trimming, so handle it here
    test.input = test.input.trim();

    // we don't handle the empty string
    if (test.input == '')
      return;

    it('Should resolve "' + test.input + '" to "' + test.base + '"', function () {
      var failed = false;
      try {
        var resolved = resolveIfNotPlainOrUrl(test.input, test.base) || test.input.indexOf(':') !== -1 && test.input || resolveIfNotPlainOrUrl('./' + test.input, test.base);
      }
      catch(e) {
        failed = true;
        if (!test.failure)
          throw new Error('Resolution failure, should have been "' + test.href + '"');
      }
      if (test.failure && !failed)
        throw new Error('Should have failed resolution');
      if (!test.failure)
        assert.equal(resolved, test.href);
    });
  });
});
