export default function(name, address, fetch, callback, errback, options) {
  fetch(address, function(source) {
    callback('export var extra = "yay!"; \n' + source);
  }, errback);
}