/*
* SystemJS 3.0.0
*/
(function () {
            var global$1 = (typeof global !== "undefined" ? global :
                        typeof self !== "undefined" ? self :
                        typeof window !== "undefined" ? window : {});

            // shim for using process in browser
            // based off https://github.com/defunctzombie/node-process/blob/master/browser.js

            function defaultSetTimout() {
                throw new Error('setTimeout has not been defined');
            }
            function defaultClearTimeout () {
                throw new Error('clearTimeout has not been defined');
            }
            var cachedSetTimeout = defaultSetTimout;
            var cachedClearTimeout = defaultClearTimeout;
            if (typeof global$1.setTimeout === 'function') {
                cachedSetTimeout = setTimeout;
            }
            if (typeof global$1.clearTimeout === 'function') {
                cachedClearTimeout = clearTimeout;
            }

            function runTimeout(fun) {
                if (cachedSetTimeout === setTimeout) {
                    //normal enviroments in sane situations
                    return setTimeout(fun, 0);
                }
                // if setTimeout wasn't available but was latter defined
                if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
                    cachedSetTimeout = setTimeout;
                    return setTimeout(fun, 0);
                }
                try {
                    // when when somebody has screwed with setTimeout but no I.E. maddness
                    return cachedSetTimeout(fun, 0);
                } catch(e){
                    try {
                        // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
                        return cachedSetTimeout.call(null, fun, 0);
                    } catch(e){
                        // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
                        return cachedSetTimeout.call(this, fun, 0);
                    }
                }


            }
            function runClearTimeout(marker) {
                if (cachedClearTimeout === clearTimeout) {
                    //normal enviroments in sane situations
                    return clearTimeout(marker);
                }
                // if clearTimeout wasn't available but was latter defined
                if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
                    cachedClearTimeout = clearTimeout;
                    return clearTimeout(marker);
                }
                try {
                    // when when somebody has screwed with setTimeout but no I.E. maddness
                    return cachedClearTimeout(marker);
                } catch (e){
                    try {
                        // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
                        return cachedClearTimeout.call(null, marker);
                    } catch (e){
                        // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
                        // Some versions of I.E. have different rules for clearTimeout vs setTimeout
                        return cachedClearTimeout.call(this, marker);
                    }
                }



            }
            var queue = [];
            var draining = false;
            var currentQueue;
            var queueIndex = -1;

            function cleanUpNextTick() {
                if (!draining || !currentQueue) {
                    return;
                }
                draining = false;
                if (currentQueue.length) {
                    queue = currentQueue.concat(queue);
                } else {
                    queueIndex = -1;
                }
                if (queue.length) {
                    drainQueue();
                }
            }

            function drainQueue() {
                if (draining) {
                    return;
                }
                var timeout = runTimeout(cleanUpNextTick);
                draining = true;

                var len = queue.length;
                while(len) {
                    currentQueue = queue;
                    queue = [];
                    while (++queueIndex < len) {
                        if (currentQueue) {
                            currentQueue[queueIndex].run();
                        }
                    }
                    queueIndex = -1;
                    len = queue.length;
                }
                currentQueue = null;
                draining = false;
                runClearTimeout(timeout);
            }
            function nextTick(fun) {
                var args = new Array(arguments.length - 1);
                if (arguments.length > 1) {
                    for (var i = 1; i < arguments.length; i++) {
                        args[i - 1] = arguments[i];
                    }
                }
                queue.push(new Item(fun, args));
                if (queue.length === 1 && !draining) {
                    runTimeout(drainQueue);
                }
            }
            // v8 likes predictible objects
            function Item(fun, array) {
                this.fun = fun;
                this.array = array;
            }
            Item.prototype.run = function () {
                this.fun.apply(null, this.array);
            };
            var title = 'browser';
            var platform = 'browser';
            var browser = true;
            var env = {};
            var argv = [];
            var version = ''; // empty string to avoid regexp issues
            var versions = {};
            var release = {};
            var config = {};

            function noop() {}

            var on = noop;
            var addListener = noop;
            var once = noop;
            var off = noop;
            var removeListener = noop;
            var removeAllListeners = noop;
            var emit = noop;

            function binding(name) {
                throw new Error('process.binding is not supported');
            }

            function cwd () { return '/' }
            function chdir (dir) {
                throw new Error('process.chdir is not supported');
            }function umask() { return 0; }

            // from https://github.com/kumavis/browser-process-hrtime/blob/master/index.js
            var performance = global$1.performance || {};
            var performanceNow =
              performance.now        ||
              performance.mozNow     ||
              performance.msNow      ||
              performance.oNow       ||
              performance.webkitNow  ||
              function(){ return (new Date()).getTime() };

            // generate timestamp or delta
            // see http://nodejs.org/api/process.html#process_process_hrtime
            function hrtime(previousTimestamp){
              var clocktime = performanceNow.call(performance)*1e-3;
              var seconds = Math.floor(clocktime);
              var nanoseconds = Math.floor((clocktime%1)*1e9);
              if (previousTimestamp) {
                seconds = seconds - previousTimestamp[0];
                nanoseconds = nanoseconds - previousTimestamp[1];
                if (nanoseconds<0) {
                  seconds--;
                  nanoseconds += 1e9;
                }
              }
              return [seconds,nanoseconds]
            }

            var startTime = new Date();
            function uptime() {
              var currentTime = new Date();
              var dif = currentTime - startTime;
              return dif / 1000;
            }

            var process = {
              nextTick: nextTick,
              title: title,
              browser: browser,
              env: env,
              argv: argv,
              version: version,
              versions: versions,
              on: on,
              addListener: addListener,
              once: once,
              off: off,
              removeListener: removeListener,
              removeAllListeners: removeAllListeners,
              emit: emit,
              binding: binding,
              cwd: cwd,
              chdir: chdir,
              umask: umask,
              hrtime: hrtime,
              platform: platform,
              release: release,
              config: config,
              uptime: uptime
            };

            // Copyright Joyent, Inc. and other Node contributors.
            //
            // Permission is hereby granted, free of charge, to any person obtaining a
            // copy of this software and associated documentation files (the
            // "Software"), to deal in the Software without restriction, including
            // without limitation the rights to use, copy, modify, merge, publish,
            // distribute, sublicense, and/or sell copies of the Software, and to permit
            // persons to whom the Software is furnished to do so, subject to the
            // following conditions:
            //
            // The above copyright notice and this permission notice shall be included
            // in all copies or substantial portions of the Software.
            //
            // THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
            // OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
            // MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
            // NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
            // DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
            // OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
            // USE OR OTHER DEALINGS IN THE SOFTWARE.

            // resolves . and .. elements in a path array with directory names there
            // must be no slashes, empty elements, or device names (c:\) in the array
            // (so also no leading and trailing slashes - it does not distinguish
            // relative and absolute paths)
            function normalizeArray(parts, allowAboveRoot) {
              // if the path tries to go above the root, `up` ends up > 0
              var up = 0;
              for (var i = parts.length - 1; i >= 0; i--) {
                var last = parts[i];
                if (last === '.') {
                  parts.splice(i, 1);
                } else if (last === '..') {
                  parts.splice(i, 1);
                  up++;
                } else if (up) {
                  parts.splice(i, 1);
                  up--;
                }
              }

              // if the path is allowed to go above the root, restore leading ..s
              if (allowAboveRoot) {
                for (; up--; up) {
                  parts.unshift('..');
                }
              }

              return parts;
            }

            // Split a filename into [root, dir, basename, ext], unix version
            // 'root' is just a slash, or nothing.
            var splitPathRe =
                /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/;
            var splitPath = function(filename) {
              return splitPathRe.exec(filename).slice(1);
            };

            // path.resolve([from ...], to)
            // posix version
            function resolve() {
              var resolvedPath = '',
                  resolvedAbsolute = false;

              for (var i = arguments.length - 1; i >= -1 && !resolvedAbsolute; i--) {
                var path = (i >= 0) ? arguments[i] : '/';

                // Skip empty and invalid entries
                if (typeof path !== 'string') {
                  throw new TypeError('Arguments to path.resolve must be strings');
                } else if (!path) {
                  continue;
                }

                resolvedPath = path + '/' + resolvedPath;
                resolvedAbsolute = path.charAt(0) === '/';
              }

              // At this point the path should be resolved to a full absolute path, but
              // handle relative paths to be safe (might happen when process.cwd() fails)

              // Normalize the path
              resolvedPath = normalizeArray(filter(resolvedPath.split('/'), function(p) {
                return !!p;
              }), !resolvedAbsolute).join('/');

              return ((resolvedAbsolute ? '/' : '') + resolvedPath) || '.';
            }
            // path.normalize(path)
            // posix version
            function normalize(path) {
              var isPathAbsolute = isAbsolute(path),
                  trailingSlash = substr(path, -1) === '/';

              // Normalize the path
              path = normalizeArray(filter(path.split('/'), function(p) {
                return !!p;
              }), !isPathAbsolute).join('/');

              if (!path && !isPathAbsolute) {
                path = '.';
              }
              if (path && trailingSlash) {
                path += '/';
              }

              return (isPathAbsolute ? '/' : '') + path;
            }
            // posix version
            function isAbsolute(path) {
              return path.charAt(0) === '/';
            }

            // posix version
            function join() {
              var paths = Array.prototype.slice.call(arguments, 0);
              return normalize(filter(paths, function(p, index) {
                if (typeof p !== 'string') {
                  throw new TypeError('Arguments to path.join must be strings');
                }
                return p;
              }).join('/'));
            }


            // path.relative(from, to)
            // posix version
            function relative(from, to) {
              from = resolve(from).substr(1);
              to = resolve(to).substr(1);

              function trim(arr) {
                var start = 0;
                for (; start < arr.length; start++) {
                  if (arr[start] !== '') break;
                }

                var end = arr.length - 1;
                for (; end >= 0; end--) {
                  if (arr[end] !== '') break;
                }

                if (start > end) return [];
                return arr.slice(start, end - start + 1);
              }

              var fromParts = trim(from.split('/'));
              var toParts = trim(to.split('/'));

              var length = Math.min(fromParts.length, toParts.length);
              var samePartsLength = length;
              for (var i = 0; i < length; i++) {
                if (fromParts[i] !== toParts[i]) {
                  samePartsLength = i;
                  break;
                }
              }

              var outputParts = [];
              for (var i = samePartsLength; i < fromParts.length; i++) {
                outputParts.push('..');
              }

              outputParts = outputParts.concat(toParts.slice(samePartsLength));

              return outputParts.join('/');
            }

            var sep = '/';
            var delimiter = ':';

            function dirname(path) {
              var result = splitPath(path),
                  root = result[0],
                  dir = result[1];

              if (!root && !dir) {
                // No dirname whatsoever
                return '.';
              }

              if (dir) {
                // It has a dirname, strip trailing slash
                dir = dir.substr(0, dir.length - 1);
              }

              return root + dir;
            }

            function basename(path, ext) {
              var f = splitPath(path)[2];
              // TODO: make this comparison case-insensitive on windows?
              if (ext && f.substr(-1 * ext.length) === ext) {
                f = f.substr(0, f.length - ext.length);
              }
              return f;
            }


            function extname(path) {
              return splitPath(path)[3];
            }
            var path = {
              extname: extname,
              basename: basename,
              dirname: dirname,
              sep: sep,
              delimiter: delimiter,
              relative: relative,
              join: join,
              isAbsolute: isAbsolute,
              normalize: normalize,
              resolve: resolve
            };
            function filter (xs, f) {
                if (xs.filter) return xs.filter(f);
                var res = [];
                for (var i = 0; i < xs.length; i++) {
                    if (f(xs[i], i, xs)) res.push(xs[i]);
                }
                return res;
            }

            // String.prototype.substr - negative index don't work in IE8
            var substr = 'ab'.substr(-1) === 'b' ?
                function (str, start, len) { return str.substr(start, len) } :
                function (str, start, len) {
                    if (start < 0) start = str.length + start;
                    return str.substr(start, len);
                }
            ;

            /*! https://mths.be/punycode v1.4.1 by @mathias */


            /** Highest positive signed 32-bit float value */
            var maxInt = 2147483647; // aka. 0x7FFFFFFF or 2^31-1

            /** Bootstring parameters */
            var base = 36;
            var tMin = 1;
            var tMax = 26;
            var skew = 38;
            var damp = 700;
            var initialBias = 72;
            var initialN = 128; // 0x80
            var delimiter$1 = '-'; // '\x2D'
            var regexNonASCII = /[^\x20-\x7E]/; // unprintable ASCII chars + non-ASCII chars
            var regexSeparators = /[\x2E\u3002\uFF0E\uFF61]/g; // RFC 3490 separators

            /** Error messages */
            var errors = {
              'overflow': 'Overflow: input needs wider integers to process',
              'not-basic': 'Illegal input >= 0x80 (not a basic code point)',
              'invalid-input': 'Invalid input'
            };

            /** Convenience shortcuts */
            var baseMinusTMin = base - tMin;
            var floor = Math.floor;
            var stringFromCharCode = String.fromCharCode;

            /*--------------------------------------------------------------------------*/

            /**
             * A generic error utility function.
             * @private
             * @param {String} type The error type.
             * @returns {Error} Throws a `RangeError` with the applicable error message.
             */
            function error(type) {
              throw new RangeError(errors[type]);
            }

            /**
             * A generic `Array#map` utility function.
             * @private
             * @param {Array} array The array to iterate over.
             * @param {Function} callback The function that gets called for every array
             * item.
             * @returns {Array} A new array of values returned by the callback function.
             */
            function map(array, fn) {
              var length = array.length;
              var result = [];
              while (length--) {
                result[length] = fn(array[length]);
              }
              return result;
            }

            /**
             * A simple `Array#map`-like wrapper to work with domain name strings or email
             * addresses.
             * @private
             * @param {String} domain The domain name or email address.
             * @param {Function} callback The function that gets called for every
             * character.
             * @returns {Array} A new string of characters returned by the callback
             * function.
             */
            function mapDomain(string, fn) {
              var parts = string.split('@');
              var result = '';
              if (parts.length > 1) {
                // In email addresses, only the domain name should be punycoded. Leave
                // the local part (i.e. everything up to `@`) intact.
                result = parts[0] + '@';
                string = parts[1];
              }
              // Avoid `split(regex)` for IE8 compatibility. See #17.
              string = string.replace(regexSeparators, '\x2E');
              var labels = string.split('.');
              var encoded = map(labels, fn).join('.');
              return result + encoded;
            }

            /**
             * Creates an array containing the numeric code points of each Unicode
             * character in the string. While JavaScript uses UCS-2 internally,
             * this function will convert a pair of surrogate halves (each of which
             * UCS-2 exposes as separate characters) into a single code point,
             * matching UTF-16.
             * @see `punycode.ucs2.encode`
             * @see <https://mathiasbynens.be/notes/javascript-encoding>
             * @memberOf punycode.ucs2
             * @name decode
             * @param {String} string The Unicode input string (UCS-2).
             * @returns {Array} The new array of code points.
             */
            function ucs2decode(string) {
              var output = [],
                counter = 0,
                length = string.length,
                value,
                extra;
              while (counter < length) {
                value = string.charCodeAt(counter++);
                if (value >= 0xD800 && value <= 0xDBFF && counter < length) {
                  // high surrogate, and there is a next character
                  extra = string.charCodeAt(counter++);
                  if ((extra & 0xFC00) == 0xDC00) { // low surrogate
                    output.push(((value & 0x3FF) << 10) + (extra & 0x3FF) + 0x10000);
                  } else {
                    // unmatched surrogate; only append this code unit, in case the next
                    // code unit is the high surrogate of a surrogate pair
                    output.push(value);
                    counter--;
                  }
                } else {
                  output.push(value);
                }
              }
              return output;
            }

            /**
             * Converts a digit/integer into a basic code point.
             * @see `basicToDigit()`
             * @private
             * @param {Number} digit The numeric value of a basic code point.
             * @returns {Number} The basic code point whose value (when used for
             * representing integers) is `digit`, which needs to be in the range
             * `0` to `base - 1`. If `flag` is non-zero, the uppercase form is
             * used; else, the lowercase form is used. The behavior is undefined
             * if `flag` is non-zero and `digit` has no uppercase form.
             */
            function digitToBasic(digit, flag) {
              //  0..25 map to ASCII a..z or A..Z
              // 26..35 map to ASCII 0..9
              return digit + 22 + 75 * (digit < 26) - ((flag != 0) << 5);
            }

            /**
             * Bias adaptation function as per section 3.4 of RFC 3492.
             * https://tools.ietf.org/html/rfc3492#section-3.4
             * @private
             */
            function adapt(delta, numPoints, firstTime) {
              var k = 0;
              delta = firstTime ? floor(delta / damp) : delta >> 1;
              delta += floor(delta / numPoints);
              for ( /* no initialization */ ; delta > baseMinusTMin * tMax >> 1; k += base) {
                delta = floor(delta / baseMinusTMin);
              }
              return floor(k + (baseMinusTMin + 1) * delta / (delta + skew));
            }

            /**
             * Converts a string of Unicode symbols (e.g. a domain name label) to a
             * Punycode string of ASCII-only symbols.
             * @memberOf punycode
             * @param {String} input The string of Unicode symbols.
             * @returns {String} The resulting Punycode string of ASCII-only symbols.
             */
            function encode(input) {
              var n,
                delta,
                handledCPCount,
                basicLength,
                bias,
                j,
                m,
                q,
                k,
                t,
                currentValue,
                output = [],
                /** `inputLength` will hold the number of code points in `input`. */
                inputLength,
                /** Cached calculation results */
                handledCPCountPlusOne,
                baseMinusT,
                qMinusT;

              // Convert the input in UCS-2 to Unicode
              input = ucs2decode(input);

              // Cache the length
              inputLength = input.length;

              // Initialize the state
              n = initialN;
              delta = 0;
              bias = initialBias;

              // Handle the basic code points
              for (j = 0; j < inputLength; ++j) {
                currentValue = input[j];
                if (currentValue < 0x80) {
                  output.push(stringFromCharCode(currentValue));
                }
              }

              handledCPCount = basicLength = output.length;

              // `handledCPCount` is the number of code points that have been handled;
              // `basicLength` is the number of basic code points.

              // Finish the basic string - if it is not empty - with a delimiter
              if (basicLength) {
                output.push(delimiter$1);
              }

              // Main encoding loop:
              while (handledCPCount < inputLength) {

                // All non-basic code points < n have been handled already. Find the next
                // larger one:
                for (m = maxInt, j = 0; j < inputLength; ++j) {
                  currentValue = input[j];
                  if (currentValue >= n && currentValue < m) {
                    m = currentValue;
                  }
                }

                // Increase `delta` enough to advance the decoder's <n,i> state to <m,0>,
                // but guard against overflow
                handledCPCountPlusOne = handledCPCount + 1;
                if (m - n > floor((maxInt - delta) / handledCPCountPlusOne)) {
                  error('overflow');
                }

                delta += (m - n) * handledCPCountPlusOne;
                n = m;

                for (j = 0; j < inputLength; ++j) {
                  currentValue = input[j];

                  if (currentValue < n && ++delta > maxInt) {
                    error('overflow');
                  }

                  if (currentValue == n) {
                    // Represent delta as a generalized variable-length integer
                    for (q = delta, k = base; /* no condition */ ; k += base) {
                      t = k <= bias ? tMin : (k >= bias + tMax ? tMax : k - bias);
                      if (q < t) {
                        break;
                      }
                      qMinusT = q - t;
                      baseMinusT = base - t;
                      output.push(
                        stringFromCharCode(digitToBasic(t + qMinusT % baseMinusT, 0))
                      );
                      q = floor(qMinusT / baseMinusT);
                    }

                    output.push(stringFromCharCode(digitToBasic(q, 0)));
                    bias = adapt(delta, handledCPCountPlusOne, handledCPCount == basicLength);
                    delta = 0;
                    ++handledCPCount;
                  }
                }

                ++delta;
                ++n;

              }
              return output.join('');
            }

            /**
             * Converts a Unicode string representing a domain name or an email address to
             * Punycode. Only the non-ASCII parts of the domain name will be converted,
             * i.e. it doesn't matter if you call it with a domain that's already in
             * ASCII.
             * @memberOf punycode
             * @param {String} input The domain name or email address to convert, as a
             * Unicode string.
             * @returns {String} The Punycode representation of the given domain name or
             * email address.
             */
            function toASCII(input) {
              return mapDomain(input, function(string) {
                return regexNonASCII.test(string) ?
                  'xn--' + encode(string) :
                  string;
              });
            }

            var lookup = [];
            var revLookup = [];
            var Arr = typeof Uint8Array !== 'undefined' ? Uint8Array : Array;
            var inited = false;
            function init () {
              inited = true;
              var code = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
              for (var i = 0, len = code.length; i < len; ++i) {
                lookup[i] = code[i];
                revLookup[code.charCodeAt(i)] = i;
              }

              revLookup['-'.charCodeAt(0)] = 62;
              revLookup['_'.charCodeAt(0)] = 63;
            }

            function toByteArray (b64) {
              if (!inited) {
                init();
              }
              var i, j, l, tmp, placeHolders, arr;
              var len = b64.length;

              if (len % 4 > 0) {
                throw new Error('Invalid string. Length must be a multiple of 4')
              }

              // the number of equal signs (place holders)
              // if there are two placeholders, than the two characters before it
              // represent one byte
              // if there is only one, then the three characters before it represent 2 bytes
              // this is just a cheap hack to not do indexOf twice
              placeHolders = b64[len - 2] === '=' ? 2 : b64[len - 1] === '=' ? 1 : 0;

              // base64 is 4/3 + up to two characters of the original data
              arr = new Arr(len * 3 / 4 - placeHolders);

              // if there are placeholders, only get up to the last complete 4 chars
              l = placeHolders > 0 ? len - 4 : len;

              var L = 0;

              for (i = 0, j = 0; i < l; i += 4, j += 3) {
                tmp = (revLookup[b64.charCodeAt(i)] << 18) | (revLookup[b64.charCodeAt(i + 1)] << 12) | (revLookup[b64.charCodeAt(i + 2)] << 6) | revLookup[b64.charCodeAt(i + 3)];
                arr[L++] = (tmp >> 16) & 0xFF;
                arr[L++] = (tmp >> 8) & 0xFF;
                arr[L++] = tmp & 0xFF;
              }

              if (placeHolders === 2) {
                tmp = (revLookup[b64.charCodeAt(i)] << 2) | (revLookup[b64.charCodeAt(i + 1)] >> 4);
                arr[L++] = tmp & 0xFF;
              } else if (placeHolders === 1) {
                tmp = (revLookup[b64.charCodeAt(i)] << 10) | (revLookup[b64.charCodeAt(i + 1)] << 4) | (revLookup[b64.charCodeAt(i + 2)] >> 2);
                arr[L++] = (tmp >> 8) & 0xFF;
                arr[L++] = tmp & 0xFF;
              }

              return arr
            }

            function tripletToBase64 (num) {
              return lookup[num >> 18 & 0x3F] + lookup[num >> 12 & 0x3F] + lookup[num >> 6 & 0x3F] + lookup[num & 0x3F]
            }

            function encodeChunk (uint8, start, end) {
              var tmp;
              var output = [];
              for (var i = start; i < end; i += 3) {
                tmp = (uint8[i] << 16) + (uint8[i + 1] << 8) + (uint8[i + 2]);
                output.push(tripletToBase64(tmp));
              }
              return output.join('')
            }

            function fromByteArray (uint8) {
              if (!inited) {
                init();
              }
              var tmp;
              var len = uint8.length;
              var extraBytes = len % 3; // if we have 1 byte left, pad 2 bytes
              var output = '';
              var parts = [];
              var maxChunkLength = 16383; // must be multiple of 3

              // go through the array every three bytes, we'll deal with trailing stuff later
              for (var i = 0, len2 = len - extraBytes; i < len2; i += maxChunkLength) {
                parts.push(encodeChunk(uint8, i, (i + maxChunkLength) > len2 ? len2 : (i + maxChunkLength)));
              }

              // pad the end with zeros, but make sure to not forget the extra bytes
              if (extraBytes === 1) {
                tmp = uint8[len - 1];
                output += lookup[tmp >> 2];
                output += lookup[(tmp << 4) & 0x3F];
                output += '==';
              } else if (extraBytes === 2) {
                tmp = (uint8[len - 2] << 8) + (uint8[len - 1]);
                output += lookup[tmp >> 10];
                output += lookup[(tmp >> 4) & 0x3F];
                output += lookup[(tmp << 2) & 0x3F];
                output += '=';
              }

              parts.push(output);

              return parts.join('')
            }

            function read (buffer, offset, isLE, mLen, nBytes) {
              var e, m;
              var eLen = nBytes * 8 - mLen - 1;
              var eMax = (1 << eLen) - 1;
              var eBias = eMax >> 1;
              var nBits = -7;
              var i = isLE ? (nBytes - 1) : 0;
              var d = isLE ? -1 : 1;
              var s = buffer[offset + i];

              i += d;

              e = s & ((1 << (-nBits)) - 1);
              s >>= (-nBits);
              nBits += eLen;
              for (; nBits > 0; e = e * 256 + buffer[offset + i], i += d, nBits -= 8) {}

              m = e & ((1 << (-nBits)) - 1);
              e >>= (-nBits);
              nBits += mLen;
              for (; nBits > 0; m = m * 256 + buffer[offset + i], i += d, nBits -= 8) {}

              if (e === 0) {
                e = 1 - eBias;
              } else if (e === eMax) {
                return m ? NaN : ((s ? -1 : 1) * Infinity)
              } else {
                m = m + Math.pow(2, mLen);
                e = e - eBias;
              }
              return (s ? -1 : 1) * m * Math.pow(2, e - mLen)
            }

            function write (buffer, value, offset, isLE, mLen, nBytes) {
              var e, m, c;
              var eLen = nBytes * 8 - mLen - 1;
              var eMax = (1 << eLen) - 1;
              var eBias = eMax >> 1;
              var rt = (mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0);
              var i = isLE ? 0 : (nBytes - 1);
              var d = isLE ? 1 : -1;
              var s = value < 0 || (value === 0 && 1 / value < 0) ? 1 : 0;

              value = Math.abs(value);

              if (isNaN(value) || value === Infinity) {
                m = isNaN(value) ? 1 : 0;
                e = eMax;
              } else {
                e = Math.floor(Math.log(value) / Math.LN2);
                if (value * (c = Math.pow(2, -e)) < 1) {
                  e--;
                  c *= 2;
                }
                if (e + eBias >= 1) {
                  value += rt / c;
                } else {
                  value += rt * Math.pow(2, 1 - eBias);
                }
                if (value * c >= 2) {
                  e++;
                  c /= 2;
                }

                if (e + eBias >= eMax) {
                  m = 0;
                  e = eMax;
                } else if (e + eBias >= 1) {
                  m = (value * c - 1) * Math.pow(2, mLen);
                  e = e + eBias;
                } else {
                  m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen);
                  e = 0;
                }
              }

              for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8) {}

              e = (e << mLen) | m;
              eLen += mLen;
              for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8) {}

              buffer[offset + i - d] |= s * 128;
            }

            var toString = {}.toString;

            var isArray = Array.isArray || function (arr) {
              return toString.call(arr) == '[object Array]';
            };

            var INSPECT_MAX_BYTES = 50;

            /**
             * If `Buffer.TYPED_ARRAY_SUPPORT`:
             *   === true    Use Uint8Array implementation (fastest)
             *   === false   Use Object implementation (most compatible, even IE6)
             *
             * Browsers that support typed arrays are IE 10+, Firefox 4+, Chrome 7+, Safari 5.1+,
             * Opera 11.6+, iOS 4.2+.
             *
             * Due to various browser bugs, sometimes the Object implementation will be used even
             * when the browser supports typed arrays.
             *
             * Note:
             *
             *   - Firefox 4-29 lacks support for adding new properties to `Uint8Array` instances,
             *     See: https://bugzilla.mozilla.org/show_bug.cgi?id=695438.
             *
             *   - Chrome 9-10 is missing the `TypedArray.prototype.subarray` function.
             *
             *   - IE10 has a broken `TypedArray.prototype.subarray` function which returns arrays of
             *     incorrect length in some situations.

             * We detect these buggy browsers and set `Buffer.TYPED_ARRAY_SUPPORT` to `false` so they
             * get the Object implementation, which is slower but behaves correctly.
             */
            Buffer.TYPED_ARRAY_SUPPORT = global$1.TYPED_ARRAY_SUPPORT !== undefined
              ? global$1.TYPED_ARRAY_SUPPORT
              : true;

            function kMaxLength () {
              return Buffer.TYPED_ARRAY_SUPPORT
                ? 0x7fffffff
                : 0x3fffffff
            }

            function createBuffer (that, length) {
              if (kMaxLength() < length) {
                throw new RangeError('Invalid typed array length')
              }
              if (Buffer.TYPED_ARRAY_SUPPORT) {
                // Return an augmented `Uint8Array` instance, for best performance
                that = new Uint8Array(length);
                that.__proto__ = Buffer.prototype;
              } else {
                // Fallback: Return an object instance of the Buffer class
                if (that === null) {
                  that = new Buffer(length);
                }
                that.length = length;
              }

              return that
            }

            /**
             * The Buffer constructor returns instances of `Uint8Array` that have their
             * prototype changed to `Buffer.prototype`. Furthermore, `Buffer` is a subclass of
             * `Uint8Array`, so the returned instances will have all the node `Buffer` methods
             * and the `Uint8Array` methods. Square bracket notation works as expected -- it
             * returns a single octet.
             *
             * The `Uint8Array` prototype remains unmodified.
             */

            function Buffer (arg, encodingOrOffset, length) {
              if (!Buffer.TYPED_ARRAY_SUPPORT && !(this instanceof Buffer)) {
                return new Buffer(arg, encodingOrOffset, length)
              }

              // Common case.
              if (typeof arg === 'number') {
                if (typeof encodingOrOffset === 'string') {
                  throw new Error(
                    'If encoding is specified then the first argument must be a string'
                  )
                }
                return allocUnsafe(this, arg)
              }
              return from(this, arg, encodingOrOffset, length)
            }

            Buffer.poolSize = 8192; // not used by this implementation

            // TODO: Legacy, not needed anymore. Remove in next major version.
            Buffer._augment = function (arr) {
              arr.__proto__ = Buffer.prototype;
              return arr
            };

            function from (that, value, encodingOrOffset, length) {
              if (typeof value === 'number') {
                throw new TypeError('"value" argument must not be a number')
              }

              if (typeof ArrayBuffer !== 'undefined' && value instanceof ArrayBuffer) {
                return fromArrayBuffer(that, value, encodingOrOffset, length)
              }

              if (typeof value === 'string') {
                return fromString(that, value, encodingOrOffset)
              }

              return fromObject(that, value)
            }

            /**
             * Functionally equivalent to Buffer(arg, encoding) but throws a TypeError
             * if value is a number.
             * Buffer.from(str[, encoding])
             * Buffer.from(array)
             * Buffer.from(buffer)
             * Buffer.from(arrayBuffer[, byteOffset[, length]])
             **/
            Buffer.from = function (value, encodingOrOffset, length) {
              return from(null, value, encodingOrOffset, length)
            };

            if (Buffer.TYPED_ARRAY_SUPPORT) {
              Buffer.prototype.__proto__ = Uint8Array.prototype;
              Buffer.__proto__ = Uint8Array;
            }

            function assertSize (size) {
              if (typeof size !== 'number') {
                throw new TypeError('"size" argument must be a number')
              } else if (size < 0) {
                throw new RangeError('"size" argument must not be negative')
              }
            }

            function alloc (that, size, fill, encoding) {
              assertSize(size);
              if (size <= 0) {
                return createBuffer(that, size)
              }
              if (fill !== undefined) {
                // Only pay attention to encoding if it's a string. This
                // prevents accidentally sending in a number that would
                // be interpretted as a start offset.
                return typeof encoding === 'string'
                  ? createBuffer(that, size).fill(fill, encoding)
                  : createBuffer(that, size).fill(fill)
              }
              return createBuffer(that, size)
            }

            /**
             * Creates a new filled Buffer instance.
             * alloc(size[, fill[, encoding]])
             **/
            Buffer.alloc = function (size, fill, encoding) {
              return alloc(null, size, fill, encoding)
            };

            function allocUnsafe (that, size) {
              assertSize(size);
              that = createBuffer(that, size < 0 ? 0 : checked(size) | 0);
              if (!Buffer.TYPED_ARRAY_SUPPORT) {
                for (var i = 0; i < size; ++i) {
                  that[i] = 0;
                }
              }
              return that
            }

            /**
             * Equivalent to Buffer(num), by default creates a non-zero-filled Buffer instance.
             * */
            Buffer.allocUnsafe = function (size) {
              return allocUnsafe(null, size)
            };
            /**
             * Equivalent to SlowBuffer(num), by default creates a non-zero-filled Buffer instance.
             */
            Buffer.allocUnsafeSlow = function (size) {
              return allocUnsafe(null, size)
            };

            function fromString (that, string, encoding) {
              if (typeof encoding !== 'string' || encoding === '') {
                encoding = 'utf8';
              }

              if (!Buffer.isEncoding(encoding)) {
                throw new TypeError('"encoding" must be a valid string encoding')
              }

              var length = byteLength(string, encoding) | 0;
              that = createBuffer(that, length);

              var actual = that.write(string, encoding);

              if (actual !== length) {
                // Writing a hex string, for example, that contains invalid characters will
                // cause everything after the first invalid character to be ignored. (e.g.
                // 'abxxcd' will be treated as 'ab')
                that = that.slice(0, actual);
              }

              return that
            }

            function fromArrayLike (that, array) {
              var length = array.length < 0 ? 0 : checked(array.length) | 0;
              that = createBuffer(that, length);
              for (var i = 0; i < length; i += 1) {
                that[i] = array[i] & 255;
              }
              return that
            }

            function fromArrayBuffer (that, array, byteOffset, length) {
              array.byteLength; // this throws if `array` is not a valid ArrayBuffer

              if (byteOffset < 0 || array.byteLength < byteOffset) {
                throw new RangeError('\'offset\' is out of bounds')
              }

              if (array.byteLength < byteOffset + (length || 0)) {
                throw new RangeError('\'length\' is out of bounds')
              }

              if (byteOffset === undefined && length === undefined) {
                array = new Uint8Array(array);
              } else if (length === undefined) {
                array = new Uint8Array(array, byteOffset);
              } else {
                array = new Uint8Array(array, byteOffset, length);
              }

              if (Buffer.TYPED_ARRAY_SUPPORT) {
                // Return an augmented `Uint8Array` instance, for best performance
                that = array;
                that.__proto__ = Buffer.prototype;
              } else {
                // Fallback: Return an object instance of the Buffer class
                that = fromArrayLike(that, array);
              }
              return that
            }

            function fromObject (that, obj) {
              if (internalIsBuffer(obj)) {
                var len = checked(obj.length) | 0;
                that = createBuffer(that, len);

                if (that.length === 0) {
                  return that
                }

                obj.copy(that, 0, 0, len);
                return that
              }

              if (obj) {
                if ((typeof ArrayBuffer !== 'undefined' &&
                    obj.buffer instanceof ArrayBuffer) || 'length' in obj) {
                  if (typeof obj.length !== 'number' || isnan(obj.length)) {
                    return createBuffer(that, 0)
                  }
                  return fromArrayLike(that, obj)
                }

                if (obj.type === 'Buffer' && isArray(obj.data)) {
                  return fromArrayLike(that, obj.data)
                }
              }

              throw new TypeError('First argument must be a string, Buffer, ArrayBuffer, Array, or array-like object.')
            }

            function checked (length) {
              // Note: cannot use `length < kMaxLength()` here because that fails when
              // length is NaN (which is otherwise coerced to zero.)
              if (length >= kMaxLength()) {
                throw new RangeError('Attempt to allocate Buffer larger than maximum ' +
                                     'size: 0x' + kMaxLength().toString(16) + ' bytes')
              }
              return length | 0
            }
            Buffer.isBuffer = isBuffer;
            function internalIsBuffer (b) {
              return !!(b != null && b._isBuffer)
            }

            Buffer.compare = function compare (a, b) {
              if (!internalIsBuffer(a) || !internalIsBuffer(b)) {
                throw new TypeError('Arguments must be Buffers')
              }

              if (a === b) return 0

              var x = a.length;
              var y = b.length;

              for (var i = 0, len = Math.min(x, y); i < len; ++i) {
                if (a[i] !== b[i]) {
                  x = a[i];
                  y = b[i];
                  break
                }
              }

              if (x < y) return -1
              if (y < x) return 1
              return 0
            };

            Buffer.isEncoding = function isEncoding (encoding) {
              switch (String(encoding).toLowerCase()) {
                case 'hex':
                case 'utf8':
                case 'utf-8':
                case 'ascii':
                case 'latin1':
                case 'binary':
                case 'base64':
                case 'ucs2':
                case 'ucs-2':
                case 'utf16le':
                case 'utf-16le':
                  return true
                default:
                  return false
              }
            };

            Buffer.concat = function concat (list, length) {
              if (!isArray(list)) {
                throw new TypeError('"list" argument must be an Array of Buffers')
              }

              if (list.length === 0) {
                return Buffer.alloc(0)
              }

              var i;
              if (length === undefined) {
                length = 0;
                for (i = 0; i < list.length; ++i) {
                  length += list[i].length;
                }
              }

              var buffer = Buffer.allocUnsafe(length);
              var pos = 0;
              for (i = 0; i < list.length; ++i) {
                var buf = list[i];
                if (!internalIsBuffer(buf)) {
                  throw new TypeError('"list" argument must be an Array of Buffers')
                }
                buf.copy(buffer, pos);
                pos += buf.length;
              }
              return buffer
            };

            function byteLength (string, encoding) {
              if (internalIsBuffer(string)) {
                return string.length
              }
              if (typeof ArrayBuffer !== 'undefined' && typeof ArrayBuffer.isView === 'function' &&
                  (ArrayBuffer.isView(string) || string instanceof ArrayBuffer)) {
                return string.byteLength
              }
              if (typeof string !== 'string') {
                string = '' + string;
              }

              var len = string.length;
              if (len === 0) return 0

              // Use a for loop to avoid recursion
              var loweredCase = false;
              for (;;) {
                switch (encoding) {
                  case 'ascii':
                  case 'latin1':
                  case 'binary':
                    return len
                  case 'utf8':
                  case 'utf-8':
                  case undefined:
                    return utf8ToBytes(string).length
                  case 'ucs2':
                  case 'ucs-2':
                  case 'utf16le':
                  case 'utf-16le':
                    return len * 2
                  case 'hex':
                    return len >>> 1
                  case 'base64':
                    return base64ToBytes(string).length
                  default:
                    if (loweredCase) return utf8ToBytes(string).length // assume utf8
                    encoding = ('' + encoding).toLowerCase();
                    loweredCase = true;
                }
              }
            }
            Buffer.byteLength = byteLength;

            function slowToString (encoding, start, end) {
              var loweredCase = false;

              // No need to verify that "this.length <= MAX_UINT32" since it's a read-only
              // property of a typed array.

              // This behaves neither like String nor Uint8Array in that we set start/end
              // to their upper/lower bounds if the value passed is out of range.
              // undefined is handled specially as per ECMA-262 6th Edition,
              // Section 13.3.3.7 Runtime Semantics: KeyedBindingInitialization.
              if (start === undefined || start < 0) {
                start = 0;
              }
              // Return early if start > this.length. Done here to prevent potential uint32
              // coercion fail below.
              if (start > this.length) {
                return ''
              }

              if (end === undefined || end > this.length) {
                end = this.length;
              }

              if (end <= 0) {
                return ''
              }

              // Force coersion to uint32. This will also coerce falsey/NaN values to 0.
              end >>>= 0;
              start >>>= 0;

              if (end <= start) {
                return ''
              }

              if (!encoding) encoding = 'utf8';

              while (true) {
                switch (encoding) {
                  case 'hex':
                    return hexSlice(this, start, end)

                  case 'utf8':
                  case 'utf-8':
                    return utf8Slice(this, start, end)

                  case 'ascii':
                    return asciiSlice(this, start, end)

                  case 'latin1':
                  case 'binary':
                    return latin1Slice(this, start, end)

                  case 'base64':
                    return base64Slice(this, start, end)

                  case 'ucs2':
                  case 'ucs-2':
                  case 'utf16le':
                  case 'utf-16le':
                    return utf16leSlice(this, start, end)

                  default:
                    if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
                    encoding = (encoding + '').toLowerCase();
                    loweredCase = true;
                }
              }
            }

            // The property is used by `Buffer.isBuffer` and `is-buffer` (in Safari 5-7) to detect
            // Buffer instances.
            Buffer.prototype._isBuffer = true;

            function swap (b, n, m) {
              var i = b[n];
              b[n] = b[m];
              b[m] = i;
            }

            Buffer.prototype.swap16 = function swap16 () {
              var len = this.length;
              if (len % 2 !== 0) {
                throw new RangeError('Buffer size must be a multiple of 16-bits')
              }
              for (var i = 0; i < len; i += 2) {
                swap(this, i, i + 1);
              }
              return this
            };

            Buffer.prototype.swap32 = function swap32 () {
              var len = this.length;
              if (len % 4 !== 0) {
                throw new RangeError('Buffer size must be a multiple of 32-bits')
              }
              for (var i = 0; i < len; i += 4) {
                swap(this, i, i + 3);
                swap(this, i + 1, i + 2);
              }
              return this
            };

            Buffer.prototype.swap64 = function swap64 () {
              var len = this.length;
              if (len % 8 !== 0) {
                throw new RangeError('Buffer size must be a multiple of 64-bits')
              }
              for (var i = 0; i < len; i += 8) {
                swap(this, i, i + 7);
                swap(this, i + 1, i + 6);
                swap(this, i + 2, i + 5);
                swap(this, i + 3, i + 4);
              }
              return this
            };

            Buffer.prototype.toString = function toString () {
              var length = this.length | 0;
              if (length === 0) return ''
              if (arguments.length === 0) return utf8Slice(this, 0, length)
              return slowToString.apply(this, arguments)
            };

            Buffer.prototype.equals = function equals (b) {
              if (!internalIsBuffer(b)) throw new TypeError('Argument must be a Buffer')
              if (this === b) return true
              return Buffer.compare(this, b) === 0
            };

            Buffer.prototype.inspect = function inspect () {
              var str = '';
              var max = INSPECT_MAX_BYTES;
              if (this.length > 0) {
                str = this.toString('hex', 0, max).match(/.{2}/g).join(' ');
                if (this.length > max) str += ' ... ';
              }
              return '<Buffer ' + str + '>'
            };

            Buffer.prototype.compare = function compare (target, start, end, thisStart, thisEnd) {
              if (!internalIsBuffer(target)) {
                throw new TypeError('Argument must be a Buffer')
              }

              if (start === undefined) {
                start = 0;
              }
              if (end === undefined) {
                end = target ? target.length : 0;
              }
              if (thisStart === undefined) {
                thisStart = 0;
              }
              if (thisEnd === undefined) {
                thisEnd = this.length;
              }

              if (start < 0 || end > target.length || thisStart < 0 || thisEnd > this.length) {
                throw new RangeError('out of range index')
              }

              if (thisStart >= thisEnd && start >= end) {
                return 0
              }
              if (thisStart >= thisEnd) {
                return -1
              }
              if (start >= end) {
                return 1
              }

              start >>>= 0;
              end >>>= 0;
              thisStart >>>= 0;
              thisEnd >>>= 0;

              if (this === target) return 0

              var x = thisEnd - thisStart;
              var y = end - start;
              var len = Math.min(x, y);

              var thisCopy = this.slice(thisStart, thisEnd);
              var targetCopy = target.slice(start, end);

              for (var i = 0; i < len; ++i) {
                if (thisCopy[i] !== targetCopy[i]) {
                  x = thisCopy[i];
                  y = targetCopy[i];
                  break
                }
              }

              if (x < y) return -1
              if (y < x) return 1
              return 0
            };

            // Finds either the first index of `val` in `buffer` at offset >= `byteOffset`,
            // OR the last index of `val` in `buffer` at offset <= `byteOffset`.
            //
            // Arguments:
            // - buffer - a Buffer to search
            // - val - a string, Buffer, or number
            // - byteOffset - an index into `buffer`; will be clamped to an int32
            // - encoding - an optional encoding, relevant is val is a string
            // - dir - true for indexOf, false for lastIndexOf
            function bidirectionalIndexOf (buffer, val, byteOffset, encoding, dir) {
              // Empty buffer means no match
              if (buffer.length === 0) return -1

              // Normalize byteOffset
              if (typeof byteOffset === 'string') {
                encoding = byteOffset;
                byteOffset = 0;
              } else if (byteOffset > 0x7fffffff) {
                byteOffset = 0x7fffffff;
              } else if (byteOffset < -0x80000000) {
                byteOffset = -0x80000000;
              }
              byteOffset = +byteOffset;  // Coerce to Number.
              if (isNaN(byteOffset)) {
                // byteOffset: it it's undefined, null, NaN, "foo", etc, search whole buffer
                byteOffset = dir ? 0 : (buffer.length - 1);
              }

              // Normalize byteOffset: negative offsets start from the end of the buffer
              if (byteOffset < 0) byteOffset = buffer.length + byteOffset;
              if (byteOffset >= buffer.length) {
                if (dir) return -1
                else byteOffset = buffer.length - 1;
              } else if (byteOffset < 0) {
                if (dir) byteOffset = 0;
                else return -1
              }

              // Normalize val
              if (typeof val === 'string') {
                val = Buffer.from(val, encoding);
              }

              // Finally, search either indexOf (if dir is true) or lastIndexOf
              if (internalIsBuffer(val)) {
                // Special case: looking for empty string/buffer always fails
                if (val.length === 0) {
                  return -1
                }
                return arrayIndexOf(buffer, val, byteOffset, encoding, dir)
              } else if (typeof val === 'number') {
                val = val & 0xFF; // Search for a byte value [0-255]
                if (Buffer.TYPED_ARRAY_SUPPORT &&
                    typeof Uint8Array.prototype.indexOf === 'function') {
                  if (dir) {
                    return Uint8Array.prototype.indexOf.call(buffer, val, byteOffset)
                  } else {
                    return Uint8Array.prototype.lastIndexOf.call(buffer, val, byteOffset)
                  }
                }
                return arrayIndexOf(buffer, [ val ], byteOffset, encoding, dir)
              }

              throw new TypeError('val must be string, number or Buffer')
            }

            function arrayIndexOf (arr, val, byteOffset, encoding, dir) {
              var indexSize = 1;
              var arrLength = arr.length;
              var valLength = val.length;

              if (encoding !== undefined) {
                encoding = String(encoding).toLowerCase();
                if (encoding === 'ucs2' || encoding === 'ucs-2' ||
                    encoding === 'utf16le' || encoding === 'utf-16le') {
                  if (arr.length < 2 || val.length < 2) {
                    return -1
                  }
                  indexSize = 2;
                  arrLength /= 2;
                  valLength /= 2;
                  byteOffset /= 2;
                }
              }

              function read$$1 (buf, i) {
                if (indexSize === 1) {
                  return buf[i]
                } else {
                  return buf.readUInt16BE(i * indexSize)
                }
              }

              var i;
              if (dir) {
                var foundIndex = -1;
                for (i = byteOffset; i < arrLength; i++) {
                  if (read$$1(arr, i) === read$$1(val, foundIndex === -1 ? 0 : i - foundIndex)) {
                    if (foundIndex === -1) foundIndex = i;
                    if (i - foundIndex + 1 === valLength) return foundIndex * indexSize
                  } else {
                    if (foundIndex !== -1) i -= i - foundIndex;
                    foundIndex = -1;
                  }
                }
              } else {
                if (byteOffset + valLength > arrLength) byteOffset = arrLength - valLength;
                for (i = byteOffset; i >= 0; i--) {
                  var found = true;
                  for (var j = 0; j < valLength; j++) {
                    if (read$$1(arr, i + j) !== read$$1(val, j)) {
                      found = false;
                      break
                    }
                  }
                  if (found) return i
                }
              }

              return -1
            }

            Buffer.prototype.includes = function includes (val, byteOffset, encoding) {
              return this.indexOf(val, byteOffset, encoding) !== -1
            };

            Buffer.prototype.indexOf = function indexOf (val, byteOffset, encoding) {
              return bidirectionalIndexOf(this, val, byteOffset, encoding, true)
            };

            Buffer.prototype.lastIndexOf = function lastIndexOf (val, byteOffset, encoding) {
              return bidirectionalIndexOf(this, val, byteOffset, encoding, false)
            };

            function hexWrite (buf, string, offset, length) {
              offset = Number(offset) || 0;
              var remaining = buf.length - offset;
              if (!length) {
                length = remaining;
              } else {
                length = Number(length);
                if (length > remaining) {
                  length = remaining;
                }
              }

              // must be an even number of digits
              var strLen = string.length;
              if (strLen % 2 !== 0) throw new TypeError('Invalid hex string')

              if (length > strLen / 2) {
                length = strLen / 2;
              }
              for (var i = 0; i < length; ++i) {
                var parsed = parseInt(string.substr(i * 2, 2), 16);
                if (isNaN(parsed)) return i
                buf[offset + i] = parsed;
              }
              return i
            }

            function utf8Write (buf, string, offset, length) {
              return blitBuffer(utf8ToBytes(string, buf.length - offset), buf, offset, length)
            }

            function asciiWrite (buf, string, offset, length) {
              return blitBuffer(asciiToBytes(string), buf, offset, length)
            }

            function latin1Write (buf, string, offset, length) {
              return asciiWrite(buf, string, offset, length)
            }

            function base64Write (buf, string, offset, length) {
              return blitBuffer(base64ToBytes(string), buf, offset, length)
            }

            function ucs2Write (buf, string, offset, length) {
              return blitBuffer(utf16leToBytes(string, buf.length - offset), buf, offset, length)
            }

            Buffer.prototype.write = function write$$1 (string, offset, length, encoding) {
              // Buffer#write(string)
              if (offset === undefined) {
                encoding = 'utf8';
                length = this.length;
                offset = 0;
              // Buffer#write(string, encoding)
              } else if (length === undefined && typeof offset === 'string') {
                encoding = offset;
                length = this.length;
                offset = 0;
              // Buffer#write(string, offset[, length][, encoding])
              } else if (isFinite(offset)) {
                offset = offset | 0;
                if (isFinite(length)) {
                  length = length | 0;
                  if (encoding === undefined) encoding = 'utf8';
                } else {
                  encoding = length;
                  length = undefined;
                }
              // legacy write(string, encoding, offset, length) - remove in v0.13
              } else {
                throw new Error(
                  'Buffer.write(string, encoding, offset[, length]) is no longer supported'
                )
              }

              var remaining = this.length - offset;
              if (length === undefined || length > remaining) length = remaining;

              if ((string.length > 0 && (length < 0 || offset < 0)) || offset > this.length) {
                throw new RangeError('Attempt to write outside buffer bounds')
              }

              if (!encoding) encoding = 'utf8';

              var loweredCase = false;
              for (;;) {
                switch (encoding) {
                  case 'hex':
                    return hexWrite(this, string, offset, length)

                  case 'utf8':
                  case 'utf-8':
                    return utf8Write(this, string, offset, length)

                  case 'ascii':
                    return asciiWrite(this, string, offset, length)

                  case 'latin1':
                  case 'binary':
                    return latin1Write(this, string, offset, length)

                  case 'base64':
                    // Warning: maxLength not taken into account in base64Write
                    return base64Write(this, string, offset, length)

                  case 'ucs2':
                  case 'ucs-2':
                  case 'utf16le':
                  case 'utf-16le':
                    return ucs2Write(this, string, offset, length)

                  default:
                    if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
                    encoding = ('' + encoding).toLowerCase();
                    loweredCase = true;
                }
              }
            };

            Buffer.prototype.toJSON = function toJSON () {
              return {
                type: 'Buffer',
                data: Array.prototype.slice.call(this._arr || this, 0)
              }
            };

            function base64Slice (buf, start, end) {
              if (start === 0 && end === buf.length) {
                return fromByteArray(buf)
              } else {
                return fromByteArray(buf.slice(start, end))
              }
            }

            function utf8Slice (buf, start, end) {
              end = Math.min(buf.length, end);
              var res = [];

              var i = start;
              while (i < end) {
                var firstByte = buf[i];
                var codePoint = null;
                var bytesPerSequence = (firstByte > 0xEF) ? 4
                  : (firstByte > 0xDF) ? 3
                  : (firstByte > 0xBF) ? 2
                  : 1;

                if (i + bytesPerSequence <= end) {
                  var secondByte, thirdByte, fourthByte, tempCodePoint;

                  switch (bytesPerSequence) {
                    case 1:
                      if (firstByte < 0x80) {
                        codePoint = firstByte;
                      }
                      break
                    case 2:
                      secondByte = buf[i + 1];
                      if ((secondByte & 0xC0) === 0x80) {
                        tempCodePoint = (firstByte & 0x1F) << 0x6 | (secondByte & 0x3F);
                        if (tempCodePoint > 0x7F) {
                          codePoint = tempCodePoint;
                        }
                      }
                      break
                    case 3:
                      secondByte = buf[i + 1];
                      thirdByte = buf[i + 2];
                      if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80) {
                        tempCodePoint = (firstByte & 0xF) << 0xC | (secondByte & 0x3F) << 0x6 | (thirdByte & 0x3F);
                        if (tempCodePoint > 0x7FF && (tempCodePoint < 0xD800 || tempCodePoint > 0xDFFF)) {
                          codePoint = tempCodePoint;
                        }
                      }
                      break
                    case 4:
                      secondByte = buf[i + 1];
                      thirdByte = buf[i + 2];
                      fourthByte = buf[i + 3];
                      if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80 && (fourthByte & 0xC0) === 0x80) {
                        tempCodePoint = (firstByte & 0xF) << 0x12 | (secondByte & 0x3F) << 0xC | (thirdByte & 0x3F) << 0x6 | (fourthByte & 0x3F);
                        if (tempCodePoint > 0xFFFF && tempCodePoint < 0x110000) {
                          codePoint = tempCodePoint;
                        }
                      }
                  }
                }

                if (codePoint === null) {
                  // we did not generate a valid codePoint so insert a
                  // replacement char (U+FFFD) and advance only 1 byte
                  codePoint = 0xFFFD;
                  bytesPerSequence = 1;
                } else if (codePoint > 0xFFFF) {
                  // encode to utf16 (surrogate pair dance)
                  codePoint -= 0x10000;
                  res.push(codePoint >>> 10 & 0x3FF | 0xD800);
                  codePoint = 0xDC00 | codePoint & 0x3FF;
                }

                res.push(codePoint);
                i += bytesPerSequence;
              }

              return decodeCodePointsArray(res)
            }

            // Based on http://stackoverflow.com/a/22747272/680742, the browser with
            // the lowest limit is Chrome, with 0x10000 args.
            // We go 1 magnitude less, for safety
            var MAX_ARGUMENTS_LENGTH = 0x1000;

            function decodeCodePointsArray (codePoints) {
              var len = codePoints.length;
              if (len <= MAX_ARGUMENTS_LENGTH) {
                return String.fromCharCode.apply(String, codePoints) // avoid extra slice()
              }

              // Decode in chunks to avoid "call stack size exceeded".
              var res = '';
              var i = 0;
              while (i < len) {
                res += String.fromCharCode.apply(
                  String,
                  codePoints.slice(i, i += MAX_ARGUMENTS_LENGTH)
                );
              }
              return res
            }

            function asciiSlice (buf, start, end) {
              var ret = '';
              end = Math.min(buf.length, end);

              for (var i = start; i < end; ++i) {
                ret += String.fromCharCode(buf[i] & 0x7F);
              }
              return ret
            }

            function latin1Slice (buf, start, end) {
              var ret = '';
              end = Math.min(buf.length, end);

              for (var i = start; i < end; ++i) {
                ret += String.fromCharCode(buf[i]);
              }
              return ret
            }

            function hexSlice (buf, start, end) {
              var len = buf.length;

              if (!start || start < 0) start = 0;
              if (!end || end < 0 || end > len) end = len;

              var out = '';
              for (var i = start; i < end; ++i) {
                out += toHex(buf[i]);
              }
              return out
            }

            function utf16leSlice (buf, start, end) {
              var bytes = buf.slice(start, end);
              var res = '';
              for (var i = 0; i < bytes.length; i += 2) {
                res += String.fromCharCode(bytes[i] + bytes[i + 1] * 256);
              }
              return res
            }

            Buffer.prototype.slice = function slice (start, end) {
              var len = this.length;
              start = ~~start;
              end = end === undefined ? len : ~~end;

              if (start < 0) {
                start += len;
                if (start < 0) start = 0;
              } else if (start > len) {
                start = len;
              }

              if (end < 0) {
                end += len;
                if (end < 0) end = 0;
              } else if (end > len) {
                end = len;
              }

              if (end < start) end = start;

              var newBuf;
              if (Buffer.TYPED_ARRAY_SUPPORT) {
                newBuf = this.subarray(start, end);
                newBuf.__proto__ = Buffer.prototype;
              } else {
                var sliceLen = end - start;
                newBuf = new Buffer(sliceLen, undefined);
                for (var i = 0; i < sliceLen; ++i) {
                  newBuf[i] = this[i + start];
                }
              }

              return newBuf
            };

            /*
             * Need to make sure that buffer isn't trying to write out of bounds.
             */
            function checkOffset (offset, ext, length) {
              if ((offset % 1) !== 0 || offset < 0) throw new RangeError('offset is not uint')
              if (offset + ext > length) throw new RangeError('Trying to access beyond buffer length')
            }

            Buffer.prototype.readUIntLE = function readUIntLE (offset, byteLength, noAssert) {
              offset = offset | 0;
              byteLength = byteLength | 0;
              if (!noAssert) checkOffset(offset, byteLength, this.length);

              var val = this[offset];
              var mul = 1;
              var i = 0;
              while (++i < byteLength && (mul *= 0x100)) {
                val += this[offset + i] * mul;
              }

              return val
            };

            Buffer.prototype.readUIntBE = function readUIntBE (offset, byteLength, noAssert) {
              offset = offset | 0;
              byteLength = byteLength | 0;
              if (!noAssert) {
                checkOffset(offset, byteLength, this.length);
              }

              var val = this[offset + --byteLength];
              var mul = 1;
              while (byteLength > 0 && (mul *= 0x100)) {
                val += this[offset + --byteLength] * mul;
              }

              return val
            };

            Buffer.prototype.readUInt8 = function readUInt8 (offset, noAssert) {
              if (!noAssert) checkOffset(offset, 1, this.length);
              return this[offset]
            };

            Buffer.prototype.readUInt16LE = function readUInt16LE (offset, noAssert) {
              if (!noAssert) checkOffset(offset, 2, this.length);
              return this[offset] | (this[offset + 1] << 8)
            };

            Buffer.prototype.readUInt16BE = function readUInt16BE (offset, noAssert) {
              if (!noAssert) checkOffset(offset, 2, this.length);
              return (this[offset] << 8) | this[offset + 1]
            };

            Buffer.prototype.readUInt32LE = function readUInt32LE (offset, noAssert) {
              if (!noAssert) checkOffset(offset, 4, this.length);

              return ((this[offset]) |
                  (this[offset + 1] << 8) |
                  (this[offset + 2] << 16)) +
                  (this[offset + 3] * 0x1000000)
            };

            Buffer.prototype.readUInt32BE = function readUInt32BE (offset, noAssert) {
              if (!noAssert) checkOffset(offset, 4, this.length);

              return (this[offset] * 0x1000000) +
                ((this[offset + 1] << 16) |
                (this[offset + 2] << 8) |
                this[offset + 3])
            };

            Buffer.prototype.readIntLE = function readIntLE (offset, byteLength, noAssert) {
              offset = offset | 0;
              byteLength = byteLength | 0;
              if (!noAssert) checkOffset(offset, byteLength, this.length);

              var val = this[offset];
              var mul = 1;
              var i = 0;
              while (++i < byteLength && (mul *= 0x100)) {
                val += this[offset + i] * mul;
              }
              mul *= 0x80;

              if (val >= mul) val -= Math.pow(2, 8 * byteLength);

              return val
            };

            Buffer.prototype.readIntBE = function readIntBE (offset, byteLength, noAssert) {
              offset = offset | 0;
              byteLength = byteLength | 0;
              if (!noAssert) checkOffset(offset, byteLength, this.length);

              var i = byteLength;
              var mul = 1;
              var val = this[offset + --i];
              while (i > 0 && (mul *= 0x100)) {
                val += this[offset + --i] * mul;
              }
              mul *= 0x80;

              if (val >= mul) val -= Math.pow(2, 8 * byteLength);

              return val
            };

            Buffer.prototype.readInt8 = function readInt8 (offset, noAssert) {
              if (!noAssert) checkOffset(offset, 1, this.length);
              if (!(this[offset] & 0x80)) return (this[offset])
              return ((0xff - this[offset] + 1) * -1)
            };

            Buffer.prototype.readInt16LE = function readInt16LE (offset, noAssert) {
              if (!noAssert) checkOffset(offset, 2, this.length);
              var val = this[offset] | (this[offset + 1] << 8);
              return (val & 0x8000) ? val | 0xFFFF0000 : val
            };

            Buffer.prototype.readInt16BE = function readInt16BE (offset, noAssert) {
              if (!noAssert) checkOffset(offset, 2, this.length);
              var val = this[offset + 1] | (this[offset] << 8);
              return (val & 0x8000) ? val | 0xFFFF0000 : val
            };

            Buffer.prototype.readInt32LE = function readInt32LE (offset, noAssert) {
              if (!noAssert) checkOffset(offset, 4, this.length);

              return (this[offset]) |
                (this[offset + 1] << 8) |
                (this[offset + 2] << 16) |
                (this[offset + 3] << 24)
            };

            Buffer.prototype.readInt32BE = function readInt32BE (offset, noAssert) {
              if (!noAssert) checkOffset(offset, 4, this.length);

              return (this[offset] << 24) |
                (this[offset + 1] << 16) |
                (this[offset + 2] << 8) |
                (this[offset + 3])
            };

            Buffer.prototype.readFloatLE = function readFloatLE (offset, noAssert) {
              if (!noAssert) checkOffset(offset, 4, this.length);
              return read(this, offset, true, 23, 4)
            };

            Buffer.prototype.readFloatBE = function readFloatBE (offset, noAssert) {
              if (!noAssert) checkOffset(offset, 4, this.length);
              return read(this, offset, false, 23, 4)
            };

            Buffer.prototype.readDoubleLE = function readDoubleLE (offset, noAssert) {
              if (!noAssert) checkOffset(offset, 8, this.length);
              return read(this, offset, true, 52, 8)
            };

            Buffer.prototype.readDoubleBE = function readDoubleBE (offset, noAssert) {
              if (!noAssert) checkOffset(offset, 8, this.length);
              return read(this, offset, false, 52, 8)
            };

            function checkInt (buf, value, offset, ext, max, min) {
              if (!internalIsBuffer(buf)) throw new TypeError('"buffer" argument must be a Buffer instance')
              if (value > max || value < min) throw new RangeError('"value" argument is out of bounds')
              if (offset + ext > buf.length) throw new RangeError('Index out of range')
            }

            Buffer.prototype.writeUIntLE = function writeUIntLE (value, offset, byteLength, noAssert) {
              value = +value;
              offset = offset | 0;
              byteLength = byteLength | 0;
              if (!noAssert) {
                var maxBytes = Math.pow(2, 8 * byteLength) - 1;
                checkInt(this, value, offset, byteLength, maxBytes, 0);
              }

              var mul = 1;
              var i = 0;
              this[offset] = value & 0xFF;
              while (++i < byteLength && (mul *= 0x100)) {
                this[offset + i] = (value / mul) & 0xFF;
              }

              return offset + byteLength
            };

            Buffer.prototype.writeUIntBE = function writeUIntBE (value, offset, byteLength, noAssert) {
              value = +value;
              offset = offset | 0;
              byteLength = byteLength | 0;
              if (!noAssert) {
                var maxBytes = Math.pow(2, 8 * byteLength) - 1;
                checkInt(this, value, offset, byteLength, maxBytes, 0);
              }

              var i = byteLength - 1;
              var mul = 1;
              this[offset + i] = value & 0xFF;
              while (--i >= 0 && (mul *= 0x100)) {
                this[offset + i] = (value / mul) & 0xFF;
              }

              return offset + byteLength
            };

            Buffer.prototype.writeUInt8 = function writeUInt8 (value, offset, noAssert) {
              value = +value;
              offset = offset | 0;
              if (!noAssert) checkInt(this, value, offset, 1, 0xff, 0);
              if (!Buffer.TYPED_ARRAY_SUPPORT) value = Math.floor(value);
              this[offset] = (value & 0xff);
              return offset + 1
            };

            function objectWriteUInt16 (buf, value, offset, littleEndian) {
              if (value < 0) value = 0xffff + value + 1;
              for (var i = 0, j = Math.min(buf.length - offset, 2); i < j; ++i) {
                buf[offset + i] = (value & (0xff << (8 * (littleEndian ? i : 1 - i)))) >>>
                  (littleEndian ? i : 1 - i) * 8;
              }
            }

            Buffer.prototype.writeUInt16LE = function writeUInt16LE (value, offset, noAssert) {
              value = +value;
              offset = offset | 0;
              if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0);
              if (Buffer.TYPED_ARRAY_SUPPORT) {
                this[offset] = (value & 0xff);
                this[offset + 1] = (value >>> 8);
              } else {
                objectWriteUInt16(this, value, offset, true);
              }
              return offset + 2
            };

            Buffer.prototype.writeUInt16BE = function writeUInt16BE (value, offset, noAssert) {
              value = +value;
              offset = offset | 0;
              if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0);
              if (Buffer.TYPED_ARRAY_SUPPORT) {
                this[offset] = (value >>> 8);
                this[offset + 1] = (value & 0xff);
              } else {
                objectWriteUInt16(this, value, offset, false);
              }
              return offset + 2
            };

            function objectWriteUInt32 (buf, value, offset, littleEndian) {
              if (value < 0) value = 0xffffffff + value + 1;
              for (var i = 0, j = Math.min(buf.length - offset, 4); i < j; ++i) {
                buf[offset + i] = (value >>> (littleEndian ? i : 3 - i) * 8) & 0xff;
              }
            }

            Buffer.prototype.writeUInt32LE = function writeUInt32LE (value, offset, noAssert) {
              value = +value;
              offset = offset | 0;
              if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0);
              if (Buffer.TYPED_ARRAY_SUPPORT) {
                this[offset + 3] = (value >>> 24);
                this[offset + 2] = (value >>> 16);
                this[offset + 1] = (value >>> 8);
                this[offset] = (value & 0xff);
              } else {
                objectWriteUInt32(this, value, offset, true);
              }
              return offset + 4
            };

            Buffer.prototype.writeUInt32BE = function writeUInt32BE (value, offset, noAssert) {
              value = +value;
              offset = offset | 0;
              if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0);
              if (Buffer.TYPED_ARRAY_SUPPORT) {
                this[offset] = (value >>> 24);
                this[offset + 1] = (value >>> 16);
                this[offset + 2] = (value >>> 8);
                this[offset + 3] = (value & 0xff);
              } else {
                objectWriteUInt32(this, value, offset, false);
              }
              return offset + 4
            };

            Buffer.prototype.writeIntLE = function writeIntLE (value, offset, byteLength, noAssert) {
              value = +value;
              offset = offset | 0;
              if (!noAssert) {
                var limit = Math.pow(2, 8 * byteLength - 1);

                checkInt(this, value, offset, byteLength, limit - 1, -limit);
              }

              var i = 0;
              var mul = 1;
              var sub = 0;
              this[offset] = value & 0xFF;
              while (++i < byteLength && (mul *= 0x100)) {
                if (value < 0 && sub === 0 && this[offset + i - 1] !== 0) {
                  sub = 1;
                }
                this[offset + i] = ((value / mul) >> 0) - sub & 0xFF;
              }

              return offset + byteLength
            };

            Buffer.prototype.writeIntBE = function writeIntBE (value, offset, byteLength, noAssert) {
              value = +value;
              offset = offset | 0;
              if (!noAssert) {
                var limit = Math.pow(2, 8 * byteLength - 1);

                checkInt(this, value, offset, byteLength, limit - 1, -limit);
              }

              var i = byteLength - 1;
              var mul = 1;
              var sub = 0;
              this[offset + i] = value & 0xFF;
              while (--i >= 0 && (mul *= 0x100)) {
                if (value < 0 && sub === 0 && this[offset + i + 1] !== 0) {
                  sub = 1;
                }
                this[offset + i] = ((value / mul) >> 0) - sub & 0xFF;
              }

              return offset + byteLength
            };

            Buffer.prototype.writeInt8 = function writeInt8 (value, offset, noAssert) {
              value = +value;
              offset = offset | 0;
              if (!noAssert) checkInt(this, value, offset, 1, 0x7f, -0x80);
              if (!Buffer.TYPED_ARRAY_SUPPORT) value = Math.floor(value);
              if (value < 0) value = 0xff + value + 1;
              this[offset] = (value & 0xff);
              return offset + 1
            };

            Buffer.prototype.writeInt16LE = function writeInt16LE (value, offset, noAssert) {
              value = +value;
              offset = offset | 0;
              if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000);
              if (Buffer.TYPED_ARRAY_SUPPORT) {
                this[offset] = (value & 0xff);
                this[offset + 1] = (value >>> 8);
              } else {
                objectWriteUInt16(this, value, offset, true);
              }
              return offset + 2
            };

            Buffer.prototype.writeInt16BE = function writeInt16BE (value, offset, noAssert) {
              value = +value;
              offset = offset | 0;
              if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000);
              if (Buffer.TYPED_ARRAY_SUPPORT) {
                this[offset] = (value >>> 8);
                this[offset + 1] = (value & 0xff);
              } else {
                objectWriteUInt16(this, value, offset, false);
              }
              return offset + 2
            };

            Buffer.prototype.writeInt32LE = function writeInt32LE (value, offset, noAssert) {
              value = +value;
              offset = offset | 0;
              if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000);
              if (Buffer.TYPED_ARRAY_SUPPORT) {
                this[offset] = (value & 0xff);
                this[offset + 1] = (value >>> 8);
                this[offset + 2] = (value >>> 16);
                this[offset + 3] = (value >>> 24);
              } else {
                objectWriteUInt32(this, value, offset, true);
              }
              return offset + 4
            };

            Buffer.prototype.writeInt32BE = function writeInt32BE (value, offset, noAssert) {
              value = +value;
              offset = offset | 0;
              if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000);
              if (value < 0) value = 0xffffffff + value + 1;
              if (Buffer.TYPED_ARRAY_SUPPORT) {
                this[offset] = (value >>> 24);
                this[offset + 1] = (value >>> 16);
                this[offset + 2] = (value >>> 8);
                this[offset + 3] = (value & 0xff);
              } else {
                objectWriteUInt32(this, value, offset, false);
              }
              return offset + 4
            };

            function checkIEEE754 (buf, value, offset, ext, max, min) {
              if (offset + ext > buf.length) throw new RangeError('Index out of range')
              if (offset < 0) throw new RangeError('Index out of range')
            }

            function writeFloat (buf, value, offset, littleEndian, noAssert) {
              if (!noAssert) {
                checkIEEE754(buf, value, offset, 4, 3.4028234663852886e+38, -3.4028234663852886e+38);
              }
              write(buf, value, offset, littleEndian, 23, 4);
              return offset + 4
            }

            Buffer.prototype.writeFloatLE = function writeFloatLE (value, offset, noAssert) {
              return writeFloat(this, value, offset, true, noAssert)
            };

            Buffer.prototype.writeFloatBE = function writeFloatBE (value, offset, noAssert) {
              return writeFloat(this, value, offset, false, noAssert)
            };

            function writeDouble (buf, value, offset, littleEndian, noAssert) {
              if (!noAssert) {
                checkIEEE754(buf, value, offset, 8, 1.7976931348623157E+308, -1.7976931348623157E+308);
              }
              write(buf, value, offset, littleEndian, 52, 8);
              return offset + 8
            }

            Buffer.prototype.writeDoubleLE = function writeDoubleLE (value, offset, noAssert) {
              return writeDouble(this, value, offset, true, noAssert)
            };

            Buffer.prototype.writeDoubleBE = function writeDoubleBE (value, offset, noAssert) {
              return writeDouble(this, value, offset, false, noAssert)
            };

            // copy(targetBuffer, targetStart=0, sourceStart=0, sourceEnd=buffer.length)
            Buffer.prototype.copy = function copy (target, targetStart, start, end) {
              if (!start) start = 0;
              if (!end && end !== 0) end = this.length;
              if (targetStart >= target.length) targetStart = target.length;
              if (!targetStart) targetStart = 0;
              if (end > 0 && end < start) end = start;

              // Copy 0 bytes; we're done
              if (end === start) return 0
              if (target.length === 0 || this.length === 0) return 0

              // Fatal error conditions
              if (targetStart < 0) {
                throw new RangeError('targetStart out of bounds')
              }
              if (start < 0 || start >= this.length) throw new RangeError('sourceStart out of bounds')
              if (end < 0) throw new RangeError('sourceEnd out of bounds')

              // Are we oob?
              if (end > this.length) end = this.length;
              if (target.length - targetStart < end - start) {
                end = target.length - targetStart + start;
              }

              var len = end - start;
              var i;

              if (this === target && start < targetStart && targetStart < end) {
                // descending copy from end
                for (i = len - 1; i >= 0; --i) {
                  target[i + targetStart] = this[i + start];
                }
              } else if (len < 1000 || !Buffer.TYPED_ARRAY_SUPPORT) {
                // ascending copy from start
                for (i = 0; i < len; ++i) {
                  target[i + targetStart] = this[i + start];
                }
              } else {
                Uint8Array.prototype.set.call(
                  target,
                  this.subarray(start, start + len),
                  targetStart
                );
              }

              return len
            };

            // Usage:
            //    buffer.fill(number[, offset[, end]])
            //    buffer.fill(buffer[, offset[, end]])
            //    buffer.fill(string[, offset[, end]][, encoding])
            Buffer.prototype.fill = function fill (val, start, end, encoding) {
              // Handle string cases:
              if (typeof val === 'string') {
                if (typeof start === 'string') {
                  encoding = start;
                  start = 0;
                  end = this.length;
                } else if (typeof end === 'string') {
                  encoding = end;
                  end = this.length;
                }
                if (val.length === 1) {
                  var code = val.charCodeAt(0);
                  if (code < 256) {
                    val = code;
                  }
                }
                if (encoding !== undefined && typeof encoding !== 'string') {
                  throw new TypeError('encoding must be a string')
                }
                if (typeof encoding === 'string' && !Buffer.isEncoding(encoding)) {
                  throw new TypeError('Unknown encoding: ' + encoding)
                }
              } else if (typeof val === 'number') {
                val = val & 255;
              }

              // Invalid ranges are not set to a default, so can range check early.
              if (start < 0 || this.length < start || this.length < end) {
                throw new RangeError('Out of range index')
              }

              if (end <= start) {
                return this
              }

              start = start >>> 0;
              end = end === undefined ? this.length : end >>> 0;

              if (!val) val = 0;

              var i;
              if (typeof val === 'number') {
                for (i = start; i < end; ++i) {
                  this[i] = val;
                }
              } else {
                var bytes = internalIsBuffer(val)
                  ? val
                  : utf8ToBytes(new Buffer(val, encoding).toString());
                var len = bytes.length;
                for (i = 0; i < end - start; ++i) {
                  this[i + start] = bytes[i % len];
                }
              }

              return this
            };

            // HELPER FUNCTIONS
            // ================

            var INVALID_BASE64_RE = /[^+\/0-9A-Za-z-_]/g;

            function base64clean (str) {
              // Node strips out invalid characters like \n and \t from the string, base64-js does not
              str = stringtrim(str).replace(INVALID_BASE64_RE, '');
              // Node converts strings with length < 2 to ''
              if (str.length < 2) return ''
              // Node allows for non-padded base64 strings (missing trailing ===), base64-js does not
              while (str.length % 4 !== 0) {
                str = str + '=';
              }
              return str
            }

            function stringtrim (str) {
              if (str.trim) return str.trim()
              return str.replace(/^\s+|\s+$/g, '')
            }

            function toHex (n) {
              if (n < 16) return '0' + n.toString(16)
              return n.toString(16)
            }

            function utf8ToBytes (string, units) {
              units = units || Infinity;
              var codePoint;
              var length = string.length;
              var leadSurrogate = null;
              var bytes = [];

              for (var i = 0; i < length; ++i) {
                codePoint = string.charCodeAt(i);

                // is surrogate component
                if (codePoint > 0xD7FF && codePoint < 0xE000) {
                  // last char was a lead
                  if (!leadSurrogate) {
                    // no lead yet
                    if (codePoint > 0xDBFF) {
                      // unexpected trail
                      if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD);
                      continue
                    } else if (i + 1 === length) {
                      // unpaired lead
                      if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD);
                      continue
                    }

                    // valid lead
                    leadSurrogate = codePoint;

                    continue
                  }

                  // 2 leads in a row
                  if (codePoint < 0xDC00) {
                    if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD);
                    leadSurrogate = codePoint;
                    continue
                  }

                  // valid surrogate pair
                  codePoint = (leadSurrogate - 0xD800 << 10 | codePoint - 0xDC00) + 0x10000;
                } else if (leadSurrogate) {
                  // valid bmp char, but last char was a lead
                  if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD);
                }

                leadSurrogate = null;

                // encode utf8
                if (codePoint < 0x80) {
                  if ((units -= 1) < 0) break
                  bytes.push(codePoint);
                } else if (codePoint < 0x800) {
                  if ((units -= 2) < 0) break
                  bytes.push(
                    codePoint >> 0x6 | 0xC0,
                    codePoint & 0x3F | 0x80
                  );
                } else if (codePoint < 0x10000) {
                  if ((units -= 3) < 0) break
                  bytes.push(
                    codePoint >> 0xC | 0xE0,
                    codePoint >> 0x6 & 0x3F | 0x80,
                    codePoint & 0x3F | 0x80
                  );
                } else if (codePoint < 0x110000) {
                  if ((units -= 4) < 0) break
                  bytes.push(
                    codePoint >> 0x12 | 0xF0,
                    codePoint >> 0xC & 0x3F | 0x80,
                    codePoint >> 0x6 & 0x3F | 0x80,
                    codePoint & 0x3F | 0x80
                  );
                } else {
                  throw new Error('Invalid code point')
                }
              }

              return bytes
            }

            function asciiToBytes (str) {
              var byteArray = [];
              for (var i = 0; i < str.length; ++i) {
                // Node's code seems to be doing this and not & 0x7F..
                byteArray.push(str.charCodeAt(i) & 0xFF);
              }
              return byteArray
            }

            function utf16leToBytes (str, units) {
              var c, hi, lo;
              var byteArray = [];
              for (var i = 0; i < str.length; ++i) {
                if ((units -= 2) < 0) break

                c = str.charCodeAt(i);
                hi = c >> 8;
                lo = c % 256;
                byteArray.push(lo);
                byteArray.push(hi);
              }

              return byteArray
            }


            function base64ToBytes (str) {
              return toByteArray(base64clean(str))
            }

            function blitBuffer (src, dst, offset, length) {
              for (var i = 0; i < length; ++i) {
                if ((i + offset >= dst.length) || (i >= src.length)) break
                dst[i + offset] = src[i];
              }
              return i
            }

            function isnan (val) {
              return val !== val // eslint-disable-line no-self-compare
            }


            // the following is from is-buffer, also by Feross Aboukhadijeh and with same lisence
            // The _isBuffer check is for Safari 5-7 support, because it's missing
            // Object.prototype.constructor. Remove this eventually
            function isBuffer(obj) {
              return obj != null && (!!obj._isBuffer || isFastBuffer(obj) || isSlowBuffer(obj))
            }

            function isFastBuffer (obj) {
              return !!obj.constructor && typeof obj.constructor.isBuffer === 'function' && obj.constructor.isBuffer(obj)
            }

            // For Node v0.10 support. Remove this eventually.
            function isSlowBuffer (obj) {
              return typeof obj.readFloatLE === 'function' && typeof obj.slice === 'function' && isFastBuffer(obj.slice(0, 0))
            }

            function isNull(arg) {
              return arg === null;
            }

            function isNullOrUndefined(arg) {
              return arg == null;
            }

            function isString(arg) {
              return typeof arg === 'string';
            }

            function isObject(arg) {
              return typeof arg === 'object' && arg !== null;
            }

            // Copyright Joyent, Inc. and other Node contributors.
            //
            // Permission is hereby granted, free of charge, to any person obtaining a
            // copy of this software and associated documentation files (the
            // "Software"), to deal in the Software without restriction, including
            // without limitation the rights to use, copy, modify, merge, publish,
            // distribute, sublicense, and/or sell copies of the Software, and to permit
            // persons to whom the Software is furnished to do so, subject to the
            // following conditions:
            //
            // The above copyright notice and this permission notice shall be included
            // in all copies or substantial portions of the Software.
            //
            // THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
            // OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
            // MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
            // NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
            // DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
            // OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
            // USE OR OTHER DEALINGS IN THE SOFTWARE.


            // If obj.hasOwnProperty has been overridden, then calling
            // obj.hasOwnProperty(prop) will break.
            // See: https://github.com/joyent/node/issues/1707
            function hasOwnProperty$1(obj, prop) {
              return Object.prototype.hasOwnProperty.call(obj, prop);
            }
            var isArray$2 = Array.isArray || function (xs) {
              return Object.prototype.toString.call(xs) === '[object Array]';
            };
            function stringifyPrimitive(v) {
              switch (typeof v) {
                case 'string':
                  return v;

                case 'boolean':
                  return v ? 'true' : 'false';

                case 'number':
                  return isFinite(v) ? v : '';

                default:
                  return '';
              }
            }

            function stringify (obj, sep, eq, name) {
              sep = sep || '&';
              eq = eq || '=';
              if (obj === null) {
                obj = undefined;
              }

              if (typeof obj === 'object') {
                return map$1(objectKeys(obj), function(k) {
                  var ks = encodeURIComponent(stringifyPrimitive(k)) + eq;
                  if (isArray$2(obj[k])) {
                    return map$1(obj[k], function(v) {
                      return ks + encodeURIComponent(stringifyPrimitive(v));
                    }).join(sep);
                  } else {
                    return ks + encodeURIComponent(stringifyPrimitive(obj[k]));
                  }
                }).join(sep);

              }

              if (!name) return '';
              return encodeURIComponent(stringifyPrimitive(name)) + eq +
                     encodeURIComponent(stringifyPrimitive(obj));
            }
            function map$1 (xs, f) {
              if (xs.map) return xs.map(f);
              var res = [];
              for (var i = 0; i < xs.length; i++) {
                res.push(f(xs[i], i));
              }
              return res;
            }

            var objectKeys = Object.keys || function (obj) {
              var res = [];
              for (var key in obj) {
                if (Object.prototype.hasOwnProperty.call(obj, key)) res.push(key);
              }
              return res;
            };

            function parse(qs, sep, eq, options) {
              sep = sep || '&';
              eq = eq || '=';
              var obj = {};

              if (typeof qs !== 'string' || qs.length === 0) {
                return obj;
              }

              var regexp = /\+/g;
              qs = qs.split(sep);

              var maxKeys = 1000;
              if (options && typeof options.maxKeys === 'number') {
                maxKeys = options.maxKeys;
              }

              var len = qs.length;
              // maxKeys <= 0 means that we should not limit keys count
              if (maxKeys > 0 && len > maxKeys) {
                len = maxKeys;
              }

              for (var i = 0; i < len; ++i) {
                var x = qs[i].replace(regexp, '%20'),
                    idx = x.indexOf(eq),
                    kstr, vstr, k, v;

                if (idx >= 0) {
                  kstr = x.substr(0, idx);
                  vstr = x.substr(idx + 1);
                } else {
                  kstr = x;
                  vstr = '';
                }

                k = decodeURIComponent(kstr);
                v = decodeURIComponent(vstr);

                if (!hasOwnProperty$1(obj, k)) {
                  obj[k] = v;
                } else if (isArray$2(obj[k])) {
                  obj[k].push(v);
                } else {
                  obj[k] = [obj[k], v];
                }
              }

              return obj;
            }

            // Copyright Joyent, Inc. and other Node contributors.
            var url = {
              parse: urlParse,
              resolve: urlResolve,
              resolveObject: urlResolveObject,
              format: urlFormat,
              Url: Url
            };
            function Url() {
              this.protocol = null;
              this.slashes = null;
              this.auth = null;
              this.host = null;
              this.port = null;
              this.hostname = null;
              this.hash = null;
              this.search = null;
              this.query = null;
              this.pathname = null;
              this.path = null;
              this.href = null;
            }

            // Reference: RFC 3986, RFC 1808, RFC 2396

            // define these here so at least they only have to be
            // compiled once on the first module load.
            var protocolPattern = /^([a-z0-9.+-]+:)/i,
              portPattern = /:[0-9]*$/,

              // Special case for a simple path URL
              simplePathPattern = /^(\/\/?(?!\/)[^\?\s]*)(\?[^\s]*)?$/,

              // RFC 2396: characters reserved for delimiting URLs.
              // We actually just auto-escape these.
              delims = ['<', '>', '"', '`', ' ', '\r', '\n', '\t'],

              // RFC 2396: characters not allowed for various reasons.
              unwise = ['{', '}', '|', '\\', '^', '`'].concat(delims),

              // Allowed by RFCs, but cause of XSS attacks.  Always escape these.
              autoEscape = ['\''].concat(unwise),
              // Characters that are never ever allowed in a hostname.
              // Note that any invalid chars are also handled, but these
              // are the ones that are *expected* to be seen, so we fast-path
              // them.
              nonHostChars = ['%', '/', '?', ';', '#'].concat(autoEscape),
              hostEndingChars = ['/', '?', '#'],
              hostnameMaxLen = 255,
              hostnamePartPattern = /^[+a-z0-9A-Z_-]{0,63}$/,
              hostnamePartStart = /^([+a-z0-9A-Z_-]{0,63})(.*)$/,
              // protocols that can allow "unsafe" and "unwise" chars.
              unsafeProtocol = {
                'javascript': true,
                'javascript:': true
              },
              // protocols that never have a hostname.
              hostlessProtocol = {
                'javascript': true,
                'javascript:': true
              },
              // protocols that always contain a // bit.
              slashedProtocol = {
                'http': true,
                'https': true,
                'ftp': true,
                'gopher': true,
                'file': true,
                'http:': true,
                'https:': true,
                'ftp:': true,
                'gopher:': true,
                'file:': true
              };

            function urlParse(url, parseQueryString, slashesDenoteHost) {
              if (url && isObject(url) && url instanceof Url) return url;

              var u = new Url;
              u.parse(url, parseQueryString, slashesDenoteHost);
              return u;
            }
            Url.prototype.parse = function(url, parseQueryString, slashesDenoteHost) {
              return parse$1(this, url, parseQueryString, slashesDenoteHost);
            };

            function parse$1(self, url, parseQueryString, slashesDenoteHost) {
              if (!isString(url)) {
                throw new TypeError('Parameter \'url\' must be a string, not ' + typeof url);
              }

              // Copy chrome, IE, opera backslash-handling behavior.
              // Back slashes before the query string get converted to forward slashes
              // See: https://code.google.com/p/chromium/issues/detail?id=25916
              var queryIndex = url.indexOf('?'),
                splitter =
                (queryIndex !== -1 && queryIndex < url.indexOf('#')) ? '?' : '#',
                uSplit = url.split(splitter),
                slashRegex = /\\/g;
              uSplit[0] = uSplit[0].replace(slashRegex, '/');
              url = uSplit.join(splitter);

              var rest = url;

              // trim before proceeding.
              // This is to support parse stuff like "  http://foo.com  \n"
              rest = rest.trim();

              if (!slashesDenoteHost && url.split('#').length === 1) {
                // Try fast path regexp
                var simplePath = simplePathPattern.exec(rest);
                if (simplePath) {
                  self.path = rest;
                  self.href = rest;
                  self.pathname = simplePath[1];
                  if (simplePath[2]) {
                    self.search = simplePath[2];
                    if (parseQueryString) {
                      self.query = parse(self.search.substr(1));
                    } else {
                      self.query = self.search.substr(1);
                    }
                  } else if (parseQueryString) {
                    self.search = '';
                    self.query = {};
                  }
                  return self;
                }
              }

              var proto = protocolPattern.exec(rest);
              if (proto) {
                proto = proto[0];
                var lowerProto = proto.toLowerCase();
                self.protocol = lowerProto;
                rest = rest.substr(proto.length);
              }

              // figure out if it's got a host
              // user@server is *always* interpreted as a hostname, and url
              // resolution will treat //foo/bar as host=foo,path=bar because that's
              // how the browser resolves relative URLs.
              if (slashesDenoteHost || proto || rest.match(/^\/\/[^@\/]+@[^@\/]+/)) {
                var slashes = rest.substr(0, 2) === '//';
                if (slashes && !(proto && hostlessProtocol[proto])) {
                  rest = rest.substr(2);
                  self.slashes = true;
                }
              }
              var i, hec, l, p;
              if (!hostlessProtocol[proto] &&
                (slashes || (proto && !slashedProtocol[proto]))) {

                // there's a hostname.
                // the first instance of /, ?, ;, or # ends the host.
                //
                // If there is an @ in the hostname, then non-host chars *are* allowed
                // to the left of the last @ sign, unless some host-ending character
                // comes *before* the @-sign.
                // URLs are obnoxious.
                //
                // ex:
                // http://a@b@c/ => user:a@b host:c
                // http://a@b?@c => user:a host:c path:/?@c

                // v0.12 TODO(isaacs): This is not quite how Chrome does things.
                // Review our test case against browsers more comprehensively.

                // find the first instance of any hostEndingChars
                var hostEnd = -1;
                for (i = 0; i < hostEndingChars.length; i++) {
                  hec = rest.indexOf(hostEndingChars[i]);
                  if (hec !== -1 && (hostEnd === -1 || hec < hostEnd))
                    hostEnd = hec;
                }

                // at this point, either we have an explicit point where the
                // auth portion cannot go past, or the last @ char is the decider.
                var auth, atSign;
                if (hostEnd === -1) {
                  // atSign can be anywhere.
                  atSign = rest.lastIndexOf('@');
                } else {
                  // atSign must be in auth portion.
                  // http://a@b/c@d => host:b auth:a path:/c@d
                  atSign = rest.lastIndexOf('@', hostEnd);
                }

                // Now we have a portion which is definitely the auth.
                // Pull that off.
                if (atSign !== -1) {
                  auth = rest.slice(0, atSign);
                  rest = rest.slice(atSign + 1);
                  self.auth = decodeURIComponent(auth);
                }

                // the host is the remaining to the left of the first non-host char
                hostEnd = -1;
                for (i = 0; i < nonHostChars.length; i++) {
                  hec = rest.indexOf(nonHostChars[i]);
                  if (hec !== -1 && (hostEnd === -1 || hec < hostEnd))
                    hostEnd = hec;
                }
                // if we still have not hit it, then the entire thing is a host.
                if (hostEnd === -1)
                  hostEnd = rest.length;

                self.host = rest.slice(0, hostEnd);
                rest = rest.slice(hostEnd);

                // pull out port.
                parseHost(self);

                // we've indicated that there is a hostname,
                // so even if it's empty, it has to be present.
                self.hostname = self.hostname || '';

                // if hostname begins with [ and ends with ]
                // assume that it's an IPv6 address.
                var ipv6Hostname = self.hostname[0] === '[' &&
                  self.hostname[self.hostname.length - 1] === ']';

                // validate a little.
                if (!ipv6Hostname) {
                  var hostparts = self.hostname.split(/\./);
                  for (i = 0, l = hostparts.length; i < l; i++) {
                    var part = hostparts[i];
                    if (!part) continue;
                    if (!part.match(hostnamePartPattern)) {
                      var newpart = '';
                      for (var j = 0, k = part.length; j < k; j++) {
                        if (part.charCodeAt(j) > 127) {
                          // we replace non-ASCII char with a temporary placeholder
                          // we need this to make sure size of hostname is not
                          // broken by replacing non-ASCII by nothing
                          newpart += 'x';
                        } else {
                          newpart += part[j];
                        }
                      }
                      // we test again with ASCII char only
                      if (!newpart.match(hostnamePartPattern)) {
                        var validParts = hostparts.slice(0, i);
                        var notHost = hostparts.slice(i + 1);
                        var bit = part.match(hostnamePartStart);
                        if (bit) {
                          validParts.push(bit[1]);
                          notHost.unshift(bit[2]);
                        }
                        if (notHost.length) {
                          rest = '/' + notHost.join('.') + rest;
                        }
                        self.hostname = validParts.join('.');
                        break;
                      }
                    }
                  }
                }

                if (self.hostname.length > hostnameMaxLen) {
                  self.hostname = '';
                } else {
                  // hostnames are always lower case.
                  self.hostname = self.hostname.toLowerCase();
                }

                if (!ipv6Hostname) {
                  // IDNA Support: Returns a punycoded representation of "domain".
                  // It only converts parts of the domain name that
                  // have non-ASCII characters, i.e. it doesn't matter if
                  // you call it with a domain that already is ASCII-only.
                  self.hostname = toASCII(self.hostname);
                }

                p = self.port ? ':' + self.port : '';
                var h = self.hostname || '';
                self.host = h + p;
                self.href += self.host;

                // strip [ and ] from the hostname
                // the host field still retains them, though
                if (ipv6Hostname) {
                  self.hostname = self.hostname.substr(1, self.hostname.length - 2);
                  if (rest[0] !== '/') {
                    rest = '/' + rest;
                  }
                }
              }

              // now rest is set to the post-host stuff.
              // chop off any delim chars.
              if (!unsafeProtocol[lowerProto]) {

                // First, make 100% sure that any "autoEscape" chars get
                // escaped, even if encodeURIComponent doesn't think they
                // need to be.
                for (i = 0, l = autoEscape.length; i < l; i++) {
                  var ae = autoEscape[i];
                  if (rest.indexOf(ae) === -1)
                    continue;
                  var esc = encodeURIComponent(ae);
                  if (esc === ae) {
                    esc = escape(ae);
                  }
                  rest = rest.split(ae).join(esc);
                }
              }


              // chop off from the tail first.
              var hash = rest.indexOf('#');
              if (hash !== -1) {
                // got a fragment string.
                self.hash = rest.substr(hash);
                rest = rest.slice(0, hash);
              }
              var qm = rest.indexOf('?');
              if (qm !== -1) {
                self.search = rest.substr(qm);
                self.query = rest.substr(qm + 1);
                if (parseQueryString) {
                  self.query = parse(self.query);
                }
                rest = rest.slice(0, qm);
              } else if (parseQueryString) {
                // no query string, but parseQueryString still requested
                self.search = '';
                self.query = {};
              }
              if (rest) self.pathname = rest;
              if (slashedProtocol[lowerProto] &&
                self.hostname && !self.pathname) {
                self.pathname = '/';
              }

              //to support http.request
              if (self.pathname || self.search) {
                p = self.pathname || '';
                var s = self.search || '';
                self.path = p + s;
              }

              // finally, reconstruct the href based on what has been validated.
              self.href = format$1(self);
              return self;
            }

            // format a parsed object into a url string
            function urlFormat(obj) {
              // ensure it's an object, and not a string url.
              // If it's an obj, this is a no-op.
              // this way, you can call url_format() on strings
              // to clean up potentially wonky urls.
              if (isString(obj)) obj = parse$1({}, obj);
              return format$1(obj);
            }

            function format$1(self) {
              var auth = self.auth || '';
              if (auth) {
                auth = encodeURIComponent(auth);
                auth = auth.replace(/%3A/i, ':');
                auth += '@';
              }

              var protocol = self.protocol || '',
                pathname = self.pathname || '',
                hash = self.hash || '',
                host = false,
                query = '';

              if (self.host) {
                host = auth + self.host;
              } else if (self.hostname) {
                host = auth + (self.hostname.indexOf(':') === -1 ?
                  self.hostname :
                  '[' + this.hostname + ']');
                if (self.port) {
                  host += ':' + self.port;
                }
              }

              if (self.query &&
                isObject(self.query) &&
                Object.keys(self.query).length) {
                query = stringify(self.query);
              }

              var search = self.search || (query && ('?' + query)) || '';

              if (protocol && protocol.substr(-1) !== ':') protocol += ':';

              // only the slashedProtocols get the //.  Not mailto:, xmpp:, etc.
              // unless they had them to begin with.
              if (self.slashes ||
                (!protocol || slashedProtocol[protocol]) && host !== false) {
                host = '//' + (host || '');
                if (pathname && pathname.charAt(0) !== '/') pathname = '/' + pathname;
              } else if (!host) {
                host = '';
              }

              if (hash && hash.charAt(0) !== '#') hash = '#' + hash;
              if (search && search.charAt(0) !== '?') search = '?' + search;

              pathname = pathname.replace(/[?#]/g, function(match) {
                return encodeURIComponent(match);
              });
              search = search.replace('#', '%23');

              return protocol + host + pathname + search + hash;
            }

            Url.prototype.format = function() {
              return format$1(this);
            };

            function urlResolve(source, relative) {
              return urlParse(source, false, true).resolve(relative);
            }

            Url.prototype.resolve = function(relative) {
              return this.resolveObject(urlParse(relative, false, true)).format();
            };

            function urlResolveObject(source, relative) {
              if (!source) return relative;
              return urlParse(source, false, true).resolveObject(relative);
            }

            Url.prototype.resolveObject = function(relative) {
              if (isString(relative)) {
                var rel = new Url();
                rel.parse(relative, false, true);
                relative = rel;
              }

              var result = new Url();
              var tkeys = Object.keys(this);
              for (var tk = 0; tk < tkeys.length; tk++) {
                var tkey = tkeys[tk];
                result[tkey] = this[tkey];
              }

              // hash is always overridden, no matter what.
              // even href="" will remove it.
              result.hash = relative.hash;

              // if the relative url is empty, then there's nothing left to do here.
              if (relative.href === '') {
                result.href = result.format();
                return result;
              }

              // hrefs like //foo/bar always cut to the protocol.
              if (relative.slashes && !relative.protocol) {
                // take everything except the protocol from relative
                var rkeys = Object.keys(relative);
                for (var rk = 0; rk < rkeys.length; rk++) {
                  var rkey = rkeys[rk];
                  if (rkey !== 'protocol')
                    result[rkey] = relative[rkey];
                }

                //urlParse appends trailing / to urls like http://www.example.com
                if (slashedProtocol[result.protocol] &&
                  result.hostname && !result.pathname) {
                  result.path = result.pathname = '/';
                }

                result.href = result.format();
                return result;
              }
              var relPath;
              if (relative.protocol && relative.protocol !== result.protocol) {
                // if it's a known url protocol, then changing
                // the protocol does weird things
                // first, if it's not file:, then we MUST have a host,
                // and if there was a path
                // to begin with, then we MUST have a path.
                // if it is file:, then the host is dropped,
                // because that's known to be hostless.
                // anything else is assumed to be absolute.
                if (!slashedProtocol[relative.protocol]) {
                  var keys = Object.keys(relative);
                  for (var v = 0; v < keys.length; v++) {
                    var k = keys[v];
                    result[k] = relative[k];
                  }
                  result.href = result.format();
                  return result;
                }

                result.protocol = relative.protocol;
                if (!relative.host && !hostlessProtocol[relative.protocol]) {
                  relPath = (relative.pathname || '').split('/');
                  while (relPath.length && !(relative.host = relPath.shift()));
                  if (!relative.host) relative.host = '';
                  if (!relative.hostname) relative.hostname = '';
                  if (relPath[0] !== '') relPath.unshift('');
                  if (relPath.length < 2) relPath.unshift('');
                  result.pathname = relPath.join('/');
                } else {
                  result.pathname = relative.pathname;
                }
                result.search = relative.search;
                result.query = relative.query;
                result.host = relative.host || '';
                result.auth = relative.auth;
                result.hostname = relative.hostname || relative.host;
                result.port = relative.port;
                // to support http.request
                if (result.pathname || result.search) {
                  var p = result.pathname || '';
                  var s = result.search || '';
                  result.path = p + s;
                }
                result.slashes = result.slashes || relative.slashes;
                result.href = result.format();
                return result;
              }

              var isSourceAbs = (result.pathname && result.pathname.charAt(0) === '/'),
                isRelAbs = (
                  relative.host ||
                  relative.pathname && relative.pathname.charAt(0) === '/'
                ),
                mustEndAbs = (isRelAbs || isSourceAbs ||
                  (result.host && relative.pathname)),
                removeAllDots = mustEndAbs,
                srcPath = result.pathname && result.pathname.split('/') || [],
                psychotic = result.protocol && !slashedProtocol[result.protocol];
              relPath = relative.pathname && relative.pathname.split('/') || [];
              // if the url is a non-slashed url, then relative
              // links like ../.. should be able
              // to crawl up to the hostname, as well.  This is strange.
              // result.protocol has already been set by now.
              // Later on, put the first path part into the host field.
              if (psychotic) {
                result.hostname = '';
                result.port = null;
                if (result.host) {
                  if (srcPath[0] === '') srcPath[0] = result.host;
                  else srcPath.unshift(result.host);
                }
                result.host = '';
                if (relative.protocol) {
                  relative.hostname = null;
                  relative.port = null;
                  if (relative.host) {
                    if (relPath[0] === '') relPath[0] = relative.host;
                    else relPath.unshift(relative.host);
                  }
                  relative.host = null;
                }
                mustEndAbs = mustEndAbs && (relPath[0] === '' || srcPath[0] === '');
              }
              var authInHost;
              if (isRelAbs) {
                // it's absolute.
                result.host = (relative.host || relative.host === '') ?
                  relative.host : result.host;
                result.hostname = (relative.hostname || relative.hostname === '') ?
                  relative.hostname : result.hostname;
                result.search = relative.search;
                result.query = relative.query;
                srcPath = relPath;
                // fall through to the dot-handling below.
              } else if (relPath.length) {
                // it's relative
                // throw away the existing file, and take the new path instead.
                if (!srcPath) srcPath = [];
                srcPath.pop();
                srcPath = srcPath.concat(relPath);
                result.search = relative.search;
                result.query = relative.query;
              } else if (!isNullOrUndefined(relative.search)) {
                // just pull out the search.
                // like href='?foo'.
                // Put this after the other two cases because it simplifies the booleans
                if (psychotic) {
                  result.hostname = result.host = srcPath.shift();
                  //occationaly the auth can get stuck only in host
                  //this especially happens in cases like
                  //url.resolveObject('mailto:local1@domain1', 'local2@domain2')
                  authInHost = result.host && result.host.indexOf('@') > 0 ?
                    result.host.split('@') : false;
                  if (authInHost) {
                    result.auth = authInHost.shift();
                    result.host = result.hostname = authInHost.shift();
                  }
                }
                result.search = relative.search;
                result.query = relative.query;
                //to support http.request
                if (!isNull(result.pathname) || !isNull(result.search)) {
                  result.path = (result.pathname ? result.pathname : '') +
                    (result.search ? result.search : '');
                }
                result.href = result.format();
                return result;
              }

              if (!srcPath.length) {
                // no path at all.  easy.
                // we've already handled the other stuff above.
                result.pathname = null;
                //to support http.request
                if (result.search) {
                  result.path = '/' + result.search;
                } else {
                  result.path = null;
                }
                result.href = result.format();
                return result;
              }

              // if a url ENDs in . or .., then it must get a trailing slash.
              // however, if it ends in anything else non-slashy,
              // then it must NOT get a trailing slash.
              var last = srcPath.slice(-1)[0];
              var hasTrailingSlash = (
                (result.host || relative.host || srcPath.length > 1) &&
                (last === '.' || last === '..') || last === '');

              // strip single dots, resolve double dots to parent dir
              // if the path tries to go above the root, `up` ends up > 0
              var up = 0;
              for (var i = srcPath.length; i >= 0; i--) {
                last = srcPath[i];
                if (last === '.') {
                  srcPath.splice(i, 1);
                } else if (last === '..') {
                  srcPath.splice(i, 1);
                  up++;
                } else if (up) {
                  srcPath.splice(i, 1);
                  up--;
                }
              }

              // if the path is allowed to go above the root, restore leading ..s
              if (!mustEndAbs && !removeAllDots) {
                for (; up--; up) {
                  srcPath.unshift('..');
                }
              }

              if (mustEndAbs && srcPath[0] !== '' &&
                (!srcPath[0] || srcPath[0].charAt(0) !== '/')) {
                srcPath.unshift('');
              }

              if (hasTrailingSlash && (srcPath.join('/').substr(-1) !== '/')) {
                srcPath.push('');
              }

              var isAbsolute = srcPath[0] === '' ||
                (srcPath[0] && srcPath[0].charAt(0) === '/');

              // put the host back
              if (psychotic) {
                result.hostname = result.host = isAbsolute ? '' :
                  srcPath.length ? srcPath.shift() : '';
                //occationaly the auth can get stuck only in host
                //this especially happens in cases like
                //url.resolveObject('mailto:local1@domain1', 'local2@domain2')
                authInHost = result.host && result.host.indexOf('@') > 0 ?
                  result.host.split('@') : false;
                if (authInHost) {
                  result.auth = authInHost.shift();
                  result.host = result.hostname = authInHost.shift();
                }
              }

              mustEndAbs = mustEndAbs || (result.host && srcPath.length);

              if (mustEndAbs && !isAbsolute) {
                srcPath.unshift('');
              }

              if (!srcPath.length) {
                result.pathname = null;
                result.path = null;
              } else {
                result.pathname = srcPath.join('/');
              }

              //to support request.http
              if (!isNull(result.pathname) || !isNull(result.search)) {
                result.path = (result.pathname ? result.pathname : '') +
                  (result.search ? result.search : '');
              }
              result.auth = relative.auth || result.auth;
              result.slashes = result.slashes || relative.slashes;
              result.href = result.format();
              return result;
            };

            Url.prototype.parseHost = function() {
              return parseHost(this);
            };

            function parseHost(self) {
              var host = self.host;
              var port = portPattern.exec(host);
              if (port) {
                port = port[0];
                if (port !== ':') {
                  self.port = port.substr(1);
                }
                host = host.substr(0, host.length - port.length);
              }
              if (host) self.hostname = host;
            }

            var fileUrl = (str, opts) => {
            	if (typeof str !== 'string') {
            		throw new TypeError(`Expected a string, got ${typeof str}`);
            	}

            	opts = Object.assign({resolve: true}, opts);

            	let pathName = str;

            	if (opts.resolve) {
            		pathName = path.resolve(str);
            	}

            	pathName = pathName.replace(/\\/g, '/');

            	// Windows drive letter must be prefixed with a slash
            	if (pathName[0] !== '/') {
            		pathName = `/${pathName}`;
            	}

            	// Escape required characters for path components
            	// See: https://tools.ietf.org/html/rfc3986#section-3.3
            	return encodeURI(`file://${pathName}`).replace(/[?#]/g, encodeURIComponent);
            };

            /* -*- Mode: js; js-indent-level: 2; -*- */
            /*
             * Copyright 2011 Mozilla Foundation and contributors
             * Licensed under the New BSD license. See LICENSE or:
             * http://opensource.org/licenses/BSD-3-Clause
             */

            var intToCharMap = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'.split('');

            /**
             * Encode an integer in the range of 0 to 63 to a single base 64 digit.
             */
            var encode$1 = function (number) {
              if (0 <= number && number < intToCharMap.length) {
                return intToCharMap[number];
              }
              throw new TypeError("Must be between 0 and 63: " + number);
            };

            /**
             * Decode a single base 64 character code digit to an integer. Returns -1 on
             * failure.
             */
            var decode$1 = function (charCode) {
              var bigA = 65;     // 'A'
              var bigZ = 90;     // 'Z'

              var littleA = 97;  // 'a'
              var littleZ = 122; // 'z'

              var zero = 48;     // '0'
              var nine = 57;     // '9'

              var plus = 43;     // '+'
              var slash = 47;    // '/'

              var littleOffset = 26;
              var numberOffset = 52;

              // 0 - 25: ABCDEFGHIJKLMNOPQRSTUVWXYZ
              if (bigA <= charCode && charCode <= bigZ) {
                return (charCode - bigA);
              }

              // 26 - 51: abcdefghijklmnopqrstuvwxyz
              if (littleA <= charCode && charCode <= littleZ) {
                return (charCode - littleA + littleOffset);
              }

              // 52 - 61: 0123456789
              if (zero <= charCode && charCode <= nine) {
                return (charCode - zero + numberOffset);
              }

              // 62: +
              if (charCode == plus) {
                return 62;
              }

              // 63: /
              if (charCode == slash) {
                return 63;
              }

              // Invalid base64 digit.
              return -1;
            };

            var base64 = {
            	encode: encode$1,
            	decode: decode$1
            };

            /* -*- Mode: js; js-indent-level: 2; -*- */
            /*
             * Copyright 2011 Mozilla Foundation and contributors
             * Licensed under the New BSD license. See LICENSE or:
             * http://opensource.org/licenses/BSD-3-Clause
             *
             * Based on the Base 64 VLQ implementation in Closure Compiler:
             * https://code.google.com/p/closure-compiler/source/browse/trunk/src/com/google/debugging/sourcemap/Base64VLQ.java
             *
             * Copyright 2011 The Closure Compiler Authors. All rights reserved.
             * Redistribution and use in source and binary forms, with or without
             * modification, are permitted provided that the following conditions are
             * met:
             *
             *  * Redistributions of source code must retain the above copyright
             *    notice, this list of conditions and the following disclaimer.
             *  * Redistributions in binary form must reproduce the above
             *    copyright notice, this list of conditions and the following
             *    disclaimer in the documentation and/or other materials provided
             *    with the distribution.
             *  * Neither the name of Google Inc. nor the names of its
             *    contributors may be used to endorse or promote products derived
             *    from this software without specific prior written permission.
             *
             * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
             * "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
             * LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
             * A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
             * OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
             * SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
             * LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
             * DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
             * THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
             * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
             * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
             */



            // A single base 64 digit can contain 6 bits of data. For the base 64 variable
            // length quantities we use in the source map spec, the first bit is the sign,
            // the next four bits are the actual value, and the 6th bit is the
            // continuation bit. The continuation bit tells us whether there are more
            // digits in this value following this digit.
            //
            //   Continuation
            //   |    Sign
            //   |    |
            //   V    V
            //   101011

            var VLQ_BASE_SHIFT = 5;

            // binary: 100000
            var VLQ_BASE = 1 << VLQ_BASE_SHIFT;

            // binary: 011111
            var VLQ_BASE_MASK = VLQ_BASE - 1;

            // binary: 100000
            var VLQ_CONTINUATION_BIT = VLQ_BASE;

            /**
             * Converts from a two-complement value to a value where the sign bit is
             * placed in the least significant bit.  For example, as decimals:
             *   1 becomes 2 (10 binary), -1 becomes 3 (11 binary)
             *   2 becomes 4 (100 binary), -2 becomes 5 (101 binary)
             */
            function toVLQSigned(aValue) {
              return aValue < 0
                ? ((-aValue) << 1) + 1
                : (aValue << 1) + 0;
            }

            /**
             * Converts to a two-complement value from a value where the sign bit is
             * placed in the least significant bit.  For example, as decimals:
             *   2 (10 binary) becomes 1, 3 (11 binary) becomes -1
             *   4 (100 binary) becomes 2, 5 (101 binary) becomes -2
             */
            function fromVLQSigned(aValue) {
              var isNegative = (aValue & 1) === 1;
              var shifted = aValue >> 1;
              return isNegative
                ? -shifted
                : shifted;
            }

            /**
             * Returns the base 64 VLQ encoded value.
             */
            var encode$2 = function base64VLQ_encode(aValue) {
              var encoded = "";
              var digit;

              var vlq = toVLQSigned(aValue);

              do {
                digit = vlq & VLQ_BASE_MASK;
                vlq >>>= VLQ_BASE_SHIFT;
                if (vlq > 0) {
                  // There are still more digits in this value, so we must make sure the
                  // continuation bit is marked.
                  digit |= VLQ_CONTINUATION_BIT;
                }
                encoded += base64.encode(digit);
              } while (vlq > 0);

              return encoded;
            };

            /**
             * Decodes the next base 64 VLQ value from the given string and returns the
             * value and the rest of the string via the out parameter.
             */
            var decode$2 = function base64VLQ_decode(aStr, aIndex, aOutParam) {
              var strLen = aStr.length;
              var result = 0;
              var shift = 0;
              var continuation, digit;

              do {
                if (aIndex >= strLen) {
                  throw new Error("Expected more digits in base 64 VLQ value.");
                }

                digit = base64.decode(aStr.charCodeAt(aIndex++));
                if (digit === -1) {
                  throw new Error("Invalid base64 digit: " + aStr.charAt(aIndex - 1));
                }

                continuation = !!(digit & VLQ_CONTINUATION_BIT);
                digit &= VLQ_BASE_MASK;
                result = result + (digit << shift);
                shift += VLQ_BASE_SHIFT;
              } while (continuation);

              aOutParam.value = fromVLQSigned(result);
              aOutParam.rest = aIndex;
            };

            var base64Vlq = {
            	encode: encode$2,
            	decode: decode$2
            };

            var commonjsGlobal = typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

            function createCommonjsModule(fn, module) {
            	return module = { exports: {} }, fn(module, module.exports), module.exports;
            }

            var util$1 = createCommonjsModule(function (module, exports) {
            /* -*- Mode: js; js-indent-level: 2; -*- */
            /*
             * Copyright 2011 Mozilla Foundation and contributors
             * Licensed under the New BSD license. See LICENSE or:
             * http://opensource.org/licenses/BSD-3-Clause
             */

            /**
             * This is a helper function for getting values from parameter/options
             * objects.
             *
             * @param args The object we are extracting values from
             * @param name The name of the property we are getting.
             * @param defaultValue An optional value to return if the property is missing
             * from the object. If this is not specified and the property is missing, an
             * error will be thrown.
             */
            function getArg(aArgs, aName, aDefaultValue) {
              if (aName in aArgs) {
                return aArgs[aName];
              } else if (arguments.length === 3) {
                return aDefaultValue;
              } else {
                throw new Error('"' + aName + '" is a required argument.');
              }
            }
            exports.getArg = getArg;

            var urlRegexp = /^(?:([\w+\-.]+):)?\/\/(?:(\w+:\w+)@)?([\w.-]*)(?::(\d+))?(.*)$/;
            var dataUrlRegexp = /^data:.+\,.+$/;

            function urlParse(aUrl) {
              var match = aUrl.match(urlRegexp);
              if (!match) {
                return null;
              }
              return {
                scheme: match[1],
                auth: match[2],
                host: match[3],
                port: match[4],
                path: match[5]
              };
            }
            exports.urlParse = urlParse;

            function urlGenerate(aParsedUrl) {
              var url = '';
              if (aParsedUrl.scheme) {
                url += aParsedUrl.scheme + ':';
              }
              url += '//';
              if (aParsedUrl.auth) {
                url += aParsedUrl.auth + '@';
              }
              if (aParsedUrl.host) {
                url += aParsedUrl.host;
              }
              if (aParsedUrl.port) {
                url += ":" + aParsedUrl.port;
              }
              if (aParsedUrl.path) {
                url += aParsedUrl.path;
              }
              return url;
            }
            exports.urlGenerate = urlGenerate;

            /**
             * Normalizes a path, or the path portion of a URL:
             *
             * - Replaces consecutive slashes with one slash.
             * - Removes unnecessary '.' parts.
             * - Removes unnecessary '<dir>/..' parts.
             *
             * Based on code in the Node.js 'path' core module.
             *
             * @param aPath The path or url to normalize.
             */
            function normalize(aPath) {
              var path = aPath;
              var url = urlParse(aPath);
              if (url) {
                if (!url.path) {
                  return aPath;
                }
                path = url.path;
              }
              var isAbsolute = exports.isAbsolute(path);

              var parts = path.split(/\/+/);
              for (var part, up = 0, i = parts.length - 1; i >= 0; i--) {
                part = parts[i];
                if (part === '.') {
                  parts.splice(i, 1);
                } else if (part === '..') {
                  up++;
                } else if (up > 0) {
                  if (part === '') {
                    // The first part is blank if the path is absolute. Trying to go
                    // above the root is a no-op. Therefore we can remove all '..' parts
                    // directly after the root.
                    parts.splice(i + 1, up);
                    up = 0;
                  } else {
                    parts.splice(i, 2);
                    up--;
                  }
                }
              }
              path = parts.join('/');

              if (path === '') {
                path = isAbsolute ? '/' : '.';
              }

              if (url) {
                url.path = path;
                return urlGenerate(url);
              }
              return path;
            }
            exports.normalize = normalize;

            /**
             * Joins two paths/URLs.
             *
             * @param aRoot The root path or URL.
             * @param aPath The path or URL to be joined with the root.
             *
             * - If aPath is a URL or a data URI, aPath is returned, unless aPath is a
             *   scheme-relative URL: Then the scheme of aRoot, if any, is prepended
             *   first.
             * - Otherwise aPath is a path. If aRoot is a URL, then its path portion
             *   is updated with the result and aRoot is returned. Otherwise the result
             *   is returned.
             *   - If aPath is absolute, the result is aPath.
             *   - Otherwise the two paths are joined with a slash.
             * - Joining for example 'http://' and 'www.example.com' is also supported.
             */
            function join(aRoot, aPath) {
              if (aRoot === "") {
                aRoot = ".";
              }
              if (aPath === "") {
                aPath = ".";
              }
              var aPathUrl = urlParse(aPath);
              var aRootUrl = urlParse(aRoot);
              if (aRootUrl) {
                aRoot = aRootUrl.path || '/';
              }

              // `join(foo, '//www.example.org')`
              if (aPathUrl && !aPathUrl.scheme) {
                if (aRootUrl) {
                  aPathUrl.scheme = aRootUrl.scheme;
                }
                return urlGenerate(aPathUrl);
              }

              if (aPathUrl || aPath.match(dataUrlRegexp)) {
                return aPath;
              }

              // `join('http://', 'www.example.com')`
              if (aRootUrl && !aRootUrl.host && !aRootUrl.path) {
                aRootUrl.host = aPath;
                return urlGenerate(aRootUrl);
              }

              var joined = aPath.charAt(0) === '/'
                ? aPath
                : normalize(aRoot.replace(/\/+$/, '') + '/' + aPath);

              if (aRootUrl) {
                aRootUrl.path = joined;
                return urlGenerate(aRootUrl);
              }
              return joined;
            }
            exports.join = join;

            exports.isAbsolute = function (aPath) {
              return aPath.charAt(0) === '/' || urlRegexp.test(aPath);
            };

            /**
             * Make a path relative to a URL or another path.
             *
             * @param aRoot The root path or URL.
             * @param aPath The path or URL to be made relative to aRoot.
             */
            function relative(aRoot, aPath) {
              if (aRoot === "") {
                aRoot = ".";
              }

              aRoot = aRoot.replace(/\/$/, '');

              // It is possible for the path to be above the root. In this case, simply
              // checking whether the root is a prefix of the path won't work. Instead, we
              // need to remove components from the root one by one, until either we find
              // a prefix that fits, or we run out of components to remove.
              var level = 0;
              while (aPath.indexOf(aRoot + '/') !== 0) {
                var index = aRoot.lastIndexOf("/");
                if (index < 0) {
                  return aPath;
                }

                // If the only part of the root that is left is the scheme (i.e. http://,
                // file:///, etc.), one or more slashes (/), or simply nothing at all, we
                // have exhausted all components, so the path is not relative to the root.
                aRoot = aRoot.slice(0, index);
                if (aRoot.match(/^([^\/]+:\/)?\/*$/)) {
                  return aPath;
                }

                ++level;
              }

              // Make sure we add a "../" for each component we removed from the root.
              return Array(level + 1).join("../") + aPath.substr(aRoot.length + 1);
            }
            exports.relative = relative;

            var supportsNullProto = (function () {
              var obj = Object.create(null);
              return !('__proto__' in obj);
            }());

            function identity (s) {
              return s;
            }

            /**
             * Because behavior goes wacky when you set `__proto__` on objects, we
             * have to prefix all the strings in our set with an arbitrary character.
             *
             * See https://github.com/mozilla/source-map/pull/31 and
             * https://github.com/mozilla/source-map/issues/30
             *
             * @param String aStr
             */
            function toSetString(aStr) {
              if (isProtoString(aStr)) {
                return '$' + aStr;
              }

              return aStr;
            }
            exports.toSetString = supportsNullProto ? identity : toSetString;

            function fromSetString(aStr) {
              if (isProtoString(aStr)) {
                return aStr.slice(1);
              }

              return aStr;
            }
            exports.fromSetString = supportsNullProto ? identity : fromSetString;

            function isProtoString(s) {
              if (!s) {
                return false;
              }

              var length = s.length;

              if (length < 9 /* "__proto__".length */) {
                return false;
              }

              if (s.charCodeAt(length - 1) !== 95  /* '_' */ ||
                  s.charCodeAt(length - 2) !== 95  /* '_' */ ||
                  s.charCodeAt(length - 3) !== 111 /* 'o' */ ||
                  s.charCodeAt(length - 4) !== 116 /* 't' */ ||
                  s.charCodeAt(length - 5) !== 111 /* 'o' */ ||
                  s.charCodeAt(length - 6) !== 114 /* 'r' */ ||
                  s.charCodeAt(length - 7) !== 112 /* 'p' */ ||
                  s.charCodeAt(length - 8) !== 95  /* '_' */ ||
                  s.charCodeAt(length - 9) !== 95  /* '_' */) {
                return false;
              }

              for (var i = length - 10; i >= 0; i--) {
                if (s.charCodeAt(i) !== 36 /* '$' */) {
                  return false;
                }
              }

              return true;
            }

            /**
             * Comparator between two mappings where the original positions are compared.
             *
             * Optionally pass in `true` as `onlyCompareGenerated` to consider two
             * mappings with the same original source/line/column, but different generated
             * line and column the same. Useful when searching for a mapping with a
             * stubbed out mapping.
             */
            function compareByOriginalPositions(mappingA, mappingB, onlyCompareOriginal) {
              var cmp = strcmp(mappingA.source, mappingB.source);
              if (cmp !== 0) {
                return cmp;
              }

              cmp = mappingA.originalLine - mappingB.originalLine;
              if (cmp !== 0) {
                return cmp;
              }

              cmp = mappingA.originalColumn - mappingB.originalColumn;
              if (cmp !== 0 || onlyCompareOriginal) {
                return cmp;
              }

              cmp = mappingA.generatedColumn - mappingB.generatedColumn;
              if (cmp !== 0) {
                return cmp;
              }

              cmp = mappingA.generatedLine - mappingB.generatedLine;
              if (cmp !== 0) {
                return cmp;
              }

              return strcmp(mappingA.name, mappingB.name);
            }
            exports.compareByOriginalPositions = compareByOriginalPositions;

            /**
             * Comparator between two mappings with deflated source and name indices where
             * the generated positions are compared.
             *
             * Optionally pass in `true` as `onlyCompareGenerated` to consider two
             * mappings with the same generated line and column, but different
             * source/name/original line and column the same. Useful when searching for a
             * mapping with a stubbed out mapping.
             */
            function compareByGeneratedPositionsDeflated(mappingA, mappingB, onlyCompareGenerated) {
              var cmp = mappingA.generatedLine - mappingB.generatedLine;
              if (cmp !== 0) {
                return cmp;
              }

              cmp = mappingA.generatedColumn - mappingB.generatedColumn;
              if (cmp !== 0 || onlyCompareGenerated) {
                return cmp;
              }

              cmp = strcmp(mappingA.source, mappingB.source);
              if (cmp !== 0) {
                return cmp;
              }

              cmp = mappingA.originalLine - mappingB.originalLine;
              if (cmp !== 0) {
                return cmp;
              }

              cmp = mappingA.originalColumn - mappingB.originalColumn;
              if (cmp !== 0) {
                return cmp;
              }

              return strcmp(mappingA.name, mappingB.name);
            }
            exports.compareByGeneratedPositionsDeflated = compareByGeneratedPositionsDeflated;

            function strcmp(aStr1, aStr2) {
              if (aStr1 === aStr2) {
                return 0;
              }

              if (aStr1 === null) {
                return 1; // aStr2 !== null
              }

              if (aStr2 === null) {
                return -1; // aStr1 !== null
              }

              if (aStr1 > aStr2) {
                return 1;
              }

              return -1;
            }

            /**
             * Comparator between two mappings with inflated source and name strings where
             * the generated positions are compared.
             */
            function compareByGeneratedPositionsInflated(mappingA, mappingB) {
              var cmp = mappingA.generatedLine - mappingB.generatedLine;
              if (cmp !== 0) {
                return cmp;
              }

              cmp = mappingA.generatedColumn - mappingB.generatedColumn;
              if (cmp !== 0) {
                return cmp;
              }

              cmp = strcmp(mappingA.source, mappingB.source);
              if (cmp !== 0) {
                return cmp;
              }

              cmp = mappingA.originalLine - mappingB.originalLine;
              if (cmp !== 0) {
                return cmp;
              }

              cmp = mappingA.originalColumn - mappingB.originalColumn;
              if (cmp !== 0) {
                return cmp;
              }

              return strcmp(mappingA.name, mappingB.name);
            }
            exports.compareByGeneratedPositionsInflated = compareByGeneratedPositionsInflated;

            /**
             * Strip any JSON XSSI avoidance prefix from the string (as documented
             * in the source maps specification), and then parse the string as
             * JSON.
             */
            function parseSourceMapInput(str) {
              return JSON.parse(str.replace(/^\)]}'[^\n]*\n/, ''));
            }
            exports.parseSourceMapInput = parseSourceMapInput;

            /**
             * Compute the URL of a source given the the source root, the source's
             * URL, and the source map's URL.
             */
            function computeSourceURL(sourceRoot, sourceURL, sourceMapURL) {
              sourceURL = sourceURL || '';

              if (sourceRoot) {
                // This follows what Chrome does.
                if (sourceRoot[sourceRoot.length - 1] !== '/' && sourceURL[0] !== '/') {
                  sourceRoot += '/';
                }
                // The spec says:
                //   Line 4: An optional source root, useful for relocating source
                //   files on a server or removing repeated values in the
                //   “sources” entry.  This value is prepended to the individual
                //   entries in the “source” field.
                sourceURL = sourceRoot + sourceURL;
              }

              // Historically, SourceMapConsumer did not take the sourceMapURL as
              // a parameter.  This mode is still somewhat supported, which is why
              // this code block is conditional.  However, it's preferable to pass
              // the source map URL to SourceMapConsumer, so that this function
              // can implement the source URL resolution algorithm as outlined in
              // the spec.  This block is basically the equivalent of:
              //    new URL(sourceURL, sourceMapURL).toString()
              // ... except it avoids using URL, which wasn't available in the
              // older releases of node still supported by this library.
              //
              // The spec says:
              //   If the sources are not absolute URLs after prepending of the
              //   “sourceRoot”, the sources are resolved relative to the
              //   SourceMap (like resolving script src in a html document).
              if (sourceMapURL) {
                var parsed = urlParse(sourceMapURL);
                if (!parsed) {
                  throw new Error("sourceMapURL could not be parsed");
                }
                if (parsed.path) {
                  // Strip the last path component, but keep the "/".
                  var index = parsed.path.lastIndexOf('/');
                  if (index >= 0) {
                    parsed.path = parsed.path.substring(0, index + 1);
                  }
                }
                sourceURL = join(urlGenerate(parsed), sourceURL);
              }

              return normalize(sourceURL);
            }
            exports.computeSourceURL = computeSourceURL;
            });
            var util_1 = util$1.getArg;
            var util_2 = util$1.urlParse;
            var util_3 = util$1.urlGenerate;
            var util_4 = util$1.normalize;
            var util_5 = util$1.join;
            var util_6 = util$1.isAbsolute;
            var util_7 = util$1.relative;
            var util_8 = util$1.toSetString;
            var util_9 = util$1.fromSetString;
            var util_10 = util$1.compareByOriginalPositions;
            var util_11 = util$1.compareByGeneratedPositionsDeflated;
            var util_12 = util$1.compareByGeneratedPositionsInflated;
            var util_13 = util$1.parseSourceMapInput;
            var util_14 = util$1.computeSourceURL;

            /* -*- Mode: js; js-indent-level: 2; -*- */
            /*
             * Copyright 2011 Mozilla Foundation and contributors
             * Licensed under the New BSD license. See LICENSE or:
             * http://opensource.org/licenses/BSD-3-Clause
             */


            var has = Object.prototype.hasOwnProperty;
            var hasNativeMap = typeof Map !== "undefined";

            /**
             * A data structure which is a combination of an array and a set. Adding a new
             * member is O(1), testing for membership is O(1), and finding the index of an
             * element is O(1). Removing elements from the set is not supported. Only
             * strings are supported for membership.
             */
            function ArraySet() {
              this._array = [];
              this._set = hasNativeMap ? new Map() : Object.create(null);
            }

            /**
             * Static method for creating ArraySet instances from an existing array.
             */
            ArraySet.fromArray = function ArraySet_fromArray(aArray, aAllowDuplicates) {
              var set = new ArraySet();
              for (var i = 0, len = aArray.length; i < len; i++) {
                set.add(aArray[i], aAllowDuplicates);
              }
              return set;
            };

            /**
             * Return how many unique items are in this ArraySet. If duplicates have been
             * added, than those do not count towards the size.
             *
             * @returns Number
             */
            ArraySet.prototype.size = function ArraySet_size() {
              return hasNativeMap ? this._set.size : Object.getOwnPropertyNames(this._set).length;
            };

            /**
             * Add the given string to this set.
             *
             * @param String aStr
             */
            ArraySet.prototype.add = function ArraySet_add(aStr, aAllowDuplicates) {
              var sStr = hasNativeMap ? aStr : util$1.toSetString(aStr);
              var isDuplicate = hasNativeMap ? this.has(aStr) : has.call(this._set, sStr);
              var idx = this._array.length;
              if (!isDuplicate || aAllowDuplicates) {
                this._array.push(aStr);
              }
              if (!isDuplicate) {
                if (hasNativeMap) {
                  this._set.set(aStr, idx);
                } else {
                  this._set[sStr] = idx;
                }
              }
            };

            /**
             * Is the given string a member of this set?
             *
             * @param String aStr
             */
            ArraySet.prototype.has = function ArraySet_has(aStr) {
              if (hasNativeMap) {
                return this._set.has(aStr);
              } else {
                var sStr = util$1.toSetString(aStr);
                return has.call(this._set, sStr);
              }
            };

            /**
             * What is the index of the given string in the array?
             *
             * @param String aStr
             */
            ArraySet.prototype.indexOf = function ArraySet_indexOf(aStr) {
              if (hasNativeMap) {
                var idx = this._set.get(aStr);
                if (idx >= 0) {
                    return idx;
                }
              } else {
                var sStr = util$1.toSetString(aStr);
                if (has.call(this._set, sStr)) {
                  return this._set[sStr];
                }
              }

              throw new Error('"' + aStr + '" is not in the set.');
            };

            /**
             * What is the element at the given index?
             *
             * @param Number aIdx
             */
            ArraySet.prototype.at = function ArraySet_at(aIdx) {
              if (aIdx >= 0 && aIdx < this._array.length) {
                return this._array[aIdx];
              }
              throw new Error('No element indexed by ' + aIdx);
            };

            /**
             * Returns the array representation of this set (which has the proper indices
             * indicated by indexOf). Note that this is a copy of the internal array used
             * for storing the members so that no one can mess with internal state.
             */
            ArraySet.prototype.toArray = function ArraySet_toArray() {
              return this._array.slice();
            };

            var ArraySet_1 = ArraySet;

            var arraySet = {
            	ArraySet: ArraySet_1
            };

            /* -*- Mode: js; js-indent-level: 2; -*- */
            /*
             * Copyright 2014 Mozilla Foundation and contributors
             * Licensed under the New BSD license. See LICENSE or:
             * http://opensource.org/licenses/BSD-3-Clause
             */



            /**
             * Determine whether mappingB is after mappingA with respect to generated
             * position.
             */
            function generatedPositionAfter(mappingA, mappingB) {
              // Optimized for most common case
              var lineA = mappingA.generatedLine;
              var lineB = mappingB.generatedLine;
              var columnA = mappingA.generatedColumn;
              var columnB = mappingB.generatedColumn;
              return lineB > lineA || lineB == lineA && columnB >= columnA ||
                     util$1.compareByGeneratedPositionsInflated(mappingA, mappingB) <= 0;
            }

            /**
             * A data structure to provide a sorted view of accumulated mappings in a
             * performance conscious manner. It trades a neglibable overhead in general
             * case for a large speedup in case of mappings being added in order.
             */
            function MappingList() {
              this._array = [];
              this._sorted = true;
              // Serves as infimum
              this._last = {generatedLine: -1, generatedColumn: 0};
            }

            /**
             * Iterate through internal items. This method takes the same arguments that
             * `Array.prototype.forEach` takes.
             *
             * NOTE: The order of the mappings is NOT guaranteed.
             */
            MappingList.prototype.unsortedForEach =
              function MappingList_forEach(aCallback, aThisArg) {
                this._array.forEach(aCallback, aThisArg);
              };

            /**
             * Add the given source mapping.
             *
             * @param Object aMapping
             */
            MappingList.prototype.add = function MappingList_add(aMapping) {
              if (generatedPositionAfter(this._last, aMapping)) {
                this._last = aMapping;
                this._array.push(aMapping);
              } else {
                this._sorted = false;
                this._array.push(aMapping);
              }
            };

            /**
             * Returns the flat, sorted array of mappings. The mappings are sorted by
             * generated position.
             *
             * WARNING: This method returns internal data without copying, for
             * performance. The return value must NOT be mutated, and should be treated as
             * an immutable borrow. If you want to take ownership, you must make your own
             * copy.
             */
            MappingList.prototype.toArray = function MappingList_toArray() {
              if (!this._sorted) {
                this._array.sort(util$1.compareByGeneratedPositionsInflated);
                this._sorted = true;
              }
              return this._array;
            };

            var MappingList_1 = MappingList;

            var mappingList = {
            	MappingList: MappingList_1
            };

            /* -*- Mode: js; js-indent-level: 2; -*- */
            /*
             * Copyright 2011 Mozilla Foundation and contributors
             * Licensed under the New BSD license. See LICENSE or:
             * http://opensource.org/licenses/BSD-3-Clause
             */



            var ArraySet$1 = arraySet.ArraySet;
            var MappingList$1 = mappingList.MappingList;

            /**
             * An instance of the SourceMapGenerator represents a source map which is
             * being built incrementally. You may pass an object with the following
             * properties:
             *
             *   - file: The filename of the generated source.
             *   - sourceRoot: A root for all relative URLs in this source map.
             */
            function SourceMapGenerator(aArgs) {
              if (!aArgs) {
                aArgs = {};
              }
              this._file = util$1.getArg(aArgs, 'file', null);
              this._sourceRoot = util$1.getArg(aArgs, 'sourceRoot', null);
              this._skipValidation = util$1.getArg(aArgs, 'skipValidation', false);
              this._sources = new ArraySet$1();
              this._names = new ArraySet$1();
              this._mappings = new MappingList$1();
              this._sourcesContents = null;
            }

            SourceMapGenerator.prototype._version = 3;

            /**
             * Creates a new SourceMapGenerator based on a SourceMapConsumer
             *
             * @param aSourceMapConsumer The SourceMap.
             */
            SourceMapGenerator.fromSourceMap =
              function SourceMapGenerator_fromSourceMap(aSourceMapConsumer) {
                var sourceRoot = aSourceMapConsumer.sourceRoot;
                var generator = new SourceMapGenerator({
                  file: aSourceMapConsumer.file,
                  sourceRoot: sourceRoot
                });
                aSourceMapConsumer.eachMapping(function (mapping) {
                  var newMapping = {
                    generated: {
                      line: mapping.generatedLine,
                      column: mapping.generatedColumn
                    }
                  };

                  if (mapping.source != null) {
                    newMapping.source = mapping.source;
                    if (sourceRoot != null) {
                      newMapping.source = util$1.relative(sourceRoot, newMapping.source);
                    }

                    newMapping.original = {
                      line: mapping.originalLine,
                      column: mapping.originalColumn
                    };

                    if (mapping.name != null) {
                      newMapping.name = mapping.name;
                    }
                  }

                  generator.addMapping(newMapping);
                });
                aSourceMapConsumer.sources.forEach(function (sourceFile) {
                  var sourceRelative = sourceFile;
                  if (sourceRoot !== null) {
                    sourceRelative = util$1.relative(sourceRoot, sourceFile);
                  }

                  if (!generator._sources.has(sourceRelative)) {
                    generator._sources.add(sourceRelative);
                  }

                  var content = aSourceMapConsumer.sourceContentFor(sourceFile);
                  if (content != null) {
                    generator.setSourceContent(sourceFile, content);
                  }
                });
                return generator;
              };

            /**
             * Add a single mapping from original source line and column to the generated
             * source's line and column for this source map being created. The mapping
             * object should have the following properties:
             *
             *   - generated: An object with the generated line and column positions.
             *   - original: An object with the original line and column positions.
             *   - source: The original source file (relative to the sourceRoot).
             *   - name: An optional original token name for this mapping.
             */
            SourceMapGenerator.prototype.addMapping =
              function SourceMapGenerator_addMapping(aArgs) {
                var generated = util$1.getArg(aArgs, 'generated');
                var original = util$1.getArg(aArgs, 'original', null);
                var source = util$1.getArg(aArgs, 'source', null);
                var name = util$1.getArg(aArgs, 'name', null);

                if (!this._skipValidation) {
                  this._validateMapping(generated, original, source, name);
                }

                if (source != null) {
                  source = String(source);
                  if (!this._sources.has(source)) {
                    this._sources.add(source);
                  }
                }

                if (name != null) {
                  name = String(name);
                  if (!this._names.has(name)) {
                    this._names.add(name);
                  }
                }

                this._mappings.add({
                  generatedLine: generated.line,
                  generatedColumn: generated.column,
                  originalLine: original != null && original.line,
                  originalColumn: original != null && original.column,
                  source: source,
                  name: name
                });
              };

            /**
             * Set the source content for a source file.
             */
            SourceMapGenerator.prototype.setSourceContent =
              function SourceMapGenerator_setSourceContent(aSourceFile, aSourceContent) {
                var source = aSourceFile;
                if (this._sourceRoot != null) {
                  source = util$1.relative(this._sourceRoot, source);
                }

                if (aSourceContent != null) {
                  // Add the source content to the _sourcesContents map.
                  // Create a new _sourcesContents map if the property is null.
                  if (!this._sourcesContents) {
                    this._sourcesContents = Object.create(null);
                  }
                  this._sourcesContents[util$1.toSetString(source)] = aSourceContent;
                } else if (this._sourcesContents) {
                  // Remove the source file from the _sourcesContents map.
                  // If the _sourcesContents map is empty, set the property to null.
                  delete this._sourcesContents[util$1.toSetString(source)];
                  if (Object.keys(this._sourcesContents).length === 0) {
                    this._sourcesContents = null;
                  }
                }
              };

            /**
             * Applies the mappings of a sub-source-map for a specific source file to the
             * source map being generated. Each mapping to the supplied source file is
             * rewritten using the supplied source map. Note: The resolution for the
             * resulting mappings is the minimium of this map and the supplied map.
             *
             * @param aSourceMapConsumer The source map to be applied.
             * @param aSourceFile Optional. The filename of the source file.
             *        If omitted, SourceMapConsumer's file property will be used.
             * @param aSourceMapPath Optional. The dirname of the path to the source map
             *        to be applied. If relative, it is relative to the SourceMapConsumer.
             *        This parameter is needed when the two source maps aren't in the same
             *        directory, and the source map to be applied contains relative source
             *        paths. If so, those relative source paths need to be rewritten
             *        relative to the SourceMapGenerator.
             */
            SourceMapGenerator.prototype.applySourceMap =
              function SourceMapGenerator_applySourceMap(aSourceMapConsumer, aSourceFile, aSourceMapPath) {
                var sourceFile = aSourceFile;
                // If aSourceFile is omitted, we will use the file property of the SourceMap
                if (aSourceFile == null) {
                  if (aSourceMapConsumer.file == null) {
                    throw new Error(
                      'SourceMapGenerator.prototype.applySourceMap requires either an explicit source file, ' +
                      'or the source map\'s "file" property. Both were omitted.'
                    );
                  }
                  sourceFile = aSourceMapConsumer.file;
                }
                var sourceRoot = this._sourceRoot;
                // Make "sourceFile" relative if an absolute Url is passed.
                if (sourceRoot != null) {
                  sourceFile = util$1.relative(sourceRoot, sourceFile);
                }
                // Applying the SourceMap can add and remove items from the sources and
                // the names array.
                var newSources = new ArraySet$1();
                var newNames = new ArraySet$1();

                // Find mappings for the "sourceFile"
                this._mappings.unsortedForEach(function (mapping) {
                  if (mapping.source === sourceFile && mapping.originalLine != null) {
                    // Check if it can be mapped by the source map, then update the mapping.
                    var original = aSourceMapConsumer.originalPositionFor({
                      line: mapping.originalLine,
                      column: mapping.originalColumn
                    });
                    if (original.source != null) {
                      // Copy mapping
                      mapping.source = original.source;
                      if (aSourceMapPath != null) {
                        mapping.source = util$1.join(aSourceMapPath, mapping.source);
                      }
                      if (sourceRoot != null) {
                        mapping.source = util$1.relative(sourceRoot, mapping.source);
                      }
                      mapping.originalLine = original.line;
                      mapping.originalColumn = original.column;
                      if (original.name != null) {
                        mapping.name = original.name;
                      }
                    }
                  }

                  var source = mapping.source;
                  if (source != null && !newSources.has(source)) {
                    newSources.add(source);
                  }

                  var name = mapping.name;
                  if (name != null && !newNames.has(name)) {
                    newNames.add(name);
                  }

                }, this);
                this._sources = newSources;
                this._names = newNames;

                // Copy sourcesContents of applied map.
                aSourceMapConsumer.sources.forEach(function (sourceFile) {
                  var content = aSourceMapConsumer.sourceContentFor(sourceFile);
                  if (content != null) {
                    if (aSourceMapPath != null) {
                      sourceFile = util$1.join(aSourceMapPath, sourceFile);
                    }
                    if (sourceRoot != null) {
                      sourceFile = util$1.relative(sourceRoot, sourceFile);
                    }
                    this.setSourceContent(sourceFile, content);
                  }
                }, this);
              };

            /**
             * A mapping can have one of the three levels of data:
             *
             *   1. Just the generated position.
             *   2. The Generated position, original position, and original source.
             *   3. Generated and original position, original source, as well as a name
             *      token.
             *
             * To maintain consistency, we validate that any new mapping being added falls
             * in to one of these categories.
             */
            SourceMapGenerator.prototype._validateMapping =
              function SourceMapGenerator_validateMapping(aGenerated, aOriginal, aSource,
                                                          aName) {
                // When aOriginal is truthy but has empty values for .line and .column,
                // it is most likely a programmer error. In this case we throw a very
                // specific error message to try to guide them the right way.
                // For example: https://github.com/Polymer/polymer-bundler/pull/519
                if (aOriginal && typeof aOriginal.line !== 'number' && typeof aOriginal.column !== 'number') {
                    throw new Error(
                        'original.line and original.column are not numbers -- you probably meant to omit ' +
                        'the original mapping entirely and only map the generated position. If so, pass ' +
                        'null for the original mapping instead of an object with empty or null values.'
                    );
                }

                if (aGenerated && 'line' in aGenerated && 'column' in aGenerated
                    && aGenerated.line > 0 && aGenerated.column >= 0
                    && !aOriginal && !aSource && !aName) {
                  // Case 1.
                  return;
                }
                else if (aGenerated && 'line' in aGenerated && 'column' in aGenerated
                         && aOriginal && 'line' in aOriginal && 'column' in aOriginal
                         && aGenerated.line > 0 && aGenerated.column >= 0
                         && aOriginal.line > 0 && aOriginal.column >= 0
                         && aSource) {
                  // Cases 2 and 3.
                  return;
                }
                else {
                  throw new Error('Invalid mapping: ' + JSON.stringify({
                    generated: aGenerated,
                    source: aSource,
                    original: aOriginal,
                    name: aName
                  }));
                }
              };

            /**
             * Serialize the accumulated mappings in to the stream of base 64 VLQs
             * specified by the source map format.
             */
            SourceMapGenerator.prototype._serializeMappings =
              function SourceMapGenerator_serializeMappings() {
                var previousGeneratedColumn = 0;
                var previousGeneratedLine = 1;
                var previousOriginalColumn = 0;
                var previousOriginalLine = 0;
                var previousName = 0;
                var previousSource = 0;
                var result = '';
                var next;
                var mapping;
                var nameIdx;
                var sourceIdx;

                var mappings = this._mappings.toArray();
                for (var i = 0, len = mappings.length; i < len; i++) {
                  mapping = mappings[i];
                  next = '';

                  if (mapping.generatedLine !== previousGeneratedLine) {
                    previousGeneratedColumn = 0;
                    while (mapping.generatedLine !== previousGeneratedLine) {
                      next += ';';
                      previousGeneratedLine++;
                    }
                  }
                  else {
                    if (i > 0) {
                      if (!util$1.compareByGeneratedPositionsInflated(mapping, mappings[i - 1])) {
                        continue;
                      }
                      next += ',';
                    }
                  }

                  next += base64Vlq.encode(mapping.generatedColumn
                                             - previousGeneratedColumn);
                  previousGeneratedColumn = mapping.generatedColumn;

                  if (mapping.source != null) {
                    sourceIdx = this._sources.indexOf(mapping.source);
                    next += base64Vlq.encode(sourceIdx - previousSource);
                    previousSource = sourceIdx;

                    // lines are stored 0-based in SourceMap spec version 3
                    next += base64Vlq.encode(mapping.originalLine - 1
                                               - previousOriginalLine);
                    previousOriginalLine = mapping.originalLine - 1;

                    next += base64Vlq.encode(mapping.originalColumn
                                               - previousOriginalColumn);
                    previousOriginalColumn = mapping.originalColumn;

                    if (mapping.name != null) {
                      nameIdx = this._names.indexOf(mapping.name);
                      next += base64Vlq.encode(nameIdx - previousName);
                      previousName = nameIdx;
                    }
                  }

                  result += next;
                }

                return result;
              };

            SourceMapGenerator.prototype._generateSourcesContent =
              function SourceMapGenerator_generateSourcesContent(aSources, aSourceRoot) {
                return aSources.map(function (source) {
                  if (!this._sourcesContents) {
                    return null;
                  }
                  if (aSourceRoot != null) {
                    source = util$1.relative(aSourceRoot, source);
                  }
                  var key = util$1.toSetString(source);
                  return Object.prototype.hasOwnProperty.call(this._sourcesContents, key)
                    ? this._sourcesContents[key]
                    : null;
                }, this);
              };

            /**
             * Externalize the source map.
             */
            SourceMapGenerator.prototype.toJSON =
              function SourceMapGenerator_toJSON() {
                var map = {
                  version: this._version,
                  sources: this._sources.toArray(),
                  names: this._names.toArray(),
                  mappings: this._serializeMappings()
                };
                if (this._file != null) {
                  map.file = this._file;
                }
                if (this._sourceRoot != null) {
                  map.sourceRoot = this._sourceRoot;
                }
                if (this._sourcesContents) {
                  map.sourcesContent = this._generateSourcesContent(map.sources, map.sourceRoot);
                }

                return map;
              };

            /**
             * Render the source map being generated to a string.
             */
            SourceMapGenerator.prototype.toString =
              function SourceMapGenerator_toString() {
                return JSON.stringify(this.toJSON());
              };

            var SourceMapGenerator_1 = SourceMapGenerator;

            var sourceMapGenerator = {
            	SourceMapGenerator: SourceMapGenerator_1
            };

            var binarySearch = createCommonjsModule(function (module, exports) {
            /* -*- Mode: js; js-indent-level: 2; -*- */
            /*
             * Copyright 2011 Mozilla Foundation and contributors
             * Licensed under the New BSD license. See LICENSE or:
             * http://opensource.org/licenses/BSD-3-Clause
             */

            exports.GREATEST_LOWER_BOUND = 1;
            exports.LEAST_UPPER_BOUND = 2;

            /**
             * Recursive implementation of binary search.
             *
             * @param aLow Indices here and lower do not contain the needle.
             * @param aHigh Indices here and higher do not contain the needle.
             * @param aNeedle The element being searched for.
             * @param aHaystack The non-empty array being searched.
             * @param aCompare Function which takes two elements and returns -1, 0, or 1.
             * @param aBias Either 'binarySearch.GREATEST_LOWER_BOUND' or
             *     'binarySearch.LEAST_UPPER_BOUND'. Specifies whether to return the
             *     closest element that is smaller than or greater than the one we are
             *     searching for, respectively, if the exact element cannot be found.
             */
            function recursiveSearch(aLow, aHigh, aNeedle, aHaystack, aCompare, aBias) {
              // This function terminates when one of the following is true:
              //
              //   1. We find the exact element we are looking for.
              //
              //   2. We did not find the exact element, but we can return the index of
              //      the next-closest element.
              //
              //   3. We did not find the exact element, and there is no next-closest
              //      element than the one we are searching for, so we return -1.
              var mid = Math.floor((aHigh - aLow) / 2) + aLow;
              var cmp = aCompare(aNeedle, aHaystack[mid], true);
              if (cmp === 0) {
                // Found the element we are looking for.
                return mid;
              }
              else if (cmp > 0) {
                // Our needle is greater than aHaystack[mid].
                if (aHigh - mid > 1) {
                  // The element is in the upper half.
                  return recursiveSearch(mid, aHigh, aNeedle, aHaystack, aCompare, aBias);
                }

                // The exact needle element was not found in this haystack. Determine if
                // we are in termination case (3) or (2) and return the appropriate thing.
                if (aBias == exports.LEAST_UPPER_BOUND) {
                  return aHigh < aHaystack.length ? aHigh : -1;
                } else {
                  return mid;
                }
              }
              else {
                // Our needle is less than aHaystack[mid].
                if (mid - aLow > 1) {
                  // The element is in the lower half.
                  return recursiveSearch(aLow, mid, aNeedle, aHaystack, aCompare, aBias);
                }

                // we are in termination case (3) or (2) and return the appropriate thing.
                if (aBias == exports.LEAST_UPPER_BOUND) {
                  return mid;
                } else {
                  return aLow < 0 ? -1 : aLow;
                }
              }
            }

            /**
             * This is an implementation of binary search which will always try and return
             * the index of the closest element if there is no exact hit. This is because
             * mappings between original and generated line/col pairs are single points,
             * and there is an implicit region between each of them, so a miss just means
             * that you aren't on the very start of a region.
             *
             * @param aNeedle The element you are looking for.
             * @param aHaystack The array that is being searched.
             * @param aCompare A function which takes the needle and an element in the
             *     array and returns -1, 0, or 1 depending on whether the needle is less
             *     than, equal to, or greater than the element, respectively.
             * @param aBias Either 'binarySearch.GREATEST_LOWER_BOUND' or
             *     'binarySearch.LEAST_UPPER_BOUND'. Specifies whether to return the
             *     closest element that is smaller than or greater than the one we are
             *     searching for, respectively, if the exact element cannot be found.
             *     Defaults to 'binarySearch.GREATEST_LOWER_BOUND'.
             */
            exports.search = function search(aNeedle, aHaystack, aCompare, aBias) {
              if (aHaystack.length === 0) {
                return -1;
              }

              var index = recursiveSearch(-1, aHaystack.length, aNeedle, aHaystack,
                                          aCompare, aBias || exports.GREATEST_LOWER_BOUND);
              if (index < 0) {
                return -1;
              }

              // We have found either the exact element, or the next-closest element than
              // the one we are searching for. However, there may be more than one such
              // element. Make sure we always return the smallest of these.
              while (index - 1 >= 0) {
                if (aCompare(aHaystack[index], aHaystack[index - 1], true) !== 0) {
                  break;
                }
                --index;
              }

              return index;
            };
            });
            var binarySearch_1 = binarySearch.GREATEST_LOWER_BOUND;
            var binarySearch_2 = binarySearch.LEAST_UPPER_BOUND;
            var binarySearch_3 = binarySearch.search;

            /* -*- Mode: js; js-indent-level: 2; -*- */
            /*
             * Copyright 2011 Mozilla Foundation and contributors
             * Licensed under the New BSD license. See LICENSE or:
             * http://opensource.org/licenses/BSD-3-Clause
             */

            // It turns out that some (most?) JavaScript engines don't self-host
            // `Array.prototype.sort`. This makes sense because C++ will likely remain
            // faster than JS when doing raw CPU-intensive sorting. However, when using a
            // custom comparator function, calling back and forth between the VM's C++ and
            // JIT'd JS is rather slow *and* loses JIT type information, resulting in
            // worse generated code for the comparator function than would be optimal. In
            // fact, when sorting with a comparator, these costs outweigh the benefits of
            // sorting in C++. By using our own JS-implemented Quick Sort (below), we get
            // a ~3500ms mean speed-up in `bench/bench.html`.

            /**
             * Swap the elements indexed by `x` and `y` in the array `ary`.
             *
             * @param {Array} ary
             *        The array.
             * @param {Number} x
             *        The index of the first item.
             * @param {Number} y
             *        The index of the second item.
             */
            function swap$1(ary, x, y) {
              var temp = ary[x];
              ary[x] = ary[y];
              ary[y] = temp;
            }

            /**
             * Returns a random integer within the range `low .. high` inclusive.
             *
             * @param {Number} low
             *        The lower bound on the range.
             * @param {Number} high
             *        The upper bound on the range.
             */
            function randomIntInRange(low, high) {
              return Math.round(low + (Math.random() * (high - low)));
            }

            /**
             * The Quick Sort algorithm.
             *
             * @param {Array} ary
             *        An array to sort.
             * @param {function} comparator
             *        Function to use to compare two items.
             * @param {Number} p
             *        Start index of the array
             * @param {Number} r
             *        End index of the array
             */
            function doQuickSort(ary, comparator, p, r) {
              // If our lower bound is less than our upper bound, we (1) partition the
              // array into two pieces and (2) recurse on each half. If it is not, this is
              // the empty array and our base case.

              if (p < r) {
                // (1) Partitioning.
                //
                // The partitioning chooses a pivot between `p` and `r` and moves all
                // elements that are less than or equal to the pivot to the before it, and
                // all the elements that are greater than it after it. The effect is that
                // once partition is done, the pivot is in the exact place it will be when
                // the array is put in sorted order, and it will not need to be moved
                // again. This runs in O(n) time.

                // Always choose a random pivot so that an input array which is reverse
                // sorted does not cause O(n^2) running time.
                var pivotIndex = randomIntInRange(p, r);
                var i = p - 1;

                swap$1(ary, pivotIndex, r);
                var pivot = ary[r];

                // Immediately after `j` is incremented in this loop, the following hold
                // true:
                //
                //   * Every element in `ary[p .. i]` is less than or equal to the pivot.
                //
                //   * Every element in `ary[i+1 .. j-1]` is greater than the pivot.
                for (var j = p; j < r; j++) {
                  if (comparator(ary[j], pivot) <= 0) {
                    i += 1;
                    swap$1(ary, i, j);
                  }
                }

                swap$1(ary, i + 1, j);
                var q = i + 1;

                // (2) Recurse on each half.

                doQuickSort(ary, comparator, p, q - 1);
                doQuickSort(ary, comparator, q + 1, r);
              }
            }

            /**
             * Sort the given array in-place with the given comparator function.
             *
             * @param {Array} ary
             *        An array to sort.
             * @param {function} comparator
             *        Function to use to compare two items.
             */
            var quickSort_1 = function (ary, comparator) {
              doQuickSort(ary, comparator, 0, ary.length - 1);
            };

            var quickSort = {
            	quickSort: quickSort_1
            };

            /* -*- Mode: js; js-indent-level: 2; -*- */
            /*
             * Copyright 2011 Mozilla Foundation and contributors
             * Licensed under the New BSD license. See LICENSE or:
             * http://opensource.org/licenses/BSD-3-Clause
             */



            var ArraySet$2 = arraySet.ArraySet;

            var quickSort$1 = quickSort.quickSort;

            function SourceMapConsumer(aSourceMap, aSourceMapURL) {
              var sourceMap = aSourceMap;
              if (typeof aSourceMap === 'string') {
                sourceMap = util$1.parseSourceMapInput(aSourceMap);
              }

              return sourceMap.sections != null
                ? new IndexedSourceMapConsumer(sourceMap, aSourceMapURL)
                : new BasicSourceMapConsumer(sourceMap, aSourceMapURL);
            }

            SourceMapConsumer.fromSourceMap = function(aSourceMap, aSourceMapURL) {
              return BasicSourceMapConsumer.fromSourceMap(aSourceMap, aSourceMapURL);
            };

            /**
             * The version of the source mapping spec that we are consuming.
             */
            SourceMapConsumer.prototype._version = 3;

            // `__generatedMappings` and `__originalMappings` are arrays that hold the
            // parsed mapping coordinates from the source map's "mappings" attribute. They
            // are lazily instantiated, accessed via the `_generatedMappings` and
            // `_originalMappings` getters respectively, and we only parse the mappings
            // and create these arrays once queried for a source location. We jump through
            // these hoops because there can be many thousands of mappings, and parsing
            // them is expensive, so we only want to do it if we must.
            //
            // Each object in the arrays is of the form:
            //
            //     {
            //       generatedLine: The line number in the generated code,
            //       generatedColumn: The column number in the generated code,
            //       source: The path to the original source file that generated this
            //               chunk of code,
            //       originalLine: The line number in the original source that
            //                     corresponds to this chunk of generated code,
            //       originalColumn: The column number in the original source that
            //                       corresponds to this chunk of generated code,
            //       name: The name of the original symbol which generated this chunk of
            //             code.
            //     }
            //
            // All properties except for `generatedLine` and `generatedColumn` can be
            // `null`.
            //
            // `_generatedMappings` is ordered by the generated positions.
            //
            // `_originalMappings` is ordered by the original positions.

            SourceMapConsumer.prototype.__generatedMappings = null;
            Object.defineProperty(SourceMapConsumer.prototype, '_generatedMappings', {
              configurable: true,
              enumerable: true,
              get: function () {
                if (!this.__generatedMappings) {
                  this._parseMappings(this._mappings, this.sourceRoot);
                }

                return this.__generatedMappings;
              }
            });

            SourceMapConsumer.prototype.__originalMappings = null;
            Object.defineProperty(SourceMapConsumer.prototype, '_originalMappings', {
              configurable: true,
              enumerable: true,
              get: function () {
                if (!this.__originalMappings) {
                  this._parseMappings(this._mappings, this.sourceRoot);
                }

                return this.__originalMappings;
              }
            });

            SourceMapConsumer.prototype._charIsMappingSeparator =
              function SourceMapConsumer_charIsMappingSeparator(aStr, index) {
                var c = aStr.charAt(index);
                return c === ";" || c === ",";
              };

            /**
             * Parse the mappings in a string in to a data structure which we can easily
             * query (the ordered arrays in the `this.__generatedMappings` and
             * `this.__originalMappings` properties).
             */
            SourceMapConsumer.prototype._parseMappings =
              function SourceMapConsumer_parseMappings(aStr, aSourceRoot) {
                throw new Error("Subclasses must implement _parseMappings");
              };

            SourceMapConsumer.GENERATED_ORDER = 1;
            SourceMapConsumer.ORIGINAL_ORDER = 2;

            SourceMapConsumer.GREATEST_LOWER_BOUND = 1;
            SourceMapConsumer.LEAST_UPPER_BOUND = 2;

            /**
             * Iterate over each mapping between an original source/line/column and a
             * generated line/column in this source map.
             *
             * @param Function aCallback
             *        The function that is called with each mapping.
             * @param Object aContext
             *        Optional. If specified, this object will be the value of `this` every
             *        time that `aCallback` is called.
             * @param aOrder
             *        Either `SourceMapConsumer.GENERATED_ORDER` or
             *        `SourceMapConsumer.ORIGINAL_ORDER`. Specifies whether you want to
             *        iterate over the mappings sorted by the generated file's line/column
             *        order or the original's source/line/column order, respectively. Defaults to
             *        `SourceMapConsumer.GENERATED_ORDER`.
             */
            SourceMapConsumer.prototype.eachMapping =
              function SourceMapConsumer_eachMapping(aCallback, aContext, aOrder) {
                var context = aContext || null;
                var order = aOrder || SourceMapConsumer.GENERATED_ORDER;

                var mappings;
                switch (order) {
                case SourceMapConsumer.GENERATED_ORDER:
                  mappings = this._generatedMappings;
                  break;
                case SourceMapConsumer.ORIGINAL_ORDER:
                  mappings = this._originalMappings;
                  break;
                default:
                  throw new Error("Unknown order of iteration.");
                }

                var sourceRoot = this.sourceRoot;
                mappings.map(function (mapping) {
                  var source = mapping.source === null ? null : this._sources.at(mapping.source);
                  source = util$1.computeSourceURL(sourceRoot, source, this._sourceMapURL);
                  return {
                    source: source,
                    generatedLine: mapping.generatedLine,
                    generatedColumn: mapping.generatedColumn,
                    originalLine: mapping.originalLine,
                    originalColumn: mapping.originalColumn,
                    name: mapping.name === null ? null : this._names.at(mapping.name)
                  };
                }, this).forEach(aCallback, context);
              };

            /**
             * Returns all generated line and column information for the original source,
             * line, and column provided. If no column is provided, returns all mappings
             * corresponding to a either the line we are searching for or the next
             * closest line that has any mappings. Otherwise, returns all mappings
             * corresponding to the given line and either the column we are searching for
             * or the next closest column that has any offsets.
             *
             * The only argument is an object with the following properties:
             *
             *   - source: The filename of the original source.
             *   - line: The line number in the original source.  The line number is 1-based.
             *   - column: Optional. the column number in the original source.
             *    The column number is 0-based.
             *
             * and an array of objects is returned, each with the following properties:
             *
             *   - line: The line number in the generated source, or null.  The
             *    line number is 1-based.
             *   - column: The column number in the generated source, or null.
             *    The column number is 0-based.
             */
            SourceMapConsumer.prototype.allGeneratedPositionsFor =
              function SourceMapConsumer_allGeneratedPositionsFor(aArgs) {
                var line = util$1.getArg(aArgs, 'line');

                // When there is no exact match, BasicSourceMapConsumer.prototype._findMapping
                // returns the index of the closest mapping less than the needle. By
                // setting needle.originalColumn to 0, we thus find the last mapping for
                // the given line, provided such a mapping exists.
                var needle = {
                  source: util$1.getArg(aArgs, 'source'),
                  originalLine: line,
                  originalColumn: util$1.getArg(aArgs, 'column', 0)
                };

                needle.source = this._findSourceIndex(needle.source);
                if (needle.source < 0) {
                  return [];
                }

                var mappings = [];

                var index = this._findMapping(needle,
                                              this._originalMappings,
                                              "originalLine",
                                              "originalColumn",
                                              util$1.compareByOriginalPositions,
                                              binarySearch.LEAST_UPPER_BOUND);
                if (index >= 0) {
                  var mapping = this._originalMappings[index];

                  if (aArgs.column === undefined) {
                    var originalLine = mapping.originalLine;

                    // Iterate until either we run out of mappings, or we run into
                    // a mapping for a different line than the one we found. Since
                    // mappings are sorted, this is guaranteed to find all mappings for
                    // the line we found.
                    while (mapping && mapping.originalLine === originalLine) {
                      mappings.push({
                        line: util$1.getArg(mapping, 'generatedLine', null),
                        column: util$1.getArg(mapping, 'generatedColumn', null),
                        lastColumn: util$1.getArg(mapping, 'lastGeneratedColumn', null)
                      });

                      mapping = this._originalMappings[++index];
                    }
                  } else {
                    var originalColumn = mapping.originalColumn;

                    // Iterate until either we run out of mappings, or we run into
                    // a mapping for a different line than the one we were searching for.
                    // Since mappings are sorted, this is guaranteed to find all mappings for
                    // the line we are searching for.
                    while (mapping &&
                           mapping.originalLine === line &&
                           mapping.originalColumn == originalColumn) {
                      mappings.push({
                        line: util$1.getArg(mapping, 'generatedLine', null),
                        column: util$1.getArg(mapping, 'generatedColumn', null),
                        lastColumn: util$1.getArg(mapping, 'lastGeneratedColumn', null)
                      });

                      mapping = this._originalMappings[++index];
                    }
                  }
                }

                return mappings;
              };

            var SourceMapConsumer_1 = SourceMapConsumer;

            /**
             * A BasicSourceMapConsumer instance represents a parsed source map which we can
             * query for information about the original file positions by giving it a file
             * position in the generated source.
             *
             * The first parameter is the raw source map (either as a JSON string, or
             * already parsed to an object). According to the spec, source maps have the
             * following attributes:
             *
             *   - version: Which version of the source map spec this map is following.
             *   - sources: An array of URLs to the original source files.
             *   - names: An array of identifiers which can be referrenced by individual mappings.
             *   - sourceRoot: Optional. The URL root from which all sources are relative.
             *   - sourcesContent: Optional. An array of contents of the original source files.
             *   - mappings: A string of base64 VLQs which contain the actual mappings.
             *   - file: Optional. The generated file this source map is associated with.
             *
             * Here is an example source map, taken from the source map spec[0]:
             *
             *     {
             *       version : 3,
             *       file: "out.js",
             *       sourceRoot : "",
             *       sources: ["foo.js", "bar.js"],
             *       names: ["src", "maps", "are", "fun"],
             *       mappings: "AA,AB;;ABCDE;"
             *     }
             *
             * The second parameter, if given, is a string whose value is the URL
             * at which the source map was found.  This URL is used to compute the
             * sources array.
             *
             * [0]: https://docs.google.com/document/d/1U1RGAehQwRypUTovF1KRlpiOFze0b-_2gc6fAH0KY0k/edit?pli=1#
             */
            function BasicSourceMapConsumer(aSourceMap, aSourceMapURL) {
              var sourceMap = aSourceMap;
              if (typeof aSourceMap === 'string') {
                sourceMap = util$1.parseSourceMapInput(aSourceMap);
              }

              var version = util$1.getArg(sourceMap, 'version');
              var sources = util$1.getArg(sourceMap, 'sources');
              // Sass 3.3 leaves out the 'names' array, so we deviate from the spec (which
              // requires the array) to play nice here.
              var names = util$1.getArg(sourceMap, 'names', []);
              var sourceRoot = util$1.getArg(sourceMap, 'sourceRoot', null);
              var sourcesContent = util$1.getArg(sourceMap, 'sourcesContent', null);
              var mappings = util$1.getArg(sourceMap, 'mappings');
              var file = util$1.getArg(sourceMap, 'file', null);

              // Once again, Sass deviates from the spec and supplies the version as a
              // string rather than a number, so we use loose equality checking here.
              if (version != this._version) {
                throw new Error('Unsupported version: ' + version);
              }

              if (sourceRoot) {
                sourceRoot = util$1.normalize(sourceRoot);
              }

              sources = sources
                .map(String)
                // Some source maps produce relative source paths like "./foo.js" instead of
                // "foo.js".  Normalize these first so that future comparisons will succeed.
                // See bugzil.la/1090768.
                .map(util$1.normalize)
                // Always ensure that absolute sources are internally stored relative to
                // the source root, if the source root is absolute. Not doing this would
                // be particularly problematic when the source root is a prefix of the
                // source (valid, but why??). See github issue #199 and bugzil.la/1188982.
                .map(function (source) {
                  return sourceRoot && util$1.isAbsolute(sourceRoot) && util$1.isAbsolute(source)
                    ? util$1.relative(sourceRoot, source)
                    : source;
                });

              // Pass `true` below to allow duplicate names and sources. While source maps
              // are intended to be compressed and deduplicated, the TypeScript compiler
              // sometimes generates source maps with duplicates in them. See Github issue
              // #72 and bugzil.la/889492.
              this._names = ArraySet$2.fromArray(names.map(String), true);
              this._sources = ArraySet$2.fromArray(sources, true);

              this._absoluteSources = this._sources.toArray().map(function (s) {
                return util$1.computeSourceURL(sourceRoot, s, aSourceMapURL);
              });

              this.sourceRoot = sourceRoot;
              this.sourcesContent = sourcesContent;
              this._mappings = mappings;
              this._sourceMapURL = aSourceMapURL;
              this.file = file;
            }

            BasicSourceMapConsumer.prototype = Object.create(SourceMapConsumer.prototype);
            BasicSourceMapConsumer.prototype.consumer = SourceMapConsumer;

            /**
             * Utility function to find the index of a source.  Returns -1 if not
             * found.
             */
            BasicSourceMapConsumer.prototype._findSourceIndex = function(aSource) {
              var relativeSource = aSource;
              if (this.sourceRoot != null) {
                relativeSource = util$1.relative(this.sourceRoot, relativeSource);
              }

              if (this._sources.has(relativeSource)) {
                return this._sources.indexOf(relativeSource);
              }

              // Maybe aSource is an absolute URL as returned by |sources|.  In
              // this case we can't simply undo the transform.
              var i;
              for (i = 0; i < this._absoluteSources.length; ++i) {
                if (this._absoluteSources[i] == aSource) {
                  return i;
                }
              }

              return -1;
            };

            /**
             * Create a BasicSourceMapConsumer from a SourceMapGenerator.
             *
             * @param SourceMapGenerator aSourceMap
             *        The source map that will be consumed.
             * @param String aSourceMapURL
             *        The URL at which the source map can be found (optional)
             * @returns BasicSourceMapConsumer
             */
            BasicSourceMapConsumer.fromSourceMap =
              function SourceMapConsumer_fromSourceMap(aSourceMap, aSourceMapURL) {
                var smc = Object.create(BasicSourceMapConsumer.prototype);

                var names = smc._names = ArraySet$2.fromArray(aSourceMap._names.toArray(), true);
                var sources = smc._sources = ArraySet$2.fromArray(aSourceMap._sources.toArray(), true);
                smc.sourceRoot = aSourceMap._sourceRoot;
                smc.sourcesContent = aSourceMap._generateSourcesContent(smc._sources.toArray(),
                                                                        smc.sourceRoot);
                smc.file = aSourceMap._file;
                smc._sourceMapURL = aSourceMapURL;
                smc._absoluteSources = smc._sources.toArray().map(function (s) {
                  return util$1.computeSourceURL(smc.sourceRoot, s, aSourceMapURL);
                });

                // Because we are modifying the entries (by converting string sources and
                // names to indices into the sources and names ArraySets), we have to make
                // a copy of the entry or else bad things happen. Shared mutable state
                // strikes again! See github issue #191.

                var generatedMappings = aSourceMap._mappings.toArray().slice();
                var destGeneratedMappings = smc.__generatedMappings = [];
                var destOriginalMappings = smc.__originalMappings = [];

                for (var i = 0, length = generatedMappings.length; i < length; i++) {
                  var srcMapping = generatedMappings[i];
                  var destMapping = new Mapping;
                  destMapping.generatedLine = srcMapping.generatedLine;
                  destMapping.generatedColumn = srcMapping.generatedColumn;

                  if (srcMapping.source) {
                    destMapping.source = sources.indexOf(srcMapping.source);
                    destMapping.originalLine = srcMapping.originalLine;
                    destMapping.originalColumn = srcMapping.originalColumn;

                    if (srcMapping.name) {
                      destMapping.name = names.indexOf(srcMapping.name);
                    }

                    destOriginalMappings.push(destMapping);
                  }

                  destGeneratedMappings.push(destMapping);
                }

                quickSort$1(smc.__originalMappings, util$1.compareByOriginalPositions);

                return smc;
              };

            /**
             * The version of the source mapping spec that we are consuming.
             */
            BasicSourceMapConsumer.prototype._version = 3;

            /**
             * The list of original sources.
             */
            Object.defineProperty(BasicSourceMapConsumer.prototype, 'sources', {
              get: function () {
                return this._absoluteSources.slice();
              }
            });

            /**
             * Provide the JIT with a nice shape / hidden class.
             */
            function Mapping() {
              this.generatedLine = 0;
              this.generatedColumn = 0;
              this.source = null;
              this.originalLine = null;
              this.originalColumn = null;
              this.name = null;
            }

            /**
             * Parse the mappings in a string in to a data structure which we can easily
             * query (the ordered arrays in the `this.__generatedMappings` and
             * `this.__originalMappings` properties).
             */
            BasicSourceMapConsumer.prototype._parseMappings =
              function SourceMapConsumer_parseMappings(aStr, aSourceRoot) {
                var generatedLine = 1;
                var previousGeneratedColumn = 0;
                var previousOriginalLine = 0;
                var previousOriginalColumn = 0;
                var previousSource = 0;
                var previousName = 0;
                var length = aStr.length;
                var index = 0;
                var cachedSegments = {};
                var temp = {};
                var originalMappings = [];
                var generatedMappings = [];
                var mapping, str, segment, end, value;

                while (index < length) {
                  if (aStr.charAt(index) === ';') {
                    generatedLine++;
                    index++;
                    previousGeneratedColumn = 0;
                  }
                  else if (aStr.charAt(index) === ',') {
                    index++;
                  }
                  else {
                    mapping = new Mapping();
                    mapping.generatedLine = generatedLine;

                    // Because each offset is encoded relative to the previous one,
                    // many segments often have the same encoding. We can exploit this
                    // fact by caching the parsed variable length fields of each segment,
                    // allowing us to avoid a second parse if we encounter the same
                    // segment again.
                    for (end = index; end < length; end++) {
                      if (this._charIsMappingSeparator(aStr, end)) {
                        break;
                      }
                    }
                    str = aStr.slice(index, end);

                    segment = cachedSegments[str];
                    if (segment) {
                      index += str.length;
                    } else {
                      segment = [];
                      while (index < end) {
                        base64Vlq.decode(aStr, index, temp);
                        value = temp.value;
                        index = temp.rest;
                        segment.push(value);
                      }

                      if (segment.length === 2) {
                        throw new Error('Found a source, but no line and column');
                      }

                      if (segment.length === 3) {
                        throw new Error('Found a source and line, but no column');
                      }

                      cachedSegments[str] = segment;
                    }

                    // Generated column.
                    mapping.generatedColumn = previousGeneratedColumn + segment[0];
                    previousGeneratedColumn = mapping.generatedColumn;

                    if (segment.length > 1) {
                      // Original source.
                      mapping.source = previousSource + segment[1];
                      previousSource += segment[1];

                      // Original line.
                      mapping.originalLine = previousOriginalLine + segment[2];
                      previousOriginalLine = mapping.originalLine;
                      // Lines are stored 0-based
                      mapping.originalLine += 1;

                      // Original column.
                      mapping.originalColumn = previousOriginalColumn + segment[3];
                      previousOriginalColumn = mapping.originalColumn;

                      if (segment.length > 4) {
                        // Original name.
                        mapping.name = previousName + segment[4];
                        previousName += segment[4];
                      }
                    }

                    generatedMappings.push(mapping);
                    if (typeof mapping.originalLine === 'number') {
                      originalMappings.push(mapping);
                    }
                  }
                }

                quickSort$1(generatedMappings, util$1.compareByGeneratedPositionsDeflated);
                this.__generatedMappings = generatedMappings;

                quickSort$1(originalMappings, util$1.compareByOriginalPositions);
                this.__originalMappings = originalMappings;
              };

            /**
             * Find the mapping that best matches the hypothetical "needle" mapping that
             * we are searching for in the given "haystack" of mappings.
             */
            BasicSourceMapConsumer.prototype._findMapping =
              function SourceMapConsumer_findMapping(aNeedle, aMappings, aLineName,
                                                     aColumnName, aComparator, aBias) {
                // To return the position we are searching for, we must first find the
                // mapping for the given position and then return the opposite position it
                // points to. Because the mappings are sorted, we can use binary search to
                // find the best mapping.

                if (aNeedle[aLineName] <= 0) {
                  throw new TypeError('Line must be greater than or equal to 1, got '
                                      + aNeedle[aLineName]);
                }
                if (aNeedle[aColumnName] < 0) {
                  throw new TypeError('Column must be greater than or equal to 0, got '
                                      + aNeedle[aColumnName]);
                }

                return binarySearch.search(aNeedle, aMappings, aComparator, aBias);
              };

            /**
             * Compute the last column for each generated mapping. The last column is
             * inclusive.
             */
            BasicSourceMapConsumer.prototype.computeColumnSpans =
              function SourceMapConsumer_computeColumnSpans() {
                for (var index = 0; index < this._generatedMappings.length; ++index) {
                  var mapping = this._generatedMappings[index];

                  // Mappings do not contain a field for the last generated columnt. We
                  // can come up with an optimistic estimate, however, by assuming that
                  // mappings are contiguous (i.e. given two consecutive mappings, the
                  // first mapping ends where the second one starts).
                  if (index + 1 < this._generatedMappings.length) {
                    var nextMapping = this._generatedMappings[index + 1];

                    if (mapping.generatedLine === nextMapping.generatedLine) {
                      mapping.lastGeneratedColumn = nextMapping.generatedColumn - 1;
                      continue;
                    }
                  }

                  // The last mapping for each line spans the entire line.
                  mapping.lastGeneratedColumn = Infinity;
                }
              };

            /**
             * Returns the original source, line, and column information for the generated
             * source's line and column positions provided. The only argument is an object
             * with the following properties:
             *
             *   - line: The line number in the generated source.  The line number
             *     is 1-based.
             *   - column: The column number in the generated source.  The column
             *     number is 0-based.
             *   - bias: Either 'SourceMapConsumer.GREATEST_LOWER_BOUND' or
             *     'SourceMapConsumer.LEAST_UPPER_BOUND'. Specifies whether to return the
             *     closest element that is smaller than or greater than the one we are
             *     searching for, respectively, if the exact element cannot be found.
             *     Defaults to 'SourceMapConsumer.GREATEST_LOWER_BOUND'.
             *
             * and an object is returned with the following properties:
             *
             *   - source: The original source file, or null.
             *   - line: The line number in the original source, or null.  The
             *     line number is 1-based.
             *   - column: The column number in the original source, or null.  The
             *     column number is 0-based.
             *   - name: The original identifier, or null.
             */
            BasicSourceMapConsumer.prototype.originalPositionFor =
              function SourceMapConsumer_originalPositionFor(aArgs) {
                var needle = {
                  generatedLine: util$1.getArg(aArgs, 'line'),
                  generatedColumn: util$1.getArg(aArgs, 'column')
                };

                var index = this._findMapping(
                  needle,
                  this._generatedMappings,
                  "generatedLine",
                  "generatedColumn",
                  util$1.compareByGeneratedPositionsDeflated,
                  util$1.getArg(aArgs, 'bias', SourceMapConsumer.GREATEST_LOWER_BOUND)
                );

                if (index >= 0) {
                  var mapping = this._generatedMappings[index];

                  if (mapping.generatedLine === needle.generatedLine) {
                    var source = util$1.getArg(mapping, 'source', null);
                    if (source !== null) {
                      source = this._sources.at(source);
                      source = util$1.computeSourceURL(this.sourceRoot, source, this._sourceMapURL);
                    }
                    var name = util$1.getArg(mapping, 'name', null);
                    if (name !== null) {
                      name = this._names.at(name);
                    }
                    return {
                      source: source,
                      line: util$1.getArg(mapping, 'originalLine', null),
                      column: util$1.getArg(mapping, 'originalColumn', null),
                      name: name
                    };
                  }
                }

                return {
                  source: null,
                  line: null,
                  column: null,
                  name: null
                };
              };

            /**
             * Return true if we have the source content for every source in the source
             * map, false otherwise.
             */
            BasicSourceMapConsumer.prototype.hasContentsOfAllSources =
              function BasicSourceMapConsumer_hasContentsOfAllSources() {
                if (!this.sourcesContent) {
                  return false;
                }
                return this.sourcesContent.length >= this._sources.size() &&
                  !this.sourcesContent.some(function (sc) { return sc == null; });
              };

            /**
             * Returns the original source content. The only argument is the url of the
             * original source file. Returns null if no original source content is
             * available.
             */
            BasicSourceMapConsumer.prototype.sourceContentFor =
              function SourceMapConsumer_sourceContentFor(aSource, nullOnMissing) {
                if (!this.sourcesContent) {
                  return null;
                }

                var index = this._findSourceIndex(aSource);
                if (index >= 0) {
                  return this.sourcesContent[index];
                }

                var relativeSource = aSource;
                if (this.sourceRoot != null) {
                  relativeSource = util$1.relative(this.sourceRoot, relativeSource);
                }

                var url;
                if (this.sourceRoot != null
                    && (url = util$1.urlParse(this.sourceRoot))) {
                  // XXX: file:// URIs and absolute paths lead to unexpected behavior for
                  // many users. We can help them out when they expect file:// URIs to
                  // behave like it would if they were running a local HTTP server. See
                  // https://bugzilla.mozilla.org/show_bug.cgi?id=885597.
                  var fileUriAbsPath = relativeSource.replace(/^file:\/\//, "");
                  if (url.scheme == "file"
                      && this._sources.has(fileUriAbsPath)) {
                    return this.sourcesContent[this._sources.indexOf(fileUriAbsPath)]
                  }

                  if ((!url.path || url.path == "/")
                      && this._sources.has("/" + relativeSource)) {
                    return this.sourcesContent[this._sources.indexOf("/" + relativeSource)];
                  }
                }

                // This function is used recursively from
                // IndexedSourceMapConsumer.prototype.sourceContentFor. In that case, we
                // don't want to throw if we can't find the source - we just want to
                // return null, so we provide a flag to exit gracefully.
                if (nullOnMissing) {
                  return null;
                }
                else {
                  throw new Error('"' + relativeSource + '" is not in the SourceMap.');
                }
              };

            /**
             * Returns the generated line and column information for the original source,
             * line, and column positions provided. The only argument is an object with
             * the following properties:
             *
             *   - source: The filename of the original source.
             *   - line: The line number in the original source.  The line number
             *     is 1-based.
             *   - column: The column number in the original source.  The column
             *     number is 0-based.
             *   - bias: Either 'SourceMapConsumer.GREATEST_LOWER_BOUND' or
             *     'SourceMapConsumer.LEAST_UPPER_BOUND'. Specifies whether to return the
             *     closest element that is smaller than or greater than the one we are
             *     searching for, respectively, if the exact element cannot be found.
             *     Defaults to 'SourceMapConsumer.GREATEST_LOWER_BOUND'.
             *
             * and an object is returned with the following properties:
             *
             *   - line: The line number in the generated source, or null.  The
             *     line number is 1-based.
             *   - column: The column number in the generated source, or null.
             *     The column number is 0-based.
             */
            BasicSourceMapConsumer.prototype.generatedPositionFor =
              function SourceMapConsumer_generatedPositionFor(aArgs) {
                var source = util$1.getArg(aArgs, 'source');
                source = this._findSourceIndex(source);
                if (source < 0) {
                  return {
                    line: null,
                    column: null,
                    lastColumn: null
                  };
                }

                var needle = {
                  source: source,
                  originalLine: util$1.getArg(aArgs, 'line'),
                  originalColumn: util$1.getArg(aArgs, 'column')
                };

                var index = this._findMapping(
                  needle,
                  this._originalMappings,
                  "originalLine",
                  "originalColumn",
                  util$1.compareByOriginalPositions,
                  util$1.getArg(aArgs, 'bias', SourceMapConsumer.GREATEST_LOWER_BOUND)
                );

                if (index >= 0) {
                  var mapping = this._originalMappings[index];

                  if (mapping.source === needle.source) {
                    return {
                      line: util$1.getArg(mapping, 'generatedLine', null),
                      column: util$1.getArg(mapping, 'generatedColumn', null),
                      lastColumn: util$1.getArg(mapping, 'lastGeneratedColumn', null)
                    };
                  }
                }

                return {
                  line: null,
                  column: null,
                  lastColumn: null
                };
              };

            var BasicSourceMapConsumer_1 = BasicSourceMapConsumer;

            /**
             * An IndexedSourceMapConsumer instance represents a parsed source map which
             * we can query for information. It differs from BasicSourceMapConsumer in
             * that it takes "indexed" source maps (i.e. ones with a "sections" field) as
             * input.
             *
             * The first parameter is a raw source map (either as a JSON string, or already
             * parsed to an object). According to the spec for indexed source maps, they
             * have the following attributes:
             *
             *   - version: Which version of the source map spec this map is following.
             *   - file: Optional. The generated file this source map is associated with.
             *   - sections: A list of section definitions.
             *
             * Each value under the "sections" field has two fields:
             *   - offset: The offset into the original specified at which this section
             *       begins to apply, defined as an object with a "line" and "column"
             *       field.
             *   - map: A source map definition. This source map could also be indexed,
             *       but doesn't have to be.
             *
             * Instead of the "map" field, it's also possible to have a "url" field
             * specifying a URL to retrieve a source map from, but that's currently
             * unsupported.
             *
             * Here's an example source map, taken from the source map spec[0], but
             * modified to omit a section which uses the "url" field.
             *
             *  {
             *    version : 3,
             *    file: "app.js",
             *    sections: [{
             *      offset: {line:100, column:10},
             *      map: {
             *        version : 3,
             *        file: "section.js",
             *        sources: ["foo.js", "bar.js"],
             *        names: ["src", "maps", "are", "fun"],
             *        mappings: "AAAA,E;;ABCDE;"
             *      }
             *    }],
             *  }
             *
             * The second parameter, if given, is a string whose value is the URL
             * at which the source map was found.  This URL is used to compute the
             * sources array.
             *
             * [0]: https://docs.google.com/document/d/1U1RGAehQwRypUTovF1KRlpiOFze0b-_2gc6fAH0KY0k/edit#heading=h.535es3xeprgt
             */
            function IndexedSourceMapConsumer(aSourceMap, aSourceMapURL) {
              var sourceMap = aSourceMap;
              if (typeof aSourceMap === 'string') {
                sourceMap = util$1.parseSourceMapInput(aSourceMap);
              }

              var version = util$1.getArg(sourceMap, 'version');
              var sections = util$1.getArg(sourceMap, 'sections');

              if (version != this._version) {
                throw new Error('Unsupported version: ' + version);
              }

              this._sources = new ArraySet$2();
              this._names = new ArraySet$2();

              var lastOffset = {
                line: -1,
                column: 0
              };
              this._sections = sections.map(function (s) {
                if (s.url) {
                  // The url field will require support for asynchronicity.
                  // See https://github.com/mozilla/source-map/issues/16
                  throw new Error('Support for url field in sections not implemented.');
                }
                var offset = util$1.getArg(s, 'offset');
                var offsetLine = util$1.getArg(offset, 'line');
                var offsetColumn = util$1.getArg(offset, 'column');

                if (offsetLine < lastOffset.line ||
                    (offsetLine === lastOffset.line && offsetColumn < lastOffset.column)) {
                  throw new Error('Section offsets must be ordered and non-overlapping.');
                }
                lastOffset = offset;

                return {
                  generatedOffset: {
                    // The offset fields are 0-based, but we use 1-based indices when
                    // encoding/decoding from VLQ.
                    generatedLine: offsetLine + 1,
                    generatedColumn: offsetColumn + 1
                  },
                  consumer: new SourceMapConsumer(util$1.getArg(s, 'map'), aSourceMapURL)
                }
              });
            }

            IndexedSourceMapConsumer.prototype = Object.create(SourceMapConsumer.prototype);
            IndexedSourceMapConsumer.prototype.constructor = SourceMapConsumer;

            /**
             * The version of the source mapping spec that we are consuming.
             */
            IndexedSourceMapConsumer.prototype._version = 3;

            /**
             * The list of original sources.
             */
            Object.defineProperty(IndexedSourceMapConsumer.prototype, 'sources', {
              get: function () {
                var sources = [];
                for (var i = 0; i < this._sections.length; i++) {
                  for (var j = 0; j < this._sections[i].consumer.sources.length; j++) {
                    sources.push(this._sections[i].consumer.sources[j]);
                  }
                }
                return sources;
              }
            });

            /**
             * Returns the original source, line, and column information for the generated
             * source's line and column positions provided. The only argument is an object
             * with the following properties:
             *
             *   - line: The line number in the generated source.  The line number
             *     is 1-based.
             *   - column: The column number in the generated source.  The column
             *     number is 0-based.
             *
             * and an object is returned with the following properties:
             *
             *   - source: The original source file, or null.
             *   - line: The line number in the original source, or null.  The
             *     line number is 1-based.
             *   - column: The column number in the original source, or null.  The
             *     column number is 0-based.
             *   - name: The original identifier, or null.
             */
            IndexedSourceMapConsumer.prototype.originalPositionFor =
              function IndexedSourceMapConsumer_originalPositionFor(aArgs) {
                var needle = {
                  generatedLine: util$1.getArg(aArgs, 'line'),
                  generatedColumn: util$1.getArg(aArgs, 'column')
                };

                // Find the section containing the generated position we're trying to map
                // to an original position.
                var sectionIndex = binarySearch.search(needle, this._sections,
                  function(needle, section) {
                    var cmp = needle.generatedLine - section.generatedOffset.generatedLine;
                    if (cmp) {
                      return cmp;
                    }

                    return (needle.generatedColumn -
                            section.generatedOffset.generatedColumn);
                  });
                var section = this._sections[sectionIndex];

                if (!section) {
                  return {
                    source: null,
                    line: null,
                    column: null,
                    name: null
                  };
                }

                return section.consumer.originalPositionFor({
                  line: needle.generatedLine -
                    (section.generatedOffset.generatedLine - 1),
                  column: needle.generatedColumn -
                    (section.generatedOffset.generatedLine === needle.generatedLine
                     ? section.generatedOffset.generatedColumn - 1
                     : 0),
                  bias: aArgs.bias
                });
              };

            /**
             * Return true if we have the source content for every source in the source
             * map, false otherwise.
             */
            IndexedSourceMapConsumer.prototype.hasContentsOfAllSources =
              function IndexedSourceMapConsumer_hasContentsOfAllSources() {
                return this._sections.every(function (s) {
                  return s.consumer.hasContentsOfAllSources();
                });
              };

            /**
             * Returns the original source content. The only argument is the url of the
             * original source file. Returns null if no original source content is
             * available.
             */
            IndexedSourceMapConsumer.prototype.sourceContentFor =
              function IndexedSourceMapConsumer_sourceContentFor(aSource, nullOnMissing) {
                for (var i = 0; i < this._sections.length; i++) {
                  var section = this._sections[i];

                  var content = section.consumer.sourceContentFor(aSource, true);
                  if (content) {
                    return content;
                  }
                }
                if (nullOnMissing) {
                  return null;
                }
                else {
                  throw new Error('"' + aSource + '" is not in the SourceMap.');
                }
              };

            /**
             * Returns the generated line and column information for the original source,
             * line, and column positions provided. The only argument is an object with
             * the following properties:
             *
             *   - source: The filename of the original source.
             *   - line: The line number in the original source.  The line number
             *     is 1-based.
             *   - column: The column number in the original source.  The column
             *     number is 0-based.
             *
             * and an object is returned with the following properties:
             *
             *   - line: The line number in the generated source, or null.  The
             *     line number is 1-based. 
             *   - column: The column number in the generated source, or null.
             *     The column number is 0-based.
             */
            IndexedSourceMapConsumer.prototype.generatedPositionFor =
              function IndexedSourceMapConsumer_generatedPositionFor(aArgs) {
                for (var i = 0; i < this._sections.length; i++) {
                  var section = this._sections[i];

                  // Only consider this section if the requested source is in the list of
                  // sources of the consumer.
                  if (section.consumer._findSourceIndex(util$1.getArg(aArgs, 'source')) === -1) {
                    continue;
                  }
                  var generatedPosition = section.consumer.generatedPositionFor(aArgs);
                  if (generatedPosition) {
                    var ret = {
                      line: generatedPosition.line +
                        (section.generatedOffset.generatedLine - 1),
                      column: generatedPosition.column +
                        (section.generatedOffset.generatedLine === generatedPosition.line
                         ? section.generatedOffset.generatedColumn - 1
                         : 0)
                    };
                    return ret;
                  }
                }

                return {
                  line: null,
                  column: null
                };
              };

            /**
             * Parse the mappings in a string in to a data structure which we can easily
             * query (the ordered arrays in the `this.__generatedMappings` and
             * `this.__originalMappings` properties).
             */
            IndexedSourceMapConsumer.prototype._parseMappings =
              function IndexedSourceMapConsumer_parseMappings(aStr, aSourceRoot) {
                this.__generatedMappings = [];
                this.__originalMappings = [];
                for (var i = 0; i < this._sections.length; i++) {
                  var section = this._sections[i];
                  var sectionMappings = section.consumer._generatedMappings;
                  for (var j = 0; j < sectionMappings.length; j++) {
                    var mapping = sectionMappings[j];

                    var source = section.consumer._sources.at(mapping.source);
                    source = util$1.computeSourceURL(section.consumer.sourceRoot, source, this._sourceMapURL);
                    this._sources.add(source);
                    source = this._sources.indexOf(source);

                    var name = null;
                    if (mapping.name) {
                      name = section.consumer._names.at(mapping.name);
                      this._names.add(name);
                      name = this._names.indexOf(name);
                    }

                    // The mappings coming from the consumer for the section have
                    // generated positions relative to the start of the section, so we
                    // need to offset them to be relative to the start of the concatenated
                    // generated file.
                    var adjustedMapping = {
                      source: source,
                      generatedLine: mapping.generatedLine +
                        (section.generatedOffset.generatedLine - 1),
                      generatedColumn: mapping.generatedColumn +
                        (section.generatedOffset.generatedLine === mapping.generatedLine
                        ? section.generatedOffset.generatedColumn - 1
                        : 0),
                      originalLine: mapping.originalLine,
                      originalColumn: mapping.originalColumn,
                      name: name
                    };

                    this.__generatedMappings.push(adjustedMapping);
                    if (typeof adjustedMapping.originalLine === 'number') {
                      this.__originalMappings.push(adjustedMapping);
                    }
                  }
                }

                quickSort$1(this.__generatedMappings, util$1.compareByGeneratedPositionsDeflated);
                quickSort$1(this.__originalMappings, util$1.compareByOriginalPositions);
              };

            var IndexedSourceMapConsumer_1 = IndexedSourceMapConsumer;

            var sourceMapConsumer = {
            	SourceMapConsumer: SourceMapConsumer_1,
            	BasicSourceMapConsumer: BasicSourceMapConsumer_1,
            	IndexedSourceMapConsumer: IndexedSourceMapConsumer_1
            };

            /* -*- Mode: js; js-indent-level: 2; -*- */
            /*
             * Copyright 2011 Mozilla Foundation and contributors
             * Licensed under the New BSD license. See LICENSE or:
             * http://opensource.org/licenses/BSD-3-Clause
             */

            var SourceMapGenerator$1 = sourceMapGenerator.SourceMapGenerator;


            // Matches a Windows-style `\r\n` newline or a `\n` newline used by all other
            // operating systems these days (capturing the result).
            var REGEX_NEWLINE = /(\r?\n)/;

            // Newline character code for charCodeAt() comparisons
            var NEWLINE_CODE = 10;

            // Private symbol for identifying `SourceNode`s when multiple versions of
            // the source-map library are loaded. This MUST NOT CHANGE across
            // versions!
            var isSourceNode = "$$$isSourceNode$$$";

            /**
             * SourceNodes provide a way to abstract over interpolating/concatenating
             * snippets of generated JavaScript source code while maintaining the line and
             * column information associated with the original source code.
             *
             * @param aLine The original line number.
             * @param aColumn The original column number.
             * @param aSource The original source's filename.
             * @param aChunks Optional. An array of strings which are snippets of
             *        generated JS, or other SourceNodes.
             * @param aName The original identifier.
             */
            function SourceNode(aLine, aColumn, aSource, aChunks, aName) {
              this.children = [];
              this.sourceContents = {};
              this.line = aLine == null ? null : aLine;
              this.column = aColumn == null ? null : aColumn;
              this.source = aSource == null ? null : aSource;
              this.name = aName == null ? null : aName;
              this[isSourceNode] = true;
              if (aChunks != null) this.add(aChunks);
            }

            /**
             * Creates a SourceNode from generated code and a SourceMapConsumer.
             *
             * @param aGeneratedCode The generated code
             * @param aSourceMapConsumer The SourceMap for the generated code
             * @param aRelativePath Optional. The path that relative sources in the
             *        SourceMapConsumer should be relative to.
             */
            SourceNode.fromStringWithSourceMap =
              function SourceNode_fromStringWithSourceMap(aGeneratedCode, aSourceMapConsumer, aRelativePath) {
                // The SourceNode we want to fill with the generated code
                // and the SourceMap
                var node = new SourceNode();

                // All even indices of this array are one line of the generated code,
                // while all odd indices are the newlines between two adjacent lines
                // (since `REGEX_NEWLINE` captures its match).
                // Processed fragments are accessed by calling `shiftNextLine`.
                var remainingLines = aGeneratedCode.split(REGEX_NEWLINE);
                var remainingLinesIndex = 0;
                var shiftNextLine = function() {
                  var lineContents = getNextLine();
                  // The last line of a file might not have a newline.
                  var newLine = getNextLine() || "";
                  return lineContents + newLine;

                  function getNextLine() {
                    return remainingLinesIndex < remainingLines.length ?
                        remainingLines[remainingLinesIndex++] : undefined;
                  }
                };

                // We need to remember the position of "remainingLines"
                var lastGeneratedLine = 1, lastGeneratedColumn = 0;

                // The generate SourceNodes we need a code range.
                // To extract it current and last mapping is used.
                // Here we store the last mapping.
                var lastMapping = null;

                aSourceMapConsumer.eachMapping(function (mapping) {
                  if (lastMapping !== null) {
                    // We add the code from "lastMapping" to "mapping":
                    // First check if there is a new line in between.
                    if (lastGeneratedLine < mapping.generatedLine) {
                      // Associate first line with "lastMapping"
                      addMappingWithCode(lastMapping, shiftNextLine());
                      lastGeneratedLine++;
                      lastGeneratedColumn = 0;
                      // The remaining code is added without mapping
                    } else {
                      // There is no new line in between.
                      // Associate the code between "lastGeneratedColumn" and
                      // "mapping.generatedColumn" with "lastMapping"
                      var nextLine = remainingLines[remainingLinesIndex] || '';
                      var code = nextLine.substr(0, mapping.generatedColumn -
                                                    lastGeneratedColumn);
                      remainingLines[remainingLinesIndex] = nextLine.substr(mapping.generatedColumn -
                                                          lastGeneratedColumn);
                      lastGeneratedColumn = mapping.generatedColumn;
                      addMappingWithCode(lastMapping, code);
                      // No more remaining code, continue
                      lastMapping = mapping;
                      return;
                    }
                  }
                  // We add the generated code until the first mapping
                  // to the SourceNode without any mapping.
                  // Each line is added as separate string.
                  while (lastGeneratedLine < mapping.generatedLine) {
                    node.add(shiftNextLine());
                    lastGeneratedLine++;
                  }
                  if (lastGeneratedColumn < mapping.generatedColumn) {
                    var nextLine = remainingLines[remainingLinesIndex] || '';
                    node.add(nextLine.substr(0, mapping.generatedColumn));
                    remainingLines[remainingLinesIndex] = nextLine.substr(mapping.generatedColumn);
                    lastGeneratedColumn = mapping.generatedColumn;
                  }
                  lastMapping = mapping;
                }, this);
                // We have processed all mappings.
                if (remainingLinesIndex < remainingLines.length) {
                  if (lastMapping) {
                    // Associate the remaining code in the current line with "lastMapping"
                    addMappingWithCode(lastMapping, shiftNextLine());
                  }
                  // and add the remaining lines without any mapping
                  node.add(remainingLines.splice(remainingLinesIndex).join(""));
                }

                // Copy sourcesContent into SourceNode
                aSourceMapConsumer.sources.forEach(function (sourceFile) {
                  var content = aSourceMapConsumer.sourceContentFor(sourceFile);
                  if (content != null) {
                    if (aRelativePath != null) {
                      sourceFile = util$1.join(aRelativePath, sourceFile);
                    }
                    node.setSourceContent(sourceFile, content);
                  }
                });

                return node;

                function addMappingWithCode(mapping, code) {
                  if (mapping === null || mapping.source === undefined) {
                    node.add(code);
                  } else {
                    var source = aRelativePath
                      ? util$1.join(aRelativePath, mapping.source)
                      : mapping.source;
                    node.add(new SourceNode(mapping.originalLine,
                                            mapping.originalColumn,
                                            source,
                                            code,
                                            mapping.name));
                  }
                }
              };

            /**
             * Add a chunk of generated JS to this source node.
             *
             * @param aChunk A string snippet of generated JS code, another instance of
             *        SourceNode, or an array where each member is one of those things.
             */
            SourceNode.prototype.add = function SourceNode_add(aChunk) {
              if (Array.isArray(aChunk)) {
                aChunk.forEach(function (chunk) {
                  this.add(chunk);
                }, this);
              }
              else if (aChunk[isSourceNode] || typeof aChunk === "string") {
                if (aChunk) {
                  this.children.push(aChunk);
                }
              }
              else {
                throw new TypeError(
                  "Expected a SourceNode, string, or an array of SourceNodes and strings. Got " + aChunk
                );
              }
              return this;
            };

            /**
             * Add a chunk of generated JS to the beginning of this source node.
             *
             * @param aChunk A string snippet of generated JS code, another instance of
             *        SourceNode, or an array where each member is one of those things.
             */
            SourceNode.prototype.prepend = function SourceNode_prepend(aChunk) {
              if (Array.isArray(aChunk)) {
                for (var i = aChunk.length-1; i >= 0; i--) {
                  this.prepend(aChunk[i]);
                }
              }
              else if (aChunk[isSourceNode] || typeof aChunk === "string") {
                this.children.unshift(aChunk);
              }
              else {
                throw new TypeError(
                  "Expected a SourceNode, string, or an array of SourceNodes and strings. Got " + aChunk
                );
              }
              return this;
            };

            /**
             * Walk over the tree of JS snippets in this node and its children. The
             * walking function is called once for each snippet of JS and is passed that
             * snippet and the its original associated source's line/column location.
             *
             * @param aFn The traversal function.
             */
            SourceNode.prototype.walk = function SourceNode_walk(aFn) {
              var chunk;
              for (var i = 0, len = this.children.length; i < len; i++) {
                chunk = this.children[i];
                if (chunk[isSourceNode]) {
                  chunk.walk(aFn);
                }
                else {
                  if (chunk !== '') {
                    aFn(chunk, { source: this.source,
                                 line: this.line,
                                 column: this.column,
                                 name: this.name });
                  }
                }
              }
            };

            /**
             * Like `String.prototype.join` except for SourceNodes. Inserts `aStr` between
             * each of `this.children`.
             *
             * @param aSep The separator.
             */
            SourceNode.prototype.join = function SourceNode_join(aSep) {
              var newChildren;
              var i;
              var len = this.children.length;
              if (len > 0) {
                newChildren = [];
                for (i = 0; i < len-1; i++) {
                  newChildren.push(this.children[i]);
                  newChildren.push(aSep);
                }
                newChildren.push(this.children[i]);
                this.children = newChildren;
              }
              return this;
            };

            /**
             * Call String.prototype.replace on the very right-most source snippet. Useful
             * for trimming whitespace from the end of a source node, etc.
             *
             * @param aPattern The pattern to replace.
             * @param aReplacement The thing to replace the pattern with.
             */
            SourceNode.prototype.replaceRight = function SourceNode_replaceRight(aPattern, aReplacement) {
              var lastChild = this.children[this.children.length - 1];
              if (lastChild[isSourceNode]) {
                lastChild.replaceRight(aPattern, aReplacement);
              }
              else if (typeof lastChild === 'string') {
                this.children[this.children.length - 1] = lastChild.replace(aPattern, aReplacement);
              }
              else {
                this.children.push(''.replace(aPattern, aReplacement));
              }
              return this;
            };

            /**
             * Set the source content for a source file. This will be added to the SourceMapGenerator
             * in the sourcesContent field.
             *
             * @param aSourceFile The filename of the source file
             * @param aSourceContent The content of the source file
             */
            SourceNode.prototype.setSourceContent =
              function SourceNode_setSourceContent(aSourceFile, aSourceContent) {
                this.sourceContents[util$1.toSetString(aSourceFile)] = aSourceContent;
              };

            /**
             * Walk over the tree of SourceNodes. The walking function is called for each
             * source file content and is passed the filename and source content.
             *
             * @param aFn The traversal function.
             */
            SourceNode.prototype.walkSourceContents =
              function SourceNode_walkSourceContents(aFn) {
                for (var i = 0, len = this.children.length; i < len; i++) {
                  if (this.children[i][isSourceNode]) {
                    this.children[i].walkSourceContents(aFn);
                  }
                }

                var sources = Object.keys(this.sourceContents);
                for (var i = 0, len = sources.length; i < len; i++) {
                  aFn(util$1.fromSetString(sources[i]), this.sourceContents[sources[i]]);
                }
              };

            /**
             * Return the string representation of this source node. Walks over the tree
             * and concatenates all the various snippets together to one string.
             */
            SourceNode.prototype.toString = function SourceNode_toString() {
              var str = "";
              this.walk(function (chunk) {
                str += chunk;
              });
              return str;
            };

            /**
             * Returns the string representation of this source node along with a source
             * map.
             */
            SourceNode.prototype.toStringWithSourceMap = function SourceNode_toStringWithSourceMap(aArgs) {
              var generated = {
                code: "",
                line: 1,
                column: 0
              };
              var map = new SourceMapGenerator$1(aArgs);
              var sourceMappingActive = false;
              var lastOriginalSource = null;
              var lastOriginalLine = null;
              var lastOriginalColumn = null;
              var lastOriginalName = null;
              this.walk(function (chunk, original) {
                generated.code += chunk;
                if (original.source !== null
                    && original.line !== null
                    && original.column !== null) {
                  if(lastOriginalSource !== original.source
                     || lastOriginalLine !== original.line
                     || lastOriginalColumn !== original.column
                     || lastOriginalName !== original.name) {
                    map.addMapping({
                      source: original.source,
                      original: {
                        line: original.line,
                        column: original.column
                      },
                      generated: {
                        line: generated.line,
                        column: generated.column
                      },
                      name: original.name
                    });
                  }
                  lastOriginalSource = original.source;
                  lastOriginalLine = original.line;
                  lastOriginalColumn = original.column;
                  lastOriginalName = original.name;
                  sourceMappingActive = true;
                } else if (sourceMappingActive) {
                  map.addMapping({
                    generated: {
                      line: generated.line,
                      column: generated.column
                    }
                  });
                  lastOriginalSource = null;
                  sourceMappingActive = false;
                }
                for (var idx = 0, length = chunk.length; idx < length; idx++) {
                  if (chunk.charCodeAt(idx) === NEWLINE_CODE) {
                    generated.line++;
                    generated.column = 0;
                    // Mappings end at eol
                    if (idx + 1 === length) {
                      lastOriginalSource = null;
                      sourceMappingActive = false;
                    } else if (sourceMappingActive) {
                      map.addMapping({
                        source: original.source,
                        original: {
                          line: original.line,
                          column: original.column
                        },
                        generated: {
                          line: generated.line,
                          column: generated.column
                        },
                        name: original.name
                      });
                    }
                  } else {
                    generated.column++;
                  }
                }
              });
              this.walkSourceContents(function (sourceFile, sourceContent) {
                map.setSourceContent(sourceFile, sourceContent);
              });

              return { code: generated.code, map: map };
            };

            var SourceNode_1 = SourceNode;

            var sourceNode = {
            	SourceNode: SourceNode_1
            };

            /*
             * Copyright 2009-2011 Mozilla Foundation and contributors
             * Licensed under the New BSD license. See LICENSE.txt or:
             * http://opensource.org/licenses/BSD-3-Clause
             */
            var SourceMapGenerator$2 = sourceMapGenerator.SourceMapGenerator;
            var SourceMapConsumer$1 = sourceMapConsumer.SourceMapConsumer;
            var SourceNode$1 = sourceNode.SourceNode;

            var sourceMap = {
            	SourceMapGenerator: SourceMapGenerator$2,
            	SourceMapConsumer: SourceMapConsumer$1,
            	SourceNode: SourceNode$1
            };

            var require$$3 = {};

            var toString$1 = Object.prototype.toString;

            var isModern = (
              typeof Buffer.alloc === 'function' &&
              typeof Buffer.allocUnsafe === 'function' &&
              typeof Buffer.from === 'function'
            );

            function isArrayBuffer (input) {
              return toString$1.call(input).slice(8, -1) === 'ArrayBuffer'
            }

            function fromArrayBuffer$1 (obj, byteOffset, length) {
              byteOffset >>>= 0;

              var maxLength = obj.byteLength - byteOffset;

              if (maxLength < 0) {
                throw new RangeError("'offset' is out of bounds")
              }

              if (length === undefined) {
                length = maxLength;
              } else {
                length >>>= 0;

                if (length > maxLength) {
                  throw new RangeError("'length' is out of bounds")
                }
              }

              return isModern
                ? Buffer.from(obj.slice(byteOffset, byteOffset + length))
                : new Buffer(new Uint8Array(obj.slice(byteOffset, byteOffset + length)))
            }

            function fromString$1 (string, encoding) {
              if (typeof encoding !== 'string' || encoding === '') {
                encoding = 'utf8';
              }

              if (!Buffer.isEncoding(encoding)) {
                throw new TypeError('"encoding" must be a valid string encoding')
              }

              return isModern
                ? Buffer.from(string, encoding)
                : new Buffer(string, encoding)
            }

            function bufferFrom (value, encodingOrOffset, length) {
              if (typeof value === 'number') {
                throw new TypeError('"value" argument must not be a number')
              }

              if (isArrayBuffer(value)) {
                return fromArrayBuffer$1(value, encodingOrOffset, length)
              }

              if (typeof value === 'string') {
                return fromString$1(value, encodingOrOffset)
              }

              return isModern
                ? Buffer.from(value)
                : new Buffer(value)
            }

            var bufferFrom_1 = bufferFrom;

            var SourceMapConsumer$2 = sourceMap.SourceMapConsumer;
            var path$1 = path;

            var fs;
            try {
              fs = require$$3;
              if (!fs.existsSync || !fs.readFileSync) {
                // fs doesn't have all methods we need
                fs = null;
              }
            } catch (err) {
              /* nop */
            }



            // Only install once if called multiple times
            var errorFormatterInstalled = false;
            var uncaughtShimInstalled = false;

            // If true, the caches are reset before a stack trace formatting operation
            var emptyCacheBetweenOperations = false;

            // Supports {browser, node, auto}
            var environment = "auto";

            // Maps a file path to a string containing the file contents
            var fileContentsCache = {};

            // Maps a file path to a source map for that file
            var sourceMapCache = {};

            // Regex for detecting source maps
            var reSourceMap = /^data:application\/json[^,]+base64,/;

            // Priority list of retrieve handlers
            var retrieveFileHandlers = [];
            var retrieveMapHandlers = [];

            function isInBrowser() {
              if (environment === "browser")
                return true;
              if (environment === "node")
                return false;
              return ((typeof window !== 'undefined') && (typeof XMLHttpRequest === 'function') && !(window.require && window.module && window.process && window.process.type === "renderer"));
            }

            function hasGlobalProcessEventEmitter() {
              return ((typeof process === 'object') && (process !== null) && (typeof process.on === 'function'));
            }

            function handlerExec(list) {
              return function(arg) {
                for (var i = 0; i < list.length; i++) {
                  var ret = list[i](arg);
                  if (ret) {
                    return ret;
                  }
                }
                return null;
              };
            }

            var retrieveFile = handlerExec(retrieveFileHandlers);

            retrieveFileHandlers.push(function(path$$1) {
              // Trim the path to make sure there is no extra whitespace.
              path$$1 = path$$1.trim();
              if (/^file:/.test(path$$1)) {
                // existsSync/readFileSync can't handle file protocol, but once stripped, it works
                path$$1 = path$$1.replace(/file:\/\/\/(\w:)?/, function(protocol, drive) {
                  return drive ?
                    '' : // file:///C:/dir/file -> C:/dir/file
                    '/'; // file:///root-dir/file -> /root-dir/file
                });
              }
              if (path$$1 in fileContentsCache) {
                return fileContentsCache[path$$1];
              }

              var contents = '';
              try {
                if (!fs) {
                  // Use SJAX if we are in the browser
                  var xhr = new XMLHttpRequest();
                  xhr.open('GET', path$$1, /** async */ false);
                  xhr.send(null);
                  if (xhr.readyState === 4 && xhr.status === 200) {
                    contents = xhr.responseText;
                  }
                } else if (fs.existsSync(path$$1)) {
                  // Otherwise, use the filesystem
                  contents = fs.readFileSync(path$$1, 'utf8');
                }
              } catch (er) {
                /* ignore any errors */
              }

              return fileContentsCache[path$$1] = contents;
            });

            // Support URLs relative to a directory, but be careful about a protocol prefix
            // in case we are in the browser (i.e. directories may start with "http://" or "file:///")
            function supportRelativeURL(file, url) {
              if (!file) return url;
              var dir = path$1.dirname(file);
              var match = /^\w+:\/\/[^\/]*/.exec(dir);
              var protocol = match ? match[0] : '';
              var startPath = dir.slice(protocol.length);
              if (protocol && /^\/\w\:/.test(startPath)) {
                // handle file:///C:/ paths
                protocol += '/';
                return protocol + path$1.resolve(dir.slice(protocol.length), url).replace(/\\/g, '/');
              }
              return protocol + path$1.resolve(dir.slice(protocol.length), url);
            }

            function retrieveSourceMapURL(source) {
              var fileData;

              if (isInBrowser()) {
                 try {
                   var xhr = new XMLHttpRequest();
                   xhr.open('GET', source, false);
                   xhr.send(null);
                   fileData = xhr.readyState === 4 ? xhr.responseText : null;

                   // Support providing a sourceMappingURL via the SourceMap header
                   var sourceMapHeader = xhr.getResponseHeader("SourceMap") ||
                                         xhr.getResponseHeader("X-SourceMap");
                   if (sourceMapHeader) {
                     return sourceMapHeader;
                   }
                 } catch (e) {
                 }
              }

              // Get the URL of the source map
              fileData = retrieveFile(source);
              var re = /(?:\/\/[@#][ \t]+sourceMappingURL=([^\s'"]+?)[ \t]*$)|(?:\/\*[@#][ \t]+sourceMappingURL=([^\*]+?)[ \t]*(?:\*\/)[ \t]*$)/mg;
              // Keep executing the search to find the *last* sourceMappingURL to avoid
              // picking up sourceMappingURLs from comments, strings, etc.
              var lastMatch, match;
              while (match = re.exec(fileData)) lastMatch = match;
              if (!lastMatch) return null;
              return lastMatch[1];
            }
            // Can be overridden by the retrieveSourceMap option to install. Takes a
            // generated source filename; returns a {map, optional url} object, or null if
            // there is no source map.  The map field may be either a string or the parsed
            // JSON object (ie, it must be a valid argument to the SourceMapConsumer
            // constructor).
            var retrieveSourceMap = handlerExec(retrieveMapHandlers);
            retrieveMapHandlers.push(function(source) {
              var sourceMappingURL = retrieveSourceMapURL(source);
              if (!sourceMappingURL) return null;

              // Read the contents of the source map
              var sourceMapData;
              if (reSourceMap.test(sourceMappingURL)) {
                // Support source map URL as a data url
                var rawData = sourceMappingURL.slice(sourceMappingURL.indexOf(',') + 1);
                sourceMapData = bufferFrom_1(rawData, "base64").toString();
                sourceMappingURL = source;
              } else {
                // Support source map URLs relative to the source URL
                sourceMappingURL = supportRelativeURL(source, sourceMappingURL);
                sourceMapData = retrieveFile(sourceMappingURL);
              }

              if (!sourceMapData) {
                return null;
              }

              return {
                url: sourceMappingURL,
                map: sourceMapData
              };
            });

            function mapSourcePosition(position) {
              var sourceMap$$1 = sourceMapCache[position.source];
              if (!sourceMap$$1) {
                // Call the (overrideable) retrieveSourceMap function to get the source map.
                var urlAndMap = retrieveSourceMap(position.source);
                if (urlAndMap) {
                  sourceMap$$1 = sourceMapCache[position.source] = {
                    url: urlAndMap.url,
                    map: new SourceMapConsumer$2(urlAndMap.map)
                  };

                  // Load all sources stored inline with the source map into the file cache
                  // to pretend like they are already loaded. They may not exist on disk.
                  if (sourceMap$$1.map.sourcesContent) {
                    sourceMap$$1.map.sources.forEach(function(source, i) {
                      var contents = sourceMap$$1.map.sourcesContent[i];
                      if (contents) {
                        var url = supportRelativeURL(sourceMap$$1.url, source);
                        fileContentsCache[url] = contents;
                      }
                    });
                  }
                } else {
                  sourceMap$$1 = sourceMapCache[position.source] = {
                    url: null,
                    map: null
                  };
                }
              }

              // Resolve the source URL relative to the URL of the source map
              if (sourceMap$$1 && sourceMap$$1.map && typeof sourceMap$$1.map.originalPositionFor === 'function') {
                var originalPosition = sourceMap$$1.map.originalPositionFor(position);

                // Only return the original position if a matching line was found. If no
                // matching line is found then we return position instead, which will cause
                // the stack trace to print the path and line for the compiled file. It is
                // better to give a precise location in the compiled file than a vague
                // location in the original file.
                if (originalPosition.source !== null) {
                  originalPosition.source = supportRelativeURL(
                    sourceMap$$1.url, originalPosition.source);
                  return originalPosition;
                }
              }

              return position;
            }

            // Parses code generated by FormatEvalOrigin(), a function inside V8:
            // https://code.google.com/p/v8/source/browse/trunk/src/messages.js
            function mapEvalOrigin(origin) {
              // Most eval() calls are in this format
              var match = /^eval at ([^(]+) \((.+):(\d+):(\d+)\)$/.exec(origin);
              if (match) {
                var position = mapSourcePosition({
                  source: match[2],
                  line: +match[3],
                  column: match[4] - 1
                });
                return 'eval at ' + match[1] + ' (' + position.source + ':' +
                  position.line + ':' + (position.column + 1) + ')';
              }

              // Parse nested eval() calls using recursion
              match = /^eval at ([^(]+) \((.+)\)$/.exec(origin);
              if (match) {
                return 'eval at ' + match[1] + ' (' + mapEvalOrigin(match[2]) + ')';
              }

              // Make sure we still return useful information if we didn't find anything
              return origin;
            }

            // This is copied almost verbatim from the V8 source code at
            // https://code.google.com/p/v8/source/browse/trunk/src/messages.js. The
            // implementation of wrapCallSite() used to just forward to the actual source
            // code of CallSite.prototype.toString but unfortunately a new release of V8
            // did something to the prototype chain and broke the shim. The only fix I
            // could find was copy/paste.
            function CallSiteToString() {
              var fileName;
              var fileLocation = "";
              if (this.isNative()) {
                fileLocation = "native";
              } else {
                fileName = this.getScriptNameOrSourceURL();
                if (!fileName && this.isEval()) {
                  fileLocation = this.getEvalOrigin();
                  fileLocation += ", ";  // Expecting source position to follow.
                }

                if (fileName) {
                  fileLocation += fileName;
                } else {
                  // Source code does not originate from a file and is not native, but we
                  // can still get the source position inside the source string, e.g. in
                  // an eval string.
                  fileLocation += "<anonymous>";
                }
                var lineNumber = this.getLineNumber();
                if (lineNumber != null) {
                  fileLocation += ":" + lineNumber;
                  var columnNumber = this.getColumnNumber();
                  if (columnNumber) {
                    fileLocation += ":" + columnNumber;
                  }
                }
              }

              var line = "";
              var functionName = this.getFunctionName();
              var addSuffix = true;
              var isConstructor = this.isConstructor();
              var isMethodCall = !(this.isToplevel() || isConstructor);
              if (isMethodCall) {
                var typeName = this.getTypeName();
                // Fixes shim to be backward compatable with Node v0 to v4
                if (typeName === "[object Object]") {
                  typeName = "null";
                }
                var methodName = this.getMethodName();
                if (functionName) {
                  if (typeName && functionName.indexOf(typeName) != 0) {
                    line += typeName + ".";
                  }
                  line += functionName;
                  if (methodName && functionName.indexOf("." + methodName) != functionName.length - methodName.length - 1) {
                    line += " [as " + methodName + "]";
                  }
                } else {
                  line += typeName + "." + (methodName || "<anonymous>");
                }
              } else if (isConstructor) {
                line += "new " + (functionName || "<anonymous>");
              } else if (functionName) {
                line += functionName;
              } else {
                line += fileLocation;
                addSuffix = false;
              }
              if (addSuffix) {
                line += " (" + fileLocation + ")";
              }
              return line;
            }

            function cloneCallSite(frame) {
              var object = {};
              Object.getOwnPropertyNames(Object.getPrototypeOf(frame)).forEach(function(name) {
                object[name] = /^(?:is|get)/.test(name) ? function() { return frame[name].call(frame); } : frame[name];
              });
              object.toString = CallSiteToString;
              return object;
            }

            function wrapCallSite(frame) {
              if(frame.isNative()) {
                return frame;
              }

              // Most call sites will return the source file from getFileName(), but code
              // passed to eval() ending in "//# sourceURL=..." will return the source file
              // from getScriptNameOrSourceURL() instead
              var source = frame.getFileName() || frame.getScriptNameOrSourceURL();
              if (source) {
                var line = frame.getLineNumber();
                var column = frame.getColumnNumber() - 1;

                // Fix position in Node where some (internal) code is prepended.
                // See https://github.com/evanw/node-source-map-support/issues/36
                var headerLength = 62;
                if (line === 1 && column > headerLength && !isInBrowser() && !frame.isEval()) {
                  column -= headerLength;
                }

                var position = mapSourcePosition({
                  source: source,
                  line: line,
                  column: column
                });
                frame = cloneCallSite(frame);
                var originalFunctionName = frame.getFunctionName;
                frame.getFunctionName = function() { return position.name || originalFunctionName(); };
                frame.getFileName = function() { return position.source; };
                frame.getLineNumber = function() { return position.line; };
                frame.getColumnNumber = function() { return position.column + 1; };
                frame.getScriptNameOrSourceURL = function() { return position.source; };
                return frame;
              }

              // Code called using eval() needs special handling
              var origin = frame.isEval() && frame.getEvalOrigin();
              if (origin) {
                origin = mapEvalOrigin(origin);
                frame = cloneCallSite(frame);
                frame.getEvalOrigin = function() { return origin; };
                return frame;
              }

              // If we get here then we were unable to change the source position
              return frame;
            }

            // This function is part of the V8 stack trace API, for more info see:
            // http://code.google.com/p/v8/wiki/JavaScriptStackTraceApi
            function prepareStackTrace(error, stack) {
              if (emptyCacheBetweenOperations) {
                fileContentsCache = {};
                sourceMapCache = {};
              }

              return error + stack.map(function(frame) {
                return '\n    at ' + wrapCallSite(frame);
              }).join('');
            }

            // Generate position and snippet of original source with pointer
            function getErrorSource(error) {
              var match = /\n    at [^(]+ \((.*):(\d+):(\d+)\)/.exec(error.stack);
              if (match) {
                var source = match[1];
                var line = +match[2];
                var column = +match[3];

                // Support the inline sourceContents inside the source map
                var contents = fileContentsCache[source];

                // Support files on disk
                if (!contents && fs && fs.existsSync(source)) {
                  try {
                    contents = fs.readFileSync(source, 'utf8');
                  } catch (er) {
                    contents = '';
                  }
                }

                // Format the line from the original source code like node does
                if (contents) {
                  var code = contents.split(/(?:\r\n|\r|\n)/)[line - 1];
                  if (code) {
                    return source + ':' + line + '\n' + code + '\n' +
                      new Array(column).join(' ') + '^';
                  }
                }
              }
              return null;
            }

            function printErrorAndExit (error) {
              var source = getErrorSource(error);

              // Ensure error is printed synchronously and not truncated
              if (process.stderr._handle && process.stderr._handle.setBlocking) {
                process.stderr._handle.setBlocking(true);
              }

              if (source) {
                console.error();
                console.error(source);
              }

              console.error(error.stack);
              process.exit(1);
            }

            function shimEmitUncaughtException () {
              var origEmit = process.emit;

              process.emit = function (type) {
                if (type === 'uncaughtException') {
                  var hasStack = (arguments[1] && arguments[1].stack);
                  var hasListeners = (this.listeners(type).length > 0);

                  if (hasStack && !hasListeners) {
                    return printErrorAndExit(arguments[1]);
                  }
                }

                return origEmit.apply(this, arguments);
              };
            }

            var originalRetrieveFileHandlers = retrieveFileHandlers.slice(0);
            var originalRetrieveMapHandlers = retrieveMapHandlers.slice(0);

            var wrapCallSite_1 = wrapCallSite;
            var getErrorSource_1 = getErrorSource;
            var mapSourcePosition_1 = mapSourcePosition;
            var retrieveSourceMap_1 = retrieveSourceMap;

            var install = function(options) {
              options = options || {};

              if (options.environment) {
                environment = options.environment;
                if (["node", "browser", "auto"].indexOf(environment) === -1) {
                  throw new Error("environment " + environment + " was unknown. Available options are {auto, browser, node}")
                }
              }

              // Allow sources to be found by methods other than reading the files
              // directly from disk.
              if (options.retrieveFile) {
                if (options.overrideRetrieveFile) {
                  retrieveFileHandlers.length = 0;
                }

                retrieveFileHandlers.unshift(options.retrieveFile);
              }

              // Allow source maps to be found by methods other than reading the files
              // directly from disk.
              if (options.retrieveSourceMap) {
                if (options.overrideRetrieveSourceMap) {
                  retrieveMapHandlers.length = 0;
                }

                retrieveMapHandlers.unshift(options.retrieveSourceMap);
              }

              // Support runtime transpilers that include inline source maps
              if (options.hookRequire && !isInBrowser()) {
                var Module;
                try {
                  Module = require$$3;
                } catch (err) {
                  // NOP: Loading in catch block to convert webpack error to warning.
                }
                var $compile = Module.prototype._compile;

                if (!$compile.__sourceMapSupport) {
                  Module.prototype._compile = function(content, filename) {
                    fileContentsCache[filename] = content;
                    sourceMapCache[filename] = undefined;
                    return $compile.call(this, content, filename);
                  };

                  Module.prototype._compile.__sourceMapSupport = true;
                }
              }

              // Configure options
              if (!emptyCacheBetweenOperations) {
                emptyCacheBetweenOperations = 'emptyCacheBetweenOperations' in options ?
                  options.emptyCacheBetweenOperations : false;
              }

              // Install the error reformatter
              if (!errorFormatterInstalled) {
                errorFormatterInstalled = true;
                Error.prepareStackTrace = prepareStackTrace;
              }

              if (!uncaughtShimInstalled) {
                var installHandler = 'handleUncaughtExceptions' in options ?
                  options.handleUncaughtExceptions : true;

                // Provide the option to not install the uncaught exception handler. This is
                // to support other uncaught exception handlers (in test frameworks, for
                // example). If this handler is not installed and there are no other uncaught
                // exception handlers, uncaught exceptions will be caught by node's built-in
                // exception handler and the process will still be terminated. However, the
                // generated JavaScript code will be shown above the stack trace instead of
                // the original source code.
                if (installHandler && hasGlobalProcessEventEmitter()) {
                  uncaughtShimInstalled = true;
                  shimEmitUncaughtException();
                }
              }
            };

            var resetRetrieveHandlers = function() {
              retrieveFileHandlers.length = 0;
              retrieveMapHandlers.length = 0;

              retrieveFileHandlers = originalRetrieveFileHandlers.slice(0);
              retrieveMapHandlers = originalRetrieveMapHandlers.slice(0);
            };

            var sourceMapSupport = {
            	wrapCallSite: wrapCallSite_1,
            	getErrorSource: getErrorSource_1,
            	mapSourcePosition: mapSourcePosition_1,
            	retrieveSourceMap: retrieveSourceMap_1,
            	install: install,
            	resetRetrieveHandlers: resetRetrieveHandlers
            };

            const hasSelf = typeof self !== 'undefined';

            const envGlobal = hasSelf ? self : global$1;

            const URL = global$1.URL
              ? global$1.URL
              : url.URL;

            const pathToFileURL = function pathToFileURL(filePath) {
                const fileUrl$$1 = new URL(fileUrl(filePath));
                if (!filePath.endsWith(path.sep)) {
                  fileUrl$$1.pathname += '/';
                }
                return fileUrl$$1;
              };

            function getDefaultBaseUrl() {
              let url$$1;

              if (typeof location !== 'undefined') {
                url$$1 = location.href.split('#')[0].split('?')[0];
                const lastSepIndex = url$$1.lastIndexOf('/');
                if (lastSepIndex !== -1) {
                  url$$1 = url$$1.slice(0, lastSepIndex + 1);
                }
              } else if (typeof process !== 'undefined') {
                url$$1 = pathToFileURL(process.cwd() + '/');
              }

              return url$$1;
            }

            const sourceMapSources = {};

            sourceMapSupport.install({
              retrieveSourceMap: function(source) {
                if (!sourceMapSources[source])
                  return null;

                return {
                  url: source.replace('!transpiled', ''),
                  map: sourceMapSources[source]
                };
              }
            });


            const baseUrl = getDefaultBaseUrl();

            const backslashRegEx = /\\/g;
            function resolveIfNotPlainOrUrl (relUrl, parentUrl) {
              if (relUrl.indexOf('\\') !== -1)
                relUrl = relUrl.replace(backslashRegEx, '/');
              // protocol-relative
              if (relUrl[0] === '/' && relUrl[1] === '/') {
                return parentUrl.slice(0, parentUrl.indexOf(':') + 1) + relUrl;
              }
              // relative-url
              else if (relUrl[0] === '.' && (relUrl[1] === '/' || relUrl[1] === '.' && (relUrl[2] === '/' || relUrl.length === 2 && (relUrl += '/')) ||
                  relUrl.length === 1  && (relUrl += '/')) ||
                  relUrl[0] === '/') {
                const parentProtocol = parentUrl.slice(0, parentUrl.indexOf(':') + 1);
                // Disabled, but these cases will give inconsistent results for deep backtracking
                //if (parentUrl[parentProtocol.length] !== '/')
                //  throw new Error('Cannot resolve');
                // read pathname from parent URL
                // pathname taken to be part after leading "/"
                let pathname;
                if (parentUrl[parentProtocol.length + 1] === '/') {
                  // resolving to a :// so we need to read out the auth and host
                  if (parentProtocol !== 'file:') {
                    pathname = parentUrl.slice(parentProtocol.length + 2);
                    pathname = pathname.slice(pathname.indexOf('/') + 1);
                  }
                  else {
                    pathname = parentUrl.slice(8);
                  }
                }
                else {
                  // resolving to :/ so pathname is the /... part
                  pathname = parentUrl.slice(parentProtocol.length + (parentUrl[parentProtocol.length] === '/'));
                }

                if (relUrl[0] === '/')
                  return parentUrl.slice(0, parentUrl.length - pathname.length - 1) + relUrl;

                // join together and split for removal of .. and . segments
                // looping the string instead of anything fancy for perf reasons
                // '../../../../../z' resolved to 'x/y' is just 'z'
                const segmented = pathname.slice(0, pathname.lastIndexOf('/') + 1) + relUrl;

                const output = [];
                let segmentIndex = -1;
                for (let i = 0; i < segmented.length; i++) {
                  // busy reading a segment - only terminate on '/'
                  if (segmentIndex !== -1) {
                    if (segmented[i] === '/') {
                      output.push(segmented.slice(segmentIndex, i + 1));
                      segmentIndex = -1;
                    }
                  }

                  // new segment - check if it is relative
                  else if (segmented[i] === '.') {
                    // ../ segment
                    if (segmented[i + 1] === '.' && (segmented[i + 2] === '/' || i + 2 === segmented.length)) {
                      output.pop();
                      i += 2;
                    }
                    // ./ segment
                    else if (segmented[i + 1] === '/' || i + 1 === segmented.length) {
                      i += 1;
                    }
                    else {
                      // the start of a new segment as below
                      segmentIndex = i;
                    }
                  }
                  // it is the start of a new segment
                  else {
                    segmentIndex = i;
                  }
                }
                // finish reading out the last segment
                if (segmentIndex !== -1)
                  output.push(segmented.slice(segmentIndex));
                return parentUrl.slice(0, parentUrl.length - pathname.length) + output.join('');
              }
            }

            /*
             * Import maps implementation
             *
             * To make lookups fast we pre-resolve the entire import map
             * and then match based on backtracked hash lookups
             *
             */

            function resolveUrl (relUrl, parentUrl) {
              return resolveIfNotPlainOrUrl(relUrl, parentUrl) ||
                  relUrl.indexOf(':') !== -1 && relUrl ||
                  resolveIfNotPlainOrUrl('./' + relUrl, parentUrl);
            }

            function resolvePackages(pkgs) {
              var outPkgs = {};
              for (var p in pkgs) {
                var value = pkgs[p];
                // TODO package fallback support
                if (typeof value !== 'string')
                  continue;
                outPkgs[resolveIfNotPlainOrUrl(p) || p] = value;
              }
              return outPkgs;
            }

            function parseImportMap (json, baseUrl) {
              const imports = resolvePackages(json.imports) || {};
              const scopes = {};
              if (json.scopes) {
                for (let scopeName in json.scopes) {
                  const scope = json.scopes[scopeName];
                  let resolvedScopeName = resolveUrl(scopeName, baseUrl);
                  if (resolvedScopeName[resolvedScopeName.length - 1] !== '/')
                    resolvedScopeName += '/';
                  scopes[resolvedScopeName] = resolvePackages(scope) || {};
                }
              }

              return { imports: imports, scopes: scopes, baseUrl: baseUrl };
            }

            function getMatch (path$$1, matchObj) {
              if (matchObj[path$$1])
                return path$$1;
              let sepIndex = path$$1.length;
              do {
                const segment = path$$1.slice(0, sepIndex + 1);
                if (segment in matchObj)
                  return segment;
              } while ((sepIndex = path$$1.lastIndexOf('/', sepIndex - 1)) !== -1)
            }

            function applyPackages (id, packages, baseUrl) {
              const pkgName = getMatch(id, packages);
              if (pkgName) {
                const pkg = packages[pkgName];
                if (pkg === null)

                if (id.length > pkgName.length && pkg[pkg.length - 1] !== '/')
                  console.warn("Invalid package target " + pkg + " for '" + pkgName + "' should have a trailing '/'.");
                return resolveUrl(pkg + id.slice(pkgName.length), baseUrl);
              }
            }

            function resolveImportMap (id, parentUrl, importMap) {
              const urlResolved = resolveIfNotPlainOrUrl(id, parentUrl);
              if (urlResolved)
                id = urlResolved;
              const scopeName = getMatch(parentUrl, importMap.scopes);
              if (scopeName) {
                const scopePackages = importMap.scopes[scopeName];
                const packageResolution = applyPackages(id, scopePackages, scopeName);
                if (packageResolution)
                  return packageResolution;
              }
              return applyPackages(id, importMap.imports, importMap.baseUrl) || urlResolved || throwBare(id, parentUrl);
            }

            function throwBare (id, parentUrl) {
              throw new Error('Unable to resolve bare specifier "' + id + (parentUrl ? '" from ' + parentUrl : '"'));
            }

            /*
             * SystemJS Core
             * 
             * Provides
             * - System.import
             * - System.register support for
             *     live bindings, function hoisting through circular references,
             *     reexports, dynamic import, import.meta.url, top-level await
             * - System.getRegister to get the registration
             * - Symbol.toStringTag support in Module objects
             * - Hookable System.createContext to customize import.meta
             * - System.onload(id, err?) handler for tracing / hot-reloading
             * 
             * Core comes with no System.prototype.resolve or
             * System.prototype.instantiate implementations
             */

            const hasSymbol = typeof Symbol !== 'undefined';
            const toStringTag = hasSymbol && Symbol.toStringTag;
            const REGISTRY = hasSymbol ? Symbol() : '@';

            function SystemJS () {
              this[REGISTRY] = {};
            }

            const systemJSPrototype = SystemJS.prototype;
            systemJSPrototype.import = function (id, parentUrl) {
              const loader = this;
              return Promise.resolve(loader.resolve(id, parentUrl))
              .then(function (id) {
                const load = getOrCreateLoad(loader, id);
                return load.C || topLevelLoad(loader, load);
              });
            };

            // Hookable createContext function -> allowing eg custom import meta
            systemJSPrototype.createContext = function (parentId) {
              return {
                url: parentId
              };
            };

            // onLoad(id, err) provided for tracing / hot-reloading
            systemJSPrototype.onload = function () {};

            let lastRegister;
            systemJSPrototype.register = function (deps, declare) {
              lastRegister = [deps, declare];
            };

            /*
             * getRegister provides the last anonymous System.register call
             */
            systemJSPrototype.getRegister = function () {
              const _lastRegister = lastRegister;
              lastRegister = undefined;
              return _lastRegister;
            };

            function getOrCreateLoad (loader, id, firstParentUrl) {
              let load = loader[REGISTRY][id];
              if (load)
                return load;

              const importerSetters = [];
              const ns = Object.create(null);
              if (toStringTag)
                Object.defineProperty(ns, toStringTag, { value: 'Module' });
              
              let instantiatePromise = Promise.resolve()
              .then(function () {
                return loader.instantiate(id, firstParentUrl);
              })
              .then(function (registration) {
                if (!registration)
                  throw new Error('Module ' + id + ' did not instantiate');
                function _export (name, value) {
                  // note if we have hoisted exports (including reexports)
                  load.h = true;
                  let changed = false;
                  if (typeof name !== 'object') {
                    if (!(name in ns) || ns[name] !== value) {
                      ns[name] = value;
                      changed = true;
                    }
                  }
                  else {
                    for (let p in name) {
                      let value = name[p];
                      if (!(p in ns) || ns[p] !== value) {
                        ns[p] = value;
                        changed = true;
                      }
                    }
                  }
                  if (changed)
                    for (let i = 0; i < importerSetters.length; i++)
                      importerSetters[i](ns);
                  return value;
                }
                const declared = registration[1](_export, registration[1].length === 2 ? {
                  import: function (importId) {
                    return loader.import(importId, id);
                  },
                  meta: loader.createContext(id)
                } : undefined);
                load.e = declared.execute || function () {};
                return [registration[0], declared.setters || []];
              });

              instantiatePromise = instantiatePromise.catch(function (err) {
                  loader.onload(load.id, err);
                  throw err;
                });

              const linkPromise = instantiatePromise
              .then(function (instantiation) {
                return Promise.all(instantiation[0].map(function (dep, i) {
                  const setter = instantiation[1][i];
                  return Promise.resolve(loader.resolve(dep, id))
                  .then(function (depId) {
                    const depLoad = getOrCreateLoad(loader, depId, id);
                    // depLoad.I may be undefined for already-evaluated
                    return Promise.resolve(depLoad.I)
                    .then(function () {
                      if (setter) {
                        depLoad.i.push(setter);
                        // only run early setters when there are hoisted exports of that module
                        // the timing works here as pending hoisted export calls will trigger through importerSetters
                        if (depLoad.h || !depLoad.I)
                          setter(depLoad.n);
                      }
                      return depLoad;
                    });
                  })
                }))
                .then(function (depLoads) {
                  load.d = depLoads;
                });
              });

              // disable unhandled rejections
              linkPromise.catch(function () {});

              // Captial letter = a promise function
              return load = loader[REGISTRY][id] = {
                id: id,
                // importerSetters, the setters functions registered to this dependency
                // we retain this to add more later
                i: importerSetters,
                // module namespace object
                n: ns,

                // instantiate
                I: instantiatePromise,
                // link
                L: linkPromise,
                // whether it has hoisted exports
                h: false,

                // On instantiate completion we have populated:
                // dependency load records
                d: undefined,
                // execution function
                // set to NULL immediately after execution (or on any failure) to indicate execution has happened
                // in such a case, pC should be used, and pLo, pLi will be emptied
                e: undefined,

                // On execution we have populated:
                // the execution error if any
                eE: undefined,
                // in the case of TLA, the execution promise
                E: undefined,

                // On execution, pLi, pLo, e cleared

                // Promise for top-level completion
                C: undefined
              };
            }

            function instantiateAll (loader, load, loaded) {
              if (!loaded[load.id]) {
                loaded[load.id] = true;
                // load.L may be undefined for already-instantiated
                return Promise.resolve(load.L)
                .then(function () {
                  return Promise.all(load.d.map(function (dep) {
                    return instantiateAll(loader, dep, loaded);
                  }));
                })
              }
            }

            function topLevelLoad (loader, load) {
              return load.C = instantiateAll(loader, load, {})
              .then(function () {
                return postOrderExec(loader, load, {});
              })
              .then(function () {
                return load.n;
              });
            }

            // the closest we can get to call(undefined)
            const nullContext = Object.freeze(Object.create(null));

            // returns a promise if and only if a top-level await subgraph
            // throws on sync errors
            function postOrderExec (loader, load, seen) {
              if (seen[load.id])
                return;
              seen[load.id] = true;

              if (!load.e) {
                if (load.eE)
                  throw load.eE;
                if (load.E)
                  return load.E;
                return;
              }

              // deps execute first, unless circular
              let depLoadPromises;
              load.d.forEach(function (depLoad) {
                {
                  try {
                    const depLoadPromise = postOrderExec(loader, depLoad, seen);
                    if (depLoadPromise)
                      (depLoadPromises = depLoadPromises || []).push(depLoadPromise);
                  }
                  catch (err) {
                    loader.onload(load.id, err);
                    throw err;
                  }
                }
              });
              if (depLoadPromises) {
                return Promise.all(depLoadPromises)
                  .then(doExec)
                  .catch(function (err) {
                    loader.onload(load.id, err);
                    throw err;
                  });
              }

              return doExec();

              function doExec () {
                try {
                  let execPromise = load.e.call(nullContext);
                  if (execPromise) {
                    execPromise = execPromise.then(function () {
                        load.C = load.n;
                        load.E = null; // indicates completion
                        loader.onload(load.id, null);
                      }, function () {
                        loader.onload(load.id, err);
                        throw err;
                      });
                    execPromise.catch(function () {});
                    return load.E = load.E || execPromise;
                  }
                  // (should be a promise, but a minify optimization to leave out Promise.resolve)
                  load.C = load.n;
                  loader.onload(load.id, null);
                }
                catch (err) {
                  loader.onload(load.id, err);
                  load.eE = err;
                  throw err;
                }
                finally {
                  load.L = load.I = undefined;
                  load.e = null;
                }
              }
            }

            envGlobal.System = new SystemJS();

            /*
             * Supports loading System.register via script tag injection
             */

            let err$1;
            if (typeof window !== 'undefined')
              window.addEventListener('error', function (e) {
                err$1 = e.error;
              });

            const systemRegister = systemJSPrototype.register;
            systemJSPrototype.register = function (deps, declare) {
              err$1 = undefined;
              systemRegister.call(this, deps, declare);
            };

            systemJSPrototype.instantiate = function (url, firstParentUrl) {
              const loader = this;
              return new Promise(function (resolve, reject) {
                const script = document.createElement('script');
                script.charset = 'utf-8';
                script.async = true;
                script.crossOrigin = 'anonymous';
                script.addEventListener('error', function () {
                  reject(new Error('Error loading ' + url + (firstParentUrl ? ' from ' + firstParentUrl : '')));
                });
                script.addEventListener('load', function () {
                  document.head.removeChild(script);
                  // Note URL normalization issues are going to be a careful concern here
                  if (err$1)
                    return reject(err$1);
                  else
                    resolve(loader.getRegister());
                });
                script.src = url;
                document.head.appendChild(script);
              });
            };

            /*
             * Supports loading System.register in workers
             */

            if (hasSelf && typeof importScripts === 'function')
              systemJSPrototype.instantiate = function (url) {
                const loader = this;
                return new Promise(function (resolve, reject) {
                  try {
                    importScripts(url);
                  }
                  catch (e) {
                    reject(e);
                  }
                  resolve(loader.getRegister());
                });
              };

            /*
             * SystemJS global script loading support
             * Extra for the s.js build only
             * (Included by default in system.js build)
             */

            const systemJSPrototype$1 = System.constructor.prototype;

            // safari unpredictably lists some new globals first or second in object order
            let firstGlobalProp, secondGlobalProp, lastGlobalProp;
            function getGlobalProp () {
              let cnt = 0;
              let lastProp;
              for (let p in commonjsGlobal) {
                if (!commonjsGlobal.hasOwnProperty(p))
                  continue;
                if (cnt === 0 && p !== firstGlobalProp || cnt === 1 && p !== secondGlobalProp)
                  return p;
                cnt++;
                lastProp = p;
              }
              if (lastProp !== lastGlobalProp)
                return lastProp;
            }

            function noteGlobalProps () {
              // alternatively Object.keys(global).pop()
              // but this may be faster (pending benchmarks)
              firstGlobalProp = secondGlobalProp = undefined;
              for (let p in commonjsGlobal) {
                if (!commonjsGlobal.hasOwnProperty(p))
                  continue;
                if (!firstGlobalProp)
                  firstGlobalProp = p;
                else if (!secondGlobalProp)
                  secondGlobalProp = p;
                lastGlobalProp = p;
              }
              return lastGlobalProp;
            }

            const impt = systemJSPrototype$1.import;
            systemJSPrototype$1.import = function (id, parentUrl) {
              noteGlobalProps();
              return impt.call(this, id, parentUrl);
            };

            const emptyInstantiation = [[], function () { return {} }];

            const getRegister = systemJSPrototype$1.getRegister;
            systemJSPrototype$1.getRegister = function () {
              const lastRegister = getRegister.call(this);
              if (lastRegister)
                return lastRegister;

              // no registration -> attempt a global detection as difference from snapshot
              // when multiple globals, we take the global value to be the last defined new global object property
              // for performance, this will not support multi-version / global collisions as previous SystemJS versions did
              // note in Edge, deleting and re-adding a global does not change its ordering
              const globalProp = getGlobalProp();
              if (!globalProp)
                return emptyInstantiation;

              let globalExport;
              try {
                globalExport = commonjsGlobal[globalProp];
              }
              catch (e) {
                return emptyInstantiation;
              }

              return [[], function (_export) {
                return { execute: function () { _export('default', globalExport); } };
              }];
            };

            /*
             * Loads WASM based on file extension detection
             * Assumes successive instantiate will handle other files
             */
            const instantiate = systemJSPrototype.instantiate;
            systemJSPrototype.instantiate = function (url, parent) {
              if (url.slice(-5) !== '.wasm')
                return instantiate.call(this, url, parent);
              
              return fetch(url)
              .then(function (res) {
                if (!res.ok)
                  throw new Error(res.status + ' ' + res.statusText + ' ' + res.url + (parent ? ' loading from ' + parent : ''));

                if (WebAssembly.compileStreaming)
                  return WebAssembly.compileStreaming(res);
                
                return res.arrayBuffer()
                .then(function (buf) {
                  return WebAssembly.compile(buf);
                });
              })
              .then(function (module) {
                const deps = [];
                const setters = [];
                const importObj = {};

                // we can only set imports if supported (eg early Safari doesnt support)
                if (WebAssembly.Module.imports)
                  WebAssembly.Module.imports(module).forEach(function (impt) {
                    const key = impt.module;
                    setters.push(function (m) {
                      importObj[key] = m;
                    });
                    if (deps.indexOf(key) === -1)
                      deps.push(key);
                  });

                return [deps, function (_export) {
                  return {
                    setters: setters,
                    execute: function () {
                      return WebAssembly.instantiate(module, importObj)
                      .then(function (instance) {
                        _export(instance.exports);
                      });
                    }
                  };
                }];
              });
            };

            /*
             * Import map support for SystemJS
             * 
             * <script type="systemjs-importmap">{}</script>
             * OR
             * <script type="systemjs-importmap" src=package.json></script>
             * 
             * Only supports loading the first import map
             */

            var importMap, importMapPromise;
            if (typeof document !== 'undefined') {
              const scripts = document.getElementsByTagName('script');
              for (let i = 0; i < scripts.length; i++) {
                const script = scripts[i];
                if (script.type !== 'systemjs-importmap')
                  continue;

                if (!script.src) {
                  importMap = parseImportMap(JSON.parse(script.innerHTML), baseUrl);
                }
                else {
                  importMapPromise = fetch(script.src)
                  .then(function (res) {
                    return res.json();
                  })
                  .then(function (json) {
                    importMap = parseImportMap(json, script.src);
                  });
                }
                break;
              }
            }

            importMap = importMap || { imports: {}, scopes: {} };

            systemJSPrototype.resolve = function (id, parentUrl) {
              parentUrl = parentUrl || baseUrl;

              if (importMapPromise)
                return importMapPromise
                .then(function () {
                  return resolveImportMap(id, parentUrl, importMap);
                });

              return resolveImportMap(id, parentUrl, importMap);
            };

            systemJSPrototype.get = function (id) {
              const load = this[REGISTRY][id];
              if (load && load.e === null && !load.E) {
                if (load.eE)
                  return null;
                return load.n;
              }
            };

            // Delete function provided for hot-reloading use cases
            systemJSPrototype.delete = function (id) {
              const load = this.get(id);
              if (load === undefined)
                return false;
              // remove from importerSetters
              // (release for gc)
              if (load && load.d)
                load.d.forEach(function (depLoad) {
                  const importerIndex = depLoad.i.indexOf(load);
                  if (importerIndex !== -1)
                    depLoad.i.splice(importerIndex, 1);
                });
              return delete this[REGISTRY][id];
            };

}());
//# sourceMappingURL=system.js.map
