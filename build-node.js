import fs from 'fs';
import path from 'path';
import ncc from '@zeit/ncc';

ncc(path.resolve(process.cwd(), 'src/system-node.js'))
.then(({ code, map, assets }) => {
  console.log("Writing dist/system-node.cjs");
  fs.writeFileSync(path.resolve(process.cwd(), 'dist/system-node.cjs'), code);
});