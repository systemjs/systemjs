import replace from 'rollup-plugin-replace';
import fs from 'fs';

const version = JSON.parse(fs.readFileSync('package.json')).version;
const name = process.env.sjs ? 's' : 'system';

console.log(process.env.dev)

export default {
  input: `src/${name}.js`,
  output: {
    format: 'iife',
    strict: false,
    file: `dist/${name}.js`,
    banner: process.env.sjs ? `/*
* SJS ${version}
* Minimal SystemJS Build
*/` : `/*
* SystemJS ${version}
*/`
  },
  plugins: [replace({
    TRACING: process.env.sjs ? 'false' : 'true',
    DEV: process.env.dev ? 'true' : 'false'
  })]
};
