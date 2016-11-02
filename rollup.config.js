import nodeResolve from 'rollup-plugin-node-resolve';
import replace from 'rollup-plugin-replace';
import fs from 'fs';

var version = JSON.parse(fs.readFileSync('package.json')).version + ' Standard';

export default {
  entry: 'src/system.js',
  format: 'iife',
  dest: 'dist/system.src.js',

  sourceMap: true,
  sourceMapFile: 'dist/system.js.map',

  banner: `/*
 * SystemJS v${version}
 */`,

  plugins: [
    nodeResolve({
      module: false,
      jsnext: false,
    }),
    replace({
      VERSION: JSON.stringify(version)
    })
  ],

  // skip rollup warnings (specifically the eval warning)
  onwarn: function() {}
};
