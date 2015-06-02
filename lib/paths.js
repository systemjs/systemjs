/*
 * Paths extension
 * 
 * Applies paths and normalizes to a full URL
 */
hook('normalize', function(normalize) {
  return function(name, parentName) {
    var normalized = normalize.call(this, name, parentName);

    // if the module is in the registry already, use that
    if (this.has(normalized))
      return normalized;

    // automatic js extension adding for backwards compatibility
    if (this.defaultJSExtensions && normalized.substr(normalized.length - 3, 3) != '.js')
      normalized += '.js';

    if (normalized.match(absURLRegEx))
      return normalized;

    // applyPaths implementation provided from ModuleLoader system.js source
    normalized = applyPaths(this, normalized) || normalized;

    // ./x, /x -> page-relative
    if (normalized[0] == '.' || normalized[0] == '/')
      return new URL(normalized, baseURIObj).href;
    // x -> baseURL-relative
    else
      return new URL(normalized, getBaseURLObj.call(this)).href;
  };
});