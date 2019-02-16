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

const watch = {
  clearScreen: false,
};

export default [
  // Browser-specific bundle
  {
    input: `src/${name}.js`,
    output: {
      file: `dist/${name}.js`,
      format: 'iife',
      sourcemap: true,
      strict: false,
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
    watch,
  },

  // Node-specific bundle
  {
    input: 'src/system-node.js',
    output: {
      file: 'dist/system-node.js',
      format: 'cjs',
      sourcemap: true,
      strict: true,
      banner: nodeBanner,
      external: [
        'assert',
        'file-url',
        'fs',
        'is-builtin-module',
        'path',
        'source-map-support',
        'strip-shebang',
        'url',
        'vm',
      ],
    },
    plugins: [replace({
      TRACING: process.env.sjs ? 'false' : 'true'
    })],
    watch,
  },

  // Extra bundles
  ...extrasInputFiles.map(file => ({
    input: `src/extras/${file}`,
    output: {
      file: `dist/extras/${file}`,
      format: 'iife',
      name: `systemjs.extras.${path.basename(file)}`,
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
    watch,
  })),
];
