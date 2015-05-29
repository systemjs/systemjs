/*
 * Paths extension
 * 
 * Applies paths and normalizes to a full URL
 */
hook('normalize', function(normalize) {
  return function(name, parentName) {
    var normalized = normalize.call(this, name, parentName);

    if (normalized.match(absURLRegEx))
      return normalized;

    // if the module is in the registry already, use that
    if (this.has(normalized))
      return normalized;

    // applyPaths implementation provided from ModuleLoader system.js source
    return new URL(applyPaths(this, normalized) || normalized, getBaseURLObj.call(this)).href;
  };
});