/*
 * Script-only addition used for production loader
 *
 */

hookConstructor(function(constructor) {
  return function() {
    constructor.call(this);
    this.meta['*'] = this.meta['*'] || {};
    this.meta['*'].scriptLoad = true;
  };
});