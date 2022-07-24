// Equivalent to:
// await Promise.resolve();
System.register([], function (_export, _context) {
    return {
        execute: async function () {
            await Promise.resolve();
        },
    };
});