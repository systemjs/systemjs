/*
 * Paths extension
 * 
 * Applies paths and normalizes to a full URL
 */
hook('normalize', function(normalize) {

  function getExt(name) {
    var extParts = name.split('/').pop().split('.');
    if (extParts.length > 1)
      return extParts.pop();
  }

  return function(name, parentName) {
    var normalized = normalize.call(this, name, parentName);

    // if the module is in the registry already, use that
    if (this.has(normalized))
      return normalized;

    var ext = getExt(normalized);

    if (normalized.match(absURLRegEx)) {
      // defaultJSExtensions backwards compatibility
      if (this.defaultJSExtensions && ext !== 'js')
        normalized += '.js';
      return normalized;
    }

    // applyPaths implementation provided from ModuleLoader system.js source
    normalized = applyPaths(this.paths, normalized) || normalized;

    // defaultJSExtensions backwards compatibility
    // if the extension hasn't changed, and the extension is not js, add js
    if (this.defaultJSExtensions && ext == getExt(normalized) && ext != 'js')
      normalized += '.js';

    // ./x, /x -> page-relative
    if (normalized[0] == '.' || normalized[0] == '/')
      return new URL(normalized, baseURIObj).href;
    // x -> baseURL-relative
    else
      return new URL(normalized, getBaseURLObj.call(this)).href;
  };
});