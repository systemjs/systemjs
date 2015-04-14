/*
 * Set transpiler paths in Node
 */
(function() {
  var nodeResolver = typeof process != 'undefined' && typeof require != 'undefined' && require.resolve;

  function configNodePath(loader, module, nodeModule, wildcard) {
    if (loader.paths[module])
      return;

    var ext = wildcard ? '/package.json' : '';
    try {
      var match = nodeResolver(nodeModule + ext);
    }
    catch(e) {}
    
    if (match)
      loader.paths[module] = 'file://' + (isWindows ? '/' : '') + match.substr(0, match.length - ext.length) + (wildcard ? '/*.js' : '');
  }

  hookConstructor(function(constructor) {
    return function() {
      constructor.call(this);

      if (nodeResolver) {
        configNodePath(this, 'traceur', 'traceur/bin/traceur.js');
        configNodePath(this, 'traceur-runtime', 'traceur/bin/traceur-runtime.js');
        configNodePath(this, 'babel', 'babel-core/browser.js');
        configNodePath(this, 'babel/external-helpers', 'babel-core/external-helpers.js');
        configNodePath(this, 'babel', 'babel/browser.js');
        configNodePath(this, 'babel/external-helpers', 'babel/external-helpers.js');
        configNodePath(this, 'babel-runtime/*', 'babel-runtime', true);
      }
    };
  });
})();