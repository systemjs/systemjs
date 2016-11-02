import { isWindows } from './common.js';

/*
 * Source loading
 */
var fetchTextFromURL;
if (typeof XMLHttpRequest != 'undefined') {
  fetchTextFromURL = function(url, authorization) {
    return new Promise(function (resolve, reject) {
      // percent encode just "#" for HTTP requests
      url = url.replace(/#/g, '%23');

      var xhr = new XMLHttpRequest();
      function load() {
        resolve(xhr.responseText);
      }
      function error() {
        reject(new Error('XHR error' + (xhr.status ? ' (' + xhr.status + (xhr.statusText ? ' ' + xhr.statusText  : '') + ')' : '') + ' loading ' + url));
      }

      xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
          // in Chrome on file:/// URLs, status is 0
          if (xhr.status == 0) {
            if (xhr.responseText) {
              load();
            }
            else {
              // when responseText is empty, wait for load or error event
              // to inform if it is a 404 or empty file
              xhr.addEventListener('error', error);
              xhr.addEventListener('load', load);
            }
          }
          else if (xhr.status === 200) {
            load();
          }
          else {
            error();
          }
        }
      };
      xhr.open("GET", url, true);

      if (xhr.setRequestHeader) {
        xhr.setRequestHeader('Accept', 'application/x-es-module, */*');
        // can set "authorization: true" to enable withCredentials only
        if (authorization) {
          if (typeof authorization == 'string')
            xhr.setRequestHeader('Authorization', authorization);
          xhr.withCredentials = true;
        }
      }

      xhr.send(null);
    });
  };
}
else if (typeof require !== 'undefined' && typeof process !== 'undefined') {
  var fs;
  fetchTextFromURL = function (url, authorization) {
    if (url.substr(0, 8) != 'file:///')
      return Promise.reject(new Error('Unable to fetch "' + url + '". Only file URLs of the form file:/// allowed running in Node.'));

    fs = fs || require('fs');
    if (isWindows)
      url = url.replace(/\//g, '\\').substr(8);
    else
      url = url.substr(7);

    return new Promise(function (resolve, reject) {
      fs.readFile(url, function(err, data) {
        if (err) {
          return reject(err);
        }
        else {
          // Strip Byte Order Mark out if it's the leading char
          var dataString = data + '';
          if (dataString[0] === '\ufeff')
            dataString = dataString.substr(1);

          resolve(dataString);
        }
      });
    });
  };
}
else if (typeof self !== 'undefined' && typeof self.fetch !== 'undefined') {
  fetchTextFromURL = function (url, authorization) {
    var opts = {
      headers: { Accept: 'application/x-es-module, */*' }
    };

    if (authorization) {
      if (typeof authorization == 'string')
        opts.headers['Authorization'] = authorization;
      opts.credentials = 'include';
    }

    return fetch(url, opts)
    .then(function(res) {
      if (res.ok)
        return res.text();
      else
        throw new Error('Fetch error: ' + r.status + ' ' + r.statusText);
    });
  }
}
else {
  fetchTextFromURL = function () {
    throw new Error('No fetch method is defined for this environment.');
  }
}
export default fetchTextFromURL;
