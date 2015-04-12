/*
 * Meta Extension
 *
 * Sets default metadata on a load record (load.metadata) from
 * loader.meta.
 *
 *
 * Also provides an inline meta syntax for module meta in source.
 *
 * Eg:
 *
 * loader.meta['my/module'] = { deps: ['jquery'] };
 * loader.meta['my/*'] = { format: 'amd' };
 *
 * load.metadata.deps and load.metadata.format will then be set
 * for 'my/module'
 *
 * The same meta could be set with a my/module.js file containing:
 * 
 * my/module.js
 *   "format amd"; 
 *   "deps jquery";
 *   console.log('this is my/module');
 *
 * Configuration meta always takes preference to inline meta.
 *
 * Multiple matches in wildcards are supported and ammend the meta.
 * 
 */

(function() {

  hookConstructor(function(constructor) {
    return function() {
      constructor.call(this);
      this.meta = {};
    };
  });

  function extend(a, b, overwrite) {
    for (var p in b) {
      if (overwrite || !(p in a))
        a[p] = b[p];
    }
  }

  hook('locate', function(locate) {
    return function(load) {
      var meta = this.meta;
      var name = load.name;

      // NB for perf, maybe introduce a fast-path wildcard lookup cache here
      // which is checked first

      // apply wildcard metas
      var bestDepth = 0;
      var wildcardIndex;
      for (var module in meta) {
        wildcardIndex = indexOf.call(module, '*');
        if (wildcardIndex === -1)
          continue;
        if (module.substr(0, wildcardIndex) === name.substr(0, wildcardIndex)
            && module.substr(wildcardIndex + 1) === name.substr(name.length - module.length + wildcardIndex + 1)) {
          var depth = module.split('/').length;
          if (depth > bestDepth)
            bestDetph = depth;
          extend(load.metadata, meta[module], bestDepth == depth);
        }
      }

      // apply exact meta
      if (meta[name])
        extend(load.metadata, meta[name], true);

      return locate.call(this, load);
    };
  });

  // detect any meta header syntax
  // only set if not already set
  var metaRegEx = /^(\s*\/\*.*\*\/|\s*\/\/[^\n]*|\s*"[^"]+"\s*;?|\s*'[^']+'\s*;?)+/;
  var metaPartRegEx = /\/\*.*\*\/|\/\/[^\n]*|"[^"]+"\s*;?|'[^']+'\s*;?/g;

  hook('translate', function(translate) {
    return function(load) {
      var meta = load.source.match(metaRegEx);
      if (meta) {
        var metaParts = meta[0].match(metaPartRegEx);

        for (var i = 0; i < metaParts.length; i++) {
          var len = metaParts[i].length;

          var firstChar = metaParts[i].substr(0, 1);
          if (metaParts[i].substr(len - 1, 1) == ';')
            len--;
        
          if (firstChar != '"' && firstChar != "'")
            continue;

          var metaString = metaParts[i].substr(1, metaParts[i].length - 3);
          var metaName = metaString.substr(0, metaString.indexOf(' '));

          if (metaName) {
            var metaValue = metaString.substr(metaName.length + 1, metaString.length - metaName.length - 1);

            if (!(metaName in load.metadata))
              load.metadata[metaName] = metaValue;
          }
        }
      }
      
      return translate.call(this, load);
    };
  });
})();