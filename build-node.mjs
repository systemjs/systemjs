import fs from 'fs';
import path from 'path';
import ncc from '@zeit/ncc';

ncc(path.resolve(process.cwd(), 'src/system-node.js'), { filename: 'system-node.cjs', sourceMap: false })
.then(({ code, map, assets }) => {
  if (Object.keys(assets).length)
    console.warn('Found build assets - these may need to be included.');
  console.log("Writing dist/system-node.cjs");
  fs.writeFileSync(path.resolve(process.cwd(), 'dist/system-node.cjs'), code);
  // fs.writeFileSync(path.resolve(process.cwd(), 'dist/system-node.cjs.map'), map);
});
