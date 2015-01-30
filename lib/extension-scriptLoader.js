/*
 * Script tag fetch
 */

function scriptLoader(loader) {
  if (typeof indexOf == 'undefined')
    indexOf = Array.prototype.indexOf;

  loader._extensions.push(scriptLoader);

  var head = document.getElementsByTagName('head')[0];

  // call this functione everytime a wrapper executes
  loader.onScriptLoad = function() {};

  // override fetch to use script injection
  loader.fetch = function(load) {
    return new Promise(function(resolve, reject) {
      var s = document.createElement('script');
      s.async = true;

      function complete(evt) {
        if (s.readyState && s.readyState != 'loaded' && s.readyState != 'complete')
          return;
        cleanup();

        // this runs synchronously after execution
        // we now need to tell the wrapper handlers that
        // this load record has just executed
        loader.onScriptLoad(load);

        // if nothing registered, then something went wrong
        if (!load.metadata.registered)
          reject(load.address + ' did not call System.register or AMD define');

        resolve('');
      }

      function error(evt) {
        cleanup();
        reject(evt);
      }

      if (s.attachEvent) {
        s.attachEvent('onreadystatechange', complete);
      }
      else {
        s.addEventListener('load', complete, false);
        s.addEventListener('error', error, false);
      }

      s.src = load.address;
      head.appendChild(s);

      function cleanup() {
        if (s.detachEvent)
          s.detachEvent('onreadystatechange', complete);
        else {
          s.removeEventListener('load', complete, false);
          s.removeEventListener('error', error, false);
        }
        head.removeChild(s);
      }
    });
  }

  loader.scriptLoader = true;
}
