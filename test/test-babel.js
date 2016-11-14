require('../dist/system.src.js');

SystemJS.config({
  baseURL: 'test/',
  map: {
    'plugin-babel': './node_modules/systemjs-plugin-babel/plugin-babel.js',
    'systemjs-babel-build': './node_modules/systemjs-plugin-babel/systemjs-babel-node.js'
  },
  transpiler: 'plugin-babel'
});

require('./test');
