// This implements the logic described here:
//    https://github.com/nodejs/node-eps/blob/master/002-es-modules.md

import { ok as assert } from 'assert';
import fs from 'fs';

import isBuiltinModule from 'is-builtin-module';

import { DEFAULT_BASEURL, fileExists, URL } from './node-common';

const EXTENSIONS = ['.mjs', '.js', '.json'];


function isPath(value) {
  if (value === '.') {
    return true;
  }
  return /^\.{0,2}\//.test(value);
}

export function createNodeResolver({ baseUrl = DEFAULT_BASEURL, resolveBareNames = true } = {}) {
  const FILE_CACHE = new Map();
  let resolveDepth = 0;

  function checkFileExists(path) {
    if (!FILE_CACHE.has(path)) {
      FILE_CACHE.set(path, fileExists(path));
    }
    return FILE_CACHE.get(path);
  }

  function doPathSearch(specifier) {
    try {
      return doFileSearch(specifier);
    } catch (err) {
      // continue...
    }

    try {
      return doDirectorySearch(specifier);
    } catch (err) {
      // continue...
    }

    throw new Error(`Cannot resolve '${specifier}'`);
  }


  function doFileSearch(specifier) {
    if (checkFileExists(specifier)) {
      return specifier;
    }

    const matchingExtension = EXTENSIONS.find(ext => {
      const searchable = new URL(specifier);
      searchable.pathname += ext;
      return checkFileExists(searchable);
    });

    if (matchingExtension) {
      const searchable = new URL(specifier);
      searchable.pathname += matchingExtension;
      return searchable;
    }

    throw new Error(`Cannot resolve '${specifier}'`);
  }


  function doDirectorySearch(specifier) {
    const dir = new URL(specifier);

    if (!dir.pathname.endsWith('/')) {
      dir.pathname += '/';
    }

    let searchable = new URL('./package.json', dir);
    if (checkFileExists(searchable)) {
      const pkgContent = fs.readFileSync(searchable, 'utf8');
      const pkg = JSON.parse(pkgContent);
      if ('main' in pkg) {
        const main = new URL(pkg.main, dir);
        return doPackageMainSearch(main);
      }
    }

    try {
      return doIndexSearch(dir);
    } catch (err) {
      // continue...
    }

    throw new Error(`Cannot resolve directory '${specifier}'`);
  }


  function doPackageMainSearch(specifier) {
    try {
      return doFileSearch(specifier);
    } catch (err) {
      // continue...
    }

    try {
      return doIndexSearch(specifier);
    } catch (err) {
      // continue...
    }

    throw new Error(`Cannot resolve '${specifier}`);
  }


  function doIndexSearch(specifier) {
    let searchable = new URL(specifier);

    if (!searchable.pathname.endsWith('/')) {
      searchable.pathname += '/';
    }

    searchable = new URL('./index', searchable);

    try {
      return doFileSearch(searchable);
    } catch (err) {
      // continue...
    }

    throw new Error(`Cannot resolve index '${specifier}'`);
  }


  function doModuleSearch(specifier, parentUrl) {
    if (isBuiltinModule(specifier)) {
      return new URL(`builtin:${specifier}`);
    }

    const pkg = new URL('./', parentUrl);
    const searchable = new URL(`./node_modules/${specifier}`, pkg);

    try {
      return doFileSearch(searchable);
    } catch (err) {
      // continue...
    }

    try {
      return doDirectorySearch(searchable);
    } catch (err) {
      // continue...
    }

    const parent = new URL('../', pkg);
    if (parent.href.startsWith(baseUrl.href)) {
      // Do not search above the baseUrl.
      try {
        return doModuleSearch(specifier, parent);
      } catch (err) {
        // continue...
      }
    }

    throw new Error(`Cannot resolve '${specifier}' from '${parentUrl}'`);
  }


  function resolve(specifier, parentUrl = baseUrl) {
    try {
      resolveDepth += 1;

      assert(specifier, 'missing specifier');
      assert(typeof specifier === 'string', 'specifier must be a string');

      assert(parentUrl, 'missing parentUrl');
      assert(parentUrl instanceof URL, 'parentUrl must be a URL');

      try {
        return new URL(specifier);
      } catch (err) {
        // continue...
      }

      if (isPath(specifier)) {
        return doPathSearch(new URL(specifier, parentUrl));
      }

      if (resolveBareNames) {
        return doModuleSearch(specifier, parentUrl);
      }

      return null;
    } finally {
      resolveDepth -= 1;
      if (resolveDepth === 0) {
        FILE_CACHE.clear();
      }
    }
  }

  Object.defineProperty(resolve, 'baseURL', {value: baseUrl});

  return resolve;
}
