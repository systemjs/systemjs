// SystemJS Loader Class and Extension helpers

function SystemJSLoader(options) {
  SystemLoader.call(this, options);

  systemJSConstructor.call(this, options);
}

// inline Object.create-style class extension
function SystemProto() {};
SystemProto.prototype = SystemLoader.prototype;
SystemJSLoader.prototype = new SystemProto();

var systemJSConstructor;

function hook(name, hook) {
  if (SystemJSLoader.prototype[name])
    SystemJSLoader.prototype[name] = hook(SystemJSLoader.prototype[name]);
}
function hookConstructor(hook) {
  systemJSConstructor = hook(systemJSConstructor || function() {});
}


// define exec for easy evaluation of a load record (load.name, load.source, load.address)
// with source maps
function __exec(load) {
  var loader = this;
  // support sourceMappingURL (efficiently)
  var sourceMappingURL;
  var lastLineIndex = load.source.lastIndexOf('\n');
  if (lastLineIndex != -1) {
    if (load.source.substr(lastLineIndex + 1, 21) == '//# sourceMappingURL=') {
      sourceMappingURL = load.source.substr(lastLineIndex + 22, load.source.length - lastLineIndex - 22);
      sourceMappingURL = new URL(sourceMappingURL, load.address).href;
    }
  }

  __globalEval(load.source
      + (load.address ? '//# sourceMap=' + load.address : '')
      + (sourceMappingURL ? '\n//# sourceMappingURL=' + sourceMappingURL : '')
      , load.address);
}

function dedupe(deps) {
  var newDeps = [];
  for (var i = 0, l = deps.length; i < l; i++)
    if (indexOf.call(newDeps, deps[i]) == -1)
      newDeps.push(deps[i])
  return newDeps;
}

// we define a __globalEval for globally-scoped execution
var __globalEval;

// use script injection eval to get identical global script behaviour
if (typeof document != 'undefined') {
  var head;

  var scripts = document.getElementsByTagName('script');
  $__curScript = scripts[scripts.length - 1];

  __globalEval = function(source, debugName) {
    if (!head)
      head = document.head || document.body || document.documentElement;

    var script = document.createElement('script');
    script.text = source;
    var onerror = window.onerror;
    var e;
    window.onerror = function(_e) {
      e = addToError(_e, 'Evaluating ' + debugName);
    }
    head.appendChild(script);
    head.removeChild(script);
    window.onerror = onerror;
    if (e)
      throw e;
  }
}
// Web Worker uses original ESML eval
// this may lead to some global module execution differences (eg var not defining onto global)
else if (typeof WorkerGlobalScope != 'undefined') {
  __globalEval = function(source, debugName) {
    try {
      new Function(source).call(__global);
    }
    catch(e) {
      throw addToError(e, 'Evaluating ' + debugName);
    }
  };
}
else {
  // global scoped eval for node
  var vmModule = 'vm';
  var vm = require(vmModule);
  __globalEval = function(source, address, sourceMap) {
    try {
      vm.runInThisContext(source);
    }
    catch(e) {
      throw addToError(e, 'Evaluating ' + debugName);
    }
  };
}