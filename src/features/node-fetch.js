import sourceMapSupport from 'source-map-support';
import fetch from 'node-fetch';
import { promises as fs } from 'fs';
import { fileURLToPath } from 'url';

sourceMapSupport.install();

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
    return fetch(url);
  }
};
