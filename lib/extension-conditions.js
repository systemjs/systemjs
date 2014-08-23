/*
  SystemJS Conditions extensions

  System.config({
    meta: {
      'some/file': {
        condition: './condition-module',
        branches: {
          mobile: 'some/file-mobile',
          tablet: 'some/file-tablet'
        }
      },

      'some/polyfill': {
        condition: './has-feature',
        branches: {
          true: '@empty'
        }
      }
    }
  });

  The condition module whose 'default' export is the condition value:

  define(function() {
    return isMobile() ? 'mobile' : 'desktop';
  });

  or

  export default isMobile() ? 'mobile' : 'desktop';

  If the condition string is not in the branches object,
  the original module is loaded normally.
*/

function conditions(loader) {

  var loaderLocate = loader.locate;
  loader.locate = function(load) {
    return Promise.resolve(loaderLocate.call(this, load))
    .then(function(address) {
      // condition value can be overridden by meta
      if (!load.metadata.condition || 'conditionValue' in load.metadata)
        return address;
      
      // load the condition module setting metadata.conditionValue with it
      return System['import'](load.metadata.condition, { name: load.name, address: load.address })
      .then(function(conditionValue) {
        load.metadata.conditionValue = conditionValue['default'] || conditionValue;
        return address;
      });
    })
  }

  var loaderFetch = loader.fetch;
  loader.fetch = function(load) {
    // if we have a condition and branch match use that rather
    var conditionValue = load.metadata.conditionValue;
    if ('conditionValue' in load.metadata && load.metadata.branches[conditionValue]) {
      load.metadata.branchModule = load.metadata.branches[conditionValue];
      return '';
    }
    return loaderFetch.call(this, load);
  }

  var loaderInstantiate = loader.instantiate;
  loader.instantiate = function(load) {
    // if we're loading a branch module, pass it through as an alias in instantiate
    var branchModule = load.metadata.branchModule;
    if (branchModule) {
      load.metadata.deps.push(branchModule);
      load.metadata.execute = function(require) {
        return require(branchModule);
      }
      load.metadata.format = 'defined';
    }
    return loaderInstantiate.call(this, load);
  }
}