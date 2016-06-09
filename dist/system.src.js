/*
 * SystemJS v0.19.29
 */
!function() {
    function bootstrap() {
        // from https://gist.github.com/Yaffle/1088850
        !function(global) {
            function URLPolyfill(url, baseURL) {
                if ("string" != typeof url) throw new TypeError("URL must be a string");
                var m = String(url).replace(/^\s+|\s+$/g, "").match(/^([^:\/?#]+:)?(?:\/\/(?:([^:@\/?#]*)(?::([^:@\/?#]*))?@)?(([^:\/?#]*)(?::(\d*))?))?([^?#]*)(\?[^#]*)?(#[\s\S]*)?/);
                if (!m) throw new RangeError("Invalid URL format");
                var protocol = m[1] || "", username = m[2] || "", password = m[3] || "", host = m[4] || "", hostname = m[5] || "", port = m[6] || "", pathname = m[7] || "", search = m[8] || "", hash = m[9] || "";
                if (void 0 !== baseURL) {
                    var base = baseURL instanceof URLPolyfill ? baseURL : new URLPolyfill(baseURL), flag = !protocol && !host && !username;
                    !flag || pathname || search || (search = base.search), flag && "/" !== pathname[0] && (pathname = pathname ? (!base.host && !base.username || base.pathname ? "" : "/") + base.pathname.slice(0, base.pathname.lastIndexOf("/") + 1) + pathname : base.pathname);
                    // dot segments removal
                    var output = [];
                    pathname.replace(/^(\.\.?(\/|$))+/, "").replace(/\/(\.(\/|$))+/g, "/").replace(/\/\.\.$/, "/../").replace(/\/?[^\/]*/g, function(p) {
                        "/.." === p ? output.pop() : output.push(p);
                    }), pathname = output.join("").replace(/^\//, "/" === pathname[0] ? "/" : ""), flag && (port = base.port, 
                    hostname = base.hostname, host = base.host, password = base.password, username = base.username), 
                    protocol || (protocol = base.protocol);
                }
                // convert windows file URLs to use /
                "file:" == protocol && (pathname = pathname.replace(/\\/g, "/")), this.origin = host ? protocol + ("" !== protocol || "" !== host ? "//" : "") + host : "", 
                this.href = protocol + (protocol && host || "file:" == protocol ? "//" : "") + ("" !== username ? username + ("" !== password ? ":" + password : "") + "@" : "") + host + pathname + search + hash, 
                this.protocol = protocol, this.username = username, this.password = password, this.host = host, 
                this.hostname = hostname, this.port = port, this.pathname = pathname, this.search = search, 
                this.hash = hash;
            }
            global.URLPolyfill = URLPolyfill;
        }("undefined" != typeof self ? self : global), function(__global) {
            function addToError(err, msg) {
                // parse the stack removing loader code lines for simplification
                if (!err.originalErr) for (var stack = (err.stack || err.message || err).toString().split("\n"), newStack = [], i = 0; i < stack.length; i++) ("undefined" == typeof $__curScript || -1 == stack[i].indexOf($__curScript.src)) && newStack.push(stack[i]);
                var newMsg = "(SystemJS) " + (newStack ? newStack.join("\n	") : err.message.substr(11)) + "\n	" + msg;
                // Convert file:/// URLs to paths in Node
                isBrowser || (newMsg = newMsg.replace(isWindows ? /file:\/\/\//g : /file:\/\//g, ""));
                var newErr = errArgs ? new Error(newMsg, err.fileName, err.lineNumber) : new Error(newMsg);
                // Node needs stack adjustment for throw to show message
                // track the original error
                return isBrowser ? newErr.stack = null : newErr.stack = newMsg, newErr.originalErr = err.originalErr || err, 
                newErr;
            }
            /*
*********************************************************************************************

  Dynamic Module Loader Polyfill

    - Implemented exactly to the former 2014-08-24 ES6 Specification Draft Rev 27, Section 15
      http://wiki.ecmascript.org/doku.php?id=harmony:specification_drafts#august_24_2014_draft_rev_27

    - Functions are commented with their spec numbers, with spec differences commented.

    - Spec bugs are commented in this code with links.

    - Abstract functions have been combined where possible, and their associated functions
      commented.

    - Realm implementation is entirely omitted.

*********************************************************************************************
*/
            function Module() {}
            function Loader(options) {
                this._loader = {
                    loaderObj: this,
                    loads: [],
                    modules: {},
                    importPromises: {},
                    moduleRecords: {}
                }, // 26.3.3.6
                defineProperty(this, "global", {
                    get: function() {
                        return __global;
                    }
                });
            }
            // SystemJS Loader Class and Extension helpers
            function SystemJSLoader() {
                Loader.call(this), this.paths = {}, this._loader.paths = {}, systemJSConstructor.call(this);
            }
            // inline Object.create-style class extension
            function SystemProto() {}
            function hook(name, hook) {
                SystemJSLoader.prototype[name] = hook(SystemJSLoader.prototype[name] || function() {});
            }
            function hookConstructor(hook) {
                systemJSConstructor = hook(systemJSConstructor || function() {});
            }
            function isAbsolute(name) {
                return name.match(absURLRegEx);
            }
            function isRel(name) {
                return "." == name[0] && (!name[1] || "/" == name[1] || "." == name[1]) || "/" == name[0];
            }
            function isPlain(name) {
                return !isRel(name) && !isAbsolute(name);
            }
            function urlResolve(name, parent) {
                // url resolution shortpaths
                if ("." == name[0]) {
                    // dot-relative url normalization
                    if ("/" == name[1]) return (parent && parent.substr(0, parent.lastIndexOf("/") + 1) || baseURI) + name.substr(2);
                } else if ("/" != name[0] && -1 == name.indexOf(":")) // plain parent normalization
                return (parent && parent.substr(0, parent.lastIndexOf("/") + 1) || baseURI) + name;
                return new URL(name, parent && parent.replace(/#/g, "%05") || baseURIObj).href.replace(/%05/g, "#");
            }
            // NB no specification provided for System.paths, used ideas discussed in https://github.com/jorendorff/js-loaders/issues/25
            function applyPaths(loader, name) {
                // most specific (most number of slashes in path) match wins
                var wildcard, pathMatch = "", maxWildcardPrefixLen = 0, paths = loader.paths, pathsCache = loader._loader.paths;
                // check to see if we have a paths entry
                for (var p in paths) if (!paths.hasOwnProperty || paths.hasOwnProperty(p)) {
                    // paths sanitization
                    var path = paths[p];
                    // exact path match
                    if (path !== pathsCache[p] && (path = paths[p] = pathsCache[p] = urlResolve(paths[p], isRel(paths[p]) ? baseURI : loader.baseURL)), 
                    -1 === p.indexOf("*")) {
                        if (name == p) return paths[p];
                        if (name.substr(0, p.length - 1) == p.substr(0, p.length - 1) && (name.length < p.length || name[p.length - 1] == p[p.length - 1]) && ("/" == paths[p][paths[p].length - 1] || "" == paths[p])) return paths[p].substr(0, paths[p].length - 1) + (name.length > p.length ? (paths[p] && "/" || "") + name.substr(p.length) : "");
                    } else {
                        var pathParts = p.split("*");
                        if (pathParts.length > 2) throw new TypeError("Only one wildcard in a path is permitted");
                        var wildcardPrefixLen = pathParts[0].length;
                        wildcardPrefixLen >= maxWildcardPrefixLen && name.substr(0, pathParts[0].length) == pathParts[0] && name.substr(name.length - pathParts[1].length) == pathParts[1] && (maxWildcardPrefixLen = wildcardPrefixLen, 
                        pathMatch = p, wildcard = name.substr(pathParts[0].length, name.length - pathParts[1].length - pathParts[0].length));
                    }
                }
                var outPath = paths[pathMatch];
                return "string" == typeof wildcard && (outPath = outPath.replace("*", wildcard)), 
                outPath;
            }
            function group(deps) {
                for (var names = [], indices = [], i = 0, l = deps.length; l > i; i++) {
                    var index = indexOf.call(names, deps[i]);
                    -1 === index ? (names.push(deps[i]), indices.push([ i ])) : indices[index].push(i);
                }
                return {
                    names: names,
                    indices: indices
                };
            }
            // converts any module.exports object into an object ready for SystemJS.newModule
            function getESModule(exports) {
                var esModule = {};
                // don't trigger getters/setters in environments that support them
                if (("object" == typeof exports || "function" == typeof exports) && exports !== __global) if (getOwnPropertyDescriptor) for (var p in exports) // The default property is copied to esModule later on
                "default" !== p && defineOrCopyProperty(esModule, exports, p); else extend(esModule, exports);
                return esModule["default"] = exports, defineProperty(esModule, "__useDefault", {
                    value: !0
                }), esModule;
            }
            function defineOrCopyProperty(targetObj, sourceObj, propName) {
                try {
                    var d;
                    (d = Object.getOwnPropertyDescriptor(sourceObj, propName)) && defineProperty(targetObj, propName, d);
                } catch (ex) {
                    // Object.getOwnPropertyDescriptor threw an exception, fall back to normal set property
                    // we dont need hasOwnProperty here because getOwnPropertyDescriptor would have returned undefined above
                    return targetObj[propName] = sourceObj[propName], !1;
                }
            }
            function extend(a, b, prepend) {
                var hasOwnProperty = b && b.hasOwnProperty;
                for (var p in b) (!hasOwnProperty || b.hasOwnProperty(p)) && (prepend && p in a || (a[p] = b[p]));
                return a;
            }
            // meta first-level extends where:
            // array + array appends
            // object + object extends
            // other properties replace
            function extendMeta(a, b, prepend) {
                var hasOwnProperty = b && b.hasOwnProperty;
                for (var p in b) if (!hasOwnProperty || b.hasOwnProperty(p)) {
                    var val = b[p];
                    p in a ? val instanceof Array && a[p] instanceof Array ? a[p] = [].concat(prepend ? val : a[p]).concat(prepend ? a[p] : val) : "object" == typeof val && null !== val && "object" == typeof a[p] ? a[p] = extend(extend({}, a[p]), val, prepend) : prepend || (a[p] = val) : a[p] = val;
                }
            }
            function extendPkgConfig(pkgCfgA, pkgCfgB, pkgName, loader, warnInvalidProperties) {
                for (var prop in pkgCfgB) if (-1 != indexOf.call([ "main", "format", "defaultExtension", "basePath" ], prop)) pkgCfgA[prop] = pkgCfgB[prop]; else if ("map" == prop) extend(pkgCfgA.map = pkgCfgA.map || {}, pkgCfgB.map); else if ("meta" == prop) extend(pkgCfgA.meta = pkgCfgA.meta || {}, pkgCfgB.meta); else if ("depCache" == prop) for (var d in pkgCfgB.depCache) {
                    var dNormalized;
                    dNormalized = "./" == d.substr(0, 2) ? pkgName + "/" + d.substr(2) : coreResolve.call(loader, d), 
                    loader.depCache[dNormalized] = (loader.depCache[dNormalized] || []).concat(pkgCfgB.depCache[d]);
                } else !warnInvalidProperties || -1 != indexOf.call([ "browserConfig", "nodeConfig", "devConfig", "productionConfig" ], prop) || pkgCfgB.hasOwnProperty && !pkgCfgB.hasOwnProperty(prop) || warn.call(loader, '"' + prop + '" is not a valid package configuration option in package ' + pkgName);
            }
            // deeply-merge (to first level) config with any existing package config
            function setPkgConfig(loader, pkgName, cfg, prependConfig) {
                var pkg;
                // first package is config by reference for fast path, cloned after that
                if (loader.packages[pkgName]) {
                    var basePkg = loader.packages[pkgName];
                    pkg = loader.packages[pkgName] = {}, extendPkgConfig(pkg, prependConfig ? cfg : basePkg, pkgName, loader, prependConfig), 
                    extendPkgConfig(pkg, prependConfig ? basePkg : cfg, pkgName, loader, !prependConfig);
                } else pkg = loader.packages[pkgName] = cfg;
                // main object becomes main map
                return "object" == typeof pkg.main && (pkg.map = pkg.map || {}, pkg.map["./@main"] = pkg.main, 
                pkg.main["default"] = pkg.main["default"] || "./", pkg.main = "@main"), pkg;
            }
            function warn(msg) {
                this.warnings && "undefined" != typeof console && console.warn;
            }
            function readMemberExpression(p, value) {
                for (var pParts = p.split("."); pParts.length; ) value = value[pParts.shift()];
                return value;
            }
            function getMapMatch(map, name) {
                var bestMatch, bestMatchLength = 0;
                for (var p in map) if (name.substr(0, p.length) == p && (name.length == p.length || "/" == name[p.length])) {
                    var curMatchLength = p.split("/").length;
                    if (bestMatchLength >= curMatchLength) continue;
                    bestMatch = p, bestMatchLength = curMatchLength;
                }
                return bestMatch;
            }
            function prepareBaseURL(loader) {
                // ensure baseURl is fully normalized
                this._loader.baseURL !== this.baseURL && ("/" != this.baseURL[this.baseURL.length - 1] && (this.baseURL += "/"), 
                this._loader.baseURL = this.baseURL = new URL(this.baseURL, baseURIObj).href);
            }
            function setProduction(isProduction) {
                this.set("@system-env", envModule = this.newModule({
                    browser: isBrowser,
                    node: !!this._nodeRequire,
                    production: isProduction,
                    dev: !isProduction,
                    "default": !0
                }));
            }
            /*
  Core SystemJS Normalization

  If a name is relative, we apply URL normalization to the page
  If a name is an absolute URL, we leave it as-is

  Plain names (neither of the above) run through the map and paths
  normalization phases.

  The paths normalization phase applies last (paths extension), which
  defines the `decanonicalize` function and normalizes everything into
  a URL.
 */
            function getNodeModule(name) {
                if (!isPlain(name)) throw new Error("Node module " + name + " can't be loaded as it is not a package require.");
                var module, nodePath = this._nodeRequire("path");
                try {
                    module = this._nodeRequire(nodePath.resolve(process.cwd(), "node_modules", name));
                } catch (e) {
                    // fall back to direct require (in theory this is core modules only, which should really be filtered)
                    "MODULE_NOT_FOUND" == e.code && (module = this._nodeRequire(name));
                }
                return module;
            }
            function coreResolve(name, parentName) {
                // standard URL resolution
                if (isRel(name)) return urlResolve(name, parentName);
                if (isAbsolute(name)) return name;
                // plain names not starting with './', '://' and '/' go through custom resolution
                var mapMatch = getMapMatch(this.map, name);
                if (mapMatch) {
                    if (name = this.map[mapMatch] + name.substr(mapMatch.length), isRel(name)) return urlResolve(name);
                    if (isAbsolute(name)) return name;
                }
                if (this.has(name)) return name;
                // dynamically load node-core modules when requiring `@node/fs` for example
                if ("@node/" == name.substr(0, 6)) {
                    if (!this._nodeRequire) throw new TypeError("Error loading " + name + ". Can only load node core modules in Node.");
                    return this.set(name, this.newModule(getESModule(getNodeModule.call(this, name.substr(6))))), 
                    name;
                }
                // prepare the baseURL to ensure it is normalized
                return prepareBaseURL.call(this), applyPaths(this, name) || this.baseURL + name;
            }
            function envSet(loader, cfg, envCallback) {
                envModule.browser && cfg.browserConfig && envCallback(cfg.browserConfig), envModule.node && cfg.nodeConfig && envCallback(cfg.nodeConfig), 
                envModule.dev && cfg.devConfig && envCallback(cfg.devConfig), envModule.production && cfg.productionConfig && envCallback(cfg.productionConfig);
            }
            function detectRegisterFormat(source) {
                var leadingCommentAndMeta = source.match(leadingCommentAndMetaRegEx);
                return leadingCommentAndMeta && "System.register" == source.substr(leadingCommentAndMeta[0].length, 15);
            }
            function createEntry() {
                return {
                    name: null,
                    deps: null,
                    originalIndices: null,
                    declare: null,
                    execute: null,
                    executingRequire: !1,
                    declarative: !1,
                    normalizedDeps: null,
                    groupIndex: null,
                    evaluated: !1,
                    module: null,
                    esModule: null,
                    esmExports: !1
                };
            }
            function getGlobalValue(exports) {
                if ("string" == typeof exports) return readMemberExpression(exports, __global);
                if (!(exports instanceof Array)) throw new Error("Global exports must be a string or array.");
                for (var globalValue = {}, first = !0, i = 0; i < exports.length; i++) {
                    var val = readMemberExpression(exports[i], __global);
                    first && (globalValue["default"] = val, first = !1), globalValue[exports[i].split(".").pop()] = val;
                }
                return globalValue;
            }
            function parseCondition(condition) {
                var conditionExport, conditionModule, negation, negation = "~" == condition[0], conditionExportIndex = condition.lastIndexOf("|");
                return -1 != conditionExportIndex ? (conditionExport = condition.substr(conditionExportIndex + 1), 
                conditionModule = condition.substr(negation, conditionExportIndex - negation), negation && warn.call(this, 'Condition negation form "' + condition + '" is deprecated for "' + conditionModule + "|~" + conditionExport + '"'), 
                "~" == conditionExport[0] && (negation = !0, conditionExport = conditionExport.substr(1))) : (conditionExport = "default", 
                conditionModule = condition.substr(negation), -1 != sysConditions.indexOf(conditionModule) && (conditionExport = conditionModule, 
                conditionModule = null)), {
                    module: conditionModule || "@system-env",
                    prop: conditionExport,
                    negate: negation
                };
            }
            function serializeCondition(conditionObj) {
                return conditionObj.module + "|" + (conditionObj.negate ? "~" : "") + conditionObj.prop;
            }
            function resolveCondition(conditionObj, parentName, bool) {
                var self = this;
                return this.normalize(conditionObj.module, parentName).then(function(normalizedCondition) {
                    return self.load(normalizedCondition).then(function(q) {
                        var m = readMemberExpression(conditionObj.prop, self.get(normalizedCondition));
                        if (bool && "boolean" != typeof m) throw new TypeError("Condition " + serializeCondition(conditionObj) + " did not resolve to a boolean.");
                        return conditionObj.negate ? !m : m;
                    });
                });
            }
            function interpolateConditional(name, parentName) {
                // first we normalize the conditional
                var conditionalMatch = name.match(interpolationRegEx);
                if (!conditionalMatch) return Promise.resolve(name);
                var conditionObj = parseCondition.call(this, conditionalMatch[0].substr(2, conditionalMatch[0].length - 3));
                // in builds, return normalized conditional
                // in builds, return normalized conditional
                return this.builder ? this.normalize(conditionObj.module, parentName).then(function(conditionModule) {
                    return conditionObj.module = conditionModule, name.replace(interpolationRegEx, "#{" + serializeCondition(conditionObj) + "}");
                }) : resolveCondition.call(this, conditionObj, parentName, !1).then(function(conditionValue) {
                    if ("string" != typeof conditionValue) throw new TypeError("The condition value for " + name + " doesn't resolve to a string.");
                    if (-1 != conditionValue.indexOf("/")) throw new TypeError("Unabled to interpolate conditional " + name + (parentName ? " in " + parentName : "") + "\n	The condition value " + conditionValue + ' cannot contain a "/" separator.');
                    return name.replace(interpolationRegEx, conditionValue);
                });
            }
            function booleanConditional(name, parentName) {
                // first we normalize the conditional
                var booleanIndex = name.lastIndexOf("#?");
                if (-1 == booleanIndex) return Promise.resolve(name);
                var conditionObj = parseCondition.call(this, name.substr(booleanIndex + 2));
                // in builds, return normalized conditional
                // in builds, return normalized conditional
                return this.builder ? this.normalize(conditionObj.module, parentName).then(function(conditionModule) {
                    return conditionObj.module = conditionModule, name.substr(0, booleanIndex) + "#?" + serializeCondition(conditionObj);
                }) : resolveCondition.call(this, conditionObj, parentName, !0).then(function(conditionValue) {
                    return conditionValue ? name.substr(0, booleanIndex) : "@empty";
                });
            }
            var isWorker = "undefined" == typeof window && "undefined" != typeof self && "undefined" != typeof importScripts, isBrowser = "undefined" != typeof window && "undefined" != typeof document, isWindows = "undefined" != typeof process && "undefined" != typeof process.platform && !!process.platform.match(/^win/);
            __global.console || (__global.console = {
                assert: function() {}
            });
            // IE8 support
            var defineProperty, indexOf = Array.prototype.indexOf || function(item) {
                for (var i = 0, thisLen = this.length; thisLen > i; i++) if (this[i] === item) return i;
                return -1;
            };
            !function() {
                try {
                    Object.defineProperty({}, "a", {}) && (defineProperty = Object.defineProperty);
                } catch (e) {
                    defineProperty = function(obj, prop, opt) {
                        try {
                            obj[prop] = opt.value || opt.get.call(obj);
                        } catch (e) {}
                    };
                }
            }();
            var baseURI, errArgs = "_" == new Error(0, "_").fileName;
            // environent baseURI detection
            if ("undefined" != typeof document && document.getElementsByTagName) {
                if (baseURI = document.baseURI, !baseURI) {
                    var bases = document.getElementsByTagName("base");
                    baseURI = bases[0] && bases[0].href || window.location.href;
                }
            } else "undefined" != typeof location && (baseURI = __global.location.href);
            // sanitize out the hash and querystring
            if (baseURI) baseURI = baseURI.split("#")[0].split("?")[0], baseURI = baseURI.substr(0, baseURI.lastIndexOf("/") + 1); else {
                if ("undefined" == typeof process || !process.cwd) throw new TypeError("No environment baseURI");
                baseURI = "file://" + (isWindows ? "/" : "") + process.cwd() + "/", isWindows && (baseURI = baseURI.replace(/\\/g, "/"));
            }
            try {
                var nativeURL = "test:" == new __global.URL("test:///").protocol;
            } catch (e) {}
            var URL = nativeURL ? __global.URL : __global.URLPolyfill;
            // http://www.ecma-international.org/ecma-262/6.0/#sec-@@tostringtag
            defineProperty(Module.prototype, "toString", {
                value: function() {
                    return "Module";
                }
            }), function() {
                // 15.2.3.2.1
                function createLoad(name) {
                    return {
                        status: "loading",
                        name: name || "<Anonymous" + ++anonCnt + ">",
                        linkSets: [],
                        dependencies: [],
                        metadata: {}
                    };
                }
                // 15.2.3.2.2 createLoadRequestObject, absorbed into calling functions
                // 15.2.4
                // 15.2.4.1
                function loadModule(loader, name, options) {
                    return new Promise(asyncStartLoadPartwayThrough({
                        step: options.address ? "fetch" : "locate",
                        loader: loader,
                        moduleName: name,
                        // allow metadata for import https://bugs.ecmascript.org/show_bug.cgi?id=3091
                        moduleMetadata: options && options.metadata || {},
                        moduleSource: options.source,
                        moduleAddress: options.address
                    }));
                }
                // 15.2.4.2
                function requestLoad(loader, request, refererName, refererAddress) {
                    // 15.2.4.2.1 CallNormalize
                    return new Promise(function(resolve, reject) {
                        resolve(loader.loaderObj.normalize(request, refererName, refererAddress));
                    }).then(function(name) {
                        var load;
                        if (loader.modules[name]) // https://bugs.ecmascript.org/show_bug.cgi?id=2795
                        return load = createLoad(name), load.status = "linked", load.module = loader.modules[name], 
                        load;
                        for (var i = 0, l = loader.loads.length; l > i; i++) if (load = loader.loads[i], 
                        load.name == name) return load;
                        return load = createLoad(name), loader.loads.push(load), proceedToLocate(loader, load), 
                        load;
                    });
                }
                // 15.2.4.3
                function proceedToLocate(loader, load) {
                    proceedToFetch(loader, load, Promise.resolve().then(function() {
                        return loader.loaderObj.locate({
                            name: load.name,
                            metadata: load.metadata
                        });
                    }));
                }
                // 15.2.4.4
                function proceedToFetch(loader, load, p) {
                    proceedToTranslate(loader, load, p.then(function(address) {
                        // adjusted, see https://bugs.ecmascript.org/show_bug.cgi?id=2602
                        // adjusted, see https://bugs.ecmascript.org/show_bug.cgi?id=2602
                        return "loading" == load.status ? (load.address = address, loader.loaderObj.fetch({
                            name: load.name,
                            metadata: load.metadata,
                            address: address
                        })) : void 0;
                    }));
                }
                // 15.2.4.5
                function proceedToTranslate(loader, load, p) {
                    p.then(function(source) {
                        return "loading" == load.status ? (load.address = load.address || load.name, Promise.resolve(loader.loaderObj.translate({
                            name: load.name,
                            metadata: load.metadata,
                            address: load.address,
                            source: source
                        })).then(function(source) {
                            return load.source = source, loader.loaderObj.instantiate({
                                name: load.name,
                                metadata: load.metadata,
                                address: load.address,
                                source: source
                            });
                        }).then(function(instantiateResult) {
                            if (void 0 === instantiateResult) throw new TypeError("Declarative modules unsupported in the polyfill.");
                            if ("object" != typeof instantiateResult) throw new TypeError("Invalid instantiate return value");
                            load.depsList = instantiateResult.deps || [], load.execute = instantiateResult.execute;
                        }).then(function() {
                            load.dependencies = [];
                            for (var depsList = load.depsList, loadPromises = [], i = 0, l = depsList.length; l > i; i++) (function(request, index) {
                                loadPromises.push(requestLoad(loader, request, load.name, load.address).then(function(depLoad) {
                                    if (// adjusted from spec to maintain dependency order
                                    // this is due to the System.register internal implementation needs
                                    load.dependencies[index] = {
                                        key: request,
                                        value: depLoad.name
                                    }, "linked" != depLoad.status) for (var linkSets = load.linkSets.concat([]), i = 0, l = linkSets.length; l > i; i++) addLoadToLinkSet(linkSets[i], depLoad);
                                }));
                            })(depsList[i], i);
                            return Promise.all(loadPromises);
                        }).then(function() {
                            load.status = "loaded";
                            for (var linkSets = load.linkSets.concat([]), i = 0, l = linkSets.length; l > i; i++) updateLinkSetOnLoad(linkSets[i], load);
                        })) : void 0;
                    })["catch"](function(exc) {
                        load.status = "failed", load.exception = exc;
                        for (var linkSets = load.linkSets.concat([]), i = 0, l = linkSets.length; l > i; i++) linkSetFailed(linkSets[i], load, exc);
                    });
                }
                // 15.2.4.7 PromiseOfStartLoadPartwayThrough absorbed into calling functions
                // 15.2.4.7.1
                function asyncStartLoadPartwayThrough(stepState) {
                    return function(resolve, reject) {
                        var loader = stepState.loader, name = stepState.moduleName, step = stepState.step;
                        if (loader.modules[name]) throw new TypeError('"' + name + '" already exists in the module table');
                        for (var existingLoad, i = 0, l = loader.loads.length; l > i; i++) if (loader.loads[i].name == name && (existingLoad = loader.loads[i], 
                        "translate" != step || existingLoad.source || (existingLoad.address = stepState.moduleAddress, 
                        proceedToTranslate(loader, existingLoad, Promise.resolve(stepState.moduleSource))), 
                        existingLoad.linkSets.length && existingLoad.linkSets[0].loads[0].name == existingLoad.name)) return existingLoad.linkSets[0].done.then(function() {
                            resolve(existingLoad);
                        });
                        var load = existingLoad || createLoad(name);
                        load.metadata = stepState.moduleMetadata;
                        var linkSet = createLinkSet(loader, load);
                        loader.loads.push(load), resolve(linkSet.done), "locate" == step ? proceedToLocate(loader, load) : "fetch" == step ? proceedToFetch(loader, load, Promise.resolve(stepState.moduleAddress)) : (load.address = stepState.moduleAddress, 
                        proceedToTranslate(loader, load, Promise.resolve(stepState.moduleSource)));
                    };
                }
                // Declarative linking functions run through alternative implementation:
                // 15.2.5.1.1 CreateModuleLinkageRecord not implemented
                // 15.2.5.1.2 LookupExport not implemented
                // 15.2.5.1.3 LookupModuleDependency not implemented
                // 15.2.5.2.1
                function createLinkSet(loader, startingLoad) {
                    var linkSet = {
                        loader: loader,
                        loads: [],
                        startingLoad: startingLoad,
                        // added see spec bug https://bugs.ecmascript.org/show_bug.cgi?id=2995
                        loadingCount: 0
                    };
                    return linkSet.done = new Promise(function(resolve, reject) {
                        linkSet.resolve = resolve, linkSet.reject = reject;
                    }), addLoadToLinkSet(linkSet, startingLoad), linkSet;
                }
                // 15.2.5.2.2
                function addLoadToLinkSet(linkSet, load) {
                    if ("failed" != load.status) {
                        for (var i = 0, l = linkSet.loads.length; l > i; i++) if (linkSet.loads[i] == load) return;
                        linkSet.loads.push(load), load.linkSets.push(linkSet), // adjustment, see https://bugs.ecmascript.org/show_bug.cgi?id=2603
                        "loaded" != load.status && linkSet.loadingCount++;
                        for (var loader = linkSet.loader, i = 0, l = load.dependencies.length; l > i; i++) if (load.dependencies[i]) {
                            var name = load.dependencies[i].value;
                            if (!loader.modules[name]) for (var j = 0, d = loader.loads.length; d > j; j++) if (loader.loads[j].name == name) {
                                addLoadToLinkSet(linkSet, loader.loads[j]);
                                break;
                            }
                        }
                    }
                }
                // linking errors can be generic or load-specific
                // this is necessary for debugging info
                function doLink(linkSet) {
                    var error = !1;
                    try {
                        link(linkSet, function(load, exc) {
                            linkSetFailed(linkSet, load, exc), error = !0;
                        });
                    } catch (e) {
                        linkSetFailed(linkSet, null, e), error = !0;
                    }
                    return error;
                }
                // 15.2.5.2.3
                function updateLinkSetOnLoad(linkSet, load) {
                    if (linkSet.loadingCount--, !(linkSet.loadingCount > 0)) {
                        // adjusted for spec bug https://bugs.ecmascript.org/show_bug.cgi?id=2995
                        var startingLoad = linkSet.startingLoad;
                        // non-executing link variation for loader tracing
                        // on the server. Not in spec.
                        /***/
                        if (linkSet.loader.loaderObj.execute === !1) {
                            for (var loads = [].concat(linkSet.loads), i = 0, l = loads.length; l > i; i++) {
                                var load = loads[i];
                                load.module = {
                                    name: load.name,
                                    module: _newModule({}),
                                    evaluated: !0
                                }, load.status = "linked", finishLoad(linkSet.loader, load);
                            }
                            return linkSet.resolve(startingLoad);
                        }
                        /***/
                        var abrupt = doLink(linkSet);
                        abrupt || linkSet.resolve(startingLoad);
                    }
                }
                // 15.2.5.2.4
                function linkSetFailed(linkSet, load, exc) {
                    var loader = linkSet.loader;
                    checkError: if (load) if (linkSet.loads[0].name == load.name) exc = addToError(exc, "Error loading " + load.name); else {
                        for (var i = 0; i < linkSet.loads.length; i++) for (var pLoad = linkSet.loads[i], j = 0; j < pLoad.dependencies.length; j++) {
                            var dep = pLoad.dependencies[j];
                            if (dep.value == load.name) {
                                exc = addToError(exc, "Error loading " + load.name + ' as "' + dep.key + '" from ' + pLoad.name);
                                break checkError;
                            }
                        }
                        exc = addToError(exc, "Error loading " + load.name + " from " + linkSet.loads[0].name);
                    } else exc = addToError(exc, "Error linking " + linkSet.loads[0].name);
                    for (var loads = linkSet.loads.concat([]), i = 0, l = loads.length; l > i; i++) {
                        var load = loads[i];
                        // store all failed load records
                        loader.loaderObj.failed = loader.loaderObj.failed || [], -1 == indexOf.call(loader.loaderObj.failed, load) && loader.loaderObj.failed.push(load);
                        var linkIndex = indexOf.call(load.linkSets, linkSet);
                        if (load.linkSets.splice(linkIndex, 1), 0 == load.linkSets.length) {
                            var globalLoadsIndex = indexOf.call(linkSet.loader.loads, load);
                            -1 != globalLoadsIndex && linkSet.loader.loads.splice(globalLoadsIndex, 1);
                        }
                    }
                    linkSet.reject(exc);
                }
                // 15.2.5.2.5
                function finishLoad(loader, load) {
                    // add to global trace if tracing
                    if (loader.loaderObj.trace) {
                        loader.loaderObj.loads || (loader.loaderObj.loads = {});
                        var depMap = {};
                        load.dependencies.forEach(function(dep) {
                            depMap[dep.key] = dep.value;
                        }), loader.loaderObj.loads[load.name] = {
                            name: load.name,
                            deps: load.dependencies.map(function(dep) {
                                return dep.key;
                            }),
                            depMap: depMap,
                            address: load.address,
                            metadata: load.metadata,
                            source: load.source
                        };
                    }
                    // if not anonymous, add to the module table
                    load.name && (loader.modules[load.name] = load.module);
                    var loadIndex = indexOf.call(loader.loads, load);
                    -1 != loadIndex && loader.loads.splice(loadIndex, 1);
                    for (var i = 0, l = load.linkSets.length; l > i; i++) loadIndex = indexOf.call(load.linkSets[i].loads, load), 
                    -1 != loadIndex && load.linkSets[i].loads.splice(loadIndex, 1);
                    load.linkSets.splice(0, load.linkSets.length);
                }
                function doDynamicExecute(linkSet, load, linkError) {
                    try {
                        var module = load.execute();
                    } catch (e) {
                        return void linkError(load, e);
                    }
                    return module && module instanceof Module ? module : void linkError(load, new TypeError("Execution must define a Module instance"));
                }
                // 26.3 Loader
                // 26.3.1.1
                // defined at top
                // importPromises adds ability to import a module twice without error - https://bugs.ecmascript.org/show_bug.cgi?id=2601
                function createImportPromise(loader, name, promise) {
                    var importPromises = loader._loader.importPromises;
                    return importPromises[name] = promise.then(function(m) {
                        return importPromises[name] = void 0, m;
                    }, function(e) {
                        throw importPromises[name] = void 0, e;
                    });
                }
                /*
 * ES6 Module Declarative Linking Code
 */
                function link(linkSet, linkError) {
                    var loader = linkSet.loader;
                    if (linkSet.loads.length) for (var loads = linkSet.loads.concat([]), i = 0; i < loads.length; i++) {
                        var load = loads[i], module = doDynamicExecute(linkSet, load, linkError);
                        if (!module) return;
                        load.module = {
                            name: load.name,
                            module: module
                        }, load.status = "linked", finishLoad(loader, load);
                    }
                }
                // 15.2.3.2 Load Records and LoadRequest Objects
                var anonCnt = 0;
                Loader.prototype = {
                    // 26.3.3.1
                    constructor: Loader,
                    // 26.3.3.2
                    define: function(name, source, options) {
                        // check if already defined
                        if (this._loader.importPromises[name]) throw new TypeError("Module is already loading.");
                        return createImportPromise(this, name, new Promise(asyncStartLoadPartwayThrough({
                            step: "translate",
                            loader: this._loader,
                            moduleName: name,
                            moduleMetadata: options && options.metadata || {},
                            moduleSource: source,
                            moduleAddress: options && options.address
                        })));
                    },
                    // 26.3.3.3
                    "delete": function(name) {
                        var loader = this._loader;
                        return delete loader.importPromises[name], delete loader.moduleRecords[name], loader.modules[name] ? delete loader.modules[name] : !1;
                    },
                    // 26.3.3.4 entries not implemented
                    // 26.3.3.5
                    get: function(key) {
                        return this._loader.modules[key] ? this._loader.modules[key].module : void 0;
                    },
                    // 26.3.3.7
                    has: function(name) {
                        return !!this._loader.modules[name];
                    },
                    // 26.3.3.8
                    "import": function(name, parentName, parentAddress) {
                        "object" == typeof parentName && (parentName = parentName.name);
                        // run normalize first
                        var loaderObj = this;
                        // added, see https://bugs.ecmascript.org/show_bug.cgi?id=2659
                        return Promise.resolve(loaderObj.normalize(name, parentName)).then(function(name) {
                            var loader = loaderObj._loader;
                            return loader.modules[name] ? loader.modules[name].module : loader.importPromises[name] || createImportPromise(loaderObj, name, loadModule(loader, name, {}).then(function(load) {
                                return delete loader.importPromises[name], load.module.module;
                            }));
                        });
                    },
                    // 26.3.3.9 keys not implemented
                    // 26.3.3.10
                    load: function(name) {
                        var loader = this._loader;
                        return loader.modules[name] ? Promise.resolve() : loader.importPromises[name] || createImportPromise(this, name, new Promise(asyncStartLoadPartwayThrough({
                            step: "locate",
                            loader: loader,
                            moduleName: name,
                            moduleMetadata: {},
                            moduleSource: void 0,
                            moduleAddress: void 0
                        })).then(function() {
                            delete loader.importPromises[name];
                        }));
                    },
                    // 26.3.3.11
                    module: function(source, options) {
                        var load = createLoad();
                        load.address = options && options.address;
                        var linkSet = createLinkSet(this._loader, load), sourcePromise = Promise.resolve(source), loader = this._loader, p = linkSet.done.then(function() {
                            return load.module.module;
                        });
                        return proceedToTranslate(loader, load, sourcePromise), p;
                    },
                    // 26.3.3.12
                    newModule: function(obj) {
                        if ("object" != typeof obj) throw new TypeError("Expected object");
                        var m = new Module(), pNames = [];
                        if (Object.getOwnPropertyNames && null != obj) pNames = Object.getOwnPropertyNames(obj); else for (var key in obj) pNames.push(key);
                        for (var i = 0; i < pNames.length; i++) (function(key) {
                            defineProperty(m, key, {
                                configurable: !1,
                                enumerable: !0,
                                get: function() {
                                    return obj[key];
                                },
                                set: function() {
                                    throw new Error("Module exports cannot be changed externally.");
                                }
                            });
                        })(pNames[i]);
                        return Object.freeze && Object.freeze(m), m;
                    },
                    // 26.3.3.14
                    set: function(name, module) {
                        if (!(module instanceof Module)) throw new TypeError("Loader.set(" + name + ", module) must be a module");
                        this._loader.modules[name] = {
                            module: module
                        };
                    },
                    // 26.3.3.15 values not implemented
                    // 26.3.3.16 @@iterator not implemented
                    // 26.3.3.17 @@toStringTag not implemented
                    // 26.3.3.18.1
                    normalize: function(name, referrerName, referrerAddress) {},
                    // 26.3.3.18.2
                    locate: function(load) {
                        return load.name;
                    },
                    // 26.3.3.18.3
                    fetch: function(load) {},
                    // 26.3.3.18.4
                    translate: function(load) {
                        return load.source;
                    },
                    // 26.3.3.18.5
                    instantiate: function(load) {}
                };
                var _newModule = Loader.prototype.newModule;
            }();
            var System, fetchTextFromURL;
            if ("undefined" != typeof XMLHttpRequest) fetchTextFromURL = function(url, authorization, fulfill, reject) {
                function load() {
                    fulfill(xhr.responseText);
                }
                function error() {
                    reject(new Error("XHR error" + (xhr.status ? " (" + xhr.status + (xhr.statusText ? " " + xhr.statusText : "") + ")" : "") + " loading " + url));
                }
                var xhr = new XMLHttpRequest(), sameDomain = !0, doTimeout = !1;
                if (!("withCredentials" in xhr)) {
                    // check if same domain
                    var domainCheck = /^(\w+:)?\/\/([^\/]+)/.exec(url);
                    domainCheck && (sameDomain = domainCheck[2] === window.location.host, domainCheck[1] && (sameDomain &= domainCheck[1] === window.location.protocol));
                }
                sameDomain || "undefined" == typeof XDomainRequest || (xhr = new XDomainRequest(), 
                xhr.onload = load, xhr.onerror = error, xhr.ontimeout = error, xhr.onprogress = function() {}, 
                xhr.timeout = 0, doTimeout = !0), xhr.onreadystatechange = function() {
                    4 === xhr.readyState && (// in Chrome on file:/// URLs, status is 0
                    0 == xhr.status ? xhr.responseText ? load() : (// when responseText is empty, wait for load or error event
                    // to inform if it is a 404 or empty file
                    xhr.addEventListener("error", error), xhr.addEventListener("load", load)) : 200 === xhr.status ? load() : error());
                }, xhr.open("GET", url, !0), xhr.setRequestHeader && (xhr.setRequestHeader("Accept", "application/x-es-module, */*"), 
                // can set "authorization: true" to enable withCredentials only
                authorization && ("string" == typeof authorization && xhr.setRequestHeader("Authorization", authorization), 
                xhr.withCredentials = !0)), doTimeout ? setTimeout(function() {
                    xhr.send();
                }, 0) : xhr.send(null);
            }; else if ("undefined" != typeof require && "undefined" != typeof process) {
                var fs;
                fetchTextFromURL = function(url, authorization, fulfill, reject) {
                    if ("file:///" != url.substr(0, 8)) throw new Error('Unable to fetch "' + url + '". Only file URLs of the form file:/// allowed running in Node.');
                    return fs = fs || require("fs"), url = isWindows ? url.replace(/\//g, "\\").substr(8) : url.substr(7), 
                    fs.readFile(url, function(err, data) {
                        if (err) return reject(err);
                        // Strip Byte Order Mark out if it's the leading char
                        var dataString = data + "";
                        "\ufeff" === dataString[0] && (dataString = dataString.substr(1)), fulfill(dataString);
                    });
                };
            } else {
                if ("undefined" == typeof self || "undefined" == typeof self.fetch) throw new TypeError("No environment fetch API available.");
                fetchTextFromURL = function(url, authorization, fulfill, reject) {
                    var opts = {
                        headers: {
                            Accept: "application/x-es-module, */*"
                        }
                    };
                    authorization && ("string" == typeof authorization && (opts.headers.Authorization = authorization), 
                    opts.credentials = "include"), fetch(url, opts).then(function(r) {
                        if (r.ok) return r.text();
                        throw new Error("Fetch error: " + r.status + " " + r.statusText);
                    }).then(fulfill, reject);
                };
            }
            /*
 * Traceur, Babel and TypeScript transpile hook for Loader
 */
            var transpile = function() {
                function transpile(load) {
                    var self = this;
                    return Promise.resolve(__global["typescript" == self.transpiler ? "ts" : self.transpiler] || (self.pluginLoader || self)["import"](self.transpiler)).then(function(transpiler) {
                        transpiler.__useDefault && (transpiler = transpiler["default"]);
                        var transpileFunction;
                        // note __moduleName will be part of the transformer meta in future when we have the spec for this
                        return transpileFunction = transpiler.Compiler ? traceurTranspile : transpiler.createLanguageService ? typescriptTranspile : babelTranspile, 
                        "(function(__moduleName){" + transpileFunction.call(self, load, transpiler) + '\n})("' + load.name + '");\n//# sourceURL=' + load.address + "!transpiled";
                    });
                }
                function traceurTranspile(load, traceur) {
                    var options = this.traceurOptions || {};
                    options.modules = "instantiate", options.script = !1, void 0 === options.sourceMaps && (options.sourceMaps = "inline"), 
                    options.filename = load.address, options.inputSourceMap = load.metadata.sourceMap, 
                    options.moduleName = !1;
                    var compiler = new traceur.Compiler(options);
                    return doTraceurCompile(load.source, compiler, options.filename);
                }
                function doTraceurCompile(source, compiler, filename) {
                    try {
                        return compiler.compile(source, filename);
                    } catch (e) {
                        // on older versions of traceur (<0.9.3), an array of errors is thrown
                        // rather than a single error.
                        if (e.length) throw e[0];
                        throw e;
                    }
                }
                function babelTranspile(load, babel) {
                    var options = this.babelOptions || {};
                    return options.modules = "system", void 0 === options.sourceMap && (options.sourceMap = "inline"), 
                    options.inputSourceMap = load.metadata.sourceMap, options.filename = load.address, 
                    options.code = !0, options.ast = !1, babel.transform(load.source, options).code;
                }
                function typescriptTranspile(load, ts) {
                    var options = this.typescriptOptions || {};
                    return options.target = options.target || ts.ScriptTarget.ES5, void 0 === options.sourceMap && (options.sourceMap = !0), 
                    options.sourceMap && options.inlineSourceMap !== !1 && (options.inlineSourceMap = !0), 
                    options.module = ts.ModuleKind.System, ts.transpile(load.source, options, load.address);
                }
                // use Traceur by default
                return Loader.prototype.transpiler = "traceur", transpile;
            }();
            SystemProto.prototype = Loader.prototype, SystemJSLoader.prototype = new SystemProto(), 
            SystemJSLoader.prototype.constructor = SystemJSLoader;
            var systemJSConstructor, absURLRegEx = /^[^\/]+:\/\//, baseURIObj = new URL(baseURI), getOwnPropertyDescriptor = !0;
            try {
                Object.getOwnPropertyDescriptor({
                    a: 0
                }, "a");
            } catch (e) {
                getOwnPropertyDescriptor = !1;
            }
            // we define a __exec for globally-scoped execution
            // used by module format implementations
            var __exec;
            !function() {
                function getSource(load, wrap) {
                    var lastLineIndex = load.source.lastIndexOf("\n");
                    // wrap ES formats with a System closure for System global encapsulation
                    "global" == load.metadata.format && (wrap = !1);
                    var sourceMap = load.metadata.sourceMap;
                    if (sourceMap) {
                        if ("object" != typeof sourceMap) throw new TypeError("load.metadata.sourceMap must be set to an object.");
                        sourceMap = JSON.stringify(sourceMap);
                    }
                    return (wrap ? "(function(System, SystemJS) {" : "") + load.source + (wrap ? "\n})(System, System);" : "") + ("\n//# sourceURL=" != load.source.substr(lastLineIndex, 15) ? "\n//# sourceURL=" + load.address + (sourceMap ? "!transpiled" : "") : "") + (sourceMap && hasBtoa && "\n//# sourceMappingURL=data:application/json;base64," + btoa(unescape(encodeURIComponent(sourceMap))) || "");
                }
                function preExec(loader, load) {
                    curLoad = load, 0 == callCounter++ && (curSystem = __global.System), __global.System = __global.SystemJS = loader;
                }
                function postExec() {
                    0 == --callCounter && (__global.System = __global.SystemJS = curSystem), curLoad = void 0;
                }
                function scriptExec(load) {
                    head || (head = document.head || document.body || document.documentElement);
                    var script = document.createElement("script");
                    script.text = getSource(load, !1);
                    var e, onerror = window.onerror;
                    if (window.onerror = function(_e) {
                        e = addToError(_e, "Evaluating " + load.address), onerror && onerror.apply(this, arguments);
                    }, preExec(this, load), load.metadata.integrity && script.setAttribute("integrity", load.metadata.integrity), 
                    load.metadata.nonce && script.setAttribute("nonce", load.metadata.nonce), head.appendChild(script), 
                    head.removeChild(script), postExec(), window.onerror = onerror, e) throw e;
                }
                var curLoad, hasBtoa = "undefined" != typeof btoa;
                // System.register, System.registerDynamic, AMD define pipeline
                // if currently evalling code here, immediately reduce the registered entry against the load record
                hook("pushRegister_", function() {
                    return function(register) {
                        return curLoad ? (this.reduceRegister_(curLoad, register), !0) : !1;
                    };
                });
                // System clobbering protection (mostly for Traceur)
                var curSystem, vm, callCounter = 0, nwjs = "undefined" != typeof process && process.versions && process.versions["node-webkit"];
                __exec = function(load) {
                    if (load.source) {
                        if ((load.metadata.integrity || load.metadata.nonce) && supportsScriptExec) return scriptExec.call(this, load);
                        try {
                            preExec(this, load), curLoad = load, // global scoped eval for node (avoids require scope leak)
                            this._nodeRequire && !nwjs ? (vm = vm || this._nodeRequire("vm"), vm.runInThisContext(getSource(load, !0), {
                                filename: load.address + (load.metadata.sourceMap ? "!transpiled" : "")
                            })) : (0, eval)(getSource(load, !0)), postExec();
                        } catch (e) {
                            throw postExec(), addToError(e, "Evaluating " + load.address);
                        }
                    }
                };
                var supportsScriptExec = !1;
                if (isBrowser && "undefined" != typeof document && document.getElementsByTagName) {
                    var scripts = document.getElementsByTagName("script");
                    $__curScript = scripts[scripts.length - 1], window.chrome && window.chrome.extension || navigator.userAgent.match(/^Node\.js/) || (supportsScriptExec = !0);
                }
                // script execution via injecting a script tag into the page
                // this allows CSP integrity and nonce to be set for CSP environments
                var head;
            }();
            var envModule;
            hookConstructor(function(constructor) {
                return function() {
                    constructor.call(this), // support baseURL
                    this.baseURL = baseURI, // support map and paths
                    this.map = {}, // global behaviour flags
                    this.warnings = !1, this.defaultJSExtensions = !1, this.pluginFirst = !1, this.loaderErrorStack = !1, 
                    // by default load ".json" files as json
                    // leading * meta doesn't need normalization
                    // NB add this in next breaking release
                    // this.meta['*.json'] = { format: 'json' };
                    // support the empty module, as a concept
                    this.set("@empty", this.newModule({})), setProduction.call(this, !1);
                };
            }), // include the node require since we're overriding it
            "undefined" == typeof require || "undefined" == typeof process || process.browser || (SystemJSLoader.prototype._nodeRequire = require), 
            hook("normalize", function(normalize) {
                return function(name, parentName, skipExt) {
                    var resolved = coreResolve.call(this, name, parentName);
                    return !this.defaultJSExtensions || skipExt || ".js" == resolved.substr(resolved.length - 3, 3) || isPlain(resolved) || (resolved += ".js"), 
                    resolved;
                };
            });
            // percent encode just '#' in urls if using HTTP requests
            var httpRequest = "undefined" != typeof XMLHttpRequest;
            hook("locate", function(locate) {
                return function(load) {
                    return Promise.resolve(locate.call(this, load)).then(function(address) {
                        return httpRequest ? address.replace(/#/g, "%23") : address;
                    });
                };
            }), /*
 * Fetch with authorization
 */
            hook("fetch", function() {
                return function(load) {
                    return new Promise(function(resolve, reject) {
                        fetchTextFromURL(load.address, load.metadata.authorization, resolve, reject);
                    });
                };
            }), /*
  __useDefault
  
  When a module object looks like:
  newModule(
    __useDefault: true,
    default: 'some-module'
  })

  Then importing that module provides the 'some-module'
  result directly instead of the full module.

  Useful for eg module.exports = function() {}
*/
            hook("import", function(systemImport) {
                return function(name, parentName, parentAddress) {
                    return parentName && parentName.name && warn.call(this, "SystemJS.import(name, { name: parentName }) is deprecated for SystemJS.import(name, parentName), while importing " + name + " from " + parentName.name), 
                    systemImport.call(this, name, parentName, parentAddress).then(function(module) {
                        return module.__useDefault ? module["default"] : module;
                    });
                };
            }), /*
 * Allow format: 'detect' meta to enable format detection
 */
            hook("translate", function(systemTranslate) {
                return function(load) {
                    return "detect" == load.metadata.format && (load.metadata.format = void 0), systemTranslate.apply(this, arguments);
                };
            }), /*
 * JSON format support
 *
 * Supports loading JSON files as a module format itself
 *
 * Usage:
 *
 * SystemJS.config({
 *   meta: {
 *     '*.json': { format: 'json' }
 *   }
 * });
 *
 * Module is returned as if written:
 *
 * export default {JSON}
 *
 * No named exports are provided
 *
 * Files ending in ".json" are treated as json automatically by SystemJS
 */
            hook("instantiate", function(instantiate) {
                return function(load) {
                    if ("json" == load.metadata.format && !this.builder) {
                        var entry = load.metadata.entry = createEntry();
                        entry.deps = [], entry.execute = function() {
                            try {
                                return JSON.parse(load.source);
                            } catch (e) {
                                throw new Error("Invalid JSON file " + load.name);
                            }
                        };
                    }
                };
            }), /*
 Extend config merging one deep only

  loader.config({
    some: 'random',
    config: 'here',
    deep: {
      config: { too: 'too' }
    }
  });

  <=>

  loader.some = 'random';
  loader.config = 'here'
  loader.deep = loader.deep || {};
  loader.deep.config = { too: 'too' };


  Normalizes meta and package configs allowing for:

  SystemJS.config({
    meta: {
      './index.js': {}
    }
  });

  To become

  SystemJS.meta['https://thissite.com/index.js'] = {};

  For easy normalization canonicalization with latest URL support.

*/
            SystemJSLoader.prototype.env = "dev", SystemJSLoader.prototype.getConfig = function(name) {
                var cfg = {}, loader = this;
                for (var p in loader) loader.hasOwnProperty && !loader.hasOwnProperty(p) || p in SystemJSLoader.prototype || -1 == indexOf.call([ "_loader", "amdDefine", "amdRequire", "defined", "failed", "version" ], p) && (cfg[p] = loader[p]);
                return cfg.production = envModule.production, cfg;
            };
            var curCurScript;
            SystemJSLoader.prototype.config = function(cfg, isEnvConfig) {
                function checkHasConfig(obj) {
                    for (var p in obj) if (obj.hasOwnProperty(p)) return !0;
                }
                var loader = this;
                if ("loaderErrorStack" in cfg && (curCurScript = $__curScript, cfg.loaderErrorStack ? $__curScript = void 0 : $__curScript = curCurScript), 
                "warnings" in cfg && (loader.warnings = cfg.warnings), // transpiler deprecation path
                cfg.transpilerRuntime === !1 && (loader._loader.loadedTranspilerRuntime = !0), "production" in cfg && setProduction.call(loader, cfg.production), 
                !isEnvConfig) {
                    // if using nodeConfig / browserConfig / productionConfig, take baseURL from there
                    // these exceptions will be unnecessary when we can properly implement config queuings
                    var baseURL;
                    // always configure baseURL first
                    if (envSet(loader, cfg, function(cfg) {
                        baseURL = baseURL || cfg.baseURL;
                    }), baseURL = baseURL || cfg.baseURL) {
                        if (checkHasConfig(loader.packages) || checkHasConfig(loader.meta) || checkHasConfig(loader.depCache) || checkHasConfig(loader.bundles) || checkHasConfig(loader.packageConfigPaths)) throw new TypeError("Incorrect configuration order. The baseURL must be configured with the first SystemJS.config call.");
                        this.baseURL = baseURL, prepareBaseURL.call(this);
                    }
                    // warn on wildcard path deprecations
                    if (cfg.paths && extend(loader.paths, cfg.paths), envSet(loader, cfg, function(cfg) {
                        cfg.paths && extend(loader.paths, cfg.paths);
                    }), this.warnings) for (var p in loader.paths) -1 != p.indexOf("*") && warn.call(loader, 'Paths configuration "' + p + '" -> "' + loader.paths[p] + '" uses wildcards which are being deprecated for simpler trailing "/" folder paths.');
                }
                if (cfg.defaultJSExtensions && (loader.defaultJSExtensions = cfg.defaultJSExtensions, 
                warn.call(loader, "The defaultJSExtensions configuration option is deprecated, use packages configuration instead.")), 
                cfg.pluginFirst && (loader.pluginFirst = cfg.pluginFirst), cfg.map) {
                    var objMaps = "";
                    for (var p in cfg.map) {
                        var v = cfg.map[p];
                        // object map backwards-compat into packages configuration
                        if ("string" != typeof v) {
                            objMaps += (objMaps.length ? ", " : "") + '"' + p + '"';
                            var defaultJSExtension = loader.defaultJSExtensions && ".js" != p.substr(p.length - 3, 3), prop = loader.decanonicalize(p);
                            defaultJSExtension && ".js" == prop.substr(prop.length - 3, 3) && (prop = prop.substr(0, prop.length - 3));
                            // if a package main, revert it
                            var pkgMatch = "";
                            for (var pkg in loader.packages) prop.substr(0, pkg.length) == pkg && (!prop[pkg.length] || "/" == prop[pkg.length]) && pkgMatch.split("/").length < pkg.split("/").length && (pkgMatch = pkg);
                            pkgMatch && loader.packages[pkgMatch].main && (prop = prop.substr(0, prop.length - loader.packages[pkgMatch].main.length - 1));
                            var pkg = loader.packages[prop] = loader.packages[prop] || {};
                            pkg.map = v;
                        } else loader.map[p] = v;
                    }
                    objMaps && warn.call(loader, "The map configuration for " + objMaps + ' uses object submaps, which is deprecated in global map.\nUpdate this to use package contextual map with configs like SystemJS.config({ packages: { "' + p + '": { map: {...} } } }).');
                }
                if (cfg.packageConfigPaths) {
                    for (var packageConfigPaths = [], i = 0; i < cfg.packageConfigPaths.length; i++) {
                        var path = cfg.packageConfigPaths[i], packageLength = Math.max(path.lastIndexOf("*") + 1, path.lastIndexOf("/")), normalized = coreResolve.call(loader, path.substr(0, packageLength));
                        packageConfigPaths[i] = normalized + path.substr(packageLength);
                    }
                    loader.packageConfigPaths = packageConfigPaths;
                }
                if (cfg.bundles) for (var p in cfg.bundles) {
                    for (var bundle = [], i = 0; i < cfg.bundles[p].length; i++) {
                        var defaultJSExtension = loader.defaultJSExtensions && ".js" != cfg.bundles[p][i].substr(cfg.bundles[p][i].length - 3, 3), normalizedBundleDep = loader.decanonicalize(cfg.bundles[p][i]);
                        defaultJSExtension && ".js" == normalizedBundleDep.substr(normalizedBundleDep.length - 3, 3) && (normalizedBundleDep = normalizedBundleDep.substr(0, normalizedBundleDep.length - 3)), 
                        bundle.push(normalizedBundleDep);
                    }
                    loader.bundles[p] = bundle;
                }
                if (cfg.packages) for (var p in cfg.packages) {
                    if (p.match(/^([^\/]+:)?\/\/$/)) throw new TypeError('"' + p + '" is not a valid package name.');
                    var prop = coreResolve.call(loader, p);
                    // allow trailing slash in packages
                    "/" == prop[prop.length - 1] && (prop = prop.substr(0, prop.length - 1)), setPkgConfig(loader, prop, cfg.packages[p], !1);
                }
                for (var c in cfg) {
                    var v = cfg[c];
                    if (-1 == indexOf.call([ "baseURL", "map", "packages", "bundles", "paths", "warnings", "packageConfigPaths", "loaderErrorStack", "browserConfig", "nodeConfig", "devConfig", "productionConfig" ], c)) if ("object" != typeof v || v instanceof Array) loader[c] = v; else {
                        loader[c] = loader[c] || {};
                        for (var p in v) // base-level wildcard meta does not normalize to retain catch-all quality
                        if ("meta" == c && "*" == p[0]) extend(loader[c][p] = loader[c][p] || {}, v[p]); else if ("meta" == c) {
                            // meta can go through global map, with defaultJSExtensions adding
                            var resolved = coreResolve.call(loader, p);
                            loader.defaultJSExtensions && ".js" != resolved.substr(resolved.length - 3, 3) && !isPlain(resolved) && (resolved += ".js"), 
                            extend(loader[c][resolved] = loader[c][resolved] || {}, v[p]);
                        } else if ("depCache" == c) {
                            var defaultJSExtension = loader.defaultJSExtensions && ".js" != p.substr(p.length - 3, 3), prop = loader.decanonicalize(p);
                            defaultJSExtension && ".js" == prop.substr(prop.length - 3, 3) && (prop = prop.substr(0, prop.length - 3)), 
                            loader[c][prop] = [].concat(v[p]);
                        } else loader[c][p] = v[p];
                    }
                }
                envSet(loader, cfg, function(cfg) {
                    loader.config(cfg, !0);
                });
            }, /*
 * Package Configuration Extension
 *
 * Example:
 *
 * SystemJS.packages = {
 *   jquery: {
 *     main: 'index.js', // when not set, package name is requested directly
 *     format: 'amd',
 *     defaultExtension: 'ts', // defaults to 'js', can be set to false
 *     modules: {
 *       '*.ts': {
 *         loader: 'typescript'
 *       },
 *       'vendor/sizzle.js': {
 *         format: 'global'
 *       }
 *     },
 *     map: {
 *        // map internal require('sizzle') to local require('./vendor/sizzle')
 *        sizzle: './vendor/sizzle.js',
 *        // map any internal or external require of 'jquery/vendor/another' to 'another/index.js'
 *        './vendor/another.js': './another/index.js',
 *        // test.js / test -> lib/test.js
 *        './test.js': './lib/test.js',
 *
 *        // environment-specific map configurations
 *        './index.js': {
 *          '~browser': './index-node.js',
 *          './custom-condition.js|~export': './index-custom.js'
 *        }
 *     },
 *     // allows for setting package-prefixed depCache
 *     // keys are normalized module names relative to the package itself
 *     depCache: {
 *       // import 'package/index.js' loads in parallel package/lib/test.js,package/vendor/sizzle.js
 *       './index.js': ['./test'],
 *       './test.js': ['external-dep'],
 *       'external-dep/path.js': ['./another.js']
 *     }
 *   }
 * };
 *
 * Then:
 *   import 'jquery'                       -> jquery/index.js
 *   import 'jquery/submodule'             -> jquery/submodule.js
 *   import 'jquery/submodule.ts'          -> jquery/submodule.ts loaded as typescript
 *   import 'jquery/vendor/another'        -> another/index.js
 *
 * Detailed Behaviours
 * - main can have a leading "./" can be added optionally
 * - map and defaultExtension are applied to the main
 * - defaultExtension adds the extension only if the exact extension is not present
 * - defaultJSExtensions applies after map when defaultExtension is not set
 * - if a meta value is available for a module, map and defaultExtension are skipped
 * - like global map, package map also applies to subpaths (sizzle/x, ./vendor/another/sub)
 * - condition module map is '@env' module in package or '@system-env' globally
 * - map targets support conditional interpolation ('./x': './x.#{|env}.js')
 * - internal package map targets cannot use boolean conditionals
 *
 * Package Configuration Loading
 *
 * Not all packages may already have their configuration present in the System config
 * For these cases, a list of packageConfigPaths can be provided, which when matched against
 * a request, will first request a ".json" file by the package name to derive the package
 * configuration from. This allows dynamic loading of non-predetermined code, a key use
 * case in SystemJS.
 *
 * Example:
 *
 *   SystemJS.packageConfigPaths = ['packages/test/package.json', 'packages/*.json'];
 *
 *   // will first request 'packages/new-package/package.json' for the package config
 *   // before completing the package request to 'packages/new-package/path'
 *   SystemJS.import('packages/new-package/path');
 *
 *   // will first request 'packages/test/package.json' before the main
 *   SystemJS.import('packages/test');
 *
 * When a package matches packageConfigPaths, it will always send a config request for
 * the package configuration.
 * The package name itself is taken to be the match up to and including the last wildcard
 * or trailing slash.
 * The most specific package config path will be used.
 * Any existing package configurations for the package will deeply merge with the
 * package config, with the existing package configurations taking preference.
 * To opt-out of the package configuration request for a package that matches
 * packageConfigPaths, use the { configured: true } package config option.
 *
 */
            function() {
                function getPackage(loader, normalized) {
                    // use most specific package
                    var curPkg, pkgLen, curPkgLen = 0;
                    for (var p in loader.packages) normalized.substr(0, p.length) !== p || normalized.length !== p.length && "/" !== normalized[p.length] || (pkgLen = p.split("/").length, 
                    pkgLen > curPkgLen && (curPkg = p, curPkgLen = pkgLen));
                    return curPkg;
                }
                function addDefaultExtension(loader, pkg, pkgName, subPath, skipExtensions) {
                    // don't apply extensions to folders or if defaultExtension = false
                    if (!subPath || "/" == subPath[subPath.length - 1] || skipExtensions || pkg.defaultExtension === !1) return subPath;
                    var metaMatch = !1;
                    if (// exact meta or meta with any content after the last wildcard skips extension
                    pkg.meta && getMetaMatches(pkg.meta, subPath, function(metaPattern, matchMeta, matchDepth) {
                        return 0 == matchDepth || metaPattern.lastIndexOf("*") != metaPattern.length - 1 ? metaMatch = !0 : void 0;
                    }), // exact global meta or meta with any content after the last wildcard skips extension
                    !metaMatch && loader.meta && getMetaMatches(loader.meta, pkgName + "/" + subPath, function(metaPattern, matchMeta, matchDepth) {
                        return 0 == matchDepth || metaPattern.lastIndexOf("*") != metaPattern.length - 1 ? metaMatch = !0 : void 0;
                    }), metaMatch) return subPath;
                    // work out what the defaultExtension is and add if not there already
                    // NB reconsider if default should really be ".js"?
                    var defaultExtension = "." + (pkg.defaultExtension || "js");
                    return subPath.substr(subPath.length - defaultExtension.length) != defaultExtension ? subPath + defaultExtension : subPath;
                }
                function applyPackageConfigSync(loader, pkg, pkgName, subPath, skipExtensions) {
                    // main
                    if (!subPath) {
                        if (!pkg.main) // NB can add a default package main convention here when defaultJSExtensions is deprecated
                        // if it becomes internal to the package then it would no longer be an exit path
                        return pkgName + (loader.defaultJSExtensions ? ".js" : "");
                        subPath = "./" == pkg.main.substr(0, 2) ? pkg.main.substr(2) : pkg.main;
                    }
                    // map config checking without then with extensions
                    if (pkg.map) {
                        var mapPath = "./" + subPath, mapMatch = getMapMatch(pkg.map, mapPath);
                        if (// we then check map with the default extension adding
                        mapMatch || (mapPath = "./" + addDefaultExtension(loader, pkg, pkgName, subPath, skipExtensions), 
                        mapPath != "./" + subPath && (mapMatch = getMapMatch(pkg.map, mapPath))), mapMatch) {
                            var mapped = doMapSync(loader, pkg, pkgName, mapMatch, mapPath, skipExtensions);
                            if (mapped) return mapped;
                        }
                    }
                    // normal package resolution
                    return pkgName + "/" + addDefaultExtension(loader, pkg, pkgName, subPath, skipExtensions);
                }
                function validMapping(mapMatch, mapped, pkgName, path) {
                    // disallow internal to subpath maps
                    if ("." == mapMatch) throw new Error("Package " + pkgName + ' has a map entry for "." which is not permitted.');
                    // allow internal ./x -> ./x/y or ./x/ -> ./x/y recursive maps
                    // but only if the path is exactly ./x and not ./x/z
                    // allow internal ./x -> ./x/y or ./x/ -> ./x/y recursive maps
                    // but only if the path is exactly ./x and not ./x/z
                    return mapped.substr(0, mapMatch.length) == mapMatch && path.length > mapMatch.length ? !1 : !0;
                }
                function doMapSync(loader, pkg, pkgName, mapMatch, path, skipExtensions) {
                    "/" == path[path.length - 1] && (path = path.substr(0, path.length - 1));
                    var mapped = pkg.map[mapMatch];
                    if ("object" == typeof mapped) throw new Error("Synchronous conditional normalization not supported sync normalizing " + mapMatch + " in " + pkgName);
                    if (validMapping(mapMatch, mapped, pkgName, path) && "string" == typeof mapped) {
                        // package map to main / base-level
                        if ("." == mapped) mapped = pkgName; else if ("./" == mapped.substr(0, 2)) return pkgName + "/" + addDefaultExtension(loader, pkg, pkgName, mapped.substr(2) + path.substr(mapMatch.length), skipExtensions);
                        // external map reference
                        return loader.normalizeSync(mapped + path.substr(mapMatch.length), pkgName + "/");
                    }
                }
                function applyPackageConfig(loader, pkg, pkgName, subPath, skipExtensions) {
                    // main
                    if (!subPath) {
                        if (!pkg.main) // NB can add a default package main convention here when defaultJSExtensions is deprecated
                        // if it becomes internal to the package then it would no longer be an exit path
                        return Promise.resolve(pkgName + (loader.defaultJSExtensions ? ".js" : ""));
                        subPath = "./" == pkg.main.substr(0, 2) ? pkg.main.substr(2) : pkg.main;
                    }
                    // map config checking without then with extensions
                    var mapPath, mapMatch;
                    // we then check map with the default extension adding
                    return pkg.map && (mapPath = "./" + subPath, mapMatch = getMapMatch(pkg.map, mapPath), 
                    mapMatch || (mapPath = "./" + addDefaultExtension(loader, pkg, pkgName, subPath, skipExtensions), 
                    mapPath != "./" + subPath && (mapMatch = getMapMatch(pkg.map, mapPath)))), (mapMatch ? doMap(loader, pkg, pkgName, mapMatch, mapPath, skipExtensions) : Promise.resolve()).then(function(mapped) {
                        return Promise.resolve(mapped ? mapped : pkgName + "/" + addDefaultExtension(loader, pkg, pkgName, subPath, skipExtensions));
                    });
                }
                function doStringMap(loader, pkg, pkgName, mapMatch, mapped, path, skipExtensions) {
                    // NB the interpolation cases should strictly skip subsequent interpolation
                    // package map to main / base-level
                    if ("." == mapped) mapped = pkgName; else if ("./" == mapped.substr(0, 2)) return Promise.resolve(pkgName + "/" + addDefaultExtension(loader, pkg, pkgName, mapped.substr(2) + path.substr(mapMatch.length), skipExtensions)).then(function(name) {
                        return interpolateConditional.call(loader, name, pkgName + "/");
                    });
                    // external map reference
                    return loader.normalize(mapped + path.substr(mapMatch.length), pkgName + "/");
                }
                function doMap(loader, pkg, pkgName, mapMatch, path, skipExtensions) {
                    "/" == path[path.length - 1] && (path = path.substr(0, path.length - 1));
                    var mapped = pkg.map[mapMatch];
                    if ("string" == typeof mapped) return validMapping(mapMatch, mapped, pkgName, path) ? doStringMap(loader, pkg, pkgName, mapMatch, mapped, path, skipExtensions) : Promise.resolve();
                    // we use a special conditional syntax to allow the builder to handle conditional branch points further
                    if (loader.builder) return Promise.resolve(pkgName + "/#:" + path);
                    // we load all conditions upfront
                    var conditionPromises = [], conditions = [];
                    for (var e in mapped) {
                        var c = parseCondition(e);
                        conditions.push({
                            condition: c,
                            map: mapped[e]
                        }), conditionPromises.push(loader["import"](c.module, pkgName));
                    }
                    // map object -> conditional map
                    return Promise.all(conditionPromises).then(function(conditionValues) {
                        // first map condition to match is used
                        for (var i = 0; i < conditions.length; i++) {
                            var c = conditions[i].condition, value = readMemberExpression(c.prop, conditionValues[i]);
                            if (!c.negate && value || c.negate && !value) return conditions[i].map;
                        }
                    }).then(function(mapped) {
                        if (mapped) {
                            if (!validMapping(mapMatch, mapped, pkgName, path)) return;
                            return doStringMap(loader, pkg, pkgName, mapMatch, mapped, path, skipExtensions);
                        }
                    });
                }
                // data object for quick checks against package paths
                function createPkgConfigPathObj(path) {
                    var lastWildcard = path.lastIndexOf("*"), length = Math.max(lastWildcard + 1, path.lastIndexOf("/"));
                    return {
                        length: length,
                        regEx: new RegExp("^(" + path.substr(0, length).replace(/[.+?^${}()|[\]\\]/g, "\\$&").replace(/\*/g, "[^\\/]+") + ")(\\/|$)"),
                        wildcard: -1 != lastWildcard
                    };
                }
                // most specific match wins
                function getPackageConfigMatch(loader, normalized) {
                    for (var pkgName, configPath, exactMatch = !1, i = 0; i < loader.packageConfigPaths.length; i++) {
                        var packageConfigPath = loader.packageConfigPaths[i], p = packageConfigPaths[packageConfigPath] || (packageConfigPaths[packageConfigPath] = createPkgConfigPathObj(packageConfigPath));
                        if (!(normalized.length < p.length)) {
                            var match = normalized.match(p.regEx);
                            !match || pkgName && (exactMatch && p.wildcard || !(pkgName.length < match[1].length)) || (pkgName = match[1], 
                            exactMatch = !p.wildcard, configPath = pkgName + packageConfigPath.substr(p.length));
                        }
                    }
                    return pkgName ? {
                        packageName: pkgName,
                        configPath: configPath
                    } : void 0;
                }
                function loadPackageConfigPath(loader, pkgName, pkgConfigPath) {
                    var configLoader = loader.pluginLoader || loader;
                    // NB remove this when json is default
                    return (configLoader.meta[pkgConfigPath] = configLoader.meta[pkgConfigPath] || {}).format = "json", 
                    configLoader.meta[pkgConfigPath].loader = null, configLoader.load(pkgConfigPath).then(function() {
                        var cfg = configLoader.get(pkgConfigPath)["default"];
                        // support "systemjs" prefixing
                        // modules backwards compatibility
                        return cfg.systemjs && (cfg = cfg.systemjs), cfg.modules && (cfg.meta = cfg.modules, 
                        warn.call(loader, "Package config file " + pkgConfigPath + ' is configured with "modules", which is deprecated as it has been renamed to "meta".')), 
                        setPkgConfig(loader, pkgName, cfg, !0);
                    });
                }
                function getMetaMatches(pkgMeta, subPath, matchFn) {
                    // wildcard meta
                    var wildcardIndex;
                    for (var module in pkgMeta) {
                        // allow meta to start with ./ for flexibility
                        var dotRel = "./" == module.substr(0, 2) ? "./" : "";
                        if (dotRel && (module = module.substr(2)), wildcardIndex = module.indexOf("*"), 
                        -1 !== wildcardIndex && module.substr(0, wildcardIndex) == subPath.substr(0, wildcardIndex) && module.substr(wildcardIndex + 1) == subPath.substr(subPath.length - module.length + wildcardIndex + 1) && matchFn(module, pkgMeta[dotRel + module], module.split("/").length)) return;
                    }
                    // exact meta
                    var exactMeta = pkgMeta[subPath] && pkgMeta.hasOwnProperty && pkgMeta.hasOwnProperty(subPath) ? pkgMeta[subPath] : pkgMeta["./" + subPath];
                    exactMeta && matchFn(exactMeta, exactMeta, 0);
                }
                hookConstructor(function(constructor) {
                    return function() {
                        constructor.call(this), this.packages = {}, this.packageConfigPaths = [];
                    };
                }), // normalizeSync = decanonicalize + package resolution
                SystemJSLoader.prototype.normalizeSync = SystemJSLoader.prototype.decanonicalize = SystemJSLoader.prototype.normalize, 
                // decanonicalize must JUST handle package defaultExtension: false case when defaultJSExtensions is set
                // to be deprecated!
                hook("decanonicalize", function(decanonicalize) {
                    return function(name, parentName) {
                        if (this.builder) return decanonicalize.call(this, name, parentName, !0);
                        var decanonicalized = decanonicalize.call(this, name, parentName, !1);
                        if (!this.defaultJSExtensions) return decanonicalized;
                        var pkgName = getPackage(this, decanonicalized), pkg = this.packages[pkgName], defaultExtension = pkg && pkg.defaultExtension;
                        return void 0 == defaultExtension && pkg && pkg.meta && getMetaMatches(pkg.meta, decanonicalized.substr(pkgName), function(metaPattern, matchMeta, matchDepth) {
                            return 0 == matchDepth || metaPattern.lastIndexOf("*") != metaPattern.length - 1 ? (defaultExtension = !1, 
                            !0) : void 0;
                        }), (defaultExtension === !1 || defaultExtension && ".js" != defaultExtension) && ".js" != name.substr(name.length - 3, 3) && ".js" == decanonicalized.substr(decanonicalized.length - 3, 3) && (decanonicalized = decanonicalized.substr(0, decanonicalized.length - 3)), 
                        decanonicalized;
                    };
                }), hook("normalizeSync", function(normalizeSync) {
                    return function(name, parentName, isPlugin) {
                        var loader = this;
                        // apply contextual package map first
                        // (we assume the parent package config has already been loaded)
                        if (isPlugin = isPlugin === !0, parentName) var parentPackageName = getPackage(loader, parentName) || loader.defaultJSExtensions && ".js" == parentName.substr(parentName.length - 3, 3) && getPackage(loader, parentName.substr(0, parentName.length - 3));
                        var parentPackage = parentPackageName && loader.packages[parentPackageName];
                        // ignore . since internal maps handled by standard package resolution
                        if (parentPackage && "." != name[0]) {
                            var parentMap = parentPackage.map, parentMapMatch = parentMap && getMapMatch(parentMap, name);
                            if (parentMapMatch && "string" == typeof parentMap[parentMapMatch]) {
                                var mapped = doMapSync(loader, parentPackage, parentPackageName, parentMapMatch, name, isPlugin);
                                if (mapped) return mapped;
                            }
                        }
                        var defaultJSExtension = loader.defaultJSExtensions && ".js" != name.substr(name.length - 3, 3), normalized = normalizeSync.call(loader, name, parentName, !1);
                        // undo defaultJSExtension
                        defaultJSExtension && ".js" != normalized.substr(normalized.length - 3, 3) && (defaultJSExtension = !1), 
                        defaultJSExtension && (normalized = normalized.substr(0, normalized.length - 3));
                        var pkgConfigMatch = getPackageConfigMatch(loader, normalized), pkgName = pkgConfigMatch && pkgConfigMatch.packageName || getPackage(loader, normalized);
                        if (!pkgName) return normalized + (defaultJSExtension ? ".js" : "");
                        var subPath = normalized.substr(pkgName.length + 1);
                        return applyPackageConfigSync(loader, loader.packages[pkgName] || {}, pkgName, subPath, isPlugin);
                    };
                }), hook("normalize", function(normalize) {
                    return function(name, parentName, isPlugin) {
                        var loader = this;
                        return isPlugin = isPlugin === !0, Promise.resolve().then(function() {
                            // apply contextual package map first
                            // (we assume the parent package config has already been loaded)
                            if (parentName) var parentPackageName = getPackage(loader, parentName) || loader.defaultJSExtensions && ".js" == parentName.substr(parentName.length - 3, 3) && getPackage(loader, parentName.substr(0, parentName.length - 3));
                            var parentPackage = parentPackageName && loader.packages[parentPackageName];
                            // ignore . since internal maps handled by standard package resolution
                            if (parentPackage && "./" != name.substr(0, 2)) {
                                var parentMap = parentPackage.map, parentMapMatch = parentMap && getMapMatch(parentMap, name);
                                if (parentMapMatch) return doMap(loader, parentPackage, parentPackageName, parentMapMatch, name, isPlugin);
                            }
                            return Promise.resolve();
                        }).then(function(mapped) {
                            if (mapped) return mapped;
                            var defaultJSExtension = loader.defaultJSExtensions && ".js" != name.substr(name.length - 3, 3), normalized = normalize.call(loader, name, parentName, !1);
                            // undo defaultJSExtension
                            defaultJSExtension && ".js" != normalized.substr(normalized.length - 3, 3) && (defaultJSExtension = !1), 
                            defaultJSExtension && (normalized = normalized.substr(0, normalized.length - 3));
                            var pkgConfigMatch = getPackageConfigMatch(loader, normalized), pkgName = pkgConfigMatch && pkgConfigMatch.packageName || getPackage(loader, normalized);
                            if (!pkgName) return Promise.resolve(normalized + (defaultJSExtension ? ".js" : ""));
                            var pkg = loader.packages[pkgName], isConfigured = pkg && (pkg.configured || !pkgConfigMatch);
                            return (isConfigured ? Promise.resolve(pkg) : loadPackageConfigPath(loader, pkgName, pkgConfigMatch.configPath)).then(function(pkg) {
                                var subPath = normalized.substr(pkgName.length + 1);
                                return applyPackageConfig(loader, pkg, pkgName, subPath, isPlugin);
                            });
                        });
                    };
                });
                // check if the given normalized name matches a packageConfigPath
                // if so, loads the config
                var packageConfigPaths = {};
                hook("locate", function(locate) {
                    return function(load) {
                        var loader = this;
                        return Promise.resolve(locate.call(this, load)).then(function(address) {
                            var pkgName = getPackage(loader, load.name);
                            if (pkgName) {
                                var pkg = loader.packages[pkgName], subPath = load.name.substr(pkgName.length + 1), meta = {};
                                if (pkg.meta) {
                                    var bestDepth = 0;
                                    // NB support a main shorthand in meta here?
                                    getMetaMatches(pkg.meta, subPath, function(metaPattern, matchMeta, matchDepth) {
                                        matchDepth > bestDepth && (bestDepth = matchDepth), extendMeta(meta, matchMeta, matchDepth && bestDepth > matchDepth);
                                    }), extendMeta(load.metadata, meta);
                                }
                                // format
                                pkg.format && !load.metadata.loader && (load.metadata.format = load.metadata.format || pkg.format);
                            }
                            return address;
                        });
                    };
                });
            }(), /*
 * Script tag fetch
 *
 * When load.metadata.scriptLoad is true, we load via script tag injection.
 */
            function() {
                function getInteractiveScriptLoad() {
                    if (interactiveScript && "interactive" === interactiveScript.script.readyState) return interactiveScript.load;
                    for (var i = 0; i < interactiveLoadingScripts.length; i++) if ("interactive" == interactiveLoadingScripts[i].script.readyState) return interactiveScript = interactiveLoadingScripts[i], 
                    interactiveScript.load;
                }
                function webWorkerImport(loader, load) {
                    return new Promise(function(resolve, reject) {
                        load.metadata.integrity && reject(new Error("Subresource integrity checking is not supported in web workers.")), 
                        workerLoad = load;
                        try {
                            importScripts(load.address);
                        } catch (e) {
                            workerLoad = null, reject(e);
                        }
                        workerLoad = null, // if nothing registered, then something went wrong
                        load.metadata.entry || reject(new Error(load.address + " did not call System.register or AMD define")), 
                        resolve("");
                    });
                }
                if ("undefined" != typeof document) var head = document.getElementsByTagName("head")[0];
                var curSystem, curRequire, interactiveScript, workerLoad = null, ieEvents = head && function() {
                    var s = document.createElement("script"), isOpera = "undefined" != typeof opera && "[object Opera]" === opera.toString();
                    return s.attachEvent && !(s.attachEvent.toString && s.attachEvent.toString().indexOf("[native code") < 0) && !isOpera;
                }(), interactiveLoadingScripts = [], loadingCnt = 0, registerQueue = [];
                hook("pushRegister_", function(pushRegister) {
                    return function(register) {
                        // if using eval-execution then skip
                        // if using eval-execution then skip
                        // if using worker execution, then we're done
                        return pushRegister.call(this, register) ? !1 : (workerLoad ? this.reduceRegister_(workerLoad, register) : ieEvents ? this.reduceRegister_(getInteractiveScriptLoad(), register) : loadingCnt ? registerQueue.push(register) : this.reduceRegister_(null, register), 
                        !0);
                    };
                }), // override fetch to use script injection
                hook("fetch", function(fetch) {
                    return function(load) {
                        var loader = this;
                        return "json" != load.metadata.format && load.metadata.scriptLoad && (isBrowser || isWorker) ? isWorker ? webWorkerImport(loader, load) : new Promise(function(resolve, reject) {
                            function complete(evt) {
                                if (!s.readyState || "loaded" == s.readyState || "complete" == s.readyState) {
                                    // complete call is sync on execution finish
                                    // (in ie already done reductions)
                                    if (loadingCnt--, load.metadata.entry || registerQueue.length) {
                                        if (!ieEvents) {
                                            for (var i = 0; i < registerQueue.length; i++) loader.reduceRegister_(load, registerQueue[i]);
                                            registerQueue = [];
                                        }
                                    } else loader.reduceRegister_(load);
                                    cleanup(), // if nothing registered, then something went wrong
                                    load.metadata.entry || load.metadata.bundle || reject(new Error(load.name + " did not call System.register or AMD define. If loading a global module configure the global name via the meta exports property for script injection support.")), 
                                    resolve("");
                                }
                            }
                            function error(evt) {
                                cleanup(), reject(new Error("Unable to load script " + load.address));
                            }
                            function cleanup() {
                                if (__global.System = curSystem, __global.require = curRequire, s.detachEvent) {
                                    s.detachEvent("onreadystatechange", complete);
                                    for (var i = 0; i < interactiveLoadingScripts.length; i++) interactiveLoadingScripts[i].script == s && (interactiveScript && interactiveScript.script == s && (interactiveScript = null), 
                                    interactiveLoadingScripts.splice(i, 1));
                                } else s.removeEventListener("load", complete, !1), s.removeEventListener("error", error, !1);
                                head.removeChild(s);
                            }
                            var s = document.createElement("script");
                            s.async = !0, load.metadata.crossOrigin && (s.crossOrigin = load.metadata.crossOrigin), 
                            load.metadata.integrity && s.setAttribute("integrity", load.metadata.integrity), 
                            ieEvents ? (s.attachEvent("onreadystatechange", complete), interactiveLoadingScripts.push({
                                script: s,
                                load: load
                            })) : (s.addEventListener("load", complete, !1), s.addEventListener("error", error, !1)), 
                            loadingCnt++, curSystem = __global.System, curRequire = __global.require, s.src = load.address, 
                            head.appendChild(s);
                        }) : fetch.call(this, load);
                    };
                });
            }();
            /*
 * Instantiate registry extension
 *
 * Supports Traceur System.register 'instantiate' output for loading ES6 as ES5.
 *
 * - Creates the loader.register function
 * - Also supports metadata.format = 'register' in instantiate for anonymous register modules
 * - Also supports metadata.deps, metadata.execute and metadata.executingRequire
 *     for handling dynamic modules alongside register-transformed ES6 modules
 *
 *
 * The code here replicates the ES6 linking groups algorithm to ensure that
 * circular ES6 compiled into System.register can work alongside circular AMD 
 * and CommonJS, identically to the actual ES6 loader.
 *
 */
            /*
 * Registry side table entries in loader.defined
 * Registry Entry Contains:
 *    - name
 *    - deps 
 *    - declare for declarative modules
 *    - execute for dynamic modules, different to declarative execute on module
 *    - executingRequire indicates require drives execution for circularity of dynamic modules
 *    - declarative optional boolean indicating which of the above
 *
 * Can preload modules directly on SystemJS.defined['my/module'] = { deps, execute, executingRequire }
 *
 * Then the entry gets populated with derived information during processing:
 *    - normalizedDeps derived from deps, created in instantiate
 *    - groupIndex used by group linking algorithm
 *    - evaluated indicating whether evaluation has happend
 *    - module the module record object, containing:
 *      - exports actual module exports
 *
 *    For dynamic we track the es module with:
 *    - esModule actual es module value
 *    - esmExports whether to extend the esModule with named exports
 *      
 *    Then for declarative only we track dynamic bindings with the 'module' records:
 *      - name
 *      - exports
 *      - setters declarative setter functions
 *      - dependencies, module records of dependencies
 *      - importers, module records of dependents
 *
 * After linked and evaluated, entries are removed, declarative module records remain in separate
 * module binding table
 *
 */
            var leadingCommentAndMetaRegEx = /^(\s*\/\*[^\*]*(\*(?!\/)[^\*]*)*\*\/|\s*\/\/[^\n]*|\s*"[^"]+"\s*;?|\s*'[^']+'\s*;?)*\s*/;
            !function() {
                function buildGroups(entry, loader, groups) {
                    if (groups[entry.groupIndex] = groups[entry.groupIndex] || [], -1 == indexOf.call(groups[entry.groupIndex], entry)) {
                        groups[entry.groupIndex].push(entry);
                        for (var i = 0, l = entry.normalizedDeps.length; l > i; i++) {
                            var depName = entry.normalizedDeps[i], depEntry = loader.defined[depName];
                            // not in the registry means already linked / ES6
                            if (depEntry && !depEntry.evaluated) {
                                // now we know the entry is in our unlinked linkage group
                                var depGroupIndex = entry.groupIndex + (depEntry.declarative != entry.declarative);
                                // the group index of an entry is always the maximum
                                if (null === depEntry.groupIndex || depEntry.groupIndex < depGroupIndex) {
                                    // if already in a group, remove from the old group
                                    if (null !== depEntry.groupIndex && (groups[depEntry.groupIndex].splice(indexOf.call(groups[depEntry.groupIndex], depEntry), 1), 
                                    0 == groups[depEntry.groupIndex].length)) throw new Error("Mixed dependency cycle detected");
                                    depEntry.groupIndex = depGroupIndex;
                                }
                                buildGroups(depEntry, loader, groups);
                            }
                        }
                    }
                }
                function link(name, startEntry, loader) {
                    // skip if already linked
                    if (!startEntry.module) {
                        startEntry.groupIndex = 0;
                        var groups = [];
                        buildGroups(startEntry, loader, groups);
                        for (var curGroupDeclarative = !!startEntry.declarative == groups.length % 2, i = groups.length - 1; i >= 0; i--) {
                            for (var group = groups[i], j = 0; j < group.length; j++) {
                                var entry = group[j];
                                // link each group
                                curGroupDeclarative ? linkDeclarativeModule(entry, loader) : linkDynamicModule(entry, loader);
                            }
                            curGroupDeclarative = !curGroupDeclarative;
                        }
                    }
                }
                // module binding records
                function ModuleRecord() {}
                function getOrCreateModuleRecord(name, moduleRecords) {
                    return moduleRecords[name] || (moduleRecords[name] = {
                        name: name,
                        dependencies: [],
                        exports: new ModuleRecord(),
                        // start from an empty module and extend
                        importers: []
                    });
                }
                function linkDeclarativeModule(entry, loader) {
                    // only link if already not already started linking (stops at circular)
                    if (!entry.module) {
                        var moduleRecords = loader._loader.moduleRecords, module = entry.module = getOrCreateModuleRecord(entry.name, moduleRecords), exports = entry.module.exports, declaration = entry.declare.call(__global, function(name, value) {
                            if (module.locked = !0, "object" == typeof name) for (var p in name) exports[p] = name[p]; else exports[name] = value;
                            for (var i = 0, l = module.importers.length; l > i; i++) {
                                var importerModule = module.importers[i];
                                if (!importerModule.locked) {
                                    var importerIndex = indexOf.call(importerModule.dependencies, module);
                                    importerModule.setters[importerIndex](exports);
                                }
                            }
                            return module.locked = !1, value;
                        }, {
                            id: entry.name
                        });
                        if (module.setters = declaration.setters, module.execute = declaration.execute, 
                        !module.setters || !module.execute) throw new TypeError("Invalid System.register form for " + entry.name);
                        // now link all the module dependencies
                        for (var i = 0, l = entry.normalizedDeps.length; l > i; i++) {
                            var depExports, depName = entry.normalizedDeps[i], depEntry = loader.defined[depName], depModule = moduleRecords[depName];
                            depModule ? depExports = depModule.exports : depEntry && !depEntry.declarative ? depExports = depEntry.esModule : depEntry ? (linkDeclarativeModule(depEntry, loader), 
                            depModule = depEntry.module, depExports = depModule.exports) : depExports = loader.get(depName), 
                            // only declarative modules have dynamic bindings
                            depModule && depModule.importers ? (depModule.importers.push(module), module.dependencies.push(depModule)) : module.dependencies.push(null);
                            for (var originalIndices = entry.originalIndices[i], j = 0, len = originalIndices.length; len > j; ++j) {
                                var index = originalIndices[j];
                                module.setters[index] && module.setters[index](depExports);
                            }
                        }
                    }
                }
                // An analog to loader.get covering execution of all three layers (real declarative, simulated declarative, simulated dynamic)
                function getModule(name, loader) {
                    var exports, entry = loader.defined[name];
                    if (entry) entry.declarative ? ensureEvaluated(name, entry, [], loader) : entry.evaluated || linkDynamicModule(entry, loader), 
                    exports = entry.module.exports; else if (exports = loader.get(name), !exports) throw new Error("Unable to load dependency " + name + ".");
                    return (!entry || entry.declarative) && exports && exports.__useDefault ? exports["default"] : exports;
                }
                function linkDynamicModule(entry, loader) {
                    if (!entry.module) {
                        var exports = {}, module = entry.module = {
                            exports: exports,
                            id: entry.name
                        };
                        // AMD requires execute the tree first
                        if (!entry.executingRequire) for (var i = 0, l = entry.normalizedDeps.length; l > i; i++) {
                            var depName = entry.normalizedDeps[i], depEntry = loader.defined[depName];
                            depEntry && linkDynamicModule(depEntry, loader);
                        }
                        // now execute
                        entry.evaluated = !0;
                        var output = entry.execute.call(__global, function(name) {
                            for (var i = 0, l = entry.deps.length; l > i; i++) if (entry.deps[i] == name) return getModule(entry.normalizedDeps[i], loader);
                            // try and normalize the dependency to see if we have another form
                            var nameNormalized = loader.normalizeSync(name, entry.name);
                            if (-1 != indexOf.call(entry.normalizedDeps, nameNormalized)) return getModule(nameNormalized, loader);
                            throw new Error("Module " + name + " not declared as a dependency of " + entry.name);
                        }, exports, module);
                        output && (module.exports = output), // create the esModule object, which allows ES6 named imports of dynamics
                        exports = module.exports, // __esModule flag treats as already-named
                        exports && (exports.__esModule || exports instanceof Module) ? entry.esModule = loader.newModule(exports) : entry.esmExports && exports !== __global ? entry.esModule = loader.newModule(getESModule(exports)) : entry.esModule = loader.newModule({
                            "default": exports
                        });
                    }
                }
                /*
   * Given a module, and the list of modules for this current branch,
   *  ensure that each of the dependencies of this module is evaluated
   *  (unless one is a circular dependency already in the list of seen
   *  modules, in which case we execute it)
   *
   * Then we evaluate the module itself depth-first left to right 
   * execution to match ES6 modules
   */
                function ensureEvaluated(moduleName, entry, seen, loader) {
                    // if already seen, that means it's an already-evaluated non circular dependency
                    if (entry && !entry.evaluated && entry.declarative) {
                        // this only applies to declarative modules which late-execute
                        seen.push(moduleName);
                        for (var i = 0, l = entry.normalizedDeps.length; l > i; i++) {
                            var depName = entry.normalizedDeps[i];
                            -1 == indexOf.call(seen, depName) && (loader.defined[depName] ? ensureEvaluated(depName, loader.defined[depName], seen, loader) : loader.get(depName));
                        }
                        entry.evaluated || (entry.evaluated = !0, entry.module.execute.call(__global));
                    }
                }
                /*
   * There are two variations of System.register:
   * 1. System.register for ES6 conversion (2-3 params) - System.register([name, ]deps, declare)
   *    see https://github.com/ModuleLoader/es6-module-loader/wiki/System.register-Explained
   *
   * 2. System.registerDynamic for dynamic modules (3-4 params) - System.registerDynamic([name, ]deps, executingRequire, execute)
   * the true or false statement 
   *
   * this extension implements the linking algorithm for the two variations identical to the spec
   * allowing compiled ES6 circular references to work alongside AMD and CJS circular references.
   *
   */
                SystemJSLoader.prototype.register = function(name, deps, declare) {
                    // dynamic backwards-compatibility
                    // can be deprecated eventually
                    if ("string" != typeof name && (declare = deps, deps = name, name = null), "boolean" == typeof declare) return this.registerDynamic.apply(this, arguments);
                    var entry = createEntry();
                    // ideally wouldn't apply map config to bundle names but 
                    // dependencies go through map regardless so we can't restrict
                    // could reconsider in shift to new spec
                    entry.name = name && (this.decanonicalize || this.normalize).call(this, name), entry.declarative = !0, 
                    entry.deps = deps, entry.declare = declare, this.pushRegister_({
                        amd: !1,
                        entry: entry
                    });
                }, SystemJSLoader.prototype.registerDynamic = function(name, deps, declare, execute) {
                    "string" != typeof name && (execute = declare, declare = deps, deps = name, name = null);
                    // dynamic
                    var entry = createEntry();
                    entry.name = name && (this.decanonicalize || this.normalize).call(this, name), entry.deps = deps, 
                    entry.execute = execute, entry.executingRequire = declare, this.pushRegister_({
                        amd: !1,
                        entry: entry
                    });
                }, hook("reduceRegister_", function() {
                    return function(load, register) {
                        if (register) {
                            var entry = register.entry, curMeta = load && load.metadata;
                            // anonymous register
                            if (// named register
                            entry.name && (entry.name in this.defined || (this.defined[entry.name] = entry), 
                            curMeta && (curMeta.bundle = !0)), !entry.name || load && !curMeta.entry && entry.name == load.name) {
                                if (!curMeta) throw new TypeError("Invalid System.register call. Anonymous System.register calls can only be made by modules loaded by SystemJS.import and not via script tags.");
                                if (curMeta.entry) throw new Error("register" == curMeta.format ? "Multiple anonymous System.register calls in module " + load.name + ". If loading a bundle, ensure all the System.register calls are named." : "Module " + load.name + " interpreted as " + curMeta.format + " module format, but called System.register.");
                                curMeta.format || (curMeta.format = "register"), curMeta.entry = entry;
                            }
                        }
                    };
                }), hookConstructor(function(constructor) {
                    return function() {
                        constructor.call(this), this.defined = {}, this._loader.moduleRecords = {};
                    };
                }), defineProperty(ModuleRecord, "toString", {
                    value: function() {
                        return "Module";
                    }
                }), // override the delete method to also clear the register caches
                hook("delete", function(del) {
                    return function(name) {
                        return delete this._loader.moduleRecords[name], delete this.defined[name], del.call(this, name);
                    };
                }), hook("fetch", function(fetch) {
                    return function(load) {
                        return this.defined[load.name] ? (load.metadata.format = "defined", "") : (load.metadata.deps = load.metadata.deps || [], 
                        fetch.call(this, load));
                    };
                }), hook("translate", function(translate) {
                    // we run the meta detection here (register is after meta)
                    return function(load) {
                        return load.metadata.deps = load.metadata.deps || [], Promise.resolve(translate.apply(this, arguments)).then(function(source) {
                            // run detection for register format
                            return ("register" == load.metadata.format || !load.metadata.format && detectRegisterFormat(load.source)) && (load.metadata.format = "register"), 
                            source;
                        });
                    };
                }), // implement a perforance shortpath for System.load with no deps
                hook("load", function(doLoad) {
                    return function(normalized) {
                        var loader = this, entry = loader.defined[normalized];
                        // recursively ensure that the module and all its 
                        // dependencies are linked (with dependency group handling)
                        // now handle dependency execution in correct order
                        // remove from the registry
                        // return the defined module object
                        return !entry || entry.deps.length ? doLoad.apply(this, arguments) : (entry.originalIndices = entry.normalizedDeps = [], 
                        link(normalized, entry, loader), ensureEvaluated(normalized, entry, [], loader), 
                        entry.esModule || (entry.esModule = loader.newModule(entry.module.exports)), loader.trace || (loader.defined[normalized] = void 0), 
                        loader.set(normalized, entry.esModule), Promise.resolve());
                    };
                }), hook("instantiate", function(instantiate) {
                    return function(load) {
                        "detect" == load.metadata.format && (load.metadata.format = void 0), // assumes previous instantiate is sync
                        // (core json support)
                        instantiate.call(this, load);
                        var entry, loader = this;
                        // first we check if this module has already been defined in the registry
                        if (loader.defined[load.name]) entry = loader.defined[load.name], // don't support deps for ES modules
                        entry.declarative || (entry.deps = entry.deps.concat(load.metadata.deps)), entry.deps = entry.deps.concat(load.metadata.deps); else if (load.metadata.entry) entry = load.metadata.entry, 
                        entry.deps = entry.deps.concat(load.metadata.deps); else if (!(loader.builder && load.metadata.bundle || "register" != load.metadata.format && "esm" != load.metadata.format && "es6" != load.metadata.format)) {
                            if ("undefined" != typeof __exec && __exec.call(loader, load), !load.metadata.entry && !load.metadata.bundle) throw new Error(load.name + " detected as " + load.metadata.format + " but didn't execute.");
                            entry = load.metadata.entry, // support metadata deps for System.register
                            entry && load.metadata.deps && (entry.deps = entry.deps.concat(load.metadata.deps));
                        }
                        // named bundles are just an empty module
                        entry || (entry = createEntry(), entry.deps = load.metadata.deps, entry.execute = function() {}), 
                        // place this module onto defined for circular references
                        loader.defined[load.name] = entry;
                        var grouped = group(entry.deps);
                        entry.deps = grouped.names, entry.originalIndices = grouped.indices, entry.name = load.name, 
                        entry.esmExports = load.metadata.esmExports !== !1;
                        for (var normalizePromises = [], i = 0, l = entry.deps.length; l > i; i++) normalizePromises.push(Promise.resolve(loader.normalize(entry.deps[i], load.name)));
                        return Promise.all(normalizePromises).then(function(normalizedDeps) {
                            return entry.normalizedDeps = normalizedDeps, {
                                deps: entry.deps,
                                execute: function() {
                                    // return the defined module object
                                    // recursively ensure that the module and all its 
                                    // dependencies are linked (with dependency group handling)
                                    // now handle dependency execution in correct order
                                    // remove from the registry
                                    return link(load.name, entry, loader), ensureEvaluated(load.name, entry, [], loader), 
                                    entry.esModule || (entry.esModule = loader.newModule(entry.module.exports)), loader.trace || (loader.defined[load.name] = void 0), 
                                    entry.esModule;
                                }
                            };
                        });
                    };
                });
            }(), /*
 * Extension to detect ES6 and auto-load Traceur or Babel for processing
 */
            function() {
                // good enough ES6 module detection regex - format detections not designed to be accurate, but to handle the 99% use case
                var esmRegEx = /(^\s*|[}\);\n]\s*)(import\s*(['"]|(\*\s+as\s+)?[^"'\(\)\n;]+\s*from\s*['"]|\{)|export\s+\*\s+from\s+["']|export\s*(\{|default|function|class|var|const|let|async\s+function))/, traceurRuntimeRegEx = /\$traceurRuntime\s*\./, babelHelpersRegEx = /babelHelpers\s*\./;
                hook("translate", function(translate) {
                    return function(load) {
                        var loader = this, args = arguments;
                        return translate.apply(loader, args).then(function(source) {
                            // detect & transpile ES6
                            if ("esm" == load.metadata.format || "es6" == load.metadata.format || !load.metadata.format && source.match(esmRegEx)) {
                                if ("es6" == load.metadata.format && warn.call(loader, "Module " + load.name + ' has metadata setting its format to "es6", which is deprecated.\nThis should be updated to "esm".'), 
                                load.metadata.format = "esm", load.metadata.deps) {
                                    for (var depInject = "", i = 0; i < load.metadata.deps.length; i++) depInject += 'import "' + load.metadata.deps[i] + '"; ';
                                    load.source = depInject + source;
                                }
                                if (loader.transpiler === !1) {
                                    // we accept translation to esm for builds though to enable eg rollup optimizations
                                    if (loader.builder) return source;
                                    throw new TypeError("Unable to dynamically transpile ES module as SystemJS.transpiler set to false.");
                                }
                                // do transpilation
                                // setting _loader.loadedTranspiler = false tells the next block to
                                // do checks for setting transpiler metadata
                                return loader._loader.loadedTranspiler = loader._loader.loadedTranspiler || !1, 
                                loader.pluginLoader && (loader.pluginLoader._loader.loadedTranspiler = loader._loader.loadedTranspiler || !1), 
                                (loader._loader.transpilerPromise || (loader._loader.transpilerPromise = Promise.resolve(__global["typescript" == loader.transpiler ? "ts" : loader.transpiler] || (loader.pluginLoader || loader)["import"](loader.transpiler)))).then(function(transpiler) {
                                    // translate hooks means this is a transpiler plugin instead of a raw implementation
                                    // translate hooks means this is a transpiler plugin instead of a raw implementation
                                    // if transpiler is the same as the plugin loader, then don't run twice
                                    // convert the source map into an object for transpilation chaining
                                    // legacy builder support
                                    return loader._loader.loadedTranspilerRuntime = !0, transpiler.translate ? transpiler == load.metadata.loaderModule ? load.source : ("string" == typeof load.metadata.sourceMap && (load.metadata.sourceMap = JSON.parse(load.metadata.sourceMap)), 
                                    Promise.resolve(transpiler.translate.apply(loader, args)).then(function(source) {
                                        // sanitize sourceMap if an object not a JSON string
                                        var sourceMap = load.metadata.sourceMap;
                                        if (sourceMap && "object" == typeof sourceMap) {
                                            var originalName = load.address.split("!")[0];
                                            // force set the filename of the original file
                                            sourceMap.file && sourceMap.file != load.address || (sourceMap.file = originalName + "!transpiled"), 
                                            // force set the sources list if only one source
                                            (!sourceMap.sources || sourceMap.sources.length <= 1 && (!sourceMap.sources[0] || sourceMap.sources[0] == load.address)) && (sourceMap.sources = [ originalName ]);
                                        }
                                        return "esm" == load.metadata.format && !loader.builder && detectRegisterFormat(source) && (load.metadata.format = "register"), 
                                        source;
                                    })) : (loader.builder && (load.metadata.originalSource = load.source), transpile.call(loader, load).then(function(source) {
                                        // clear sourceMap as transpiler embeds it
                                        return load.metadata.sourceMap = void 0, source;
                                    }));
                                });
                            }
                            // skip transpiler and transpiler runtime loading when transpiler is disabled
                            if (loader.transpiler === !1) return source;
                            // detect transpiler runtime usage to load runtimes
                            if (// load the transpiler correctly
                            loader._loader.loadedTranspiler !== !1 || "traceur" != loader.transpiler && "typescript" != loader.transpiler && "babel" != loader.transpiler || load.name != loader.normalizeSync(loader.transpiler) || (// always load transpiler as a global
                            source.length > 100 && !load.metadata.format && (load.metadata.format = "global", 
                            "traceur" === loader.transpiler && (load.metadata.exports = "traceur"), "typescript" === loader.transpiler && (load.metadata.exports = "ts")), 
                            loader._loader.loadedTranspiler = !0), // load the transpiler runtime correctly
                            loader._loader.loadedTranspilerRuntime === !1 && (load.name == loader.normalizeSync("traceur-runtime") || load.name == loader.normalizeSync("babel/external-helpers*")) && (source.length > 100 && (load.metadata.format = load.metadata.format || "global"), 
                            loader._loader.loadedTranspilerRuntime = !0), ("register" == load.metadata.format || load.metadata.bundle) && loader._loader.loadedTranspilerRuntime !== !0) {
                                if ("traceur" == loader.transpiler && !__global.$traceurRuntime && load.source.match(traceurRuntimeRegEx)) return loader._loader.loadedTranspilerRuntime = loader._loader.loadedTranspilerRuntime || !1, 
                                loader["import"]("traceur-runtime").then(function() {
                                    return source;
                                });
                                if ("babel" == loader.transpiler && !__global.babelHelpers && load.source.match(babelHelpersRegEx)) return loader._loader.loadedTranspilerRuntime = loader._loader.loadedTranspilerRuntime || !1, 
                                loader["import"]("babel/external-helpers").then(function() {
                                    return source;
                                });
                            }
                            return source;
                        });
                    };
                });
            }();
            /*
  SystemJS Global Format

  Supports
    metadata.deps
    metadata.globals
    metadata.exports

  Without metadata.exports, detects writes to the global object.
*/
            var __globalName = "undefined" != typeof self ? "self" : "global";
            hook("fetch", function(fetch) {
                return function(load) {
                    return load.metadata.exports && !load.metadata.format && (load.metadata.format = "global"), 
                    fetch.call(this, load);
                };
            }), // ideally we could support script loading for globals, but the issue with that is that
            // we can't do it with AMD support side-by-side since AMD support means defining the
            // global define, and global support means not definining it, yet we don't have any hook
            // into the "pre-execution" phase of a script tag being loaded to handle both cases
            hook("instantiate", function(instantiate) {
                return function(load) {
                    var loader = this;
                    // global is a fallback module format
                    if (load.metadata.format || (load.metadata.format = "global"), "global" == load.metadata.format && !load.metadata.entry) {
                        var entry = createEntry();
                        load.metadata.entry = entry, entry.deps = [];
                        for (var g in load.metadata.globals) {
                            var gl = load.metadata.globals[g];
                            gl && entry.deps.push(gl);
                        }
                        entry.execute = function(require, exports, module) {
                            var globals;
                            if (load.metadata.globals) {
                                globals = {};
                                for (var g in load.metadata.globals) load.metadata.globals[g] && (globals[g] = require(load.metadata.globals[g]));
                            }
                            var exportName = load.metadata.exports;
                            exportName && (load.source += "\n" + __globalName + '["' + exportName + '"] = ' + exportName + ";");
                            var retrieveGlobal = loader.get("@@global-helpers").prepareGlobal(module.id, exportName, globals, !!load.metadata.encapsulateGlobal);
                            return __exec.call(loader, load), retrieveGlobal();
                        };
                    }
                    return instantiate.call(this, load);
                };
            }), hook("reduceRegister_", function(reduceRegister) {
                return function(load, register) {
                    if (register || !load.metadata.exports) return reduceRegister.call(this, load, register);
                    load.metadata.format = "global";
                    var entry = load.metadata.entry = createEntry();
                    entry.deps = load.metadata.deps;
                    var globalValue = getGlobalValue(load.metadata.exports);
                    entry.execute = function() {
                        return globalValue;
                    };
                };
            }), hookConstructor(function(constructor) {
                return function() {
                    function forEachGlobal(callback) {
                        if (Object.keys) Object.keys(__global).forEach(callback); else for (var g in __global) hasOwnProperty.call(__global, g) && callback(g);
                    }
                    function forEachGlobalValue(callback) {
                        forEachGlobal(function(globalName) {
                            if (-1 == indexOf.call(ignoredGlobalProps, globalName)) {
                                try {
                                    var value = __global[globalName];
                                } catch (e) {
                                    ignoredGlobalProps.push(globalName);
                                }
                                callback(globalName, value);
                            }
                        });
                    }
                    var loader = this;
                    constructor.call(loader);
                    var globalSnapshot, hasOwnProperty = Object.prototype.hasOwnProperty, ignoredGlobalProps = [ "_g", "sessionStorage", "localStorage", "clipboardData", "frames", "frameElement", "external", "mozAnimationStartTime", "webkitStorageInfo", "webkitIndexedDB", "mozInnerScreenY", "mozInnerScreenX" ];
                    loader.set("@@global-helpers", loader.newModule({
                        prepareGlobal: function(moduleName, exports, globals, encapsulate) {
                            // disable module detection
                            var curDefine = __global.define;
                            __global.define = void 0;
                            // set globals
                            var oldGlobals;
                            if (globals) {
                                oldGlobals = {};
                                for (var g in globals) oldGlobals[g] = __global[g], __global[g] = globals[g];
                            }
                            // return function to retrieve global
                            // store a complete copy of the global object in order to detect changes
                            return exports || (globalSnapshot = {}, forEachGlobalValue(function(name, value) {
                                globalSnapshot[name] = value;
                            })), function() {
                                var singleGlobal, globalValue = exports ? getGlobalValue(exports) : {}, multipleExports = !!exports;
                                // revert globals
                                if ((!exports || encapsulate) && forEachGlobalValue(function(name, value) {
                                    globalSnapshot[name] !== value && "undefined" != typeof value && (// allow global encapsulation where globals are removed
                                    encapsulate && (__global[name] = void 0), exports || (globalValue[name] = value, 
                                    "undefined" != typeof singleGlobal ? multipleExports || singleGlobal === value || (multipleExports = !0) : singleGlobal = value));
                                }), globalValue = multipleExports ? globalValue : singleGlobal, oldGlobals) for (var g in oldGlobals) __global[g] = oldGlobals[g];
                                return __global.define = curDefine, globalValue;
                            };
                        }
                    }));
                };
            }), /*
  SystemJS CommonJS Format
*/
            function() {
                function getCJSDeps(source) {
                    function inLocation(locations, match) {
                        for (var i = 0; i < locations.length; i++) if (locations[i][0] < match.index && locations[i][1] > match.index) return !0;
                        return !1;
                    }
                    cjsRequireRegEx.lastIndex = commentRegEx.lastIndex = stringRegEx.lastIndex = 0;
                    var match, deps = [], stringLocations = [], commentLocations = [];
                    if (source.length / source.split("\n").length < 200) {
                        for (;match = stringRegEx.exec(source); ) stringLocations.push([ match.index, match.index + match[0].length ]);
                        // TODO: track template literals here before comments
                        for (;match = commentRegEx.exec(source); ) // only track comments not starting in strings
                        inLocation(stringLocations, match) || commentLocations.push([ match.index + match[1].length, match.index + match[0].length - 1 ]);
                    }
                    for (;match = cjsRequireRegEx.exec(source); ) // ensure we're not within a string or comment location
                    if (!inLocation(stringLocations, match) && !inLocation(commentLocations, match)) {
                        var dep = match[1].substr(1, match[1].length - 2);
                        // skip cases like require('" + file + "')
                        if (dep.match(/"|'/)) continue;
                        // trailing slash requires are removed as they don't map mains in SystemJS
                        "/" == dep[dep.length - 1] && (dep = dep.substr(0, dep.length - 1)), deps.push(dep);
                    }
                    return deps;
                }
                // CJS Module Format
                // require('...') || exports[''] = ... || exports.asd = ... || module.exports = ...
                var cjsExportsRegEx = /(?:^\uFEFF?|[^$_a-zA-Z\xA0-\uFFFF.])(exports\s*(\[['"]|\.)|module(\.exports|\['exports'\]|\["exports"\])\s*(\[['"]|[=,\.]))/, cjsRequireRegEx = /(?:^\uFEFF?|[^$_a-zA-Z\xA0-\uFFFF."'])require\s*\(\s*("[^"\\]*(?:\\.[^"\\]*)*"|'[^'\\]*(?:\\.[^'\\]*)*')\s*\)/g, commentRegEx = /(^|[^\\])(\/\*([\s\S]*?)\*\/|([^:]|^)\/\/(.*)$)/gm, stringRegEx = /("[^"\\\n\r]*(\\.[^"\\\n\r]*)*"|'[^'\\\n\r]*(\\.[^'\\\n\r]*)*')/g, hashBangRegEx = /^\#\!.*/;
                hook("instantiate", function(instantiate) {
                    return function(load) {
                        var loader = this;
                        if (load.metadata.format || (cjsExportsRegEx.lastIndex = 0, cjsRequireRegEx.lastIndex = 0, 
                        (cjsRequireRegEx.exec(load.source) || cjsExportsRegEx.exec(load.source)) && (load.metadata.format = "cjs")), 
                        "cjs" == load.metadata.format) {
                            var metaDeps = load.metadata.deps, deps = load.metadata.cjsRequireDetection === !1 ? [] : getCJSDeps(load.source);
                            for (var g in load.metadata.globals) load.metadata.globals[g] && deps.push(load.metadata.globals[g]);
                            var entry = createEntry();
                            load.metadata.entry = entry, entry.deps = deps, entry.executingRequire = !0, entry.execute = function(_require, exports, module) {
                                function require(name) {
                                    return "/" == name[name.length - 1] && (name = name.substr(0, name.length - 1)), 
                                    _require.apply(this, arguments);
                                }
                                // ensure meta deps execute first
                                if (require.resolve = function(name) {
                                    return loader.get("@@cjs-helpers").requireResolve(name, module.id);
                                }, // support module.paths ish
                                module.paths = [], module.require = _require, !load.metadata.cjsDeferDepsExecute) for (var i = 0; i < metaDeps.length; i++) require(metaDeps[i]);
                                var pathVars = loader.get("@@cjs-helpers").getPathVars(module.id), __cjsWrapper = {
                                    exports: exports,
                                    args: [ require, exports, module, pathVars.filename, pathVars.dirname, __global, __global ]
                                }, cjsWrapper = "(function(require, exports, module, __filename, __dirname, global, GLOBAL";
                                // add metadata.globals to the wrapper arguments
                                if (load.metadata.globals) for (var g in load.metadata.globals) __cjsWrapper.args.push(require(load.metadata.globals[g])), 
                                cjsWrapper += ", " + g;
                                // disable AMD detection
                                var define = __global.define;
                                __global.define = void 0, __global.__cjsWrapper = __cjsWrapper, load.source = cjsWrapper + ") {" + load.source.replace(hashBangRegEx, "") + "\n}).apply(__cjsWrapper.exports, __cjsWrapper.args);", 
                                __exec.call(loader, load), __global.__cjsWrapper = void 0, __global.define = define;
                            };
                        }
                        return instantiate.call(loader, load);
                    };
                });
            }(), hookConstructor(function(constructor) {
                return function() {
                    function stripOrigin(path) {
                        return "file:///" == path.substr(0, 8) ? path.substr(7 + !!isWindows) : windowOrigin && path.substr(0, windowOrigin.length) == windowOrigin ? path.substr(windowOrigin.length) : path;
                    }
                    var loader = this;
                    if (constructor.call(loader), "undefined" != typeof window && "undefined" != typeof document && window.location) var windowOrigin = location.protocol + "//" + location.hostname + (location.port ? ":" + location.port : "");
                    loader.set("@@cjs-helpers", loader.newModule({
                        requireResolve: function(request, parentId) {
                            return stripOrigin(loader.normalizeSync(request, parentId));
                        },
                        getPathVars: function(moduleId) {
                            // remove any plugin syntax
                            var filename, pluginIndex = moduleId.lastIndexOf("!");
                            filename = -1 != pluginIndex ? moduleId.substr(0, pluginIndex) : moduleId;
                            var dirname = filename.split("/");
                            return dirname.pop(), dirname = dirname.join("/"), {
                                filename: stripOrigin(filename),
                                dirname: stripOrigin(dirname)
                            };
                        }
                    }));
                };
            }), /*
 * AMD Helper function module
 * Separated into its own file as this is the part needed for full AMD support in SFX builds
 * NB since implementations have now diverged this can be merged back with amd.js
 */
            hook("fetch", function(fetch) {
                return function(load) {
                    // script load implies define global leak
                    return load.metadata.scriptLoad && isBrowser && (__global.define = this.amdDefine), 
                    fetch.call(this, load);
                };
            }), hookConstructor(function(constructor) {
                return function() {
                    function getCJSDeps(source, requireIndex) {
                        // remove comments
                        source = source.replace(commentRegEx, "");
                        // determine the require alias
                        var params = source.match(fnBracketRegEx), requireAlias = (params[1].split(",")[requireIndex] || "require").replace(wsRegEx, ""), requireRegEx = requireRegExs[requireAlias] || (requireRegExs[requireAlias] = new RegExp(cjsRequirePre + requireAlias + cjsRequirePost, "g"));
                        requireRegEx.lastIndex = 0;
                        for (var match, deps = []; match = requireRegEx.exec(source); ) deps.push(match[2] || match[3]);
                        return deps;
                    }
                    /*
      AMD-compatible require
      To copy RequireJS, set window.require = window.requirejs = loader.amdRequire
    */
                    function require(names, callback, errback, referer) {
                        // in amd, first arg can be a config object... we just ignore
                        if ("object" == typeof names && !(names instanceof Array)) return require.apply(null, Array.prototype.splice.call(arguments, 1, arguments.length - 1));
                        if (// amd require
                        "string" == typeof names && "function" == typeof callback && (names = [ names ]), 
                        !(names instanceof Array)) {
                            if ("string" == typeof names) {
                                var defaultJSExtension = loader.defaultJSExtensions && ".js" != names.substr(names.length - 3, 3), normalized = loader.decanonicalize(names, referer);
                                defaultJSExtension && ".js" == normalized.substr(normalized.length - 3, 3) && (normalized = normalized.substr(0, normalized.length - 3));
                                var module = loader.get(normalized);
                                if (!module) throw new Error('Module not already loaded loading "' + names + '" as ' + normalized + (referer ? ' from "' + referer + '".' : "."));
                                return module.__useDefault ? module["default"] : module;
                            }
                            throw new TypeError("Invalid require");
                        }
                        for (var dynamicRequires = [], i = 0; i < names.length; i++) dynamicRequires.push(loader["import"](names[i], referer));
                        Promise.all(dynamicRequires).then(function(modules) {
                            callback && callback.apply(null, modules);
                        }, errback);
                    }
                    function define(name, deps, factory) {
                        function execute(req, exports, module) {
                            function contextualRequire(names, callback, errback) {
                                return "string" == typeof names && "function" != typeof callback ? req(names) : require.call(loader, names, callback, errback, module.id);
                            }
                            for (var depValues = [], i = 0; i < deps.length; i++) depValues.push(req(deps[i]));
                            module.uri = module.id, module.config = function() {}, // add back in system dependencies
                            -1 != moduleIndex && depValues.splice(moduleIndex, 0, module), -1 != exportsIndex && depValues.splice(exportsIndex, 0, exports), 
                            -1 != requireIndex && (contextualRequire.toUrl = function(name) {
                                // normalize without defaultJSExtensions
                                var defaultJSExtension = loader.defaultJSExtensions && ".js" != name.substr(name.length - 3, 3), url = loader.decanonicalize(name, module.id);
                                return defaultJSExtension && ".js" == url.substr(url.length - 3, 3) && (url = url.substr(0, url.length - 3)), 
                                url;
                            }, depValues.splice(requireIndex, 0, contextualRequire));
                            // set global require to AMD require
                            var curRequire = __global.require;
                            __global.require = require;
                            var output = factory.apply(-1 == exportsIndex ? __global : exports, depValues);
                            return __global.require = curRequire, "undefined" == typeof output && module && (output = module.exports), 
                            "undefined" != typeof output ? output : void 0;
                        }
                        "string" != typeof name && (factory = deps, deps = name, name = null), deps instanceof Array || (factory = deps, 
                        deps = [ "require", "exports", "module" ].splice(0, factory.length)), "function" != typeof factory && (factory = function(factory) {
                            return function() {
                                return factory;
                            };
                        }(factory)), // in IE8, a trailing comma becomes a trailing undefined entry
                        void 0 === deps[deps.length - 1] && deps.pop();
                        // remove system dependencies
                        var requireIndex, exportsIndex, moduleIndex;
                        -1 != (requireIndex = indexOf.call(deps, "require")) && (deps.splice(requireIndex, 1), 
                        // only trace cjs requires for non-named
                        // named defines assume the trace has already been done
                        name || (deps = deps.concat(getCJSDeps(factory.toString(), requireIndex)))), -1 != (exportsIndex = indexOf.call(deps, "exports")) && deps.splice(exportsIndex, 1), 
                        -1 != (moduleIndex = indexOf.call(deps, "module")) && deps.splice(moduleIndex, 1);
                        var entry = createEntry();
                        entry.name = name && (loader.decanonicalize || loader.normalize).call(loader, name), 
                        entry.deps = deps, entry.execute = execute, loader.pushRegister_({
                            amd: !0,
                            entry: entry
                        });
                    }
                    var loader = this;
                    constructor.call(this);
                    var commentRegEx = /(\/\*([\s\S]*?)\*\/|([^:]|^)\/\/(.*)$)/gm, cjsRequirePre = "(?:^|[^$_a-zA-Z\\xA0-\\uFFFF.])", cjsRequirePost = "\\s*\\(\\s*(\"([^\"]+)\"|'([^']+)')\\s*\\)", fnBracketRegEx = /\(([^\)]*)\)/, wsRegEx = /^\s+|\s+$/g, requireRegExs = {};
                    define.amd = {}, // reduction function to attach defines to a load record
                    hook("reduceRegister_", function(reduceRegister) {
                        return function(load, register) {
                            // only handle AMD registers here
                            if (!register || !register.amd) return reduceRegister.call(this, load, register);
                            var curMeta = load && load.metadata, entry = register.entry;
                            if (curMeta) if (curMeta.format && "detect" != curMeta.format) {
                                if (!entry.name && "amd" != curMeta.format) throw new Error("AMD define called while executing " + curMeta.format + " module " + load.name);
                            } else curMeta.format = "amd";
                            // anonymous define
                            if (entry.name) // if we don't have any other defines, 
                            // then let this be an anonymous define
                            // this is just to support single modules of the form:
                            // define('jquery')
                            // still loading anonymously
                            // because it is done widely enough to be useful
                            // as soon as there is more than one define, this gets removed though
                            curMeta && (curMeta.entry || curMeta.bundle ? curMeta.entry && curMeta.entry.name && (curMeta.entry = void 0) : curMeta.entry = entry, 
                            // note this is now a bundle
                            curMeta.bundle = !0), // define the module through the register registry
                            entry.name in this.defined || (this.defined[entry.name] = entry); else {
                                if (!curMeta) throw new TypeError("Unexpected anonymous AMD define.");
                                if (curMeta.entry && !curMeta.entry.name) throw new Error("Multiple anonymous defines in module " + load.name);
                                curMeta.entry = entry;
                            }
                        };
                    }), loader.amdDefine = define, loader.amdRequire = require;
                };
            }), /*
  SystemJS AMD Format
*/
            function() {
                // AMD Module Format Detection RegEx
                // define([.., .., ..], ...)
                // define(varName); || define(function(require, exports) {}); || define({})
                var amdRegEx = /(?:^\uFEFF?|[^$_a-zA-Z\xA0-\uFFFF.])define\s*\(\s*("[^"]+"\s*,\s*|'[^']+'\s*,\s*)?\s*(\[(\s*(("[^"]+"|'[^']+')\s*,|\/\/.*\r?\n|\/\*(.|\s)*?\*\/))*(\s*("[^"]+"|'[^']+')\s*,?)?(\s*(\/\/.*\r?\n|\/\*(.|\s)*?\*\/))*\s*\]|function\s*|{|[_$a-zA-Z\xA0-\uFFFF][_$a-zA-Z0-9\xA0-\uFFFF]*\))/;
                hook("instantiate", function(instantiate) {
                    return function(load) {
                        var loader = this;
                        if ("amd" == load.metadata.format || !load.metadata.format && load.source.match(amdRegEx)) if (load.metadata.format = "amd", 
                        loader.builder || loader.execute === !1) load.metadata.execute = function() {
                            return load.metadata.builderExecute.apply(this, arguments);
                        }; else {
                            var curDefine = __global.define;
                            __global.define = this.amdDefine;
                            try {
                                __exec.call(loader, load);
                            } finally {
                                __global.define = curDefine;
                            }
                            if (!load.metadata.entry && !load.metadata.bundle) throw new TypeError("AMD module " + load.name + " did not define");
                        }
                        return instantiate.call(loader, load);
                    };
                });
            }(), /*
  SystemJS Loader Plugin Support

  Supports plugin loader syntax with "!", or via metadata.loader

  The plugin name is loaded as a module itself, and can override standard loader hooks
  for the plugin resource. See the plugin section of the systemjs readme.
*/
            function() {
                function getParentName(loader, parentName) {
                    // if parent is a plugin, normalize against the parent plugin argument only
                    if (parentName) {
                        var parentPluginIndex;
                        if (loader.pluginFirst) {
                            if (-1 != (parentPluginIndex = parentName.lastIndexOf("!"))) return parentName.substr(parentPluginIndex + 1);
                        } else if (-1 != (parentPluginIndex = parentName.indexOf("!"))) return parentName.substr(0, parentPluginIndex);
                        return parentName;
                    }
                }
                function parsePlugin(loader, name) {
                    var argumentName, pluginName, pluginIndex = name.lastIndexOf("!");
                    return -1 != pluginIndex ? (loader.pluginFirst ? (argumentName = name.substr(pluginIndex + 1), 
                    pluginName = name.substr(0, pluginIndex)) : (argumentName = name.substr(0, pluginIndex), 
                    pluginName = name.substr(pluginIndex + 1) || argumentName.substr(argumentName.lastIndexOf(".") + 1)), 
                    {
                        argument: argumentName,
                        plugin: pluginName
                    }) : void 0;
                }
                // put name back together after parts have been normalized
                function combinePluginParts(loader, argumentName, pluginName, defaultExtension) {
                    return defaultExtension && ".js" == argumentName.substr(argumentName.length - 3, 3) && (argumentName = argumentName.substr(0, argumentName.length - 3)), 
                    loader.pluginFirst ? pluginName + "!" + argumentName : argumentName + "!" + pluginName;
                }
                // note if normalize will add a default js extension
                // if so, remove for backwards compat
                // this is strange and sucks, but will be deprecated
                function checkDefaultExtension(loader, arg) {
                    return loader.defaultJSExtensions && ".js" != arg.substr(arg.length - 3, 3);
                }
                function createNormalizeSync(normalizeSync) {
                    return function(name, parentName, isPlugin) {
                        var loader = this, parsed = parsePlugin(loader, name);
                        if (parentName = getParentName(this, parentName), !parsed) return normalizeSync.call(this, name, parentName, isPlugin);
                        // if this is a plugin, normalize the plugin name and the argument
                        var argumentName = loader.normalizeSync(parsed.argument, parentName, !0), pluginName = loader.normalizeSync(parsed.plugin, parentName, !0);
                        return combinePluginParts(loader, argumentName, pluginName, checkDefaultExtension(loader, parsed.argument));
                    };
                }
                hook("decanonicalize", createNormalizeSync), hook("normalizeSync", createNormalizeSync), 
                hook("normalize", function(normalize) {
                    return function(name, parentName, isPlugin) {
                        var loader = this;
                        parentName = getParentName(this, parentName);
                        var parsed = parsePlugin(loader, name);
                        return parsed ? Promise.all([ loader.normalize(parsed.argument, parentName, !0), loader.normalize(parsed.plugin, parentName, !1) ]).then(function(normalized) {
                            return combinePluginParts(loader, normalized[0], normalized[1], checkDefaultExtension(loader, parsed.argument));
                        }) : normalize.call(loader, name, parentName, isPlugin);
                    };
                }), hook("locate", function(locate) {
                    return function(load) {
                        var pluginSyntaxIndex, loader = this, name = load.name;
                        return loader.pluginFirst ? -1 != (pluginSyntaxIndex = name.indexOf("!")) && (load.metadata.loader = name.substr(0, pluginSyntaxIndex), 
                        load.name = name.substr(pluginSyntaxIndex + 1)) : -1 != (pluginSyntaxIndex = name.lastIndexOf("!")) && (load.metadata.loader = name.substr(pluginSyntaxIndex + 1), 
                        load.name = name.substr(0, pluginSyntaxIndex)), locate.call(loader, load).then(function(address) {
                            return -1 == pluginSyntaxIndex && load.metadata.loader ? (loader.pluginLoader || loader).normalize(load.metadata.loader, load.name).then(function(loaderNormalized) {
                                return load.metadata.loader = loaderNormalized, address;
                            }) : address;
                        }).then(function(address) {
                            var plugin = load.metadata.loader;
                            if (!plugin) return address;
                            // don't allow a plugin to load itself
                            if (load.name == plugin) throw new Error("Plugin " + plugin + " cannot load itself, make sure it is excluded from any wildcard meta configuration via a custom loader: false rule.");
                            // only fetch the plugin itself if this name isn't defined
                            if (loader.defined && loader.defined[name]) return address;
                            var pluginLoader = loader.pluginLoader || loader;
                            // load the plugin module and run standard locate
                            return pluginLoader["import"](plugin).then(function(loaderModule) {
                                // store the plugin module itself on the metadata
                                return load.metadata.loaderModule = loaderModule, load.address = address, loaderModule.locate ? loaderModule.locate.call(loader, load) : address;
                            });
                        });
                    };
                }), hook("fetch", function(fetch) {
                    return function(load) {
                        var loader = this;
                        return load.metadata.loaderModule && load.metadata.loaderModule.fetch && "defined" != load.metadata.format ? (load.metadata.scriptLoad = !1, 
                        load.metadata.loaderModule.fetch.call(loader, load, function(load) {
                            return fetch.call(loader, load);
                        })) : fetch.call(loader, load);
                    };
                }), hook("translate", function(translate) {
                    return function(load) {
                        var loader = this, args = arguments;
                        return load.metadata.loaderModule && load.metadata.loaderModule.translate && "defined" != load.metadata.format ? Promise.resolve(load.metadata.loaderModule.translate.apply(loader, args)).then(function(result) {
                            var sourceMap = load.metadata.sourceMap;
                            // sanitize sourceMap if an object not a JSON string
                            if (sourceMap) {
                                if ("object" != typeof sourceMap) throw new Error("load.metadata.sourceMap must be set to an object.");
                                var originalName = load.address.split("!")[0];
                                // force set the filename of the original file
                                sourceMap.file && sourceMap.file != load.address || (sourceMap.file = originalName + "!transpiled"), 
                                // force set the sources list if only one source
                                (!sourceMap.sources || sourceMap.sources.length <= 1 && (!sourceMap.sources[0] || sourceMap.sources[0] == load.address)) && (sourceMap.sources = [ originalName ]);
                            }
                            // if running on file:/// URLs, sourcesContent is necessary
                            // load.metadata.sourceMap.sourcesContent = [load.source];
                            return "string" == typeof result ? load.source = result : warn.call(this, "Plugin " + load.metadata.loader + " should return the source in translate, instead of setting load.source directly. This support will be deprecated."), 
                            translate.apply(loader, args);
                        }) : translate.apply(loader, args);
                    };
                }), hook("instantiate", function(instantiate) {
                    return function(load) {
                        var loader = this, calledInstantiate = !1;
                        return load.metadata.loaderModule && load.metadata.loaderModule.instantiate && !loader.builder && "defined" != load.metadata.format ? Promise.resolve(load.metadata.loaderModule.instantiate.call(loader, load, function(load) {
                            if (calledInstantiate) throw new Error("Instantiate must only be called once.");
                            return calledInstantiate = !0, instantiate.call(loader, load);
                        })).then(function(result) {
                            return calledInstantiate ? result : (load.metadata.entry = createEntry(), load.metadata.entry.execute = function() {
                                return result;
                            }, load.metadata.entry.deps = load.metadata.deps, load.metadata.format = "defined", 
                            instantiate.call(loader, load));
                        }) : instantiate.call(loader, load);
                    };
                });
            }();
            /*
 * Conditions Extension
 *
 *   Allows a condition module to alter the resolution of an import via syntax:
 *
 *     import $ from 'jquery/#{browser}';
 *
 *   Will first load the module 'browser' via `SystemJS.import('browser')` and 
 *   take the default export of that module.
 *   If the default export is not a string, an error is thrown.
 * 
 *   We then substitute the string into the require to get the conditional resolution
 *   enabling environment-specific variations like:
 * 
 *     import $ from 'jquery/ie'
 *     import $ from 'jquery/firefox'
 *     import $ from 'jquery/chrome'
 *     import $ from 'jquery/safari'
 *
 *   It can be useful for a condition module to define multiple conditions.
 *   This can be done via the `|` modifier to specify an export member expression:
 *
 *     import 'jquery/#{./browser.js|grade.version}'
 *
 *   Where the `grade` export `version` member in the `browser.js` module  is substituted.
 *
 *
 * Boolean Conditionals
 *
 *   For polyfill modules, that are used as imports but have no module value,
 *   a binary conditional allows a module not to be loaded at all if not needed:
 *
 *     import 'es5-shim#?./conditions.js|needs-es5shim'
 *
 *   These conditions can also be negated via:
 *     
 *     import 'es5-shim#?./conditions.js|~es6'
 *
 */
            var sysConditions = [ "browser", "node", "dev", "production", "default" ], interpolationRegEx = /#\{[^\}]+\}/;
            // normalizeSync does not parse conditionals at all although it could
            hook("normalize", function(normalize) {
                return function(name, parentName, skipExt) {
                    var loader = this;
                    return booleanConditional.call(loader, name, parentName).then(function(name) {
                        return normalize.call(loader, name, parentName, skipExt);
                    }).then(function(normalized) {
                        return interpolateConditional.call(loader, normalized, parentName);
                    });
                };
            }), /*
 * Alias Extension
 *
 * Allows a module to be a plain copy of another module by module name
 *
 * SystemJS.meta['mybootstrapalias'] = { alias: 'bootstrap' };
 *
 */
            function() {
                // aliases
                hook("fetch", function(fetch) {
                    return function(load) {
                        var alias = load.metadata.alias, aliasDeps = load.metadata.deps || [];
                        if (alias) {
                            load.metadata.format = "defined";
                            var entry = createEntry();
                            return this.defined[load.name] = entry, entry.declarative = !0, entry.deps = aliasDeps.concat([ alias ]), 
                            entry.declare = function(_export) {
                                return {
                                    setters: [ function(module) {
                                        for (var p in module) _export(p, module[p]);
                                        module.__useDefault && (entry.module.exports.__useDefault = !0);
                                    } ],
                                    execute: function() {}
                                };
                            }, "";
                        }
                        return fetch.call(this, load);
                    };
                });
            }(), /*
 * Meta Extension
 *
 * Sets default metadata on a load record (load.metadata) from
 * loader.metadata via SystemJS.meta function.
 *
 *
 * Also provides an inline meta syntax for module meta in source.
 *
 * Eg:
 *
 * loader.meta({
 *   'my/module': { deps: ['jquery'] }
 *   'my/*': { format: 'amd' }
 * });
 *
 * Which in turn populates loader.metadata.
 *
 * load.metadata.deps and load.metadata.format will then be set
 * for 'my/module'
 *
 * The same meta could be set with a my/module.js file containing:
 *
 * my/module.js
 *   "format amd";
 *   "deps[] jquery";
 *   "globals.some value"
 *   console.log('this is my/module');
 *
 * Configuration meta always takes preference to inline meta.
 *
 * Multiple matches in wildcards are supported and ammend the meta.
 *
 *
 * The benefits of the function form is that paths are URL-normalized
 * supporting say
 *
 * loader.meta({ './app': { format: 'cjs' } });
 *
 * Instead of needing to set against the absolute URL (https://site.com/app.js)
 *
 */
            function() {
                function setMetaProperty(target, p, value) {
                    for (var curPart, pParts = p.split("."); pParts.length > 1; ) curPart = pParts.shift(), 
                    target = target[curPart] = target[curPart] || {};
                    curPart = pParts.shift(), curPart in target || (target[curPart] = value);
                }
                hookConstructor(function(constructor) {
                    return function() {
                        this.meta = {}, constructor.call(this);
                    };
                }), hook("locate", function(locate) {
                    return function(load) {
                        var wildcardIndex, meta = this.meta, name = load.name, bestDepth = 0;
                        for (var module in meta) if (wildcardIndex = module.indexOf("*"), -1 !== wildcardIndex && module.substr(0, wildcardIndex) === name.substr(0, wildcardIndex) && module.substr(wildcardIndex + 1) === name.substr(name.length - module.length + wildcardIndex + 1)) {
                            var depth = module.split("/").length;
                            depth > bestDepth && (bestDepth = depth), extendMeta(load.metadata, meta[module], bestDepth != depth);
                        }
                        // apply exact meta
                        return meta[name] && extendMeta(load.metadata, meta[name]), locate.call(this, load);
                    };
                });
                // detect any meta header syntax
                // only set if not already set
                var metaRegEx = /^(\s*\/\*[^\*]*(\*(?!\/)[^\*]*)*\*\/|\s*\/\/[^\n]*|\s*"[^"]+"\s*;?|\s*'[^']+'\s*;?)+/, metaPartRegEx = /\/\*[^\*]*(\*(?!\/)[^\*]*)*\*\/|\/\/[^\n]*|"[^"]+"\s*;?|'[^']+'\s*;?/g;
                hook("translate", function(translate) {
                    return function(load) {
                        // shortpath for bundled
                        if ("defined" == load.metadata.format) return load.metadata.deps = load.metadata.deps || [], 
                        Promise.resolve(load.source);
                        // NB meta will be post-translate pending transpiler conversion to plugins
                        var meta = load.source.match(metaRegEx);
                        if (meta) for (var metaParts = meta[0].match(metaPartRegEx), i = 0; i < metaParts.length; i++) {
                            var curPart = metaParts[i], len = curPart.length, firstChar = curPart.substr(0, 1);
                            if (";" == curPart.substr(len - 1, 1) && len--, '"' == firstChar || "'" == firstChar) {
                                var metaString = curPart.substr(1, curPart.length - 3), metaName = metaString.substr(0, metaString.indexOf(" "));
                                if (metaName) {
                                    var metaValue = metaString.substr(metaName.length + 1, metaString.length - metaName.length - 1);
                                    "[]" == metaName.substr(metaName.length - 2, 2) ? (metaName = metaName.substr(0, metaName.length - 2), 
                                    load.metadata[metaName] = load.metadata[metaName] || [], load.metadata[metaName].push(metaValue)) : load.metadata[metaName] instanceof Array ? (// temporary backwards compat for previous "deps" syntax
                                    warn.call(this, "Module " + load.name + ' contains deprecated "deps ' + metaValue + '" meta syntax.\nThis should be updated to "deps[] ' + metaValue + '" for pushing to array meta.'), 
                                    load.metadata[metaName].push(metaValue)) : setMetaProperty(load.metadata, metaName, metaValue);
                                } else load.metadata[metaString] = !0;
                            }
                        }
                        return translate.apply(this, arguments);
                    };
                });
            }(), /*
  System bundles

  Allows a bundle module to be specified which will be dynamically 
  loaded before trying to load a given module.

  For example:
  SystemJS.bundles['mybundle'] = ['jquery', 'bootstrap/js/bootstrap']

  Will result in a load to "mybundle" whenever a load to "jquery"
  or "bootstrap/js/bootstrap" is made.

  In this way, the bundle becomes the request that provides the module
*/
            function() {
                // bundles support (just like RequireJS)
                // bundle name is module name of bundle itself
                // bundle is array of modules defined by the bundle
                // when a module in the bundle is requested, the bundle is loaded instead
                // of the form SystemJS.bundles['mybundle'] = ['jquery', 'bootstrap/js/bootstrap']
                hookConstructor(function(constructor) {
                    return function() {
                        constructor.call(this), this.bundles = {}, this._loader.loadedBundles = {};
                    };
                }), // assign bundle metadata for bundle loads
                hook("locate", function(locate) {
                    return function(load) {
                        var loader = this, matched = !1;
                        if (!(load.name in loader.defined)) for (var b in loader.bundles) {
                            for (var i = 0; i < loader.bundles[b].length; i++) {
                                var curModule = loader.bundles[b][i];
                                if (curModule == load.name) {
                                    matched = !0;
                                    break;
                                }
                                // wildcard in bundles does not include / boundaries
                                if (-1 != curModule.indexOf("*")) {
                                    var parts = curModule.split("*");
                                    if (2 != parts.length) {
                                        loader.bundles[b].splice(i--, 1);
                                        continue;
                                    }
                                    if (load.name.substring(0, parts[0].length) == parts[0] && load.name.substr(load.name.length - parts[1].length, parts[1].length) == parts[1] && -1 == load.name.substr(parts[0].length, load.name.length - parts[1].length - parts[0].length).indexOf("/")) {
                                        matched = !0;
                                        break;
                                    }
                                }
                            }
                            if (matched) return loader["import"](b).then(function() {
                                return locate.call(loader, load);
                            });
                        }
                        return locate.call(loader, load);
                    };
                });
            }(), /*
 * Dependency Tree Cache
 * 
 * Allows a build to pre-populate a dependency trace tree on the loader of 
 * the expected dependency tree, to be loaded upfront when requesting the
 * module, avoinding the n round trips latency of module loading, where 
 * n is the dependency tree depth.
 *
 * eg:
 * SystemJS.depCache = {
 *  'app': ['normalized', 'deps'],
 *  'normalized': ['another'],
 *  'deps': ['tree']
 * };
 * 
 * SystemJS.import('app') 
 * // simultaneously starts loading all of:
 * // 'normalized', 'deps', 'another', 'tree'
 * // before "app" source is even loaded
 *
 */
            function() {
                hookConstructor(function(constructor) {
                    return function() {
                        constructor.call(this), this.depCache = {};
                    };
                }), hook("locate", function(locate) {
                    return function(load) {
                        var loader = this, deps = loader.depCache[load.name];
                        if (deps) for (var i = 0; i < deps.length; i++) loader["import"](deps[i], load.name);
                        return locate.call(loader, load);
                    };
                });
            }(), System = new SystemJSLoader(), __global.SystemJS = System, System.version = "0.19.29 Standard", 
            "object" == typeof module && module.exports && "object" == typeof exports && (module.exports = System), 
            __global.System = System;
        }("undefined" != typeof self ? self : global);
    }
    // auto-load Promise polyfill if needed in the browser
    var doPolyfill = "undefined" == typeof Promise;
    // document.write
    if ("undefined" != typeof document) {
        var scripts = document.getElementsByTagName("script");
        if ($__curScript = scripts[scripts.length - 1], doPolyfill) {
            var curPath = $__curScript.src, basePath = curPath.substr(0, curPath.lastIndexOf("/") + 1);
            window.systemJSBootstrap = bootstrap, document.write('<script type="text/javascript" src="' + basePath + 'system-polyfills.js"></script>');
        } else bootstrap();
    } else if ("undefined" != typeof importScripts) {
        var basePath = "";
        try {
            throw new Error("_");
        } catch (e) {
            e.stack.replace(/(?:at|@).*(http.+):[\d]+:[\d]+/, function(m, url) {
                $__curScript = {
                    src: url
                }, basePath = url.replace(/\/[^\/]*$/, "/");
            });
        }
        doPolyfill && importScripts(basePath + "system-polyfills.js"), bootstrap();
    } else $__curScript = "undefined" != typeof __filename ? {
        src: __filename
    } : null, bootstrap();
}();