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
  SystemJSLoader.prototype[name] = hook(SystemJSLoader.prototype[name]);
}
function hookConstructor(hook) {
  systemJSConstructor = hook(systemJSConstructor || function() {});
}

function dedupe(deps) {
  var newDeps = [];
  for (var i = 0, l = deps.length; i < l; i++)
    if (indexOf.call(newDeps, deps[i]) == -1)
      newDeps.push(deps[i])
  return newDeps;
}

/*
  __useDefault
  
  When a module object looks like:
  newModule(
    __useDefault: true,
    default: 'some-module'
  })

  Then importing that module provides the 'some-module'
  result directly instead of the full module.

  Useful for eg module.exports = function() {}
*/
hook('import', function(systemImport) {
  return function(name, parentName) {
    return systemImport.call(this, name, parentName).then(function(module) {
      return module.__useDefault ? module['default'] : module;
    });
  };
});