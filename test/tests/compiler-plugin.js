export function load(source, callback, errback, options) {
  callback('export var extra = "yay!"; \n' + source);
}