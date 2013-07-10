export function load(source, callback, errback, options) {
  console.log('load');
  callback('export var extra = "yay!"; \n' + source);
}