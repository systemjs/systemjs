import url from 'url';
import fs from 'fs';

export const DEFAULT_BASEURL = url.pathToFileURL(process.cwd() + '/');

export function fileExists(path) {
  try {
    fs.accessSync(path);
    return fs.statSync(path).isFile();
  } catch (err) {
    return false;
  }
}


export function isURL(value) {
  if (value instanceof URL) {
    return true;
  }

  if (typeof value === 'string') {
    try {
      new URL(value);
      return true;
    } catch (err) {}
  }

  return false;
}
