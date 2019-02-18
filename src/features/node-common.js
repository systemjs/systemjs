import fs from 'fs';

export function fileExists(path) {
  try {
    fs.accessSync(path);
    return fs.statSync(path).isFile();
  } catch (err) {
    return false;
  }
}
