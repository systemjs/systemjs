define("app-built/module", [], function() {
    var e = "./app/module", t = "es6!", n = function() {
        console.log("ES6 Class!")
    };
    return $traceurRuntime.createClass(n, {}, {}), {get test() {
            return t
        },get MyClass() {
            return n
        },__esModule: !0}
});