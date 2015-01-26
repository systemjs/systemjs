/*
 * Hash Extension
 *
 * Allows a table to be defined for hashes ammended to file names.
 *
 * The pattern assumed is:
 * app/main/file.js -> app/main/file-034980dfg0s98rs.js
 * 
 * The hash is added before the extension if there is one.
 * 
 */

function hash(loader) {
  var loaderLocate = loader.locate;
  loader.locate = function(load) {
    return Promise.resolve(loaderLocate.call(this, load))
    .then(function(address) {
      if (!load.metadata.hash)
        return address;

      var lastPart = address.substr(address.lastIndexOf('/'));
      var lastPartExExt = lastPart.substr(0, lastPart.lastIndexOf('.'));

      console.log(lastPartExExt);
      console.log(lastPart.substr(lastPartExExt.length - lastPart.length));

      return address.substr(0, address.length - lastPart.length) + lastPartExExt + '-' + load.metadata.hash + lastPart.substr(lastPartExExt.length - lastPart.length);
    });
  }
}
