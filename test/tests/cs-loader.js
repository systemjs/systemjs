export function translate(load) {
  return load.source.replace(/#/g, '');
}