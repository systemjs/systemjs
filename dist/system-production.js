/*
 * SystemJS v0.20.16 Production
 */
!function(){"use strict";function e(e){return G?Symbol():"@@"+e}function t(e,t){
// Convert file:/// URLs to paths in Node
z||(t=t.replace(F?/file:\/\/\//g:/file:\/\//g,""));var r,n=(e.message||e)+"\n  "+t;r=Q&&e.fileName?new Error(n,e.fileName,e.lineNumber):new Error(n);var o=e.originalErr?e.originalErr.stack:e.stack;
// node doesn't show the message otherwise
return r.stack=B?n+"\n  "+o:o,r.originalErr=e.originalErr||e,r}/*
 * Optimized URL normalization assuming a syntax-valid URL parent
 */
function r(e,t){throw new RangeError('Unable to resolve "'+e+'" to '+t)}function n(e,t){e=e.trim();var n=t&&t.substr(0,t.indexOf(":")+1),o=e[0],i=e[1];
// protocol-relative
if("/"===o&&"/"===i)return n||r(e,t),n+e;if("."===o&&("/"===i||"."===i&&("/"===e[2]||2===e.length&&(e+="/"))||1===e.length&&(e+="/"))||"/"===o){var s,a=!n||"/"!==t[n.length];if(a?(
// resolving to a plain parent -> skip standard URL prefix, and treat entire parent as pathname
void 0===t&&r(e,t),s=t):s="/"===t[n.length+1]?
// resolving to a :// so we need to read out the auth and host
"file:"!==n?(s=t.substr(n.length+2)).substr(s.indexOf("/")+1):t.substr(8):t.substr(n.length+1),"/"===o){if(!a)return t.substr(0,t.length-s.length-1)+e;r(e,t)}for(var u=s.substr(0,s.lastIndexOf("/")+1)+e,c=[],l=-1,f=0;f<u.length;f++)
// busy reading a segment - only terminate on '/'
if(-1===l)
// new segment - check if it is relative
if("."!==u[f])
// it is the start of a new segment
l=f;else{
// ../ segment
if("."===u[f+1]&&"/"===u[f+2])c.pop(),f+=2;else{if("/"!==u[f+1]){
// the start of a new segment as below
l=f;continue}f+=1}
// this is the plain URI backtracking error (../, package:x -> error)
a&&0===c.length&&r(e,t),
// trailing . or .. segment
f===u.length&&c.push("")}else"/"===u[f]&&(c.push(u.substring(l,f+1)),l=-1);
// finish reading out the last segment
return-1!==l&&c.push(u.substr(l)),t.substr(0,t.length-s.length)+c.join("")}return-1!==e.indexOf(":")?B&&":"===e[1]&&"\\"===e[2]&&e[0].match(/[a-z]/i)?"file:///"+e.replace(/\\/g,"/"):e:void 0}/*
 * Simple Array values shim
 */
function o(e){if(e.values)return e.values();if("undefined"==typeof Symbol||!Symbol.iterator)throw new Error("Symbol.iterator not supported in this browser");var t={};return t[Symbol.iterator]=function(){var t=Object.keys(e),r=0;return{next:function(){return r<t.length?{value:e[t[r++]],done:!1}:{value:void 0,done:!0}}}},t}/*
 * 3. Reflect.Loader
 *
 * We skip the entire native internal pipeline, just providing the bare API
 */
// 3.1.1
function i(){this.registry=new u}function s(e){if(!(e instanceof c))throw new TypeError("Module instantiation did not return a valid namespace object.");return e}function a(e){if(void 0===e)throw new RangeError("No resolution found.");return e}function u(){this[$]={}}
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
function c(e){Object.defineProperty(this,ee,{value:e}),
// evaluate defers namespace population
/* if (evaluate) {
    Object.defineProperty(this, EVALUATE, {
      value: evaluate,
      configurable: true,
      writable: true
    });
  }
  else { */
Object.keys(e).forEach(l,this)}function l(e){Object.defineProperty(this,e,{enumerable:!0,get:function(){return this[ee][e]}})}function f(){i.call(this);var e=this.registry.delete;this.registry.delete=function(r){var n=e.call(this,r);
// also delete from register registry if linked
return t.hasOwnProperty(r)&&!t[r].linkRecord&&(delete t[r],n=!0),n};var t={};this[te]={
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
var i=n[t];if(i)return Promise.resolve(i);var s=o.records[t];
// already linked but not in main registry is ignored
// already linked but not in main registry is ignored
return s&&!s.module?s.loadError?Promise.reject(s.loadError):v(e,s,s.linkRecord,n,o):e.resolve(t,r).then(function(t){if(
// main loader registry always takes preference
i=n[t])return i;if(
// already has a module value but not already in the registry (load.module)
// means it was removed by registry.delete, so we should
// disgard the current load record creating a new one over it
// but keep any existing registration
(s=o.records[t])&&!s.module||(s=d(o,t,s&&s.registration)),s.loadError)return Promise.reject(s.loadError);var r=s.linkRecord;return r?v(e,s,r,n,o):s})}function h(e,t,r){return function(){var e=r.lastRegister;return e?(r.lastRegister=void 0,t.registration=e,!0):!!t.registration}}function v(e,r,n,o,i){
// if there is already an existing registration, skip running instantiate
return n.instantiatePromise||(n.instantiatePromise=(r.registration?Promise.resolve():Promise.resolve().then(function(){return i.lastRegister=void 0,e[re](r.key,e[re].length>1&&h(e,r,i))})).then(function(t){
// direct module return from instantiate -> we're done
if(void 0!==t){if(!(t instanceof c))throw new TypeError("Instantiate did not return a valid Module object.");return delete i.records[r.key],e.trace&&m(e,r,n),o[r.key]=t}
// run the cached loader.register declaration if there is one
var s=r.registration;if(
// clear to allow new registrations for future loads (combined with registry delete)
r.registration=void 0,!s)throw new TypeError("Module instantiation did not call an anonymous or correctly named System.register.");
// process System.registerDynamic declaration
return n.dependencies=s[0],r.importerSetters=[],n.moduleObj={},s[2]?(n.moduleObj.default=n.moduleObj.__useDefault={},n.executingRequire=s[1],n.execute=s[2]):g(e,r,n,s[1]),r}).catch(function(e){throw r.linkRecord=void 0,r.loadError=r.loadError||t(e,"Instantiating "+r.key)}))}
// like resolveInstantiate, but returning load records for linking
function y(e,t,r,n,o,i){
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
var s=o.records[r],a=n[r];
// main loader registry always takes preference
if(a&&(!s||s.module&&a!==s.module))return a;if(s&&s.loadError)throw s.loadError;
// already has a module value but not already in the registry (load.module)
// means it was removed by registry.delete, so we should
// disgard the current load record creating a new one over it
// but keep any existing registration
(!s||!a&&s.module)&&(s=d(o,r,s&&s.registration));var u=s.linkRecord;return u?v(e,s,u,n,o):s})}function m(e,t,r){e.loads=e.loads||{},e.loads[t.key]={key:t.key,deps:r.dependencies,dynamicDeps:[],depMap:r.depMap||{}}}/*
 * Convert a CJS module.exports into a valid object for new Module:
 *
 *   new Module(getEsModule(module.exports))
 *
 * Sets the default value to the module, while also reading off named exports carefully.
 */
function g(e,t,r,n){var o=r.moduleObj,i=t.importerSetters,s=!1,a=n.call(J,function(e,t){if("object"==typeof e){var r=!1;for(var n in e)t=e[n],"__useDefault"===n||n in o&&o[n]===t||(r=!0,o[n]=t);if(!1===r)return t}else{if((s||e in o)&&o[e]===t)return t;o[e]=t}for(var a=0;a<i.length;a++)i[a](o);return t},new O(e,t.key));r.setters=a.setters,r.execute=a.execute,a.exports&&(r.moduleObj=o=a.exports,s=!0)}function b(e,r,n,o,i){if(n.depsInstantiatePromise)return n.depsInstantiatePromise;for(var s=Array(n.dependencies.length),a=0;a<n.dependencies.length;a++)s[a]=y(e,n.dependencies[a],r.key,o,i,e.trace&&n.depMap||(n.depMap={}));var u=Promise.all(s).then(function(e){
// run setters to set up bindings to instantiated dependencies
if(n.dependencyInstantiations=e,n.setters)for(var t=0;t<e.length;t++){var o=n.setters[t];if(o){var i=e[t];if(i instanceof c)o(i);else{if(i.loadError)throw i.loadError;o(i.module||i.linkRecord.moduleObj),
// this applies to both es and dynamic registrations
i.importerSetters&&i.importerSetters.push(o)}}}return r});return e.trace&&(u=u.then(function(){return m(e,r,n),r})),(u=u.catch(function(e){
// throw up the instantiateDeps stack
throw n.depsInstantiatePromise=void 0,t(e,"Loading "+r.key)})).catch(function(){}),n.depsInstantiatePromise=u}function w(e,t,r,n,o){return new Promise(function(r,i){function s(t){var r=t.linkRecord;r&&-1===u.indexOf(t)&&(u.push(t),l++,b(e,t,r,n,o).then(a,i))}function a(e){l--;var t=e.linkRecord;if(t)for(var n=0;n<t.dependencies.length;n++){var o=t.dependencyInstantiations[n];o instanceof c||s(o)}0===l&&r()}var u=[],l=0;s(t)})}
// ContextualLoader class
// backwards-compatible with previous System.register context argument by exposing .id, .key
function O(e,t){this.loader=e,this.key=this.id=t,this.meta={url:t}}/*ContextualLoader.prototype.resolve = function (key) {
  return this.loader.resolve(key, this.key);
};*/
// this is the execution function bound to the Module namespace record
function E(e,t,r,n,o,i){if(t.module)return t.module;if(t.evalError)throw t.evalError;if(i&&-1!==i.indexOf(t))return t.linkRecord.moduleObj;
// for ES loads we always run ensureEvaluate on top-level, so empty seen is passed regardless
// for dynamic loads, we pass seen if also dynamic
var s=R(e,t,r,n,o,r.setters?[]:i||[]);if(s)throw s;return t.module}function k(e,t,r,n,o,i,s){
// we can only require from already-known dependencies
return function(a){for(var u=0;u<r.length;u++)if(r[u]===a){var l,f=n[u];return(l=f instanceof c?f:E(e,f,f.linkRecord,o,i,s)).__useDefault||l}throw new Error("Module "+a+" not declared as a System.registerDynamic dependency of "+t)}}
// ensures the given es load is evaluated
// returns the error if any
function R(e,r,n,o,i,s){s.push(r);var a;
// es modules evaluate dependencies first
// non es modules explicitly call moduleEvaluate through require
if(n.setters)for(var u,l,f=0;f<n.dependencies.length;f++)if(!((u=n.dependencyInstantiations[f])instanceof c)&&(
// custom Module returned from instantiate
(l=u.linkRecord)&&-1===s.indexOf(u)&&(a=u.evalError?u.evalError:R(e,u,l,o,i,l.setters?s:[])),a))return r.linkRecord=void 0,r.evalError=t(a,"Evaluating "+r.key),r.evalError;
// link.execute won't exist for Module returns from instantiate on top-level load
if(n.execute)
// ES System.register execute
// "this" is null in ES
if(n.setters)a=j(n.execute);else{var d={id:r.key},p=n.moduleObj;Object.defineProperty(d,"exports",{configurable:!0,set:function(e){p.default=p.__useDefault=e},get:function(){return p.__useDefault}});var h=k(e,r.key,n.dependencies,n.dependencyInstantiations,o,i,s);
// evaluate deps first
if(!n.executingRequire)for(f=0;f<n.dependencies.length;f++)h(n.dependencies[f]);a=S(n.execute,h,p.default,d),
// pick up defineProperty calls to module.exports when we can
d.exports!==p.default&&(p.default=p.__useDefault=d.exports);var v=p.default;
// __esModule flag extension support via lifting
if(v&&v.__esModule)for(var y in v)Object.hasOwnProperty.call(v,y)&&(p[y]=v[y])}if(
// dispose link record
r.linkRecord=void 0,a)return r.evalError=t(a,"Evaluating "+r.key);
// if not an esm module, run importer setters and clear them
// this allows dynamic modules to update themselves into es modules
// as soon as execution has completed
if(o[r.key]=r.module=new c(n.moduleObj),!n.setters){if(r.importerSetters)for(f=0;f<r.importerSetters.length;f++)r.importerSetters[f](r.module);r.importerSetters=void 0}}function j(e){try{e.call(ne)}catch(e){return e}}function S(e,t,r,n){try{var o=e.call(J,t,r,n);void 0!==o&&(n.exports=o)}catch(e){return e}}function P(e){return void 0===oe&&(oe="undefined"!=typeof Symbol&&!!Symbol.toStringTag),e instanceof c||oe&&"[object Module]"==Object.prototype.toString.call(e)}function x(e,t,r){var n=new Uint8Array(t);
// detect by leading bytes
// Can be (new Uint32Array(fetched))[0] === 0x6D736100 when working in Node
// detect by leading bytes
// Can be (new Uint32Array(fetched))[0] === 0x6D736100 when working in Node
return 0===n[0]&&97===n[1]&&115===n[2]?WebAssembly.compile(t).then(function(t){var n=[],o=[],i={};
// we can only set imports if supported (eg Safari doesnt support)
return WebAssembly.Module.imports&&WebAssembly.Module.imports(t).forEach(function(e){var t=e.module;o.push(function(e){i[t]=e}),-1===n.indexOf(t)&&n.push(t)}),e.register(n,function(e){return{setters:o,execute:function(){e(new WebAssembly.Instance(t,i).exports)}}}),r(),!0}):Promise.resolve(!1)}function L(e,t){for(var r in t)Object.hasOwnProperty.call(t,r)&&(e[r]=t[r]);return e}function I(e){
// fallback to old fashioned image technique which still works in safari
if(fe||de){var t=document.createElement("link");fe?(t.rel="preload",t.as="script"):
// this works for all except Safari (detected by relList.supports lacking)
t.rel="prefetch",t.href=e,document.head.appendChild(t),document.head.removeChild(t)}else(new Image).src=e}function U(e,t,r){try{importScripts(e)}catch(e){r(e)}t()}function _(e,t,r,n,o){function i(){n(),a()}
// note this does not catch execution errors
function s(t){a(),o(new Error("Fetching "+e))}function a(){for(var e=0;e<pe.length;e++)if(pe[e].err===s){pe.splice(e,1);break}u.removeEventListener("load",i,!1),u.removeEventListener("error",s,!1),document.head.removeChild(u)}
// subresource integrity is not supported in web workers
if(
// percent encode just "#" for HTTP requests
e=e.replace(/#/g,"%23"),le)return U(e,n,o);var u=document.createElement("script");u.type="text/javascript",u.charset="utf-8",u.async=!0,t&&(u.crossOrigin=t),r&&(u.integrity=r),u.addEventListener("load",i,!1),u.addEventListener("error",s,!1),u.src=e,document.head.appendChild(u)}
// separate out paths cache as a baseURL lock process
function M(e,t,r){var o=C(t,r);if(o){var i=t[o]+r.substr(o.length),s=n(i,q);return void 0!==s?s:e+i}return-1!==r.indexOf(":")?r:e+r}function D(e){var t=this.name;
// can add ':' here if we want paths to match the behaviour of map
if(t.substr(0,e.length)===e&&(t.length===e.length||"/"===t[e.length]||"/"===e[e.length-1]||":"===e[e.length-1])){var r=e.split("/").length;r>this.len&&(this.match=e,this.len=r)}}function C(e,t){if(Object.hasOwnProperty.call(e,t))return t;var r={name:t,match:void 0,len:0};return Object.keys(e).forEach(D,r),r.match}
// RegEx adjusted from https://github.com/jbrantly/yabble/blob/master/lib/yabble.js#L339
function T(){f.call(this),
// internal configuration
this[ae]={baseURL:q,paths:{},map:{},submap:{},bundles:{},depCache:{},wasm:!1},
// support the empty module, as a concept
this.registry.set("@empty",se)}function N(e,t){var r=this[ae];
// Apply contextual submap
if(t){var o=C(r.submap,t),i=r.submap[o];if(a=i&&C(i,e))return n(u=i[a]+e.substr(a.length),o)||u}
// Apply global map
var s=r.map,a=C(s,e);if(a){var u=s[a]+e.substr(a.length);return n(u,t||r.baseURL)||u}}function A(e,t){return new Promise(function(r,n){return _(e,"anonymous",void 0,function(){t(),r()},n)})}function W(e,t){var r=this[ae],n=r.wasm,o=r.bundles[e];if(o){var i=(c=this).resolveSync(o,void 0);if(c.registry.has(i))return;return ye[i]||(ye[i]=A(i,t).then(function(){
// bundle treated itself as an empty module
// this means we can reload bundles by deleting from the registry
c.registry.has(i)||c.registry.set(i,c.newModule({})),delete ye[i]}))}var s=r.depCache[e];if(s)for(var a=n?fetch:I,u=0;u<s.length;u++)this.resolve(s[u],e).then(a);if(n){var c=this;return fetch(e).then(function(e){if(e.ok)return e.arrayBuffer();throw new Error("Fetch error: "+e.status+" "+e.statusText)}).then(function(r){return x(c,r,t).then(function(n){if(!n){
// not wasm -> convert buffer into utf-8 string to execute as a module
// TextDecoder compatibility matches WASM currently. Need to keep checking this.
// The TextDecoder interface is documented at http://encoding.spec.whatwg.org/#interface-textdecoder
var o=new TextDecoder("utf-8").decode(new Uint8Array(r));(0,eval)(o+"\n//# sourceURL="+e),t()}})})}return A(e,t)}/*
 * Environment
 */
var q,z="undefined"!=typeof window&&"undefined"!=typeof document,B="undefined"!=typeof process&&process.versions&&process.versions.node,F="undefined"!=typeof process&&"string"==typeof process.platform&&process.platform.match(/^win/),J="undefined"!=typeof self?self:global,G="undefined"!=typeof Symbol;
// environent baseURI detection
if("undefined"!=typeof document&&document.getElementsByTagName){if(!(q=document.baseURI)){var H=document.getElementsByTagName("base");q=H[0]&&H[0].href||window.location.href}}else"undefined"!=typeof location&&(q=location.href);
// sanitize out the hash and querystring
if(q){var K=(q=q.split("#")[0].split("?")[0]).lastIndexOf("/");-1!==K&&(q=q.substr(0,K+1))}else{if("undefined"==typeof process||!process.cwd)throw new TypeError("No environment baseURI");q="file://"+(F?"/":"")+process.cwd(),F&&(q=q.replace(/\\/g,"/"))}
// ensure baseURI has trailing "/"
"/"!==q[q.length-1]&&(q+="/");/*
 * LoaderError with chaining for loader stacks
 */
var Q="_"==new Error(0,"_").fileName,V=Promise.resolve();
// 3.3.1
i.prototype.constructor=i,
// 3.3.2
i.prototype.import=function(e,r){if("string"!=typeof e)throw new TypeError("Loader import method must be passed a module key string");
// custom resolveInstantiate combined hook for better perf
var n=this;return V.then(function(){return n[Y](e,r)}).then(s).catch(function(n){throw t(n,"Loading "+e+(r?" from "+r:""))})};
// 3.3.3
var X=i.resolve=e("resolve"),Y=i.resolveInstantiate=e("resolveInstantiate");
// default resolveInstantiate is just to call resolve and then get from the registry
// this provides compatibility for the resolveInstantiate optimization
i.prototype[Y]=function(e,t){var r=this;return r.resolve(e,t).then(function(e){return r.registry.get(e)})},i.prototype.resolve=function(e,r){var n=this;return V.then(function(){return n[X](e,r)}).then(a).catch(function(n){throw t(n,"Resolving "+e+(r?" to "+r:""))})};
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
var Z="undefined"!=typeof Symbol&&Symbol.iterator,$=e("registry");
// 4.4.1
Z&&(
// 4.4.2
u.prototype[Symbol.iterator]=function(){return this.entries()[Symbol.iterator]()},
// 4.4.3
u.prototype.entries=function(){var e=this[$];return o(Object.keys(e).map(function(t){return[t,e[t]]}))}),
// 4.4.4
u.prototype.keys=function(){return o(Object.keys(this[$]))},
// 4.4.5
u.prototype.values=function(){var e=this[$];return o(Object.keys(e).map(function(t){return e[t]}))},
// 4.4.6
u.prototype.get=function(e){return this[$][e]},
// 4.4.7
u.prototype.set=function(e,t){if(!(t instanceof c))throw new Error("Registry must be set with an instance of Module Namespace");return this[$][e]=t,this},
// 4.4.8
u.prototype.has=function(e){return Object.hasOwnProperty.call(this[$],e)},
// 4.4.9
u.prototype.delete=function(e){return!!Object.hasOwnProperty.call(this[$],e)&&(delete this[$][e],!0)};/*
 * Simple ModuleNamespace Exotic object based on a baseObject
 * We export this for allowing a fast-path for module namespace creation over Module descriptors
 */
// var EVALUATE = createSymbol('evaluate');
var ee=e("baseObject");
// 8.4.2
c.prototype=Object.create(null),"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(c.prototype,Symbol.toStringTag,{value:"Module"});/* function doEvaluate (evaluate, context) {
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
var te=e("register-internal");f.prototype=Object.create(i.prototype),f.prototype.constructor=f;var re=f.instantiate=e("instantiate");
// default normalize is the WhatWG style normalizer
f.prototype[f.resolve=i.resolve]=function(e,t){return n(e,t||q)},f.prototype[re]=function(e,t){},f.prototype[i.resolveInstantiate]=function(e,t){var r=this,n=this[te],o=this.registry[$];return p(r,e,t,o,n).then(function(e){if(e instanceof c)return e;
// resolveInstantiate always returns a load record with a link record and no module value
var t=e.linkRecord;
// if already beaten to done, return
if(!t){if(e.module)return e.module;throw e.evalError}return w(r,e,t,o,n).then(function(){return E(r,e,t,o,n,void 0)})})},/*
 * System.register
 */
f.prototype.register=function(e,t,r){var n=this[te];
// anonymous modules get stored as lastAnon
void 0===r?n.lastRegister=[e,t,void 0]:(n.records[e]||d(n,e,void 0)).registration=[t,r,void 0]},/*
 * System.registerDyanmic
 */
f.prototype.registerDynamic=function(e,t,r,n){var o=this[te];
// anonymous modules get stored as lastAnon
"string"!=typeof e?o.lastRegister=[e,t,r]:(o.records[e]||d(o,e,void 0)).registration=[t,r,n]},/*ContextualLoader.prototype.constructor = function () {
  throw new TypeError('Cannot subclass the contextual loader only Reflect.Loader.');
};*/
O.prototype.import=function(e){return this.loader.trace&&this.loader.loads[this.key].dynamicDeps.push(e),this.loader.import(e,this.key)};
// {} is the closest we can get to call(undefined)
var ne={};Object.freeze&&Object.freeze(ne);var oe,ie=Promise.resolve(),se=new c({}),ae=e("loader-config"),ue=e("plain-resolve"),ce=e("plain-resolve-sync"),le="undefined"==typeof window&&"undefined"!=typeof self&&"undefined"!=typeof importScripts,fe=!1,de=!1;if(z&&function(){var e=document.createElement("link").relList;if(e&&e.supports){de=!0;try{fe=e.supports("preload")}catch(e){}}}(),z){var pe=[],he=window.onerror;window.onerror=function(e,t){for(var r=0;r<pe.length;r++)if(pe[r].src===t)return void pe[r].err(e);he&&he.apply(this,arguments)}}T.plainResolve=ue,T.plainResolveSync=ce;var ve=T.prototype=Object.create(f.prototype);ve.constructor=T,ve[T.resolve=f.resolve]=function(e,t){var r=n(e,t||q);if(void 0!==r)return Promise.resolve(r);
// plain resolution
var o=this;return ie.then(function(){return o[ue](e,t)}).then(function(t){
// if in the registry then we are done
if(t=t||e,o.registry.has(t))return t;
// then apply paths
// baseURL is fallback
var r=o[ae];return M(r.baseURL,r.paths,t)})},ve.newModule=function(e){return new c(e)},ve.isModule=P,ve.resolveSync=function(e,t){var r=n(e,t||q);if(void 0!==r)return r;if(
// plain resolution
r=this[ce](e,t)||e,this.registry.has(r))return r;
// then apply paths
var o=this[ae];return M(o.baseURL,o.paths,r)},ve.import=function(){return f.prototype.import.apply(this,arguments).then(function(e){return"__useDefault"in e?e.__useDefault:e})},ve[ue]=ve[ce]=N,ve[T.instantiate=f.instantiate]=W,ve.config=function(e){var t=this[ae];if(e.baseURL&&(t.baseURL=n(e.baseURL,q)||n("./"+e.baseURL,q),"/"!==t.baseURL[t.baseURL.length-1]&&(t.baseURL+="/")),e.paths&&L(t.paths,e.paths),e.map){o=e.map;for(var r in o)if(Object.hasOwnProperty.call(o,r))if("string"==typeof(i=o[r]))t.map[r]=i;else{
// normalize parent with URL and paths only
a=n(r,q)||M(t.baseURL,t.paths,r);L(t.submap[a]||(t.submap[a]={}),i)}}for(var r in e)if(Object.hasOwnProperty.call(e,r)){var o=e[r];switch(r){case"baseURL":case"paths":case"map":break;case"bundles":for(var r in o)if(Object.hasOwnProperty.call(o,r))for(var i=o[r],s=0;s<i.length;s++)t.bundles[this.resolveSync(i[s],void 0)]=r;break;case"depCache":for(var r in o)if(Object.hasOwnProperty.call(o,r)){var a=this.resolveSync(r,void 0);t.depCache[a]=(t.depCache[a]||[]).concat(o[r])}break;case"wasm":t.wasm="undefined"!=typeof WebAssembly&&!!o;break;default:throw new TypeError('The SystemJS production build does not support the "'+r+'" configuration option.')}}},
// getConfig configuration cloning
ve.getConfig=function(e){var t=this[ae],r={};L(r,t.map);for(var n in t.submap)Object.hasOwnProperty.call(t.submap,n)&&(r[n]=L({},t.submap[n]));var o={};for(var n in t.depCache)Object.hasOwnProperty.call(t.depCache,n)&&(o[n]=[].concat(t.depCache[n]));var i={};for(var n in t.bundles)Object.hasOwnProperty.call(t.bundles,n)&&(i[n]=[].concat(t.bundles[n]));return{baseURL:t.baseURL,paths:L({},t.paths),depCache:o,bundles:i,map:r,wasm:t.wasm}},
// ensure System.register and System.registerDynamic decanonicalize
ve.register=function(e,t,r){return"string"==typeof e&&(e=this.resolveSync(e,void 0)),f.prototype.register.call(this,e,t,r)},ve.registerDynamic=function(e,t,r,n){return"string"==typeof e&&(e=this.resolveSync(e,void 0)),f.prototype.registerDynamic.call(this,e,t,r,n)};var ye={};T.prototype.version="0.20.16 Production";var me=new T;
// only set the global System on the global in browsers
if(z||le)
// dont override an existing System global
if(J.SystemJS=me,J.System){var ge=J.System.register;J.System.register=function(){ge&&ge.apply(this,arguments),me.register.apply(me,arguments)}}else J.System=me;"undefined"!=typeof module&&module.exports&&(module.exports=me)}();