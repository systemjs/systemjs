import { isWindows } from './common.js';

/*
 * Source loading
 */
function fetchFetch (url, authorization, integrity, asBuffer) {
  // fetch doesn't support file:/// urls
  if (url.substr(0, 8) === 'file:///') {
    if (hasXhr)
      return xhrFetch(url, authorization, integrity, asBuffer);
    else
      throw new Error('Unable to fetch file URLs in this environment.');
  }

  // percent encode just "#" for HTTP requests
  url = url.replace(/#/g, '%23');

  var opts = {
    // NB deprecate
    headers: { Accept: 'application/x-es-module, */*' }
  };

  if (integrity)
    opts.integrity = integrity;

  if (authorization) {
    if (typeof authorization == 'string')
      opts.headers['Authorization'] = authorization;
    opts.credentials = 'include';
  }

  return fetch(url, opts)
  .then(function(res) {
    if (res.ok)
      return asBuffer ? res.arrayBuffer() : res.text();
    else
      throw new Error('Fetch error: ' + res.status + ' ' + res.statusText);
  });
}

function xhrFetch (url, authorization, integrity, asBuffer) {
  return new Promise(function (resolve, reject) {
    // percent encode just "#" for HTTP requests
    url = url.replace(/#/g, '%23');

    var xhr = new XMLHttpRequest();
    if (asBuffer)
      xhr.responseType = 'arraybuffer';
    function load() {
      resolve(asBuffer ? xhr.response : xhr.responseText);
    }
    function error() {
      reject(new Error('XHR error: ' + (xhr.status ? ' (' + xhr.status + (xhr.statusText ? ' ' + xhr.statusText  : '') + ')' : '') + ' loading ' + url));
    }

    xhr.onreadystatechange = function () {
      if (xhr.readyState === 4) {
        // in Chrome on file:/// URLs, status is 0
        if (xhr.status == 0) {
          if (xhr.response) {
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
}

var fs;
function nodeFetch (url, authorization, integrity, asBuffer) {
  if (url.substr(0, 8) != 'file:///')
    return Promise.reject(new Error('Unable to fetch "' + url + '". Only file URLs of the form file:/// supported running in Node.'));

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
        if (asBuffer) {
          resolve(data);
        }
        else {
          // Strip Byte Order Mark out if it's the leading char
          var dataString = data + '';
          if (dataString[0] === '\ufeff')
            dataString = dataString.substr(1);

          resolve(dataString);
        }
      }
    });
  });
}

function noFetch () {
  throw new Error('No fetch method is defined for this environment.');
}

var fetchFunction;

var hasXhr = typeof XMLHttpRequest !== 'undefined';

if (typeof self !== 'undefined' && typeof self.fetch !== 'undefined')
 fetchFunction = fetchFetch;
else if (hasXhr)
  fetchFunction = xhrFetch;
else if (typeof require !== 'undefined' && typeof process !== 'undefined')
  fetchFunction = nodeFetch;
else
  fetchFunction = noFetch;

export default fetchFunction;
