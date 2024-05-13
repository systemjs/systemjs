// Equivalent to:
// import './dep-a';
// import b from './dep-b';
// export default b;
System.register(['./dep-a.js', './dep-b.js'], function(_export, _context) {
    var _dep_b, _dep_c;
    return {
        setters: [null, function(dep_b){
            _dep_b = dep_b;
        }],
        execute: function () {
            _export('default', _dep_b.default);
        },
    };
});