var parseConfig = function(obj) {
  obj.baseURL = obj.baseUrl;
  return obj;
}
var require = requirejs = function(names, callback, errback, lastArg) {
  if (typeof names == 'object' && !(names instanceof Array)) {
    jspm.config(parseConfig(names));
    jspm.import(callback, errback, lastArg);
    return;
  }
  if (names)
    jspm.import(names, callback, errback);
}
require.config = function(obj) {
  jspm.config(parseConfig(obj));
}
