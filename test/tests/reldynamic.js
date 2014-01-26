// the module object itself has a 'name' property

export function dynamicLoad() {
  return System.import('./reldynamicdep', { name: __moduleName });
}
