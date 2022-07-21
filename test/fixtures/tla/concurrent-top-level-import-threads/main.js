// Equivalent to:
// export { stamp } from './dep.js';
System.register(['./dep.js'], function (_export, _context) {
    return {
        setters: [function (dep) {
            _export('stamp', dep.stamp);
        }]
    };
});