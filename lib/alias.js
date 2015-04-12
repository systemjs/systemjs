/*
 * Alias Extension
 *
 * Allows a module to be a plain copy of another module by module name
 *
 * System.meta['mybootstrapalias'] = { alias: { 'bootstrap' } };
 *
 */
(function() {
  hook('locate', function(locate) {
    return function(load) {
      return locate.call(this, load)
      .then(function(address) {
        var alias = load.metadata.alias;
        if (alias) {
          load.metadata.format = 'alias';
          load.metadata.deps.push(alias);
          load.metadata.execute = function(require) {
            return require(alias);
          };
        }
        return address;
      });
    };
  });
})();