var metadata = JSON.parse(Npm.require("fs").readFileSync('package.json'));

Package.describe({
  name: 'systemjs:systemjs',
  version: metadata.version,
  summary: 'Universal dynamic module loader',
  git: 'https://github.com/systemjs/systemjs',
  documentation: 'meteor/README.md'
});

Npm.depends({
    'xhr2': '0.1.2'
});

Package.onUse(function(api) {
  api.versionsFrom('1.1.0.2');
  
  // We need XMLHttpRequest on the server side for SystemJS remote fetching (or SystemJS won't run)
  // This may change in near future if we find better way to run SystemJS
  api.addFiles('meteor/xhr2.js', 'server');
  api.addFiles('meteor/require.js', 'server');
  
  api.addFiles([
    'dist/system-polyfills.js',
    'dist/system.js',
    'meteor/export.js'
  ]);
  
  api.export('System');
});

Package.onTest(function (api) {
  api.use('systemjs:systemjs');
  api.use('tinytest');

  api.addFiles('test/test-meteor.js');
});