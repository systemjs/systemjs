/**
 * This polyfills Node with a version of fetch that can handle
 * "file" URLs.
 */

import 'isomorphic-fetch';
import fileFetch from 'file-fetch';

import { global, isNode } from '../common';


const globalFetch = global.fetch;
global.fetch = function fetch(input, init) {
  const { protocol, href } = new URL(input);
  if (isNode && protocol === 'file:') {
   return fileFetch(href, init);
  }
  return globalFetch(href, init);
};
