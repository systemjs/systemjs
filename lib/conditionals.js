/*
 * Conditions Extension
 *
 *   Allows a condition module to alter the resolution of an import via syntax:
 *
 *     import $ from 'jquery/#{browser}';
 *
 *   Will first load the module 'browser' via `System.import('browser')` and 
 *   take the default export of that module.
 *   If the default export is not a string, an error is thrown.
 * 
 *   We then substitute the string into the require to get the conditional resolution
 *   enabling environment-specific variations like:
 * 
 *     import $ from 'jquery/ie'
 *     import $ from 'jquery/firefox'
 *     import $ from 'jquery/chrome'
 *     import $ from 'jquery/safari'
 *
 *   It can be useful for a condition module to define multiple conditions.
 *   This can be done via the `|` modifier to specify a specific export:
 *
 *     import 'jquery/#{browser|grade}'
 *
 *   Where the `grade` export of the `browser` module is taken for substitution.
 *
 *
 * Boolean Conditionals
 *
 *   For polyfill modules, that are used as imports but have no module value,
 *   a binary conditional allows a module not to be loaded at all if not needed:
 *
 *     import 'es5-shim?{conditions/needs-es5shim}'
 *
 */
(function() {

  var conditionalRegEx = /#\{[^\}]+\}|\?\{[^\}]+\}$/;

  hook('normalize', function(normalize) {
    return function(name, parentName, parentAddress) {
      var loader = this;
      return normalize.call(loader, name, parentName, parentAddress)
      .then(function(normalized) {
        var conditionalMatch = normalized.match(conditionalRegEx);
        if (!conditionalMatch)
          return normalized;

        var conditionModule = conditionalMatch[0].substr(2, conditionalMatch[0].length - 3);
        var substitution = conditionalMatch[0].substr(0, 1) == '#';
        var conditionExport = 'default';

        var exportNameIndex = conditionModule.lastIndexOf('|');
        if (exportNameIndex) {
          conditionExport = conditionModule.substr(exportNameIndex + 1);
          conditionModule = conditionModule.substr(0, exportNameIndex);
        }
        
        return System['import'](conditionModule, parentName)
        .then(function(m) {
          var conditionValue = m[conditionExport];

          if (substitution) {
            if (typeof conditionValue !== 'string')
              throw new TypeError('The condition value for ' + load.name + ' isn\'t resolving to a string.');
            return normalized.replace(conditionalRegEx, conditionValue);
          }
          else {
            if (typeof conditionValue !== 'boolean')
              throw new TypeError('The condition value for ' + load.name + ' isn\'t resolving to a boolean.');
            if (!conditionValue)
              return '@empty';
            return normalized;
          }
        });
      });
    };
  });

})();