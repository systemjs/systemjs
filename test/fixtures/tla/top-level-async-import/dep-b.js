// Equivalent to:
// import A from './dep-a';
// export default new A().value;
System.register(['./dep-a.js'], function(_export, _context) {
    var _dep_a;
    return {
        setters: [function(dep_a){
            _dep_a = dep_a;
        }],
        execute: function() {
            var A = _dep_a.default;
            _export('default', new A().value);
        },
    };
});