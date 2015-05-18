/*
 * Script-only addition used for production loader
 *
 */

hook('fetch', function(fetch) {
  return function(load) {
    load.metadata.scriptLoad = true;
    return fetch.call(this, load);
  };
});