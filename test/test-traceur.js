require('../dist/system.src.js');

SystemJS.config({
  baseURL: 'test/',
  traceurOptions: {
    asyncFunctions: true
  },
  warnings: true,
  map: {
    'plugin-traceur': './node_modules/systemjs-plugin-traceur/plugin-traceur.js',
    'traceur': '@node/traceur'
  },
  transpiler: 'plugin-traceur'
});

require('./test');
