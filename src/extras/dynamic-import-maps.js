/*
 * Support for live DOM updating import maps
 */
(function () {
  function handleMutation (mutations) {
    var reparse = false;

    for (var i = 0; i < mutations.length; i++) {
      var mutation = mutations[i];
      if (mutation.type !== 'childList')
        continue;
      for (var j = 0; j < mutation.addedNodes.length; j++) {
        var addedNode = mutation.addedNodes[j];
        if (addedNode.tagName === 'SCRIPT' && addedNode.type === 'systemjs-importmap') {
          reparse = true;
          break;
        }
      }
    }

    if (reparse)
      System.prepareImport(true);
  }

  new MutationObserver(handleMutation).observe(document.documentElement, {
    attributes: false,
    childList: true,
    subtree: true
  });
})();