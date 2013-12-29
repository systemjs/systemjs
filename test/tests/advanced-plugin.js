exports.locate = function(load) {
  return new Promise(function(resolve, reject) {
    setTimeout(function() {
      resolve('custom fetch');
    }, 20);
  });
}

exports.fetch = function(load) {
  return new Promise(function(resolve, reject) {
    setTimeout(function() {
      resolve(load.address);
    }, 20);
  });
}

exports.translate = function(load) {
  return 'q = "' + load.source + '!";';
}