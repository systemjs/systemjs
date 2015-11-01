interface PromiseLike<T> {
    /**
    * Attaches callbacks for the resolution and/or rejection of the Promise.
    * @param onfulfilled The callback to execute when the Promise is resolved.
    * @param onrejected The callback to execute when the Promise is rejected.
    * @returns A Promise for the completion of which ever callback is executed.
    */
    then<TResult>(onfulfilled?: (value: T) => TResult | PromiseLike<TResult>, onrejected?: (reason: any) => TResult | PromiseLike<TResult>): PromiseLike<TResult>;
    then<TResult>(onfulfilled?: (value: T) => TResult | PromiseLike<TResult>, onrejected?: (reason: any) => void): PromiseLike<TResult>;
}

/**
 * Represents the completion of an asynchronous operation
 */
interface Promise<T> {
    /**
    * Attaches callbacks for the resolution and/or rejection of the Promise.
    * @param onfulfilled The callback to execute when the Promise is resolved.
    * @param onrejected The callback to execute when the Promise is rejected.
    * @returns A Promise for the completion of which ever callback is executed.
    */
    then<TResult>(onfulfilled?: (value: T) => TResult | PromiseLike<TResult>, onrejected?: (reason: any) => TResult | PromiseLike<TResult>): Promise<TResult>;
    then<TResult>(onfulfilled?: (value: T) => TResult | PromiseLike<TResult>, onrejected?: (reason: any) => void): Promise<TResult>;

    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch(onrejected?: (reason: any) => T | PromiseLike<T>): Promise<T>;
    catch(onrejected?: (reason: any) => void): Promise<T>;
}

interface Module {

}

interface SystemMetaConfig {
  format?: string;

  exports?: string;

  deps?: string[];

  globals?: {
    [key: string]: string;
  }

  loader?: string;

  sourceMap?: boolean;

  nonce?: string;

  integrity?: string;

  esmExports?: boolean;
}

interface SystemPackageConfig {
  main?: string;

  format?: string;

  defaultExtension?: string | boolean;

  map?: {
    [key: string]: string;
  }

  modules?: {
    [key: string]: SystemMetaConfig
  }
}

interface SystemConfig {
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
    [key: string]: SystemMetaConfig
  }

  packages?: {
    [key: string]: SystemPackageConfig
  }

  paths?: {
    [key: string]: string
  }

  traceurOptions?: any;

  transpiler?: string;

  typescriptOptions?: any;
}

interface System extends SystemConfig {
  /**
   * For backwards-compatibility with AMD environments, set `window.define = System.amdDefine`.
   */
  amdDefine: () => void;

  /**
   * For backwards-compatibility with AMD environments, set `window.require = System.amdRequire`.
   */
  amdRequire: () => void;

  /**
   * SystemJS configuration helper function.
   */
  config(config: SystemConfig);

  /**
   * This represents the System base class, which can be extended or reinstantiated to create a custom System instance.
   */
  constructor(): System;

  /**
   * Deletes a module from the registry by normalized name.
   */
  delete(moduleName: string): boolean;

  /**
   * Returns a module from the registry by normalized name.
   */
  get(moduleName: string): Module;

  /**
   * Returns whether a given module exists in the registry by normalized module name.
   */
  has(moduleName: string): boolean;

  // not ready
  import(moduleName: string, normalizedParentName?: string): Promise<Module>;

  // not ready
  // register([name ,] deps, declare): void;

  // not ready
  // registerDynamic([name ,] deps, executingRequire, declare)

  // not ready
  set(moduleName: string, module: Module): void

  // not ready
  newModule(object: Object): Module
}

declare var System: System;

declare module "systemjs" {
  export = System;
}
