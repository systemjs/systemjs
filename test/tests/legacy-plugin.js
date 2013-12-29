module.exports = function(name, address, fetch, callback, errback) {
  fetch(address, function(source) {
    callback('export var plugin = true; ' + source);
  });
}