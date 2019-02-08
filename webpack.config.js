var path = require('path');

module.exports = {
  mode: 'production',
  entry: './src/utils/babel.js',
  output: {
    path: path.resolve(__dirname, 'dist/utils'),
    filename: 'babel.js',
    library: 'babel',
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
  }
};
