(function(){/*
 * Loads JSON, CSS, Wasm module types based on file extension
 * filters and content type verifications
 */
(function(global) {
  var systemJSPrototype = global.System.constructor.prototype;

  var moduleTypesRegEx = /^[^#?]+\.(css|html|json|wasm)([?#].*)?$/;
  systemJSPrototype.shouldFetch = function (url) {
    return moduleTypesRegEx.test(url);
  };

  var jsonContentType = /^application\/json(;|$)/;
  var cssContentType = /^text\/css(;|$)/;
  var wasmContentType = /^application\/wasm(;|$)/;

  var fetch = systemJSPrototype.fetch;
  systemJSPrototype.fetch = function (url, options) {
    return fetch(url, options)
    .then(function (res) {
      if (!res.ok)
        return res;
      var contentType = res.headers.get('content-type');
      if (jsonContentType.test(contentType))
        return res.json()
        .then(function (json) {
          return new Response(new Blob([
            'System.register([],function(e){return{execute:function(){e("default",' + JSON.stringify(json) + ')}}})'
          ], {
            type: 'application/javascript'
          }));
        });
      if (cssContentType.test(contentType))
        return res.text()
        .then(function (source) {
          return new Response(new Blob([
            'System.register([],function(e){return{execute:function(){var s=new CSSStyleSheet();s.replaceSync(' + JSON.stringify(source) + ');e("default",s)}}})'
          ], {
            type: 'application/javascript'
          }));
        });
      if (wasmContentType.test(contentType))
        return (WebAssembly.compileStreaming ? WebAssembly.compileStreaming(res) : res.arrayBuffer().then(WebAssembly.compile))
        .then(function (module) {
          if (!global.System.wasmModules)
            global.System.wasmModules = Object.create(null);
          global.System.wasmModules[url] = module;
          // we can only set imports if supported (eg early Safari doesnt support)
          var deps = [];
          var setterSources = [];
          if (WebAssembly.Module.imports)
            WebAssembly.Module.imports(module).forEach(function (impt) {
              var key = JSON.stringify(impt.module);
              if (deps.indexOf(key) === -1) {
                deps.push(key);
                setterSources.push('function(m){i[' + key + ']=m}');
              }
            });
          return new Response(new Blob([
            'System.register([' + deps.join(',') + '],function(e){var i={};return{setters:[' + setterSources.join(',') +
            '],execute:function(){return WebAssembly.instantiate(System.wasmModules[' + JSON.stringify(url) +
            '],i).then(function(m){e(m.exports)})}}})'
          ], {
            type: 'application/javascript'
          }));
        });
      return res;
    });
  };
})(typeof self !== 'undefined' ? self : global);}());