import replace from 'rollup-plugin-replace';
import babel from 'rollup-plugin-babel';
import fs from 'fs';

const version = JSON.parse(fs.readFileSync('package.json')).version;
const name = process.env.sjs ? 's' : 'system';

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
  plugins: [
      replace({
    TRACING: process.env.sjs ? 'false' : 'true'
  }),
    babel({
      exclude: 'node_modules/**',
      babelrc: false,
      presets: [['@babel/preset-env', { modules: false }]],
    })
  ]
};
