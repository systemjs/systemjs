ES6 modules can check their own name from the global variable `__moduleName`. `__moduleAddress` is also available.

In CommonJS and AMD, this is available at `module.id`.

This allows easy relative dynamic loading, allowing modules to load additional functionality after the initial load:

```javascript
export function moreFunctionality() {
  return System.import('./extrafunctionality', { name: __moduleName });
}
```

This can be useful for modules that may only know during runtime which functionality they need to load.