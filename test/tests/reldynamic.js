

export function dynamicLoad() {
  return System.import('./reldynamicdep', { name: __moduleName });
}
