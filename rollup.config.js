import fs from 'fs';
import path from 'path';

import commonjs from 'rollup-plugin-commonjs';
import ignore from 'rollup-plugin-ignore';
import json from 'rollup-plugin-json';
import nodeBuiltins from 'rollup-plugin-node-builtins';
import nodeGlobals from 'rollup-plugin-node-globals';
import nodeResolve from 'rollup-plugin-node-resolve';
import replace from 'rollup-plugin-replace';


const version = JSON.parse(fs.readFileSync('package.json')).version;
const name = process.env.sjs ? 's' : 'system';

const browserBanner = process.env.sjs ? `/*
* SJS ${version}
* Minimal SystemJS Build
*/` : `/*
* SystemJS ${version}
*/`;

const nodeBanner = `/*
* SystemJS - NodeJS ${version}
*/`;

const extrasInputFiles = fs.readdirSync(path.resolve('src/extras'));

export default [
  {
    input: `src/${name}.js`,
    output: {
      format: 'iife',
      strict: false,
      file: `dist/${name}.js`,
      sourcemap: true,
      banner: browserBanner,
    },
    plugins: [
      replace({
        TRACING: process.env.sjs ? 'false' : 'true'
      }),
      ignore([
        'file-fetch',
        'vm',
      ]),
      nodeResolve({
        jsnext: true,
        preferBuiltins: true,
      }),
      commonjs(),
      json(),
      nodeGlobals(),
      nodeBuiltins(),
    ],
  },

  {
    input: 'src/system-node.js',
    output: {
      format: 'cjs',
      strict: true,
      file: 'dist/system-node.js',
      banner: nodeBanner,
    },
    plugins: [replace({
      TRACING: process.env.sjs ? 'false' : 'true'
    })]
  },

  ...extrasInputFiles.map(file => ({
    input: `src/extras/${file}`,
    output: {
      file: `dist/extras/${file}`,
      name: `systemjs.extras.${path.basename(file)}`,
      format: 'iife',
      sourcemap: true,
      strict: false,
    },
    plugins: [
      replace({
        TRACING: process.env.sjs ? 'false' : 'true'
      }),
      ignore([
        'file-fetch',
        'vm',
      ]),
      nodeResolve({
        jsnext: true,
        preferBuiltins: true,
      }),
      commonjs(),
      nodeGlobals(),
      json(),
      nodeBuiltins(),
    ],
  })),
];
