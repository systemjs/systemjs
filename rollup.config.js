import replace from '@rollup/plugin-replace';
import fs from 'fs';
import path from 'path';
import { terser } from 'rollup-plugin-terser';

const version = JSON.parse(fs.readFileSync('package.json')).version;
const extras = fs.readdirSync(path.resolve(__dirname, 'src/extras'))
const terserOptions = {
  mangle: {
    eval: true,
    module: true,
    safari10: true,
    toplevel: true,
  },
  parse: {
  },
  compress: {
    unsafe: true,
    arguments: true,
    hoist_funs: true,
    hoist_props: true,
    keep_fargs: false,
    negate_iife: true,
    module: true,
    pure_getters: true,
    passes: 2,
    sequences: 400,
    toplevel: true,
    unsafe_proto: true,
    unsafe_regexp: true,
    unsafe_undefined: true,
  },
  output: {
    comments(node, comment) {
      return /^\* SystemJS [0-9]\./.test(comment.value.trim());
    },
    safari10: true,
  },
  ecma: 5, // specify one of: 5, 2015, 2016, 2017 or 2018
  keep_classnames: false,
  keep_fnames: false,
  ie8: false,
  module: true,
  nameCache: null, // or specify a name cache object
  safari10: true,
  toplevel: true,
  warnings: false,
};

export default [
  // mainConfig('system', true),
  mainConfig('system', false),
  // mainConfig('s', true),
  mainConfig('s', false),
  // ...extrasConfig(true),
  // ...extrasConfig(false),
]

function mainConfig(name, isDev) {
  const sjs = name === 's'
  let banner
  if (sjs) {
    banner = isDev ? `/*
  * SJS ${version}
  * Minimal SystemJS Build
  */` : null;
  } else {
    banner = `/*
  * SystemJS ${version}
  */`
  }

  return {
    input: `src/${name}.js`,
    output: {
      file: `dist/${name}${isDev ? '' : '.min'}.js`,
      format: 'iife',
      strict: false,
      sourcemap: isDev,
      banner
    },
    plugins: [
      replace({
        TRACING: sjs ? 'false' : 'true',
      }),
      !isDev && terser(terserOptions)
    ]
  }
}

function extrasConfig(isDev) {
  return extras.map(extra => {
    extra = extra.replace('.js', '');
    return {
      input: `src/extras/${extra}.js`,
      output: {
        file: `dist/extras/${extra}${isDev ? '' : '.min'}.js`,
        format: 'iife',
        strict: false,
        compact: true,
        sourcemap: !isDev,
      },
      plugins: [
        !isDev && terser(terserOptions)
      ]
    }
  })
}
