importScripts("../../dist/system.js");

System.import("../fixtures/register-modules/es6-withdep.js").then(
  function (m) {
    postMessage({
      p: m.p,
    });
  },
  function (err) {
    console.error(err);
  }
);
