(function (global) {
  const systemJSPrototype = System.constructor.prototype;

  systemJSPrototype.reload = function (id, parentUrl) {
    const loader = this;

    // System.import resolves the url before setting up the loading state
    // doing the same here ensures we don't run into race conditions
    return Promise.resolve()
      .then(function () {
        return loader.resolve(id, parentUrl);
      })
      .then(function (id) {
        if (!loader.has(id)) {
          // module was not loaded before
          return loader.import(id);
        }

        // import the module to ensure that the current module is full loaded
        return loader.import(id)
          .catch(function () {
            // don't handle errors from the previous import, they might be fixed in the reload
          })
          .then(function () {

            // delete the module from the registry, re-import it and
            // update the references in the registry
            const update = loader.delete(id);
            return loader.import(id)
              .catch(function (error) {
                // on error we still need to call update to preserve importerSetters
                // for a potential future reload which fixes the error
                update && update();
                throw error;
              })
              .then(function (module) {
                update && update();
                return module;
              });
          });
      });
  }

})(typeof self !== 'undefined' ? self : global);
