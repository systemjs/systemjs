import replace from 'rollup-plugin-replace';
import fs from 'fs';

const version = JSON.parse(fs.readFileSync('package.json')).version;
const name = process.env.sjs ? 's' : 'system';

export default {
  input: `src/${name}.js`,
  output: {
    format: 'iife',
    strict: false,
    file: `dist/${name}.src.js`,
    sourcemap: true,
    sourcemapFile: `dist/${name}.js.map`,
    banner: process.env.sjs ? `/*
* SJS ${version}
* Minimal SystemJS Build
*/` : `/*
* SystemJS ${version}
*/`
  },
  plugins: [replace({
    TRACING: process.env.sjs ? 'false' : 'true'
  })]
};
