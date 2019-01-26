import { ok as assert } from 'assert';
import fs from 'fs';
import _path from 'path';
import _url from 'url';
import vm from 'vm';

import stripShebang from 'strip-shebang';

import { systemJSPrototype } from '../system-core.js';
import { global } from '../common.js';
import { DEFAULT_BASEURL, fileExists } from './node-common';
import './registry.js';
import { createNodeResolver } from './node-resolve';
import { createImportMapResolver } from './node-import-map';

const SystemJS = systemJSPrototype.constructor;


function detectFormat(url) {
  const ext = _path.extname(url.pathname);
  let format = null;

  if (ext === '.mjs') {
    format = 'esm';
  } else if (ext === '.json') {
    format = 'json';
  } else if (ext === '.js') {
    format = 'cjs';
  } else if (url.protocol === 'builtin:') {
    return 'builtin';
  }

  return format;
}


function createFileURLReader(url) {
  let CACHED_CONTENT;

  function read(force = false) {
    if (force === true || CACHED_CONTENT === undefined) {
      if (fileExists(read.url)) {
        CACHED_CONTENT = fs.readFileSync(read.url, 'utf8');
      } else {
        throw new Error(`File '${read.url.href}' does not exist.`);
      }
    }
    return CACHED_CONTENT;
  }

  try {
    read.url = new URL(url);
  } catch (err) {
    read.url = _url.pathToFileURL(url);
  }

  read.format = detectFormat(read.url);

  return read;
}


function wrapEsModuleSource(source) {
  const content_before = '(function (System) { ';
  const content_actual = stripShebang(source);
  const content_after = '\n});';

  return `${content_before}${content_actual}${content_after}`;
}


function loadRegisterModule(getContent, loader) {
  const { url } = getContent;
  const source = getContent();

  const wrapper = wrapEsModuleSource(source);

  const runOptions = {
    displayErrors: true,
    filename: `${url}`,
    lineOffset: 0,
  };

  const moduleVars = [
    loader,    /* System */
  ];

  vm.runInThisContext(wrapper, runOptions)(...moduleVars);
}


function loadBuiltinModule(getContent, loader) {
  const { url } = getContent;
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


function loadJSONModule(getContent, loader) {
  const registration = [[], function declare(_export) {
    return {
      execute() {
        _export('default', JSON.parse(getContent()));
      },
    };
  }];

  loader.register(...registration);
}


function tryResolve(resolve) {
  return function(id, parentUrl) {
    try {
      return resolve(id, parentUrl);
    } catch (err) {
      return undefined;
    }
  }
}


class NodeLoader extends SystemJS {
  constructor({ baseUrl = DEFAULT_BASEURL, importMapConfig } = {}) {
    super();

    const _baseUrl = new URL(baseUrl);
    if (!_baseUrl.pathname.endsWith('/')) {
      _baseUrl.pathname += '/';
    }
    this.baseUrl = _baseUrl;

    const resolverConfig = {
      baseUrl: this.baseUrl,
      importMapConfig,
    };

    this.resolvers = [
      createImportMapResolver(resolverConfig),
      createNodeResolver(resolverConfig),
    ];
  }

  resolve(id, parentUrl) {
    let resolved;

    for (let resolver of this.resolvers) {
      try {
        resolved = resolver(id, parentUrl);
        if (resolved) {
          return resolved;
        }
      } catch (err) {
        // Do nothing. Continue...
      }
    }

    throw new Error(`Cannot resolve "${id}"${parentUrl ? ` from ${parentUrl}` : ''}`);
  }


  async instantiate(url, firstParentUrl) {
    assert(url, 'missing url');
    assert(url instanceof URL || typeof url === 'string', 'url must be a URL or string');

    url = new URL(url);

    const getContent = createFileURLReader(url);

    try {
      switch(getContent.format) {
        case 'builtin':
          loadBuiltinModule(getContent, this);
          break;

        case 'json':
          loadJSONModule(getContent, this);
          break;

        default:
          loadRegisterModule(getContent, this);
      }
    } catch (err) {
      if (err instanceof ReferenceError) {
        throw err;
      }
      throw new Error(`Error loading ${url}${firstParentUrl ? ' from ' + firstParentUrl : ''}`);
    }

    return this.getRegister();
  }
}

global.System = new NodeLoader();

export default NodeLoader;
