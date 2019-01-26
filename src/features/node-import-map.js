/*
 * Import map support for SystemJS on Node.js
 *
 * Only supports loading the first import map
 */

import fs from 'fs';

import { parseImportMap, resolveImportMap } from '../common.js';
import { DEFAULT_BASEURL, fileExists, isURL, URL } from './node-common.js';


export function createImportMapResolver({ baseUrl = DEFAULT_BASEURL, importMapConfig}) {
  let importMapUrl;
  let importMap;

  if (isURL(importMapConfig)) {
    importMapUrl = new URL(importMapConfig);
  } else {
    importMapUrl = new URL('./systemjs-importmap.json', baseUrl);
  }

  if (fileExists(importMapUrl)) {
    const importMapRaw = fs.readFileSync(importMapUrl, 'utf8');
    const importMapData = JSON.parse(importMapRaw);
    importMap = parseImportMap(importMapData, importMapUrl.href);
  } else {
    importMap = { imports: {}, scopes: {} };
  }

  function resolve(id, parentUrl = baseUrl) {
    return resolveImportMap(id, `${parentUrl}`, importMap);
  }

  Object.defineProperty(resolve, 'baseURL', {value: baseUrl});

  return resolve;
}
