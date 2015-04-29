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
 *   "globals.some value"
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

  function setMetaProperty(target, p, value) {
    var pParts = p.split('.');
    var curPart;
    while (pParts.length > 1) {
      curPart = pParts.shift();
      target = target[curPart] = target[curPart] || {};
    }
    curPart = pParts.shift();
    if (!(curPart in target))
      target[curPart] = value;
  }

  hook('translate', function(translate) {
    return function(load) {
      var meta = load.source.match(metaRegEx);
      if (meta) {
        var metaParts = meta[0].match(metaPartRegEx);

        for (var i = 0; i < metaParts.length; i++) {
          var curPart = metaParts[i];
          var len = curPart.length;

          var firstChar = curPart.substr(0, 1);
          if (curPart.substr(len - 1, 1) == ';')
            len--;
        
          if (firstChar != '"' && firstChar != "'")
            continue;

          var metaString = curPart.substr(1, curPart.length - 3);
          var metaName = metaString.substr(0, metaString.indexOf(' '));

          if (metaName) {
            var metaValue = metaString.substr(metaName.length + 1, metaString.length - metaName.length - 1);

            // support "deps [jquery,bootstrap]" array syntax
            if (metaValue[0] == '[' && metaValue[metaValue.length - 1] == ']')
              metaValue = metaValue.substr(1, metaValue.length - 2).split(',');

            // Array addition backwards-compatibility, to be deprecated
            if (load.metadata[metaName] instanceof Array) {
              if (!(metaValue instanceof Array))
                metaValue = [metaValue];
              load.metadata[metaName] = load.metadata[metaName].concat(metaValue);
            }
            else
              setMetaProperty(load.metadata, metaName, metaValue);
          }
        }
      }
      
      return translate.call(this, load);
    };
  });
})();