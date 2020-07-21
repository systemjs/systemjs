/*
 * Support for live DOM updating import maps
 */
(function (global) {
  var systemJSPrototype = global.System.constructor.prototype;

  function flagForReparse (element) {
    element[systemJSPrototype.IMPORT_MAP_PARSED] = false;
  }

  function handleMutation (mutations) {
    var reparse = false;

    mutations.forEach(function (mutation) {
      switch (mutation.type) {
        case 'attributes':
          if (mutation.attributeName === 'src' && isImportMapElement(mutation.target)) {
            flagForReparse(mutation.target);
            reparse = true;
          }
          break;

        case 'childList':
          var addedNodes = mutation.addedNodes;
          for (var i=0; i<addedNodes.length; i++) {
            if (isImportMapElement(addedNodes[i])) {
              flagForReparse(addedNodes[i]);
              reparse = true;
            }
          }
          break;
      }
    });

    if (reparse) {
      System.prepareImport(true);
    }
  }

  function isImportMapElement (element) {
    return element.nodeType === Node.ELEMENT_NODE && element.tagName === 'SCRIPT' && element.type === 'systemjs-importmap';
  }

  new MutationObserver(handleMutation).observe(document.documentElement, {
    attributes: true,
    childList: true,
    subtree: true
  });
})(typeof self !== 'undefined' ? self : global);