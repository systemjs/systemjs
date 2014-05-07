/*
 * Script tag fetch
 */

function scriptLoader(loader) {
  if (typeof indexOf == 'undefined')
    indexOf = Array.prototype.indexOf;

  var head = document.getElementsByTagName('head')[0];

  // override fetch to use script injection
  loader.fetch = function(load) {
    return new Promise(function(resolve, reject) {
      var s = document.createElement('script');
      s.async = true;
      s.addEventListener('load', function(evt) {
        resolve('');
      }, false);
      s.addEventListener('error', function(err) {
        reject(err);
      }, false);
      s.src = load.address;
      head.appendChild(s);
    });
  }

  loader.scriptLoader = true;
}
