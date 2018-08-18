/*
 * Supports loading System.register in workers
 */
import { systemJSPrototype } from '../system-core';
import { hasSelf } from '../common';

if (hasSelf && typeof importScripts === 'function')
  systemJSPrototype.instantiate = function (url) {
    const loader = this;
    return new Promise(function (resolve, reject) {
      try {
        importScripts(url);
      }
      catch (e) {
        reject(e);
      }
      resolve(loader.execInstantiate());
    });
  };