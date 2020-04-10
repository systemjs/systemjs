import sourceMapSupport from 'source-map-support';
import makeFetchHappen from 'make-fetch-happen';
import path from 'path';
import { promises as fs } from 'fs';
import { fileURLToPath } from 'url';
import rimraf from 'rimraf';
import os from 'os';

export let clearFetchCache;

sourceMapSupport.install();

const home = os.homedir();
let cacheDir;
if (process.platform === 'darwin')
  cacheDir = path.join(home, 'Library', 'Caches', 'systemjs');
else if (process.platform === 'win32')
  cacheDir = path.join(process.env.LOCALAPPDATA || path.join(home, 'AppData', 'Local'), 'systemjs-cache');
else
  cacheDir = path.join(process.env.XDG_CACHE_HOME || path.join(home, '.cache'), 'systemjs');

clearFetchCache = function () {
  rimraf.sync(path.join(cacheDir, 'fetch-cache'));
};

const fetch = makeFetchHappen.defaults({ cacheManager: path.join(cacheDir, 'fetch-cache')});

global.System.constructor.prototype.shouldFetch = () => true;
global.System.constructor.prototype.fetch = async url => {
  if (url.startsWith('file:')) {
    try {
      const source = await fs.readFile(fileURLToPath(url.toString()));
      return {
        ok: true,
        status: 200,
        headers: {
          get(headerName) {
            if (headerName === 'content-type') {
              return 'application/javascript';
            } else {
              throw Error(`NodeJS fetch emulation doesn't support ${headerName} header`);
            }
          }
        },
        async text () {
          return source.toString();
        },
        async json () {
          return JSON.parse(source.toString());
        }
      };
    }
    catch (e) {
      if (e.code === 'ENOENT')
        return { status: 404, statusText: e.toString() };
      else
        return { status: 500, statusText: e.toString() };
    }
  } else {
    return fetch(url).then(function (res) {
      // Workaround for https://github.com/npm/make-fetch-happen/issues/28
      return res.status === 304 ? fetch(url, { cache: 'reload' }) : res;
    });
  }
};