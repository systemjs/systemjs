let instantiateCount = 0;

System.register("named-instantiate-count", [], function (_export) {
  instantiateCount++;
  return {
    execute: function () {
      _export('getInstantiateCount', function () {
        return instantiateCount;
      });
    }
  };
});