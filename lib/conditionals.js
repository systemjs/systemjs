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
 *   This can be done via the `|` modifier to specify an export member expression:
 *
 *     import 'jquery/#{./browser.js|grade.version}'
 *
 *   Where the `grade` export `version` member in the `browser.js` module  is substituted.
 *
 *
 * Boolean Conditionals
 *
 *   For polyfill modules, that are used as imports but have no module value,
 *   a binary conditional allows a module not to be loaded at all if not needed:
 *
 *     import 'es5-shim#?./conditions.js|needs-es5shim'
 *
 */

  var conditionalRegEx = /#\{[^\}]+\}|#\?.+$/;
  function resolveConditionals(name, parentName) {
    // skip conditional resolution in builds
    if (this.builder)
      return name;

    // first we normalize the conditional
    var conditionalMatch = name.match(conditionalRegEx);

    if (!conditionalMatch)
      return name;

    var substitution = conditionalMatch[0][1] != '?';
    
    var conditionModule = substitution ? conditionalMatch[0].substr(2, conditionalMatch[0].length - 3) : conditionalMatch[0].substr(2);

    var conditionExport;
    var conditionExportIndex = conditionModule.lastIndexOf('|');
    if (conditionExportIndex != -1) {
      conditionExport = conditionModule.substr(conditionExportIndex + 1);
      conditionModule = conditionModule.substr(0, conditionExportIndex);
    }

    var booleanNegation = !substitution && conditionModule[0] == '~';
    if (booleanNegation)
      conditionModule = conditionModule.substr(1);
    
    return this['import'](conditionModule, parentName)
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
      return name;
    });
  }

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
      return Promise.resolve(resolveConditionals.call(this, name, parentName))
      .then(function(name) {
        return normalize.call(loader, name, parentName, parentAddress);
      });
    };
  });
