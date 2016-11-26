declare type SystemJSModule = any;

declare type SystemJSFormats = 'esm' | 'cjs' | 'amd' | 'global' | 'register';

interface SystemJSMetaConfig {
  format?: SystemJSFormats;

  exports?: string;

  deps?: string[];

  globals?: {
    [key: string]: string;
  }

  loader?: string;

  sourceMap?: boolean;

  scriptLoad?: boolean;

  nonce?: string;

  integrity?: string;

  crossOrigin?: 'anonymous' | 'use-credentials';

  esmExports?: boolean;
}

interface SystemJSPackageConfig {
  main?: string;

  format?: SystemJSFormats;

  defaultExtension?: string | boolean;

  map?: {
    [key: string]: string;
  }

  meta?: {
    [key: string]: SystemJSMetaConfig;
  }
}

interface SystemJSConfig {
  baseURL?: string;

  babelOptions?: any;

  bundles?: {
    [key: string]: string[];
  }

  defaultJSExtensions?: boolean;

  depCache?: {
    [key: string]: string[];
  }

  map?: {
    [key: string]: string;
  }

  meta?: {
    [key: string]: SystemJSMetaConfig;
  }

  packages?: {
    [key: string]: SystemJSPackageConfig;
  }

  paths?: {
    [key: string]: string;
  }

  traceurOptions?: any;

  transpiler?: 'traceur' | 'babel' | 'typescript';

  typescriptOptions?: any;
}

interface SystemJSConstructor {
  new (): SystemJS;
}

interface SystemJS extends SystemJSConfig {
  amdDefine: Function;

  amdRequire: Function;

  config(config: SystemJSConfig): void;

  constructor: SystemJSConstructor;

  delete(moduleName: string): boolean;

  get(moduleName: string): SystemJSModule;

  has(moduleName: string): boolean;

  import(moduleName: string, normalizedParentName?: string): Promise<SystemJSModule>;

  newModule(object: any): SystemJSModule;

  register(deps?: string[], declare?: Function): void;

  register(name: string, deps?: string[], declare?: Function): void;

  registerDynamic(deps?: string[], executingRequire?: boolean, declare?: Function): void;

  registerDynamic(name: string, deps?: string[], executingRequire?: boolean, declare?: Function): void;

  set(moduleName: string, module: SystemJSModule): void;

  _nodeRequire: Function;
}

/**
 * @deprecated Use the SystemJS object instead.
 */
declare let System: SystemJS;

declare let SystemJS: SystemJS;
