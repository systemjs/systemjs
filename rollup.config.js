import fs from 'fs';
import path from 'path';

import babel from 'rollup-plugin-babel';
import commonjs from 'rollup-plugin-commonjs';
import json from 'rollup-plugin-json';
import nodeBuiltins from 'rollup-plugin-node-builtins';
import nodeGlobals from 'rollup-plugin-node-globals';
import nodeResolve from 'rollup-plugin-node-resolve';
import replace from 'rollup-plugin-replace';


const version = JSON.parse(fs.readFileSync('package.json')).version;
const name = process.env.sjs ? 's' : 'system';
const banner = process.env.sjs ? `/*
* SJS ${version}
* Minimal SystemJS Build
*/` : `/*
* SystemJS ${version}
*/`;


const extrasInputFiles = fs.readdirSync(path.resolve('src/extras'))
  .filter(name => name.endsWith('.js'));


export default [
  {
    input: `src/${name}.js`,
    output: {
      format: 'iife',
      strict: false,
      file: `dist/${name}.js`,
      sourcemap: true,
      banner: banner,
    },
    plugins: [
      replace({
        TRACING: process.env.sjs ? 'false' : 'true'
      }),
      nodeResolve({
        jsnext: true,
        preferBuiltins: true,
      }),
      commonjs(),
      nodeGlobals(),
      nodeBuiltins(),
    ],
  },
  ...extrasInputFiles.map(file => ({
    input: `src/extras/${file}`,
    output: {
      file: `dist/extras/${file}`,
      name: `systemjs.extras.${path.basename(file)}`,
      format: 'iife',
      sourcemap: true,
      strict: false,
      globals: {
        '@babel/core': 'babel',
      },
    },
    external: [
      '@babel/core',
    ],
    plugins: [
      nodeResolve({
        jsnext: true,
        preferBuiltins: true,
      }),
      babel({
        plugins: [
          ['@babel/plugin-transform-destructuring', { loose: true, useBuiltIns: true }],
        ],
      }),
      commonjs(),
      nodeGlobals(),
      json(),
      nodeBuiltins(),
    ],
  })),
];
