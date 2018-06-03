import nodeResolve from 'rollup-plugin-node-resolve';
import replace from 'rollup-plugin-replace';
import fs from 'fs';

var version = JSON.parse(fs.readFileSync('package.json')).version;

if (process.env.production)
  version += ' Production';
else
  version += ' Dev';

var name = `system${process.env.production ? '-production' : ''}`;

export default {
  input: `src/${name}.js`,

  output: {
    format: 'iife',
    file: `dist/${name}.src.js`,
    sourcemap: true,
    sourcemapFile: `dist/${name}.js.map`,
    banner: `/*
* SystemJS v${version}
*/`
  },

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
