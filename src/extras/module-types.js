import { resolveUrl } from '../common.js';
import {errMsg} from '../err-msg.js';

/*
 * Loads JSON, CSS, Wasm module types based on file extension
 * filters and content type verifications
 */
(function(global) {
  var systemJSPrototype = global.System.constructor.prototype;

  var moduleTypesRegEx = /^[^#?]+\.(css|html|json|wasm)([?#].*)?$/;
  var _shouldFetch = systemJSPrototype.shouldFetch.bind(systemJSPrototype)
  systemJSPrototype.shouldFetch = function (url, parent, meta) {
    var assertType = ((meta || {}).assert || {}).type;
    return _shouldFetch(url, parent, meta) || moduleTypesRegEx.test(url) || !!loaders[assertType];
  };

  var fallback = '_fallback';
  var contentTypes = [
    [/^application\/json(;|$)/, 'json'],
    [/^text\/css(;|$)/, 'css'],
    [/^application\/wasm(;|$)/, 'webassembly'],
    [/^text\/plain(;|$)/, fallback],
    [/^application\/octet-stream(;|$)/, fallback],
  ]
  var loaders = {
    'json': function (res) {
      return res.json()
        .then(function (json) {
          return new Response(new Blob([
            'System.register([],function(e){return{execute:function(){e("default",' + JSON.stringify(json) + ')}}})'
          ], {
            type: 'application/javascript'
          }));
        })
    },
    'css': function (res, url) {
      return res.text()
        .then(function (source) {
          source = source.replace(/url\(\s*(?:(["'])((?:\\.|[^\n\\"'])+)\1|((?:\\.|[^\s,"'()\\])+))\s*\)/g, function (match, quotes, relUrl1, relUrl2) {
            return 'url(' + quotes + resolveUrl(relUrl1 || relUrl2, url) + quotes + ')';
          });
          return new Response(new Blob([
            'System.register([],function(e){return{execute:function(){var s=new CSSStyleSheet();s.replaceSync(' + JSON.stringify(source) + ');e("default",s)}}})'
          ], {
            type: 'application/javascript'
          }));
        });
    },
    'webassembly': function (res, url) {
      return (WebAssembly.compileStreaming ? WebAssembly.compileStreaming(res) : res.arrayBuffer().then(WebAssembly.compile))
        .then(function (module) {
          if (!global.System.wasmModules) global.System.wasmModules = Object.create(null);
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
          return new Response(new Blob(['System.register([' + deps.join(',') + '],function(e){var i={};return{setters:[' + setterSources.join(',') + '],execute:function(){return WebAssembly.instantiate(System.wasmModules[' + JSON.stringify(url) + '],i).then(function(m){e(m.exports)})}}})'], {
            type: 'application/javascript'
          }));
        });
    }
  }

  var fetch = systemJSPrototype.fetch;
  systemJSPrototype.fetch = function (url, options) {
    return fetch(url, options)
      .then(function (res) {
        if (options.passThrough) return res;

        if (!res.ok) return res;

        var assertType = ((options.meta || {}).assert || {}).type;
        var mime = res.headers.get('content-type');
        var contentType
        for (var i = 0; i < contentTypes.length; i++) {
          var rule = contentTypes[i];
          if (rule[0].test(mime)) {
            contentType = rule[1]
            break
          }
        }

        // ensure type match
        if (assertType && contentType){
          if(contentType === fallback){
            contentType = assertType
          }
          if (assertType !== contentType){
            console.warn(process.env.SYSTEM_PRODUCTION ? errMsg('W7') : errMsg('W7', `Module ${url} has an unexpected content type of "${mime}": expected module type ${assertType} got ${contentType}.`));
            contentType = undefined
          }
        }

        var loader = loaders[contentType];
        if (loader) return loader(res, url, options);
        return res;
      });
  };
})(typeof self !== 'undefined' ? self : global);
