var path = require('path');


module.exports = ['babel', 'SourceMapSupport'].map(name => ({
  mode: 'production',
  entry: `./src/utils/${name}.js`,
  output: {
    path: path.resolve(__dirname, 'dist/utils'),
    filename: `${name}.js`,
    library: name,
    libraryTarget: 'window',
  },
  resolve: {
    aliasFields: ['browser']
  },
  node: {
    console: false,
    global: true,
    process: true,
    __filename: 'mock',
    __dirname: 'mock',
    Buffer: true,
    setImmediate: true,
    fs: 'empty'
  },
}));
