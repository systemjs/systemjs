// Equivalent to:
// await new Promise((resolve) => setTimeout(resolve));
// export default class A { constructor() { this.value = 6; } });
System.register([], function (_export, _context) {
    return {
        setters: [],
        execute: async function() {
            await new Promise((resolve) => setTimeout(resolve, 1));
            _export('default', class A { constructor() { this.value = 6; } });
        },
    };
});