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
 *   This can be done via the `.` modifier to specify a member expression:
 *
 *     import 'jquery/#{browser.grade}'
 *
 *   Where the `grade` export of the `browser` module is taken for substitution.
 *
 *   Note that `/` and a leading `.` are not permitted within conditional modules
 *   so that this syntax can be well-defined.
 *
 *
 * Boolean Conditionals
 *
 *   For polyfill modules, that are used as imports but have no module value,
 *   a binary conditional allows a module not to be loaded at all if not needed:
 *
 *     import 'es5-shim#?conditions.needs-es5shim'
 *
 */
(function() {

  var conditionalRegEx = /#\{[^\}]+\}|#\?.+$/;

  hookConstructor(function(constructor) {
    return function() {
      constructor.call(this);

      // standard environment module, starting small as backwards-compat matters!
      this.set('@system-env', this.newModule({
        browser: isBrowser,
        node: !!this._nodeRequire
      }));
    };
  });

  hook('normalize', function(normalize) {
    return function(name, parentName, parentAddress) {
      var loader = this;
      var conditionalMatch = name.match(conditionalRegEx);
      if (conditionalMatch) {
        var substitution = conditionalMatch[0][1] != '?';
        
        var conditionModule = substitution ? conditionalMatch[0].substr(2, conditionalMatch[0].length - 3) : conditionalMatch[0].substr(2);

        if (conditionModule[0] == '.' || conditionModule.indexOf('/') != -1)
          throw new TypeError('Invalid condition ' + conditionalMatch[0] + '\n\tCondition modules cannot contain . or / in the name.');

        var conditionExport;
        var conditionExportIndex = conditionModule.indexOf('.');
        if (conditionExportIndex != -1) {
          conditionExport = conditionModule.substr(conditionExportIndex + 1);
          conditionModule = conditionModule.substr(0, conditionExportIndex);
        }

        var booleanNegation = !substitution && conditionModule[0] == '~';
        if (booleanNegation)
          conditionModule = conditionModule.substr(1);

        var pluginLoader = loader.pluginLoader || loader;
        
        return pluginLoader['import'](conditionModule, parentName, parentAddress)
        .then(function(m) {
          if (conditionExport === undefined) {
            // CommonJS case
            if (typeof m == 'string')
              return m;
            else
              return m['default'];
          }
          
          return readMemberExpression(conditionExport, m);
        })
        .then(function(conditionValue) {
          if (substitution) {
            if (typeof conditionValue !== 'string')
              throw new TypeError('The condition value for ' + conditionModule + ' doesn\'t resolve to a string.');
            name = name.replace(conditionalRegEx, conditionValue);
          }
          else {
            if (typeof conditionValue !== 'boolean')
              throw new TypeError('The condition value for ' + conditionModule + ' isn\'t resolving to a boolean.');
            if (booleanNegation)
              conditionValue = !conditionValue;
            if (!conditionValue)
              name = '@empty';
            else
              name = name.replace(conditionalRegEx, '');
          }
          return normalize.call(loader, name, parentName, parentAddress);
        });
      }

      return Promise.resolve(normalize.call(loader, name, parentName, parentAddress));
    };
  });

})();