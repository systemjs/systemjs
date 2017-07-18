/*
 * SystemJS v0.20.15 Dev
 */
!function(){"use strict";function e(e){return et?Symbol():"@@"+e}function t(e,t){
// Convert file:/// URLs to paths in Node
Xe||(t=t.replace(Qe?/file:\/\/\//g:/file:\/\//g,""));var r,n=(e.message||e)+"\n  "+t;r=nt&&e.fileName?new Error(n,e.fileName,e.lineNumber):new Error(n);var o=e.originalErr?e.originalErr.stack:e.stack;
// node doesn't show the message otherwise
return r.stack=Ye?n+"\n  "+o:o,r.originalErr=e.originalErr||e,r}/*
 * Optimized URL normalization assuming a syntax-valid URL parent
 */
function r(e,t){throw new RangeError('Unable to resolve "'+e+'" to '+t)}function n(e,t){e=e.trim();var n=t&&t.substr(0,t.indexOf(":")+1),o=e[0],i=e[1];
// protocol-relative
if("/"===o&&"/"===i)return n||r(e,t),n+e;if("."===o&&("/"===i||"."===i&&("/"===e[2]||2===e.length&&(e+="/"))||1===e.length&&(e+="/"))||"/"===o){var a,s=!n||"/"!==t[n.length];if(s?(
// resolving to a plain parent -> skip standard URL prefix, and treat entire parent as pathname
void 0===t&&r(e,t),a=t):a="/"===t[n.length+1]?
// resolving to a :// so we need to read out the auth and host
"file:"!==n?(a=t.substr(n.length+2)).substr(a.indexOf("/")+1):t.substr(8):t.substr(n.length+1),"/"===o){if(!s)return t.substr(0,t.length-a.length-1)+e;r(e,t)}for(var u=a.substr(0,a.lastIndexOf("/")+1)+e,l=[],c=-1,f=0;f<u.length;f++)
// busy reading a segment - only terminate on '/'
if(-1===c)
// new segment - check if it is relative
if("."!==u[f])
// it is the start of a new segment
c=f;else{
// ../ segment
if("."===u[f+1]&&"/"===u[f+2])l.pop(),f+=2;else{if("/"!==u[f+1]){
// the start of a new segment as below
c=f;continue}f+=1}
// this is the plain URI backtracking error (../, package:x -> error)
s&&0===l.length&&r(e,t),
// trailing . or .. segment
f===u.length&&l.push("")}else"/"===u[f]&&(l.push(u.substring(c,f+1)),c=-1);
// finish reading out the last segment
return-1!==c&&l.push(u.substr(c)),t.substr(0,t.length-a.length)+l.join("")}return-1!==e.indexOf(":")?Ye&&":"===e[1]&&"\\"===e[2]&&e[0].match(/[a-z]/i)?"file:///"+e.replace(/\\/g,"/"):e:void 0}/*
 * Simple Array values shim
 */
function o(e){if(e.values)return e.values();if("undefined"==typeof Symbol||!Symbol.iterator)throw new Error("Symbol.iterator not supported in this browser");var t={};return t[Symbol.iterator]=function(){var t=Object.keys(e),r=0;return{next:function(){return r<t.length?{value:e[t[r++]],done:!1}:{value:void 0,done:!0}}}},t}/*
 * 3. Reflect.Loader
 *
 * We skip the entire native internal pipeline, just providing the bare API
 */
// 3.1.1
function i(){this.registry=new u}function a(e){if(!(e instanceof l))throw new TypeError("Module instantiation did not return a valid namespace object.");return e}function s(e){if(void 0===e)throw new RangeError("No resolution found.");return e}function u(){this[ut]={}}
// 8.3.1 Reflect.Module
/*
 * Best-effort simplified non-spec implementation based on
 * a baseObject referenced via getters.
 *
 * Allows:
 *
 *   loader.registry.set('x', new Module({ default: 'x' }));
 *
 * Optional evaluation function provides experimental Module.evaluate
 * support for non-executed modules in registry.
 */
function l(e){Object.defineProperty(this,lt,{value:e}),
// evaluate defers namespace population
/* if (evaluate) {
    Object.defineProperty(this, EVALUATE, {
      value: evaluate,
      configurable: true,
      writable: true
    });
  }
  else { */
Object.keys(e).forEach(c,this)}function c(e){Object.defineProperty(this,e,{enumerable:!0,get:function(){return this[lt][e]}})}function f(){i.call(this);var e=this.registry.delete;this.registry.delete=function(r){var n=e.call(this,r);
// also delete from register registry if linked
return t.hasOwnProperty(r)&&!t[r].linkRecord&&(delete t[r],n=!0),n};var t={};this[ct]={
// last anonymous System.register call
lastRegister:void 0,
// in-flight es module load records
records:t},
// tracing
this.trace=!1}
// once evaluated, the linkRecord is set to undefined leaving just the other load record properties
// this allows tracking new binding listeners for es modules through importerSetters
// for dynamic modules, the load record is removed entirely.
function d(e,t,r){return e.records[t]={key:t,
// defined System.register cache
registration:r,
// module namespace object
module:void 0,
// es-only
// this sticks around so new module loads can listen to binding changes
// for already-loaded modules by adding themselves to their importerSetters
importerSetters:void 0,loadError:void 0,evalError:void 0,
// in-flight linking record
linkRecord:{
// promise for instantiated
instantiatePromise:void 0,dependencies:void 0,execute:void 0,executingRequire:!1,
// underlying module object bindings
moduleObj:void 0,
// es only, also indicates if es or not
setters:void 0,
// promise for instantiated dependencies (dependencyInstantiations populated)
depsInstantiatePromise:void 0,
// will be the array of dependency load record or a module namespace
dependencyInstantiations:void 0}}}function p(e,t,r,n,o){
// normalization shortpath for already-normalized key
// could add a plain name filter, but doesn't yet seem necessary for perf
var i=n[t];if(i)return Promise.resolve(i);var a=o.records[t];
// already linked but not in main registry is ignored
// already linked but not in main registry is ignored
return a&&!a.module?a.loadError?Promise.reject(a.loadError):h(e,a,a.linkRecord,n,o):e.resolve(t,r).then(function(t){if(
// main loader registry always takes preference
i=n[t])return i;if(
// already has a module value but not already in the registry (load.module)
// means it was removed by registry.delete, so we should
// disgard the current load record creating a new one over it
// but keep any existing registration
(a=o.records[t])&&!a.module||(a=d(o,t,a&&a.registration)),a.loadError)return Promise.reject(a.loadError);var r=a.linkRecord;return r?h(e,a,r,n,o):a})}function g(e,t,r){return function(){var e=r.lastRegister;return e?(r.lastRegister=void 0,t.registration=e,!0):!!t.registration}}function h(e,r,n,o,i){
// if there is already an existing registration, skip running instantiate
return n.instantiatePromise||(n.instantiatePromise=(r.registration?Promise.resolve():Promise.resolve().then(function(){return i.lastRegister=void 0,e[ft](r.key,e[ft].length>1&&g(e,r,i))})).then(function(t){
// direct module return from instantiate -> we're done
if(void 0!==t){if(!(t instanceof l))throw new TypeError("Instantiate did not return a valid Module object.");return delete i.records[r.key],e.trace&&v(e,r,n),o[r.key]=t}
// run the cached loader.register declaration if there is one
var a=r.registration;if(
// clear to allow new registrations for future loads (combined with registry delete)
r.registration=void 0,!a)throw new TypeError("Module instantiation did not call an anonymous or correctly named System.register.");
// process System.registerDynamic declaration
return n.dependencies=a[0],r.importerSetters=[],n.moduleObj={},a[2]?(n.moduleObj.default=n.moduleObj.__useDefault={},n.executingRequire=a[1],n.execute=a[2]):y(e,r,n,a[1]),r}).catch(function(e){throw r.linkRecord=void 0,r.loadError=r.loadError||t(e,"Instantiating "+r.key)}))}
// like resolveInstantiate, but returning load records for linking
function m(e,t,r,n,o,i){
// normalization shortpaths for already-normalized key
// DISABLED to prioritise consistent resolver calls
// could add a plain name filter, but doesn't yet seem necessary for perf
/* var load = state.records[key];
  var module = registry[key];

  if (module) {
    if (traceDepMap)
      traceDepMap[key] = key;

    // registry authority check in case module was deleted or replaced in main registry
    if (load && load.module && load.module === module)
      return load;
    else
      return module;
  }

  // already linked but not in main registry is ignored
  if (load && !load.module) {
    if (traceDepMap)
      traceDepMap[key] = key;
    return instantiate(loader, load, load.linkRecord, registry, state);
  } */
return e.resolve(t,r).then(function(r){i&&(i[t]=r);
// normalization shortpaths for already-normalized key
var a=o.records[r],s=n[r];
// main loader registry always takes preference
if(s&&(!a||a.module&&s!==a.module))return s;if(a&&a.loadError)throw a.loadError;
// already has a module value but not already in the registry (load.module)
// means it was removed by registry.delete, so we should
// disgard the current load record creating a new one over it
// but keep any existing registration
(!a||!s&&a.module)&&(a=d(o,r,a&&a.registration));var u=a.linkRecord;return u?h(e,a,u,n,o):a})}function v(e,t,r){e.loads=e.loads||{},e.loads[t.key]={key:t.key,deps:r.dependencies,dynamicDeps:[],depMap:r.depMap||{}}}/*
 * Convert a CJS module.exports into a valid object for new Module:
 *
 *   new Module(getEsModule(module.exports))
 *
 * Sets the default value to the module, while also reading off named exports carefully.
 */
function y(e,t,r,n){var o=r.moduleObj,i=t.importerSetters,a=!1,s=n.call(Ve,function(e,t){if("object"==typeof e){var r=!1;for(var n in e)t=e[n],"__useDefault"===n||n in o&&o[n]===t||(r=!0,o[n]=t);if(!1===r)return t}else{if((a||e in o)&&o[e]===t)return t;o[e]=t}for(var s=0;s<i.length;s++)i[s](o);return t},new x(e,t.key));r.setters=s.setters,r.execute=s.execute,s.exports&&(r.moduleObj=o=s.exports,a=!0)}function b(e,r,n,o,i){if(n.depsInstantiatePromise)return n.depsInstantiatePromise;for(var a=Array(n.dependencies.length),s=0;s<n.dependencies.length;s++)a[s]=m(e,n.dependencies[s],r.key,o,i,e.trace&&n.depMap||(n.depMap={}));var u=Promise.all(a).then(function(e){
// run setters to set up bindings to instantiated dependencies
if(n.dependencyInstantiations=e,n.setters)for(var t=0;t<e.length;t++){var o=n.setters[t];if(o){var i=e[t];if(i instanceof l)o(i);else{if(i.loadError)throw i.loadError;o(i.module||i.linkRecord.moduleObj),
// this applies to both es and dynamic registrations
i.importerSetters&&i.importerSetters.push(o)}}}return r});return e.trace&&(u=u.then(function(){return v(e,r,n),r})),(u=u.catch(function(e){
// throw up the instantiateDeps stack
throw n.depsInstantiatePromise=void 0,t(e,"Loading "+r.key)})).catch(function(){}),n.depsInstantiatePromise=u}function w(e,t,r,n,o){return new Promise(function(r,i){function a(t){var r=t.linkRecord;r&&-1===u.indexOf(t)&&(u.push(t),c++,b(e,t,r,n,o).then(s,i))}function s(e){c--;var t=e.linkRecord;if(t)for(var n=0;n<t.dependencies.length;n++){var o=t.dependencyInstantiations[n];o instanceof l||a(o)}0===c&&r()}var u=[],c=0;a(t)})}
// ContextualLoader class
// backwards-compatible with previous System.register context argument by exposing .id, .key
function x(e,t){this.loader=e,this.key=this.id=t,this.meta={url:t}}/*ContextualLoader.prototype.resolve = function (key) {
  return this.loader.resolve(key, this.key);
};*/
// this is the execution function bound to the Module namespace record
function k(e,t,r,n,o,i){if(t.module)return t.module;if(t.evalError)throw t.evalError;if(i&&-1!==i.indexOf(t))return t.linkRecord.moduleObj;
// for ES loads we always run ensureEvaluate on top-level, so empty seen is passed regardless
// for dynamic loads, we pass seen if also dynamic
var a=O(e,t,r,n,o,r.setters?[]:i||[]);if(a)throw a;return t.module}function E(e,t,r,n,o,i,a){
// we can only require from already-known dependencies
return function(s){for(var u=0;u<r.length;u++)if(r[u]===s){var c,f=n[u];return(c=f instanceof l?f:k(e,f,f.linkRecord,o,i,a)).__useDefault||c}throw new Error("Module "+s+" not declared as a System.registerDynamic dependency of "+t)}}
// ensures the given es load is evaluated
// returns the error if any
function O(e,r,n,o,i,a){a.push(r);var s;
// es modules evaluate dependencies first
// non es modules explicitly call moduleEvaluate through require
if(n.setters)for(var u,c,f=0;f<n.dependencies.length;f++)if(!((u=n.dependencyInstantiations[f])instanceof l)&&(
// custom Module returned from instantiate
(c=u.linkRecord)&&-1===a.indexOf(u)&&(s=u.evalError?u.evalError:O(e,u,c,o,i,c.setters?a:[])),s))return r.linkRecord=void 0,r.evalError=t(s,"Evaluating "+r.key),r.evalError;
// link.execute won't exist for Module returns from instantiate on top-level load
if(n.execute)
// ES System.register execute
// "this" is null in ES
if(n.setters)s=S(n.execute);else{var d={id:r.key},p=n.moduleObj;Object.defineProperty(d,"exports",{configurable:!0,set:function(e){p.default=p.__useDefault=e},get:function(){return p.__useDefault}});var g=E(e,r.key,n.dependencies,n.dependencyInstantiations,o,i,a);
// evaluate deps first
if(!n.executingRequire)for(f=0;f<n.dependencies.length;f++)g(n.dependencies[f]);s=j(n.execute,g,p.default,d),
// pick up defineProperty calls to module.exports when we can
d.exports!==p.default&&(p.default=p.__useDefault=d.exports);var h=p.default;
// __esModule flag extension support via lifting
if(h&&h.__esModule)for(var m in h)Object.hasOwnProperty.call(h,m)&&(p[m]=h[m])}if(
// dispose link record
r.linkRecord=void 0,s)return r.evalError=t(s,"Evaluating "+r.key);
// if not an esm module, run importer setters and clear them
// this allows dynamic modules to update themselves into es modules
// as soon as execution has completed
if(o[r.key]=r.module=new l(n.moduleObj),!n.setters){if(r.importerSetters)for(f=0;f<r.importerSetters.length;f++)r.importerSetters[f](r.module);r.importerSetters=void 0}}function S(e){try{e.call(dt)}catch(e){return e}}function j(e,t,r,n){try{var o=e.call(Ve,t,r,n);void 0!==o&&(n.exports=o)}catch(e){return e}}function _(){}function P(e){return e instanceof l?e:new l(e&&e.__esModule?e:{default:e,__useDefault:e})}function M(e,t){(t||this.warnings&&"undefined"!=typeof console&&console.warn)&&console.warn(e)}function R(e,t,r){var n=new Uint8Array(t);
// detect by leading bytes
// Can be (new Uint32Array(fetched))[0] === 0x6D736100 when working in Node
// detect by leading bytes
// Can be (new Uint32Array(fetched))[0] === 0x6D736100 when working in Node
return 0===n[0]&&97===n[1]&&115===n[2]?WebAssembly.compile(t).then(function(t){var n=[],o=[],i={};
// we can only set imports if supported (eg Safari doesnt support)
return WebAssembly.Module.imports&&WebAssembly.Module.imports(t).forEach(function(e){var t=e.module;o.push(function(e){i[t]=e}),-1===n.indexOf(t)&&n.push(t)}),e.register(n,function(e){return{setters:o,execute:function(){e(new WebAssembly.Instance(t,i).exports)}}}),r(),!0}):Promise.resolve(!1)}function C(e,t){if("."===e[0])throw new Error("Node module "+e+" can't be loaded as it is not a package require.");if(!gt){var r=this._nodeRequire("module"),n=decodeURI(t.substr(Qe?8:7));(gt=new r(n)).paths=r._nodeModulePaths(n)}return gt.require(e)}function L(e,t){for(var r in t)Object.hasOwnProperty.call(t,r)&&(e[r]=t[r]);return e}function A(e,t){for(var r in t)Object.hasOwnProperty.call(t,r)&&void 0===e[r]&&(e[r]=t[r]);return e}
// meta first-level extends where:
// array + array appends
// object + object extends
// other properties replace
function I(e,t,r){for(var n in t)if(Object.hasOwnProperty.call(t,n)){var o=t[n];void 0===e[n]?e[n]=o:o instanceof Array&&e[n]instanceof Array?e[n]=[].concat(r?o:e[n]).concat(r?e[n]:o):"object"==typeof o&&null!==o&&"object"==typeof e[n]?e[n]=(r?A:L)(L({},e[n]),o):r||(e[n]=o)}}function F(e){
// fallback to old fashioned image technique which still works in safari
if(wt||xt){var t=document.createElement("link");wt?(t.rel="preload",t.as="script"):
// this works for all except Safari (detected by relList.supports lacking)
t.rel="prefetch",t.href=e,document.head.appendChild(t),document.head.removeChild(t)}else(new Image).src=e}function K(e,t,r){try{importScripts(e)}catch(e){r(e)}t()}function D(e,t,r,n,o){function i(){n(),s()}
// note this does not catch execution errors
function a(t){s(),o(new Error("Fetching "+e))}function s(){for(var e=0;e<kt.length;e++)if(kt[e].err===a){kt.splice(e,1);break}u.removeEventListener("load",i,!1),u.removeEventListener("error",a,!1),document.head.removeChild(u)}
// subresource integrity is not supported in web workers
if(
// percent encode just "#" for HTTP requests
e=e.replace(/#/g,"%23"),bt)return K(e,n,o);var u=document.createElement("script");u.type="text/javascript",u.charset="utf-8",u.async=!0,t&&(u.crossOrigin=t),r&&(u.integrity=r),u.addEventListener("load",i,!1),u.addEventListener("error",a,!1),u.src=e,document.head.appendChild(u)}function U(e,t){for(var r=e.split(".");r.length;)t=t[r.shift()];return t}
// separate out paths cache as a baseURL lock process
function q(e,t,r){var o=z(t,r);if(o){var i=t[o]+r.substr(o.length),a=n(i,Ze);return void 0!==a?a:e+i}return-1!==r.indexOf(":")?r:e+r}function T(e){var t=this.name;
// can add ':' here if we want paths to match the behaviour of map
if(t.substr(0,e.length)===e&&(t.length===e.length||"/"===t[e.length]||"/"===e[e.length-1]||":"===e[e.length-1])){var r=e.split("/").length;r>this.len&&(this.match=e,this.len=r)}}function z(e,t){if(Object.hasOwnProperty.call(e,t))return t;var r={name:t,match:void 0,len:0};return Object.keys(e).forEach(T,r),r.match}function N(e,t,r,n){return new Promise(function(r,o){function i(){r(n?s.response:s.responseText)}function a(){o(new Error("XHR error: "+(s.status?" ("+s.status+(s.statusText?" "+s.statusText:"")+")":"")+" loading "+e))}
// percent encode just "#" for HTTP requests
e=e.replace(/#/g,"%23");var s=new XMLHttpRequest;n&&(s.responseType="arraybuffer"),s.onreadystatechange=function(){4===s.readyState&&(
// in Chrome on file:/// URLs, status is 0
0==s.status?s.response?i():(
// when responseText is empty, wait for load or error event
// to inform if it is a 404 or empty file
s.addEventListener("error",a),s.addEventListener("load",i)):200===s.status?i():a())},s.open("GET",e,!0),s.setRequestHeader&&(s.setRequestHeader("Accept","application/x-es-module, */*"),
// can set "authorization: true" to enable withCredentials only
t&&("string"==typeof t&&s.setRequestHeader("Authorization",t),s.withCredentials=!0)),s.send(null)})}function J(){return{pluginKey:void 0,pluginArgument:void 0,pluginModule:void 0,packageKey:void 0,packageConfig:void 0,load:void 0}}function $(e,t,r){var n=J();if(r){
// detect parent plugin
// we just need pluginKey to be truthy for package configurations
// so we duplicate it as pluginArgument - although not correct its not used
var o;t.pluginFirst?-1!==(o=r.lastIndexOf("!"))&&(n.pluginArgument=n.pluginKey=r.substr(0,o)):-1!==(o=r.indexOf("!"))&&(n.pluginArgument=n.pluginKey=r.substr(o+1)),
// detect parent package
n.packageKey=z(t.packages,r),n.packageKey&&(n.packageConfig=t.packages[n.packageKey])}return n}
// normalization function used for registry keys
// just does coreResolve without map
function B(e,t){var r=Q(e.pluginFirst,t);
// plugin
if(r){var n=B.call(this,e,r.plugin);return V(e.pluginFirst,G.call(this,e,r.argument,void 0,!1,!1),n)}return G.call(this,e,t,void 0,!1,!1)}function W(e,t){var r=this[vt],n=J(),o=o||$(this,r,t),i=Q(r.pluginFirst,e);
// plugin
// plugin
return i?(n.pluginKey=W.call(this,i.plugin,t),V(r.pluginFirst,H.call(this,r,i.argument,o.pluginArgument||t,n,o,!!n.pluginKey),n.pluginKey)):H.call(this,r,e,o.pluginArgument||t,n,o,!!n.pluginKey)}function G(e,t,r,o,i){var a=n(t,r||Ze);
// standard URL resolution
if(a)return q(e.baseURL,e.paths,a);
// plain keys not starting with './', 'x://' and '/' go through custom resolution
if(o){var s=z(e.map,t);if(s&&(t=e.map[s]+t.substr(s.length),a=n(t,Ze)))return q(e.baseURL,e.paths,a)}if(this.registry.has(t))return t;if("@node/"===t.substr(0,6))return t;var u=i&&"/"!==t[t.length-1],l=q(e.baseURL,e.paths,u?t+"/":t);return u?l.substr(0,l.length-1):l}function H(e,t,r,n,o,i){
// ignore . since internal maps handled by standard package resolution
if(o&&o.packageConfig&&"."!==t[0]){var a=o.packageConfig.map,s=a&&z(a,t);if(s&&"string"==typeof a[s]){var u=ne(this,e,o.packageConfig,o.packageKey,s,t,n,i);if(u)return u}}var l=G.call(this,e,t,r,!0,!0),c=se(e,l);if(n.packageKey=c&&c.packageKey||z(e.packages,l),!n.packageKey)return l;if(-1!==e.packageConfigKeys.indexOf(l))return n.packageKey=void 0,l;n.packageConfig=e.packages[n.packageKey]||(e.packages[n.packageKey]=me());var f=l.substr(n.packageKey.length+1);return te(this,e,n.packageConfig,n.packageKey,f,n,i)}function Z(e,t,r,n,o,i){var a=this;return ht.then(function(){
// ignore . since internal maps handled by standard package resolution
if(o&&o.packageConfig&&"./"!==t.substr(0,2)){var r=o.packageConfig.map,s=r&&z(r,t);if(s)return ie(a,e,o.packageConfig,o.packageKey,s,t,n,i)}return ht}).then(function(o){if(o)return o;
// apply map, core, paths, contextual package map
var s=G.call(a,e,t,r,!0,!0),u=se(e,s);
// ensure no loader
return n.packageKey=u&&u.packageKey||z(e.packages,s),n.packageKey?-1!==e.packageConfigKeys.indexOf(s)?(n.packageKey=void 0,n.load=X(),n.load.format="json",n.load.loader="",Promise.resolve(s)):(n.packageConfig=e.packages[n.packageKey]||(e.packages[n.packageKey]=me()),(u&&!n.packageConfig.configured?ue(a,e,u.configPath,n):ht).then(function(){var t=s.substr(n.packageKey.length+1);return oe(a,e,n.packageConfig,n.packageKey,t,n,i)})):Promise.resolve(s)})}function X(){return{extension:"",deps:void 0,format:void 0,loader:void 0,scriptLoad:void 0,globals:void 0,nonce:void 0,integrity:void 0,sourceMap:void 0,exports:void 0,encapsulateGlobal:!1,crossOrigin:void 0,cjsRequireDetection:!0,cjsDeferDepsExecute:!1,esModule:!1}}function Y(e,t,r){r.load=r.load||X();
// apply wildcard metas
var n,o=0;for(var i in e.meta)if(-1!==(n=i.indexOf("*"))&&i.substr(0,n)===t.substr(0,n)&&i.substr(n+1)===t.substr(t.length-i.length+n+1)){var a=i.split("/").length;a>o&&(o=a),I(r.load,e.meta[i],o!==a)}
// apply package meta
if(
// apply exact meta
e.meta[t]&&I(r.load,e.meta[t],!1),r.packageKey){var s=t.substr(r.packageKey.length+1),u={};if(r.packageConfig.meta){o=0;le(r.packageConfig.meta,s,function(e,t,r){r>o&&(o=r),I(u,t,r&&o>r)}),I(r.load,u,!1)}
// format
!r.packageConfig.format||r.pluginKey||r.load.loader||(r.load.format=r.load.format||r.packageConfig.format)}}function Q(e,t){var r,n,o=e?t.indexOf("!"):t.lastIndexOf("!");if(-1!==o)return e?(r=t.substr(o+1),n=t.substr(0,o)):(r=t.substr(0,o),n=t.substr(o+1)||r.substr(r.lastIndexOf(".")+1)),{argument:r,plugin:n}}
// put key back together after parts have been normalized
function V(e,t,r){return e?r+"!"+t:t+"!"+r}/*
 * Package Configuration Extension
 *
 * Example:
 *
 * SystemJS.packages = {
 *   jquery: {
 *     main: 'index.js', // when not set, package key is requested directly
 *     format: 'amd',
 *     defaultExtension: 'ts', // defaults to 'js', can be set to false
 *     modules: {
 *       '*.ts': {
 *         loader: 'typescript'
 *       },
 *       'vendor/sizzle.js': {
 *         format: 'global'
 *       }
 *     },
 *     map: {
 *        // map internal require('sizzle') to local require('./vendor/sizzle')
 *        sizzle: './vendor/sizzle.js',
 *        // map any internal or external require of 'jquery/vendor/another' to 'another/index.js'
 *        './vendor/another.js': './another/index.js',
 *        // test.js / test -> lib/test.js
 *        './test.js': './lib/test.js',
 *
 *        // environment-specific map configurations
 *        './index.js': {
 *          '~browser': './index-node.js',
 *          './custom-condition.js|~export': './index-custom.js'
 *        }
 *     },
 *     // allows for setting package-prefixed depCache
 *     // keys are normalized module keys relative to the package itself
 *     depCache: {
 *       // import 'package/index.js' loads in parallel package/lib/test.js,package/vendor/sizzle.js
 *       './index.js': ['./test'],
 *       './test.js': ['external-dep'],
 *       'external-dep/path.js': ['./another.js']
 *     }
 *   }
 * };
 *
 * Then:
 *   import 'jquery'                       -> jquery/index.js
 *   import 'jquery/submodule'             -> jquery/submodule.js
 *   import 'jquery/submodule.ts'          -> jquery/submodule.ts loaded as typescript
 *   import 'jquery/vendor/another'        -> another/index.js
 *
 * Detailed Behaviours
 * - main can have a leading "./" can be added optionally
 * - map and defaultExtension are applied to the main
 * - defaultExtension adds the extension only if the exact extension is not present

 * - if a meta value is available for a module, map and defaultExtension are skipped
 * - like global map, package map also applies to subpaths (sizzle/x, ./vendor/another/sub)
 * - condition module map is '@env' module in package or '@system-env' globally
 * - map targets support conditional interpolation ('./x': './x.#{|env}.js')
 * - internal package map targets cannot use boolean conditionals
 *
 * Package Configuration Loading
 *
 * Not all packages may already have their configuration present in the System config
 * For these cases, a list of packageConfigPaths can be provided, which when matched against
 * a request, will first request a ".json" file by the package key to derive the package
 * configuration from. This allows dynamic loading of non-predetermined code, a key use
 * case in SystemJS.
 *
 * Example:
 *
 *   SystemJS.packageConfigPaths = ['packages/test/package.json', 'packages/*.json'];
 *
 *   // will first request 'packages/new-package/package.json' for the package config
 *   // before completing the package request to 'packages/new-package/path'
 *   SystemJS.import('packages/new-package/path');
 *
 *   // will first request 'packages/test/package.json' before the main
 *   SystemJS.import('packages/test');
 *
 * When a package matches packageConfigPaths, it will always send a config request for
 * the package configuration.
 * The package key itself is taken to be the match up to and including the last wildcard
 * or trailing slash.
 * The most specific package config path will be used.
 * Any existing package configurations for the package will deeply merge with the
 * package config, with the existing package configurations taking preference.
 * To opt-out of the package configuration request for a package that matches
 * packageConfigPaths, use the { configured: true } package config option.
 *
 */
function ee(e,t,r,n,o){
// don't apply extensions to folders or if defaultExtension = false
if(!n||!t.defaultExtension||"/"===n[n.length-1]||o)return n;var i=!1;if(
// exact meta or meta with any content after the last wildcard skips extension
t.meta&&le(t.meta,n,function(e,t,r){if(0===r||e.lastIndexOf("*")!==e.length-1)return i=!0}),
// exact global meta or meta with any content after the last wildcard skips extension
!i&&e.meta&&le(e.meta,r+"/"+n,function(e,t,r){if(0===r||e.lastIndexOf("*")!==e.length-1)return i=!0}),i)return n;
// work out what the defaultExtension is and add if not there already
var a="."+t.defaultExtension;return n.substr(n.length-a.length)!==a?n+a:n}function te(e,t,r,n,o,i,a){
// main
if(!o){if(!r.main)
// also no submap if key is package itself (import 'pkg' -> 'path/to/pkg.js')
// NB can add a default package main convention here
// if it becomes internal to the package then it would no longer be an exit path
return n;o="./"===r.main.substr(0,2)?r.main.substr(2):r.main}
// map config checking without then with extensions
if(r.map){var s="./"+o,u=z(r.map,s);if(
// we then check map with the default extension adding
u||(s="./"+ee(t,r,n,o,a))!=="./"+o&&(u=z(r.map,s)),u){var l=ne(e,t,r,n,u,s,i,a);if(l)return l}}
// normal package resolution
return n+"/"+ee(t,r,n,o,a)}function re(e,t,r){
// allow internal ./x -> ./x/y or ./x/ -> ./x/y recursive maps
// but only if the path is exactly ./x and not ./x/z
return!(t.substr(0,e.length)===e&&r.length>e.length)}function ne(e,t,r,n,o,i,a,s){"/"===i[i.length-1]&&(i=i.substr(0,i.length-1));var u=r.map[o];if("object"==typeof u)throw new Error("Synchronous conditional normalization not supported sync normalizing "+o+" in "+n);if(re(o,u,i)&&"string"==typeof u)return H.call(this,t,u+i.substr(o.length),n+"/",a,a,s)}function oe(e,t,r,n,o,i,a){
// main
if(!o){if(!r.main)
// NB can add a default package main convention here
// if it becomes internal to the package then it would no longer be an exit path
return Promise.resolve(n);o="./"===r.main.substr(0,2)?r.main.substr(2):r.main}
// map config checking without then with extensions
var s,u;
// we then check map with the default extension adding
return r.map&&(s="./"+o,(u=z(r.map,s))||(s="./"+ee(t,r,n,o,a))!=="./"+o&&(u=z(r.map,s))),(u?ie(e,t,r,n,u,s,i,a):ht).then(function(e){return e?Promise.resolve(e):Promise.resolve(n+"/"+ee(t,r,n,o,a))})}function ie(e,t,r,n,o,i,a,s){"/"===i[i.length-1]&&(i=i.substr(0,i.length-1));var u=r.map[o];if("string"==typeof u)return re(o,u,i)?Z.call(e,t,u+i.substr(o.length),n+"/",a,a,s).then(function(t){return de.call(e,t,n+"/",a)}):ht;
// we use a special conditional syntax to allow the builder to handle conditional branch points further
/*if (loader.builder)
    return Promise.resolve(pkgKey + '/#:' + path);*/
// we load all conditions upfront
var l=[],c=[];for(var d in u){var p=ce(d);c.push({condition:p,map:u[d]}),l.push(f.prototype.import.call(e,p.module,n))}
// map object -> conditional map
return Promise.all(l).then(function(e){
// first map condition to match is used
for(var t=0;t<c.length;t++){var r=c[t].condition,n=U(r.prop,"__useDefault"in e[t]?e[t].__useDefault:e[t]);if(!r.negate&&n||r.negate&&!n)return c[t].map}}).then(function(r){if(r)return re(o,r,i)?Z.call(e,t,r+i.substr(o.length),n+"/",a,a,s).then(function(t){return de.call(e,t,n+"/",a)}):ht})}
// data object for quick checks against package paths
function ae(e){var t=e.lastIndexOf("*"),r=Math.max(t+1,e.lastIndexOf("/"));return{length:r,regEx:new RegExp("^("+e.substr(0,r).replace(/[.+?^${}()|[\]\\]/g,"\\$&").replace(/\*/g,"[^\\/]+")+")(\\/|$)"),wildcard:-1!==t}}
// most specific match wins
function se(e,t){for(var r,n,o=!1,i=0;i<e.packageConfigPaths.length;i++){var a=e.packageConfigPaths[i],s=Mt[a]||(Mt[a]=ae(a));if(!(t.length<s.length)){var u=t.match(s.regEx);!u||r&&(o&&s.wildcard||!(r.length<u[1].length))||(r=u[1],o=!s.wildcard,n=r+a.substr(s.length))}}if(r)return{packageKey:r,configPath:n}}function ue(e,r,n,o,i){var a=e.pluginLoader||e;
// ensure we note this is a package config file path
// it will then be skipped from getting other normalizations itself to ensure idempotency
return-1===r.packageConfigKeys.indexOf(n)&&r.packageConfigKeys.push(n),a.import(n).then(function(e){ve(o.packageConfig,e,o.packageKey,!0,r),o.packageConfig.configured=!0}).catch(function(e){throw t(e,"Unable to fetch package configuration file "+n)})}function le(e,t,r){
// wildcard meta
var n;for(var o in e){
// allow meta to start with ./ for flexibility
var i="./"===o.substr(0,2)?"./":"";if(i&&(o=o.substr(2)),-1!==(n=o.indexOf("*"))&&o.substr(0,n)===t.substr(0,n)&&o.substr(n+1)===t.substr(t.length-o.length+n+1)&&r(o,e[i+o],o.split("/").length))return}
// exact meta
var a=e[t]&&Object.hasOwnProperty.call(e,t)?e[t]:e["./"+t];a&&r(a,a,0)}function ce(e){var t,r,n,o=e.lastIndexOf("|");return-1!==o?(t=e.substr(o+1),r=e.substr(0,o),"~"===t[0]&&(n=!0,t=t.substr(1))):(n="~"===e[0],t="default",r=e.substr(n),-1!==Rt.indexOf(r)&&(t=r,r=null)),{module:r||"@system-env",prop:t,negate:n}}function fe(e,t,r){
// import without __useDefault handling here
return f.prototype.import.call(this,e.module,t).then(function(t){var n=U(e.prop,t);if(r&&"boolean"!=typeof n)throw new TypeError("Condition did not resolve to a boolean.");return e.negate?!n:n})}function de(e,t,r){
// first we normalize the conditional
var n=e.match(Ct);if(!n)return Promise.resolve(e);var o=ce.call(this,n[0].substr(2,n[0].length-3));
// in builds, return normalized conditional
/*if (this.builder)
    return this.normalize(conditionObj.module, parentKey, createMetadata(), parentMetadata)
    .then(function (conditionModule) {
      conditionObj.module = conditionModule;
      return key.replace(interpolationRegEx, '#{' + serializeCondition(conditionObj) + '}');
    });*/
return fe.call(this,o,t,!1).then(function(r){if("string"!=typeof r)throw new TypeError("The condition value for "+e+" doesn't resolve to a string.");if(-1!==r.indexOf("/"))throw new TypeError("Unabled to interpolate conditional "+e+(t?" in "+t:"")+"\n\tThe condition value "+r+' cannot contain a "/" separator.');return e.replace(Ct,r)})}function pe(e,t,r){for(var n=0;n<Lt.length;n++){var o=Lt[n];t[o]&&hr[o.substr(0,o.length-6)]&&r(t[o])}}function ge(e,t){var r={};for(var n in e){var o=e[n];t>1?o instanceof Array?r[n]=[].concat(o):"object"==typeof o?r[n]=ge(o,t-1):"packageConfig"!==n&&(r[n]=o):r[n]=o}return r}function he(e,t){var r=e[t];
// getConfig must return an unmodifiable clone of the configuration
// getConfig must return an unmodifiable clone of the configuration
return r instanceof Array?e[t].concat([]):"object"==typeof r?ge(r,3):e[t]}function me(){return{defaultExtension:void 0,main:void 0,format:void 0,meta:void 0,map:void 0,packageConfig:void 0,configured:!1}}
// deeply-merge (to first level) config with any existing package config
function ve(e,t,r,n,o){for(var i in t)"main"===i||"format"===i||"defaultExtension"===i||"configured"===i?n&&void 0!==e[i]||(e[i]=t[i]):"map"===i?(n?A:L)(e.map=e.map||{},t.map):"meta"===i?(n?A:L)(e.meta=e.meta||{},t.meta):Object.hasOwnProperty.call(t,i)&&M.call(o,'"'+i+'" is not a valid package configuration option in package '+r);
// default defaultExtension for packages only
return void 0===e.defaultExtension&&(e.defaultExtension="js"),void 0===e.main&&e.map&&e.map["."]?(e.main=e.map["."],delete e.map["."]):"object"==typeof e.main&&(e.map=e.map||{},e.map["./@main"]=e.main,e.main.default=e.main.default||"./",e.main="@main"),e}function ye(e){return At?Ut+new Buffer(e).toString("base64"):"undefined"!=typeof btoa?Ut+btoa(unescape(encodeURIComponent(e))):""}function be(e,t,r,n){var o=e.lastIndexOf("\n");if(t){if("object"!=typeof t)throw new TypeError("load.metadata.sourceMap must be set to an object.");t=JSON.stringify(t)}return(n?"(function(System, SystemJS) {":"")+e+(n?"\n})(System, System);":"")+("\n//# sourceURL="!=e.substr(o,15)?"\n//# sourceURL="+r+(t?"!transpiled":""):"")+(t&&ye(t)||"")}function we(e,t,r,n,o){It||(It=document.head||document.body||document.documentElement);var i=document.createElement("script");i.text=be(t,r,n,!1);var a,s=window.onerror;if(window.onerror=function(e){a=addToError(e,"Evaluating "+n),s&&s.apply(this,arguments)},xe(e),o&&i.setAttribute("nonce",o),It.appendChild(i),It.removeChild(i),ke(),window.onerror=s,a)return a}function xe(e){0==qt++&&(Dt=Ve.System),Ve.System=Ve.SystemJS=e}function ke(){0==--qt&&(Ve.System=Ve.SystemJS=Dt)}function Ee(e,t,r,n,o,i,a){if(t){if(i&&Tt)return we(e,t,r,n,i);try{xe(e),
// global scoped eval for node (avoids require scope leak)
!Ft&&e._nodeRequire&&(Ft=e._nodeRequire("vm"),Kt=Ft.runInThisContext("typeof System !== 'undefined' && System")===e),Kt?Ft.runInThisContext(be(t,r,n,!a),{filename:n+(r?"!transpiled":"")}):(0,eval)(be(t,r,n,!a)),ke()}catch(e){return ke(),e}}}function Oe(e){return"file:///"===e.substr(0,8)?e.substr(7+!!Qe):zt&&e.substr(0,zt.length)===zt?e.substr(zt.length):e}function Se(e,t){return Oe(this.normalizeSync(e,t))}function je(e){
// remove any plugin syntax
var t,r=e.lastIndexOf("!"),n=(t=-1!==r?e.substr(0,r):e).split("/");return n.pop(),n=n.join("/"),{filename:Oe(t),dirname:Oe(n)}}
// extract CJS dependencies from source text via regex static analysis
// read require('x') statements not in comments or strings
function _e(e){function t(e,t){for(var r=0;r<e.length;r++)if(e[r][0]<t.index&&e[r][1]>t.index)return!0;return!1}jt.lastIndex=Gt.lastIndex=Ht.lastIndex=0;var r,n=[],o=[],i=[];if(e.length/e.split("\n").length<200){for(;r=Ht.exec(e);)o.push([r.index,r.index+r[0].length]);
// TODO: track template literals here before comments
for(;r=Gt.exec(e);)
// only track comments not starting in strings
t(o,r)||i.push([r.index+r[1].length,r.index+r[0].length-1])}for(;r=jt.exec(e);)
// ensure we're not within a string or comment location
if(!t(o,r)&&!t(i,r)){var a=r[1].substr(1,r[1].length-2);
// skip cases like require('" + file + "')
if(a.match(/"|'/))continue;n.push(a)}return n}function Pe(e){if(-1===Zt.indexOf(e)){try{var t=Ve[e]}catch(t){Zt.push(e)}this(e,t)}}function Me(e){if("string"==typeof e)return U(e,Ve);if(!(e instanceof Array))throw new Error("Global exports must be a string or array.");for(var t={},r=0;r<e.length;r++)t[e[r].split(".").pop()]=U(e[r],Ve);return t}function Re(e,t,r,n){
// disable module detection
var o=Ve.define;Ve.define=void 0;
// set globals
var i;if(r){i={};for(var a in r)i[a]=Ve[a],Ve[a]=r[a]}
// return function to retrieve global
// store a complete copy of the global object in order to detect changes
return t||(Jt={},Object.keys(Ve).forEach(Pe,function(e,t){Jt[e]=t})),function(){var e,r=t?Me(t):{},a=!!t;
// revert globals
if(t&&!n||Object.keys(Ve).forEach(Pe,function(o,i){Jt[o]!==i&&void 0!==i&&(
// allow global encapsulation where globals are removed
n&&(Ve[o]=void 0),t||(r[o]=i,void 0!==e?a||e===i||(a=!0):e=i))}),r=a?r:e,i)for(var s in i)Ve[s]=i[s];return Ve.define=o,r}}function Ce(e,t){
// determine the require alias
var r=((
// remove comments
e=e.replace(Gt,"")).match(Qt)[1].split(",")[t]||"require").replace(Vt,""),n=er[r]||(er[r]=new RegExp(Xt+r+Yt,"g"));n.lastIndex=0;for(var o,i=[];o=n.exec(e);)i.push(o[2]||o[3]);return i}function Le(e){return function(t,r,n){e(t,r,n),"object"!=typeof(r=n.exports)&&"function"!=typeof r||"__esModule"in r||Object.defineProperty(n.exports,"__esModule",{value:!0})}}function Ae(e,t){Bt=e,rr=t,$t=void 0,tr=!1}function Ie(e){$t?e.registerDynamic(Bt?$t[0].concat(Bt):$t[0],!1,rr?Le($t[1]):$t[1]):tr&&e.registerDynamic([],!1,_)}function Fe(e,t){!e.load.esModule||"object"!=typeof t&&"function"!=typeof t||"__esModule"in t||Object.defineProperty(t,"__esModule",{value:!0})}function Ke(e,t,r){return r.pluginKey?e.import(r.pluginKey).then(function(e){r.pluginModule=e,r.pluginLoad={name:t,address:r.pluginArgument,source:void 0,metadata:r.load},r.load.deps=r.load.deps||[]}):ht}function De(e,t,r){
// load direct deps, in turn will pick up their trace trees
var n=e.depCache[r];if(n)for(a=0;a<n.length;a++)t.normalize(n[a],r).then(F);else{var o=!1;for(var i in e.bundles){for(var a=0;a<e.bundles[i].length;a++){var s=e.bundles[i][a];if(s===r){o=!0;break}
// wildcard in bundles includes / boundaries
if(-1!==s.indexOf("*")){var u=s.split("*");if(2!==u.length){e.bundles[i].splice(a--,1);continue}if(r.substr(0,u[0].length)===u[0]&&r.substr(r.length-u[1].length,u[1].length)===u[1]){o=!0;break}}}if(o)return t.import(i)}}}function Ue(e,t,r,n,o){return r.load.exports&&!r.load.format&&(r.load.format="global"),ht.then(function(){if(r.pluginModule&&r.pluginModule.locate)return Promise.resolve(r.pluginModule.locate.call(e,r.pluginLoad)).then(function(e){e&&(r.pluginLoad.address=e)})}).then(function(){return r.pluginModule?(o=!1,r.pluginModule.fetch?r.pluginModule.fetch.call(e,r.pluginLoad,function(e){return Pt(e.address,r.load.authorization,r.load.integrity,!1)}):Pt(r.pluginLoad.address,r.load.authorization,r.load.integrity,!1)):Pt(t,r.load.authorization,r.load.integrity,o)}).then(function(i){
// fetch is already a utf-8 string if not doing wasm detection
// fetch is already a utf-8 string if not doing wasm detection
return o&&"string"!=typeof i?R(e,i,n).then(function(o){if(!o){
// not wasm -> convert buffer into utf-8 string to execute as a module
// TextDecoder compatibility matches WASM currently. Need to keep checking this.
// The TextDecoder interface is documented at http://encoding.spec.whatwg.org/#interface-textdecoder
var a=Xe?new TextDecoder("utf-8").decode(new Uint8Array(i)):i.toString();return qe(e,t,a,r,n)}}):qe(e,t,i,r,n)})}function qe(e,t,r,n,o){return Promise.resolve(r).then(function(t){return"detect"===n.load.format&&(n.load.format=void 0),Be(t,n),n.pluginModule&&n.pluginModule.translate?(n.pluginLoad.source=t,Promise.resolve(n.pluginModule.translate.call(e,n.pluginLoad,n.traceOpts)).then(function(e){if(n.load.sourceMap){if("object"!=typeof n.load.sourceMap)throw new Error("metadata.load.sourceMap must be set to an object.");Ne(n.pluginLoad.address,n.load.sourceMap)}return"string"==typeof e?e:n.pluginLoad.source})):t}).then(function(r){return n.load.format||'"bundle"'!==r.substring(0,8)?"register"===n.load.format||!n.load.format&&Te(r)?(n.load.format="register",r):"esm"===n.load.format||!n.load.format&&r.match(ar)?(n.load.format="esm",Je(e,r,t,n,o)):r:(n.load.format="system",r)}).then(function(t){if("string"!=typeof t||!n.pluginModule||!n.pluginModule.instantiate)return t;var r=!1;return n.pluginLoad.source=t,Promise.resolve(n.pluginModule.instantiate.call(e,n.pluginLoad,function(e){if(t=e.source,n.load=e.metadata,r)throw new Error("Instantiate must only be called once.");r=!0})).then(function(e){return r?t:P(e)})}).then(function(r){
// plugin instantiate result case
if("string"!=typeof r)return r;n.load.format||(n.load.format=ze(r));var i=!1;switch(n.load.format){case"esm":case"register":case"system":if(u=Ee(e,r,n.load.sourceMap,t,n.load.integrity,n.load.nonce,!1))throw u;if(!o())return mt;return;case"json":
// warn.call(config, '"json" module format is deprecated.');
var a=JSON.parse(r);return e.newModule({default:a,__useDefault:a});case"amd":var s=Ve.define;Ve.define=e.amdDefine,Ae(n.load.deps,n.load.esModule);var u=Ee(e,r,n.load.sourceMap,t,n.load.integrity,n.load.nonce,!1);if(
// if didn't register anonymously, use the last named define if only one
(i=o())||(Ie(e),i=o()),Ve.define=s,u)throw u;break;case"cjs":var l=n.load.deps,c=(n.load.deps||[]).concat(n.load.cjsRequireDetection?_e(r):[]);for(var f in n.load.globals)n.load.globals[f]&&c.push(n.load.globals[f]);e.registerDynamic(c,!0,function(o,i,a){
// ensure meta deps execute first
if(o.resolve=function(t){return Se.call(e,t,a.id)},
// support module.paths ish
a.paths=[],a.require=o,!n.load.cjsDeferDepsExecute&&l)for(var s=0;s<l.length;s++)o(l[s]);var u=je(a.id),c={exports:i,args:[o,i,a,u.filename,u.dirname,Ve,Ve]},f="(function (require, exports, module, __filename, __dirname, global, GLOBAL";
// add metadata.globals to the wrapper arguments
if(n.load.globals)for(var d in n.load.globals)c.args.push(o(n.load.globals[d])),f+=", "+d;
// disable AMD detection
var p=Ve.define;Ve.define=void 0,Ve.__cjsWrapper=c,r=f+") {"+r.replace(cr,"")+"\n}).apply(__cjsWrapper.exports, __cjsWrapper.args);";var g=Ee(e,r,n.load.sourceMap,t,n.load.integrity,n.load.nonce,!1);if(g)throw g;Fe(n,i),Ve.__cjsWrapper=void 0,Ve.define=p}),i=o();break;case"global":c=n.load.deps||[];for(var f in n.load.globals){var d=n.load.globals[f];d&&c.push(d)}e.registerDynamic(c,!1,function(o,i,a){var s;if(n.load.globals){s={};for(var u in n.load.globals)n.load.globals[u]&&(s[u]=o(n.load.globals[u]))}var l=n.load.exports;l&&(r+="\n"+ir+'["'+l+'"] = '+l+";");var c=Re(a.id,l,s,n.load.encapsulateGlobal),f=Ee(e,r,n.load.sourceMap,t,n.load.integrity,n.load.nonce,!0);if(f)throw f;var d=c();return Fe(n,d),d}),i=o();break;default:throw new TypeError('Unknown module format "'+n.load.format+'" for "'+t+'".'+("es6"===n.load.format?' Use "esm" instead here.':""))}if(!i)throw new Error("Module "+t+" detected as "+n.load.format+" but didn't execute correctly.")})}function Te(e){var t=e.match(sr);return t&&"System.register"===e.substr(t[0].length,15)}function ze(e){return e.match(ur)?"amd":(lr.lastIndex=0,jt.lastIndex=0,jt.exec(e)||lr.exec(e)?"cjs":"global")}function Ne(e,t){var r=e.split("!")[0];
// force set the filename of the original file
t.file&&t.file!=e||(t.file=r+"!transpiled"),
// force set the sources list if only one source
(!t.sources||t.sources.length<=1&&(!t.sources[0]||t.sources[0]===e))&&(t.sources=[r])}function Je(e,r,n,o,i){if(!e.transpiler)throw new TypeError("Unable to dynamically transpile ES module\n   A loader plugin needs to be configured via `SystemJS.config({ transpiler: 'transpiler-module' })`.");
// deps support for es transpile
if(o.load.deps){for(var a="",s=0;s<o.load.deps.length;s++)a+='import "'+o.load.deps[s]+'"; ';r=a+r}
// do transpilation
return e.import.call(e,e.transpiler).then(function(t){
// translate hooks means this is a transpiler plugin instead of a raw implementation
if(!(t=t.__useDefault||t).translate)throw new Error(e.transpiler+" is not a valid transpiler plugin.");
// if transpiler is the same as the plugin loader, then don't run twice
// if transpiler is the same as the plugin loader, then don't run twice
// convert the source map into an object for transpilation chaining
return t===o.pluginModule?r:("string"==typeof o.load.sourceMap&&(o.load.sourceMap=JSON.parse(o.load.sourceMap)),o.pluginLoad=o.pluginLoad||{name:n,address:n,source:r,metadata:o.load},o.load.deps=o.load.deps||[],Promise.resolve(t.translate.call(e,o.pluginLoad,o.traceOpts)).then(function(e){
// sanitize sourceMap if an object not a JSON string
var t=o.load.sourceMap;return t&&"object"==typeof t&&Ne(n,t),"esm"===o.load.format&&Te(e)&&(o.load.format="register"),e}))},function(e){throw t(e,"Unable to load transpiler to transpile "+n)})}function $e(e,t,r){for(var n,o=t.split(".");o.length>1;)e=e[n=o.shift()]=e[n]||{};void 0===e[n=o.shift()]&&(e[n]=r)}function Be(e,t){var r=e.match(fr);if(r)for(var n=r[0].match(dr),o=0;o<n.length;o++){var i=n[o],a=i.length,s=i.substr(0,1);if(";"==i.substr(a-1,1)&&a--,'"'==s||"'"==s){var u=i.substr(1,i.length-3),l=u.substr(0,u.indexOf(" "));if(l){var c=u.substr(l.length+1,u.length-l.length-1);"deps"===l&&(l="deps[]"),"[]"===l.substr(l.length-2,2)?(l=l.substr(0,l.length-2),t.load[l]=t.load[l]||[],t.load[l].push(c)):"use"!==l&&$e(t.load,l,c)}else t.load[u]=!0}}}function We(){f.call(this),
// NB deprecate
this._loader={},
// internal metadata store
this[yt]={},
// internal configuration
this[vt]={baseURL:Ze,paths:{},packageConfigPaths:[],packageConfigKeys:[],map:{},packages:{},depCache:{},meta:{},bundles:{},production:!1,transpiler:void 0,loadedBundles:{},
// global behaviour flags
warnings:!1,pluginFirst:!1,
// enable wasm loading and detection when supported
wasm:!1},
// make the location of the system.js script accessible (if any)
this.scriptSrc=or,this._nodeRequire=Wt,
// support the empty module, as a concept
this.registry.set("@empty",mt),Ge.call(this,!1,!1),
// add module format helpers
Nt(this)}function Ge(e,t){this[vt].production=e,this.registry.set("@system-env",hr=this.newModule({browser:Xe,node:!!this._nodeRequire,production:!t&&e,dev:t||!e,build:t,default:!0}))}/*
 * Backwards-compatible registry API, to be deprecated
 */
function He(e,t){M.call(e[vt],"SystemJS."+t+" is deprecated for SystemJS.registry."+t)}/*
 * Environment
 */
var Ze,Xe="undefined"!=typeof window&&"undefined"!=typeof document,Ye="undefined"!=typeof process&&process.versions&&process.versions.node,Qe="undefined"!=typeof process&&"string"==typeof process.platform&&process.platform.match(/^win/),Ve="undefined"!=typeof self?self:global,et="undefined"!=typeof Symbol;
// environent baseURI detection
if("undefined"!=typeof document&&document.getElementsByTagName){if(!(Ze=document.baseURI)){var tt=document.getElementsByTagName("base");Ze=tt[0]&&tt[0].href||window.location.href}}else"undefined"!=typeof location&&(Ze=location.href);
// sanitize out the hash and querystring
if(Ze){var rt=(Ze=Ze.split("#")[0].split("?")[0]).lastIndexOf("/");-1!==rt&&(Ze=Ze.substr(0,rt+1))}else{if("undefined"==typeof process||!process.cwd)throw new TypeError("No environment baseURI");Ze="file://"+(Qe?"/":"")+process.cwd(),Qe&&(Ze=Ze.replace(/\\/g,"/"))}
// ensure baseURI has trailing "/"
"/"!==Ze[Ze.length-1]&&(Ze+="/");/*
 * LoaderError with chaining for loader stacks
 */
var nt="_"==new Error(0,"_").fileName,ot=Promise.resolve();
// 3.3.1
i.prototype.constructor=i,
// 3.3.2
i.prototype.import=function(e,r){if("string"!=typeof e)throw new TypeError("Loader import method must be passed a module key string");
// custom resolveInstantiate combined hook for better perf
var n=this;return ot.then(function(){return n[at](e,r)}).then(a).catch(function(n){throw t(n,"Loading "+e+(r?" from "+r:""))})};
// 3.3.3
var it=i.resolve=e("resolve"),at=i.resolveInstantiate=e("resolveInstantiate");
// default resolveInstantiate is just to call resolve and then get from the registry
// this provides compatibility for the resolveInstantiate optimization
i.prototype[at]=function(e,t){var r=this;return r.resolve(e,t).then(function(e){return r.registry.get(e)})},i.prototype.resolve=function(e,r){var n=this;return ot.then(function(){return n[it](e,r)}).then(s).catch(function(n){throw t(n,"Resolving "+e+(r?" to "+r:""))})};
// 3.3.4 (import without evaluate)
// this is not documented because the use of deferred evaluation as in Module.evaluate is not
// documented, as it is not considered a stable feature to be encouraged
// Loader.prototype.load may well be deprecated if this stays disabled
/* Loader.prototype.load = function (key, parent) {
  return Promise.resolve(this[RESOLVE_INSTANTIATE](key, parent || this.key))
  .catch(function (err) {
    throw addToError(err, 'Loading ' + key + (parent ? ' from ' + parent : ''));
  });
}; */
/*
 * 4. Registry
 *
 * Instead of structuring through a Map, just use a dictionary object
 * We throw for construction attempts so this doesn't affect the public API
 *
 * Registry has been adjusted to use Namespace objects over ModuleStatus objects
 * as part of simplifying loader API implementation
 */
var st="undefined"!=typeof Symbol&&Symbol.iterator,ut=e("registry");
// 4.4.1
st&&(
// 4.4.2
u.prototype[Symbol.iterator]=function(){return this.entries()[Symbol.iterator]()},
// 4.4.3
u.prototype.entries=function(){var e=this[ut];return o(Object.keys(e).map(function(t){return[t,e[t]]}))}),
// 4.4.4
u.prototype.keys=function(){return o(Object.keys(this[ut]))},
// 4.4.5
u.prototype.values=function(){var e=this[ut];return o(Object.keys(e).map(function(t){return e[t]}))},
// 4.4.6
u.prototype.get=function(e){return this[ut][e]},
// 4.4.7
u.prototype.set=function(e,t){if(!(t instanceof l))throw new Error("Registry must be set with an instance of Module Namespace");return this[ut][e]=t,this},
// 4.4.8
u.prototype.has=function(e){return Object.hasOwnProperty.call(this[ut],e)},
// 4.4.9
u.prototype.delete=function(e){return!!Object.hasOwnProperty.call(this[ut],e)&&(delete this[ut][e],!0)};/*
 * Simple ModuleNamespace Exotic object based on a baseObject
 * We export this for allowing a fast-path for module namespace creation over Module descriptors
 */
// var EVALUATE = createSymbol('evaluate');
var lt=e("baseObject");
// 8.4.2
l.prototype=Object.create(null),"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(l.prototype,Symbol.toStringTag,{value:"Module"});/* function doEvaluate (evaluate, context) {
  try {
    evaluate.call(context);
  }
  catch (e) {
    return e;
  }
}

// 8.4.1 Module.evaluate... not documented or used because this is potentially unstable
Module.evaluate = function (ns) {
  var evaluate = ns[EVALUATE];
  if (evaluate) {
    ns[EVALUATE] = undefined;
    var err = doEvaluate(evaluate);
    if (err) {
      // cache the error
      ns[EVALUATE] = function () {
        throw err;
      };
      throw err;
    }
    Object.keys(ns[BASE_OBJECT]).forEach(extendNamespace, ns);
  }
  // make chainable
  return ns;
}; */
/*
 * Register Loader
 *
 * Builds directly on top of loader polyfill to provide:
 * - loader.register support
 * - hookable higher-level resolve
 * - instantiate hook returning a ModuleNamespace or undefined for es module loading
 * - loader error behaviour as in HTML and loader specs, caching load and eval errors separately
 * - build tracing support by providing a .trace=true and .loads object format
 */
var ct=e("register-internal");f.prototype=Object.create(i.prototype),f.prototype.constructor=f;var ft=f.instantiate=e("instantiate");
// default normalize is the WhatWG style normalizer
f.prototype[f.resolve=i.resolve]=function(e,t){return n(e,t||Ze)},f.prototype[ft]=function(e,t){},f.prototype[i.resolveInstantiate]=function(e,t){var r=this,n=this[ct],o=this.registry[ut];return p(r,e,t,o,n).then(function(e){if(e instanceof l)return e;
// resolveInstantiate always returns a load record with a link record and no module value
var t=e.linkRecord;
// if already beaten to done, return
if(!t){if(e.module)return e.module;throw e.evalError}return w(r,e,0,o,n).then(function(){return k(r,e,t,o,n,void 0)})})},/*
 * System.register
 */
f.prototype.register=function(e,t,r){var n=this[ct];
// anonymous modules get stored as lastAnon
void 0===r?n.lastRegister=[e,t,void 0]:(n.records[e]||d(n,e,void 0)).registration=[t,r,void 0]},/*
 * System.registerDyanmic
 */
f.prototype.registerDynamic=function(e,t,r,n){var o=this[ct];
// anonymous modules get stored as lastAnon
"string"!=typeof e?o.lastRegister=[e,t,r]:(o.records[e]||d(o,e,void 0)).registration=[t,r,n]},/*ContextualLoader.prototype.constructor = function () {
  throw new TypeError('Cannot subclass the contextual loader only Reflect.Loader.');
};*/
x.prototype.import=function(e){return this.loader.trace&&this.loader.loads[this.key].dynamicDeps.push(e),this.loader.import(e,this.key)};
// {} is the closest we can get to call(undefined)
var dt={};Object.freeze&&Object.freeze(dt);var pt,gt,ht=Promise.resolve(),mt=new l({}),vt=e("loader-config"),yt=e("metadata"),bt="undefined"==typeof window&&"undefined"!=typeof self&&"undefined"!=typeof importScripts,wt=!1,xt=!1;if(Xe&&function(){var e=document.createElement("link").relList;if(e&&e.supports){xt=!0;try{wt=e.supports("preload")}catch(e){}}}(),Xe){var kt=[],Et=window.onerror;window.onerror=function(e,t){for(var r=0;r<kt.length;r++)if(kt[r].src===t)return void kt[r].err(e);Et&&Et.apply(this,arguments)}}
// RegEx adjusted from https://github.com/jbrantly/yabble/blob/master/lib/yabble.js#L339
var Ot,St,jt=/(?:^\uFEFF?|[^$_a-zA-Z\xA0-\uFFFF."'])require\s*\(\s*("[^"\\]*(?:\\.[^"\\]*)*"|'[^'\\]*(?:\\.[^'\\]*)*')\s*\)/g,_t="undefined"!=typeof XMLHttpRequest,Pt=St="undefined"!=typeof self&&void 0!==self.fetch?/*
 * Source loading
 */
function(e,t,r,n){
// fetch doesn't support file:/// urls
if("file:///"===e.substr(0,8)){if(_t)return N(e,t,0,n);throw new Error("Unable to fetch file URLs in this environment.")}
// percent encode just "#" for HTTP requests
e=e.replace(/#/g,"%23");var o={
// NB deprecate
headers:{Accept:"application/x-es-module, */*"}};return r&&(o.integrity=r),t&&("string"==typeof t&&(o.headers.Authorization=t),o.credentials="include"),fetch(e,o).then(function(e){if(e.ok)return n?e.arrayBuffer():e.text();throw new Error("Fetch error: "+e.status+" "+e.statusText)})}:_t?N:"undefined"!=typeof require&&"undefined"!=typeof process?function(e,t,r,n){return"file:///"!=e.substr(0,8)?Promise.reject(new Error('Unable to fetch "'+e+'". Only file URLs of the form file:/// supported running in Node.')):(Ot=Ot||require("fs"),e=Qe?e.replace(/\//g,"\\").substr(8):e.substr(7),new Promise(function(t,r){Ot.readFile(e,function(e,o){if(e)return r(e);if(n)t(o);else{
// Strip Byte Order Mark out if it's the leading char
var i=o+"";"\ufeff"===i[0]&&(i=i.substr(1)),t(i)}})}))}:function(){throw new Error("No fetch method is defined for this environment.")},Mt={},Rt=["browser","node","dev","build","production","default"],Ct=/#\{[^\}]+\}/,Lt=["browserConfig","nodeConfig","devConfig","buildConfig","productionConfig"],At="undefined"!=typeof Buffer;try{At&&"YQ=="!==new Buffer("a").toString("base64")&&(At=!1)}catch(e){At=!1}var It,Ft,Kt,Dt,Ut="\n//# sourceMappingURL=data:application/json;base64,",qt=0,Tt=!1;Xe&&"undefined"!=typeof document&&document.getElementsByTagName&&(window.chrome&&window.chrome.extension||navigator.userAgent.match(/^Node\.js/)||(Tt=!0));var zt,Nt=function(e){/*
    AMD-compatible require
    To copy RequireJS, set window.require = window.requirejs = loader.amdRequire
  */
function t(r,n,o,i){
// in amd, first arg can be a config object... we just ignore
if("object"==typeof r&&!(r instanceof Array))return t.apply(null,Array.prototype.splice.call(arguments,1,arguments.length-1));if(
// amd require
"string"==typeof r&&"function"==typeof n&&(r=[r]),!(r instanceof Array)){if("string"==typeof r){var a=e.decanonicalize(r,i),s=e.get(a);if(!s)throw new Error('Module not already loaded loading "'+r+'" as '+a+(i?' from "'+i+'".':"."));return"__useDefault"in s?s.__useDefault:s}throw new TypeError("Invalid require")}for(var u=[],l=0;l<r.length;l++)u.push(e.import(r[l],i));Promise.all(u).then(function(e){n&&n.apply(null,e)},o)}function r(r,n,o){function i(r,i,l){for(var c=[],f=0;f<n.length;f++)c.push(r(n[f]));if(l.uri=l.id,l.config=_,
// add back in system dependencies
-1!==u&&c.splice(u,0,l),-1!==s&&c.splice(s,0,i),-1!==a){var d=function(n,o,i){return"string"==typeof n&&"function"!=typeof o?r(n):t.call(e,n,o,i,l.id)};d.toUrl=function(t){return e.normalizeSync(t,l.id)},c.splice(a,0,d)}
// set global require to AMD require
var p=Ve.require;Ve.require=t;var g=o.apply(-1===s?Ve:i,c);Ve.require=p,void 0!==g&&(l.exports=g)}"string"!=typeof r&&(o=n,n=r,r=null),n instanceof Array||(o=n,n=["require","exports","module"].splice(0,o.length)),"function"!=typeof o&&(o=function(e){return function(){return e}}(o)),r||Bt&&(n=n.concat(Bt),Bt=void 0);
// remove system dependencies
var a,s,u;-1!==(a=n.indexOf("require"))&&(n.splice(a,1),
// only trace cjs requires for non-named
// named defines assume the trace has already been done
r||(n=n.concat(Ce(o.toString(),a)))),-1!==(s=n.indexOf("exports"))&&n.splice(s,1),-1!==(u=n.indexOf("module"))&&n.splice(u,1),
// anonymous define
r?(e.registerDynamic(r,n,!1,i),
// if we don't have any other defines,
// then let this be an anonymous define
// this is just to support single modules of the form:
// define('jquery')
// still loading anonymously
// because it is done widely enough to be useful
// as soon as there is more than one define, this gets removed though
$t?($t=void 0,tr=!0):tr||($t=[n,i])):e.registerDynamic(n,!1,rr?Le(i):i)}e.set("@@cjs-helpers",e.newModule({requireResolve:Se.bind(e),getPathVars:je})),e.set("@@global-helpers",e.newModule({prepareGlobal:Re})),r.amd={},e.amdDefine=r,e.amdRequire=t};"undefined"!=typeof window&&"undefined"!=typeof document&&window.location&&(zt=location.protocol+"//"+location.hostname+(location.port?":"+location.port:""));var Jt,$t,Bt,Wt,Gt=/(^|[^\\])(\/\*([\s\S]*?)\*\/|([^:]|^)\/\/(.*)$)/gm,Ht=/("[^"\\\n\r]*(\\.[^"\\\n\r]*)*"|'[^'\\\n\r]*(\\.[^'\\\n\r]*)*')/g,Zt=["_g","sessionStorage","localStorage","clipboardData","frames","frameElement","external","mozAnimationStartTime","webkitStorageInfo","webkitIndexedDB","mozInnerScreenY","mozInnerScreenX"],Xt="(?:^|[^$_a-zA-Z\\xA0-\\uFFFF.])",Yt="\\s*\\(\\s*(\"([^\"]+)\"|'([^']+)')\\s*\\)",Qt=/\(([^\)]*)\)/,Vt=/^\s+|\s+$/g,er={},tr=!1,rr=!1,nr=(Xe||bt)&&"undefined"!=typeof navigator&&navigator.userAgent&&!navigator.userAgent.match(/MSIE (9|10).0/);"undefined"==typeof require||"undefined"==typeof process||process.browser||(Wt=require);var or,ir="undefined"!=typeof self?"self":"global",ar=/(^\s*|[}\);\n]\s*)(import\s*(['"]|(\*\s+as\s+)?[^"'\(\)\n;]+\s*from\s*['"]|\{)|export\s+\*\s+from\s+["']|export\s*(\{|default|function|class|var|const|let|async\s+function))/,sr=/^(\s*\/\*[^\*]*(\*(?!\/)[^\*]*)*\*\/|\s*\/\/[^\n]*|\s*"[^"]+"\s*;?|\s*'[^']+'\s*;?)*\s*/,ur=/(?:^\uFEFF?|[^$_a-zA-Z\xA0-\uFFFF.])define\s*\(\s*("[^"]+"\s*,\s*|'[^']+'\s*,\s*)?\s*(\[(\s*(("[^"]+"|'[^']+')\s*,|\/\/.*\r?\n|\/\*(.|\s)*?\*\/))*(\s*("[^"]+"|'[^']+')\s*,?)?(\s*(\/\/.*\r?\n|\/\*(.|\s)*?\*\/))*\s*\]|function\s*|{|[_$a-zA-Z\xA0-\uFFFF][_$a-zA-Z0-9\xA0-\uFFFF]*\))/,lr=/(?:^\uFEFF?|[^$_a-zA-Z\xA0-\uFFFF.])(exports\s*(\[['"]|\.)|module(\.exports|\['exports'\]|\["exports"\])\s*(\[['"]|[=,\.]))/,cr=/^\#\!.*/,fr=/^(\s*\/\*[^\*]*(\*(?!\/)[^\*]*)*\*\/|\s*\/\/[^\n]*|\s*"[^"]+"\s*;?|\s*'[^']+'\s*;?)+/,dr=/\/\*[^\*]*(\*(?!\/)[^\*]*)*\*\/|\/\/[^\n]*|"[^"]+"\s*;?|'[^']+'\s*;?/g;
// Promise detection and error message
if("undefined"==typeof Promise)throw new Error("SystemJS needs a Promise polyfill.");if("undefined"!=typeof document){var pr=document.getElementsByTagName("script"),gr=pr[pr.length-1];document.currentScript&&(gr.defer||gr.async)&&(gr=document.currentScript),or=gr&&gr.src}else if("undefined"!=typeof importScripts)try{throw new Error("_")}catch(e){e.stack.replace(/(?:at|@).*(http.+):[\d]+:[\d]+/,function(e,t){or=t})}else"undefined"!=typeof __filename&&(or=__filename);var hr;(We.prototype=Object.create(f.prototype)).constructor=We,
// NB deprecate normalize
We.prototype[We.resolve=f.resolve]=We.prototype.normalize=function(e,t){var r=this[vt],n=J(),o=$(this,r,t),i=this;return Promise.resolve().then(function(){
// first we normalize the conditional
var r=e.lastIndexOf("#?");if(-1===r)return Promise.resolve(e);var n=ce.call(i,e.substr(r+2));
// in builds, return normalized conditional
/*if (this.builder)
      return this.resolve(conditionObj.module, parentKey)
      .then(function (conditionModule) {
        conditionObj.module = conditionModule;
        return key.substr(0, booleanIndex) + '#?' + serializeCondition(conditionObj);
      });*/
return fe.call(i,n,t,!0).then(function(t){return t?e.substr(0,r):"@empty"})}).then(function(e){var a=Q(r.pluginFirst,e);return a?(n.pluginKey=a.plugin,Promise.all([Z.call(i,r,a.argument,o&&o.pluginArgument||t,n,o,!0),i.resolve(a.plugin,t)]).then(function(e){
// don't allow a plugin to load itself
if(n.pluginArgument=e[0],n.pluginKey=e[1],n.pluginArgument===n.pluginKey)throw new Error("Plugin "+n.pluginArgument+" cannot load itself, make sure it is excluded from any wildcard meta configuration via a custom loader: false rule.");return V(r.pluginFirst,e[0],e[1])})):Z.call(i,r,e,o&&o.pluginArgument||t,n,o,!1)}).then(function(e){return de.call(i,e,t,o)}).then(function(e){return Y.call(i,r,e,n),n.pluginKey||!n.load.loader?e:i.resolve(n.load.loader,e).then(function(t){return n.pluginKey=t,n.pluginArgument=e,e})}).then(function(e){return i[yt][e]=n,e})},We.prototype.load=function(e,t){return M.call(this[vt],"System.load is deprecated."),this.import(e,t)},
// NB deprecate decanonicalize, normalizeSync
We.prototype.decanonicalize=We.prototype.normalizeSync=We.prototype.resolveSync=W,We.prototype[We.instantiate=f.instantiate]=function(e,t){var r=this,n=this[vt];
// first do bundles and depCache
return(De(n,this,e)||ht).then(function(){if(!t()){var o=r[yt][e];
// node module loading
if("@node/"===e.substr(0,6)){if(!r._nodeRequire)throw new TypeError("Error loading "+e+". Can only load node core modules in Node.");return r.registerDynamic([],!1,function(){return C.call(r,e.substr(6),r.baseURL)}),void t()}
// fetch / translate / instantiate pipeline
// auto script load AMD, global without deps
// fetch / translate / instantiate pipeline
return o.load.scriptLoad?!o.load.pluginKey&&nr||(o.load.scriptLoad=!1,M.call(n,'scriptLoad not supported for "'+e+'"')):!1!==o.load.scriptLoad&&!o.load.pluginKey&&nr&&(o.load.deps||o.load.globals||!("system"===o.load.format||"register"===o.load.format||"global"===o.load.format&&o.load.exports)||(o.load.scriptLoad=!0)),o.load.scriptLoad?new Promise(function(n,i){if("amd"===o.load.format&&Ve.define!==r.amdDefine)throw new Error("Loading AMD with scriptLoad requires setting the global `"+ir+".define = SystemJS.amdDefine`");D(e,o.load.crossOrigin,o.load.integrity,function(){if(!t()){o.load.format="global";var e=o.load.exports&&Me(o.load.exports);r.registerDynamic([],!1,function(){return Fe(o,e),e}),t()}n()},i)}):Ke(r,e,o).then(function(){return Ue(r,e,o,t,n.wasm)})}}).then(function(t){return delete r[yt][e],t})},We.prototype.config=function(e,t){var r=this,o=this[vt];if("warnings"in e&&(o.warnings=e.warnings),"wasm"in e&&(o.wasm="undefined"!=typeof WebAssembly&&e.wasm),("production"in e||"build"in e)&&Ge.call(r,!!e.production,!!(e.build||hr&&hr.build)),!t){
// if using nodeConfig / browserConfig / productionConfig, take baseURL from there
// these exceptions will be unnecessary when we can properly implement config queuings
var i;pe(r,e,function(e){i=i||e.baseURL}),
// always configure baseURL first
(i=i||e.baseURL)&&(o.baseURL=n(i,Ze)||n("./"+i,Ze),"/"!==o.baseURL[o.baseURL.length-1]&&(o.baseURL+="/")),e.paths&&L(o.paths,e.paths),pe(r,e,function(e){e.paths&&L(o.paths,e.paths)});for(var a in o.paths)-1!==o.paths[a].indexOf("*")&&(M.call(o,"Path config "+a+" -> "+o.paths[a]+" is no longer supported as wildcards are deprecated."),delete o.paths[a])}if(e.defaultJSExtensions&&M.call(o,"The defaultJSExtensions configuration option is deprecated.\n  Use packages defaultExtension instead.",!0),"boolean"==typeof e.pluginFirst&&(o.pluginFirst=e.pluginFirst),e.map)for(var a in e.map){var s=e.map[a];if("string"==typeof s){var u=G.call(r,o,s,void 0,!1,!1);"/"===u[u.length-1]&&":"!==a[a.length-1]&&"/"!==a[a.length-1]&&(u=u.substr(0,u.length-1)),o.map[a]=u}else{m=(m=G.call(r,o,"/"!==a[a.length-1]?a+"/":a,void 0,!0,!0)).substr(0,m.length-1);var l=o.packages[m];l||(
// use '' instead of false to keep type consistent
(l=o.packages[m]={defaultExtension:void 0,main:void 0,format:void 0,meta:void 0,map:void 0,packageConfig:void 0,configured:!1}).defaultExtension=""),ve(l,{map:s},m,!1,o)}}if(e.packageConfigPaths){for(var c=[],f=0;f<e.packageConfigPaths.length;f++){var d=e.packageConfigPaths[f],p=Math.max(d.lastIndexOf("*")+1,d.lastIndexOf("/")),g=G.call(r,o,d.substr(0,p),void 0,!1,!1);c[f]=g+d.substr(p)}o.packageConfigPaths=c}if(e.bundles)for(var a in e.bundles){for(var h=[],f=0;f<e.bundles[a].length;f++)h.push(r.normalizeSync(e.bundles[a][f]));o.bundles[a]=h}if(e.packages)for(var a in e.packages){if(a.match(/^([^\/]+:)?\/\/$/))throw new TypeError('"'+a+'" is not a valid package name.');var m=G.call(r,o,"/"!==a[a.length-1]?a+"/":a,void 0,!0,!0);m=m.substr(0,m.length-1),ve(o.packages[m]=o.packages[m]||{defaultExtension:void 0,main:void 0,format:void 0,meta:void 0,map:void 0,packageConfig:void 0,configured:!1},e.packages[a],m,!1,o)}if(e.depCache)for(var a in e.depCache)o.depCache[r.normalizeSync(a)]=[].concat(e.depCache[a]);if(e.meta)for(var a in e.meta)
// base wildcard stays base
if("*"===a[0])L(o.meta[a]=o.meta[a]||{},e.meta[a]);else{var v=G.call(r,o,a,void 0,!0,!0);L(o.meta[v]=o.meta[v]||{},e.meta[a])}"transpiler"in e&&(o.transpiler=e.transpiler);
// copy any remaining non-standard configuration properties
for(var y in e)-1===mr.indexOf(y)&&-1===Lt.indexOf(y)&&(
// warn.call(config, 'Setting custom config option `System.config({ ' + c + ': ... })` is deprecated. Avoid custom config options or set SystemJS.' + c + ' = ... directly.');
r[y]=e[y]);pe(r,e,function(e){r.config(e,!0)})},We.prototype.getConfig=function(e){if(e){if(-1!==mr.indexOf(e))return he(this[vt],e);throw new Error('"'+e+'" is not a valid configuration name. Must be one of '+mr.join(", ")+".")}for(var t={},r=0;r<mr.length;r++){var n=mr[r],o=he(this[vt],n);void 0!==o&&(t[n]=o)}return t},We.prototype.global=Ve,We.prototype.import=function(){return f.prototype.import.apply(this,arguments).then(function(e){return"__useDefault"in e?e.__useDefault:e})};for(var mr=["baseURL","map","paths","packages","packageConfigPaths","depCache","meta","bundles","transpiler","warnings","pluginFirst","production","wasm"],vr="undefined"!=typeof Proxy,yr=0;yr<mr.length;yr++)!function(e){Object.defineProperty(We.prototype,e,{get:function(){var t=he(this[vt],e);
//if (typeof cfg === 'object')
//  warn.call(this[CONFIG], 'Referencing `SystemJS.' + configName + '` is deprecated. Use the config getter `SystemJS.getConfig(\'' + configName + '\')`');
return vr&&"object"==typeof t&&(t=new Proxy(t,{set:function(t,r){throw new Error("Cannot set SystemJS."+e+'["'+r+'"] directly. Use SystemJS.config({ '+e+': { "'+r+'": ... } }) rather.')}})),t},set:function(t){throw new Error("Setting `SystemJS."+e+"` directly is no longer supported. Use `SystemJS.config({ "+e+": ... })`.")}})}(mr[yr]);We.prototype.delete=function(e){return He(this,"delete"),this.registry.delete(e)},We.prototype.get=function(e){return He(this,"get"),this.registry.get(e)},We.prototype.has=function(e){return He(this,"has"),this.registry.has(e)},We.prototype.set=function(e,t){return He(this,"set"),this.registry.set(e,t)},We.prototype.newModule=function(e){return new l(e)},We.prototype.isModule=function(e){return void 0===pt&&(pt="undefined"!=typeof Symbol&&!!Symbol.toStringTag),e instanceof l||pt&&"[object Module]"==Object.prototype.toString.call(e)},
// ensure System.register and System.registerDynamic decanonicalize
We.prototype.register=function(e,t,r){return"string"==typeof e&&(e=B.call(this,this[vt],e)),f.prototype.register.call(this,e,t,r)},We.prototype.registerDynamic=function(e,t,r,n){return"string"==typeof e&&(e=B.call(this,this[vt],e)),f.prototype.registerDynamic.call(this,e,t,r,n)},We.prototype.version="0.20.15 Dev";var br=new We;
// only set the global System on the global in browsers
(Xe||bt)&&(Ve.SystemJS=Ve.System=br),"undefined"!=typeof module&&module.exports&&(module.exports=br)}();