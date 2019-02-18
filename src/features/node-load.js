import { ok as assert } from 'assert';
import path from 'path';

import { systemJSPrototype } from '../system-core.js';
import { URL } from '../common.js';
import { compileScript } from '../utils/compile';
import { fetch } from '../utils/fetch';


function detectFormat(url) {
  const ext = path.extname(url.pathname);

  if (ext === '.mjs') {
    return 'esm';
  } else if (ext === '.json') {
    return 'json';
  } else if (ext === '.js') {
    return 'cjs';
  } else if (url.protocol === 'builtin:') {
    return 'builtin';
  }

  return undefined;
}


async function loadRegisterModule(url, loader) {
  const source = await fetch(url).then(response => response.text());

  compileScript(url, source, {
    System: loader,
    SystemJS: loader,
  });
}


async function loadBuiltinModule(url, loader) {
  const name = url.pathname;

  const nodeModule = require(name);

  const registration = [[], function declare(_export) {
    return {
      execute() {
        _export('default', nodeModule);
        _export(nodeModule);
      },
    };
  }];

  loader.register(...registration);
}


async function loadJSONModule(url, loader) {
  const data = await fetch(url).then(response => response.json());

  const registration = [[], function declare(_export) {
    return {
      execute() {
        _export('default', data);
      },
    };
  }];

  loader.register(...registration);
}


systemJSPrototype.instantiate = async function instantiate(url, firstParentUrl) {
  assert(url, 'missing url');
  assert(url instanceof URL || typeof url === 'string', 'url must be a URL or string');

  url = new URL(url);

  const format = detectFormat(url);

  try {
    switch(format) {
      case 'builtin':
        await loadBuiltinModule(url, this);
        break;

      case 'json':
        await loadJSONModule(url, this);
        break;

      default:
        await loadRegisterModule(url, this);
    }
  } catch (err) {
    if (err instanceof ReferenceError) {
      throw err;
    }
    throw new Error(`Error loading ${url}${firstParentUrl ? ' from ' + firstParentUrl : ''}`);
  }

  return this.getRegister();
};
