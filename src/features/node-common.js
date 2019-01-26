import fs from 'fs';
import _path from 'path';
import url from 'url';

import fileUrl from 'file-url';


export const URL = global.URL
  ? global.URL
  : url.URL;


export const pathToFileURL = url.pathToFileURL
  ? url.pathToFileURL
  : function pathToFileURL(path) {
    const theUrl = new URL(fileUrl(path));
    if (path.endsWith(_path.sep)) {
      theUrl.pathname += '/';
    }
    return theUrl;
  };

export const DEFAULT_BASEURL = pathToFileURL(process.cwd() + '/');


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
