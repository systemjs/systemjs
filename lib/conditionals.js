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
  function resolveCondition(conditionModule, parentName, bool) {
    var conditionExport;
    var conditionExportIndex = conditionModule.lastIndexOf('|');
    if (conditionExportIndex != -1) {
      conditionExport = conditionModule.substr(conditionExportIndex + 1);
      conditionModule = conditionModule.substr(0, conditionExportIndex);
    }

    var booleanNegation = bool && conditionModule[0] == '~';
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
      
      var conditionValue = readMemberExpression(conditionExport, m);

      if (bool && typeof conditionValue !== 'boolean')
        throw new TypeError('The condition value for ' + conditionModule + ' isn\'t resolving to a boolean.');

      if (booleanNegation)
        conditionValue = !conditionValue;

      return conditionValue;
    });
  }

  var interpolationRegEx = /#\{[^\}]+\}/;
  function interpolateConditional(name, parentName) {
    // first we normalize the conditional
    var conditionalMatch = name.match(interpolationRegEx);

    if (!conditionalMatch)
      return Promise.resolve(name);

    var conditionModule = conditionalMatch[0].substr(2, conditionalMatch[0].length - 3);

    // in builds, return normalized conditional
    if (this.builder)
      return this['normalize'](conditionModule, parentName)
      .then(function(conditionModule) {
        return name.replace(interpolationRegEx, '#{' + conditionModule + '}');
      });

    return resolveCondition.call(this, conditionModule, parentName, false)
    .then(function(conditionValue) {
      if (typeof conditionValue !== 'string')
        throw new TypeError('The condition value for ' + conditionModule + ' doesn\'t resolve to a string.');

      return name.replace(interpolationRegEx, conditionValue);
    });
  }

  var booleanRegEx = /#\?.+$/;
  function booleanConditional(name, parentName) {
    // first we normalize the conditional
    var conditionalMatch = name.match(booleanRegEx);

    if (!conditionalMatch)
      return Promise.resolve(name);

    var conditionModule = conditionalMatch[0].substr(2);

    // in builds, return normalized conditional
    if (this.builder)
      return this['normalize'](conditionModule, parentName)
      .then(function(conditionModule) {
        return name.substr(0, name.length - conditionModule.length) = conditionModule;
      });

    return resolveCondition.call(this, conditionModule, parentName, true)
    .then(function(conditionValue) {
      return conditionValue ? name.substr(0, name.length - conditionModule.length - 2) : '@empty';
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

  // no normalizeSync
  hook('normalize', function(normalize) {
    return function(name, parentName, parentAddress) {
      var loader = this;
      return booleanConditional.call(loader, name, parentName)
      .then(function(name) {
        return normalize.call(loader, name, parentName, parentAddress);
      })
      .then(function(normalized) {
        return interpolateConditional.call(loader, normalized, parentName);
      });
    };
  });
