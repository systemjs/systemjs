export function load(args, loader, callback, errback, referer) {
  loader.fetch(args[0].address, function(source) {
    callback(source + ' export var extra = "yay!";');
  }, errback, referer);
}