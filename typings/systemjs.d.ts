declare type SystemModule = any;
declare type SystemDeclare = boolean | ((name: string | Object, value: any) => void);

interface SystemMetaConfig {
  /**
   *  Sets in what format the module is loaded.
   */
  format?: string;

  /**
   * For the `global` format, when automatic detection of exports is not enough,
   * a custom exports meta value can be set. This tells the loader
   * what global name to use as the module's export value.
   */
  exports?: string;

  /**
   * Dependencies to load before this module. Goes through regular paths
   * and map normalization. Only supported for the `cjs`, `amd` and `global` formats.
   */
  deps?: string[];

  /**
   * A map of global names to module names that should be defined only for
   * the execution of this module. Enables use of legacy code
   * that expects certain globals to be present.
   * Referenced modules automatically becomes dependencies.
   * Only supported for the `cjs` and `global` formats.
   */
  globals?: {
    [key: string]: string;
  }

  /**
   * Set a loader for this meta path.
   */
  loader?: string;

  /**
   * For plugin transpilers to set the source map of their transpilation.
   */
  sourceMap?: boolean;

  /**
   * The [nonce]{@link https://www.w3c.org/TR/CSP2/#script-src-the-nonce-attribute}
   * attribute to use when loading the script as a way to enable CSP.
   * This should correspond to the "nonce-" attribute set in the
   * Content-Security-Policy header.
   */
  nonce?: string;

  /**
   * The [subresource integrity]{@link http://www.w3.org/TR/SRI/#the-integrity-attribute}
   * attribute corresponding to the script integrity, describing the expected
   * hash of the final code to be executed. For example,
   *
   * ```
   * System.config({
   *   meta: {
   *     'src/example.js': { integrity: 'sha256-e3b0c44...' }
   *   }
   * });
   * ```
   *
   * would throw an error if the translated source of `src/example.js`
   * doesn't match the expected hash.
   */
  integrity?: string;


  /**
   * When loading a module that is not an ECMAScript Module, we set the module
   * as the `default` export, but then also iterate the module object
   * and copy named exports for it a well.
   *
   * Use this option to disable this iteration and copying of the exports.
   */
  esmExports?: boolean;
}

interface SystemPackageConfig {
  /**
   *  The main entry point of the package (so import `'local/package'`
   *  is equivalent to import `'local/package/index.js'`)
   */
  main?: string;

  /**
   * The module format of the package.
   *
   * See [Module Formats]{@link https://github.com/systemjs/systemjs/blob/master/docs/module-formats.md}.
   */
  format?: string;

  /**
   * The default extension to add to modules requested within the package.
   * Takes preference over defaultJSExtensions.
   *
   * Can be set to `defaultExtension: false` to optionally opt-out of
   * extension-adding when `defaultJSExtensions` is enabled.
   */

  defaultExtension?: string | boolean;

  /**
   * Local and relative map configurations scoped to the package.
   * Apply for subpaths as well.
   */
  map?: {
    [key: string]: string;
  }

  /**
   * Package-scoped meta configuration with wildcard support.
   * Modules are subpaths within the package path. This also provides an opt-out mechanism
   * for `defaultExtension`, by adding modules here that should skip extension adding.
   */
  modules?: {
    [key: string]: SystemMetaConfig
  }
}

interface SystemConfig {
  /**
   * The baseURL provides a special mechanism for loading modules relative
   * to a standard reference URL.
   *
   * This can be useful for being able to refer to the same module from many
   * different page URLs or environments:
   *
   * ```
   *   System.config({
   *     baseURL: '/modules'
   *   });
   *
   *   // loads /modules/jquery.js
   *   System.import('jquery.js');
   *```
   *
   * Module names of the above form are referred to as plain names and are
   * always loaded baseURL-relative instead of parentURL relative like one would
   * expect with ordinary URLs.
   *
   * > Note we always run the System.config function instead of setting instance
   * > properties directly as this will set the correct normalized baseURL in the process.
   */
  baseURL?: string;

  /**
   * Type: @type {Object} Default: @default [{}]
   *
   * Set the Babel transpiler options when
   * [System.transpiler]{@link https://github.com/systemjs/systemjs/blob/master/docs/config-api.md#transpiler}
   * is set to `babel`:
   *
   * ```
   * System.config({
   *   babelOptions: {
   *     stage: 1
   *   }
   * });
   * ```
   *
   * A list of options is available in the
   * [Babel project documentation]{@link https://babeljs.io/docs/usage/options/}.
   */
  babelOptions?: any;

  /**
   * @type {Object}
   * Bundles allow a collection of modules to be downloaded together
   * as a package whenever any module from that collection is requested.
   * Useful for splitting an application into sub-modules for production.
   * Use with the [SystemJS Builder]{@link https://github.com/systemjs/builder}.
   *
   * ```
   * System.config({
   *   bundles: {
   *     bundleA: ['dependencyA', 'dependencyB']
   *   }
   * });
   * ```
   *
   * In the above any require to `dependencyA` or `dependencyB` will first trigger
   * a `System.import('bundleA')` before proceeding with the load of  `dependencyA` or `dependencyB`.
   *
   * It is an alternative to including a script tag for a bundle in the page,
   * useful for bundles that load dynamically where we want to trigger
   * the bundle load automatically only when needed.
   *
   * The bundle itself is a module which contains named `System.register` and
   * define calls as an output of the builder. The dependency names the bundles
   * config lists should be the same names that are explicitly defined in the bundle.
   */
  bundles?: {
    [key: string]: string[];
  }

  /**
   * Backwards-compatibility mode for the loader to automatically add '.js'
   * extensions when not present to module requests.
   *
   * This allows code written for SystemJS 0.16 or less to work easily in the latest version:
   *
   * ```
   * System.defaultJSExtensions = true;
   *
   * // requests ./some/module.js instead
   * System.import('./some/module');
   * ```
   *
   * Note that this is a compatibility property for transitioning to using
   * explicit extensions and will be deprecated in future.
   */
  defaultJSExtensions?: boolean;

  /**
   * @type {Object}
   *
   * An alternative to bundling providing a solution to the latency issue of
   * progressively loading dependencies. When a module specified in depCache is loaded,
   * asynchronous loading of its pre-cached dependency list begins in parallel.
   *
   * ```
   * System.config({
   *   depCache: {
   *     moduleA: ['moduleB'], // moduleA depends on moduleB
   *     moduleB: ['moduleC'] // moduleB depends on moduleC
   *   }
   * });
   *
   * // when we do this import, depCache knows we also need moduleB and moduleC,
   * // it then directly requests those modules as well as soon as we request moduleA
   * System.import('moduleA')
   * ```
   * Over HTTP/2 this approach may be preferable as it allows files to be
   * individually cached in the browser meaning bundle optimizations are no
   * longer a concern.
   */
  depCache?: {
    [key: string]: string;
  }

  /**
   * Type: @type {Object}
   *
   * The map option is similar to paths, but acts very early in the normalization process.
   * It allows you to map a module alias to a location or package:
   *
   * ```
   * System.config({
   *   map: {
   *     jquery: '//code.jquery.com/jquery-2.1.4.min.js'
   *   }
   * });
   * ```
   *
   * ```
   * import $ from 'jquery';
   * ```
   *
   * In addition, a map also applies to any subpaths, making it suitable for package folders as well:
   *
   * ```
   * System.config({
   *   map: {
   *     package: 'local/package'
   *   }
   * });
   * ```
   *
   * ```
   * // loads /local/package/path.js
   * System.import('package/path.js');
   * ```
   *
   * > Note map configuration used to support contextual submaps but this has
   * > been deprecated for package configuration.
   */
  map?: {
    [key: string]: string;
  }


  /**
   * @type {Object} Default: @default [{}]
   *
   * Module meta provides an API for SystemJS to understand how to load modules correctly.
   *
   * Meta is how we set the module format of a module, or know how to shim
   * dependencies of a global script.
   *
   * ```
   * System.config({
   *   meta: {
   *     // meaning [baseURL]/vendor/angular.js when no other rules are present
   *     // path is normalized using map and paths configuration
   *     'vendor/angular.js': {
   *       format: 'global', // load this module as a global
   *       exports: 'angular', // the global property to take as the module value
   *       deps: [
   *         // dependencies to load before this module
   *         'jquery'
   *       ]
   *     }
   *   }
   * });
   * ```
   *
   * Wildcard meta is also supported and is additive from least to most specific match:`
   *
   * ```
   * System.config({
   *   meta: {
   *     '/vendor/*': { format: 'global' }
   *   }
   * });
   * ```
   *
   * See [SystemMetaConfig]{@link SystemMetaConfig}
   */
  meta?: {
    [key: string]: SystemMetaConfig
  }

  /**
   * @type {Object} Default: @default [{}]
   *
   * Packages provide a convenience for setting meta and map configuration that
   * is specific to a common path.
   *
   * In addition packages allow for setting contextual map configuration which
   * only applies within the package itself. This allows for full dependency
   * encapsulation without always needing to have all dependencies in a global namespace.
   *
   * ```
   * System.config({
   *   packages: {
   *     // meaning [baseURL]/local/package when no other rules are present
   *     // path is normalized using map and paths configuration
   *     'local/package': {
   *       main: 'index.js',
   *       format: 'cjs',
   *       defaultExtension: 'js',
   *       map: {
   *         // use local jquery for all jquery requires in this package
   *         'jquery': './vendor/local-jquery.js',
   *
   *         // import '/local/package/custom-import' should route to '/local/package/local/import/file.js'
   *         './custom-import': './local/import/file.js'
   *       },
   *       modules: {
   *         // sets meta for modules within the package
   *         'vendor/*': {
   *           'format': 'global'
   *         }
   *       }
   *     }
   *   }
   * });
   * ```
   *
   * See [SystemPackageConfig]{@link SystemPackageConfig}
   */
  packages?: {
    [key: string]: SystemPackageConfig
  }

  /**
   * Type: @type {Object}
   *
   * The [ES6 Module Loader]{@link https://github.com/ModuleLoader/es6-module-loader/blob/master/docs/loader-config.md}
   * paths implementation, applied after normalization and supporting subpaths via wildcards.
   *
   * It is usually advisable to use map configuration over paths unless you need
   * strict control over normalized module names.
   */
  paths?: {
    [key: string]: string
  }

  /**
   * Type: @type {Object} Default: @default [{}]
   *
   * Set the Traceur compilation options.
   * ```
   * System.config({
   *   traceurOptions: {
   *   }
   * });
   * ```
   *
   * A list of options is available in the [Traceur project documentation]{@link https://github.com/google/traceur-compiler/wiki/Options-for-Compiling}.
   */
  traceurOptions?: any;

  /**
   * Type: @type {String} Default: @default [traces]
   *
   * Sets the module name of the transpiler to be used for loading ES6 modules.
   *
   * Represents a module name for `System.import` that must resolve to either
   * Traceur, Babel or TypeScript.
   *
   * When set to `traceur`, `babel` or `typescript`, loading will be
   * automatically configured as far as possible.
   */
  transpiler?: string;

  /**
   * Type: @type {Object} Default: @default [{}]
   *
   * Sets the TypeScript transpiler options.
   *
   * A list of options is available in the [TypeScript project documentation]{@link https://github.com/Microsoft/TypeScript/wiki/Compiler%20Options}.
   */
   typescriptOptions?: any;
}

interface SystemStatic extends SystemConfig {
  /**
   * Type: @type {Function}
   *
   * For backwards-compatibility with AMD environments, set `window.define = System.amdDefine`.
   */
  amdDefine: Function;

  /**
   * Type: @type {Function}
   *
   * For backwards-compatibility with AMD environments, set `window.require = System.amdRequire`.
   */
  amdRequire: Function;

  /**
   * Type: @type {Function}
   *
   * SystemJS configuration helper function.
   */
  config(config: SystemConfig): void;

  /**
   * Type: @type {Function}
   *
   * This represents the System base class, which can be extended or reinstantiated to create a custom System instance.
   *
   * Example:
   *
   * ```
   * clonedSystem = new System.constructor();
   * clonedSystem.baseURL = System.baseURL;
   * clonedSystem.import('x'); // imports in a custom context
   * ```
   */
  constructor(): SystemStatic;

  /**
   * Type: @type {Function}
   *
   * Deletes a module from the registry by normalized name.
   */
  delete(moduleName: string): boolean;

  /**
   * Returns a module from the registry by normalized name.
   *
   * `System.get('http://site.com/normalized/module/name.js').exportedFunction();`
   */
  get(moduleName: string): any

  /**
   * Type: @type {Function}
   *
   * Returns whether a given module exists in the registry by normalized module name.
   *
   * ```
   * if (System.has('http://site.com/normalized/module/name.js')) {
   *   // ...
   * }
   * ```
   */
  has(moduleName: string): boolean;

  /**
   * Type: @type {Function}
   *
   * Loads a module by name taking an optional normalized parent name argument.
   *
   * Promise resolves to the module value.
   *
   * For loading relative to the current module, ES Modules define
   * a `__moduleName` binding, so that:
   *
   * ```
   * System.import('./local', __moduleName);
   * ```
   * In CommonJS modules the above would be `module.id1 instead.
   */
  import(moduleName: string, normalizedParentName?: string): Promise<SystemModule>;

  /**
   * Type: @type {Function}
   *
   * Given a plain JavaScript object, return an equivalent Module object.
   *
   * Useful when writing a custom instantiate hook or using `System.set`.
   */

   newModule(object: Object): SystemModule;

  /**
   * Type: @type {Function}
   *
   * Declaration function for defining modules of the `System.register` polyfill  module format.
   *
   * [Read more on the format at the loader polyfill page]{@link https://github.com/ModuleLoader/es6-module-loader/blob/v0.17.0/docs/system-register.md}
   */
  register(deps?: string[], declare?: SystemDeclare): void;
  register(name: string, deps?: string[], declare?: SystemDeclare): void;

  /**
   * Type: @type {Function}
   *
   * Companion module format to `System.register` for non-ES6 modules.
   *
   * Provides a `<script>`-injection-compatible module format that any CommonJS or
   * Global module can be converted into for CSP compatibility.
   *
   * Output created by [SystemJS Builder]{@link https://github.com/systemjs/builder}
   * when creating bundles or self-executing bundles.
   *
   * For example, the following CommonJS module:
   *
   * ```
   * module.exports = require('pkg/module');
   * ```
   *
   * Can be written:
   *
   * ```
   * System.registerDynamic(['pkg/module'], true, function(require, exports, module) {
   *   module.exports = require('pkg/module');
   * });
   * ```
   *
   * `executingRequire` indicates that the dependencies are executed synchronously
   * only when using the require function, and not before execution.
   *
   * - `require` is a standard CommonJS-style require
   * - `exports` the CommonJS exports object, which is assigned to the `default`
   *    export of the module, with its own properties available as named exports.
   * - `module` represents the CommonJS module object, with `export`, `id` and `url` properties set.
   *
   */
  registerDynamic(deps?: string[], executingRequire?: boolean, declare?: SystemDeclare): void;
  registerDynamic(name: string, deps?: string[], executingRequire?: boolean, declare?: SystemDeclare): void;

  /**
   * Type: @type {Function}
   *
   * Sets a module into the registry directly and synchronously.
   *
   * Typically used along with `System.newModule` to create a valid `Module` object:
   *
   * ```
   * System.set('custom-module', System.newModule({ prop: 'value' }));
   * ```
   * > Note SystemJS stores all module names in the registry as normalized URLs.
   * > To be able to properly use the registry with `System.set` it is usually
   * > necessary to run `System.set(System.normalizeSync('custom-module')`,
   * > `System.newModule({ prop: 'value' }))`; to ensure that System.import behaves correctly.
   */
  set(moduleName: string, module: SystemModule): void;

  /**
   * Type: @type {Function}
   *
   * In CommonJS environments, SystemJS will substitute the global require as
   * needed by the module format being loaded to ensure the correct detection
   * paths in loaded code.
   *
   * The CommonJS `require` can be recovered within these modules
   * from `System._nodeRequire`.
   */
  _nodeRequire: Function;
}

declare var System: SystemStatic;

declare module "systemjs" {
  export = System;
}
