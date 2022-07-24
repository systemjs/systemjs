// Equivalent to:
// import './async-dep.js';
// export const stamp = Date.now();
System.register(['./async-dep.js'], function (_export, _context) {
    return {
        execute: async function () {
            _export('stamp', Date.now());
        },
    };
});