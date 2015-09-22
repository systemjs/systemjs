/*
 * Paths extension
 * 
 * Applies paths and normalizes to a full URL
 */
hook('normalize', function(normalize) {
  return function(name, parentName) {
    var normalized = normalize.apply(this, arguments);

    // if the module is in the registry already, use that
    if (this.has(normalized))
      return normalized;

    if (normalized.match(absURLRegEx)) {
      // defaultJSExtensions backwards compatibility
      if (this.defaultJSExtensions && normalized.substr(normalized.length - 3, 3) != '.js')
        normalized += '.js';
      return normalized;
    }

    // applyPaths implementation provided from ModuleLoader system.js source
    normalized = applyPaths(this.paths, normalized) || normalized;

    // defaultJSExtensions backwards compatibility
    if (this.defaultJSExtensions && normalized.substr(normalized.length - 3, 3) != '.js')
      normalized += '.js';

    // ./x, /x -> page-relative
    if (normalized[0] == '.' || normalized[0] == '/')
      normalized = new URL(normalized, baseURIObj).href;
    // x -> baseURL-relative
    else
      normalized = new URL(normalized, getBaseURLObj.call(this)).href;

    // encode just # in URLs
    return normalized.replace(/#/g, '%23');
  };
});