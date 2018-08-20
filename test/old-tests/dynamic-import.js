export function lazy () {
  return import('./dynamic-import-lazy.js').then(function (m) {
    return m.lazyValue;
  });
}
