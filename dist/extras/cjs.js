(function (babel, SourceMapSupport) {
            babel = babel && babel.hasOwnProperty('default') ? babel['default'] : babel;
            SourceMapSupport = SourceMapSupport && SourceMapSupport.hasOwnProperty('default') ? SourceMapSupport['default'] : SourceMapSupport;

            var global$1 = typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {};

            var commonjsGlobal = typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

            function unwrapExports (x) {
            	return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x.default : x;
            }

            function createCommonjsModule(fn, module) {
            	return module = { exports: {} }, fn(module, module.exports), module.exports;
            }

            function getCjsExportFromNamespace (n) {
            	return n && n.default || n;
            }

            var lib = createCommonjsModule(function (module, exports) {

            Object.defineProperty(exports, "__esModule", {
              value: true
            });
            exports.declare = declare;

            function declare(builder) {
              return (api, options, dirname) => {
                if (!api.assertVersion) {
                  api = Object.assign(copyApiObject(api), {
                    assertVersion(range) {
                      throwVersionError(range, api.version);
                    }

                  });
                }

                return builder(api, options || {}, dirname);
              };
            }

            function copyApiObject(api) {
              let proto = null;

              if (typeof api.version === "string" && /^7\./.test(api.version)) {
                proto = Object.getPrototypeOf(api);

                if (proto && (!has(proto, "version") || !has(proto, "transform") || !has(proto, "template") || !has(proto, "types"))) {
                  proto = null;
                }
              }

              return Object.assign({}, proto, api);
            }

            function has(obj, key) {
              return Object.prototype.hasOwnProperty.call(obj, key);
            }

            function throwVersionError(range, version) {
              if (typeof range === "number") {
                if (!Number.isInteger(range)) {
                  throw new Error("Expected string or integer value.");
                }

                range = `^${range}.0.0-0`;
              }

              if (typeof range !== "string") {
                throw new Error("Expected string or integer value.");
              }

              const limit = Error.stackTraceLimit;

              if (typeof limit === "number" && limit < 25) {
                Error.stackTraceLimit = 25;
              }

              let err;

              if (version.slice(0, 2) === "7.") {
                err = new Error(`Requires Babel "^7.0.0-beta.41", but was loaded with "${version}". ` + `You'll need to update your @babel/core version.`);
              } else {
                err = new Error(`Requires Babel "${range}", but was loaded with "${version}". ` + `If you are sure you have a compatible version of @babel/core, ` + `it is likely that something in your build process is loading the ` + `wrong version. Inspect the stack trace of this error to look for ` + `the first entry that doesn't mention "@babel/core" or "babel-core" ` + `to see what is calling Babel.`);
              }

              if (typeof limit === "number") {
                Error.stackTraceLimit = limit;
              }

              throw Object.assign(err, {
                code: "BABEL_VERSION_UNSUPPORTED",
                version,
                range
              });
            }
            });

            unwrapExports(lib);
            var lib_1 = lib.declare;

            var lib$1 = createCommonjsModule(function (module, exports) {

            Object.defineProperty(exports, "__esModule", {
              value: true
            });
            exports.default = void 0;

            function _helperPluginUtils() {
              const data = lib;

              _helperPluginUtils = function () {
                return data;
              };

              return data;
            }

            var _default = (0, _helperPluginUtils().declare)(api => {
              api.assertVersion(7);
              return {
                name: "syntax-dynamic-import",

                manipulateOptions(opts, parserOpts) {
                  parserOpts.plugins.push("dynamicImport");
                }

              };
            });

            exports.default = _default;
            });

            var dynamicImportPlugin = unwrapExports(lib$1);

            var shallowEqual_1 = createCommonjsModule(function (module, exports) {

            Object.defineProperty(exports, "__esModule", {
              value: true
            });
            exports.default = shallowEqual;

            function shallowEqual(actual, expected) {
              const keys = Object.keys(expected);

              for (const key of keys) {
                if (actual[key] !== expected[key]) {
                  return false;
                }
              }

              return true;
            }
            });

            unwrapExports(shallowEqual_1);

            var generated = createCommonjsModule(function (module, exports) {

            Object.defineProperty(exports, "__esModule", {
              value: true
            });
            exports.isArrayExpression = isArrayExpression;
            exports.isAssignmentExpression = isAssignmentExpression;
            exports.isBinaryExpression = isBinaryExpression;
            exports.isInterpreterDirective = isInterpreterDirective;
            exports.isDirective = isDirective;
            exports.isDirectiveLiteral = isDirectiveLiteral;
            exports.isBlockStatement = isBlockStatement;
            exports.isBreakStatement = isBreakStatement;
            exports.isCallExpression = isCallExpression;
            exports.isCatchClause = isCatchClause;
            exports.isConditionalExpression = isConditionalExpression;
            exports.isContinueStatement = isContinueStatement;
            exports.isDebuggerStatement = isDebuggerStatement;
            exports.isDoWhileStatement = isDoWhileStatement;
            exports.isEmptyStatement = isEmptyStatement;
            exports.isExpressionStatement = isExpressionStatement;
            exports.isFile = isFile;
            exports.isForInStatement = isForInStatement;
            exports.isForStatement = isForStatement;
            exports.isFunctionDeclaration = isFunctionDeclaration;
            exports.isFunctionExpression = isFunctionExpression;
            exports.isIdentifier = isIdentifier;
            exports.isIfStatement = isIfStatement;
            exports.isLabeledStatement = isLabeledStatement;
            exports.isStringLiteral = isStringLiteral;
            exports.isNumericLiteral = isNumericLiteral;
            exports.isNullLiteral = isNullLiteral;
            exports.isBooleanLiteral = isBooleanLiteral;
            exports.isRegExpLiteral = isRegExpLiteral;
            exports.isLogicalExpression = isLogicalExpression;
            exports.isMemberExpression = isMemberExpression;
            exports.isNewExpression = isNewExpression;
            exports.isProgram = isProgram;
            exports.isObjectExpression = isObjectExpression;
            exports.isObjectMethod = isObjectMethod;
            exports.isObjectProperty = isObjectProperty;
            exports.isRestElement = isRestElement;
            exports.isReturnStatement = isReturnStatement;
            exports.isSequenceExpression = isSequenceExpression;
            exports.isSwitchCase = isSwitchCase;
            exports.isSwitchStatement = isSwitchStatement;
            exports.isThisExpression = isThisExpression;
            exports.isThrowStatement = isThrowStatement;
            exports.isTryStatement = isTryStatement;
            exports.isUnaryExpression = isUnaryExpression;
            exports.isUpdateExpression = isUpdateExpression;
            exports.isVariableDeclaration = isVariableDeclaration;
            exports.isVariableDeclarator = isVariableDeclarator;
            exports.isWhileStatement = isWhileStatement;
            exports.isWithStatement = isWithStatement;
            exports.isAssignmentPattern = isAssignmentPattern;
            exports.isArrayPattern = isArrayPattern;
            exports.isArrowFunctionExpression = isArrowFunctionExpression;
            exports.isClassBody = isClassBody;
            exports.isClassDeclaration = isClassDeclaration;
            exports.isClassExpression = isClassExpression;
            exports.isExportAllDeclaration = isExportAllDeclaration;
            exports.isExportDefaultDeclaration = isExportDefaultDeclaration;
            exports.isExportNamedDeclaration = isExportNamedDeclaration;
            exports.isExportSpecifier = isExportSpecifier;
            exports.isForOfStatement = isForOfStatement;
            exports.isImportDeclaration = isImportDeclaration;
            exports.isImportDefaultSpecifier = isImportDefaultSpecifier;
            exports.isImportNamespaceSpecifier = isImportNamespaceSpecifier;
            exports.isImportSpecifier = isImportSpecifier;
            exports.isMetaProperty = isMetaProperty;
            exports.isClassMethod = isClassMethod;
            exports.isObjectPattern = isObjectPattern;
            exports.isSpreadElement = isSpreadElement;
            exports.isSuper = isSuper;
            exports.isTaggedTemplateExpression = isTaggedTemplateExpression;
            exports.isTemplateElement = isTemplateElement;
            exports.isTemplateLiteral = isTemplateLiteral;
            exports.isYieldExpression = isYieldExpression;
            exports.isAnyTypeAnnotation = isAnyTypeAnnotation;
            exports.isArrayTypeAnnotation = isArrayTypeAnnotation;
            exports.isBooleanTypeAnnotation = isBooleanTypeAnnotation;
            exports.isBooleanLiteralTypeAnnotation = isBooleanLiteralTypeAnnotation;
            exports.isNullLiteralTypeAnnotation = isNullLiteralTypeAnnotation;
            exports.isClassImplements = isClassImplements;
            exports.isDeclareClass = isDeclareClass;
            exports.isDeclareFunction = isDeclareFunction;
            exports.isDeclareInterface = isDeclareInterface;
            exports.isDeclareModule = isDeclareModule;
            exports.isDeclareModuleExports = isDeclareModuleExports;
            exports.isDeclareTypeAlias = isDeclareTypeAlias;
            exports.isDeclareOpaqueType = isDeclareOpaqueType;
            exports.isDeclareVariable = isDeclareVariable;
            exports.isDeclareExportDeclaration = isDeclareExportDeclaration;
            exports.isDeclareExportAllDeclaration = isDeclareExportAllDeclaration;
            exports.isDeclaredPredicate = isDeclaredPredicate;
            exports.isExistsTypeAnnotation = isExistsTypeAnnotation;
            exports.isFunctionTypeAnnotation = isFunctionTypeAnnotation;
            exports.isFunctionTypeParam = isFunctionTypeParam;
            exports.isGenericTypeAnnotation = isGenericTypeAnnotation;
            exports.isInferredPredicate = isInferredPredicate;
            exports.isInterfaceExtends = isInterfaceExtends;
            exports.isInterfaceDeclaration = isInterfaceDeclaration;
            exports.isInterfaceTypeAnnotation = isInterfaceTypeAnnotation;
            exports.isIntersectionTypeAnnotation = isIntersectionTypeAnnotation;
            exports.isMixedTypeAnnotation = isMixedTypeAnnotation;
            exports.isEmptyTypeAnnotation = isEmptyTypeAnnotation;
            exports.isNullableTypeAnnotation = isNullableTypeAnnotation;
            exports.isNumberLiteralTypeAnnotation = isNumberLiteralTypeAnnotation;
            exports.isNumberTypeAnnotation = isNumberTypeAnnotation;
            exports.isObjectTypeAnnotation = isObjectTypeAnnotation;
            exports.isObjectTypeInternalSlot = isObjectTypeInternalSlot;
            exports.isObjectTypeCallProperty = isObjectTypeCallProperty;
            exports.isObjectTypeIndexer = isObjectTypeIndexer;
            exports.isObjectTypeProperty = isObjectTypeProperty;
            exports.isObjectTypeSpreadProperty = isObjectTypeSpreadProperty;
            exports.isOpaqueType = isOpaqueType;
            exports.isQualifiedTypeIdentifier = isQualifiedTypeIdentifier;
            exports.isStringLiteralTypeAnnotation = isStringLiteralTypeAnnotation;
            exports.isStringTypeAnnotation = isStringTypeAnnotation;
            exports.isThisTypeAnnotation = isThisTypeAnnotation;
            exports.isTupleTypeAnnotation = isTupleTypeAnnotation;
            exports.isTypeofTypeAnnotation = isTypeofTypeAnnotation;
            exports.isTypeAlias = isTypeAlias;
            exports.isTypeAnnotation = isTypeAnnotation;
            exports.isTypeCastExpression = isTypeCastExpression;
            exports.isTypeParameter = isTypeParameter;
            exports.isTypeParameterDeclaration = isTypeParameterDeclaration;
            exports.isTypeParameterInstantiation = isTypeParameterInstantiation;
            exports.isUnionTypeAnnotation = isUnionTypeAnnotation;
            exports.isVariance = isVariance;
            exports.isVoidTypeAnnotation = isVoidTypeAnnotation;
            exports.isJSXAttribute = isJSXAttribute;
            exports.isJSXClosingElement = isJSXClosingElement;
            exports.isJSXElement = isJSXElement;
            exports.isJSXEmptyExpression = isJSXEmptyExpression;
            exports.isJSXExpressionContainer = isJSXExpressionContainer;
            exports.isJSXSpreadChild = isJSXSpreadChild;
            exports.isJSXIdentifier = isJSXIdentifier;
            exports.isJSXMemberExpression = isJSXMemberExpression;
            exports.isJSXNamespacedName = isJSXNamespacedName;
            exports.isJSXOpeningElement = isJSXOpeningElement;
            exports.isJSXSpreadAttribute = isJSXSpreadAttribute;
            exports.isJSXText = isJSXText;
            exports.isJSXFragment = isJSXFragment;
            exports.isJSXOpeningFragment = isJSXOpeningFragment;
            exports.isJSXClosingFragment = isJSXClosingFragment;
            exports.isNoop = isNoop;
            exports.isParenthesizedExpression = isParenthesizedExpression;
            exports.isAwaitExpression = isAwaitExpression;
            exports.isBindExpression = isBindExpression;
            exports.isClassProperty = isClassProperty;
            exports.isOptionalMemberExpression = isOptionalMemberExpression;
            exports.isPipelineTopicExpression = isPipelineTopicExpression;
            exports.isPipelineBareFunction = isPipelineBareFunction;
            exports.isPipelinePrimaryTopicReference = isPipelinePrimaryTopicReference;
            exports.isOptionalCallExpression = isOptionalCallExpression;
            exports.isClassPrivateProperty = isClassPrivateProperty;
            exports.isClassPrivateMethod = isClassPrivateMethod;
            exports.isImport = isImport;
            exports.isDecorator = isDecorator;
            exports.isDoExpression = isDoExpression;
            exports.isExportDefaultSpecifier = isExportDefaultSpecifier;
            exports.isExportNamespaceSpecifier = isExportNamespaceSpecifier;
            exports.isPrivateName = isPrivateName;
            exports.isBigIntLiteral = isBigIntLiteral;
            exports.isTSParameterProperty = isTSParameterProperty;
            exports.isTSDeclareFunction = isTSDeclareFunction;
            exports.isTSDeclareMethod = isTSDeclareMethod;
            exports.isTSQualifiedName = isTSQualifiedName;
            exports.isTSCallSignatureDeclaration = isTSCallSignatureDeclaration;
            exports.isTSConstructSignatureDeclaration = isTSConstructSignatureDeclaration;
            exports.isTSPropertySignature = isTSPropertySignature;
            exports.isTSMethodSignature = isTSMethodSignature;
            exports.isTSIndexSignature = isTSIndexSignature;
            exports.isTSAnyKeyword = isTSAnyKeyword;
            exports.isTSUnknownKeyword = isTSUnknownKeyword;
            exports.isTSNumberKeyword = isTSNumberKeyword;
            exports.isTSObjectKeyword = isTSObjectKeyword;
            exports.isTSBooleanKeyword = isTSBooleanKeyword;
            exports.isTSStringKeyword = isTSStringKeyword;
            exports.isTSSymbolKeyword = isTSSymbolKeyword;
            exports.isTSVoidKeyword = isTSVoidKeyword;
            exports.isTSUndefinedKeyword = isTSUndefinedKeyword;
            exports.isTSNullKeyword = isTSNullKeyword;
            exports.isTSNeverKeyword = isTSNeverKeyword;
            exports.isTSThisType = isTSThisType;
            exports.isTSFunctionType = isTSFunctionType;
            exports.isTSConstructorType = isTSConstructorType;
            exports.isTSTypeReference = isTSTypeReference;
            exports.isTSTypePredicate = isTSTypePredicate;
            exports.isTSTypeQuery = isTSTypeQuery;
            exports.isTSTypeLiteral = isTSTypeLiteral;
            exports.isTSArrayType = isTSArrayType;
            exports.isTSTupleType = isTSTupleType;
            exports.isTSOptionalType = isTSOptionalType;
            exports.isTSRestType = isTSRestType;
            exports.isTSUnionType = isTSUnionType;
            exports.isTSIntersectionType = isTSIntersectionType;
            exports.isTSConditionalType = isTSConditionalType;
            exports.isTSInferType = isTSInferType;
            exports.isTSParenthesizedType = isTSParenthesizedType;
            exports.isTSTypeOperator = isTSTypeOperator;
            exports.isTSIndexedAccessType = isTSIndexedAccessType;
            exports.isTSMappedType = isTSMappedType;
            exports.isTSLiteralType = isTSLiteralType;
            exports.isTSExpressionWithTypeArguments = isTSExpressionWithTypeArguments;
            exports.isTSInterfaceDeclaration = isTSInterfaceDeclaration;
            exports.isTSInterfaceBody = isTSInterfaceBody;
            exports.isTSTypeAliasDeclaration = isTSTypeAliasDeclaration;
            exports.isTSAsExpression = isTSAsExpression;
            exports.isTSTypeAssertion = isTSTypeAssertion;
            exports.isTSEnumDeclaration = isTSEnumDeclaration;
            exports.isTSEnumMember = isTSEnumMember;
            exports.isTSModuleDeclaration = isTSModuleDeclaration;
            exports.isTSModuleBlock = isTSModuleBlock;
            exports.isTSImportType = isTSImportType;
            exports.isTSImportEqualsDeclaration = isTSImportEqualsDeclaration;
            exports.isTSExternalModuleReference = isTSExternalModuleReference;
            exports.isTSNonNullExpression = isTSNonNullExpression;
            exports.isTSExportAssignment = isTSExportAssignment;
            exports.isTSNamespaceExportDeclaration = isTSNamespaceExportDeclaration;
            exports.isTSTypeAnnotation = isTSTypeAnnotation;
            exports.isTSTypeParameterInstantiation = isTSTypeParameterInstantiation;
            exports.isTSTypeParameterDeclaration = isTSTypeParameterDeclaration;
            exports.isTSTypeParameter = isTSTypeParameter;
            exports.isExpression = isExpression;
            exports.isBinary = isBinary;
            exports.isScopable = isScopable;
            exports.isBlockParent = isBlockParent;
            exports.isBlock = isBlock;
            exports.isStatement = isStatement;
            exports.isTerminatorless = isTerminatorless;
            exports.isCompletionStatement = isCompletionStatement;
            exports.isConditional = isConditional;
            exports.isLoop = isLoop;
            exports.isWhile = isWhile;
            exports.isExpressionWrapper = isExpressionWrapper;
            exports.isFor = isFor;
            exports.isForXStatement = isForXStatement;
            exports.isFunction = isFunction;
            exports.isFunctionParent = isFunctionParent;
            exports.isPureish = isPureish;
            exports.isDeclaration = isDeclaration;
            exports.isPatternLike = isPatternLike;
            exports.isLVal = isLVal;
            exports.isTSEntityName = isTSEntityName;
            exports.isLiteral = isLiteral;
            exports.isImmutable = isImmutable;
            exports.isUserWhitespacable = isUserWhitespacable;
            exports.isMethod = isMethod;
            exports.isObjectMember = isObjectMember;
            exports.isProperty = isProperty;
            exports.isUnaryLike = isUnaryLike;
            exports.isPattern = isPattern;
            exports.isClass = isClass;
            exports.isModuleDeclaration = isModuleDeclaration;
            exports.isExportDeclaration = isExportDeclaration;
            exports.isModuleSpecifier = isModuleSpecifier;
            exports.isFlow = isFlow;
            exports.isFlowType = isFlowType;
            exports.isFlowBaseAnnotation = isFlowBaseAnnotation;
            exports.isFlowDeclaration = isFlowDeclaration;
            exports.isFlowPredicate = isFlowPredicate;
            exports.isJSX = isJSX;
            exports.isPrivate = isPrivate;
            exports.isTSTypeElement = isTSTypeElement;
            exports.isTSType = isTSType;
            exports.isNumberLiteral = isNumberLiteral;
            exports.isRegexLiteral = isRegexLiteral;
            exports.isRestProperty = isRestProperty;
            exports.isSpreadProperty = isSpreadProperty;

            var _shallowEqual = _interopRequireDefault(shallowEqual_1);

            function _interopRequireDefault(obj) {
              return obj && obj.__esModule ? obj : {
                default: obj
              };
            }

            function isArrayExpression(node, opts) {
              if (!node) return false;
              const nodeType = node.type;

              if (nodeType === "ArrayExpression") {
                if (typeof opts === "undefined") {
                  return true;
                } else {
                  return (0, _shallowEqual.default)(node, opts);
                }
              }

              return false;
            }

            function isAssignmentExpression(node, opts) {
              if (!node) return false;
              const nodeType = node.type;

              if (nodeType === "AssignmentExpression") {
                if (typeof opts === "undefined") {
                  return true;
                } else {
                  return (0, _shallowEqual.default)(node, opts);
                }
              }

              return false;
            }

            function isBinaryExpression(node, opts) {
              if (!node) return false;
              const nodeType = node.type;

              if (nodeType === "BinaryExpression") {
                if (typeof opts === "undefined") {
                  return true;
                } else {
                  return (0, _shallowEqual.default)(node, opts);
                }
              }

              return false;
            }

            function isInterpreterDirective(node, opts) {
              if (!node) return false;
              const nodeType = node.type;

              if (nodeType === "InterpreterDirective") {
                if (typeof opts === "undefined") {
                  return true;
                } else {
                  return (0, _shallowEqual.default)(node, opts);
                }
              }

              return false;
            }

            function isDirective(node, opts) {
              if (!node) return false;
              const nodeType = node.type;

              if (nodeType === "Directive") {
                if (typeof opts === "undefined") {
                  return true;
                } else {
                  return (0, _shallowEqual.default)(node, opts);
                }
              }

              return false;
            }

            function isDirectiveLiteral(node, opts) {
              if (!node) return false;
              const nodeType = node.type;

              if (nodeType === "DirectiveLiteral") {
                if (typeof opts === "undefined") {
                  return true;
                } else {
                  return (0, _shallowEqual.default)(node, opts);
                }
              }

              return false;
            }

            function isBlockStatement(node, opts) {
              if (!node) return false;
              const nodeType = node.type;

              if (nodeType === "BlockStatement") {
                if (typeof opts === "undefined") {
                  return true;
                } else {
                  return (0, _shallowEqual.default)(node, opts);
                }
              }

              return false;
            }

            function isBreakStatement(node, opts) {
              if (!node) return false;
              const nodeType = node.type;

              if (nodeType === "BreakStatement") {
                if (typeof opts === "undefined") {
                  return true;
                } else {
                  return (0, _shallowEqual.default)(node, opts);
                }
              }

              return false;
            }

            function isCallExpression(node, opts) {
              if (!node) return false;
              const nodeType = node.type;

              if (nodeType === "CallExpression") {
                if (typeof opts === "undefined") {
                  return true;
                } else {
                  return (0, _shallowEqual.default)(node, opts);
                }
              }

              return false;
            }

            function isCatchClause(node, opts) {
              if (!node) return false;
              const nodeType = node.type;

              if (nodeType === "CatchClause") {
                if (typeof opts === "undefined") {
                  return true;
                } else {
                  return (0, _shallowEqual.default)(node, opts);
                }
              }

              return false;
            }

            function isConditionalExpression(node, opts) {
              if (!node) return false;
              const nodeType = node.type;

              if (nodeType === "ConditionalExpression") {
                if (typeof opts === "undefined") {
                  return true;
                } else {
                  return (0, _shallowEqual.default)(node, opts);
                }
              }

              return false;
            }

            function isContinueStatement(node, opts) {
              if (!node) return false;
              const nodeType = node.type;

              if (nodeType === "ContinueStatement") {
                if (typeof opts === "undefined") {
                  return true;
                } else {
                  return (0, _shallowEqual.default)(node, opts);
                }
              }

              return false;
            }

            function isDebuggerStatement(node, opts) {
              if (!node) return false;
              const nodeType = node.type;

              if (nodeType === "DebuggerStatement") {
                if (typeof opts === "undefined") {
                  return true;
                } else {
                  return (0, _shallowEqual.default)(node, opts);
                }
              }

              return false;
            }

            function isDoWhileStatement(node, opts) {
              if (!node) return false;
              const nodeType = node.type;

              if (nodeType === "DoWhileStatement") {
                if (typeof opts === "undefined") {
                  return true;
                } else {
                  return (0, _shallowEqual.default)(node, opts);
                }
              }

              return false;
            }

            function isEmptyStatement(node, opts) {
              if (!node) return false;
              const nodeType = node.type;

              if (nodeType === "EmptyStatement") {
                if (typeof opts === "undefined") {
                  return true;
                } else {
                  return (0, _shallowEqual.default)(node, opts);
                }
              }

              return false;
            }

            function isExpressionStatement(node, opts) {
              if (!node) return false;
              const nodeType = node.type;

              if (nodeType === "ExpressionStatement") {
                if (typeof opts === "undefined") {
                  return true;
                } else {
                  return (0, _shallowEqual.default)(node, opts);
                }
              }

              return false;
            }

            function isFile(node, opts) {
              if (!node) return false;
              const nodeType = node.type;

              if (nodeType === "File") {
                if (typeof opts === "undefined") {
                  return true;
                } else {
                  return (0, _shallowEqual.default)(node, opts);
                }
              }

              return false;
            }

            function isForInStatement(node, opts) {
              if (!node) return false;
              const nodeType = node.type;

              if (nodeType === "ForInStatement") {
                if (typeof opts === "undefined") {
                  return true;
                } else {
                  return (0, _shallowEqual.default)(node, opts);
                }
              }

              return false;
            }

            function isForStatement(node, opts) {
              if (!node) return false;
              const nodeType = node.type;

              if (nodeType === "ForStatement") {
                if (typeof opts === "undefined") {
                  return true;
                } else {
                  return (0, _shallowEqual.default)(node, opts);
                }
              }

              return false;
            }

            function isFunctionDeclaration(node, opts) {
              if (!node) return false;
              const nodeType = node.type;

              if (nodeType === "FunctionDeclaration") {
                if (typeof opts === "undefined") {
                  return true;
                } else {
                  return (0, _shallowEqual.default)(node, opts);
                }
              }

              return false;
            }

            function isFunctionExpression(node, opts) {
              if (!node) return false;
              const nodeType = node.type;

              if (nodeType === "FunctionExpression") {
                if (typeof opts === "undefined") {
                  return true;
                } else {
                  return (0, _shallowEqual.default)(node, opts);
                }
              }

              return false;
            }

            function isIdentifier(node, opts) {
              if (!node) return false;
              const nodeType = node.type;

              if (nodeType === "Identifier") {
                if (typeof opts === "undefined") {
                  return true;
                } else {
                  return (0, _shallowEqual.default)(node, opts);
                }
              }

              return false;
            }

            function isIfStatement(node, opts) {
              if (!node) return false;
              const nodeType = node.type;

              if (nodeType === "IfStatement") {
                if (typeof opts === "undefined") {
                  return true;
                } else {
                  return (0, _shallowEqual.default)(node, opts);
                }
              }

              return false;
            }

            function isLabeledStatement(node, opts) {
              if (!node) return false;
              const nodeType = node.type;

              if (nodeType === "LabeledStatement") {
                if (typeof opts === "undefined") {
                  return true;
                } else {
                  return (0, _shallowEqual.default)(node, opts);
                }
              }

              return false;
            }

            function isStringLiteral(node, opts) {
              if (!node) return false;
              const nodeType = node.type;

              if (nodeType === "StringLiteral") {
                if (typeof opts === "undefined") {
                  return true;
                } else {
                  return (0, _shallowEqual.default)(node, opts);
                }
              }

              return false;
            }

            function isNumericLiteral(node, opts) {
              if (!node) return false;
              const nodeType = node.type;

              if (nodeType === "NumericLiteral") {
                if (typeof opts === "undefined") {
                  return true;
                } else {
                  return (0, _shallowEqual.default)(node, opts);
                }
              }

              return false;
            }

            function isNullLiteral(node, opts) {
              if (!node) return false;
              const nodeType = node.type;

              if (nodeType === "NullLiteral") {
                if (typeof opts === "undefined") {
                  return true;
                } else {
                  return (0, _shallowEqual.default)(node, opts);
                }
              }

              return false;
            }

            function isBooleanLiteral(node, opts) {
              if (!node) return false;
              const nodeType = node.type;

              if (nodeType === "BooleanLiteral") {
                if (typeof opts === "undefined") {
                  return true;
                } else {
                  return (0, _shallowEqual.default)(node, opts);
                }
              }

              return false;
            }

            function isRegExpLiteral(node, opts) {
              if (!node) return false;
              const nodeType = node.type;

              if (nodeType === "RegExpLiteral") {
                if (typeof opts === "undefined") {
                  return true;
                } else {
                  return (0, _shallowEqual.default)(node, opts);
                }
              }

              return false;
            }

            function isLogicalExpression(node, opts) {
              if (!node) return false;
              const nodeType = node.type;

              if (nodeType === "LogicalExpression") {
                if (typeof opts === "undefined") {
                  return true;
                } else {
                  return (0, _shallowEqual.default)(node, opts);
                }
              }

              return false;
            }

            function isMemberExpression(node, opts) {
              if (!node) return false;
              const nodeType = node.type;

              if (nodeType === "MemberExpression") {
                if (typeof opts === "undefined") {
                  return true;
                } else {
                  return (0, _shallowEqual.default)(node, opts);
                }
              }

              return false;
            }

            function isNewExpression(node, opts) {
              if (!node) return false;
              const nodeType = node.type;

              if (nodeType === "NewExpression") {
                if (typeof opts === "undefined") {
                  return true;
                } else {
                  return (0, _shallowEqual.default)(node, opts);
                }
              }

              return false;
            }

            function isProgram(node, opts) {
              if (!node) return false;
              const nodeType = node.type;

              if (nodeType === "Program") {
                if (typeof opts === "undefined") {
                  return true;
                } else {
                  return (0, _shallowEqual.default)(node, opts);
                }
              }

              return false;
            }

            function isObjectExpression(node, opts) {
              if (!node) return false;
              const nodeType = node.type;

              if (nodeType === "ObjectExpression") {
                if (typeof opts === "undefined") {
                  return true;
                } else {
                  return (0, _shallowEqual.default)(node, opts);
                }
              }

              return false;
            }

            function isObjectMethod(node, opts) {
              if (!node) return false;
              const nodeType = node.type;

              if (nodeType === "ObjectMethod") {
                if (typeof opts === "undefined") {
                  return true;
                } else {
                  return (0, _shallowEqual.default)(node, opts);
                }
              }

              return false;
            }

            function isObjectProperty(node, opts) {
              if (!node) return false;
              const nodeType = node.type;

              if (nodeType === "ObjectProperty") {
                if (typeof opts === "undefined") {
                  return true;
                } else {
                  return (0, _shallowEqual.default)(node, opts);
                }
              }

              return false;
            }

            function isRestElement(node, opts) {
              if (!node) return false;
              const nodeType = node.type;

              if (nodeType === "RestElement") {
                if (typeof opts === "undefined") {
                  return true;
                } else {
                  return (0, _shallowEqual.default)(node, opts);
                }
              }

              return false;
            }

            function isReturnStatement(node, opts) {
              if (!node) return false;
              const nodeType = node.type;

              if (nodeType === "ReturnStatement") {
                if (typeof opts === "undefined") {
                  return true;
                } else {
                  return (0, _shallowEqual.default)(node, opts);
                }
              }

              return false;
            }

            function isSequenceExpression(node, opts) {
              if (!node) return false;
              const nodeType = node.type;

              if (nodeType === "SequenceExpression") {
                if (typeof opts === "undefined") {
                  return true;
                } else {
                  return (0, _shallowEqual.default)(node, opts);
                }
              }

              return false;
            }

            function isSwitchCase(node, opts) {
              if (!node) return false;
              const nodeType = node.type;

              if (nodeType === "SwitchCase") {
                if (typeof opts === "undefined") {
                  return true;
                } else {
                  return (0, _shallowEqual.default)(node, opts);
                }
              }

              return false;
            }

            function isSwitchStatement(node, opts) {
              if (!node) return false;
              const nodeType = node.type;

              if (nodeType === "SwitchStatement") {
                if (typeof opts === "undefined") {
                  return true;
                } else {
                  return (0, _shallowEqual.default)(node, opts);
                }
              }

              return false;
            }

            function isThisExpression(node, opts) {
              if (!node) return false;
              const nodeType = node.type;

              if (nodeType === "ThisExpression") {
                if (typeof opts === "undefined") {
                  return true;
                } else {
                  return (0, _shallowEqual.default)(node, opts);
                }
              }

              return false;
            }

            function isThrowStatement(node, opts) {
              if (!node) return false;
              const nodeType = node.type;

              if (nodeType === "ThrowStatement") {
                if (typeof opts === "undefined") {
                  return true;
                } else {
                  return (0, _shallowEqual.default)(node, opts);
                }
              }

              return false;
            }

            function isTryStatement(node, opts) {
              if (!node) return false;
              const nodeType = node.type;

              if (nodeType === "TryStatement") {
                if (typeof opts === "undefined") {
                  return true;
                } else {
                  return (0, _shallowEqual.default)(node, opts);
                }
              }

              return false;
            }

            function isUnaryExpression(node, opts) {
              if (!node) return false;
              const nodeType = node.type;

              if (nodeType === "UnaryExpression") {
                if (typeof opts === "undefined") {
                  return true;
                } else {
                  return (0, _shallowEqual.default)(node, opts);
                }
              }

              return false;
            }

            function isUpdateExpression(node, opts) {
              if (!node) return false;
              const nodeType = node.type;

              if (nodeType === "UpdateExpression") {
                if (typeof opts === "undefined") {
                  return true;
                } else {
                  return (0, _shallowEqual.default)(node, opts);
                }
              }

              return false;
            }

            function isVariableDeclaration(node, opts) {
              if (!node) return false;
              const nodeType = node.type;

              if (nodeType === "VariableDeclaration") {
                if (typeof opts === "undefined") {
                  return true;
                } else {
                  return (0, _shallowEqual.default)(node, opts);
                }
              }

              return false;
            }

            function isVariableDeclarator(node, opts) {
              if (!node) return false;
              const nodeType = node.type;

              if (nodeType === "VariableDeclarator") {
                if (typeof opts === "undefined") {
                  return true;
                } else {
                  return (0, _shallowEqual.default)(node, opts);
                }
              }

              return false;
            }

            function isWhileStatement(node, opts) {
              if (!node) return false;
              const nodeType = node.type;

              if (nodeType === "WhileStatement") {
                if (typeof opts === "undefined") {
                  return true;
                } else {
                  return (0, _shallowEqual.default)(node, opts);
                }
              }

              return false;
            }

            function isWithStatement(node, opts) {
              if (!node) return false;
              const nodeType = node.type;

              if (nodeType === "WithStatement") {
                if (typeof opts === "undefined") {
                  return true;
                } else {
                  return (0, _shallowEqual.default)(node, opts);
                }
              }

              return false;
            }

            function isAssignmentPattern(node, opts) {
              if (!node) return false;
              const nodeType = node.type;

              if (nodeType === "AssignmentPattern") {
                if (typeof opts === "undefined") {
                  return true;
                } else {
                  return (0, _shallowEqual.default)(node, opts);
                }
              }

              return false;
            }

            function isArrayPattern(node, opts) {
              if (!node) return false;
              const nodeType = node.type;

              if (nodeType === "ArrayPattern") {
                if (typeof opts === "undefined") {
                  return true;
                } else {
                  return (0, _shallowEqual.default)(node, opts);
                }
              }

              return false;
            }

            function isArrowFunctionExpression(node, opts) {
              if (!node) return false;
              const nodeType = node.type;

              if (nodeType === "ArrowFunctionExpression") {
                if (typeof opts === "undefined") {
                  return true;
                } else {
                  return (0, _shallowEqual.default)(node, opts);
                }
              }

              return false;
            }

            function isClassBody(node, opts) {
              if (!node) return false;
              const nodeType = node.type;

              if (nodeType === "ClassBody") {
                if (typeof opts === "undefined") {
                  return true;
                } else {
                  return (0, _shallowEqual.default)(node, opts);
                }
              }

              return false;
            }

            function isClassDeclaration(node, opts) {
              if (!node) return false;
              const nodeType = node.type;

              if (nodeType === "ClassDeclaration") {
                if (typeof opts === "undefined") {
                  return true;
                } else {
                  return (0, _shallowEqual.default)(node, opts);
                }
              }

              return false;
            }

            function isClassExpression(node, opts) {
              if (!node) return false;
              const nodeType = node.type;

              if (nodeType === "ClassExpression") {
                if (typeof opts === "undefined") {
                  return true;
                } else {
                  return (0, _shallowEqual.default)(node, opts);
                }
              }

              return false;
            }

            function isExportAllDeclaration(node, opts) {
              if (!node) return false;
              const nodeType = node.type;

              if (nodeType === "ExportAllDeclaration") {
                if (typeof opts === "undefined") {
                  return true;
                } else {
                  return (0, _shallowEqual.default)(node, opts);
                }
              }

              return false;
            }

            function isExportDefaultDeclaration(node, opts) {
              if (!node) return false;
              const nodeType = node.type;

              if (nodeType === "ExportDefaultDeclaration") {
                if (typeof opts === "undefined") {
                  return true;
                } else {
                  return (0, _shallowEqual.default)(node, opts);
                }
              }

              return false;
            }

            function isExportNamedDeclaration(node, opts) {
              if (!node) return false;
              const nodeType = node.type;

              if (nodeType === "ExportNamedDeclaration") {
                if (typeof opts === "undefined") {
                  return true;
                } else {
                  return (0, _shallowEqual.default)(node, opts);
                }
              }

              return false;
            }

            function isExportSpecifier(node, opts) {
              if (!node) return false;
              const nodeType = node.type;

              if (nodeType === "ExportSpecifier") {
                if (typeof opts === "undefined") {
                  return true;
                } else {
                  return (0, _shallowEqual.default)(node, opts);
                }
              }

              return false;
            }

            function isForOfStatement(node, opts) {
              if (!node) return false;
              const nodeType = node.type;

              if (nodeType === "ForOfStatement") {
                if (typeof opts === "undefined") {
                  return true;
                } else {
                  return (0, _shallowEqual.default)(node, opts);
                }
              }

              return false;
            }

            function isImportDeclaration(node, opts) {
              if (!node) return false;
              const nodeType = node.type;

              if (nodeType === "ImportDeclaration") {
                if (typeof opts === "undefined") {
                  return true;
                } else {
                  return (0, _shallowEqual.default)(node, opts);
                }
              }

              return false;
            }

            function isImportDefaultSpecifier(node, opts) {
              if (!node) return false;
              const nodeType = node.type;

              if (nodeType === "ImportDefaultSpecifier") {
                if (typeof opts === "undefined") {
                  return true;
                } else {
                  return (0, _shallowEqual.default)(node, opts);
                }
              }

              return false;
            }

            function isImportNamespaceSpecifier(node, opts) {
              if (!node) return false;
              const nodeType = node.type;

              if (nodeType === "ImportNamespaceSpecifier") {
                if (typeof opts === "undefined") {
                  return true;
                } else {
                  return (0, _shallowEqual.default)(node, opts);
                }
              }

              return false;
            }

            function isImportSpecifier(node, opts) {
              if (!node) return false;
              const nodeType = node.type;

              if (nodeType === "ImportSpecifier") {
                if (typeof opts === "undefined") {
                  return true;
                } else {
                  return (0, _shallowEqual.default)(node, opts);
                }
              }

              return false;
            }

            function isMetaProperty(node, opts) {
              if (!node) return false;
              const nodeType = node.type;

              if (nodeType === "MetaProperty") {
                if (typeof opts === "undefined") {
                  return true;
                } else {
                  return (0, _shallowEqual.default)(node, opts);
                }
              }

              return false;
            }

            function isClassMethod(node, opts) {
              if (!node) return false;
              const nodeType = node.type;

              if (nodeType === "ClassMethod") {
                if (typeof opts === "undefined") {
                  return true;
                } else {
                  return (0, _shallowEqual.default)(node, opts);
                }
              }

              return false;
            }

            function isObjectPattern(node, opts) {
              if (!node) return false;
              const nodeType = node.type;

              if (nodeType === "ObjectPattern") {
                if (typeof opts === "undefined") {
                  return true;
                } else {
                  return (0, _shallowEqual.default)(node, opts);
                }
              }

              return false;
            }

            function isSpreadElement(node, opts) {
              if (!node) return false;
              const nodeType = node.type;

              if (nodeType === "SpreadElement") {
                if (typeof opts === "undefined") {
                  return true;
                } else {
                  return (0, _shallowEqual.default)(node, opts);
                }
              }

              return false;
            }

            function isSuper(node, opts) {
              if (!node) return false;
              const nodeType = node.type;

              if (nodeType === "Super") {
                if (typeof opts === "undefined") {
                  return true;
                } else {
                  return (0, _shallowEqual.default)(node, opts);
                }
              }

              return false;
            }

            function isTaggedTemplateExpression(node, opts) {
              if (!node) return false;
              const nodeType = node.type;

              if (nodeType === "TaggedTemplateExpression") {
                if (typeof opts === "undefined") {
                  return true;
                } else {
                  return (0, _shallowEqual.default)(node, opts);
                }
              }

              return false;
            }

            function isTemplateElement(node, opts) {
              if (!node) return false;
              const nodeType = node.type;

              if (nodeType === "TemplateElement") {
                if (typeof opts === "undefined") {
                  return true;
                } else {
                  return (0, _shallowEqual.default)(node, opts);
                }
              }

              return false;
            }

            function isTemplateLiteral(node, opts) {
              if (!node) return false;
              const nodeType = node.type;

              if (nodeType === "TemplateLiteral") {
                if (typeof opts === "undefined") {
                  return true;
                } else {
                  return (0, _shallowEqual.default)(node, opts);
                }
              }

              return false;
            }

            function isYieldExpression(node, opts) {
              if (!node) return false;
              const nodeType = node.type;

              if (nodeType === "YieldExpression") {
                if (typeof opts === "undefined") {
                  return true;
                } else {
                  return (0, _shallowEqual.default)(node, opts);
                }
              }

              return false;
            }

            function isAnyTypeAnnotation(node, opts) {
              if (!node) return false;
              const nodeType = node.type;

              if (nodeType === "AnyTypeAnnotation") {
                if (typeof opts === "undefined") {
                  return true;
                } else {
                  return (0, _shallowEqual.default)(node, opts);
                }
              }

              return false;
            }

            function isArrayTypeAnnotation(node, opts) {
              if (!node) return false;
              const nodeType = node.type;

              if (nodeType === "ArrayTypeAnnotation") {
                if (typeof opts === "undefined") {
                  return true;
                } else {
                  return (0, _shallowEqual.default)(node, opts);
                }
              }

              return false;
            }

            function isBooleanTypeAnnotation(node, opts) {
              if (!node) return false;
              const nodeType = node.type;

              if (nodeType === "BooleanTypeAnnotation") {
                if (typeof opts === "undefined") {
                  return true;
                } else {
                  return (0, _shallowEqual.default)(node, opts);
                }
              }

              return false;
            }

            function isBooleanLiteralTypeAnnotation(node, opts) {
              if (!node) return false;
              const nodeType = node.type;

              if (nodeType === "BooleanLiteralTypeAnnotation") {
                if (typeof opts === "undefined") {
                  return true;
                } else {
                  return (0, _shallowEqual.default)(node, opts);
                }
              }

              return false;
            }

            function isNullLiteralTypeAnnotation(node, opts) {
              if (!node) return false;
              const nodeType = node.type;

              if (nodeType === "NullLiteralTypeAnnotation") {
                if (typeof opts === "undefined") {
                  return true;
                } else {
                  return (0, _shallowEqual.default)(node, opts);
                }
              }

              return false;
            }

            function isClassImplements(node, opts) {
              if (!node) return false;
              const nodeType = node.type;

              if (nodeType === "ClassImplements") {
                if (typeof opts === "undefined") {
                  return true;
                } else {
                  return (0, _shallowEqual.default)(node, opts);
                }
              }

              return false;
            }

            function isDeclareClass(node, opts) {
              if (!node) return false;
              const nodeType = node.type;

              if (nodeType === "DeclareClass") {
                if (typeof opts === "undefined") {
                  return true;
                } else {
                  return (0, _shallowEqual.default)(node, opts);
                }
              }

              return false;
            }

            function isDeclareFunction(node, opts) {
              if (!node) return false;
              const nodeType = node.type;

              if (nodeType === "DeclareFunction") {
                if (typeof opts === "undefined") {
                  return true;
                } else {
                  return (0, _shallowEqual.default)(node, opts);
                }
              }

              return false;
            }

            function isDeclareInterface(node, opts) {
              if (!node) return false;
              const nodeType = node.type;

              if (nodeType === "DeclareInterface") {
                if (typeof opts === "undefined") {
                  return true;
                } else {
                  return (0, _shallowEqual.default)(node, opts);
                }
              }

              return false;
            }

            function isDeclareModule(node, opts) {
              if (!node) return false;
              const nodeType = node.type;

              if (nodeType === "DeclareModule") {
                if (typeof opts === "undefined") {
                  return true;
                } else {
                  return (0, _shallowEqual.default)(node, opts);
                }
              }

              return false;
            }

            function isDeclareModuleExports(node, opts) {
              if (!node) return false;
              const nodeType = node.type;

              if (nodeType === "DeclareModuleExports") {
                if (typeof opts === "undefined") {
                  return true;
                } else {
                  return (0, _shallowEqual.default)(node, opts);
                }
              }

              return false;
            }

            function isDeclareTypeAlias(node, opts) {
              if (!node) return false;
              const nodeType = node.type;

              if (nodeType === "DeclareTypeAlias") {
                if (typeof opts === "undefined") {
                  return true;
                } else {
                  return (0, _shallowEqual.default)(node, opts);
                }
              }

              return false;
            }

            function isDeclareOpaqueType(node, opts) {
              if (!node) return false;
              const nodeType = node.type;

              if (nodeType === "DeclareOpaqueType") {
                if (typeof opts === "undefined") {
                  return true;
                } else {
                  return (0, _shallowEqual.default)(node, opts);
                }
              }

              return false;
            }

            function isDeclareVariable(node, opts) {
              if (!node) return false;
              const nodeType = node.type;

              if (nodeType === "DeclareVariable") {
                if (typeof opts === "undefined") {
                  return true;
                } else {
                  return (0, _shallowEqual.default)(node, opts);
                }
              }

              return false;
            }

            function isDeclareExportDeclaration(node, opts) {
              if (!node) return false;
              const nodeType = node.type;

              if (nodeType === "DeclareExportDeclaration") {
                if (typeof opts === "undefined") {
                  return true;
                } else {
                  return (0, _shallowEqual.default)(node, opts);
                }
              }

              return false;
            }

            function isDeclareExportAllDeclaration(node, opts) {
              if (!node) return false;
              const nodeType = node.type;

              if (nodeType === "DeclareExportAllDeclaration") {
                if (typeof opts === "undefined") {
                  return true;
                } else {
                  return (0, _shallowEqual.default)(node, opts);
                }
              }

              return false;
            }

            function isDeclaredPredicate(node, opts) {
              if (!node) return false;
              const nodeType = node.type;

              if (nodeType === "DeclaredPredicate") {
                if (typeof opts === "undefined") {
                  return true;
                } else {
                  return (0, _shallowEqual.default)(node, opts);
                }
              }

              return false;
            }

            function isExistsTypeAnnotation(node, opts) {
              if (!node) return false;
              const nodeType = node.type;

              if (nodeType === "ExistsTypeAnnotation") {
                if (typeof opts === "undefined") {
                  return true;
                } else {
                  return (0, _shallowEqual.default)(node, opts);
                }
              }

              return false;
            }

            function isFunctionTypeAnnotation(node, opts) {
              if (!node) return false;
              const nodeType = node.type;

              if (nodeType === "FunctionTypeAnnotation") {
                if (typeof opts === "undefined") {
                  return true;
                } else {
                  return (0, _shallowEqual.default)(node, opts);
                }
              }

              return false;
            }

            function isFunctionTypeParam(node, opts) {
              if (!node) return false;
              const nodeType = node.type;

              if (nodeType === "FunctionTypeParam") {
                if (typeof opts === "undefined") {
                  return true;
                } else {
                  return (0, _shallowEqual.default)(node, opts);
                }
              }

              return false;
            }

            function isGenericTypeAnnotation(node, opts) {
              if (!node) return false;
              const nodeType = node.type;

              if (nodeType === "GenericTypeAnnotation") {
                if (typeof opts === "undefined") {
                  return true;
                } else {
                  return (0, _shallowEqual.default)(node, opts);
                }
              }

              return false;
            }

            function isInferredPredicate(node, opts) {
              if (!node) return false;
              const nodeType = node.type;

              if (nodeType === "InferredPredicate") {
                if (typeof opts === "undefined") {
                  return true;
                } else {
                  return (0, _shallowEqual.default)(node, opts);
                }
              }

              return false;
            }

            function isInterfaceExtends(node, opts) {
              if (!node) return false;
              const nodeType = node.type;

              if (nodeType === "InterfaceExtends") {
                if (typeof opts === "undefined") {
                  return true;
                } else {
                  return (0, _shallowEqual.default)(node, opts);
                }
              }

              return false;
            }

            function isInterfaceDeclaration(node, opts) {
              if (!node) return false;
              const nodeType = node.type;

              if (nodeType === "InterfaceDeclaration") {
                if (typeof opts === "undefined") {
                  return true;
                } else {
                  return (0, _shallowEqual.default)(node, opts);
                }
              }

              return false;
            }

            function isInterfaceTypeAnnotation(node, opts) {
              if (!node) return false;
              const nodeType = node.type;

              if (nodeType === "InterfaceTypeAnnotation") {
                if (typeof opts === "undefined") {
                  return true;
                } else {
                  return (0, _shallowEqual.default)(node, opts);
                }
              }

              return false;
            }

            function isIntersectionTypeAnnotation(node, opts) {
              if (!node) return false;
              const nodeType = node.type;

              if (nodeType === "IntersectionTypeAnnotation") {
                if (typeof opts === "undefined") {
                  return true;
                } else {
                  return (0, _shallowEqual.default)(node, opts);
                }
              }

              return false;
            }

            function isMixedTypeAnnotation(node, opts) {
              if (!node) return false;
              const nodeType = node.type;

              if (nodeType === "MixedTypeAnnotation") {
                if (typeof opts === "undefined") {
                  return true;
                } else {
                  return (0, _shallowEqual.default)(node, opts);
                }
              }

              return false;
            }

            function isEmptyTypeAnnotation(node, opts) {
              if (!node) return false;
              const nodeType = node.type;

              if (nodeType === "EmptyTypeAnnotation") {
                if (typeof opts === "undefined") {
                  return true;
                } else {
                  return (0, _shallowEqual.default)(node, opts);
                }
              }

              return false;
            }

            function isNullableTypeAnnotation(node, opts) {
              if (!node) return false;
              const nodeType = node.type;

              if (nodeType === "NullableTypeAnnotation") {
                if (typeof opts === "undefined") {
                  return true;
                } else {
                  return (0, _shallowEqual.default)(node, opts);
                }
              }

              return false;
            }

            function isNumberLiteralTypeAnnotation(node, opts) {
              if (!node) return false;
              const nodeType = node.type;

              if (nodeType === "NumberLiteralTypeAnnotation") {
                if (typeof opts === "undefined") {
                  return true;
                } else {
                  return (0, _shallowEqual.default)(node, opts);
                }
              }

              return false;
            }

            function isNumberTypeAnnotation(node, opts) {
              if (!node) return false;
              const nodeType = node.type;

              if (nodeType === "NumberTypeAnnotation") {
                if (typeof opts === "undefined") {
                  return true;
                } else {
                  return (0, _shallowEqual.default)(node, opts);
                }
              }

              return false;
            }

            function isObjectTypeAnnotation(node, opts) {
              if (!node) return false;
              const nodeType = node.type;

              if (nodeType === "ObjectTypeAnnotation") {
                if (typeof opts === "undefined") {
                  return true;
                } else {
                  return (0, _shallowEqual.default)(node, opts);
                }
              }

              return false;
            }

            function isObjectTypeInternalSlot(node, opts) {
              if (!node) return false;
              const nodeType = node.type;

              if (nodeType === "ObjectTypeInternalSlot") {
                if (typeof opts === "undefined") {
                  return true;
                } else {
                  return (0, _shallowEqual.default)(node, opts);
                }
              }

              return false;
            }

            function isObjectTypeCallProperty(node, opts) {
              if (!node) return false;
              const nodeType = node.type;

              if (nodeType === "ObjectTypeCallProperty") {
                if (typeof opts === "undefined") {
                  return true;
                } else {
                  return (0, _shallowEqual.default)(node, opts);
                }
              }

              return false;
            }

            function isObjectTypeIndexer(node, opts) {
              if (!node) return false;
              const nodeType = node.type;

              if (nodeType === "ObjectTypeIndexer") {
                if (typeof opts === "undefined") {
                  return true;
                } else {
                  return (0, _shallowEqual.default)(node, opts);
                }
              }

              return false;
            }

            function isObjectTypeProperty(node, opts) {
              if (!node) return false;
              const nodeType = node.type;

              if (nodeType === "ObjectTypeProperty") {
                if (typeof opts === "undefined") {
                  return true;
                } else {
                  return (0, _shallowEqual.default)(node, opts);
                }
              }

              return false;
            }

            function isObjectTypeSpreadProperty(node, opts) {
              if (!node) return false;
              const nodeType = node.type;

              if (nodeType === "ObjectTypeSpreadProperty") {
                if (typeof opts === "undefined") {
                  return true;
                } else {
                  return (0, _shallowEqual.default)(node, opts);
                }
              }

              return false;
            }

            function isOpaqueType(node, opts) {
              if (!node) return false;
              const nodeType = node.type;

              if (nodeType === "OpaqueType") {
                if (typeof opts === "undefined") {
                  return true;
                } else {
                  return (0, _shallowEqual.default)(node, opts);
                }
              }

              return false;
            }

            function isQualifiedTypeIdentifier(node, opts) {
              if (!node) return false;
              const nodeType = node.type;

              if (nodeType === "QualifiedTypeIdentifier") {
                if (typeof opts === "undefined") {
                  return true;
                } else {
                  return (0, _shallowEqual.default)(node, opts);
                }
              }

              return false;
            }

            function isStringLiteralTypeAnnotation(node, opts) {
              if (!node) return false;
              const nodeType = node.type;

              if (nodeType === "StringLiteralTypeAnnotation") {
                if (typeof opts === "undefined") {
                  return true;
                } else {
                  return (0, _shallowEqual.default)(node, opts);
                }
              }

              return false;
            }

            function isStringTypeAnnotation(node, opts) {
              if (!node) return false;
              const nodeType = node.type;

              if (nodeType === "StringTypeAnnotation") {
                if (typeof opts === "undefined") {
                  return true;
                } else {
                  return (0, _shallowEqual.default)(node, opts);
                }
              }

              return false;
            }

            function isThisTypeAnnotation(node, opts) {
              if (!node) return false;
              const nodeType = node.type;

              if (nodeType === "ThisTypeAnnotation") {
                if (typeof opts === "undefined") {
                  return true;
                } else {
                  return (0, _shallowEqual.default)(node, opts);
                }
              }

              return false;
            }

            function isTupleTypeAnnotation(node, opts) {
              if (!node) return false;
              const nodeType = node.type;

              if (nodeType === "TupleTypeAnnotation") {
                if (typeof opts === "undefined") {
                  return true;
                } else {
                  return (0, _shallowEqual.default)(node, opts);
                }
              }

              return false;
            }

            function isTypeofTypeAnnotation(node, opts) {
              if (!node) return false;
              const nodeType = node.type;

              if (nodeType === "TypeofTypeAnnotation") {
                if (typeof opts === "undefined") {
                  return true;
                } else {
                  return (0, _shallowEqual.default)(node, opts);
                }
              }

              return false;
            }

            function isTypeAlias(node, opts) {
              if (!node) return false;
              const nodeType = node.type;

              if (nodeType === "TypeAlias") {
                if (typeof opts === "undefined") {
                  return true;
                } else {
                  return (0, _shallowEqual.default)(node, opts);
                }
              }

              return false;
            }

            function isTypeAnnotation(node, opts) {
              if (!node) return false;
              const nodeType = node.type;

              if (nodeType === "TypeAnnotation") {
                if (typeof opts === "undefined") {
                  return true;
                } else {
                  return (0, _shallowEqual.default)(node, opts);
                }
              }

              return false;
            }

            function isTypeCastExpression(node, opts) {
              if (!node) return false;
              const nodeType = node.type;

              if (nodeType === "TypeCastExpression") {
                if (typeof opts === "undefined") {
                  return true;
                } else {
                  return (0, _shallowEqual.default)(node, opts);
                }
              }

              return false;
            }

            function isTypeParameter(node, opts) {
              if (!node) return false;
              const nodeType = node.type;

              if (nodeType === "TypeParameter") {
                if (typeof opts === "undefined") {
                  return true;
                } else {
                  return (0, _shallowEqual.default)(node, opts);
                }
              }

              return false;
            }

            function isTypeParameterDeclaration(node, opts) {
              if (!node) return false;
              const nodeType = node.type;

              if (nodeType === "TypeParameterDeclaration") {
                if (typeof opts === "undefined") {
                  return true;
                } else {
                  return (0, _shallowEqual.default)(node, opts);
                }
              }

              return false;
            }

            function isTypeParameterInstantiation(node, opts) {
              if (!node) return false;
              const nodeType = node.type;

              if (nodeType === "TypeParameterInstantiation") {
                if (typeof opts === "undefined") {
                  return true;
                } else {
                  return (0, _shallowEqual.default)(node, opts);
                }
              }

              return false;
            }

            function isUnionTypeAnnotation(node, opts) {
              if (!node) return false;
              const nodeType = node.type;

              if (nodeType === "UnionTypeAnnotation") {
                if (typeof opts === "undefined") {
                  return true;
                } else {
                  return (0, _shallowEqual.default)(node, opts);
                }
              }

              return false;
            }

            function isVariance(node, opts) {
              if (!node) return false;
              const nodeType = node.type;

              if (nodeType === "Variance") {
                if (typeof opts === "undefined") {
                  return true;
                } else {
                  return (0, _shallowEqual.default)(node, opts);
                }
              }

              return false;
            }

            function isVoidTypeAnnotation(node, opts) {
              if (!node) return false;
              const nodeType = node.type;

              if (nodeType === "VoidTypeAnnotation") {
                if (typeof opts === "undefined") {
                  return true;
                } else {
                  return (0, _shallowEqual.default)(node, opts);
                }
              }

              return false;
            }

            function isJSXAttribute(node, opts) {
              if (!node) return false;
              const nodeType = node.type;

              if (nodeType === "JSXAttribute") {
                if (typeof opts === "undefined") {
                  return true;
                } else {
                  return (0, _shallowEqual.default)(node, opts);
                }
              }

              return false;
            }

            function isJSXClosingElement(node, opts) {
              if (!node) return false;
              const nodeType = node.type;

              if (nodeType === "JSXClosingElement") {
                if (typeof opts === "undefined") {
                  return true;
                } else {
                  return (0, _shallowEqual.default)(node, opts);
                }
              }

              return false;
            }

            function isJSXElement(node, opts) {
              if (!node) return false;
              const nodeType = node.type;

              if (nodeType === "JSXElement") {
                if (typeof opts === "undefined") {
                  return true;
                } else {
                  return (0, _shallowEqual.default)(node, opts);
                }
              }

              return false;
            }

            function isJSXEmptyExpression(node, opts) {
              if (!node) return false;
              const nodeType = node.type;

              if (nodeType === "JSXEmptyExpression") {
                if (typeof opts === "undefined") {
                  return true;
                } else {
                  return (0, _shallowEqual.default)(node, opts);
                }
              }

              return false;
            }

            function isJSXExpressionContainer(node, opts) {
              if (!node) return false;
              const nodeType = node.type;

              if (nodeType === "JSXExpressionContainer") {
                if (typeof opts === "undefined") {
                  return true;
                } else {
                  return (0, _shallowEqual.default)(node, opts);
                }
              }

              return false;
            }

            function isJSXSpreadChild(node, opts) {
              if (!node) return false;
              const nodeType = node.type;

              if (nodeType === "JSXSpreadChild") {
                if (typeof opts === "undefined") {
                  return true;
                } else {
                  return (0, _shallowEqual.default)(node, opts);
                }
              }

              return false;
            }

            function isJSXIdentifier(node, opts) {
              if (!node) return false;
              const nodeType = node.type;

              if (nodeType === "JSXIdentifier") {
                if (typeof opts === "undefined") {
                  return true;
                } else {
                  return (0, _shallowEqual.default)(node, opts);
                }
              }

              return false;
            }

            function isJSXMemberExpression(node, opts) {
              if (!node) return false;
              const nodeType = node.type;

              if (nodeType === "JSXMemberExpression") {
                if (typeof opts === "undefined") {
                  return true;
                } else {
                  return (0, _shallowEqual.default)(node, opts);
                }
              }

              return false;
            }

            function isJSXNamespacedName(node, opts) {
              if (!node) return false;
              const nodeType = node.type;

              if (nodeType === "JSXNamespacedName") {
                if (typeof opts === "undefined") {
                  return true;
                } else {
                  return (0, _shallowEqual.default)(node, opts);
                }
              }

              return false;
            }

            function isJSXOpeningElement(node, opts) {
              if (!node) return false;
              const nodeType = node.type;

              if (nodeType === "JSXOpeningElement") {
                if (typeof opts === "undefined") {
                  return true;
                } else {
                  return (0, _shallowEqual.default)(node, opts);
                }
              }

              return false;
            }

            function isJSXSpreadAttribute(node, opts) {
              if (!node) return false;
              const nodeType = node.type;

              if (nodeType === "JSXSpreadAttribute") {
                if (typeof opts === "undefined") {
                  return true;
                } else {
                  return (0, _shallowEqual.default)(node, opts);
                }
              }

              return false;
            }

            function isJSXText(node, opts) {
              if (!node) return false;
              const nodeType = node.type;

              if (nodeType === "JSXText") {
                if (typeof opts === "undefined") {
                  return true;
                } else {
                  return (0, _shallowEqual.default)(node, opts);
                }
              }

              return false;
            }

            function isJSXFragment(node, opts) {
              if (!node) return false;
              const nodeType = node.type;

              if (nodeType === "JSXFragment") {
                if (typeof opts === "undefined") {
                  return true;
                } else {
                  return (0, _shallowEqual.default)(node, opts);
                }
              }

              return false;
            }

            function isJSXOpeningFragment(node, opts) {
              if (!node) return false;
              const nodeType = node.type;

              if (nodeType === "JSXOpeningFragment") {
                if (typeof opts === "undefined") {
                  return true;
                } else {
                  return (0, _shallowEqual.default)(node, opts);
                }
              }

              return false;
            }

            function isJSXClosingFragment(node, opts) {
              if (!node) return false;
              const nodeType = node.type;

              if (nodeType === "JSXClosingFragment") {
                if (typeof opts === "undefined") {
                  return true;
                } else {
                  return (0, _shallowEqual.default)(node, opts);
                }
              }

              return false;
            }

            function isNoop(node, opts) {
              if (!node) return false;
              const nodeType = node.type;

              if (nodeType === "Noop") {
                if (typeof opts === "undefined") {
                  return true;
                } else {
                  return (0, _shallowEqual.default)(node, opts);
                }
              }

              return false;
            }

            function isParenthesizedExpression(node, opts) {
              if (!node) return false;
              const nodeType = node.type;

              if (nodeType === "ParenthesizedExpression") {
                if (typeof opts === "undefined") {
                  return true;
                } else {
                  return (0, _shallowEqual.default)(node, opts);
                }
              }

              return false;
            }

            function isAwaitExpression(node, opts) {
              if (!node) return false;
              const nodeType = node.type;

              if (nodeType === "AwaitExpression") {
                if (typeof opts === "undefined") {
                  return true;
                } else {
                  return (0, _shallowEqual.default)(node, opts);
                }
              }

              return false;
            }

            function isBindExpression(node, opts) {
              if (!node) return false;
              const nodeType = node.type;

              if (nodeType === "BindExpression") {
                if (typeof opts === "undefined") {
                  return true;
                } else {
                  return (0, _shallowEqual.default)(node, opts);
                }
              }

              return false;
            }

            function isClassProperty(node, opts) {
              if (!node) return false;
              const nodeType = node.type;

              if (nodeType === "ClassProperty") {
                if (typeof opts === "undefined") {
                  return true;
                } else {
                  return (0, _shallowEqual.default)(node, opts);
                }
              }

              return false;
            }

            function isOptionalMemberExpression(node, opts) {
              if (!node) return false;
              const nodeType = node.type;

              if (nodeType === "OptionalMemberExpression") {
                if (typeof opts === "undefined") {
                  return true;
                } else {
                  return (0, _shallowEqual.default)(node, opts);
                }
              }

              return false;
            }

            function isPipelineTopicExpression(node, opts) {
              if (!node) return false;
              const nodeType = node.type;

              if (nodeType === "PipelineTopicExpression") {
                if (typeof opts === "undefined") {
                  return true;
                } else {
                  return (0, _shallowEqual.default)(node, opts);
                }
              }

              return false;
            }

            function isPipelineBareFunction(node, opts) {
              if (!node) return false;
              const nodeType = node.type;

              if (nodeType === "PipelineBareFunction") {
                if (typeof opts === "undefined") {
                  return true;
                } else {
                  return (0, _shallowEqual.default)(node, opts);
                }
              }

              return false;
            }

            function isPipelinePrimaryTopicReference(node, opts) {
              if (!node) return false;
              const nodeType = node.type;

              if (nodeType === "PipelinePrimaryTopicReference") {
                if (typeof opts === "undefined") {
                  return true;
                } else {
                  return (0, _shallowEqual.default)(node, opts);
                }
              }

              return false;
            }

            function isOptionalCallExpression(node, opts) {
              if (!node) return false;
              const nodeType = node.type;

              if (nodeType === "OptionalCallExpression") {
                if (typeof opts === "undefined") {
                  return true;
                } else {
                  return (0, _shallowEqual.default)(node, opts);
                }
              }

              return false;
            }

            function isClassPrivateProperty(node, opts) {
              if (!node) return false;
              const nodeType = node.type;

              if (nodeType === "ClassPrivateProperty") {
                if (typeof opts === "undefined") {
                  return true;
                } else {
                  return (0, _shallowEqual.default)(node, opts);
                }
              }

              return false;
            }

            function isClassPrivateMethod(node, opts) {
              if (!node) return false;
              const nodeType = node.type;

              if (nodeType === "ClassPrivateMethod") {
                if (typeof opts === "undefined") {
                  return true;
                } else {
                  return (0, _shallowEqual.default)(node, opts);
                }
              }

              return false;
            }

            function isImport(node, opts) {
              if (!node) return false;
              const nodeType = node.type;

              if (nodeType === "Import") {
                if (typeof opts === "undefined") {
                  return true;
                } else {
                  return (0, _shallowEqual.default)(node, opts);
                }
              }

              return false;
            }

            function isDecorator(node, opts) {
              if (!node) return false;
              const nodeType = node.type;

              if (nodeType === "Decorator") {
                if (typeof opts === "undefined") {
                  return true;
                } else {
                  return (0, _shallowEqual.default)(node, opts);
                }
              }

              return false;
            }

            function isDoExpression(node, opts) {
              if (!node) return false;
              const nodeType = node.type;

              if (nodeType === "DoExpression") {
                if (typeof opts === "undefined") {
                  return true;
                } else {
                  return (0, _shallowEqual.default)(node, opts);
                }
              }

              return false;
            }

            function isExportDefaultSpecifier(node, opts) {
              if (!node) return false;
              const nodeType = node.type;

              if (nodeType === "ExportDefaultSpecifier") {
                if (typeof opts === "undefined") {
                  return true;
                } else {
                  return (0, _shallowEqual.default)(node, opts);
                }
              }

              return false;
            }

            function isExportNamespaceSpecifier(node, opts) {
              if (!node) return false;
              const nodeType = node.type;

              if (nodeType === "ExportNamespaceSpecifier") {
                if (typeof opts === "undefined") {
                  return true;
                } else {
                  return (0, _shallowEqual.default)(node, opts);
                }
              }

              return false;
            }

            function isPrivateName(node, opts) {
              if (!node) return false;
              const nodeType = node.type;

              if (nodeType === "PrivateName") {
                if (typeof opts === "undefined") {
                  return true;
                } else {
                  return (0, _shallowEqual.default)(node, opts);
                }
              }

              return false;
            }

            function isBigIntLiteral(node, opts) {
              if (!node) return false;
              const nodeType = node.type;

              if (nodeType === "BigIntLiteral") {
                if (typeof opts === "undefined") {
                  return true;
                } else {
                  return (0, _shallowEqual.default)(node, opts);
                }
              }

              return false;
            }

            function isTSParameterProperty(node, opts) {
              if (!node) return false;
              const nodeType = node.type;

              if (nodeType === "TSParameterProperty") {
                if (typeof opts === "undefined") {
                  return true;
                } else {
                  return (0, _shallowEqual.default)(node, opts);
                }
              }

              return false;
            }

            function isTSDeclareFunction(node, opts) {
              if (!node) return false;
              const nodeType = node.type;

              if (nodeType === "TSDeclareFunction") {
                if (typeof opts === "undefined") {
                  return true;
                } else {
                  return (0, _shallowEqual.default)(node, opts);
                }
              }

              return false;
            }

            function isTSDeclareMethod(node, opts) {
              if (!node) return false;
              const nodeType = node.type;

              if (nodeType === "TSDeclareMethod") {
                if (typeof opts === "undefined") {
                  return true;
                } else {
                  return (0, _shallowEqual.default)(node, opts);
                }
              }

              return false;
            }

            function isTSQualifiedName(node, opts) {
              if (!node) return false;
              const nodeType = node.type;

              if (nodeType === "TSQualifiedName") {
                if (typeof opts === "undefined") {
                  return true;
                } else {
                  return (0, _shallowEqual.default)(node, opts);
                }
              }

              return false;
            }

            function isTSCallSignatureDeclaration(node, opts) {
              if (!node) return false;
              const nodeType = node.type;

              if (nodeType === "TSCallSignatureDeclaration") {
                if (typeof opts === "undefined") {
                  return true;
                } else {
                  return (0, _shallowEqual.default)(node, opts);
                }
              }

              return false;
            }

            function isTSConstructSignatureDeclaration(node, opts) {
              if (!node) return false;
              const nodeType = node.type;

              if (nodeType === "TSConstructSignatureDeclaration") {
                if (typeof opts === "undefined") {
                  return true;
                } else {
                  return (0, _shallowEqual.default)(node, opts);
                }
              }

              return false;
            }

            function isTSPropertySignature(node, opts) {
              if (!node) return false;
              const nodeType = node.type;

              if (nodeType === "TSPropertySignature") {
                if (typeof opts === "undefined") {
                  return true;
                } else {
                  return (0, _shallowEqual.default)(node, opts);
                }
              }

              return false;
            }

            function isTSMethodSignature(node, opts) {
              if (!node) return false;
              const nodeType = node.type;

              if (nodeType === "TSMethodSignature") {
                if (typeof opts === "undefined") {
                  return true;
                } else {
                  return (0, _shallowEqual.default)(node, opts);
                }
              }

              return false;
            }

            function isTSIndexSignature(node, opts) {
              if (!node) return false;
              const nodeType = node.type;

              if (nodeType === "TSIndexSignature") {
                if (typeof opts === "undefined") {
                  return true;
                } else {
                  return (0, _shallowEqual.default)(node, opts);
                }
              }

              return false;
            }

            function isTSAnyKeyword(node, opts) {
              if (!node) return false;
              const nodeType = node.type;

              if (nodeType === "TSAnyKeyword") {
                if (typeof opts === "undefined") {
                  return true;
                } else {
                  return (0, _shallowEqual.default)(node, opts);
                }
              }

              return false;
            }

            function isTSUnknownKeyword(node, opts) {
              if (!node) return false;
              const nodeType = node.type;

              if (nodeType === "TSUnknownKeyword") {
                if (typeof opts === "undefined") {
                  return true;
                } else {
                  return (0, _shallowEqual.default)(node, opts);
                }
              }

              return false;
            }

            function isTSNumberKeyword(node, opts) {
              if (!node) return false;
              const nodeType = node.type;

              if (nodeType === "TSNumberKeyword") {
                if (typeof opts === "undefined") {
                  return true;
                } else {
                  return (0, _shallowEqual.default)(node, opts);
                }
              }

              return false;
            }

            function isTSObjectKeyword(node, opts) {
              if (!node) return false;
              const nodeType = node.type;

              if (nodeType === "TSObjectKeyword") {
                if (typeof opts === "undefined") {
                  return true;
                } else {
                  return (0, _shallowEqual.default)(node, opts);
                }
              }

              return false;
            }

            function isTSBooleanKeyword(node, opts) {
              if (!node) return false;
              const nodeType = node.type;

              if (nodeType === "TSBooleanKeyword") {
                if (typeof opts === "undefined") {
                  return true;
                } else {
                  return (0, _shallowEqual.default)(node, opts);
                }
              }

              return false;
            }

            function isTSStringKeyword(node, opts) {
              if (!node) return false;
              const nodeType = node.type;

              if (nodeType === "TSStringKeyword") {
                if (typeof opts === "undefined") {
                  return true;
                } else {
                  return (0, _shallowEqual.default)(node, opts);
                }
              }

              return false;
            }

            function isTSSymbolKeyword(node, opts) {
              if (!node) return false;
              const nodeType = node.type;

              if (nodeType === "TSSymbolKeyword") {
                if (typeof opts === "undefined") {
                  return true;
                } else {
                  return (0, _shallowEqual.default)(node, opts);
                }
              }

              return false;
            }

            function isTSVoidKeyword(node, opts) {
              if (!node) return false;
              const nodeType = node.type;

              if (nodeType === "TSVoidKeyword") {
                if (typeof opts === "undefined") {
                  return true;
                } else {
                  return (0, _shallowEqual.default)(node, opts);
                }
              }

              return false;
            }

            function isTSUndefinedKeyword(node, opts) {
              if (!node) return false;
              const nodeType = node.type;

              if (nodeType === "TSUndefinedKeyword") {
                if (typeof opts === "undefined") {
                  return true;
                } else {
                  return (0, _shallowEqual.default)(node, opts);
                }
              }

              return false;
            }

            function isTSNullKeyword(node, opts) {
              if (!node) return false;
              const nodeType = node.type;

              if (nodeType === "TSNullKeyword") {
                if (typeof opts === "undefined") {
                  return true;
                } else {
                  return (0, _shallowEqual.default)(node, opts);
                }
              }

              return false;
            }

            function isTSNeverKeyword(node, opts) {
              if (!node) return false;
              const nodeType = node.type;

              if (nodeType === "TSNeverKeyword") {
                if (typeof opts === "undefined") {
                  return true;
                } else {
                  return (0, _shallowEqual.default)(node, opts);
                }
              }

              return false;
            }

            function isTSThisType(node, opts) {
              if (!node) return false;
              const nodeType = node.type;

              if (nodeType === "TSThisType") {
                if (typeof opts === "undefined") {
                  return true;
                } else {
                  return (0, _shallowEqual.default)(node, opts);
                }
              }

              return false;
            }

            function isTSFunctionType(node, opts) {
              if (!node) return false;
              const nodeType = node.type;

              if (nodeType === "TSFunctionType") {
                if (typeof opts === "undefined") {
                  return true;
                } else {
                  return (0, _shallowEqual.default)(node, opts);
                }
              }

              return false;
            }

            function isTSConstructorType(node, opts) {
              if (!node) return false;
              const nodeType = node.type;

              if (nodeType === "TSConstructorType") {
                if (typeof opts === "undefined") {
                  return true;
                } else {
                  return (0, _shallowEqual.default)(node, opts);
                }
              }

              return false;
            }

            function isTSTypeReference(node, opts) {
              if (!node) return false;
              const nodeType = node.type;

              if (nodeType === "TSTypeReference") {
                if (typeof opts === "undefined") {
                  return true;
                } else {
                  return (0, _shallowEqual.default)(node, opts);
                }
              }

              return false;
            }

            function isTSTypePredicate(node, opts) {
              if (!node) return false;
              const nodeType = node.type;

              if (nodeType === "TSTypePredicate") {
                if (typeof opts === "undefined") {
                  return true;
                } else {
                  return (0, _shallowEqual.default)(node, opts);
                }
              }

              return false;
            }

            function isTSTypeQuery(node, opts) {
              if (!node) return false;
              const nodeType = node.type;

              if (nodeType === "TSTypeQuery") {
                if (typeof opts === "undefined") {
                  return true;
                } else {
                  return (0, _shallowEqual.default)(node, opts);
                }
              }

              return false;
            }

            function isTSTypeLiteral(node, opts) {
              if (!node) return false;
              const nodeType = node.type;

              if (nodeType === "TSTypeLiteral") {
                if (typeof opts === "undefined") {
                  return true;
                } else {
                  return (0, _shallowEqual.default)(node, opts);
                }
              }

              return false;
            }

            function isTSArrayType(node, opts) {
              if (!node) return false;
              const nodeType = node.type;

              if (nodeType === "TSArrayType") {
                if (typeof opts === "undefined") {
                  return true;
                } else {
                  return (0, _shallowEqual.default)(node, opts);
                }
              }

              return false;
            }

            function isTSTupleType(node, opts) {
              if (!node) return false;
              const nodeType = node.type;

              if (nodeType === "TSTupleType") {
                if (typeof opts === "undefined") {
                  return true;
                } else {
                  return (0, _shallowEqual.default)(node, opts);
                }
              }

              return false;
            }

            function isTSOptionalType(node, opts) {
              if (!node) return false;
              const nodeType = node.type;

              if (nodeType === "TSOptionalType") {
                if (typeof opts === "undefined") {
                  return true;
                } else {
                  return (0, _shallowEqual.default)(node, opts);
                }
              }

              return false;
            }

            function isTSRestType(node, opts) {
              if (!node) return false;
              const nodeType = node.type;

              if (nodeType === "TSRestType") {
                if (typeof opts === "undefined") {
                  return true;
                } else {
                  return (0, _shallowEqual.default)(node, opts);
                }
              }

              return false;
            }

            function isTSUnionType(node, opts) {
              if (!node) return false;
              const nodeType = node.type;

              if (nodeType === "TSUnionType") {
                if (typeof opts === "undefined") {
                  return true;
                } else {
                  return (0, _shallowEqual.default)(node, opts);
                }
              }

              return false;
            }

            function isTSIntersectionType(node, opts) {
              if (!node) return false;
              const nodeType = node.type;

              if (nodeType === "TSIntersectionType") {
                if (typeof opts === "undefined") {
                  return true;
                } else {
                  return (0, _shallowEqual.default)(node, opts);
                }
              }

              return false;
            }

            function isTSConditionalType(node, opts) {
              if (!node) return false;
              const nodeType = node.type;

              if (nodeType === "TSConditionalType") {
                if (typeof opts === "undefined") {
                  return true;
                } else {
                  return (0, _shallowEqual.default)(node, opts);
                }
              }

              return false;
            }

            function isTSInferType(node, opts) {
              if (!node) return false;
              const nodeType = node.type;

              if (nodeType === "TSInferType") {
                if (typeof opts === "undefined") {
                  return true;
                } else {
                  return (0, _shallowEqual.default)(node, opts);
                }
              }

              return false;
            }

            function isTSParenthesizedType(node, opts) {
              if (!node) return false;
              const nodeType = node.type;

              if (nodeType === "TSParenthesizedType") {
                if (typeof opts === "undefined") {
                  return true;
                } else {
                  return (0, _shallowEqual.default)(node, opts);
                }
              }

              return false;
            }

            function isTSTypeOperator(node, opts) {
              if (!node) return false;
              const nodeType = node.type;

              if (nodeType === "TSTypeOperator") {
                if (typeof opts === "undefined") {
                  return true;
                } else {
                  return (0, _shallowEqual.default)(node, opts);
                }
              }

              return false;
            }

            function isTSIndexedAccessType(node, opts) {
              if (!node) return false;
              const nodeType = node.type;

              if (nodeType === "TSIndexedAccessType") {
                if (typeof opts === "undefined") {
                  return true;
                } else {
                  return (0, _shallowEqual.default)(node, opts);
                }
              }

              return false;
            }

            function isTSMappedType(node, opts) {
              if (!node) return false;
              const nodeType = node.type;

              if (nodeType === "TSMappedType") {
                if (typeof opts === "undefined") {
                  return true;
                } else {
                  return (0, _shallowEqual.default)(node, opts);
                }
              }

              return false;
            }

            function isTSLiteralType(node, opts) {
              if (!node) return false;
              const nodeType = node.type;

              if (nodeType === "TSLiteralType") {
                if (typeof opts === "undefined") {
                  return true;
                } else {
                  return (0, _shallowEqual.default)(node, opts);
                }
              }

              return false;
            }

            function isTSExpressionWithTypeArguments(node, opts) {
              if (!node) return false;
              const nodeType = node.type;

              if (nodeType === "TSExpressionWithTypeArguments") {
                if (typeof opts === "undefined") {
                  return true;
                } else {
                  return (0, _shallowEqual.default)(node, opts);
                }
              }

              return false;
            }

            function isTSInterfaceDeclaration(node, opts) {
              if (!node) return false;
              const nodeType = node.type;

              if (nodeType === "TSInterfaceDeclaration") {
                if (typeof opts === "undefined") {
                  return true;
                } else {
                  return (0, _shallowEqual.default)(node, opts);
                }
              }

              return false;
            }

            function isTSInterfaceBody(node, opts) {
              if (!node) return false;
              const nodeType = node.type;

              if (nodeType === "TSInterfaceBody") {
                if (typeof opts === "undefined") {
                  return true;
                } else {
                  return (0, _shallowEqual.default)(node, opts);
                }
              }

              return false;
            }

            function isTSTypeAliasDeclaration(node, opts) {
              if (!node) return false;
              const nodeType = node.type;

              if (nodeType === "TSTypeAliasDeclaration") {
                if (typeof opts === "undefined") {
                  return true;
                } else {
                  return (0, _shallowEqual.default)(node, opts);
                }
              }

              return false;
            }

            function isTSAsExpression(node, opts) {
              if (!node) return false;
              const nodeType = node.type;

              if (nodeType === "TSAsExpression") {
                if (typeof opts === "undefined") {
                  return true;
                } else {
                  return (0, _shallowEqual.default)(node, opts);
                }
              }

              return false;
            }

            function isTSTypeAssertion(node, opts) {
              if (!node) return false;
              const nodeType = node.type;

              if (nodeType === "TSTypeAssertion") {
                if (typeof opts === "undefined") {
                  return true;
                } else {
                  return (0, _shallowEqual.default)(node, opts);
                }
              }

              return false;
            }

            function isTSEnumDeclaration(node, opts) {
              if (!node) return false;
              const nodeType = node.type;

              if (nodeType === "TSEnumDeclaration") {
                if (typeof opts === "undefined") {
                  return true;
                } else {
                  return (0, _shallowEqual.default)(node, opts);
                }
              }

              return false;
            }

            function isTSEnumMember(node, opts) {
              if (!node) return false;
              const nodeType = node.type;

              if (nodeType === "TSEnumMember") {
                if (typeof opts === "undefined") {
                  return true;
                } else {
                  return (0, _shallowEqual.default)(node, opts);
                }
              }

              return false;
            }

            function isTSModuleDeclaration(node, opts) {
              if (!node) return false;
              const nodeType = node.type;

              if (nodeType === "TSModuleDeclaration") {
                if (typeof opts === "undefined") {
                  return true;
                } else {
                  return (0, _shallowEqual.default)(node, opts);
                }
              }

              return false;
            }

            function isTSModuleBlock(node, opts) {
              if (!node) return false;
              const nodeType = node.type;

              if (nodeType === "TSModuleBlock") {
                if (typeof opts === "undefined") {
                  return true;
                } else {
                  return (0, _shallowEqual.default)(node, opts);
                }
              }

              return false;
            }

            function isTSImportType(node, opts) {
              if (!node) return false;
              const nodeType = node.type;

              if (nodeType === "TSImportType") {
                if (typeof opts === "undefined") {
                  return true;
                } else {
                  return (0, _shallowEqual.default)(node, opts);
                }
              }

              return false;
            }

            function isTSImportEqualsDeclaration(node, opts) {
              if (!node) return false;
              const nodeType = node.type;

              if (nodeType === "TSImportEqualsDeclaration") {
                if (typeof opts === "undefined") {
                  return true;
                } else {
                  return (0, _shallowEqual.default)(node, opts);
                }
              }

              return false;
            }

            function isTSExternalModuleReference(node, opts) {
              if (!node) return false;
              const nodeType = node.type;

              if (nodeType === "TSExternalModuleReference") {
                if (typeof opts === "undefined") {
                  return true;
                } else {
                  return (0, _shallowEqual.default)(node, opts);
                }
              }

              return false;
            }

            function isTSNonNullExpression(node, opts) {
              if (!node) return false;
              const nodeType = node.type;

              if (nodeType === "TSNonNullExpression") {
                if (typeof opts === "undefined") {
                  return true;
                } else {
                  return (0, _shallowEqual.default)(node, opts);
                }
              }

              return false;
            }

            function isTSExportAssignment(node, opts) {
              if (!node) return false;
              const nodeType = node.type;

              if (nodeType === "TSExportAssignment") {
                if (typeof opts === "undefined") {
                  return true;
                } else {
                  return (0, _shallowEqual.default)(node, opts);
                }
              }

              return false;
            }

            function isTSNamespaceExportDeclaration(node, opts) {
              if (!node) return false;
              const nodeType = node.type;

              if (nodeType === "TSNamespaceExportDeclaration") {
                if (typeof opts === "undefined") {
                  return true;
                } else {
                  return (0, _shallowEqual.default)(node, opts);
                }
              }

              return false;
            }

            function isTSTypeAnnotation(node, opts) {
              if (!node) return false;
              const nodeType = node.type;

              if (nodeType === "TSTypeAnnotation") {
                if (typeof opts === "undefined") {
                  return true;
                } else {
                  return (0, _shallowEqual.default)(node, opts);
                }
              }

              return false;
            }

            function isTSTypeParameterInstantiation(node, opts) {
              if (!node) return false;
              const nodeType = node.type;

              if (nodeType === "TSTypeParameterInstantiation") {
                if (typeof opts === "undefined") {
                  return true;
                } else {
                  return (0, _shallowEqual.default)(node, opts);
                }
              }

              return false;
            }

            function isTSTypeParameterDeclaration(node, opts) {
              if (!node) return false;
              const nodeType = node.type;

              if (nodeType === "TSTypeParameterDeclaration") {
                if (typeof opts === "undefined") {
                  return true;
                } else {
                  return (0, _shallowEqual.default)(node, opts);
                }
              }

              return false;
            }

            function isTSTypeParameter(node, opts) {
              if (!node) return false;
              const nodeType = node.type;

              if (nodeType === "TSTypeParameter") {
                if (typeof opts === "undefined") {
                  return true;
                } else {
                  return (0, _shallowEqual.default)(node, opts);
                }
              }

              return false;
            }

            function isExpression(node, opts) {
              if (!node) return false;
              const nodeType = node.type;

              if (nodeType === "Expression" || "ArrayExpression" === nodeType || "AssignmentExpression" === nodeType || "BinaryExpression" === nodeType || "CallExpression" === nodeType || "ConditionalExpression" === nodeType || "FunctionExpression" === nodeType || "Identifier" === nodeType || "StringLiteral" === nodeType || "NumericLiteral" === nodeType || "NullLiteral" === nodeType || "BooleanLiteral" === nodeType || "RegExpLiteral" === nodeType || "LogicalExpression" === nodeType || "MemberExpression" === nodeType || "NewExpression" === nodeType || "ObjectExpression" === nodeType || "SequenceExpression" === nodeType || "ThisExpression" === nodeType || "UnaryExpression" === nodeType || "UpdateExpression" === nodeType || "ArrowFunctionExpression" === nodeType || "ClassExpression" === nodeType || "MetaProperty" === nodeType || "Super" === nodeType || "TaggedTemplateExpression" === nodeType || "TemplateLiteral" === nodeType || "YieldExpression" === nodeType || "TypeCastExpression" === nodeType || "JSXElement" === nodeType || "JSXFragment" === nodeType || "ParenthesizedExpression" === nodeType || "AwaitExpression" === nodeType || "BindExpression" === nodeType || "OptionalMemberExpression" === nodeType || "PipelinePrimaryTopicReference" === nodeType || "OptionalCallExpression" === nodeType || "Import" === nodeType || "DoExpression" === nodeType || "BigIntLiteral" === nodeType || "TSAsExpression" === nodeType || "TSTypeAssertion" === nodeType || "TSNonNullExpression" === nodeType) {
                if (typeof opts === "undefined") {
                  return true;
                } else {
                  return (0, _shallowEqual.default)(node, opts);
                }
              }

              return false;
            }

            function isBinary(node, opts) {
              if (!node) return false;
              const nodeType = node.type;

              if (nodeType === "Binary" || "BinaryExpression" === nodeType || "LogicalExpression" === nodeType) {
                if (typeof opts === "undefined") {
                  return true;
                } else {
                  return (0, _shallowEqual.default)(node, opts);
                }
              }

              return false;
            }

            function isScopable(node, opts) {
              if (!node) return false;
              const nodeType = node.type;

              if (nodeType === "Scopable" || "BlockStatement" === nodeType || "CatchClause" === nodeType || "DoWhileStatement" === nodeType || "ForInStatement" === nodeType || "ForStatement" === nodeType || "FunctionDeclaration" === nodeType || "FunctionExpression" === nodeType || "Program" === nodeType || "ObjectMethod" === nodeType || "SwitchStatement" === nodeType || "WhileStatement" === nodeType || "ArrowFunctionExpression" === nodeType || "ClassDeclaration" === nodeType || "ClassExpression" === nodeType || "ForOfStatement" === nodeType || "ClassMethod" === nodeType || "ClassPrivateMethod" === nodeType) {
                if (typeof opts === "undefined") {
                  return true;
                } else {
                  return (0, _shallowEqual.default)(node, opts);
                }
              }

              return false;
            }

            function isBlockParent(node, opts) {
              if (!node) return false;
              const nodeType = node.type;

              if (nodeType === "BlockParent" || "BlockStatement" === nodeType || "CatchClause" === nodeType || "DoWhileStatement" === nodeType || "ForInStatement" === nodeType || "ForStatement" === nodeType || "FunctionDeclaration" === nodeType || "FunctionExpression" === nodeType || "Program" === nodeType || "ObjectMethod" === nodeType || "SwitchStatement" === nodeType || "WhileStatement" === nodeType || "ArrowFunctionExpression" === nodeType || "ForOfStatement" === nodeType || "ClassMethod" === nodeType || "ClassPrivateMethod" === nodeType) {
                if (typeof opts === "undefined") {
                  return true;
                } else {
                  return (0, _shallowEqual.default)(node, opts);
                }
              }

              return false;
            }

            function isBlock(node, opts) {
              if (!node) return false;
              const nodeType = node.type;

              if (nodeType === "Block" || "BlockStatement" === nodeType || "Program" === nodeType) {
                if (typeof opts === "undefined") {
                  return true;
                } else {
                  return (0, _shallowEqual.default)(node, opts);
                }
              }

              return false;
            }

            function isStatement(node, opts) {
              if (!node) return false;
              const nodeType = node.type;

              if (nodeType === "Statement" || "BlockStatement" === nodeType || "BreakStatement" === nodeType || "ContinueStatement" === nodeType || "DebuggerStatement" === nodeType || "DoWhileStatement" === nodeType || "EmptyStatement" === nodeType || "ExpressionStatement" === nodeType || "ForInStatement" === nodeType || "ForStatement" === nodeType || "FunctionDeclaration" === nodeType || "IfStatement" === nodeType || "LabeledStatement" === nodeType || "ReturnStatement" === nodeType || "SwitchStatement" === nodeType || "ThrowStatement" === nodeType || "TryStatement" === nodeType || "VariableDeclaration" === nodeType || "WhileStatement" === nodeType || "WithStatement" === nodeType || "ClassDeclaration" === nodeType || "ExportAllDeclaration" === nodeType || "ExportDefaultDeclaration" === nodeType || "ExportNamedDeclaration" === nodeType || "ForOfStatement" === nodeType || "ImportDeclaration" === nodeType || "DeclareClass" === nodeType || "DeclareFunction" === nodeType || "DeclareInterface" === nodeType || "DeclareModule" === nodeType || "DeclareModuleExports" === nodeType || "DeclareTypeAlias" === nodeType || "DeclareOpaqueType" === nodeType || "DeclareVariable" === nodeType || "DeclareExportDeclaration" === nodeType || "DeclareExportAllDeclaration" === nodeType || "InterfaceDeclaration" === nodeType || "OpaqueType" === nodeType || "TypeAlias" === nodeType || "TSDeclareFunction" === nodeType || "TSInterfaceDeclaration" === nodeType || "TSTypeAliasDeclaration" === nodeType || "TSEnumDeclaration" === nodeType || "TSModuleDeclaration" === nodeType || "TSImportEqualsDeclaration" === nodeType || "TSExportAssignment" === nodeType || "TSNamespaceExportDeclaration" === nodeType) {
                if (typeof opts === "undefined") {
                  return true;
                } else {
                  return (0, _shallowEqual.default)(node, opts);
                }
              }

              return false;
            }

            function isTerminatorless(node, opts) {
              if (!node) return false;
              const nodeType = node.type;

              if (nodeType === "Terminatorless" || "BreakStatement" === nodeType || "ContinueStatement" === nodeType || "ReturnStatement" === nodeType || "ThrowStatement" === nodeType || "YieldExpression" === nodeType || "AwaitExpression" === nodeType) {
                if (typeof opts === "undefined") {
                  return true;
                } else {
                  return (0, _shallowEqual.default)(node, opts);
                }
              }

              return false;
            }

            function isCompletionStatement(node, opts) {
              if (!node) return false;
              const nodeType = node.type;

              if (nodeType === "CompletionStatement" || "BreakStatement" === nodeType || "ContinueStatement" === nodeType || "ReturnStatement" === nodeType || "ThrowStatement" === nodeType) {
                if (typeof opts === "undefined") {
                  return true;
                } else {
                  return (0, _shallowEqual.default)(node, opts);
                }
              }

              return false;
            }

            function isConditional(node, opts) {
              if (!node) return false;
              const nodeType = node.type;

              if (nodeType === "Conditional" || "ConditionalExpression" === nodeType || "IfStatement" === nodeType) {
                if (typeof opts === "undefined") {
                  return true;
                } else {
                  return (0, _shallowEqual.default)(node, opts);
                }
              }

              return false;
            }

            function isLoop(node, opts) {
              if (!node) return false;
              const nodeType = node.type;

              if (nodeType === "Loop" || "DoWhileStatement" === nodeType || "ForInStatement" === nodeType || "ForStatement" === nodeType || "WhileStatement" === nodeType || "ForOfStatement" === nodeType) {
                if (typeof opts === "undefined") {
                  return true;
                } else {
                  return (0, _shallowEqual.default)(node, opts);
                }
              }

              return false;
            }

            function isWhile(node, opts) {
              if (!node) return false;
              const nodeType = node.type;

              if (nodeType === "While" || "DoWhileStatement" === nodeType || "WhileStatement" === nodeType) {
                if (typeof opts === "undefined") {
                  return true;
                } else {
                  return (0, _shallowEqual.default)(node, opts);
                }
              }

              return false;
            }

            function isExpressionWrapper(node, opts) {
              if (!node) return false;
              const nodeType = node.type;

              if (nodeType === "ExpressionWrapper" || "ExpressionStatement" === nodeType || "TypeCastExpression" === nodeType || "ParenthesizedExpression" === nodeType) {
                if (typeof opts === "undefined") {
                  return true;
                } else {
                  return (0, _shallowEqual.default)(node, opts);
                }
              }

              return false;
            }

            function isFor(node, opts) {
              if (!node) return false;
              const nodeType = node.type;

              if (nodeType === "For" || "ForInStatement" === nodeType || "ForStatement" === nodeType || "ForOfStatement" === nodeType) {
                if (typeof opts === "undefined") {
                  return true;
                } else {
                  return (0, _shallowEqual.default)(node, opts);
                }
              }

              return false;
            }

            function isForXStatement(node, opts) {
              if (!node) return false;
              const nodeType = node.type;

              if (nodeType === "ForXStatement" || "ForInStatement" === nodeType || "ForOfStatement" === nodeType) {
                if (typeof opts === "undefined") {
                  return true;
                } else {
                  return (0, _shallowEqual.default)(node, opts);
                }
              }

              return false;
            }

            function isFunction(node, opts) {
              if (!node) return false;
              const nodeType = node.type;

              if (nodeType === "Function" || "FunctionDeclaration" === nodeType || "FunctionExpression" === nodeType || "ObjectMethod" === nodeType || "ArrowFunctionExpression" === nodeType || "ClassMethod" === nodeType || "ClassPrivateMethod" === nodeType) {
                if (typeof opts === "undefined") {
                  return true;
                } else {
                  return (0, _shallowEqual.default)(node, opts);
                }
              }

              return false;
            }

            function isFunctionParent(node, opts) {
              if (!node) return false;
              const nodeType = node.type;

              if (nodeType === "FunctionParent" || "FunctionDeclaration" === nodeType || "FunctionExpression" === nodeType || "ObjectMethod" === nodeType || "ArrowFunctionExpression" === nodeType || "ClassMethod" === nodeType || "ClassPrivateMethod" === nodeType) {
                if (typeof opts === "undefined") {
                  return true;
                } else {
                  return (0, _shallowEqual.default)(node, opts);
                }
              }

              return false;
            }

            function isPureish(node, opts) {
              if (!node) return false;
              const nodeType = node.type;

              if (nodeType === "Pureish" || "FunctionDeclaration" === nodeType || "FunctionExpression" === nodeType || "StringLiteral" === nodeType || "NumericLiteral" === nodeType || "NullLiteral" === nodeType || "BooleanLiteral" === nodeType || "ArrowFunctionExpression" === nodeType || "ClassDeclaration" === nodeType || "ClassExpression" === nodeType || "BigIntLiteral" === nodeType) {
                if (typeof opts === "undefined") {
                  return true;
                } else {
                  return (0, _shallowEqual.default)(node, opts);
                }
              }

              return false;
            }

            function isDeclaration(node, opts) {
              if (!node) return false;
              const nodeType = node.type;

              if (nodeType === "Declaration" || "FunctionDeclaration" === nodeType || "VariableDeclaration" === nodeType || "ClassDeclaration" === nodeType || "ExportAllDeclaration" === nodeType || "ExportDefaultDeclaration" === nodeType || "ExportNamedDeclaration" === nodeType || "ImportDeclaration" === nodeType || "DeclareClass" === nodeType || "DeclareFunction" === nodeType || "DeclareInterface" === nodeType || "DeclareModule" === nodeType || "DeclareModuleExports" === nodeType || "DeclareTypeAlias" === nodeType || "DeclareOpaqueType" === nodeType || "DeclareVariable" === nodeType || "DeclareExportDeclaration" === nodeType || "DeclareExportAllDeclaration" === nodeType || "InterfaceDeclaration" === nodeType || "OpaqueType" === nodeType || "TypeAlias" === nodeType || "TSDeclareFunction" === nodeType || "TSInterfaceDeclaration" === nodeType || "TSTypeAliasDeclaration" === nodeType || "TSEnumDeclaration" === nodeType || "TSModuleDeclaration" === nodeType) {
                if (typeof opts === "undefined") {
                  return true;
                } else {
                  return (0, _shallowEqual.default)(node, opts);
                }
              }

              return false;
            }

            function isPatternLike(node, opts) {
              if (!node) return false;
              const nodeType = node.type;

              if (nodeType === "PatternLike" || "Identifier" === nodeType || "RestElement" === nodeType || "AssignmentPattern" === nodeType || "ArrayPattern" === nodeType || "ObjectPattern" === nodeType) {
                if (typeof opts === "undefined") {
                  return true;
                } else {
                  return (0, _shallowEqual.default)(node, opts);
                }
              }

              return false;
            }

            function isLVal(node, opts) {
              if (!node) return false;
              const nodeType = node.type;

              if (nodeType === "LVal" || "Identifier" === nodeType || "MemberExpression" === nodeType || "RestElement" === nodeType || "AssignmentPattern" === nodeType || "ArrayPattern" === nodeType || "ObjectPattern" === nodeType || "TSParameterProperty" === nodeType) {
                if (typeof opts === "undefined") {
                  return true;
                } else {
                  return (0, _shallowEqual.default)(node, opts);
                }
              }

              return false;
            }

            function isTSEntityName(node, opts) {
              if (!node) return false;
              const nodeType = node.type;

              if (nodeType === "TSEntityName" || "Identifier" === nodeType || "TSQualifiedName" === nodeType) {
                if (typeof opts === "undefined") {
                  return true;
                } else {
                  return (0, _shallowEqual.default)(node, opts);
                }
              }

              return false;
            }

            function isLiteral(node, opts) {
              if (!node) return false;
              const nodeType = node.type;

              if (nodeType === "Literal" || "StringLiteral" === nodeType || "NumericLiteral" === nodeType || "NullLiteral" === nodeType || "BooleanLiteral" === nodeType || "RegExpLiteral" === nodeType || "TemplateLiteral" === nodeType || "BigIntLiteral" === nodeType) {
                if (typeof opts === "undefined") {
                  return true;
                } else {
                  return (0, _shallowEqual.default)(node, opts);
                }
              }

              return false;
            }

            function isImmutable(node, opts) {
              if (!node) return false;
              const nodeType = node.type;

              if (nodeType === "Immutable" || "StringLiteral" === nodeType || "NumericLiteral" === nodeType || "NullLiteral" === nodeType || "BooleanLiteral" === nodeType || "JSXAttribute" === nodeType || "JSXClosingElement" === nodeType || "JSXElement" === nodeType || "JSXExpressionContainer" === nodeType || "JSXSpreadChild" === nodeType || "JSXOpeningElement" === nodeType || "JSXText" === nodeType || "JSXFragment" === nodeType || "JSXOpeningFragment" === nodeType || "JSXClosingFragment" === nodeType || "BigIntLiteral" === nodeType) {
                if (typeof opts === "undefined") {
                  return true;
                } else {
                  return (0, _shallowEqual.default)(node, opts);
                }
              }

              return false;
            }

            function isUserWhitespacable(node, opts) {
              if (!node) return false;
              const nodeType = node.type;

              if (nodeType === "UserWhitespacable" || "ObjectMethod" === nodeType || "ObjectProperty" === nodeType || "ObjectTypeInternalSlot" === nodeType || "ObjectTypeCallProperty" === nodeType || "ObjectTypeIndexer" === nodeType || "ObjectTypeProperty" === nodeType || "ObjectTypeSpreadProperty" === nodeType) {
                if (typeof opts === "undefined") {
                  return true;
                } else {
                  return (0, _shallowEqual.default)(node, opts);
                }
              }

              return false;
            }

            function isMethod(node, opts) {
              if (!node) return false;
              const nodeType = node.type;

              if (nodeType === "Method" || "ObjectMethod" === nodeType || "ClassMethod" === nodeType || "ClassPrivateMethod" === nodeType) {
                if (typeof opts === "undefined") {
                  return true;
                } else {
                  return (0, _shallowEqual.default)(node, opts);
                }
              }

              return false;
            }

            function isObjectMember(node, opts) {
              if (!node) return false;
              const nodeType = node.type;

              if (nodeType === "ObjectMember" || "ObjectMethod" === nodeType || "ObjectProperty" === nodeType) {
                if (typeof opts === "undefined") {
                  return true;
                } else {
                  return (0, _shallowEqual.default)(node, opts);
                }
              }

              return false;
            }

            function isProperty(node, opts) {
              if (!node) return false;
              const nodeType = node.type;

              if (nodeType === "Property" || "ObjectProperty" === nodeType || "ClassProperty" === nodeType || "ClassPrivateProperty" === nodeType) {
                if (typeof opts === "undefined") {
                  return true;
                } else {
                  return (0, _shallowEqual.default)(node, opts);
                }
              }

              return false;
            }

            function isUnaryLike(node, opts) {
              if (!node) return false;
              const nodeType = node.type;

              if (nodeType === "UnaryLike" || "UnaryExpression" === nodeType || "SpreadElement" === nodeType) {
                if (typeof opts === "undefined") {
                  return true;
                } else {
                  return (0, _shallowEqual.default)(node, opts);
                }
              }

              return false;
            }

            function isPattern(node, opts) {
              if (!node) return false;
              const nodeType = node.type;

              if (nodeType === "Pattern" || "AssignmentPattern" === nodeType || "ArrayPattern" === nodeType || "ObjectPattern" === nodeType) {
                if (typeof opts === "undefined") {
                  return true;
                } else {
                  return (0, _shallowEqual.default)(node, opts);
                }
              }

              return false;
            }

            function isClass(node, opts) {
              if (!node) return false;
              const nodeType = node.type;

              if (nodeType === "Class" || "ClassDeclaration" === nodeType || "ClassExpression" === nodeType) {
                if (typeof opts === "undefined") {
                  return true;
                } else {
                  return (0, _shallowEqual.default)(node, opts);
                }
              }

              return false;
            }

            function isModuleDeclaration(node, opts) {
              if (!node) return false;
              const nodeType = node.type;

              if (nodeType === "ModuleDeclaration" || "ExportAllDeclaration" === nodeType || "ExportDefaultDeclaration" === nodeType || "ExportNamedDeclaration" === nodeType || "ImportDeclaration" === nodeType) {
                if (typeof opts === "undefined") {
                  return true;
                } else {
                  return (0, _shallowEqual.default)(node, opts);
                }
              }

              return false;
            }

            function isExportDeclaration(node, opts) {
              if (!node) return false;
              const nodeType = node.type;

              if (nodeType === "ExportDeclaration" || "ExportAllDeclaration" === nodeType || "ExportDefaultDeclaration" === nodeType || "ExportNamedDeclaration" === nodeType) {
                if (typeof opts === "undefined") {
                  return true;
                } else {
                  return (0, _shallowEqual.default)(node, opts);
                }
              }

              return false;
            }

            function isModuleSpecifier(node, opts) {
              if (!node) return false;
              const nodeType = node.type;

              if (nodeType === "ModuleSpecifier" || "ExportSpecifier" === nodeType || "ImportDefaultSpecifier" === nodeType || "ImportNamespaceSpecifier" === nodeType || "ImportSpecifier" === nodeType || "ExportDefaultSpecifier" === nodeType || "ExportNamespaceSpecifier" === nodeType) {
                if (typeof opts === "undefined") {
                  return true;
                } else {
                  return (0, _shallowEqual.default)(node, opts);
                }
              }

              return false;
            }

            function isFlow(node, opts) {
              if (!node) return false;
              const nodeType = node.type;

              if (nodeType === "Flow" || "AnyTypeAnnotation" === nodeType || "ArrayTypeAnnotation" === nodeType || "BooleanTypeAnnotation" === nodeType || "BooleanLiteralTypeAnnotation" === nodeType || "NullLiteralTypeAnnotation" === nodeType || "ClassImplements" === nodeType || "DeclareClass" === nodeType || "DeclareFunction" === nodeType || "DeclareInterface" === nodeType || "DeclareModule" === nodeType || "DeclareModuleExports" === nodeType || "DeclareTypeAlias" === nodeType || "DeclareOpaqueType" === nodeType || "DeclareVariable" === nodeType || "DeclareExportDeclaration" === nodeType || "DeclareExportAllDeclaration" === nodeType || "DeclaredPredicate" === nodeType || "ExistsTypeAnnotation" === nodeType || "FunctionTypeAnnotation" === nodeType || "FunctionTypeParam" === nodeType || "GenericTypeAnnotation" === nodeType || "InferredPredicate" === nodeType || "InterfaceExtends" === nodeType || "InterfaceDeclaration" === nodeType || "InterfaceTypeAnnotation" === nodeType || "IntersectionTypeAnnotation" === nodeType || "MixedTypeAnnotation" === nodeType || "EmptyTypeAnnotation" === nodeType || "NullableTypeAnnotation" === nodeType || "NumberLiteralTypeAnnotation" === nodeType || "NumberTypeAnnotation" === nodeType || "ObjectTypeAnnotation" === nodeType || "ObjectTypeInternalSlot" === nodeType || "ObjectTypeCallProperty" === nodeType || "ObjectTypeIndexer" === nodeType || "ObjectTypeProperty" === nodeType || "ObjectTypeSpreadProperty" === nodeType || "OpaqueType" === nodeType || "QualifiedTypeIdentifier" === nodeType || "StringLiteralTypeAnnotation" === nodeType || "StringTypeAnnotation" === nodeType || "ThisTypeAnnotation" === nodeType || "TupleTypeAnnotation" === nodeType || "TypeofTypeAnnotation" === nodeType || "TypeAlias" === nodeType || "TypeAnnotation" === nodeType || "TypeCastExpression" === nodeType || "TypeParameter" === nodeType || "TypeParameterDeclaration" === nodeType || "TypeParameterInstantiation" === nodeType || "UnionTypeAnnotation" === nodeType || "Variance" === nodeType || "VoidTypeAnnotation" === nodeType) {
                if (typeof opts === "undefined") {
                  return true;
                } else {
                  return (0, _shallowEqual.default)(node, opts);
                }
              }

              return false;
            }

            function isFlowType(node, opts) {
              if (!node) return false;
              const nodeType = node.type;

              if (nodeType === "FlowType" || "AnyTypeAnnotation" === nodeType || "ArrayTypeAnnotation" === nodeType || "BooleanTypeAnnotation" === nodeType || "BooleanLiteralTypeAnnotation" === nodeType || "NullLiteralTypeAnnotation" === nodeType || "ExistsTypeAnnotation" === nodeType || "FunctionTypeAnnotation" === nodeType || "GenericTypeAnnotation" === nodeType || "InterfaceTypeAnnotation" === nodeType || "IntersectionTypeAnnotation" === nodeType || "MixedTypeAnnotation" === nodeType || "EmptyTypeAnnotation" === nodeType || "NullableTypeAnnotation" === nodeType || "NumberLiteralTypeAnnotation" === nodeType || "NumberTypeAnnotation" === nodeType || "ObjectTypeAnnotation" === nodeType || "StringLiteralTypeAnnotation" === nodeType || "StringTypeAnnotation" === nodeType || "ThisTypeAnnotation" === nodeType || "TupleTypeAnnotation" === nodeType || "TypeofTypeAnnotation" === nodeType || "UnionTypeAnnotation" === nodeType || "VoidTypeAnnotation" === nodeType) {
                if (typeof opts === "undefined") {
                  return true;
                } else {
                  return (0, _shallowEqual.default)(node, opts);
                }
              }

              return false;
            }

            function isFlowBaseAnnotation(node, opts) {
              if (!node) return false;
              const nodeType = node.type;

              if (nodeType === "FlowBaseAnnotation" || "AnyTypeAnnotation" === nodeType || "BooleanTypeAnnotation" === nodeType || "NullLiteralTypeAnnotation" === nodeType || "MixedTypeAnnotation" === nodeType || "EmptyTypeAnnotation" === nodeType || "NumberTypeAnnotation" === nodeType || "StringTypeAnnotation" === nodeType || "ThisTypeAnnotation" === nodeType || "VoidTypeAnnotation" === nodeType) {
                if (typeof opts === "undefined") {
                  return true;
                } else {
                  return (0, _shallowEqual.default)(node, opts);
                }
              }

              return false;
            }

            function isFlowDeclaration(node, opts) {
              if (!node) return false;
              const nodeType = node.type;

              if (nodeType === "FlowDeclaration" || "DeclareClass" === nodeType || "DeclareFunction" === nodeType || "DeclareInterface" === nodeType || "DeclareModule" === nodeType || "DeclareModuleExports" === nodeType || "DeclareTypeAlias" === nodeType || "DeclareOpaqueType" === nodeType || "DeclareVariable" === nodeType || "DeclareExportDeclaration" === nodeType || "DeclareExportAllDeclaration" === nodeType || "InterfaceDeclaration" === nodeType || "OpaqueType" === nodeType || "TypeAlias" === nodeType) {
                if (typeof opts === "undefined") {
                  return true;
                } else {
                  return (0, _shallowEqual.default)(node, opts);
                }
              }

              return false;
            }

            function isFlowPredicate(node, opts) {
              if (!node) return false;
              const nodeType = node.type;

              if (nodeType === "FlowPredicate" || "DeclaredPredicate" === nodeType || "InferredPredicate" === nodeType) {
                if (typeof opts === "undefined") {
                  return true;
                } else {
                  return (0, _shallowEqual.default)(node, opts);
                }
              }

              return false;
            }

            function isJSX(node, opts) {
              if (!node) return false;
              const nodeType = node.type;

              if (nodeType === "JSX" || "JSXAttribute" === nodeType || "JSXClosingElement" === nodeType || "JSXElement" === nodeType || "JSXEmptyExpression" === nodeType || "JSXExpressionContainer" === nodeType || "JSXSpreadChild" === nodeType || "JSXIdentifier" === nodeType || "JSXMemberExpression" === nodeType || "JSXNamespacedName" === nodeType || "JSXOpeningElement" === nodeType || "JSXSpreadAttribute" === nodeType || "JSXText" === nodeType || "JSXFragment" === nodeType || "JSXOpeningFragment" === nodeType || "JSXClosingFragment" === nodeType) {
                if (typeof opts === "undefined") {
                  return true;
                } else {
                  return (0, _shallowEqual.default)(node, opts);
                }
              }

              return false;
            }

            function isPrivate(node, opts) {
              if (!node) return false;
              const nodeType = node.type;

              if (nodeType === "Private" || "ClassPrivateProperty" === nodeType || "ClassPrivateMethod" === nodeType || "PrivateName" === nodeType) {
                if (typeof opts === "undefined") {
                  return true;
                } else {
                  return (0, _shallowEqual.default)(node, opts);
                }
              }

              return false;
            }

            function isTSTypeElement(node, opts) {
              if (!node) return false;
              const nodeType = node.type;

              if (nodeType === "TSTypeElement" || "TSCallSignatureDeclaration" === nodeType || "TSConstructSignatureDeclaration" === nodeType || "TSPropertySignature" === nodeType || "TSMethodSignature" === nodeType || "TSIndexSignature" === nodeType) {
                if (typeof opts === "undefined") {
                  return true;
                } else {
                  return (0, _shallowEqual.default)(node, opts);
                }
              }

              return false;
            }

            function isTSType(node, opts) {
              if (!node) return false;
              const nodeType = node.type;

              if (nodeType === "TSType" || "TSAnyKeyword" === nodeType || "TSUnknownKeyword" === nodeType || "TSNumberKeyword" === nodeType || "TSObjectKeyword" === nodeType || "TSBooleanKeyword" === nodeType || "TSStringKeyword" === nodeType || "TSSymbolKeyword" === nodeType || "TSVoidKeyword" === nodeType || "TSUndefinedKeyword" === nodeType || "TSNullKeyword" === nodeType || "TSNeverKeyword" === nodeType || "TSThisType" === nodeType || "TSFunctionType" === nodeType || "TSConstructorType" === nodeType || "TSTypeReference" === nodeType || "TSTypePredicate" === nodeType || "TSTypeQuery" === nodeType || "TSTypeLiteral" === nodeType || "TSArrayType" === nodeType || "TSTupleType" === nodeType || "TSOptionalType" === nodeType || "TSRestType" === nodeType || "TSUnionType" === nodeType || "TSIntersectionType" === nodeType || "TSConditionalType" === nodeType || "TSInferType" === nodeType || "TSParenthesizedType" === nodeType || "TSTypeOperator" === nodeType || "TSIndexedAccessType" === nodeType || "TSMappedType" === nodeType || "TSLiteralType" === nodeType || "TSExpressionWithTypeArguments" === nodeType || "TSImportType" === nodeType) {
                if (typeof opts === "undefined") {
                  return true;
                } else {
                  return (0, _shallowEqual.default)(node, opts);
                }
              }

              return false;
            }

            function isNumberLiteral(node, opts) {
              console.trace("The node type NumberLiteral has been renamed to NumericLiteral");
              if (!node) return false;
              const nodeType = node.type;

              if (nodeType === "NumberLiteral") {
                if (typeof opts === "undefined") {
                  return true;
                } else {
                  return (0, _shallowEqual.default)(node, opts);
                }
              }

              return false;
            }

            function isRegexLiteral(node, opts) {
              console.trace("The node type RegexLiteral has been renamed to RegExpLiteral");
              if (!node) return false;
              const nodeType = node.type;

              if (nodeType === "RegexLiteral") {
                if (typeof opts === "undefined") {
                  return true;
                } else {
                  return (0, _shallowEqual.default)(node, opts);
                }
              }

              return false;
            }

            function isRestProperty(node, opts) {
              console.trace("The node type RestProperty has been renamed to RestElement");
              if (!node) return false;
              const nodeType = node.type;

              if (nodeType === "RestProperty") {
                if (typeof opts === "undefined") {
                  return true;
                } else {
                  return (0, _shallowEqual.default)(node, opts);
                }
              }

              return false;
            }

            function isSpreadProperty(node, opts) {
              console.trace("The node type SpreadProperty has been renamed to SpreadElement");
              if (!node) return false;
              const nodeType = node.type;

              if (nodeType === "SpreadProperty") {
                if (typeof opts === "undefined") {
                  return true;
                } else {
                  return (0, _shallowEqual.default)(node, opts);
                }
              }

              return false;
            }
            });

            unwrapExports(generated);
            var generated_1 = generated.isArrayExpression;
            var generated_2 = generated.isAssignmentExpression;
            var generated_3 = generated.isBinaryExpression;
            var generated_4 = generated.isInterpreterDirective;
            var generated_5 = generated.isDirective;
            var generated_6 = generated.isDirectiveLiteral;
            var generated_7 = generated.isBlockStatement;
            var generated_8 = generated.isBreakStatement;
            var generated_9 = generated.isCallExpression;
            var generated_10 = generated.isCatchClause;
            var generated_11 = generated.isConditionalExpression;
            var generated_12 = generated.isContinueStatement;
            var generated_13 = generated.isDebuggerStatement;
            var generated_14 = generated.isDoWhileStatement;
            var generated_15 = generated.isEmptyStatement;
            var generated_16 = generated.isExpressionStatement;
            var generated_17 = generated.isFile;
            var generated_18 = generated.isForInStatement;
            var generated_19 = generated.isForStatement;
            var generated_20 = generated.isFunctionDeclaration;
            var generated_21 = generated.isFunctionExpression;
            var generated_22 = generated.isIdentifier;
            var generated_23 = generated.isIfStatement;
            var generated_24 = generated.isLabeledStatement;
            var generated_25 = generated.isStringLiteral;
            var generated_26 = generated.isNumericLiteral;
            var generated_27 = generated.isNullLiteral;
            var generated_28 = generated.isBooleanLiteral;
            var generated_29 = generated.isRegExpLiteral;
            var generated_30 = generated.isLogicalExpression;
            var generated_31 = generated.isMemberExpression;
            var generated_32 = generated.isNewExpression;
            var generated_33 = generated.isProgram;
            var generated_34 = generated.isObjectExpression;
            var generated_35 = generated.isObjectMethod;
            var generated_36 = generated.isObjectProperty;
            var generated_37 = generated.isRestElement;
            var generated_38 = generated.isReturnStatement;
            var generated_39 = generated.isSequenceExpression;
            var generated_40 = generated.isSwitchCase;
            var generated_41 = generated.isSwitchStatement;
            var generated_42 = generated.isThisExpression;
            var generated_43 = generated.isThrowStatement;
            var generated_44 = generated.isTryStatement;
            var generated_45 = generated.isUnaryExpression;
            var generated_46 = generated.isUpdateExpression;
            var generated_47 = generated.isVariableDeclaration;
            var generated_48 = generated.isVariableDeclarator;
            var generated_49 = generated.isWhileStatement;
            var generated_50 = generated.isWithStatement;
            var generated_51 = generated.isAssignmentPattern;
            var generated_52 = generated.isArrayPattern;
            var generated_53 = generated.isArrowFunctionExpression;
            var generated_54 = generated.isClassBody;
            var generated_55 = generated.isClassDeclaration;
            var generated_56 = generated.isClassExpression;
            var generated_57 = generated.isExportAllDeclaration;
            var generated_58 = generated.isExportDefaultDeclaration;
            var generated_59 = generated.isExportNamedDeclaration;
            var generated_60 = generated.isExportSpecifier;
            var generated_61 = generated.isForOfStatement;
            var generated_62 = generated.isImportDeclaration;
            var generated_63 = generated.isImportDefaultSpecifier;
            var generated_64 = generated.isImportNamespaceSpecifier;
            var generated_65 = generated.isImportSpecifier;
            var generated_66 = generated.isMetaProperty;
            var generated_67 = generated.isClassMethod;
            var generated_68 = generated.isObjectPattern;
            var generated_69 = generated.isSpreadElement;
            var generated_70 = generated.isSuper;
            var generated_71 = generated.isTaggedTemplateExpression;
            var generated_72 = generated.isTemplateElement;
            var generated_73 = generated.isTemplateLiteral;
            var generated_74 = generated.isYieldExpression;
            var generated_75 = generated.isAnyTypeAnnotation;
            var generated_76 = generated.isArrayTypeAnnotation;
            var generated_77 = generated.isBooleanTypeAnnotation;
            var generated_78 = generated.isBooleanLiteralTypeAnnotation;
            var generated_79 = generated.isNullLiteralTypeAnnotation;
            var generated_80 = generated.isClassImplements;
            var generated_81 = generated.isDeclareClass;
            var generated_82 = generated.isDeclareFunction;
            var generated_83 = generated.isDeclareInterface;
            var generated_84 = generated.isDeclareModule;
            var generated_85 = generated.isDeclareModuleExports;
            var generated_86 = generated.isDeclareTypeAlias;
            var generated_87 = generated.isDeclareOpaqueType;
            var generated_88 = generated.isDeclareVariable;
            var generated_89 = generated.isDeclareExportDeclaration;
            var generated_90 = generated.isDeclareExportAllDeclaration;
            var generated_91 = generated.isDeclaredPredicate;
            var generated_92 = generated.isExistsTypeAnnotation;
            var generated_93 = generated.isFunctionTypeAnnotation;
            var generated_94 = generated.isFunctionTypeParam;
            var generated_95 = generated.isGenericTypeAnnotation;
            var generated_96 = generated.isInferredPredicate;
            var generated_97 = generated.isInterfaceExtends;
            var generated_98 = generated.isInterfaceDeclaration;
            var generated_99 = generated.isInterfaceTypeAnnotation;
            var generated_100 = generated.isIntersectionTypeAnnotation;
            var generated_101 = generated.isMixedTypeAnnotation;
            var generated_102 = generated.isEmptyTypeAnnotation;
            var generated_103 = generated.isNullableTypeAnnotation;
            var generated_104 = generated.isNumberLiteralTypeAnnotation;
            var generated_105 = generated.isNumberTypeAnnotation;
            var generated_106 = generated.isObjectTypeAnnotation;
            var generated_107 = generated.isObjectTypeInternalSlot;
            var generated_108 = generated.isObjectTypeCallProperty;
            var generated_109 = generated.isObjectTypeIndexer;
            var generated_110 = generated.isObjectTypeProperty;
            var generated_111 = generated.isObjectTypeSpreadProperty;
            var generated_112 = generated.isOpaqueType;
            var generated_113 = generated.isQualifiedTypeIdentifier;
            var generated_114 = generated.isStringLiteralTypeAnnotation;
            var generated_115 = generated.isStringTypeAnnotation;
            var generated_116 = generated.isThisTypeAnnotation;
            var generated_117 = generated.isTupleTypeAnnotation;
            var generated_118 = generated.isTypeofTypeAnnotation;
            var generated_119 = generated.isTypeAlias;
            var generated_120 = generated.isTypeAnnotation;
            var generated_121 = generated.isTypeCastExpression;
            var generated_122 = generated.isTypeParameter;
            var generated_123 = generated.isTypeParameterDeclaration;
            var generated_124 = generated.isTypeParameterInstantiation;
            var generated_125 = generated.isUnionTypeAnnotation;
            var generated_126 = generated.isVariance;
            var generated_127 = generated.isVoidTypeAnnotation;
            var generated_128 = generated.isJSXAttribute;
            var generated_129 = generated.isJSXClosingElement;
            var generated_130 = generated.isJSXElement;
            var generated_131 = generated.isJSXEmptyExpression;
            var generated_132 = generated.isJSXExpressionContainer;
            var generated_133 = generated.isJSXSpreadChild;
            var generated_134 = generated.isJSXIdentifier;
            var generated_135 = generated.isJSXMemberExpression;
            var generated_136 = generated.isJSXNamespacedName;
            var generated_137 = generated.isJSXOpeningElement;
            var generated_138 = generated.isJSXSpreadAttribute;
            var generated_139 = generated.isJSXText;
            var generated_140 = generated.isJSXFragment;
            var generated_141 = generated.isJSXOpeningFragment;
            var generated_142 = generated.isJSXClosingFragment;
            var generated_143 = generated.isNoop;
            var generated_144 = generated.isParenthesizedExpression;
            var generated_145 = generated.isAwaitExpression;
            var generated_146 = generated.isBindExpression;
            var generated_147 = generated.isClassProperty;
            var generated_148 = generated.isOptionalMemberExpression;
            var generated_149 = generated.isPipelineTopicExpression;
            var generated_150 = generated.isPipelineBareFunction;
            var generated_151 = generated.isPipelinePrimaryTopicReference;
            var generated_152 = generated.isOptionalCallExpression;
            var generated_153 = generated.isClassPrivateProperty;
            var generated_154 = generated.isClassPrivateMethod;
            var generated_155 = generated.isImport;
            var generated_156 = generated.isDecorator;
            var generated_157 = generated.isDoExpression;
            var generated_158 = generated.isExportDefaultSpecifier;
            var generated_159 = generated.isExportNamespaceSpecifier;
            var generated_160 = generated.isPrivateName;
            var generated_161 = generated.isBigIntLiteral;
            var generated_162 = generated.isTSParameterProperty;
            var generated_163 = generated.isTSDeclareFunction;
            var generated_164 = generated.isTSDeclareMethod;
            var generated_165 = generated.isTSQualifiedName;
            var generated_166 = generated.isTSCallSignatureDeclaration;
            var generated_167 = generated.isTSConstructSignatureDeclaration;
            var generated_168 = generated.isTSPropertySignature;
            var generated_169 = generated.isTSMethodSignature;
            var generated_170 = generated.isTSIndexSignature;
            var generated_171 = generated.isTSAnyKeyword;
            var generated_172 = generated.isTSUnknownKeyword;
            var generated_173 = generated.isTSNumberKeyword;
            var generated_174 = generated.isTSObjectKeyword;
            var generated_175 = generated.isTSBooleanKeyword;
            var generated_176 = generated.isTSStringKeyword;
            var generated_177 = generated.isTSSymbolKeyword;
            var generated_178 = generated.isTSVoidKeyword;
            var generated_179 = generated.isTSUndefinedKeyword;
            var generated_180 = generated.isTSNullKeyword;
            var generated_181 = generated.isTSNeverKeyword;
            var generated_182 = generated.isTSThisType;
            var generated_183 = generated.isTSFunctionType;
            var generated_184 = generated.isTSConstructorType;
            var generated_185 = generated.isTSTypeReference;
            var generated_186 = generated.isTSTypePredicate;
            var generated_187 = generated.isTSTypeQuery;
            var generated_188 = generated.isTSTypeLiteral;
            var generated_189 = generated.isTSArrayType;
            var generated_190 = generated.isTSTupleType;
            var generated_191 = generated.isTSOptionalType;
            var generated_192 = generated.isTSRestType;
            var generated_193 = generated.isTSUnionType;
            var generated_194 = generated.isTSIntersectionType;
            var generated_195 = generated.isTSConditionalType;
            var generated_196 = generated.isTSInferType;
            var generated_197 = generated.isTSParenthesizedType;
            var generated_198 = generated.isTSTypeOperator;
            var generated_199 = generated.isTSIndexedAccessType;
            var generated_200 = generated.isTSMappedType;
            var generated_201 = generated.isTSLiteralType;
            var generated_202 = generated.isTSExpressionWithTypeArguments;
            var generated_203 = generated.isTSInterfaceDeclaration;
            var generated_204 = generated.isTSInterfaceBody;
            var generated_205 = generated.isTSTypeAliasDeclaration;
            var generated_206 = generated.isTSAsExpression;
            var generated_207 = generated.isTSTypeAssertion;
            var generated_208 = generated.isTSEnumDeclaration;
            var generated_209 = generated.isTSEnumMember;
            var generated_210 = generated.isTSModuleDeclaration;
            var generated_211 = generated.isTSModuleBlock;
            var generated_212 = generated.isTSImportType;
            var generated_213 = generated.isTSImportEqualsDeclaration;
            var generated_214 = generated.isTSExternalModuleReference;
            var generated_215 = generated.isTSNonNullExpression;
            var generated_216 = generated.isTSExportAssignment;
            var generated_217 = generated.isTSNamespaceExportDeclaration;
            var generated_218 = generated.isTSTypeAnnotation;
            var generated_219 = generated.isTSTypeParameterInstantiation;
            var generated_220 = generated.isTSTypeParameterDeclaration;
            var generated_221 = generated.isTSTypeParameter;
            var generated_222 = generated.isExpression;
            var generated_223 = generated.isBinary;
            var generated_224 = generated.isScopable;
            var generated_225 = generated.isBlockParent;
            var generated_226 = generated.isBlock;
            var generated_227 = generated.isStatement;
            var generated_228 = generated.isTerminatorless;
            var generated_229 = generated.isCompletionStatement;
            var generated_230 = generated.isConditional;
            var generated_231 = generated.isLoop;
            var generated_232 = generated.isWhile;
            var generated_233 = generated.isExpressionWrapper;
            var generated_234 = generated.isFor;
            var generated_235 = generated.isForXStatement;
            var generated_236 = generated.isFunction;
            var generated_237 = generated.isFunctionParent;
            var generated_238 = generated.isPureish;
            var generated_239 = generated.isDeclaration;
            var generated_240 = generated.isPatternLike;
            var generated_241 = generated.isLVal;
            var generated_242 = generated.isTSEntityName;
            var generated_243 = generated.isLiteral;
            var generated_244 = generated.isImmutable;
            var generated_245 = generated.isUserWhitespacable;
            var generated_246 = generated.isMethod;
            var generated_247 = generated.isObjectMember;
            var generated_248 = generated.isProperty;
            var generated_249 = generated.isUnaryLike;
            var generated_250 = generated.isPattern;
            var generated_251 = generated.isClass;
            var generated_252 = generated.isModuleDeclaration;
            var generated_253 = generated.isExportDeclaration;
            var generated_254 = generated.isModuleSpecifier;
            var generated_255 = generated.isFlow;
            var generated_256 = generated.isFlowType;
            var generated_257 = generated.isFlowBaseAnnotation;
            var generated_258 = generated.isFlowDeclaration;
            var generated_259 = generated.isFlowPredicate;
            var generated_260 = generated.isJSX;
            var generated_261 = generated.isPrivate;
            var generated_262 = generated.isTSTypeElement;
            var generated_263 = generated.isTSType;
            var generated_264 = generated.isNumberLiteral;
            var generated_265 = generated.isRegexLiteral;
            var generated_266 = generated.isRestProperty;
            var generated_267 = generated.isSpreadProperty;

            var matchesPattern_1 = createCommonjsModule(function (module, exports) {

            Object.defineProperty(exports, "__esModule", {
              value: true
            });
            exports.default = matchesPattern;



            function matchesPattern(member, match, allowPartial) {
              if (!(0, generated.isMemberExpression)(member)) return false;
              const parts = Array.isArray(match) ? match : match.split(".");
              const nodes = [];
              let node;

              for (node = member; (0, generated.isMemberExpression)(node); node = node.object) {
                nodes.push(node.property);
              }

              nodes.push(node);
              if (nodes.length < parts.length) return false;
              if (!allowPartial && nodes.length > parts.length) return false;

              for (let i = 0, j = nodes.length - 1; i < parts.length; i++, j--) {
                const node = nodes[j];
                let value;

                if ((0, generated.isIdentifier)(node)) {
                  value = node.name;
                } else if ((0, generated.isStringLiteral)(node)) {
                  value = node.value;
                } else {
                  return false;
                }

                if (parts[i] !== value) return false;
              }

              return true;
            }
            });

            unwrapExports(matchesPattern_1);

            var buildMatchMemberExpression_1 = createCommonjsModule(function (module, exports) {

            Object.defineProperty(exports, "__esModule", {
              value: true
            });
            exports.default = buildMatchMemberExpression;

            var _matchesPattern = _interopRequireDefault(matchesPattern_1);

            function _interopRequireDefault(obj) {
              return obj && obj.__esModule ? obj : {
                default: obj
              };
            }

            function buildMatchMemberExpression(match, allowPartial) {
              const parts = match.split(".");
              return member => (0, _matchesPattern.default)(member, parts, allowPartial);
            }
            });

            unwrapExports(buildMatchMemberExpression_1);

            var isReactComponent_1 = createCommonjsModule(function (module, exports) {

            Object.defineProperty(exports, "__esModule", {
              value: true
            });
            exports.default = void 0;

            var _buildMatchMemberExpression = _interopRequireDefault(buildMatchMemberExpression_1);

            function _interopRequireDefault(obj) {
              return obj && obj.__esModule ? obj : {
                default: obj
              };
            }

            const isReactComponent = (0, _buildMatchMemberExpression.default)("React.Component");
            var _default = isReactComponent;
            exports.default = _default;
            });

            unwrapExports(isReactComponent_1);

            var isCompatTag_1 = createCommonjsModule(function (module, exports) {

            Object.defineProperty(exports, "__esModule", {
              value: true
            });
            exports.default = isCompatTag;

            function isCompatTag(tagName) {
              return !!tagName && /^[a-z]/.test(tagName);
            }
            });

            unwrapExports(isCompatTag_1);

            /**
             * Removes all key-value entries from the list cache.
             *
             * @private
             * @name clear
             * @memberOf ListCache
             */
            function listCacheClear() {
              this.__data__ = [];
              this.size = 0;
            }

            var _listCacheClear = listCacheClear;

            /**
             * Performs a
             * [`SameValueZero`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero)
             * comparison between two values to determine if they are equivalent.
             *
             * @static
             * @memberOf _
             * @since 4.0.0
             * @category Lang
             * @param {*} value The value to compare.
             * @param {*} other The other value to compare.
             * @returns {boolean} Returns `true` if the values are equivalent, else `false`.
             * @example
             *
             * var object = { 'a': 1 };
             * var other = { 'a': 1 };
             *
             * _.eq(object, object);
             * // => true
             *
             * _.eq(object, other);
             * // => false
             *
             * _.eq('a', 'a');
             * // => true
             *
             * _.eq('a', Object('a'));
             * // => false
             *
             * _.eq(NaN, NaN);
             * // => true
             */
            function eq(value, other) {
              return value === other || value !== value && other !== other;
            }

            var eq_1 = eq;

            /**
             * Gets the index at which the `key` is found in `array` of key-value pairs.
             *
             * @private
             * @param {Array} array The array to inspect.
             * @param {*} key The key to search for.
             * @returns {number} Returns the index of the matched value, else `-1`.
             */


            function assocIndexOf(array, key) {
              var length = array.length;

              while (length--) {
                if (eq_1(array[length][0], key)) {
                  return length;
                }
              }

              return -1;
            }

            var _assocIndexOf = assocIndexOf;

            /** Used for built-in method references. */


            var arrayProto = Array.prototype;
            /** Built-in value references. */

            var splice = arrayProto.splice;
            /**
             * Removes `key` and its value from the list cache.
             *
             * @private
             * @name delete
             * @memberOf ListCache
             * @param {string} key The key of the value to remove.
             * @returns {boolean} Returns `true` if the entry was removed, else `false`.
             */

            function listCacheDelete(key) {
              var data = this.__data__,
                  index = _assocIndexOf(data, key);

              if (index < 0) {
                return false;
              }

              var lastIndex = data.length - 1;

              if (index == lastIndex) {
                data.pop();
              } else {
                splice.call(data, index, 1);
              }

              --this.size;
              return true;
            }

            var _listCacheDelete = listCacheDelete;

            /**
             * Gets the list cache value for `key`.
             *
             * @private
             * @name get
             * @memberOf ListCache
             * @param {string} key The key of the value to get.
             * @returns {*} Returns the entry value.
             */


            function listCacheGet(key) {
              var data = this.__data__,
                  index = _assocIndexOf(data, key);
              return index < 0 ? undefined : data[index][1];
            }

            var _listCacheGet = listCacheGet;

            /**
             * Checks if a list cache value for `key` exists.
             *
             * @private
             * @name has
             * @memberOf ListCache
             * @param {string} key The key of the entry to check.
             * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
             */


            function listCacheHas(key) {
              return _assocIndexOf(this.__data__, key) > -1;
            }

            var _listCacheHas = listCacheHas;

            /**
             * Sets the list cache `key` to `value`.
             *
             * @private
             * @name set
             * @memberOf ListCache
             * @param {string} key The key of the value to set.
             * @param {*} value The value to set.
             * @returns {Object} Returns the list cache instance.
             */


            function listCacheSet(key, value) {
              var data = this.__data__,
                  index = _assocIndexOf(data, key);

              if (index < 0) {
                ++this.size;
                data.push([key, value]);
              } else {
                data[index][1] = value;
              }

              return this;
            }

            var _listCacheSet = listCacheSet;

            /**
             * Creates an list cache object.
             *
             * @private
             * @constructor
             * @param {Array} [entries] The key-value pairs to cache.
             */


            function ListCache(entries) {
              var index = -1,
                  length = entries == null ? 0 : entries.length;
              this.clear();

              while (++index < length) {
                var entry = entries[index];
                this.set(entry[0], entry[1]);
              }
            } // Add methods to `ListCache`.


            ListCache.prototype.clear = _listCacheClear;
            ListCache.prototype['delete'] = _listCacheDelete;
            ListCache.prototype.get = _listCacheGet;
            ListCache.prototype.has = _listCacheHas;
            ListCache.prototype.set = _listCacheSet;
            var _ListCache = ListCache;

            /**
             * Removes all key-value entries from the stack.
             *
             * @private
             * @name clear
             * @memberOf Stack
             */


            function stackClear() {
              this.__data__ = new _ListCache();
              this.size = 0;
            }

            var _stackClear = stackClear;

            /**
             * Removes `key` and its value from the stack.
             *
             * @private
             * @name delete
             * @memberOf Stack
             * @param {string} key The key of the value to remove.
             * @returns {boolean} Returns `true` if the entry was removed, else `false`.
             */
            function stackDelete(key) {
              var data = this.__data__,
                  result = data['delete'](key);
              this.size = data.size;
              return result;
            }

            var _stackDelete = stackDelete;

            /**
             * Gets the stack value for `key`.
             *
             * @private
             * @name get
             * @memberOf Stack
             * @param {string} key The key of the value to get.
             * @returns {*} Returns the entry value.
             */
            function stackGet(key) {
              return this.__data__.get(key);
            }

            var _stackGet = stackGet;

            /**
             * Checks if a stack value for `key` exists.
             *
             * @private
             * @name has
             * @memberOf Stack
             * @param {string} key The key of the entry to check.
             * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
             */
            function stackHas(key) {
              return this.__data__.has(key);
            }

            var _stackHas = stackHas;

            /** Detect free variable `global` from Node.js. */
            var freeGlobal = typeof commonjsGlobal == 'object' && commonjsGlobal && commonjsGlobal.Object === Object && commonjsGlobal;
            var _freeGlobal = freeGlobal;

            /** Detect free variable `self`. */


            var freeSelf = typeof self == 'object' && self && self.Object === Object && self;
            /** Used as a reference to the global object. */

            var root = _freeGlobal || freeSelf || Function('return this')();
            var _root = root;

            /** Built-in value references. */


            var Symbol$1 = _root.Symbol;
            var _Symbol = Symbol$1;

            /** Used for built-in method references. */


            var objectProto = Object.prototype;
            /** Used to check objects for own properties. */

            var hasOwnProperty = objectProto.hasOwnProperty;
            /**
             * Used to resolve the
             * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
             * of values.
             */

            var nativeObjectToString = objectProto.toString;
            /** Built-in value references. */

            var symToStringTag = _Symbol ? _Symbol.toStringTag : undefined;
            /**
             * A specialized version of `baseGetTag` which ignores `Symbol.toStringTag` values.
             *
             * @private
             * @param {*} value The value to query.
             * @returns {string} Returns the raw `toStringTag`.
             */

            function getRawTag(value) {
              var isOwn = hasOwnProperty.call(value, symToStringTag),
                  tag = value[symToStringTag];

              try {
                value[symToStringTag] = undefined;
                var unmasked = true;
              } catch (e) {}

              var result = nativeObjectToString.call(value);

              if (unmasked) {
                if (isOwn) {
                  value[symToStringTag] = tag;
                } else {
                  delete value[symToStringTag];
                }
              }

              return result;
            }

            var _getRawTag = getRawTag;

            /** Used for built-in method references. */
            var objectProto$1 = Object.prototype;
            /**
             * Used to resolve the
             * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
             * of values.
             */

            var nativeObjectToString$1 = objectProto$1.toString;
            /**
             * Converts `value` to a string using `Object.prototype.toString`.
             *
             * @private
             * @param {*} value The value to convert.
             * @returns {string} Returns the converted string.
             */

            function objectToString(value) {
              return nativeObjectToString$1.call(value);
            }

            var _objectToString = objectToString;

            /** `Object#toString` result references. */


            var nullTag = '[object Null]',
                undefinedTag = '[object Undefined]';
            /** Built-in value references. */

            var symToStringTag$1 = _Symbol ? _Symbol.toStringTag : undefined;
            /**
             * The base implementation of `getTag` without fallbacks for buggy environments.
             *
             * @private
             * @param {*} value The value to query.
             * @returns {string} Returns the `toStringTag`.
             */

            function baseGetTag(value) {
              if (value == null) {
                return value === undefined ? undefinedTag : nullTag;
              }

              return symToStringTag$1 && symToStringTag$1 in Object(value) ? _getRawTag(value) : _objectToString(value);
            }

            var _baseGetTag = baseGetTag;

            /**
             * Checks if `value` is the
             * [language type](http://www.ecma-international.org/ecma-262/7.0/#sec-ecmascript-language-types)
             * of `Object`. (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
             *
             * @static
             * @memberOf _
             * @since 0.1.0
             * @category Lang
             * @param {*} value The value to check.
             * @returns {boolean} Returns `true` if `value` is an object, else `false`.
             * @example
             *
             * _.isObject({});
             * // => true
             *
             * _.isObject([1, 2, 3]);
             * // => true
             *
             * _.isObject(_.noop);
             * // => true
             *
             * _.isObject(null);
             * // => false
             */
            function isObject(value) {
              var type = typeof value;
              return value != null && (type == 'object' || type == 'function');
            }

            var isObject_1 = isObject;

            /** `Object#toString` result references. */


            var asyncTag = '[object AsyncFunction]',
                funcTag = '[object Function]',
                genTag = '[object GeneratorFunction]',
                proxyTag = '[object Proxy]';
            /**
             * Checks if `value` is classified as a `Function` object.
             *
             * @static
             * @memberOf _
             * @since 0.1.0
             * @category Lang
             * @param {*} value The value to check.
             * @returns {boolean} Returns `true` if `value` is a function, else `false`.
             * @example
             *
             * _.isFunction(_);
             * // => true
             *
             * _.isFunction(/abc/);
             * // => false
             */

            function isFunction(value) {
              if (!isObject_1(value)) {
                return false;
              } // The use of `Object#toString` avoids issues with the `typeof` operator
              // in Safari 9 which returns 'object' for typed arrays and other constructors.


              var tag = _baseGetTag(value);
              return tag == funcTag || tag == genTag || tag == asyncTag || tag == proxyTag;
            }

            var isFunction_1 = isFunction;

            /** Used to detect overreaching core-js shims. */


            var coreJsData = _root['__core-js_shared__'];
            var _coreJsData = coreJsData;

            /** Used to detect methods masquerading as native. */


            var maskSrcKey = function () {
              var uid = /[^.]+$/.exec(_coreJsData && _coreJsData.keys && _coreJsData.keys.IE_PROTO || '');
              return uid ? 'Symbol(src)_1.' + uid : '';
            }();
            /**
             * Checks if `func` has its source masked.
             *
             * @private
             * @param {Function} func The function to check.
             * @returns {boolean} Returns `true` if `func` is masked, else `false`.
             */


            function isMasked(func) {
              return !!maskSrcKey && maskSrcKey in func;
            }

            var _isMasked = isMasked;

            /** Used for built-in method references. */
            var funcProto = Function.prototype;
            /** Used to resolve the decompiled source of functions. */

            var funcToString = funcProto.toString;
            /**
             * Converts `func` to its source code.
             *
             * @private
             * @param {Function} func The function to convert.
             * @returns {string} Returns the source code.
             */

            function toSource(func) {
              if (func != null) {
                try {
                  return funcToString.call(func);
                } catch (e) {}

                try {
                  return func + '';
                } catch (e) {}
              }

              return '';
            }

            var _toSource = toSource;

            /**
             * Used to match `RegExp`
             * [syntax characters](http://ecma-international.org/ecma-262/7.0/#sec-patterns).
             */


            var reRegExpChar = /[\\^$.*+?()[\]{}|]/g;
            /** Used to detect host constructors (Safari). */

            var reIsHostCtor = /^\[object .+?Constructor\]$/;
            /** Used for built-in method references. */

            var funcProto$1 = Function.prototype,
                objectProto$2 = Object.prototype;
            /** Used to resolve the decompiled source of functions. */

            var funcToString$1 = funcProto$1.toString;
            /** Used to check objects for own properties. */

            var hasOwnProperty$1 = objectProto$2.hasOwnProperty;
            /** Used to detect if a method is native. */

            var reIsNative = RegExp('^' + funcToString$1.call(hasOwnProperty$1).replace(reRegExpChar, '\\$&').replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, '$1.*?') + '$');
            /**
             * The base implementation of `_.isNative` without bad shim checks.
             *
             * @private
             * @param {*} value The value to check.
             * @returns {boolean} Returns `true` if `value` is a native function,
             *  else `false`.
             */

            function baseIsNative(value) {
              if (!isObject_1(value) || _isMasked(value)) {
                return false;
              }

              var pattern = isFunction_1(value) ? reIsNative : reIsHostCtor;
              return pattern.test(_toSource(value));
            }

            var _baseIsNative = baseIsNative;

            /**
             * Gets the value at `key` of `object`.
             *
             * @private
             * @param {Object} [object] The object to query.
             * @param {string} key The key of the property to get.
             * @returns {*} Returns the property value.
             */
            function getValue(object, key) {
              return object == null ? undefined : object[key];
            }

            var _getValue = getValue;

            /**
             * Gets the native function at `key` of `object`.
             *
             * @private
             * @param {Object} object The object to query.
             * @param {string} key The key of the method to get.
             * @returns {*} Returns the function if it's native, else `undefined`.
             */


            function getNative(object, key) {
              var value = _getValue(object, key);
              return _baseIsNative(value) ? value : undefined;
            }

            var _getNative = getNative;

            /* Built-in method references that are verified to be native. */


            var Map = _getNative(_root, 'Map');
            var _Map = Map;

            /* Built-in method references that are verified to be native. */


            var nativeCreate = _getNative(Object, 'create');
            var _nativeCreate = nativeCreate;

            /**
             * Removes all key-value entries from the hash.
             *
             * @private
             * @name clear
             * @memberOf Hash
             */


            function hashClear() {
              this.__data__ = _nativeCreate ? _nativeCreate(null) : {};
              this.size = 0;
            }

            var _hashClear = hashClear;

            /**
             * Removes `key` and its value from the hash.
             *
             * @private
             * @name delete
             * @memberOf Hash
             * @param {Object} hash The hash to modify.
             * @param {string} key The key of the value to remove.
             * @returns {boolean} Returns `true` if the entry was removed, else `false`.
             */
            function hashDelete(key) {
              var result = this.has(key) && delete this.__data__[key];
              this.size -= result ? 1 : 0;
              return result;
            }

            var _hashDelete = hashDelete;

            /** Used to stand-in for `undefined` hash values. */


            var HASH_UNDEFINED = '__lodash_hash_undefined__';
            /** Used for built-in method references. */

            var objectProto$3 = Object.prototype;
            /** Used to check objects for own properties. */

            var hasOwnProperty$2 = objectProto$3.hasOwnProperty;
            /**
             * Gets the hash value for `key`.
             *
             * @private
             * @name get
             * @memberOf Hash
             * @param {string} key The key of the value to get.
             * @returns {*} Returns the entry value.
             */

            function hashGet(key) {
              var data = this.__data__;

              if (_nativeCreate) {
                var result = data[key];
                return result === HASH_UNDEFINED ? undefined : result;
              }

              return hasOwnProperty$2.call(data, key) ? data[key] : undefined;
            }

            var _hashGet = hashGet;

            /** Used for built-in method references. */


            var objectProto$4 = Object.prototype;
            /** Used to check objects for own properties. */

            var hasOwnProperty$3 = objectProto$4.hasOwnProperty;
            /**
             * Checks if a hash value for `key` exists.
             *
             * @private
             * @name has
             * @memberOf Hash
             * @param {string} key The key of the entry to check.
             * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
             */

            function hashHas(key) {
              var data = this.__data__;
              return _nativeCreate ? data[key] !== undefined : hasOwnProperty$3.call(data, key);
            }

            var _hashHas = hashHas;

            /** Used to stand-in for `undefined` hash values. */


            var HASH_UNDEFINED$1 = '__lodash_hash_undefined__';
            /**
             * Sets the hash `key` to `value`.
             *
             * @private
             * @name set
             * @memberOf Hash
             * @param {string} key The key of the value to set.
             * @param {*} value The value to set.
             * @returns {Object} Returns the hash instance.
             */

            function hashSet(key, value) {
              var data = this.__data__;
              this.size += this.has(key) ? 0 : 1;
              data[key] = _nativeCreate && value === undefined ? HASH_UNDEFINED$1 : value;
              return this;
            }

            var _hashSet = hashSet;

            /**
             * Creates a hash object.
             *
             * @private
             * @constructor
             * @param {Array} [entries] The key-value pairs to cache.
             */


            function Hash(entries) {
              var index = -1,
                  length = entries == null ? 0 : entries.length;
              this.clear();

              while (++index < length) {
                var entry = entries[index];
                this.set(entry[0], entry[1]);
              }
            } // Add methods to `Hash`.


            Hash.prototype.clear = _hashClear;
            Hash.prototype['delete'] = _hashDelete;
            Hash.prototype.get = _hashGet;
            Hash.prototype.has = _hashHas;
            Hash.prototype.set = _hashSet;
            var _Hash = Hash;

            /**
             * Removes all key-value entries from the map.
             *
             * @private
             * @name clear
             * @memberOf MapCache
             */


            function mapCacheClear() {
              this.size = 0;
              this.__data__ = {
                'hash': new _Hash(),
                'map': new (_Map || _ListCache)(),
                'string': new _Hash()
              };
            }

            var _mapCacheClear = mapCacheClear;

            /**
             * Checks if `value` is suitable for use as unique object key.
             *
             * @private
             * @param {*} value The value to check.
             * @returns {boolean} Returns `true` if `value` is suitable, else `false`.
             */
            function isKeyable(value) {
              var type = typeof value;
              return type == 'string' || type == 'number' || type == 'symbol' || type == 'boolean' ? value !== '__proto__' : value === null;
            }

            var _isKeyable = isKeyable;

            /**
             * Gets the data for `map`.
             *
             * @private
             * @param {Object} map The map to query.
             * @param {string} key The reference key.
             * @returns {*} Returns the map data.
             */


            function getMapData(map, key) {
              var data = map.__data__;
              return _isKeyable(key) ? data[typeof key == 'string' ? 'string' : 'hash'] : data.map;
            }

            var _getMapData = getMapData;

            /**
             * Removes `key` and its value from the map.
             *
             * @private
             * @name delete
             * @memberOf MapCache
             * @param {string} key The key of the value to remove.
             * @returns {boolean} Returns `true` if the entry was removed, else `false`.
             */


            function mapCacheDelete(key) {
              var result = _getMapData(this, key)['delete'](key);
              this.size -= result ? 1 : 0;
              return result;
            }

            var _mapCacheDelete = mapCacheDelete;

            /**
             * Gets the map value for `key`.
             *
             * @private
             * @name get
             * @memberOf MapCache
             * @param {string} key The key of the value to get.
             * @returns {*} Returns the entry value.
             */


            function mapCacheGet(key) {
              return _getMapData(this, key).get(key);
            }

            var _mapCacheGet = mapCacheGet;

            /**
             * Checks if a map value for `key` exists.
             *
             * @private
             * @name has
             * @memberOf MapCache
             * @param {string} key The key of the entry to check.
             * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
             */


            function mapCacheHas(key) {
              return _getMapData(this, key).has(key);
            }

            var _mapCacheHas = mapCacheHas;

            /**
             * Sets the map `key` to `value`.
             *
             * @private
             * @name set
             * @memberOf MapCache
             * @param {string} key The key of the value to set.
             * @param {*} value The value to set.
             * @returns {Object} Returns the map cache instance.
             */


            function mapCacheSet(key, value) {
              var data = _getMapData(this, key),
                  size = data.size;
              data.set(key, value);
              this.size += data.size == size ? 0 : 1;
              return this;
            }

            var _mapCacheSet = mapCacheSet;

            /**
             * Creates a map cache object to store key-value pairs.
             *
             * @private
             * @constructor
             * @param {Array} [entries] The key-value pairs to cache.
             */


            function MapCache(entries) {
              var index = -1,
                  length = entries == null ? 0 : entries.length;
              this.clear();

              while (++index < length) {
                var entry = entries[index];
                this.set(entry[0], entry[1]);
              }
            } // Add methods to `MapCache`.


            MapCache.prototype.clear = _mapCacheClear;
            MapCache.prototype['delete'] = _mapCacheDelete;
            MapCache.prototype.get = _mapCacheGet;
            MapCache.prototype.has = _mapCacheHas;
            MapCache.prototype.set = _mapCacheSet;
            var _MapCache = MapCache;

            /** Used as the size to enable large array optimizations. */


            var LARGE_ARRAY_SIZE = 200;
            /**
             * Sets the stack `key` to `value`.
             *
             * @private
             * @name set
             * @memberOf Stack
             * @param {string} key The key of the value to set.
             * @param {*} value The value to set.
             * @returns {Object} Returns the stack cache instance.
             */

            function stackSet(key, value) {
              var data = this.__data__;

              if (data instanceof _ListCache) {
                var pairs = data.__data__;

                if (!_Map || pairs.length < LARGE_ARRAY_SIZE - 1) {
                  pairs.push([key, value]);
                  this.size = ++data.size;
                  return this;
                }

                data = this.__data__ = new _MapCache(pairs);
              }

              data.set(key, value);
              this.size = data.size;
              return this;
            }

            var _stackSet = stackSet;

            /**
             * Creates a stack cache object to store key-value pairs.
             *
             * @private
             * @constructor
             * @param {Array} [entries] The key-value pairs to cache.
             */


            function Stack(entries) {
              var data = this.__data__ = new _ListCache(entries);
              this.size = data.size;
            } // Add methods to `Stack`.


            Stack.prototype.clear = _stackClear;
            Stack.prototype['delete'] = _stackDelete;
            Stack.prototype.get = _stackGet;
            Stack.prototype.has = _stackHas;
            Stack.prototype.set = _stackSet;
            var _Stack = Stack;

            /**
             * A specialized version of `_.forEach` for arrays without support for
             * iteratee shorthands.
             *
             * @private
             * @param {Array} [array] The array to iterate over.
             * @param {Function} iteratee The function invoked per iteration.
             * @returns {Array} Returns `array`.
             */
            function arrayEach(array, iteratee) {
              var index = -1,
                  length = array == null ? 0 : array.length;

              while (++index < length) {
                if (iteratee(array[index], index, array) === false) {
                  break;
                }
              }

              return array;
            }

            var _arrayEach = arrayEach;

            var defineProperty = function () {
              try {
                var func = _getNative(Object, 'defineProperty');
                func({}, '', {});
                return func;
              } catch (e) {}
            }();

            var _defineProperty = defineProperty;

            /**
             * The base implementation of `assignValue` and `assignMergeValue` without
             * value checks.
             *
             * @private
             * @param {Object} object The object to modify.
             * @param {string} key The key of the property to assign.
             * @param {*} value The value to assign.
             */


            function baseAssignValue(object, key, value) {
              if (key == '__proto__' && _defineProperty) {
                _defineProperty(object, key, {
                  'configurable': true,
                  'enumerable': true,
                  'value': value,
                  'writable': true
                });
              } else {
                object[key] = value;
              }
            }

            var _baseAssignValue = baseAssignValue;

            /** Used for built-in method references. */


            var objectProto$5 = Object.prototype;
            /** Used to check objects for own properties. */

            var hasOwnProperty$4 = objectProto$5.hasOwnProperty;
            /**
             * Assigns `value` to `key` of `object` if the existing value is not equivalent
             * using [`SameValueZero`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero)
             * for equality comparisons.
             *
             * @private
             * @param {Object} object The object to modify.
             * @param {string} key The key of the property to assign.
             * @param {*} value The value to assign.
             */

            function assignValue(object, key, value) {
              var objValue = object[key];

              if (!(hasOwnProperty$4.call(object, key) && eq_1(objValue, value)) || value === undefined && !(key in object)) {
                _baseAssignValue(object, key, value);
              }
            }

            var _assignValue = assignValue;

            /**
             * Copies properties of `source` to `object`.
             *
             * @private
             * @param {Object} source The object to copy properties from.
             * @param {Array} props The property identifiers to copy.
             * @param {Object} [object={}] The object to copy properties to.
             * @param {Function} [customizer] The function to customize copied values.
             * @returns {Object} Returns `object`.
             */


            function copyObject(source, props, object, customizer) {
              var isNew = !object;
              object || (object = {});
              var index = -1,
                  length = props.length;

              while (++index < length) {
                var key = props[index];
                var newValue = customizer ? customizer(object[key], source[key], key, object, source) : undefined;

                if (newValue === undefined) {
                  newValue = source[key];
                }

                if (isNew) {
                  _baseAssignValue(object, key, newValue);
                } else {
                  _assignValue(object, key, newValue);
                }
              }

              return object;
            }

            var _copyObject = copyObject;

            /**
             * The base implementation of `_.times` without support for iteratee shorthands
             * or max array length checks.
             *
             * @private
             * @param {number} n The number of times to invoke `iteratee`.
             * @param {Function} iteratee The function invoked per iteration.
             * @returns {Array} Returns the array of results.
             */
            function baseTimes(n, iteratee) {
              var index = -1,
                  result = Array(n);

              while (++index < n) {
                result[index] = iteratee(index);
              }

              return result;
            }

            var _baseTimes = baseTimes;

            /**
             * Checks if `value` is object-like. A value is object-like if it's not `null`
             * and has a `typeof` result of "object".
             *
             * @static
             * @memberOf _
             * @since 4.0.0
             * @category Lang
             * @param {*} value The value to check.
             * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
             * @example
             *
             * _.isObjectLike({});
             * // => true
             *
             * _.isObjectLike([1, 2, 3]);
             * // => true
             *
             * _.isObjectLike(_.noop);
             * // => false
             *
             * _.isObjectLike(null);
             * // => false
             */
            function isObjectLike(value) {
              return value != null && typeof value == 'object';
            }

            var isObjectLike_1 = isObjectLike;

            /** `Object#toString` result references. */


            var argsTag = '[object Arguments]';
            /**
             * The base implementation of `_.isArguments`.
             *
             * @private
             * @param {*} value The value to check.
             * @returns {boolean} Returns `true` if `value` is an `arguments` object,
             */

            function baseIsArguments(value) {
              return isObjectLike_1(value) && _baseGetTag(value) == argsTag;
            }

            var _baseIsArguments = baseIsArguments;

            /** Used for built-in method references. */


            var objectProto$6 = Object.prototype;
            /** Used to check objects for own properties. */

            var hasOwnProperty$5 = objectProto$6.hasOwnProperty;
            /** Built-in value references. */

            var propertyIsEnumerable = objectProto$6.propertyIsEnumerable;
            /**
             * Checks if `value` is likely an `arguments` object.
             *
             * @static
             * @memberOf _
             * @since 0.1.0
             * @category Lang
             * @param {*} value The value to check.
             * @returns {boolean} Returns `true` if `value` is an `arguments` object,
             *  else `false`.
             * @example
             *
             * _.isArguments(function() { return arguments; }());
             * // => true
             *
             * _.isArguments([1, 2, 3]);
             * // => false
             */

            var isArguments = _baseIsArguments(function () {
              return arguments;
            }()) ? _baseIsArguments : function (value) {
              return isObjectLike_1(value) && hasOwnProperty$5.call(value, 'callee') && !propertyIsEnumerable.call(value, 'callee');
            };
            var isArguments_1 = isArguments;

            /**
             * Checks if `value` is classified as an `Array` object.
             *
             * @static
             * @memberOf _
             * @since 0.1.0
             * @category Lang
             * @param {*} value The value to check.
             * @returns {boolean} Returns `true` if `value` is an array, else `false`.
             * @example
             *
             * _.isArray([1, 2, 3]);
             * // => true
             *
             * _.isArray(document.body.children);
             * // => false
             *
             * _.isArray('abc');
             * // => false
             *
             * _.isArray(_.noop);
             * // => false
             */
            var isArray = Array.isArray;
            var isArray_1 = isArray;

            /**
             * This method returns `false`.
             *
             * @static
             * @memberOf _
             * @since 4.13.0
             * @category Util
             * @returns {boolean} Returns `false`.
             * @example
             *
             * _.times(2, _.stubFalse);
             * // => [false, false]
             */
            function stubFalse() {
              return false;
            }

            var stubFalse_1 = stubFalse;

            var isBuffer_1 = createCommonjsModule(function (module, exports) {
            /** Detect free variable `exports`. */


            var freeExports = exports && !exports.nodeType && exports;
            /** Detect free variable `module`. */

            var freeModule = freeExports && 'object' == 'object' && module && !module.nodeType && module;
            /** Detect the popular CommonJS extension `module.exports`. */

            var moduleExports = freeModule && freeModule.exports === freeExports;
            /** Built-in value references. */

            var Buffer = moduleExports ? _root.Buffer : undefined;
            /* Built-in method references for those with the same name as other `lodash` methods. */

            var nativeIsBuffer = Buffer ? Buffer.isBuffer : undefined;
            /**
             * Checks if `value` is a buffer.
             *
             * @static
             * @memberOf _
             * @since 4.3.0
             * @category Lang
             * @param {*} value The value to check.
             * @returns {boolean} Returns `true` if `value` is a buffer, else `false`.
             * @example
             *
             * _.isBuffer(new Buffer(2));
             * // => true
             *
             * _.isBuffer(new Uint8Array(2));
             * // => false
             */

            var isBuffer = nativeIsBuffer || stubFalse_1;
            module.exports = isBuffer;
            });

            /** Used as references for various `Number` constants. */
            var MAX_SAFE_INTEGER = 9007199254740991;
            /** Used to detect unsigned integer values. */

            var reIsUint = /^(?:0|[1-9]\d*)$/;
            /**
             * Checks if `value` is a valid array-like index.
             *
             * @private
             * @param {*} value The value to check.
             * @param {number} [length=MAX_SAFE_INTEGER] The upper bounds of a valid index.
             * @returns {boolean} Returns `true` if `value` is a valid index, else `false`.
             */

            function isIndex(value, length) {
              var type = typeof value;
              length = length == null ? MAX_SAFE_INTEGER : length;
              return !!length && (type == 'number' || type != 'symbol' && reIsUint.test(value)) && value > -1 && value % 1 == 0 && value < length;
            }

            var _isIndex = isIndex;

            /** Used as references for various `Number` constants. */
            var MAX_SAFE_INTEGER$1 = 9007199254740991;
            /**
             * Checks if `value` is a valid array-like length.
             *
             * **Note:** This method is loosely based on
             * [`ToLength`](http://ecma-international.org/ecma-262/7.0/#sec-tolength).
             *
             * @static
             * @memberOf _
             * @since 4.0.0
             * @category Lang
             * @param {*} value The value to check.
             * @returns {boolean} Returns `true` if `value` is a valid length, else `false`.
             * @example
             *
             * _.isLength(3);
             * // => true
             *
             * _.isLength(Number.MIN_VALUE);
             * // => false
             *
             * _.isLength(Infinity);
             * // => false
             *
             * _.isLength('3');
             * // => false
             */

            function isLength(value) {
              return typeof value == 'number' && value > -1 && value % 1 == 0 && value <= MAX_SAFE_INTEGER$1;
            }

            var isLength_1 = isLength;

            /** `Object#toString` result references. */


            var argsTag$1 = '[object Arguments]',
                arrayTag = '[object Array]',
                boolTag = '[object Boolean]',
                dateTag = '[object Date]',
                errorTag = '[object Error]',
                funcTag$1 = '[object Function]',
                mapTag = '[object Map]',
                numberTag = '[object Number]',
                objectTag = '[object Object]',
                regexpTag = '[object RegExp]',
                setTag = '[object Set]',
                stringTag = '[object String]',
                weakMapTag = '[object WeakMap]';
            var arrayBufferTag = '[object ArrayBuffer]',
                dataViewTag = '[object DataView]',
                float32Tag = '[object Float32Array]',
                float64Tag = '[object Float64Array]',
                int8Tag = '[object Int8Array]',
                int16Tag = '[object Int16Array]',
                int32Tag = '[object Int32Array]',
                uint8Tag = '[object Uint8Array]',
                uint8ClampedTag = '[object Uint8ClampedArray]',
                uint16Tag = '[object Uint16Array]',
                uint32Tag = '[object Uint32Array]';
            /** Used to identify `toStringTag` values of typed arrays. */

            var typedArrayTags = {};
            typedArrayTags[float32Tag] = typedArrayTags[float64Tag] = typedArrayTags[int8Tag] = typedArrayTags[int16Tag] = typedArrayTags[int32Tag] = typedArrayTags[uint8Tag] = typedArrayTags[uint8ClampedTag] = typedArrayTags[uint16Tag] = typedArrayTags[uint32Tag] = true;
            typedArrayTags[argsTag$1] = typedArrayTags[arrayTag] = typedArrayTags[arrayBufferTag] = typedArrayTags[boolTag] = typedArrayTags[dataViewTag] = typedArrayTags[dateTag] = typedArrayTags[errorTag] = typedArrayTags[funcTag$1] = typedArrayTags[mapTag] = typedArrayTags[numberTag] = typedArrayTags[objectTag] = typedArrayTags[regexpTag] = typedArrayTags[setTag] = typedArrayTags[stringTag] = typedArrayTags[weakMapTag] = false;
            /**
             * The base implementation of `_.isTypedArray` without Node.js optimizations.
             *
             * @private
             * @param {*} value The value to check.
             * @returns {boolean} Returns `true` if `value` is a typed array, else `false`.
             */

            function baseIsTypedArray(value) {
              return isObjectLike_1(value) && isLength_1(value.length) && !!typedArrayTags[_baseGetTag(value)];
            }

            var _baseIsTypedArray = baseIsTypedArray;

            /**
             * The base implementation of `_.unary` without support for storing metadata.
             *
             * @private
             * @param {Function} func The function to cap arguments for.
             * @returns {Function} Returns the new capped function.
             */
            function baseUnary(func) {
              return function (value) {
                return func(value);
              };
            }

            var _baseUnary = baseUnary;

            var _nodeUtil = createCommonjsModule(function (module, exports) {
            /** Detect free variable `exports`. */


            var freeExports = exports && !exports.nodeType && exports;
            /** Detect free variable `module`. */

            var freeModule = freeExports && 'object' == 'object' && module && !module.nodeType && module;
            /** Detect the popular CommonJS extension `module.exports`. */

            var moduleExports = freeModule && freeModule.exports === freeExports;
            /** Detect free variable `process` from Node.js. */

            var freeProcess = moduleExports && _freeGlobal.process;
            /** Used to access faster Node.js helpers. */

            var nodeUtil = function () {
              try {
                // Use `util.types` for Node.js 10+.
                var types = freeModule && freeModule.require && freeModule.require('util').types;

                if (types) {
                  return types;
                } // Legacy `process.binding('util')` for Node.js < 10.


                return freeProcess && freeProcess.binding && freeProcess.binding('util');
              } catch (e) {}
            }();

            module.exports = nodeUtil;
            });

            /* Node.js helper references. */


            var nodeIsTypedArray = _nodeUtil && _nodeUtil.isTypedArray;
            /**
             * Checks if `value` is classified as a typed array.
             *
             * @static
             * @memberOf _
             * @since 3.0.0
             * @category Lang
             * @param {*} value The value to check.
             * @returns {boolean} Returns `true` if `value` is a typed array, else `false`.
             * @example
             *
             * _.isTypedArray(new Uint8Array);
             * // => true
             *
             * _.isTypedArray([]);
             * // => false
             */

            var isTypedArray = nodeIsTypedArray ? _baseUnary(nodeIsTypedArray) : _baseIsTypedArray;
            var isTypedArray_1 = isTypedArray;

            /** Used for built-in method references. */


            var objectProto$7 = Object.prototype;
            /** Used to check objects for own properties. */

            var hasOwnProperty$6 = objectProto$7.hasOwnProperty;
            /**
             * Creates an array of the enumerable property names of the array-like `value`.
             *
             * @private
             * @param {*} value The value to query.
             * @param {boolean} inherited Specify returning inherited property names.
             * @returns {Array} Returns the array of property names.
             */

            function arrayLikeKeys(value, inherited) {
              var isArr = isArray_1(value),
                  isArg = !isArr && isArguments_1(value),
                  isBuff = !isArr && !isArg && isBuffer_1(value),
                  isType = !isArr && !isArg && !isBuff && isTypedArray_1(value),
                  skipIndexes = isArr || isArg || isBuff || isType,
                  result = skipIndexes ? _baseTimes(value.length, String) : [],
                  length = result.length;

              for (var key in value) {
                if ((inherited || hasOwnProperty$6.call(value, key)) && !(skipIndexes && ( // Safari 9 has enumerable `arguments.length` in strict mode.
                key == 'length' || // Node.js 0.10 has enumerable non-index properties on buffers.
                isBuff && (key == 'offset' || key == 'parent') || // PhantomJS 2 has enumerable non-index properties on typed arrays.
                isType && (key == 'buffer' || key == 'byteLength' || key == 'byteOffset') || // Skip index properties.
                _isIndex(key, length)))) {
                  result.push(key);
                }
              }

              return result;
            }

            var _arrayLikeKeys = arrayLikeKeys;

            /** Used for built-in method references. */
            var objectProto$8 = Object.prototype;
            /**
             * Checks if `value` is likely a prototype object.
             *
             * @private
             * @param {*} value The value to check.
             * @returns {boolean} Returns `true` if `value` is a prototype, else `false`.
             */

            function isPrototype(value) {
              var Ctor = value && value.constructor,
                  proto = typeof Ctor == 'function' && Ctor.prototype || objectProto$8;
              return value === proto;
            }

            var _isPrototype = isPrototype;

            /**
             * Creates a unary function that invokes `func` with its argument transformed.
             *
             * @private
             * @param {Function} func The function to wrap.
             * @param {Function} transform The argument transform.
             * @returns {Function} Returns the new function.
             */
            function overArg(func, transform) {
              return function (arg) {
                return func(transform(arg));
              };
            }

            var _overArg = overArg;

            /* Built-in method references for those with the same name as other `lodash` methods. */


            var nativeKeys = _overArg(Object.keys, Object);
            var _nativeKeys = nativeKeys;

            /** Used for built-in method references. */


            var objectProto$9 = Object.prototype;
            /** Used to check objects for own properties. */

            var hasOwnProperty$7 = objectProto$9.hasOwnProperty;
            /**
             * The base implementation of `_.keys` which doesn't treat sparse arrays as dense.
             *
             * @private
             * @param {Object} object The object to query.
             * @returns {Array} Returns the array of property names.
             */

            function baseKeys(object) {
              if (!_isPrototype(object)) {
                return _nativeKeys(object);
              }

              var result = [];

              for (var key in Object(object)) {
                if (hasOwnProperty$7.call(object, key) && key != 'constructor') {
                  result.push(key);
                }
              }

              return result;
            }

            var _baseKeys = baseKeys;

            /**
             * Checks if `value` is array-like. A value is considered array-like if it's
             * not a function and has a `value.length` that's an integer greater than or
             * equal to `0` and less than or equal to `Number.MAX_SAFE_INTEGER`.
             *
             * @static
             * @memberOf _
             * @since 4.0.0
             * @category Lang
             * @param {*} value The value to check.
             * @returns {boolean} Returns `true` if `value` is array-like, else `false`.
             * @example
             *
             * _.isArrayLike([1, 2, 3]);
             * // => true
             *
             * _.isArrayLike(document.body.children);
             * // => true
             *
             * _.isArrayLike('abc');
             * // => true
             *
             * _.isArrayLike(_.noop);
             * // => false
             */


            function isArrayLike(value) {
              return value != null && isLength_1(value.length) && !isFunction_1(value);
            }

            var isArrayLike_1 = isArrayLike;

            /**
             * Creates an array of the own enumerable property names of `object`.
             *
             * **Note:** Non-object values are coerced to objects. See the
             * [ES spec](http://ecma-international.org/ecma-262/7.0/#sec-object.keys)
             * for more details.
             *
             * @static
             * @since 0.1.0
             * @memberOf _
             * @category Object
             * @param {Object} object The object to query.
             * @returns {Array} Returns the array of property names.
             * @example
             *
             * function Foo() {
             *   this.a = 1;
             *   this.b = 2;
             * }
             *
             * Foo.prototype.c = 3;
             *
             * _.keys(new Foo);
             * // => ['a', 'b'] (iteration order is not guaranteed)
             *
             * _.keys('hi');
             * // => ['0', '1']
             */


            function keys(object) {
              return isArrayLike_1(object) ? _arrayLikeKeys(object) : _baseKeys(object);
            }

            var keys_1 = keys;

            /**
             * The base implementation of `_.assign` without support for multiple sources
             * or `customizer` functions.
             *
             * @private
             * @param {Object} object The destination object.
             * @param {Object} source The source object.
             * @returns {Object} Returns `object`.
             */


            function baseAssign(object, source) {
              return object && _copyObject(source, keys_1(source), object);
            }

            var _baseAssign = baseAssign;

            /**
             * This function is like
             * [`Object.keys`](http://ecma-international.org/ecma-262/7.0/#sec-object.keys)
             * except that it includes inherited enumerable properties.
             *
             * @private
             * @param {Object} object The object to query.
             * @returns {Array} Returns the array of property names.
             */
            function nativeKeysIn(object) {
              var result = [];

              if (object != null) {
                for (var key in Object(object)) {
                  result.push(key);
                }
              }

              return result;
            }

            var _nativeKeysIn = nativeKeysIn;

            /** Used for built-in method references. */


            var objectProto$a = Object.prototype;
            /** Used to check objects for own properties. */

            var hasOwnProperty$8 = objectProto$a.hasOwnProperty;
            /**
             * The base implementation of `_.keysIn` which doesn't treat sparse arrays as dense.
             *
             * @private
             * @param {Object} object The object to query.
             * @returns {Array} Returns the array of property names.
             */

            function baseKeysIn(object) {
              if (!isObject_1(object)) {
                return _nativeKeysIn(object);
              }

              var isProto = _isPrototype(object),
                  result = [];

              for (var key in object) {
                if (!(key == 'constructor' && (isProto || !hasOwnProperty$8.call(object, key)))) {
                  result.push(key);
                }
              }

              return result;
            }

            var _baseKeysIn = baseKeysIn;

            /**
             * Creates an array of the own and inherited enumerable property names of `object`.
             *
             * **Note:** Non-object values are coerced to objects.
             *
             * @static
             * @memberOf _
             * @since 3.0.0
             * @category Object
             * @param {Object} object The object to query.
             * @returns {Array} Returns the array of property names.
             * @example
             *
             * function Foo() {
             *   this.a = 1;
             *   this.b = 2;
             * }
             *
             * Foo.prototype.c = 3;
             *
             * _.keysIn(new Foo);
             * // => ['a', 'b', 'c'] (iteration order is not guaranteed)
             */


            function keysIn$1(object) {
              return isArrayLike_1(object) ? _arrayLikeKeys(object, true) : _baseKeysIn(object);
            }

            var keysIn_1 = keysIn$1;

            /**
             * The base implementation of `_.assignIn` without support for multiple sources
             * or `customizer` functions.
             *
             * @private
             * @param {Object} object The destination object.
             * @param {Object} source The source object.
             * @returns {Object} Returns `object`.
             */


            function baseAssignIn(object, source) {
              return object && _copyObject(source, keysIn_1(source), object);
            }

            var _baseAssignIn = baseAssignIn;

            var _cloneBuffer = createCommonjsModule(function (module, exports) {
            /** Detect free variable `exports`. */


            var freeExports = exports && !exports.nodeType && exports;
            /** Detect free variable `module`. */

            var freeModule = freeExports && 'object' == 'object' && module && !module.nodeType && module;
            /** Detect the popular CommonJS extension `module.exports`. */

            var moduleExports = freeModule && freeModule.exports === freeExports;
            /** Built-in value references. */

            var Buffer = moduleExports ? _root.Buffer : undefined,
                allocUnsafe = Buffer ? Buffer.allocUnsafe : undefined;
            /**
             * Creates a clone of  `buffer`.
             *
             * @private
             * @param {Buffer} buffer The buffer to clone.
             * @param {boolean} [isDeep] Specify a deep clone.
             * @returns {Buffer} Returns the cloned buffer.
             */

            function cloneBuffer(buffer, isDeep) {
              if (isDeep) {
                return buffer.slice();
              }

              var length = buffer.length,
                  result = allocUnsafe ? allocUnsafe(length) : new buffer.constructor(length);
              buffer.copy(result);
              return result;
            }

            module.exports = cloneBuffer;
            });

            /**
             * Copies the values of `source` to `array`.
             *
             * @private
             * @param {Array} source The array to copy values from.
             * @param {Array} [array=[]] The array to copy values to.
             * @returns {Array} Returns `array`.
             */
            function copyArray(source, array) {
              var index = -1,
                  length = source.length;
              array || (array = Array(length));

              while (++index < length) {
                array[index] = source[index];
              }

              return array;
            }

            var _copyArray = copyArray;

            /**
             * A specialized version of `_.filter` for arrays without support for
             * iteratee shorthands.
             *
             * @private
             * @param {Array} [array] The array to iterate over.
             * @param {Function} predicate The function invoked per iteration.
             * @returns {Array} Returns the new filtered array.
             */
            function arrayFilter(array, predicate) {
              var index = -1,
                  length = array == null ? 0 : array.length,
                  resIndex = 0,
                  result = [];

              while (++index < length) {
                var value = array[index];

                if (predicate(value, index, array)) {
                  result[resIndex++] = value;
                }
              }

              return result;
            }

            var _arrayFilter = arrayFilter;

            /**
             * This method returns a new empty array.
             *
             * @static
             * @memberOf _
             * @since 4.13.0
             * @category Util
             * @returns {Array} Returns the new empty array.
             * @example
             *
             * var arrays = _.times(2, _.stubArray);
             *
             * console.log(arrays);
             * // => [[], []]
             *
             * console.log(arrays[0] === arrays[1]);
             * // => false
             */
            function stubArray() {
              return [];
            }

            var stubArray_1 = stubArray;

            /** Used for built-in method references. */


            var objectProto$b = Object.prototype;
            /** Built-in value references. */

            var propertyIsEnumerable$1 = objectProto$b.propertyIsEnumerable;
            /* Built-in method references for those with the same name as other `lodash` methods. */

            var nativeGetSymbols = Object.getOwnPropertySymbols;
            /**
             * Creates an array of the own enumerable symbols of `object`.
             *
             * @private
             * @param {Object} object The object to query.
             * @returns {Array} Returns the array of symbols.
             */

            var getSymbols = !nativeGetSymbols ? stubArray_1 : function (object) {
              if (object == null) {
                return [];
              }

              object = Object(object);
              return _arrayFilter(nativeGetSymbols(object), function (symbol) {
                return propertyIsEnumerable$1.call(object, symbol);
              });
            };
            var _getSymbols = getSymbols;

            /**
             * Copies own symbols of `source` to `object`.
             *
             * @private
             * @param {Object} source The object to copy symbols from.
             * @param {Object} [object={}] The object to copy symbols to.
             * @returns {Object} Returns `object`.
             */


            function copySymbols(source, object) {
              return _copyObject(source, _getSymbols(source), object);
            }

            var _copySymbols = copySymbols;

            /**
             * Appends the elements of `values` to `array`.
             *
             * @private
             * @param {Array} array The array to modify.
             * @param {Array} values The values to append.
             * @returns {Array} Returns `array`.
             */
            function arrayPush(array, values) {
              var index = -1,
                  length = values.length,
                  offset = array.length;

              while (++index < length) {
                array[offset + index] = values[index];
              }

              return array;
            }

            var _arrayPush = arrayPush;

            /** Built-in value references. */


            var getPrototype = _overArg(Object.getPrototypeOf, Object);
            var _getPrototype = getPrototype;

            /* Built-in method references for those with the same name as other `lodash` methods. */


            var nativeGetSymbols$1 = Object.getOwnPropertySymbols;
            /**
             * Creates an array of the own and inherited enumerable symbols of `object`.
             *
             * @private
             * @param {Object} object The object to query.
             * @returns {Array} Returns the array of symbols.
             */

            var getSymbolsIn = !nativeGetSymbols$1 ? stubArray_1 : function (object) {
              var result = [];

              while (object) {
                _arrayPush(result, _getSymbols(object));
                object = _getPrototype(object);
              }

              return result;
            };
            var _getSymbolsIn = getSymbolsIn;

            /**
             * Copies own and inherited symbols of `source` to `object`.
             *
             * @private
             * @param {Object} source The object to copy symbols from.
             * @param {Object} [object={}] The object to copy symbols to.
             * @returns {Object} Returns `object`.
             */


            function copySymbolsIn(source, object) {
              return _copyObject(source, _getSymbolsIn(source), object);
            }

            var _copySymbolsIn = copySymbolsIn;

            /**
             * The base implementation of `getAllKeys` and `getAllKeysIn` which uses
             * `keysFunc` and `symbolsFunc` to get the enumerable property names and
             * symbols of `object`.
             *
             * @private
             * @param {Object} object The object to query.
             * @param {Function} keysFunc The function to get the keys of `object`.
             * @param {Function} symbolsFunc The function to get the symbols of `object`.
             * @returns {Array} Returns the array of property names and symbols.
             */


            function baseGetAllKeys(object, keysFunc, symbolsFunc) {
              var result = keysFunc(object);
              return isArray_1(object) ? result : _arrayPush(result, symbolsFunc(object));
            }

            var _baseGetAllKeys = baseGetAllKeys;

            /**
             * Creates an array of own enumerable property names and symbols of `object`.
             *
             * @private
             * @param {Object} object The object to query.
             * @returns {Array} Returns the array of property names and symbols.
             */


            function getAllKeys(object) {
              return _baseGetAllKeys(object, keys_1, _getSymbols);
            }

            var _getAllKeys = getAllKeys;

            /**
             * Creates an array of own and inherited enumerable property names and
             * symbols of `object`.
             *
             * @private
             * @param {Object} object The object to query.
             * @returns {Array} Returns the array of property names and symbols.
             */


            function getAllKeysIn(object) {
              return _baseGetAllKeys(object, keysIn_1, _getSymbolsIn);
            }

            var _getAllKeysIn = getAllKeysIn;

            /* Built-in method references that are verified to be native. */


            var DataView = _getNative(_root, 'DataView');
            var _DataView = DataView;

            /* Built-in method references that are verified to be native. */


            var Promise$1 = _getNative(_root, 'Promise');
            var _Promise = Promise$1;

            /* Built-in method references that are verified to be native. */


            var Set$1 = _getNative(_root, 'Set');
            var _Set = Set$1;

            /* Built-in method references that are verified to be native. */


            var WeakMap = _getNative(_root, 'WeakMap');
            var _WeakMap = WeakMap;

            /** `Object#toString` result references. */


            var mapTag$1 = '[object Map]',
                objectTag$1 = '[object Object]',
                promiseTag = '[object Promise]',
                setTag$1 = '[object Set]',
                weakMapTag$1 = '[object WeakMap]';
            var dataViewTag$1 = '[object DataView]';
            /** Used to detect maps, sets, and weakmaps. */

            var dataViewCtorString = _toSource(_DataView),
                mapCtorString = _toSource(_Map),
                promiseCtorString = _toSource(_Promise),
                setCtorString = _toSource(_Set),
                weakMapCtorString = _toSource(_WeakMap);
            /**
             * Gets the `toStringTag` of `value`.
             *
             * @private
             * @param {*} value The value to query.
             * @returns {string} Returns the `toStringTag`.
             */

            var getTag = _baseGetTag; // Fallback for data views, maps, sets, and weak maps in IE 11 and promises in Node.js < 6.

            if (_DataView && getTag(new _DataView(new ArrayBuffer(1))) != dataViewTag$1 || _Map && getTag(new _Map()) != mapTag$1 || _Promise && getTag(_Promise.resolve()) != promiseTag || _Set && getTag(new _Set()) != setTag$1 || _WeakMap && getTag(new _WeakMap()) != weakMapTag$1) {
              getTag = function (value) {
                var result = _baseGetTag(value),
                    Ctor = result == objectTag$1 ? value.constructor : undefined,
                    ctorString = Ctor ? _toSource(Ctor) : '';

                if (ctorString) {
                  switch (ctorString) {
                    case dataViewCtorString:
                      return dataViewTag$1;

                    case mapCtorString:
                      return mapTag$1;

                    case promiseCtorString:
                      return promiseTag;

                    case setCtorString:
                      return setTag$1;

                    case weakMapCtorString:
                      return weakMapTag$1;
                  }
                }

                return result;
              };
            }

            var _getTag = getTag;

            /** Used for built-in method references. */
            var objectProto$c = Object.prototype;
            /** Used to check objects for own properties. */

            var hasOwnProperty$9 = objectProto$c.hasOwnProperty;
            /**
             * Initializes an array clone.
             *
             * @private
             * @param {Array} array The array to clone.
             * @returns {Array} Returns the initialized clone.
             */

            function initCloneArray(array) {
              var length = array.length,
                  result = new array.constructor(length); // Add properties assigned by `RegExp#exec`.

              if (length && typeof array[0] == 'string' && hasOwnProperty$9.call(array, 'index')) {
                result.index = array.index;
                result.input = array.input;
              }

              return result;
            }

            var _initCloneArray = initCloneArray;

            /** Built-in value references. */


            var Uint8Array$1 = _root.Uint8Array;
            var _Uint8Array = Uint8Array$1;

            /**
             * Creates a clone of `arrayBuffer`.
             *
             * @private
             * @param {ArrayBuffer} arrayBuffer The array buffer to clone.
             * @returns {ArrayBuffer} Returns the cloned array buffer.
             */


            function cloneArrayBuffer(arrayBuffer) {
              var result = new arrayBuffer.constructor(arrayBuffer.byteLength);
              new _Uint8Array(result).set(new _Uint8Array(arrayBuffer));
              return result;
            }

            var _cloneArrayBuffer = cloneArrayBuffer;

            /**
             * Creates a clone of `dataView`.
             *
             * @private
             * @param {Object} dataView The data view to clone.
             * @param {boolean} [isDeep] Specify a deep clone.
             * @returns {Object} Returns the cloned data view.
             */


            function cloneDataView(dataView, isDeep) {
              var buffer = isDeep ? _cloneArrayBuffer(dataView.buffer) : dataView.buffer;
              return new dataView.constructor(buffer, dataView.byteOffset, dataView.byteLength);
            }

            var _cloneDataView = cloneDataView;

            /** Used to match `RegExp` flags from their coerced string values. */
            var reFlags = /\w*$/;
            /**
             * Creates a clone of `regexp`.
             *
             * @private
             * @param {Object} regexp The regexp to clone.
             * @returns {Object} Returns the cloned regexp.
             */

            function cloneRegExp(regexp) {
              var result = new regexp.constructor(regexp.source, reFlags.exec(regexp));
              result.lastIndex = regexp.lastIndex;
              return result;
            }

            var _cloneRegExp = cloneRegExp;

            /** Used to convert symbols to primitives and strings. */


            var symbolProto = _Symbol ? _Symbol.prototype : undefined,
                symbolValueOf = symbolProto ? symbolProto.valueOf : undefined;
            /**
             * Creates a clone of the `symbol` object.
             *
             * @private
             * @param {Object} symbol The symbol object to clone.
             * @returns {Object} Returns the cloned symbol object.
             */

            function cloneSymbol(symbol) {
              return symbolValueOf ? Object(symbolValueOf.call(symbol)) : {};
            }

            var _cloneSymbol = cloneSymbol;

            /**
             * Creates a clone of `typedArray`.
             *
             * @private
             * @param {Object} typedArray The typed array to clone.
             * @param {boolean} [isDeep] Specify a deep clone.
             * @returns {Object} Returns the cloned typed array.
             */


            function cloneTypedArray(typedArray, isDeep) {
              var buffer = isDeep ? _cloneArrayBuffer(typedArray.buffer) : typedArray.buffer;
              return new typedArray.constructor(buffer, typedArray.byteOffset, typedArray.length);
            }

            var _cloneTypedArray = cloneTypedArray;

            /** `Object#toString` result references. */


            var boolTag$1 = '[object Boolean]',
                dateTag$1 = '[object Date]',
                mapTag$2 = '[object Map]',
                numberTag$1 = '[object Number]',
                regexpTag$1 = '[object RegExp]',
                setTag$2 = '[object Set]',
                stringTag$1 = '[object String]',
                symbolTag = '[object Symbol]';
            var arrayBufferTag$1 = '[object ArrayBuffer]',
                dataViewTag$2 = '[object DataView]',
                float32Tag$1 = '[object Float32Array]',
                float64Tag$1 = '[object Float64Array]',
                int8Tag$1 = '[object Int8Array]',
                int16Tag$1 = '[object Int16Array]',
                int32Tag$1 = '[object Int32Array]',
                uint8Tag$1 = '[object Uint8Array]',
                uint8ClampedTag$1 = '[object Uint8ClampedArray]',
                uint16Tag$1 = '[object Uint16Array]',
                uint32Tag$1 = '[object Uint32Array]';
            /**
             * Initializes an object clone based on its `toStringTag`.
             *
             * **Note:** This function only supports cloning values with tags of
             * `Boolean`, `Date`, `Error`, `Map`, `Number`, `RegExp`, `Set`, or `String`.
             *
             * @private
             * @param {Object} object The object to clone.
             * @param {string} tag The `toStringTag` of the object to clone.
             * @param {boolean} [isDeep] Specify a deep clone.
             * @returns {Object} Returns the initialized clone.
             */

            function initCloneByTag(object, tag, isDeep) {
              var Ctor = object.constructor;

              switch (tag) {
                case arrayBufferTag$1:
                  return _cloneArrayBuffer(object);

                case boolTag$1:
                case dateTag$1:
                  return new Ctor(+object);

                case dataViewTag$2:
                  return _cloneDataView(object, isDeep);

                case float32Tag$1:
                case float64Tag$1:
                case int8Tag$1:
                case int16Tag$1:
                case int32Tag$1:
                case uint8Tag$1:
                case uint8ClampedTag$1:
                case uint16Tag$1:
                case uint32Tag$1:
                  return _cloneTypedArray(object, isDeep);

                case mapTag$2:
                  return new Ctor();

                case numberTag$1:
                case stringTag$1:
                  return new Ctor(object);

                case regexpTag$1:
                  return _cloneRegExp(object);

                case setTag$2:
                  return new Ctor();

                case symbolTag:
                  return _cloneSymbol(object);
              }
            }

            var _initCloneByTag = initCloneByTag;

            /** Built-in value references. */


            var objectCreate = Object.create;
            /**
             * The base implementation of `_.create` without support for assigning
             * properties to the created object.
             *
             * @private
             * @param {Object} proto The object to inherit from.
             * @returns {Object} Returns the new object.
             */

            var baseCreate = function () {
              function object() {}

              return function (proto) {
                if (!isObject_1(proto)) {
                  return {};
                }

                if (objectCreate) {
                  return objectCreate(proto);
                }

                object.prototype = proto;
                var result = new object();
                object.prototype = undefined;
                return result;
              };
            }();

            var _baseCreate = baseCreate;

            /**
             * Initializes an object clone.
             *
             * @private
             * @param {Object} object The object to clone.
             * @returns {Object} Returns the initialized clone.
             */


            function initCloneObject(object) {
              return typeof object.constructor == 'function' && !_isPrototype(object) ? _baseCreate(_getPrototype(object)) : {};
            }

            var _initCloneObject = initCloneObject;

            /** `Object#toString` result references. */


            var mapTag$3 = '[object Map]';
            /**
             * The base implementation of `_.isMap` without Node.js optimizations.
             *
             * @private
             * @param {*} value The value to check.
             * @returns {boolean} Returns `true` if `value` is a map, else `false`.
             */

            function baseIsMap(value) {
              return isObjectLike_1(value) && _getTag(value) == mapTag$3;
            }

            var _baseIsMap = baseIsMap;

            /* Node.js helper references. */


            var nodeIsMap = _nodeUtil && _nodeUtil.isMap;
            /**
             * Checks if `value` is classified as a `Map` object.
             *
             * @static
             * @memberOf _
             * @since 4.3.0
             * @category Lang
             * @param {*} value The value to check.
             * @returns {boolean} Returns `true` if `value` is a map, else `false`.
             * @example
             *
             * _.isMap(new Map);
             * // => true
             *
             * _.isMap(new WeakMap);
             * // => false
             */

            var isMap = nodeIsMap ? _baseUnary(nodeIsMap) : _baseIsMap;
            var isMap_1 = isMap;

            /** `Object#toString` result references. */


            var setTag$3 = '[object Set]';
            /**
             * The base implementation of `_.isSet` without Node.js optimizations.
             *
             * @private
             * @param {*} value The value to check.
             * @returns {boolean} Returns `true` if `value` is a set, else `false`.
             */

            function baseIsSet(value) {
              return isObjectLike_1(value) && _getTag(value) == setTag$3;
            }

            var _baseIsSet = baseIsSet;

            /* Node.js helper references. */


            var nodeIsSet = _nodeUtil && _nodeUtil.isSet;
            /**
             * Checks if `value` is classified as a `Set` object.
             *
             * @static
             * @memberOf _
             * @since 4.3.0
             * @category Lang
             * @param {*} value The value to check.
             * @returns {boolean} Returns `true` if `value` is a set, else `false`.
             * @example
             *
             * _.isSet(new Set);
             * // => true
             *
             * _.isSet(new WeakSet);
             * // => false
             */

            var isSet = nodeIsSet ? _baseUnary(nodeIsSet) : _baseIsSet;
            var isSet_1 = isSet;

            /** Used to compose bitmasks for cloning. */


            var CLONE_DEEP_FLAG = 1,
                CLONE_FLAT_FLAG = 2,
                CLONE_SYMBOLS_FLAG = 4;
            /** `Object#toString` result references. */

            var argsTag$2 = '[object Arguments]',
                arrayTag$1 = '[object Array]',
                boolTag$2 = '[object Boolean]',
                dateTag$2 = '[object Date]',
                errorTag$1 = '[object Error]',
                funcTag$2 = '[object Function]',
                genTag$1 = '[object GeneratorFunction]',
                mapTag$4 = '[object Map]',
                numberTag$2 = '[object Number]',
                objectTag$2 = '[object Object]',
                regexpTag$2 = '[object RegExp]',
                setTag$4 = '[object Set]',
                stringTag$2 = '[object String]',
                symbolTag$1 = '[object Symbol]',
                weakMapTag$2 = '[object WeakMap]';
            var arrayBufferTag$2 = '[object ArrayBuffer]',
                dataViewTag$3 = '[object DataView]',
                float32Tag$2 = '[object Float32Array]',
                float64Tag$2 = '[object Float64Array]',
                int8Tag$2 = '[object Int8Array]',
                int16Tag$2 = '[object Int16Array]',
                int32Tag$2 = '[object Int32Array]',
                uint8Tag$2 = '[object Uint8Array]',
                uint8ClampedTag$2 = '[object Uint8ClampedArray]',
                uint16Tag$2 = '[object Uint16Array]',
                uint32Tag$2 = '[object Uint32Array]';
            /** Used to identify `toStringTag` values supported by `_.clone`. */

            var cloneableTags = {};
            cloneableTags[argsTag$2] = cloneableTags[arrayTag$1] = cloneableTags[arrayBufferTag$2] = cloneableTags[dataViewTag$3] = cloneableTags[boolTag$2] = cloneableTags[dateTag$2] = cloneableTags[float32Tag$2] = cloneableTags[float64Tag$2] = cloneableTags[int8Tag$2] = cloneableTags[int16Tag$2] = cloneableTags[int32Tag$2] = cloneableTags[mapTag$4] = cloneableTags[numberTag$2] = cloneableTags[objectTag$2] = cloneableTags[regexpTag$2] = cloneableTags[setTag$4] = cloneableTags[stringTag$2] = cloneableTags[symbolTag$1] = cloneableTags[uint8Tag$2] = cloneableTags[uint8ClampedTag$2] = cloneableTags[uint16Tag$2] = cloneableTags[uint32Tag$2] = true;
            cloneableTags[errorTag$1] = cloneableTags[funcTag$2] = cloneableTags[weakMapTag$2] = false;
            /**
             * The base implementation of `_.clone` and `_.cloneDeep` which tracks
             * traversed objects.
             *
             * @private
             * @param {*} value The value to clone.
             * @param {boolean} bitmask The bitmask flags.
             *  1 - Deep clone
             *  2 - Flatten inherited properties
             *  4 - Clone symbols
             * @param {Function} [customizer] The function to customize cloning.
             * @param {string} [key] The key of `value`.
             * @param {Object} [object] The parent object of `value`.
             * @param {Object} [stack] Tracks traversed objects and their clone counterparts.
             * @returns {*} Returns the cloned value.
             */

            function baseClone(value, bitmask, customizer, key, object, stack) {
              var result,
                  isDeep = bitmask & CLONE_DEEP_FLAG,
                  isFlat = bitmask & CLONE_FLAT_FLAG,
                  isFull = bitmask & CLONE_SYMBOLS_FLAG;

              if (customizer) {
                result = object ? customizer(value, key, object, stack) : customizer(value);
              }

              if (result !== undefined) {
                return result;
              }

              if (!isObject_1(value)) {
                return value;
              }

              var isArr = isArray_1(value);

              if (isArr) {
                result = _initCloneArray(value);

                if (!isDeep) {
                  return _copyArray(value, result);
                }
              } else {
                var tag = _getTag(value),
                    isFunc = tag == funcTag$2 || tag == genTag$1;

                if (isBuffer_1(value)) {
                  return _cloneBuffer(value, isDeep);
                }

                if (tag == objectTag$2 || tag == argsTag$2 || isFunc && !object) {
                  result = isFlat || isFunc ? {} : _initCloneObject(value);

                  if (!isDeep) {
                    return isFlat ? _copySymbolsIn(value, _baseAssignIn(result, value)) : _copySymbols(value, _baseAssign(result, value));
                  }
                } else {
                  if (!cloneableTags[tag]) {
                    return object ? value : {};
                  }

                  result = _initCloneByTag(value, tag, isDeep);
                }
              } // Check for circular references and return its corresponding clone.


              stack || (stack = new _Stack());
              var stacked = stack.get(value);

              if (stacked) {
                return stacked;
              }

              stack.set(value, result);

              if (isSet_1(value)) {
                value.forEach(function (subValue) {
                  result.add(baseClone(subValue, bitmask, customizer, subValue, value, stack));
                });
                return result;
              }

              if (isMap_1(value)) {
                value.forEach(function (subValue, key) {
                  result.set(key, baseClone(subValue, bitmask, customizer, key, value, stack));
                });
                return result;
              }

              var keysFunc = isFull ? isFlat ? _getAllKeysIn : _getAllKeys : isFlat ? keysIn : keys_1;
              var props = isArr ? undefined : keysFunc(value);
              _arrayEach(props || value, function (subValue, key) {
                if (props) {
                  key = subValue;
                  subValue = value[key];
                } // Recursively populate clone (susceptible to call stack limits).


                _assignValue(result, key, baseClone(subValue, bitmask, customizer, key, value, stack));
              });
              return result;
            }

            var _baseClone = baseClone;

            /** Used to compose bitmasks for cloning. */


            var CLONE_SYMBOLS_FLAG$1 = 4;
            /**
             * Creates a shallow clone of `value`.
             *
             * **Note:** This method is loosely based on the
             * [structured clone algorithm](https://mdn.io/Structured_clone_algorithm)
             * and supports cloning arrays, array buffers, booleans, date objects, maps,
             * numbers, `Object` objects, regexes, sets, strings, symbols, and typed
             * arrays. The own enumerable properties of `arguments` objects are cloned
             * as plain objects. An empty object is returned for uncloneable values such
             * as error objects, functions, DOM nodes, and WeakMaps.
             *
             * @static
             * @memberOf _
             * @since 0.1.0
             * @category Lang
             * @param {*} value The value to clone.
             * @returns {*} Returns the cloned value.
             * @see _.cloneDeep
             * @example
             *
             * var objects = [{ 'a': 1 }, { 'b': 2 }];
             *
             * var shallow = _.clone(objects);
             * console.log(shallow[0] === objects[0]);
             * // => true
             */

            function clone(value) {
              return _baseClone(value, CLONE_SYMBOLS_FLAG$1);
            }

            var clone_1 = clone;

            let fastProto = null; // Creates an object with permanently fast properties in V8. See Toon Verwaest's
            // post https://medium.com/@tverwaes/setting-up-prototypes-in-v8-ec9c9491dfe2#5f62
            // for more details. Use %HasFastProperties(object) and the Node.js flag
            // --allow-natives-syntax to check whether an object has fast properties.

            function FastObject(o) {
              // A prototype object will have "fast properties" enabled once it is checked
              // against the inline property cache of a function, e.g. fastProto.property:
              // https://github.com/v8/v8/blob/6.0.122/test/mjsunit/fast-prototype.js#L48-L63
              if (fastProto !== null && typeof fastProto.property) {
                const result = fastProto;
                fastProto = FastObject.prototype = null;
                return result;
              }

              fastProto = FastObject.prototype = o == null ? Object.create(null) : o;
              return new FastObject();
            } // Initialize the inline property cache of FastObject


            FastObject();

            var toFastProperties = function toFastproperties(o) {
              return FastObject(o);
            };

            var ast = createCommonjsModule(function (module) {
            /*
              Copyright (C) 2013 Yusuke Suzuki <utatane.tea@gmail.com>

              Redistribution and use in source and binary forms, with or without
              modification, are permitted provided that the following conditions are met:

                * Redistributions of source code must retain the above copyright
                  notice, this list of conditions and the following disclaimer.
                * Redistributions in binary form must reproduce the above copyright
                  notice, this list of conditions and the following disclaimer in the
                  documentation and/or other materials provided with the distribution.

              THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS 'AS IS'
              AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
              IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
              ARE DISCLAIMED. IN NO EVENT SHALL <COPYRIGHT HOLDER> BE LIABLE FOR ANY
              DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
              (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
              LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
              ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
              (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
              THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
            */
            (function () {

              function isExpression(node) {
                if (node == null) {
                  return false;
                }

                switch (node.type) {
                  case 'ArrayExpression':
                  case 'AssignmentExpression':
                  case 'BinaryExpression':
                  case 'CallExpression':
                  case 'ConditionalExpression':
                  case 'FunctionExpression':
                  case 'Identifier':
                  case 'Literal':
                  case 'LogicalExpression':
                  case 'MemberExpression':
                  case 'NewExpression':
                  case 'ObjectExpression':
                  case 'SequenceExpression':
                  case 'ThisExpression':
                  case 'UnaryExpression':
                  case 'UpdateExpression':
                    return true;
                }

                return false;
              }

              function isIterationStatement(node) {
                if (node == null) {
                  return false;
                }

                switch (node.type) {
                  case 'DoWhileStatement':
                  case 'ForInStatement':
                  case 'ForStatement':
                  case 'WhileStatement':
                    return true;
                }

                return false;
              }

              function isStatement(node) {
                if (node == null) {
                  return false;
                }

                switch (node.type) {
                  case 'BlockStatement':
                  case 'BreakStatement':
                  case 'ContinueStatement':
                  case 'DebuggerStatement':
                  case 'DoWhileStatement':
                  case 'EmptyStatement':
                  case 'ExpressionStatement':
                  case 'ForInStatement':
                  case 'ForStatement':
                  case 'IfStatement':
                  case 'LabeledStatement':
                  case 'ReturnStatement':
                  case 'SwitchStatement':
                  case 'ThrowStatement':
                  case 'TryStatement':
                  case 'VariableDeclaration':
                  case 'WhileStatement':
                  case 'WithStatement':
                    return true;
                }

                return false;
              }

              function isSourceElement(node) {
                return isStatement(node) || node != null && node.type === 'FunctionDeclaration';
              }

              function trailingStatement(node) {
                switch (node.type) {
                  case 'IfStatement':
                    if (node.alternate != null) {
                      return node.alternate;
                    }

                    return node.consequent;

                  case 'LabeledStatement':
                  case 'ForStatement':
                  case 'ForInStatement':
                  case 'WhileStatement':
                  case 'WithStatement':
                    return node.body;
                }

                return null;
              }

              function isProblematicIfStatement(node) {
                var current;

                if (node.type !== 'IfStatement') {
                  return false;
                }

                if (node.alternate == null) {
                  return false;
                }

                current = node.consequent;

                do {
                  if (current.type === 'IfStatement') {
                    if (current.alternate == null) {
                      return true;
                    }
                  }

                  current = trailingStatement(current);
                } while (current);

                return false;
              }

              module.exports = {
                isExpression: isExpression,
                isStatement: isStatement,
                isIterationStatement: isIterationStatement,
                isSourceElement: isSourceElement,
                isProblematicIfStatement: isProblematicIfStatement,
                trailingStatement: trailingStatement
              };
            })();
            /* vim: set sw=4 ts=4 et tw=80 : */
            });
            var ast_1 = ast.isExpression;
            var ast_2 = ast.isStatement;
            var ast_3 = ast.isIterationStatement;
            var ast_4 = ast.isSourceElement;
            var ast_5 = ast.isProblematicIfStatement;
            var ast_6 = ast.trailingStatement;

            var code = createCommonjsModule(function (module) {
            /*
              Copyright (C) 2013-2014 Yusuke Suzuki <utatane.tea@gmail.com>
              Copyright (C) 2014 Ivan Nikulin <ifaaan@gmail.com>

              Redistribution and use in source and binary forms, with or without
              modification, are permitted provided that the following conditions are met:

                * Redistributions of source code must retain the above copyright
                  notice, this list of conditions and the following disclaimer.
                * Redistributions in binary form must reproduce the above copyright
                  notice, this list of conditions and the following disclaimer in the
                  documentation and/or other materials provided with the distribution.

              THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
              AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
              IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
              ARE DISCLAIMED. IN NO EVENT SHALL <COPYRIGHT HOLDER> BE LIABLE FOR ANY
              DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
              (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
              LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
              ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
              (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
              THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
            */
            (function () {

              var ES6Regex, ES5Regex, NON_ASCII_WHITESPACES, IDENTIFIER_START, IDENTIFIER_PART, ch; // See `tools/generate-identifier-regex.js`.

              ES5Regex = {
                // ECMAScript 5.1/Unicode v7.0.0 NonAsciiIdentifierStart:
                NonAsciiIdentifierStart: /[\xAA\xB5\xBA\xC0-\xD6\xD8-\xF6\xF8-\u02C1\u02C6-\u02D1\u02E0-\u02E4\u02EC\u02EE\u0370-\u0374\u0376\u0377\u037A-\u037D\u037F\u0386\u0388-\u038A\u038C\u038E-\u03A1\u03A3-\u03F5\u03F7-\u0481\u048A-\u052F\u0531-\u0556\u0559\u0561-\u0587\u05D0-\u05EA\u05F0-\u05F2\u0620-\u064A\u066E\u066F\u0671-\u06D3\u06D5\u06E5\u06E6\u06EE\u06EF\u06FA-\u06FC\u06FF\u0710\u0712-\u072F\u074D-\u07A5\u07B1\u07CA-\u07EA\u07F4\u07F5\u07FA\u0800-\u0815\u081A\u0824\u0828\u0840-\u0858\u08A0-\u08B2\u0904-\u0939\u093D\u0950\u0958-\u0961\u0971-\u0980\u0985-\u098C\u098F\u0990\u0993-\u09A8\u09AA-\u09B0\u09B2\u09B6-\u09B9\u09BD\u09CE\u09DC\u09DD\u09DF-\u09E1\u09F0\u09F1\u0A05-\u0A0A\u0A0F\u0A10\u0A13-\u0A28\u0A2A-\u0A30\u0A32\u0A33\u0A35\u0A36\u0A38\u0A39\u0A59-\u0A5C\u0A5E\u0A72-\u0A74\u0A85-\u0A8D\u0A8F-\u0A91\u0A93-\u0AA8\u0AAA-\u0AB0\u0AB2\u0AB3\u0AB5-\u0AB9\u0ABD\u0AD0\u0AE0\u0AE1\u0B05-\u0B0C\u0B0F\u0B10\u0B13-\u0B28\u0B2A-\u0B30\u0B32\u0B33\u0B35-\u0B39\u0B3D\u0B5C\u0B5D\u0B5F-\u0B61\u0B71\u0B83\u0B85-\u0B8A\u0B8E-\u0B90\u0B92-\u0B95\u0B99\u0B9A\u0B9C\u0B9E\u0B9F\u0BA3\u0BA4\u0BA8-\u0BAA\u0BAE-\u0BB9\u0BD0\u0C05-\u0C0C\u0C0E-\u0C10\u0C12-\u0C28\u0C2A-\u0C39\u0C3D\u0C58\u0C59\u0C60\u0C61\u0C85-\u0C8C\u0C8E-\u0C90\u0C92-\u0CA8\u0CAA-\u0CB3\u0CB5-\u0CB9\u0CBD\u0CDE\u0CE0\u0CE1\u0CF1\u0CF2\u0D05-\u0D0C\u0D0E-\u0D10\u0D12-\u0D3A\u0D3D\u0D4E\u0D60\u0D61\u0D7A-\u0D7F\u0D85-\u0D96\u0D9A-\u0DB1\u0DB3-\u0DBB\u0DBD\u0DC0-\u0DC6\u0E01-\u0E30\u0E32\u0E33\u0E40-\u0E46\u0E81\u0E82\u0E84\u0E87\u0E88\u0E8A\u0E8D\u0E94-\u0E97\u0E99-\u0E9F\u0EA1-\u0EA3\u0EA5\u0EA7\u0EAA\u0EAB\u0EAD-\u0EB0\u0EB2\u0EB3\u0EBD\u0EC0-\u0EC4\u0EC6\u0EDC-\u0EDF\u0F00\u0F40-\u0F47\u0F49-\u0F6C\u0F88-\u0F8C\u1000-\u102A\u103F\u1050-\u1055\u105A-\u105D\u1061\u1065\u1066\u106E-\u1070\u1075-\u1081\u108E\u10A0-\u10C5\u10C7\u10CD\u10D0-\u10FA\u10FC-\u1248\u124A-\u124D\u1250-\u1256\u1258\u125A-\u125D\u1260-\u1288\u128A-\u128D\u1290-\u12B0\u12B2-\u12B5\u12B8-\u12BE\u12C0\u12C2-\u12C5\u12C8-\u12D6\u12D8-\u1310\u1312-\u1315\u1318-\u135A\u1380-\u138F\u13A0-\u13F4\u1401-\u166C\u166F-\u167F\u1681-\u169A\u16A0-\u16EA\u16EE-\u16F8\u1700-\u170C\u170E-\u1711\u1720-\u1731\u1740-\u1751\u1760-\u176C\u176E-\u1770\u1780-\u17B3\u17D7\u17DC\u1820-\u1877\u1880-\u18A8\u18AA\u18B0-\u18F5\u1900-\u191E\u1950-\u196D\u1970-\u1974\u1980-\u19AB\u19C1-\u19C7\u1A00-\u1A16\u1A20-\u1A54\u1AA7\u1B05-\u1B33\u1B45-\u1B4B\u1B83-\u1BA0\u1BAE\u1BAF\u1BBA-\u1BE5\u1C00-\u1C23\u1C4D-\u1C4F\u1C5A-\u1C7D\u1CE9-\u1CEC\u1CEE-\u1CF1\u1CF5\u1CF6\u1D00-\u1DBF\u1E00-\u1F15\u1F18-\u1F1D\u1F20-\u1F45\u1F48-\u1F4D\u1F50-\u1F57\u1F59\u1F5B\u1F5D\u1F5F-\u1F7D\u1F80-\u1FB4\u1FB6-\u1FBC\u1FBE\u1FC2-\u1FC4\u1FC6-\u1FCC\u1FD0-\u1FD3\u1FD6-\u1FDB\u1FE0-\u1FEC\u1FF2-\u1FF4\u1FF6-\u1FFC\u2071\u207F\u2090-\u209C\u2102\u2107\u210A-\u2113\u2115\u2119-\u211D\u2124\u2126\u2128\u212A-\u212D\u212F-\u2139\u213C-\u213F\u2145-\u2149\u214E\u2160-\u2188\u2C00-\u2C2E\u2C30-\u2C5E\u2C60-\u2CE4\u2CEB-\u2CEE\u2CF2\u2CF3\u2D00-\u2D25\u2D27\u2D2D\u2D30-\u2D67\u2D6F\u2D80-\u2D96\u2DA0-\u2DA6\u2DA8-\u2DAE\u2DB0-\u2DB6\u2DB8-\u2DBE\u2DC0-\u2DC6\u2DC8-\u2DCE\u2DD0-\u2DD6\u2DD8-\u2DDE\u2E2F\u3005-\u3007\u3021-\u3029\u3031-\u3035\u3038-\u303C\u3041-\u3096\u309D-\u309F\u30A1-\u30FA\u30FC-\u30FF\u3105-\u312D\u3131-\u318E\u31A0-\u31BA\u31F0-\u31FF\u3400-\u4DB5\u4E00-\u9FCC\uA000-\uA48C\uA4D0-\uA4FD\uA500-\uA60C\uA610-\uA61F\uA62A\uA62B\uA640-\uA66E\uA67F-\uA69D\uA6A0-\uA6EF\uA717-\uA71F\uA722-\uA788\uA78B-\uA78E\uA790-\uA7AD\uA7B0\uA7B1\uA7F7-\uA801\uA803-\uA805\uA807-\uA80A\uA80C-\uA822\uA840-\uA873\uA882-\uA8B3\uA8F2-\uA8F7\uA8FB\uA90A-\uA925\uA930-\uA946\uA960-\uA97C\uA984-\uA9B2\uA9CF\uA9E0-\uA9E4\uA9E6-\uA9EF\uA9FA-\uA9FE\uAA00-\uAA28\uAA40-\uAA42\uAA44-\uAA4B\uAA60-\uAA76\uAA7A\uAA7E-\uAAAF\uAAB1\uAAB5\uAAB6\uAAB9-\uAABD\uAAC0\uAAC2\uAADB-\uAADD\uAAE0-\uAAEA\uAAF2-\uAAF4\uAB01-\uAB06\uAB09-\uAB0E\uAB11-\uAB16\uAB20-\uAB26\uAB28-\uAB2E\uAB30-\uAB5A\uAB5C-\uAB5F\uAB64\uAB65\uABC0-\uABE2\uAC00-\uD7A3\uD7B0-\uD7C6\uD7CB-\uD7FB\uF900-\uFA6D\uFA70-\uFAD9\uFB00-\uFB06\uFB13-\uFB17\uFB1D\uFB1F-\uFB28\uFB2A-\uFB36\uFB38-\uFB3C\uFB3E\uFB40\uFB41\uFB43\uFB44\uFB46-\uFBB1\uFBD3-\uFD3D\uFD50-\uFD8F\uFD92-\uFDC7\uFDF0-\uFDFB\uFE70-\uFE74\uFE76-\uFEFC\uFF21-\uFF3A\uFF41-\uFF5A\uFF66-\uFFBE\uFFC2-\uFFC7\uFFCA-\uFFCF\uFFD2-\uFFD7\uFFDA-\uFFDC]/,
                // ECMAScript 5.1/Unicode v7.0.0 NonAsciiIdentifierPart:
                NonAsciiIdentifierPart: /[\xAA\xB5\xBA\xC0-\xD6\xD8-\xF6\xF8-\u02C1\u02C6-\u02D1\u02E0-\u02E4\u02EC\u02EE\u0300-\u0374\u0376\u0377\u037A-\u037D\u037F\u0386\u0388-\u038A\u038C\u038E-\u03A1\u03A3-\u03F5\u03F7-\u0481\u0483-\u0487\u048A-\u052F\u0531-\u0556\u0559\u0561-\u0587\u0591-\u05BD\u05BF\u05C1\u05C2\u05C4\u05C5\u05C7\u05D0-\u05EA\u05F0-\u05F2\u0610-\u061A\u0620-\u0669\u066E-\u06D3\u06D5-\u06DC\u06DF-\u06E8\u06EA-\u06FC\u06FF\u0710-\u074A\u074D-\u07B1\u07C0-\u07F5\u07FA\u0800-\u082D\u0840-\u085B\u08A0-\u08B2\u08E4-\u0963\u0966-\u096F\u0971-\u0983\u0985-\u098C\u098F\u0990\u0993-\u09A8\u09AA-\u09B0\u09B2\u09B6-\u09B9\u09BC-\u09C4\u09C7\u09C8\u09CB-\u09CE\u09D7\u09DC\u09DD\u09DF-\u09E3\u09E6-\u09F1\u0A01-\u0A03\u0A05-\u0A0A\u0A0F\u0A10\u0A13-\u0A28\u0A2A-\u0A30\u0A32\u0A33\u0A35\u0A36\u0A38\u0A39\u0A3C\u0A3E-\u0A42\u0A47\u0A48\u0A4B-\u0A4D\u0A51\u0A59-\u0A5C\u0A5E\u0A66-\u0A75\u0A81-\u0A83\u0A85-\u0A8D\u0A8F-\u0A91\u0A93-\u0AA8\u0AAA-\u0AB0\u0AB2\u0AB3\u0AB5-\u0AB9\u0ABC-\u0AC5\u0AC7-\u0AC9\u0ACB-\u0ACD\u0AD0\u0AE0-\u0AE3\u0AE6-\u0AEF\u0B01-\u0B03\u0B05-\u0B0C\u0B0F\u0B10\u0B13-\u0B28\u0B2A-\u0B30\u0B32\u0B33\u0B35-\u0B39\u0B3C-\u0B44\u0B47\u0B48\u0B4B-\u0B4D\u0B56\u0B57\u0B5C\u0B5D\u0B5F-\u0B63\u0B66-\u0B6F\u0B71\u0B82\u0B83\u0B85-\u0B8A\u0B8E-\u0B90\u0B92-\u0B95\u0B99\u0B9A\u0B9C\u0B9E\u0B9F\u0BA3\u0BA4\u0BA8-\u0BAA\u0BAE-\u0BB9\u0BBE-\u0BC2\u0BC6-\u0BC8\u0BCA-\u0BCD\u0BD0\u0BD7\u0BE6-\u0BEF\u0C00-\u0C03\u0C05-\u0C0C\u0C0E-\u0C10\u0C12-\u0C28\u0C2A-\u0C39\u0C3D-\u0C44\u0C46-\u0C48\u0C4A-\u0C4D\u0C55\u0C56\u0C58\u0C59\u0C60-\u0C63\u0C66-\u0C6F\u0C81-\u0C83\u0C85-\u0C8C\u0C8E-\u0C90\u0C92-\u0CA8\u0CAA-\u0CB3\u0CB5-\u0CB9\u0CBC-\u0CC4\u0CC6-\u0CC8\u0CCA-\u0CCD\u0CD5\u0CD6\u0CDE\u0CE0-\u0CE3\u0CE6-\u0CEF\u0CF1\u0CF2\u0D01-\u0D03\u0D05-\u0D0C\u0D0E-\u0D10\u0D12-\u0D3A\u0D3D-\u0D44\u0D46-\u0D48\u0D4A-\u0D4E\u0D57\u0D60-\u0D63\u0D66-\u0D6F\u0D7A-\u0D7F\u0D82\u0D83\u0D85-\u0D96\u0D9A-\u0DB1\u0DB3-\u0DBB\u0DBD\u0DC0-\u0DC6\u0DCA\u0DCF-\u0DD4\u0DD6\u0DD8-\u0DDF\u0DE6-\u0DEF\u0DF2\u0DF3\u0E01-\u0E3A\u0E40-\u0E4E\u0E50-\u0E59\u0E81\u0E82\u0E84\u0E87\u0E88\u0E8A\u0E8D\u0E94-\u0E97\u0E99-\u0E9F\u0EA1-\u0EA3\u0EA5\u0EA7\u0EAA\u0EAB\u0EAD-\u0EB9\u0EBB-\u0EBD\u0EC0-\u0EC4\u0EC6\u0EC8-\u0ECD\u0ED0-\u0ED9\u0EDC-\u0EDF\u0F00\u0F18\u0F19\u0F20-\u0F29\u0F35\u0F37\u0F39\u0F3E-\u0F47\u0F49-\u0F6C\u0F71-\u0F84\u0F86-\u0F97\u0F99-\u0FBC\u0FC6\u1000-\u1049\u1050-\u109D\u10A0-\u10C5\u10C7\u10CD\u10D0-\u10FA\u10FC-\u1248\u124A-\u124D\u1250-\u1256\u1258\u125A-\u125D\u1260-\u1288\u128A-\u128D\u1290-\u12B0\u12B2-\u12B5\u12B8-\u12BE\u12C0\u12C2-\u12C5\u12C8-\u12D6\u12D8-\u1310\u1312-\u1315\u1318-\u135A\u135D-\u135F\u1380-\u138F\u13A0-\u13F4\u1401-\u166C\u166F-\u167F\u1681-\u169A\u16A0-\u16EA\u16EE-\u16F8\u1700-\u170C\u170E-\u1714\u1720-\u1734\u1740-\u1753\u1760-\u176C\u176E-\u1770\u1772\u1773\u1780-\u17D3\u17D7\u17DC\u17DD\u17E0-\u17E9\u180B-\u180D\u1810-\u1819\u1820-\u1877\u1880-\u18AA\u18B0-\u18F5\u1900-\u191E\u1920-\u192B\u1930-\u193B\u1946-\u196D\u1970-\u1974\u1980-\u19AB\u19B0-\u19C9\u19D0-\u19D9\u1A00-\u1A1B\u1A20-\u1A5E\u1A60-\u1A7C\u1A7F-\u1A89\u1A90-\u1A99\u1AA7\u1AB0-\u1ABD\u1B00-\u1B4B\u1B50-\u1B59\u1B6B-\u1B73\u1B80-\u1BF3\u1C00-\u1C37\u1C40-\u1C49\u1C4D-\u1C7D\u1CD0-\u1CD2\u1CD4-\u1CF6\u1CF8\u1CF9\u1D00-\u1DF5\u1DFC-\u1F15\u1F18-\u1F1D\u1F20-\u1F45\u1F48-\u1F4D\u1F50-\u1F57\u1F59\u1F5B\u1F5D\u1F5F-\u1F7D\u1F80-\u1FB4\u1FB6-\u1FBC\u1FBE\u1FC2-\u1FC4\u1FC6-\u1FCC\u1FD0-\u1FD3\u1FD6-\u1FDB\u1FE0-\u1FEC\u1FF2-\u1FF4\u1FF6-\u1FFC\u200C\u200D\u203F\u2040\u2054\u2071\u207F\u2090-\u209C\u20D0-\u20DC\u20E1\u20E5-\u20F0\u2102\u2107\u210A-\u2113\u2115\u2119-\u211D\u2124\u2126\u2128\u212A-\u212D\u212F-\u2139\u213C-\u213F\u2145-\u2149\u214E\u2160-\u2188\u2C00-\u2C2E\u2C30-\u2C5E\u2C60-\u2CE4\u2CEB-\u2CF3\u2D00-\u2D25\u2D27\u2D2D\u2D30-\u2D67\u2D6F\u2D7F-\u2D96\u2DA0-\u2DA6\u2DA8-\u2DAE\u2DB0-\u2DB6\u2DB8-\u2DBE\u2DC0-\u2DC6\u2DC8-\u2DCE\u2DD0-\u2DD6\u2DD8-\u2DDE\u2DE0-\u2DFF\u2E2F\u3005-\u3007\u3021-\u302F\u3031-\u3035\u3038-\u303C\u3041-\u3096\u3099\u309A\u309D-\u309F\u30A1-\u30FA\u30FC-\u30FF\u3105-\u312D\u3131-\u318E\u31A0-\u31BA\u31F0-\u31FF\u3400-\u4DB5\u4E00-\u9FCC\uA000-\uA48C\uA4D0-\uA4FD\uA500-\uA60C\uA610-\uA62B\uA640-\uA66F\uA674-\uA67D\uA67F-\uA69D\uA69F-\uA6F1\uA717-\uA71F\uA722-\uA788\uA78B-\uA78E\uA790-\uA7AD\uA7B0\uA7B1\uA7F7-\uA827\uA840-\uA873\uA880-\uA8C4\uA8D0-\uA8D9\uA8E0-\uA8F7\uA8FB\uA900-\uA92D\uA930-\uA953\uA960-\uA97C\uA980-\uA9C0\uA9CF-\uA9D9\uA9E0-\uA9FE\uAA00-\uAA36\uAA40-\uAA4D\uAA50-\uAA59\uAA60-\uAA76\uAA7A-\uAAC2\uAADB-\uAADD\uAAE0-\uAAEF\uAAF2-\uAAF6\uAB01-\uAB06\uAB09-\uAB0E\uAB11-\uAB16\uAB20-\uAB26\uAB28-\uAB2E\uAB30-\uAB5A\uAB5C-\uAB5F\uAB64\uAB65\uABC0-\uABEA\uABEC\uABED\uABF0-\uABF9\uAC00-\uD7A3\uD7B0-\uD7C6\uD7CB-\uD7FB\uF900-\uFA6D\uFA70-\uFAD9\uFB00-\uFB06\uFB13-\uFB17\uFB1D-\uFB28\uFB2A-\uFB36\uFB38-\uFB3C\uFB3E\uFB40\uFB41\uFB43\uFB44\uFB46-\uFBB1\uFBD3-\uFD3D\uFD50-\uFD8F\uFD92-\uFDC7\uFDF0-\uFDFB\uFE00-\uFE0F\uFE20-\uFE2D\uFE33\uFE34\uFE4D-\uFE4F\uFE70-\uFE74\uFE76-\uFEFC\uFF10-\uFF19\uFF21-\uFF3A\uFF3F\uFF41-\uFF5A\uFF66-\uFFBE\uFFC2-\uFFC7\uFFCA-\uFFCF\uFFD2-\uFFD7\uFFDA-\uFFDC]/
              };
              ES6Regex = {
                // ECMAScript 6/Unicode v7.0.0 NonAsciiIdentifierStart:
                NonAsciiIdentifierStart: /[\xAA\xB5\xBA\xC0-\xD6\xD8-\xF6\xF8-\u02C1\u02C6-\u02D1\u02E0-\u02E4\u02EC\u02EE\u0370-\u0374\u0376\u0377\u037A-\u037D\u037F\u0386\u0388-\u038A\u038C\u038E-\u03A1\u03A3-\u03F5\u03F7-\u0481\u048A-\u052F\u0531-\u0556\u0559\u0561-\u0587\u05D0-\u05EA\u05F0-\u05F2\u0620-\u064A\u066E\u066F\u0671-\u06D3\u06D5\u06E5\u06E6\u06EE\u06EF\u06FA-\u06FC\u06FF\u0710\u0712-\u072F\u074D-\u07A5\u07B1\u07CA-\u07EA\u07F4\u07F5\u07FA\u0800-\u0815\u081A\u0824\u0828\u0840-\u0858\u08A0-\u08B2\u0904-\u0939\u093D\u0950\u0958-\u0961\u0971-\u0980\u0985-\u098C\u098F\u0990\u0993-\u09A8\u09AA-\u09B0\u09B2\u09B6-\u09B9\u09BD\u09CE\u09DC\u09DD\u09DF-\u09E1\u09F0\u09F1\u0A05-\u0A0A\u0A0F\u0A10\u0A13-\u0A28\u0A2A-\u0A30\u0A32\u0A33\u0A35\u0A36\u0A38\u0A39\u0A59-\u0A5C\u0A5E\u0A72-\u0A74\u0A85-\u0A8D\u0A8F-\u0A91\u0A93-\u0AA8\u0AAA-\u0AB0\u0AB2\u0AB3\u0AB5-\u0AB9\u0ABD\u0AD0\u0AE0\u0AE1\u0B05-\u0B0C\u0B0F\u0B10\u0B13-\u0B28\u0B2A-\u0B30\u0B32\u0B33\u0B35-\u0B39\u0B3D\u0B5C\u0B5D\u0B5F-\u0B61\u0B71\u0B83\u0B85-\u0B8A\u0B8E-\u0B90\u0B92-\u0B95\u0B99\u0B9A\u0B9C\u0B9E\u0B9F\u0BA3\u0BA4\u0BA8-\u0BAA\u0BAE-\u0BB9\u0BD0\u0C05-\u0C0C\u0C0E-\u0C10\u0C12-\u0C28\u0C2A-\u0C39\u0C3D\u0C58\u0C59\u0C60\u0C61\u0C85-\u0C8C\u0C8E-\u0C90\u0C92-\u0CA8\u0CAA-\u0CB3\u0CB5-\u0CB9\u0CBD\u0CDE\u0CE0\u0CE1\u0CF1\u0CF2\u0D05-\u0D0C\u0D0E-\u0D10\u0D12-\u0D3A\u0D3D\u0D4E\u0D60\u0D61\u0D7A-\u0D7F\u0D85-\u0D96\u0D9A-\u0DB1\u0DB3-\u0DBB\u0DBD\u0DC0-\u0DC6\u0E01-\u0E30\u0E32\u0E33\u0E40-\u0E46\u0E81\u0E82\u0E84\u0E87\u0E88\u0E8A\u0E8D\u0E94-\u0E97\u0E99-\u0E9F\u0EA1-\u0EA3\u0EA5\u0EA7\u0EAA\u0EAB\u0EAD-\u0EB0\u0EB2\u0EB3\u0EBD\u0EC0-\u0EC4\u0EC6\u0EDC-\u0EDF\u0F00\u0F40-\u0F47\u0F49-\u0F6C\u0F88-\u0F8C\u1000-\u102A\u103F\u1050-\u1055\u105A-\u105D\u1061\u1065\u1066\u106E-\u1070\u1075-\u1081\u108E\u10A0-\u10C5\u10C7\u10CD\u10D0-\u10FA\u10FC-\u1248\u124A-\u124D\u1250-\u1256\u1258\u125A-\u125D\u1260-\u1288\u128A-\u128D\u1290-\u12B0\u12B2-\u12B5\u12B8-\u12BE\u12C0\u12C2-\u12C5\u12C8-\u12D6\u12D8-\u1310\u1312-\u1315\u1318-\u135A\u1380-\u138F\u13A0-\u13F4\u1401-\u166C\u166F-\u167F\u1681-\u169A\u16A0-\u16EA\u16EE-\u16F8\u1700-\u170C\u170E-\u1711\u1720-\u1731\u1740-\u1751\u1760-\u176C\u176E-\u1770\u1780-\u17B3\u17D7\u17DC\u1820-\u1877\u1880-\u18A8\u18AA\u18B0-\u18F5\u1900-\u191E\u1950-\u196D\u1970-\u1974\u1980-\u19AB\u19C1-\u19C7\u1A00-\u1A16\u1A20-\u1A54\u1AA7\u1B05-\u1B33\u1B45-\u1B4B\u1B83-\u1BA0\u1BAE\u1BAF\u1BBA-\u1BE5\u1C00-\u1C23\u1C4D-\u1C4F\u1C5A-\u1C7D\u1CE9-\u1CEC\u1CEE-\u1CF1\u1CF5\u1CF6\u1D00-\u1DBF\u1E00-\u1F15\u1F18-\u1F1D\u1F20-\u1F45\u1F48-\u1F4D\u1F50-\u1F57\u1F59\u1F5B\u1F5D\u1F5F-\u1F7D\u1F80-\u1FB4\u1FB6-\u1FBC\u1FBE\u1FC2-\u1FC4\u1FC6-\u1FCC\u1FD0-\u1FD3\u1FD6-\u1FDB\u1FE0-\u1FEC\u1FF2-\u1FF4\u1FF6-\u1FFC\u2071\u207F\u2090-\u209C\u2102\u2107\u210A-\u2113\u2115\u2118-\u211D\u2124\u2126\u2128\u212A-\u2139\u213C-\u213F\u2145-\u2149\u214E\u2160-\u2188\u2C00-\u2C2E\u2C30-\u2C5E\u2C60-\u2CE4\u2CEB-\u2CEE\u2CF2\u2CF3\u2D00-\u2D25\u2D27\u2D2D\u2D30-\u2D67\u2D6F\u2D80-\u2D96\u2DA0-\u2DA6\u2DA8-\u2DAE\u2DB0-\u2DB6\u2DB8-\u2DBE\u2DC0-\u2DC6\u2DC8-\u2DCE\u2DD0-\u2DD6\u2DD8-\u2DDE\u3005-\u3007\u3021-\u3029\u3031-\u3035\u3038-\u303C\u3041-\u3096\u309B-\u309F\u30A1-\u30FA\u30FC-\u30FF\u3105-\u312D\u3131-\u318E\u31A0-\u31BA\u31F0-\u31FF\u3400-\u4DB5\u4E00-\u9FCC\uA000-\uA48C\uA4D0-\uA4FD\uA500-\uA60C\uA610-\uA61F\uA62A\uA62B\uA640-\uA66E\uA67F-\uA69D\uA6A0-\uA6EF\uA717-\uA71F\uA722-\uA788\uA78B-\uA78E\uA790-\uA7AD\uA7B0\uA7B1\uA7F7-\uA801\uA803-\uA805\uA807-\uA80A\uA80C-\uA822\uA840-\uA873\uA882-\uA8B3\uA8F2-\uA8F7\uA8FB\uA90A-\uA925\uA930-\uA946\uA960-\uA97C\uA984-\uA9B2\uA9CF\uA9E0-\uA9E4\uA9E6-\uA9EF\uA9FA-\uA9FE\uAA00-\uAA28\uAA40-\uAA42\uAA44-\uAA4B\uAA60-\uAA76\uAA7A\uAA7E-\uAAAF\uAAB1\uAAB5\uAAB6\uAAB9-\uAABD\uAAC0\uAAC2\uAADB-\uAADD\uAAE0-\uAAEA\uAAF2-\uAAF4\uAB01-\uAB06\uAB09-\uAB0E\uAB11-\uAB16\uAB20-\uAB26\uAB28-\uAB2E\uAB30-\uAB5A\uAB5C-\uAB5F\uAB64\uAB65\uABC0-\uABE2\uAC00-\uD7A3\uD7B0-\uD7C6\uD7CB-\uD7FB\uF900-\uFA6D\uFA70-\uFAD9\uFB00-\uFB06\uFB13-\uFB17\uFB1D\uFB1F-\uFB28\uFB2A-\uFB36\uFB38-\uFB3C\uFB3E\uFB40\uFB41\uFB43\uFB44\uFB46-\uFBB1\uFBD3-\uFD3D\uFD50-\uFD8F\uFD92-\uFDC7\uFDF0-\uFDFB\uFE70-\uFE74\uFE76-\uFEFC\uFF21-\uFF3A\uFF41-\uFF5A\uFF66-\uFFBE\uFFC2-\uFFC7\uFFCA-\uFFCF\uFFD2-\uFFD7\uFFDA-\uFFDC]|\uD800[\uDC00-\uDC0B\uDC0D-\uDC26\uDC28-\uDC3A\uDC3C\uDC3D\uDC3F-\uDC4D\uDC50-\uDC5D\uDC80-\uDCFA\uDD40-\uDD74\uDE80-\uDE9C\uDEA0-\uDED0\uDF00-\uDF1F\uDF30-\uDF4A\uDF50-\uDF75\uDF80-\uDF9D\uDFA0-\uDFC3\uDFC8-\uDFCF\uDFD1-\uDFD5]|\uD801[\uDC00-\uDC9D\uDD00-\uDD27\uDD30-\uDD63\uDE00-\uDF36\uDF40-\uDF55\uDF60-\uDF67]|\uD802[\uDC00-\uDC05\uDC08\uDC0A-\uDC35\uDC37\uDC38\uDC3C\uDC3F-\uDC55\uDC60-\uDC76\uDC80-\uDC9E\uDD00-\uDD15\uDD20-\uDD39\uDD80-\uDDB7\uDDBE\uDDBF\uDE00\uDE10-\uDE13\uDE15-\uDE17\uDE19-\uDE33\uDE60-\uDE7C\uDE80-\uDE9C\uDEC0-\uDEC7\uDEC9-\uDEE4\uDF00-\uDF35\uDF40-\uDF55\uDF60-\uDF72\uDF80-\uDF91]|\uD803[\uDC00-\uDC48]|\uD804[\uDC03-\uDC37\uDC83-\uDCAF\uDCD0-\uDCE8\uDD03-\uDD26\uDD50-\uDD72\uDD76\uDD83-\uDDB2\uDDC1-\uDDC4\uDDDA\uDE00-\uDE11\uDE13-\uDE2B\uDEB0-\uDEDE\uDF05-\uDF0C\uDF0F\uDF10\uDF13-\uDF28\uDF2A-\uDF30\uDF32\uDF33\uDF35-\uDF39\uDF3D\uDF5D-\uDF61]|\uD805[\uDC80-\uDCAF\uDCC4\uDCC5\uDCC7\uDD80-\uDDAE\uDE00-\uDE2F\uDE44\uDE80-\uDEAA]|\uD806[\uDCA0-\uDCDF\uDCFF\uDEC0-\uDEF8]|\uD808[\uDC00-\uDF98]|\uD809[\uDC00-\uDC6E]|[\uD80C\uD840-\uD868\uD86A-\uD86C][\uDC00-\uDFFF]|\uD80D[\uDC00-\uDC2E]|\uD81A[\uDC00-\uDE38\uDE40-\uDE5E\uDED0-\uDEED\uDF00-\uDF2F\uDF40-\uDF43\uDF63-\uDF77\uDF7D-\uDF8F]|\uD81B[\uDF00-\uDF44\uDF50\uDF93-\uDF9F]|\uD82C[\uDC00\uDC01]|\uD82F[\uDC00-\uDC6A\uDC70-\uDC7C\uDC80-\uDC88\uDC90-\uDC99]|\uD835[\uDC00-\uDC54\uDC56-\uDC9C\uDC9E\uDC9F\uDCA2\uDCA5\uDCA6\uDCA9-\uDCAC\uDCAE-\uDCB9\uDCBB\uDCBD-\uDCC3\uDCC5-\uDD05\uDD07-\uDD0A\uDD0D-\uDD14\uDD16-\uDD1C\uDD1E-\uDD39\uDD3B-\uDD3E\uDD40-\uDD44\uDD46\uDD4A-\uDD50\uDD52-\uDEA5\uDEA8-\uDEC0\uDEC2-\uDEDA\uDEDC-\uDEFA\uDEFC-\uDF14\uDF16-\uDF34\uDF36-\uDF4E\uDF50-\uDF6E\uDF70-\uDF88\uDF8A-\uDFA8\uDFAA-\uDFC2\uDFC4-\uDFCB]|\uD83A[\uDC00-\uDCC4]|\uD83B[\uDE00-\uDE03\uDE05-\uDE1F\uDE21\uDE22\uDE24\uDE27\uDE29-\uDE32\uDE34-\uDE37\uDE39\uDE3B\uDE42\uDE47\uDE49\uDE4B\uDE4D-\uDE4F\uDE51\uDE52\uDE54\uDE57\uDE59\uDE5B\uDE5D\uDE5F\uDE61\uDE62\uDE64\uDE67-\uDE6A\uDE6C-\uDE72\uDE74-\uDE77\uDE79-\uDE7C\uDE7E\uDE80-\uDE89\uDE8B-\uDE9B\uDEA1-\uDEA3\uDEA5-\uDEA9\uDEAB-\uDEBB]|\uD869[\uDC00-\uDED6\uDF00-\uDFFF]|\uD86D[\uDC00-\uDF34\uDF40-\uDFFF]|\uD86E[\uDC00-\uDC1D]|\uD87E[\uDC00-\uDE1D]/,
                // ECMAScript 6/Unicode v7.0.0 NonAsciiIdentifierPart:
                NonAsciiIdentifierPart: /[\xAA\xB5\xB7\xBA\xC0-\xD6\xD8-\xF6\xF8-\u02C1\u02C6-\u02D1\u02E0-\u02E4\u02EC\u02EE\u0300-\u0374\u0376\u0377\u037A-\u037D\u037F\u0386-\u038A\u038C\u038E-\u03A1\u03A3-\u03F5\u03F7-\u0481\u0483-\u0487\u048A-\u052F\u0531-\u0556\u0559\u0561-\u0587\u0591-\u05BD\u05BF\u05C1\u05C2\u05C4\u05C5\u05C7\u05D0-\u05EA\u05F0-\u05F2\u0610-\u061A\u0620-\u0669\u066E-\u06D3\u06D5-\u06DC\u06DF-\u06E8\u06EA-\u06FC\u06FF\u0710-\u074A\u074D-\u07B1\u07C0-\u07F5\u07FA\u0800-\u082D\u0840-\u085B\u08A0-\u08B2\u08E4-\u0963\u0966-\u096F\u0971-\u0983\u0985-\u098C\u098F\u0990\u0993-\u09A8\u09AA-\u09B0\u09B2\u09B6-\u09B9\u09BC-\u09C4\u09C7\u09C8\u09CB-\u09CE\u09D7\u09DC\u09DD\u09DF-\u09E3\u09E6-\u09F1\u0A01-\u0A03\u0A05-\u0A0A\u0A0F\u0A10\u0A13-\u0A28\u0A2A-\u0A30\u0A32\u0A33\u0A35\u0A36\u0A38\u0A39\u0A3C\u0A3E-\u0A42\u0A47\u0A48\u0A4B-\u0A4D\u0A51\u0A59-\u0A5C\u0A5E\u0A66-\u0A75\u0A81-\u0A83\u0A85-\u0A8D\u0A8F-\u0A91\u0A93-\u0AA8\u0AAA-\u0AB0\u0AB2\u0AB3\u0AB5-\u0AB9\u0ABC-\u0AC5\u0AC7-\u0AC9\u0ACB-\u0ACD\u0AD0\u0AE0-\u0AE3\u0AE6-\u0AEF\u0B01-\u0B03\u0B05-\u0B0C\u0B0F\u0B10\u0B13-\u0B28\u0B2A-\u0B30\u0B32\u0B33\u0B35-\u0B39\u0B3C-\u0B44\u0B47\u0B48\u0B4B-\u0B4D\u0B56\u0B57\u0B5C\u0B5D\u0B5F-\u0B63\u0B66-\u0B6F\u0B71\u0B82\u0B83\u0B85-\u0B8A\u0B8E-\u0B90\u0B92-\u0B95\u0B99\u0B9A\u0B9C\u0B9E\u0B9F\u0BA3\u0BA4\u0BA8-\u0BAA\u0BAE-\u0BB9\u0BBE-\u0BC2\u0BC6-\u0BC8\u0BCA-\u0BCD\u0BD0\u0BD7\u0BE6-\u0BEF\u0C00-\u0C03\u0C05-\u0C0C\u0C0E-\u0C10\u0C12-\u0C28\u0C2A-\u0C39\u0C3D-\u0C44\u0C46-\u0C48\u0C4A-\u0C4D\u0C55\u0C56\u0C58\u0C59\u0C60-\u0C63\u0C66-\u0C6F\u0C81-\u0C83\u0C85-\u0C8C\u0C8E-\u0C90\u0C92-\u0CA8\u0CAA-\u0CB3\u0CB5-\u0CB9\u0CBC-\u0CC4\u0CC6-\u0CC8\u0CCA-\u0CCD\u0CD5\u0CD6\u0CDE\u0CE0-\u0CE3\u0CE6-\u0CEF\u0CF1\u0CF2\u0D01-\u0D03\u0D05-\u0D0C\u0D0E-\u0D10\u0D12-\u0D3A\u0D3D-\u0D44\u0D46-\u0D48\u0D4A-\u0D4E\u0D57\u0D60-\u0D63\u0D66-\u0D6F\u0D7A-\u0D7F\u0D82\u0D83\u0D85-\u0D96\u0D9A-\u0DB1\u0DB3-\u0DBB\u0DBD\u0DC0-\u0DC6\u0DCA\u0DCF-\u0DD4\u0DD6\u0DD8-\u0DDF\u0DE6-\u0DEF\u0DF2\u0DF3\u0E01-\u0E3A\u0E40-\u0E4E\u0E50-\u0E59\u0E81\u0E82\u0E84\u0E87\u0E88\u0E8A\u0E8D\u0E94-\u0E97\u0E99-\u0E9F\u0EA1-\u0EA3\u0EA5\u0EA7\u0EAA\u0EAB\u0EAD-\u0EB9\u0EBB-\u0EBD\u0EC0-\u0EC4\u0EC6\u0EC8-\u0ECD\u0ED0-\u0ED9\u0EDC-\u0EDF\u0F00\u0F18\u0F19\u0F20-\u0F29\u0F35\u0F37\u0F39\u0F3E-\u0F47\u0F49-\u0F6C\u0F71-\u0F84\u0F86-\u0F97\u0F99-\u0FBC\u0FC6\u1000-\u1049\u1050-\u109D\u10A0-\u10C5\u10C7\u10CD\u10D0-\u10FA\u10FC-\u1248\u124A-\u124D\u1250-\u1256\u1258\u125A-\u125D\u1260-\u1288\u128A-\u128D\u1290-\u12B0\u12B2-\u12B5\u12B8-\u12BE\u12C0\u12C2-\u12C5\u12C8-\u12D6\u12D8-\u1310\u1312-\u1315\u1318-\u135A\u135D-\u135F\u1369-\u1371\u1380-\u138F\u13A0-\u13F4\u1401-\u166C\u166F-\u167F\u1681-\u169A\u16A0-\u16EA\u16EE-\u16F8\u1700-\u170C\u170E-\u1714\u1720-\u1734\u1740-\u1753\u1760-\u176C\u176E-\u1770\u1772\u1773\u1780-\u17D3\u17D7\u17DC\u17DD\u17E0-\u17E9\u180B-\u180D\u1810-\u1819\u1820-\u1877\u1880-\u18AA\u18B0-\u18F5\u1900-\u191E\u1920-\u192B\u1930-\u193B\u1946-\u196D\u1970-\u1974\u1980-\u19AB\u19B0-\u19C9\u19D0-\u19DA\u1A00-\u1A1B\u1A20-\u1A5E\u1A60-\u1A7C\u1A7F-\u1A89\u1A90-\u1A99\u1AA7\u1AB0-\u1ABD\u1B00-\u1B4B\u1B50-\u1B59\u1B6B-\u1B73\u1B80-\u1BF3\u1C00-\u1C37\u1C40-\u1C49\u1C4D-\u1C7D\u1CD0-\u1CD2\u1CD4-\u1CF6\u1CF8\u1CF9\u1D00-\u1DF5\u1DFC-\u1F15\u1F18-\u1F1D\u1F20-\u1F45\u1F48-\u1F4D\u1F50-\u1F57\u1F59\u1F5B\u1F5D\u1F5F-\u1F7D\u1F80-\u1FB4\u1FB6-\u1FBC\u1FBE\u1FC2-\u1FC4\u1FC6-\u1FCC\u1FD0-\u1FD3\u1FD6-\u1FDB\u1FE0-\u1FEC\u1FF2-\u1FF4\u1FF6-\u1FFC\u200C\u200D\u203F\u2040\u2054\u2071\u207F\u2090-\u209C\u20D0-\u20DC\u20E1\u20E5-\u20F0\u2102\u2107\u210A-\u2113\u2115\u2118-\u211D\u2124\u2126\u2128\u212A-\u2139\u213C-\u213F\u2145-\u2149\u214E\u2160-\u2188\u2C00-\u2C2E\u2C30-\u2C5E\u2C60-\u2CE4\u2CEB-\u2CF3\u2D00-\u2D25\u2D27\u2D2D\u2D30-\u2D67\u2D6F\u2D7F-\u2D96\u2DA0-\u2DA6\u2DA8-\u2DAE\u2DB0-\u2DB6\u2DB8-\u2DBE\u2DC0-\u2DC6\u2DC8-\u2DCE\u2DD0-\u2DD6\u2DD8-\u2DDE\u2DE0-\u2DFF\u3005-\u3007\u3021-\u302F\u3031-\u3035\u3038-\u303C\u3041-\u3096\u3099-\u309F\u30A1-\u30FA\u30FC-\u30FF\u3105-\u312D\u3131-\u318E\u31A0-\u31BA\u31F0-\u31FF\u3400-\u4DB5\u4E00-\u9FCC\uA000-\uA48C\uA4D0-\uA4FD\uA500-\uA60C\uA610-\uA62B\uA640-\uA66F\uA674-\uA67D\uA67F-\uA69D\uA69F-\uA6F1\uA717-\uA71F\uA722-\uA788\uA78B-\uA78E\uA790-\uA7AD\uA7B0\uA7B1\uA7F7-\uA827\uA840-\uA873\uA880-\uA8C4\uA8D0-\uA8D9\uA8E0-\uA8F7\uA8FB\uA900-\uA92D\uA930-\uA953\uA960-\uA97C\uA980-\uA9C0\uA9CF-\uA9D9\uA9E0-\uA9FE\uAA00-\uAA36\uAA40-\uAA4D\uAA50-\uAA59\uAA60-\uAA76\uAA7A-\uAAC2\uAADB-\uAADD\uAAE0-\uAAEF\uAAF2-\uAAF6\uAB01-\uAB06\uAB09-\uAB0E\uAB11-\uAB16\uAB20-\uAB26\uAB28-\uAB2E\uAB30-\uAB5A\uAB5C-\uAB5F\uAB64\uAB65\uABC0-\uABEA\uABEC\uABED\uABF0-\uABF9\uAC00-\uD7A3\uD7B0-\uD7C6\uD7CB-\uD7FB\uF900-\uFA6D\uFA70-\uFAD9\uFB00-\uFB06\uFB13-\uFB17\uFB1D-\uFB28\uFB2A-\uFB36\uFB38-\uFB3C\uFB3E\uFB40\uFB41\uFB43\uFB44\uFB46-\uFBB1\uFBD3-\uFD3D\uFD50-\uFD8F\uFD92-\uFDC7\uFDF0-\uFDFB\uFE00-\uFE0F\uFE20-\uFE2D\uFE33\uFE34\uFE4D-\uFE4F\uFE70-\uFE74\uFE76-\uFEFC\uFF10-\uFF19\uFF21-\uFF3A\uFF3F\uFF41-\uFF5A\uFF66-\uFFBE\uFFC2-\uFFC7\uFFCA-\uFFCF\uFFD2-\uFFD7\uFFDA-\uFFDC]|\uD800[\uDC00-\uDC0B\uDC0D-\uDC26\uDC28-\uDC3A\uDC3C\uDC3D\uDC3F-\uDC4D\uDC50-\uDC5D\uDC80-\uDCFA\uDD40-\uDD74\uDDFD\uDE80-\uDE9C\uDEA0-\uDED0\uDEE0\uDF00-\uDF1F\uDF30-\uDF4A\uDF50-\uDF7A\uDF80-\uDF9D\uDFA0-\uDFC3\uDFC8-\uDFCF\uDFD1-\uDFD5]|\uD801[\uDC00-\uDC9D\uDCA0-\uDCA9\uDD00-\uDD27\uDD30-\uDD63\uDE00-\uDF36\uDF40-\uDF55\uDF60-\uDF67]|\uD802[\uDC00-\uDC05\uDC08\uDC0A-\uDC35\uDC37\uDC38\uDC3C\uDC3F-\uDC55\uDC60-\uDC76\uDC80-\uDC9E\uDD00-\uDD15\uDD20-\uDD39\uDD80-\uDDB7\uDDBE\uDDBF\uDE00-\uDE03\uDE05\uDE06\uDE0C-\uDE13\uDE15-\uDE17\uDE19-\uDE33\uDE38-\uDE3A\uDE3F\uDE60-\uDE7C\uDE80-\uDE9C\uDEC0-\uDEC7\uDEC9-\uDEE6\uDF00-\uDF35\uDF40-\uDF55\uDF60-\uDF72\uDF80-\uDF91]|\uD803[\uDC00-\uDC48]|\uD804[\uDC00-\uDC46\uDC66-\uDC6F\uDC7F-\uDCBA\uDCD0-\uDCE8\uDCF0-\uDCF9\uDD00-\uDD34\uDD36-\uDD3F\uDD50-\uDD73\uDD76\uDD80-\uDDC4\uDDD0-\uDDDA\uDE00-\uDE11\uDE13-\uDE37\uDEB0-\uDEEA\uDEF0-\uDEF9\uDF01-\uDF03\uDF05-\uDF0C\uDF0F\uDF10\uDF13-\uDF28\uDF2A-\uDF30\uDF32\uDF33\uDF35-\uDF39\uDF3C-\uDF44\uDF47\uDF48\uDF4B-\uDF4D\uDF57\uDF5D-\uDF63\uDF66-\uDF6C\uDF70-\uDF74]|\uD805[\uDC80-\uDCC5\uDCC7\uDCD0-\uDCD9\uDD80-\uDDB5\uDDB8-\uDDC0\uDE00-\uDE40\uDE44\uDE50-\uDE59\uDE80-\uDEB7\uDEC0-\uDEC9]|\uD806[\uDCA0-\uDCE9\uDCFF\uDEC0-\uDEF8]|\uD808[\uDC00-\uDF98]|\uD809[\uDC00-\uDC6E]|[\uD80C\uD840-\uD868\uD86A-\uD86C][\uDC00-\uDFFF]|\uD80D[\uDC00-\uDC2E]|\uD81A[\uDC00-\uDE38\uDE40-\uDE5E\uDE60-\uDE69\uDED0-\uDEED\uDEF0-\uDEF4\uDF00-\uDF36\uDF40-\uDF43\uDF50-\uDF59\uDF63-\uDF77\uDF7D-\uDF8F]|\uD81B[\uDF00-\uDF44\uDF50-\uDF7E\uDF8F-\uDF9F]|\uD82C[\uDC00\uDC01]|\uD82F[\uDC00-\uDC6A\uDC70-\uDC7C\uDC80-\uDC88\uDC90-\uDC99\uDC9D\uDC9E]|\uD834[\uDD65-\uDD69\uDD6D-\uDD72\uDD7B-\uDD82\uDD85-\uDD8B\uDDAA-\uDDAD\uDE42-\uDE44]|\uD835[\uDC00-\uDC54\uDC56-\uDC9C\uDC9E\uDC9F\uDCA2\uDCA5\uDCA6\uDCA9-\uDCAC\uDCAE-\uDCB9\uDCBB\uDCBD-\uDCC3\uDCC5-\uDD05\uDD07-\uDD0A\uDD0D-\uDD14\uDD16-\uDD1C\uDD1E-\uDD39\uDD3B-\uDD3E\uDD40-\uDD44\uDD46\uDD4A-\uDD50\uDD52-\uDEA5\uDEA8-\uDEC0\uDEC2-\uDEDA\uDEDC-\uDEFA\uDEFC-\uDF14\uDF16-\uDF34\uDF36-\uDF4E\uDF50-\uDF6E\uDF70-\uDF88\uDF8A-\uDFA8\uDFAA-\uDFC2\uDFC4-\uDFCB\uDFCE-\uDFFF]|\uD83A[\uDC00-\uDCC4\uDCD0-\uDCD6]|\uD83B[\uDE00-\uDE03\uDE05-\uDE1F\uDE21\uDE22\uDE24\uDE27\uDE29-\uDE32\uDE34-\uDE37\uDE39\uDE3B\uDE42\uDE47\uDE49\uDE4B\uDE4D-\uDE4F\uDE51\uDE52\uDE54\uDE57\uDE59\uDE5B\uDE5D\uDE5F\uDE61\uDE62\uDE64\uDE67-\uDE6A\uDE6C-\uDE72\uDE74-\uDE77\uDE79-\uDE7C\uDE7E\uDE80-\uDE89\uDE8B-\uDE9B\uDEA1-\uDEA3\uDEA5-\uDEA9\uDEAB-\uDEBB]|\uD869[\uDC00-\uDED6\uDF00-\uDFFF]|\uD86D[\uDC00-\uDF34\uDF40-\uDFFF]|\uD86E[\uDC00-\uDC1D]|\uD87E[\uDC00-\uDE1D]|\uDB40[\uDD00-\uDDEF]/
              };

              function isDecimalDigit(ch) {
                return 0x30 <= ch && ch <= 0x39; // 0..9
              }

              function isHexDigit(ch) {
                return 0x30 <= ch && ch <= 0x39 || // 0..9
                0x61 <= ch && ch <= 0x66 || // a..f
                0x41 <= ch && ch <= 0x46; // A..F
              }

              function isOctalDigit(ch) {
                return ch >= 0x30 && ch <= 0x37; // 0..7
              } // 7.2 White Space


              NON_ASCII_WHITESPACES = [0x1680, 0x180E, 0x2000, 0x2001, 0x2002, 0x2003, 0x2004, 0x2005, 0x2006, 0x2007, 0x2008, 0x2009, 0x200A, 0x202F, 0x205F, 0x3000, 0xFEFF];

              function isWhiteSpace(ch) {
                return ch === 0x20 || ch === 0x09 || ch === 0x0B || ch === 0x0C || ch === 0xA0 || ch >= 0x1680 && NON_ASCII_WHITESPACES.indexOf(ch) >= 0;
              } // 7.3 Line Terminators


              function isLineTerminator(ch) {
                return ch === 0x0A || ch === 0x0D || ch === 0x2028 || ch === 0x2029;
              } // 7.6 Identifier Names and Identifiers


              function fromCodePoint(cp) {
                if (cp <= 0xFFFF) {
                  return String.fromCharCode(cp);
                }

                var cu1 = String.fromCharCode(Math.floor((cp - 0x10000) / 0x400) + 0xD800);
                var cu2 = String.fromCharCode((cp - 0x10000) % 0x400 + 0xDC00);
                return cu1 + cu2;
              }

              IDENTIFIER_START = new Array(0x80);

              for (ch = 0; ch < 0x80; ++ch) {
                IDENTIFIER_START[ch] = ch >= 0x61 && ch <= 0x7A || // a..z
                ch >= 0x41 && ch <= 0x5A || // A..Z
                ch === 0x24 || ch === 0x5F; // $ (dollar) and _ (underscore)
              }

              IDENTIFIER_PART = new Array(0x80);

              for (ch = 0; ch < 0x80; ++ch) {
                IDENTIFIER_PART[ch] = ch >= 0x61 && ch <= 0x7A || // a..z
                ch >= 0x41 && ch <= 0x5A || // A..Z
                ch >= 0x30 && ch <= 0x39 || // 0..9
                ch === 0x24 || ch === 0x5F; // $ (dollar) and _ (underscore)
              }

              function isIdentifierStartES5(ch) {
                return ch < 0x80 ? IDENTIFIER_START[ch] : ES5Regex.NonAsciiIdentifierStart.test(fromCodePoint(ch));
              }

              function isIdentifierPartES5(ch) {
                return ch < 0x80 ? IDENTIFIER_PART[ch] : ES5Regex.NonAsciiIdentifierPart.test(fromCodePoint(ch));
              }

              function isIdentifierStartES6(ch) {
                return ch < 0x80 ? IDENTIFIER_START[ch] : ES6Regex.NonAsciiIdentifierStart.test(fromCodePoint(ch));
              }

              function isIdentifierPartES6(ch) {
                return ch < 0x80 ? IDENTIFIER_PART[ch] : ES6Regex.NonAsciiIdentifierPart.test(fromCodePoint(ch));
              }

              module.exports = {
                isDecimalDigit: isDecimalDigit,
                isHexDigit: isHexDigit,
                isOctalDigit: isOctalDigit,
                isWhiteSpace: isWhiteSpace,
                isLineTerminator: isLineTerminator,
                isIdentifierStartES5: isIdentifierStartES5,
                isIdentifierPartES5: isIdentifierPartES5,
                isIdentifierStartES6: isIdentifierStartES6,
                isIdentifierPartES6: isIdentifierPartES6
              };
            })();
            /* vim: set sw=4 ts=4 et tw=80 : */
            });
            var code_1 = code.isDecimalDigit;
            var code_2 = code.isHexDigit;
            var code_3 = code.isOctalDigit;
            var code_4 = code.isWhiteSpace;
            var code_5 = code.isLineTerminator;
            var code_6 = code.isIdentifierStartES5;
            var code_7 = code.isIdentifierPartES5;
            var code_8 = code.isIdentifierStartES6;
            var code_9 = code.isIdentifierPartES6;

            var keyword = createCommonjsModule(function (module) {
            /*
              Copyright (C) 2013 Yusuke Suzuki <utatane.tea@gmail.com>

              Redistribution and use in source and binary forms, with or without
              modification, are permitted provided that the following conditions are met:

                * Redistributions of source code must retain the above copyright
                  notice, this list of conditions and the following disclaimer.
                * Redistributions in binary form must reproduce the above copyright
                  notice, this list of conditions and the following disclaimer in the
                  documentation and/or other materials provided with the distribution.

              THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
              AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
              IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
              ARE DISCLAIMED. IN NO EVENT SHALL <COPYRIGHT HOLDER> BE LIABLE FOR ANY
              DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
              (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
              LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
              ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
              (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
              THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
            */
            (function () {

              var code$$1 = code;

              function isStrictModeReservedWordES6(id) {
                switch (id) {
                  case 'implements':
                  case 'interface':
                  case 'package':
                  case 'private':
                  case 'protected':
                  case 'public':
                  case 'static':
                  case 'let':
                    return true;

                  default:
                    return false;
                }
              }

              function isKeywordES5(id, strict) {
                // yield should not be treated as keyword under non-strict mode.
                if (!strict && id === 'yield') {
                  return false;
                }

                return isKeywordES6(id, strict);
              }

              function isKeywordES6(id, strict) {
                if (strict && isStrictModeReservedWordES6(id)) {
                  return true;
                }

                switch (id.length) {
                  case 2:
                    return id === 'if' || id === 'in' || id === 'do';

                  case 3:
                    return id === 'var' || id === 'for' || id === 'new' || id === 'try';

                  case 4:
                    return id === 'this' || id === 'else' || id === 'case' || id === 'void' || id === 'with' || id === 'enum';

                  case 5:
                    return id === 'while' || id === 'break' || id === 'catch' || id === 'throw' || id === 'const' || id === 'yield' || id === 'class' || id === 'super';

                  case 6:
                    return id === 'return' || id === 'typeof' || id === 'delete' || id === 'switch' || id === 'export' || id === 'import';

                  case 7:
                    return id === 'default' || id === 'finally' || id === 'extends';

                  case 8:
                    return id === 'function' || id === 'continue' || id === 'debugger';

                  case 10:
                    return id === 'instanceof';

                  default:
                    return false;
                }
              }

              function isReservedWordES5(id, strict) {
                return id === 'null' || id === 'true' || id === 'false' || isKeywordES5(id, strict);
              }

              function isReservedWordES6(id, strict) {
                return id === 'null' || id === 'true' || id === 'false' || isKeywordES6(id, strict);
              }

              function isRestrictedWord(id) {
                return id === 'eval' || id === 'arguments';
              }

              function isIdentifierNameES5(id) {
                var i, iz, ch;

                if (id.length === 0) {
                  return false;
                }

                ch = id.charCodeAt(0);

                if (!code$$1.isIdentifierStartES5(ch)) {
                  return false;
                }

                for (i = 1, iz = id.length; i < iz; ++i) {
                  ch = id.charCodeAt(i);

                  if (!code$$1.isIdentifierPartES5(ch)) {
                    return false;
                  }
                }

                return true;
              }

              function decodeUtf16(lead, trail) {
                return (lead - 0xD800) * 0x400 + (trail - 0xDC00) + 0x10000;
              }

              function isIdentifierNameES6(id) {
                var i, iz, ch, lowCh, check;

                if (id.length === 0) {
                  return false;
                }

                check = code$$1.isIdentifierStartES6;

                for (i = 0, iz = id.length; i < iz; ++i) {
                  ch = id.charCodeAt(i);

                  if (0xD800 <= ch && ch <= 0xDBFF) {
                    ++i;

                    if (i >= iz) {
                      return false;
                    }

                    lowCh = id.charCodeAt(i);

                    if (!(0xDC00 <= lowCh && lowCh <= 0xDFFF)) {
                      return false;
                    }

                    ch = decodeUtf16(ch, lowCh);
                  }

                  if (!check(ch)) {
                    return false;
                  }

                  check = code$$1.isIdentifierPartES6;
                }

                return true;
              }

              function isIdentifierES5(id, strict) {
                return isIdentifierNameES5(id) && !isReservedWordES5(id, strict);
              }

              function isIdentifierES6(id, strict) {
                return isIdentifierNameES6(id) && !isReservedWordES6(id, strict);
              }

              module.exports = {
                isKeywordES5: isKeywordES5,
                isKeywordES6: isKeywordES6,
                isReservedWordES5: isReservedWordES5,
                isReservedWordES6: isReservedWordES6,
                isRestrictedWord: isRestrictedWord,
                isIdentifierNameES5: isIdentifierNameES5,
                isIdentifierNameES6: isIdentifierNameES6,
                isIdentifierES5: isIdentifierES5,
                isIdentifierES6: isIdentifierES6
              };
            })();
            /* vim: set sw=4 ts=4 et tw=80 : */
            });
            var keyword_1 = keyword.isKeywordES5;
            var keyword_2 = keyword.isKeywordES6;
            var keyword_3 = keyword.isReservedWordES5;
            var keyword_4 = keyword.isReservedWordES6;
            var keyword_5 = keyword.isRestrictedWord;
            var keyword_6 = keyword.isIdentifierNameES5;
            var keyword_7 = keyword.isIdentifierNameES6;
            var keyword_8 = keyword.isIdentifierES5;
            var keyword_9 = keyword.isIdentifierES6;

            var utils = createCommonjsModule(function (module, exports) {
            /*
              Copyright (C) 2013 Yusuke Suzuki <utatane.tea@gmail.com>

              Redistribution and use in source and binary forms, with or without
              modification, are permitted provided that the following conditions are met:

                * Redistributions of source code must retain the above copyright
                  notice, this list of conditions and the following disclaimer.
                * Redistributions in binary form must reproduce the above copyright
                  notice, this list of conditions and the following disclaimer in the
                  documentation and/or other materials provided with the distribution.

              THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
              AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
              IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
              ARE DISCLAIMED. IN NO EVENT SHALL <COPYRIGHT HOLDER> BE LIABLE FOR ANY
              DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
              (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
              LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
              ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
              (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
              THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
            */
            (function () {

              exports.ast = ast;
              exports.code = code;
              exports.keyword = keyword;
            })();
            /* vim: set sw=4 ts=4 et tw=80 : */
            });
            var utils_1 = utils.ast;
            var utils_2 = utils.code;
            var utils_3 = utils.keyword;

            var isValidIdentifier_1 = createCommonjsModule(function (module, exports) {

            Object.defineProperty(exports, "__esModule", {
              value: true
            });
            exports.default = isValidIdentifier;

            function _esutils() {
              const data = _interopRequireDefault(utils);

              _esutils = function () {
                return data;
              };

              return data;
            }

            function _interopRequireDefault(obj) {
              return obj && obj.__esModule ? obj : {
                default: obj
              };
            }

            function isValidIdentifier(name) {
              if (typeof name !== "string" || _esutils().default.keyword.isReservedWordES6(name, true)) {
                return false;
              } else if (name === "await") {
                return false;
              } else {
                return _esutils().default.keyword.isIdentifierNameES6(name);
              }
            }
            });

            unwrapExports(isValidIdentifier_1);

            var constants = createCommonjsModule(function (module, exports) {

            Object.defineProperty(exports, "__esModule", {
              value: true
            });
            exports.NOT_LOCAL_BINDING = exports.BLOCK_SCOPED_SYMBOL = exports.INHERIT_KEYS = exports.UNARY_OPERATORS = exports.STRING_UNARY_OPERATORS = exports.NUMBER_UNARY_OPERATORS = exports.BOOLEAN_UNARY_OPERATORS = exports.BINARY_OPERATORS = exports.NUMBER_BINARY_OPERATORS = exports.BOOLEAN_BINARY_OPERATORS = exports.COMPARISON_BINARY_OPERATORS = exports.EQUALITY_BINARY_OPERATORS = exports.BOOLEAN_NUMBER_BINARY_OPERATORS = exports.UPDATE_OPERATORS = exports.LOGICAL_OPERATORS = exports.COMMENT_KEYS = exports.FOR_INIT_KEYS = exports.FLATTENABLE_KEYS = exports.STATEMENT_OR_BLOCK_KEYS = void 0;
            const STATEMENT_OR_BLOCK_KEYS = ["consequent", "body", "alternate"];
            exports.STATEMENT_OR_BLOCK_KEYS = STATEMENT_OR_BLOCK_KEYS;
            const FLATTENABLE_KEYS = ["body", "expressions"];
            exports.FLATTENABLE_KEYS = FLATTENABLE_KEYS;
            const FOR_INIT_KEYS = ["left", "init"];
            exports.FOR_INIT_KEYS = FOR_INIT_KEYS;
            const COMMENT_KEYS = ["leadingComments", "trailingComments", "innerComments"];
            exports.COMMENT_KEYS = COMMENT_KEYS;
            const LOGICAL_OPERATORS = ["||", "&&", "??"];
            exports.LOGICAL_OPERATORS = LOGICAL_OPERATORS;
            const UPDATE_OPERATORS = ["++", "--"];
            exports.UPDATE_OPERATORS = UPDATE_OPERATORS;
            const BOOLEAN_NUMBER_BINARY_OPERATORS = [">", "<", ">=", "<="];
            exports.BOOLEAN_NUMBER_BINARY_OPERATORS = BOOLEAN_NUMBER_BINARY_OPERATORS;
            const EQUALITY_BINARY_OPERATORS = ["==", "===", "!=", "!=="];
            exports.EQUALITY_BINARY_OPERATORS = EQUALITY_BINARY_OPERATORS;
            const COMPARISON_BINARY_OPERATORS = [...EQUALITY_BINARY_OPERATORS, "in", "instanceof"];
            exports.COMPARISON_BINARY_OPERATORS = COMPARISON_BINARY_OPERATORS;
            const BOOLEAN_BINARY_OPERATORS = [...COMPARISON_BINARY_OPERATORS, ...BOOLEAN_NUMBER_BINARY_OPERATORS];
            exports.BOOLEAN_BINARY_OPERATORS = BOOLEAN_BINARY_OPERATORS;
            const NUMBER_BINARY_OPERATORS = ["-", "/", "%", "*", "**", "&", "|", ">>", ">>>", "<<", "^"];
            exports.NUMBER_BINARY_OPERATORS = NUMBER_BINARY_OPERATORS;
            const BINARY_OPERATORS = ["+", ...NUMBER_BINARY_OPERATORS, ...BOOLEAN_BINARY_OPERATORS];
            exports.BINARY_OPERATORS = BINARY_OPERATORS;
            const BOOLEAN_UNARY_OPERATORS = ["delete", "!"];
            exports.BOOLEAN_UNARY_OPERATORS = BOOLEAN_UNARY_OPERATORS;
            const NUMBER_UNARY_OPERATORS = ["+", "-", "~"];
            exports.NUMBER_UNARY_OPERATORS = NUMBER_UNARY_OPERATORS;
            const STRING_UNARY_OPERATORS = ["typeof"];
            exports.STRING_UNARY_OPERATORS = STRING_UNARY_OPERATORS;
            const UNARY_OPERATORS = ["void", "throw", ...BOOLEAN_UNARY_OPERATORS, ...NUMBER_UNARY_OPERATORS, ...STRING_UNARY_OPERATORS];
            exports.UNARY_OPERATORS = UNARY_OPERATORS;
            const INHERIT_KEYS = {
              optional: ["typeAnnotation", "typeParameters", "returnType"],
              force: ["start", "loc", "end"]
            };
            exports.INHERIT_KEYS = INHERIT_KEYS;
            const BLOCK_SCOPED_SYMBOL = Symbol.for("var used to be block scoped");
            exports.BLOCK_SCOPED_SYMBOL = BLOCK_SCOPED_SYMBOL;
            const NOT_LOCAL_BINDING = Symbol.for("should not be considered a local binding");
            exports.NOT_LOCAL_BINDING = NOT_LOCAL_BINDING;
            });

            unwrapExports(constants);
            var constants_1 = constants.NOT_LOCAL_BINDING;
            var constants_2 = constants.BLOCK_SCOPED_SYMBOL;
            var constants_3 = constants.INHERIT_KEYS;
            var constants_4 = constants.UNARY_OPERATORS;
            var constants_5 = constants.STRING_UNARY_OPERATORS;
            var constants_6 = constants.NUMBER_UNARY_OPERATORS;
            var constants_7 = constants.BOOLEAN_UNARY_OPERATORS;
            var constants_8 = constants.BINARY_OPERATORS;
            var constants_9 = constants.NUMBER_BINARY_OPERATORS;
            var constants_10 = constants.BOOLEAN_BINARY_OPERATORS;
            var constants_11 = constants.COMPARISON_BINARY_OPERATORS;
            var constants_12 = constants.EQUALITY_BINARY_OPERATORS;
            var constants_13 = constants.BOOLEAN_NUMBER_BINARY_OPERATORS;
            var constants_14 = constants.UPDATE_OPERATORS;
            var constants_15 = constants.LOGICAL_OPERATORS;
            var constants_16 = constants.COMMENT_KEYS;
            var constants_17 = constants.FOR_INIT_KEYS;
            var constants_18 = constants.FLATTENABLE_KEYS;
            var constants_19 = constants.STATEMENT_OR_BLOCK_KEYS;

            var isType_1 = createCommonjsModule(function (module, exports) {

            Object.defineProperty(exports, "__esModule", {
              value: true
            });
            exports.default = isType;



            function isType(nodeType, targetType) {
              if (nodeType === targetType) return true;
              if (definitions.ALIAS_KEYS[targetType]) return false;
              const aliases = definitions.FLIPPED_ALIAS_KEYS[targetType];

              if (aliases) {
                if (aliases[0] === nodeType) return true;

                for (const alias of aliases) {
                  if (nodeType === alias) return true;
                }
              }

              return false;
            }
            });

            unwrapExports(isType_1);

            var is_1 = createCommonjsModule(function (module, exports) {

            Object.defineProperty(exports, "__esModule", {
              value: true
            });
            exports.default = is;

            var _shallowEqual = _interopRequireDefault(shallowEqual_1);

            var _isType = _interopRequireDefault(isType_1);

            function _interopRequireDefault(obj) {
              return obj && obj.__esModule ? obj : {
                default: obj
              };
            }

            function is(type, node, opts) {
              if (!node) return false;
              const matches = (0, _isType.default)(node.type, type);
              if (!matches) return false;

              if (typeof opts === "undefined") {
                return true;
              } else {
                return (0, _shallowEqual.default)(node, opts);
              }
            }
            });

            unwrapExports(is_1);

            var utils$1 = createCommonjsModule(function (module, exports) {

            Object.defineProperty(exports, "__esModule", {
              value: true
            });
            exports.validate = validate;
            exports.typeIs = typeIs;
            exports.validateType = validateType;
            exports.validateOptional = validateOptional;
            exports.validateOptionalType = validateOptionalType;
            exports.arrayOf = arrayOf;
            exports.arrayOfType = arrayOfType;
            exports.validateArrayOfType = validateArrayOfType;
            exports.assertEach = assertEach;
            exports.assertOneOf = assertOneOf;
            exports.assertNodeType = assertNodeType;
            exports.assertNodeOrValueType = assertNodeOrValueType;
            exports.assertValueType = assertValueType;
            exports.chain = chain;
            exports.default = defineType;
            exports.DEPRECATED_KEYS = exports.BUILDER_KEYS = exports.NODE_FIELDS = exports.FLIPPED_ALIAS_KEYS = exports.ALIAS_KEYS = exports.VISITOR_KEYS = void 0;

            var _is = _interopRequireDefault(is_1);

            function _interopRequireDefault(obj) {
              return obj && obj.__esModule ? obj : {
                default: obj
              };
            }

            const VISITOR_KEYS = {};
            exports.VISITOR_KEYS = VISITOR_KEYS;
            const ALIAS_KEYS = {};
            exports.ALIAS_KEYS = ALIAS_KEYS;
            const FLIPPED_ALIAS_KEYS = {};
            exports.FLIPPED_ALIAS_KEYS = FLIPPED_ALIAS_KEYS;
            const NODE_FIELDS = {};
            exports.NODE_FIELDS = NODE_FIELDS;
            const BUILDER_KEYS = {};
            exports.BUILDER_KEYS = BUILDER_KEYS;
            const DEPRECATED_KEYS = {};
            exports.DEPRECATED_KEYS = DEPRECATED_KEYS;

            function getType(val) {
              if (Array.isArray(val)) {
                return "array";
              } else if (val === null) {
                return "null";
              } else if (val === undefined) {
                return "undefined";
              } else {
                return typeof val;
              }
            }

            function validate(validate) {
              return {
                validate
              };
            }

            function typeIs(typeName) {
              return typeof typeName === "string" ? assertNodeType(typeName) : assertNodeType(...typeName);
            }

            function validateType(typeName) {
              return validate(typeIs(typeName));
            }

            function validateOptional(validate) {
              return {
                validate,
                optional: true
              };
            }

            function validateOptionalType(typeName) {
              return {
                validate: typeIs(typeName),
                optional: true
              };
            }

            function arrayOf(elementType) {
              return chain(assertValueType("array"), assertEach(elementType));
            }

            function arrayOfType(typeName) {
              return arrayOf(typeIs(typeName));
            }

            function validateArrayOfType(typeName) {
              return validate(arrayOfType(typeName));
            }

            function assertEach(callback) {
              function validator(node, key, val) {
                if (!Array.isArray(val)) return;

                for (let i = 0; i < val.length; i++) {
                  callback(node, `${key}[${i}]`, val[i]);
                }
              }

              validator.each = callback;
              return validator;
            }

            function assertOneOf(...values) {
              function validate(node, key, val) {
                if (values.indexOf(val) < 0) {
                  throw new TypeError(`Property ${key} expected value to be one of ${JSON.stringify(values)} but got ${JSON.stringify(val)}`);
                }
              }

              validate.oneOf = values;
              return validate;
            }

            function assertNodeType(...types) {
              function validate(node, key, val) {
                let valid = false;

                for (const type of types) {
                  if ((0, _is.default)(type, val)) {
                    valid = true;
                    break;
                  }
                }

                if (!valid) {
                  throw new TypeError(`Property ${key} of ${node.type} expected node to be of a type ${JSON.stringify(types)} ` + `but instead got ${JSON.stringify(val && val.type)}`);
                }
              }

              validate.oneOfNodeTypes = types;
              return validate;
            }

            function assertNodeOrValueType(...types) {
              function validate(node, key, val) {
                let valid = false;

                for (const type of types) {
                  if (getType(val) === type || (0, _is.default)(type, val)) {
                    valid = true;
                    break;
                  }
                }

                if (!valid) {
                  throw new TypeError(`Property ${key} of ${node.type} expected node to be of a type ${JSON.stringify(types)} ` + `but instead got ${JSON.stringify(val && val.type)}`);
                }
              }

              validate.oneOfNodeOrValueTypes = types;
              return validate;
            }

            function assertValueType(type) {
              function validate(node, key, val) {
                const valid = getType(val) === type;

                if (!valid) {
                  throw new TypeError(`Property ${key} expected type of ${type} but got ${getType(val)}`);
                }
              }

              validate.type = type;
              return validate;
            }

            function chain(...fns) {
              function validate(...args) {
                for (const fn of fns) {
                  fn(...args);
                }
              }

              validate.chainOf = fns;
              return validate;
            }

            function defineType(type, opts = {}) {
              const inherits = opts.inherits && store[opts.inherits] || {};
              const fields = opts.fields || inherits.fields || {};
              const visitor = opts.visitor || inherits.visitor || [];
              const aliases = opts.aliases || inherits.aliases || [];
              const builder = opts.builder || inherits.builder || opts.visitor || [];

              if (opts.deprecatedAlias) {
                DEPRECATED_KEYS[opts.deprecatedAlias] = type;
              }

              for (const key of visitor.concat(builder)) {
                fields[key] = fields[key] || {};
              }

              for (const key in fields) {
                const field = fields[key];

                if (builder.indexOf(key) === -1) {
                  field.optional = true;
                }

                if (field.default === undefined) {
                  field.default = null;
                } else if (!field.validate) {
                  field.validate = assertValueType(getType(field.default));
                }
              }

              VISITOR_KEYS[type] = opts.visitor = visitor;
              BUILDER_KEYS[type] = opts.builder = builder;
              NODE_FIELDS[type] = opts.fields = fields;
              ALIAS_KEYS[type] = opts.aliases = aliases;
              aliases.forEach(alias => {
                FLIPPED_ALIAS_KEYS[alias] = FLIPPED_ALIAS_KEYS[alias] || [];
                FLIPPED_ALIAS_KEYS[alias].push(type);
              });
              store[type] = opts;
            }

            const store = {};
            });

            unwrapExports(utils$1);
            var utils_1$1 = utils$1.validate;
            var utils_2$1 = utils$1.typeIs;
            var utils_3$1 = utils$1.validateType;
            var utils_4 = utils$1.validateOptional;
            var utils_5 = utils$1.validateOptionalType;
            var utils_6 = utils$1.arrayOf;
            var utils_7 = utils$1.arrayOfType;
            var utils_8 = utils$1.validateArrayOfType;
            var utils_9 = utils$1.assertEach;
            var utils_10 = utils$1.assertOneOf;
            var utils_11 = utils$1.assertNodeType;
            var utils_12 = utils$1.assertNodeOrValueType;
            var utils_13 = utils$1.assertValueType;
            var utils_14 = utils$1.chain;
            var utils_15 = utils$1.DEPRECATED_KEYS;
            var utils_16 = utils$1.BUILDER_KEYS;
            var utils_17 = utils$1.NODE_FIELDS;
            var utils_18 = utils$1.FLIPPED_ALIAS_KEYS;
            var utils_19 = utils$1.ALIAS_KEYS;
            var utils_20 = utils$1.VISITOR_KEYS;

            var core = createCommonjsModule(function (module, exports) {

            Object.defineProperty(exports, "__esModule", {
              value: true
            });
            exports.patternLikeCommon = exports.functionDeclarationCommon = exports.functionTypeAnnotationCommon = exports.functionCommon = void 0;

            var _isValidIdentifier = _interopRequireDefault(isValidIdentifier_1);



            var _utils = _interopRequireWildcard(utils$1);

            function _interopRequireWildcard(obj) {
              if (obj && obj.__esModule) {
                return obj;
              } else {
                var newObj = {};

                if (obj != null) {
                  for (var key in obj) {
                    if (Object.prototype.hasOwnProperty.call(obj, key)) {
                      var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {};

                      if (desc.get || desc.set) {
                        Object.defineProperty(newObj, key, desc);
                      } else {
                        newObj[key] = obj[key];
                      }
                    }
                  }
                }

                newObj.default = obj;
                return newObj;
              }
            }

            function _interopRequireDefault(obj) {
              return obj && obj.__esModule ? obj : {
                default: obj
              };
            }

            (0, _utils.default)("ArrayExpression", {
              fields: {
                elements: {
                  validate: (0, _utils.chain)((0, _utils.assertValueType)("array"), (0, _utils.assertEach)((0, _utils.assertNodeOrValueType)("null", "Expression", "SpreadElement"))),
                  default: []
                }
              },
              visitor: ["elements"],
              aliases: ["Expression"]
            });
            (0, _utils.default)("AssignmentExpression", {
              fields: {
                operator: {
                  validate: (0, _utils.assertValueType)("string")
                },
                left: {
                  validate: (0, _utils.assertNodeType)("LVal")
                },
                right: {
                  validate: (0, _utils.assertNodeType)("Expression")
                }
              },
              builder: ["operator", "left", "right"],
              visitor: ["left", "right"],
              aliases: ["Expression"]
            });
            (0, _utils.default)("BinaryExpression", {
              builder: ["operator", "left", "right"],
              fields: {
                operator: {
                  validate: (0, _utils.assertOneOf)(...constants.BINARY_OPERATORS)
                },
                left: {
                  validate: (0, _utils.assertNodeType)("Expression")
                },
                right: {
                  validate: (0, _utils.assertNodeType)("Expression")
                }
              },
              visitor: ["left", "right"],
              aliases: ["Binary", "Expression"]
            });
            (0, _utils.default)("InterpreterDirective", {
              builder: ["value"],
              fields: {
                value: {
                  validate: (0, _utils.assertValueType)("string")
                }
              }
            });
            (0, _utils.default)("Directive", {
              visitor: ["value"],
              fields: {
                value: {
                  validate: (0, _utils.assertNodeType)("DirectiveLiteral")
                }
              }
            });
            (0, _utils.default)("DirectiveLiteral", {
              builder: ["value"],
              fields: {
                value: {
                  validate: (0, _utils.assertValueType)("string")
                }
              }
            });
            (0, _utils.default)("BlockStatement", {
              builder: ["body", "directives"],
              visitor: ["directives", "body"],
              fields: {
                directives: {
                  validate: (0, _utils.chain)((0, _utils.assertValueType)("array"), (0, _utils.assertEach)((0, _utils.assertNodeType)("Directive"))),
                  default: []
                },
                body: {
                  validate: (0, _utils.chain)((0, _utils.assertValueType)("array"), (0, _utils.assertEach)((0, _utils.assertNodeType)("Statement")))
                }
              },
              aliases: ["Scopable", "BlockParent", "Block", "Statement"]
            });
            (0, _utils.default)("BreakStatement", {
              visitor: ["label"],
              fields: {
                label: {
                  validate: (0, _utils.assertNodeType)("Identifier"),
                  optional: true
                }
              },
              aliases: ["Statement", "Terminatorless", "CompletionStatement"]
            });
            (0, _utils.default)("CallExpression", {
              visitor: ["callee", "arguments", "typeParameters", "typeArguments"],
              builder: ["callee", "arguments"],
              aliases: ["Expression"],
              fields: {
                callee: {
                  validate: (0, _utils.assertNodeType)("Expression")
                },
                arguments: {
                  validate: (0, _utils.chain)((0, _utils.assertValueType)("array"), (0, _utils.assertEach)((0, _utils.assertNodeType)("Expression", "SpreadElement", "JSXNamespacedName")))
                },
                optional: {
                  validate: (0, _utils.assertOneOf)(true, false),
                  optional: true
                },
                typeArguments: {
                  validate: (0, _utils.assertNodeType)("TypeParameterInstantiation"),
                  optional: true
                },
                typeParameters: {
                  validate: (0, _utils.assertNodeType)("TSTypeParameterInstantiation"),
                  optional: true
                }
              }
            });
            (0, _utils.default)("CatchClause", {
              visitor: ["param", "body"],
              fields: {
                param: {
                  validate: (0, _utils.assertNodeType)("Identifier"),
                  optional: true
                },
                body: {
                  validate: (0, _utils.assertNodeType)("BlockStatement")
                }
              },
              aliases: ["Scopable", "BlockParent"]
            });
            (0, _utils.default)("ConditionalExpression", {
              visitor: ["test", "consequent", "alternate"],
              fields: {
                test: {
                  validate: (0, _utils.assertNodeType)("Expression")
                },
                consequent: {
                  validate: (0, _utils.assertNodeType)("Expression")
                },
                alternate: {
                  validate: (0, _utils.assertNodeType)("Expression")
                }
              },
              aliases: ["Expression", "Conditional"]
            });
            (0, _utils.default)("ContinueStatement", {
              visitor: ["label"],
              fields: {
                label: {
                  validate: (0, _utils.assertNodeType)("Identifier"),
                  optional: true
                }
              },
              aliases: ["Statement", "Terminatorless", "CompletionStatement"]
            });
            (0, _utils.default)("DebuggerStatement", {
              aliases: ["Statement"]
            });
            (0, _utils.default)("DoWhileStatement", {
              visitor: ["test", "body"],
              fields: {
                test: {
                  validate: (0, _utils.assertNodeType)("Expression")
                },
                body: {
                  validate: (0, _utils.assertNodeType)("Statement")
                }
              },
              aliases: ["Statement", "BlockParent", "Loop", "While", "Scopable"]
            });
            (0, _utils.default)("EmptyStatement", {
              aliases: ["Statement"]
            });
            (0, _utils.default)("ExpressionStatement", {
              visitor: ["expression"],
              fields: {
                expression: {
                  validate: (0, _utils.assertNodeType)("Expression")
                }
              },
              aliases: ["Statement", "ExpressionWrapper"]
            });
            (0, _utils.default)("File", {
              builder: ["program", "comments", "tokens"],
              visitor: ["program"],
              fields: {
                program: {
                  validate: (0, _utils.assertNodeType)("Program")
                }
              }
            });
            (0, _utils.default)("ForInStatement", {
              visitor: ["left", "right", "body"],
              aliases: ["Scopable", "Statement", "For", "BlockParent", "Loop", "ForXStatement"],
              fields: {
                left: {
                  validate: (0, _utils.assertNodeType)("VariableDeclaration", "LVal")
                },
                right: {
                  validate: (0, _utils.assertNodeType)("Expression")
                },
                body: {
                  validate: (0, _utils.assertNodeType)("Statement")
                }
              }
            });
            (0, _utils.default)("ForStatement", {
              visitor: ["init", "test", "update", "body"],
              aliases: ["Scopable", "Statement", "For", "BlockParent", "Loop"],
              fields: {
                init: {
                  validate: (0, _utils.assertNodeType)("VariableDeclaration", "Expression"),
                  optional: true
                },
                test: {
                  validate: (0, _utils.assertNodeType)("Expression"),
                  optional: true
                },
                update: {
                  validate: (0, _utils.assertNodeType)("Expression"),
                  optional: true
                },
                body: {
                  validate: (0, _utils.assertNodeType)("Statement")
                }
              }
            });
            const functionCommon = {
              params: {
                validate: (0, _utils.chain)((0, _utils.assertValueType)("array"), (0, _utils.assertEach)((0, _utils.assertNodeType)("LVal")))
              },
              generator: {
                default: false,
                validate: (0, _utils.assertValueType)("boolean")
              },
              async: {
                validate: (0, _utils.assertValueType)("boolean"),
                default: false
              }
            };
            exports.functionCommon = functionCommon;
            const functionTypeAnnotationCommon = {
              returnType: {
                validate: (0, _utils.assertNodeType)("TypeAnnotation", "TSTypeAnnotation", "Noop"),
                optional: true
              },
              typeParameters: {
                validate: (0, _utils.assertNodeType)("TypeParameterDeclaration", "TSTypeParameterDeclaration", "Noop"),
                optional: true
              }
            };
            exports.functionTypeAnnotationCommon = functionTypeAnnotationCommon;
            const functionDeclarationCommon = Object.assign({}, functionCommon, {
              declare: {
                validate: (0, _utils.assertValueType)("boolean"),
                optional: true
              },
              id: {
                validate: (0, _utils.assertNodeType)("Identifier"),
                optional: true
              }
            });
            exports.functionDeclarationCommon = functionDeclarationCommon;
            (0, _utils.default)("FunctionDeclaration", {
              builder: ["id", "params", "body", "generator", "async"],
              visitor: ["id", "params", "body", "returnType", "typeParameters"],
              fields: Object.assign({}, functionDeclarationCommon, functionTypeAnnotationCommon, {
                body: {
                  validate: (0, _utils.assertNodeType)("BlockStatement")
                }
              }),
              aliases: ["Scopable", "Function", "BlockParent", "FunctionParent", "Statement", "Pureish", "Declaration"]
            });
            (0, _utils.default)("FunctionExpression", {
              inherits: "FunctionDeclaration",
              aliases: ["Scopable", "Function", "BlockParent", "FunctionParent", "Expression", "Pureish"],
              fields: Object.assign({}, functionCommon, functionTypeAnnotationCommon, {
                id: {
                  validate: (0, _utils.assertNodeType)("Identifier"),
                  optional: true
                },
                body: {
                  validate: (0, _utils.assertNodeType)("BlockStatement")
                }
              })
            });
            const patternLikeCommon = {
              typeAnnotation: {
                validate: (0, _utils.assertNodeType)("TypeAnnotation", "TSTypeAnnotation", "Noop"),
                optional: true
              },
              decorators: {
                validate: (0, _utils.chain)((0, _utils.assertValueType)("array"), (0, _utils.assertEach)((0, _utils.assertNodeType)("Decorator")))
              }
            };
            exports.patternLikeCommon = patternLikeCommon;
            (0, _utils.default)("Identifier", {
              builder: ["name"],
              visitor: ["typeAnnotation", "decorators"],
              aliases: ["Expression", "PatternLike", "LVal", "TSEntityName"],
              fields: Object.assign({}, patternLikeCommon, {
                name: {
                  validate: (0, _utils.chain)(function (node, key, val) {
                    if (!(0, _isValidIdentifier.default)(val)) ;
                  }, (0, _utils.assertValueType)("string"))
                },
                optional: {
                  validate: (0, _utils.assertValueType)("boolean"),
                  optional: true
                }
              })
            });
            (0, _utils.default)("IfStatement", {
              visitor: ["test", "consequent", "alternate"],
              aliases: ["Statement", "Conditional"],
              fields: {
                test: {
                  validate: (0, _utils.assertNodeType)("Expression")
                },
                consequent: {
                  validate: (0, _utils.assertNodeType)("Statement")
                },
                alternate: {
                  optional: true,
                  validate: (0, _utils.assertNodeType)("Statement")
                }
              }
            });
            (0, _utils.default)("LabeledStatement", {
              visitor: ["label", "body"],
              aliases: ["Statement"],
              fields: {
                label: {
                  validate: (0, _utils.assertNodeType)("Identifier")
                },
                body: {
                  validate: (0, _utils.assertNodeType)("Statement")
                }
              }
            });
            (0, _utils.default)("StringLiteral", {
              builder: ["value"],
              fields: {
                value: {
                  validate: (0, _utils.assertValueType)("string")
                }
              },
              aliases: ["Expression", "Pureish", "Literal", "Immutable"]
            });
            (0, _utils.default)("NumericLiteral", {
              builder: ["value"],
              deprecatedAlias: "NumberLiteral",
              fields: {
                value: {
                  validate: (0, _utils.assertValueType)("number")
                }
              },
              aliases: ["Expression", "Pureish", "Literal", "Immutable"]
            });
            (0, _utils.default)("NullLiteral", {
              aliases: ["Expression", "Pureish", "Literal", "Immutable"]
            });
            (0, _utils.default)("BooleanLiteral", {
              builder: ["value"],
              fields: {
                value: {
                  validate: (0, _utils.assertValueType)("boolean")
                }
              },
              aliases: ["Expression", "Pureish", "Literal", "Immutable"]
            });
            (0, _utils.default)("RegExpLiteral", {
              builder: ["pattern", "flags"],
              deprecatedAlias: "RegexLiteral",
              aliases: ["Expression", "Literal"],
              fields: {
                pattern: {
                  validate: (0, _utils.assertValueType)("string")
                },
                flags: {
                  validate: (0, _utils.assertValueType)("string"),
                  default: ""
                }
              }
            });
            (0, _utils.default)("LogicalExpression", {
              builder: ["operator", "left", "right"],
              visitor: ["left", "right"],
              aliases: ["Binary", "Expression"],
              fields: {
                operator: {
                  validate: (0, _utils.assertOneOf)(...constants.LOGICAL_OPERATORS)
                },
                left: {
                  validate: (0, _utils.assertNodeType)("Expression")
                },
                right: {
                  validate: (0, _utils.assertNodeType)("Expression")
                }
              }
            });
            (0, _utils.default)("MemberExpression", {
              builder: ["object", "property", "computed", "optional"],
              visitor: ["object", "property"],
              aliases: ["Expression", "LVal"],
              fields: {
                object: {
                  validate: (0, _utils.assertNodeType)("Expression")
                },
                property: {
                  validate: function () {
                    const normal = (0, _utils.assertNodeType)("Identifier", "PrivateName");
                    const computed = (0, _utils.assertNodeType)("Expression");
                    return function (node, key, val) {
                      const validator = node.computed ? computed : normal;
                      validator(node, key, val);
                    };
                  }()
                },
                computed: {
                  default: false
                },
                optional: {
                  validate: (0, _utils.assertOneOf)(true, false),
                  optional: true
                }
              }
            });
            (0, _utils.default)("NewExpression", {
              inherits: "CallExpression"
            });
            (0, _utils.default)("Program", {
              visitor: ["directives", "body"],
              builder: ["body", "directives", "sourceType", "interpreter"],
              fields: {
                sourceFile: {
                  validate: (0, _utils.assertValueType)("string")
                },
                sourceType: {
                  validate: (0, _utils.assertOneOf)("script", "module"),
                  default: "script"
                },
                interpreter: {
                  validate: (0, _utils.assertNodeType)("InterpreterDirective"),
                  default: null,
                  optional: true
                },
                directives: {
                  validate: (0, _utils.chain)((0, _utils.assertValueType)("array"), (0, _utils.assertEach)((0, _utils.assertNodeType)("Directive"))),
                  default: []
                },
                body: {
                  validate: (0, _utils.chain)((0, _utils.assertValueType)("array"), (0, _utils.assertEach)((0, _utils.assertNodeType)("Statement")))
                }
              },
              aliases: ["Scopable", "BlockParent", "Block"]
            });
            (0, _utils.default)("ObjectExpression", {
              visitor: ["properties"],
              aliases: ["Expression"],
              fields: {
                properties: {
                  validate: (0, _utils.chain)((0, _utils.assertValueType)("array"), (0, _utils.assertEach)((0, _utils.assertNodeType)("ObjectMethod", "ObjectProperty", "SpreadElement")))
                }
              }
            });
            (0, _utils.default)("ObjectMethod", {
              builder: ["kind", "key", "params", "body", "computed"],
              fields: Object.assign({}, functionCommon, functionTypeAnnotationCommon, {
                kind: {
                  validate: (0, _utils.chain)((0, _utils.assertValueType)("string"), (0, _utils.assertOneOf)("method", "get", "set")),
                  default: "method"
                },
                computed: {
                  validate: (0, _utils.assertValueType)("boolean"),
                  default: false
                },
                key: {
                  validate: function () {
                    const normal = (0, _utils.assertNodeType)("Identifier", "StringLiteral", "NumericLiteral");
                    const computed = (0, _utils.assertNodeType)("Expression");
                    return function (node, key, val) {
                      const validator = node.computed ? computed : normal;
                      validator(node, key, val);
                    };
                  }()
                },
                decorators: {
                  validate: (0, _utils.chain)((0, _utils.assertValueType)("array"), (0, _utils.assertEach)((0, _utils.assertNodeType)("Decorator")))
                },
                body: {
                  validate: (0, _utils.assertNodeType)("BlockStatement")
                }
              }),
              visitor: ["key", "params", "body", "decorators", "returnType", "typeParameters"],
              aliases: ["UserWhitespacable", "Function", "Scopable", "BlockParent", "FunctionParent", "Method", "ObjectMember"]
            });
            (0, _utils.default)("ObjectProperty", {
              builder: ["key", "value", "computed", "shorthand", "decorators"],
              fields: {
                computed: {
                  validate: (0, _utils.assertValueType)("boolean"),
                  default: false
                },
                key: {
                  validate: function () {
                    const normal = (0, _utils.assertNodeType)("Identifier", "StringLiteral", "NumericLiteral");
                    const computed = (0, _utils.assertNodeType)("Expression");
                    return function (node, key, val) {
                      const validator = node.computed ? computed : normal;
                      validator(node, key, val);
                    };
                  }()
                },
                value: {
                  validate: (0, _utils.assertNodeType)("Expression", "PatternLike")
                },
                shorthand: {
                  validate: (0, _utils.assertValueType)("boolean"),
                  default: false
                },
                decorators: {
                  validate: (0, _utils.chain)((0, _utils.assertValueType)("array"), (0, _utils.assertEach)((0, _utils.assertNodeType)("Decorator"))),
                  optional: true
                }
              },
              visitor: ["key", "value", "decorators"],
              aliases: ["UserWhitespacable", "Property", "ObjectMember"]
            });
            (0, _utils.default)("RestElement", {
              visitor: ["argument", "typeAnnotation"],
              builder: ["argument"],
              aliases: ["LVal", "PatternLike"],
              deprecatedAlias: "RestProperty",
              fields: Object.assign({}, patternLikeCommon, {
                argument: {
                  validate: (0, _utils.assertNodeType)("LVal")
                }
              })
            });
            (0, _utils.default)("ReturnStatement", {
              visitor: ["argument"],
              aliases: ["Statement", "Terminatorless", "CompletionStatement"],
              fields: {
                argument: {
                  validate: (0, _utils.assertNodeType)("Expression"),
                  optional: true
                }
              }
            });
            (0, _utils.default)("SequenceExpression", {
              visitor: ["expressions"],
              fields: {
                expressions: {
                  validate: (0, _utils.chain)((0, _utils.assertValueType)("array"), (0, _utils.assertEach)((0, _utils.assertNodeType)("Expression")))
                }
              },
              aliases: ["Expression"]
            });
            (0, _utils.default)("SwitchCase", {
              visitor: ["test", "consequent"],
              fields: {
                test: {
                  validate: (0, _utils.assertNodeType)("Expression"),
                  optional: true
                },
                consequent: {
                  validate: (0, _utils.chain)((0, _utils.assertValueType)("array"), (0, _utils.assertEach)((0, _utils.assertNodeType)("Statement")))
                }
              }
            });
            (0, _utils.default)("SwitchStatement", {
              visitor: ["discriminant", "cases"],
              aliases: ["Statement", "BlockParent", "Scopable"],
              fields: {
                discriminant: {
                  validate: (0, _utils.assertNodeType)("Expression")
                },
                cases: {
                  validate: (0, _utils.chain)((0, _utils.assertValueType)("array"), (0, _utils.assertEach)((0, _utils.assertNodeType)("SwitchCase")))
                }
              }
            });
            (0, _utils.default)("ThisExpression", {
              aliases: ["Expression"]
            });
            (0, _utils.default)("ThrowStatement", {
              visitor: ["argument"],
              aliases: ["Statement", "Terminatorless", "CompletionStatement"],
              fields: {
                argument: {
                  validate: (0, _utils.assertNodeType)("Expression")
                }
              }
            });
            (0, _utils.default)("TryStatement", {
              visitor: ["block", "handler", "finalizer"],
              aliases: ["Statement"],
              fields: {
                block: {
                  validate: (0, _utils.assertNodeType)("BlockStatement")
                },
                handler: {
                  optional: true,
                  validate: (0, _utils.assertNodeType)("CatchClause")
                },
                finalizer: {
                  optional: true,
                  validate: (0, _utils.assertNodeType)("BlockStatement")
                }
              }
            });
            (0, _utils.default)("UnaryExpression", {
              builder: ["operator", "argument", "prefix"],
              fields: {
                prefix: {
                  default: true
                },
                argument: {
                  validate: (0, _utils.assertNodeType)("Expression")
                },
                operator: {
                  validate: (0, _utils.assertOneOf)(...constants.UNARY_OPERATORS)
                }
              },
              visitor: ["argument"],
              aliases: ["UnaryLike", "Expression"]
            });
            (0, _utils.default)("UpdateExpression", {
              builder: ["operator", "argument", "prefix"],
              fields: {
                prefix: {
                  default: false
                },
                argument: {
                  validate: (0, _utils.assertNodeType)("Expression")
                },
                operator: {
                  validate: (0, _utils.assertOneOf)(...constants.UPDATE_OPERATORS)
                }
              },
              visitor: ["argument"],
              aliases: ["Expression"]
            });
            (0, _utils.default)("VariableDeclaration", {
              builder: ["kind", "declarations"],
              visitor: ["declarations"],
              aliases: ["Statement", "Declaration"],
              fields: {
                declare: {
                  validate: (0, _utils.assertValueType)("boolean"),
                  optional: true
                },
                kind: {
                  validate: (0, _utils.chain)((0, _utils.assertValueType)("string"), (0, _utils.assertOneOf)("var", "let", "const"))
                },
                declarations: {
                  validate: (0, _utils.chain)((0, _utils.assertValueType)("array"), (0, _utils.assertEach)((0, _utils.assertNodeType)("VariableDeclarator")))
                }
              }
            });
            (0, _utils.default)("VariableDeclarator", {
              visitor: ["id", "init"],
              fields: {
                id: {
                  validate: (0, _utils.assertNodeType)("LVal")
                },
                definite: {
                  optional: true,
                  validate: (0, _utils.assertValueType)("boolean")
                },
                init: {
                  optional: true,
                  validate: (0, _utils.assertNodeType)("Expression")
                }
              }
            });
            (0, _utils.default)("WhileStatement", {
              visitor: ["test", "body"],
              aliases: ["Statement", "BlockParent", "Loop", "While", "Scopable"],
              fields: {
                test: {
                  validate: (0, _utils.assertNodeType)("Expression")
                },
                body: {
                  validate: (0, _utils.assertNodeType)("BlockStatement", "Statement")
                }
              }
            });
            (0, _utils.default)("WithStatement", {
              visitor: ["object", "body"],
              aliases: ["Statement"],
              fields: {
                object: {
                  validate: (0, _utils.assertNodeType)("Expression")
                },
                body: {
                  validate: (0, _utils.assertNodeType)("BlockStatement", "Statement")
                }
              }
            });
            });

            unwrapExports(core);
            var core_1 = core.patternLikeCommon;
            var core_2 = core.functionDeclarationCommon;
            var core_3 = core.functionTypeAnnotationCommon;
            var core_4 = core.functionCommon;

            var es2015 = createCommonjsModule(function (module, exports) {

            Object.defineProperty(exports, "__esModule", {
              value: true
            });
            exports.classMethodOrDeclareMethodCommon = exports.classMethodOrPropertyCommon = void 0;

            var _utils = _interopRequireWildcard(utils$1);



            function _interopRequireWildcard(obj) {
              if (obj && obj.__esModule) {
                return obj;
              } else {
                var newObj = {};

                if (obj != null) {
                  for (var key in obj) {
                    if (Object.prototype.hasOwnProperty.call(obj, key)) {
                      var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {};

                      if (desc.get || desc.set) {
                        Object.defineProperty(newObj, key, desc);
                      } else {
                        newObj[key] = obj[key];
                      }
                    }
                  }
                }

                newObj.default = obj;
                return newObj;
              }
            }

            (0, _utils.default)("AssignmentPattern", {
              visitor: ["left", "right", "decorators"],
              builder: ["left", "right"],
              aliases: ["Pattern", "PatternLike", "LVal"],
              fields: Object.assign({}, core.patternLikeCommon, {
                left: {
                  validate: (0, _utils.assertNodeType)("Identifier", "ObjectPattern", "ArrayPattern")
                },
                right: {
                  validate: (0, _utils.assertNodeType)("Expression")
                },
                decorators: {
                  validate: (0, _utils.chain)((0, _utils.assertValueType)("array"), (0, _utils.assertEach)((0, _utils.assertNodeType)("Decorator")))
                }
              })
            });
            (0, _utils.default)("ArrayPattern", {
              visitor: ["elements", "typeAnnotation"],
              builder: ["elements"],
              aliases: ["Pattern", "PatternLike", "LVal"],
              fields: Object.assign({}, core.patternLikeCommon, {
                elements: {
                  validate: (0, _utils.chain)((0, _utils.assertValueType)("array"), (0, _utils.assertEach)((0, _utils.assertNodeType)("PatternLike")))
                },
                decorators: {
                  validate: (0, _utils.chain)((0, _utils.assertValueType)("array"), (0, _utils.assertEach)((0, _utils.assertNodeType)("Decorator")))
                }
              })
            });
            (0, _utils.default)("ArrowFunctionExpression", {
              builder: ["params", "body", "async"],
              visitor: ["params", "body", "returnType", "typeParameters"],
              aliases: ["Scopable", "Function", "BlockParent", "FunctionParent", "Expression", "Pureish"],
              fields: Object.assign({}, core.functionCommon, core.functionTypeAnnotationCommon, {
                expression: {
                  validate: (0, _utils.assertValueType)("boolean")
                },
                body: {
                  validate: (0, _utils.assertNodeType)("BlockStatement", "Expression")
                }
              })
            });
            (0, _utils.default)("ClassBody", {
              visitor: ["body"],
              fields: {
                body: {
                  validate: (0, _utils.chain)((0, _utils.assertValueType)("array"), (0, _utils.assertEach)((0, _utils.assertNodeType)("ClassMethod", "ClassPrivateMethod", "ClassProperty", "ClassPrivateProperty", "TSDeclareMethod", "TSIndexSignature")))
                }
              }
            });
            const classCommon = {
              typeParameters: {
                validate: (0, _utils.assertNodeType)("TypeParameterDeclaration", "TSTypeParameterDeclaration", "Noop"),
                optional: true
              },
              body: {
                validate: (0, _utils.assertNodeType)("ClassBody")
              },
              superClass: {
                optional: true,
                validate: (0, _utils.assertNodeType)("Expression")
              },
              superTypeParameters: {
                validate: (0, _utils.assertNodeType)("TypeParameterInstantiation", "TSTypeParameterInstantiation"),
                optional: true
              },
              implements: {
                validate: (0, _utils.chain)((0, _utils.assertValueType)("array"), (0, _utils.assertEach)((0, _utils.assertNodeType)("TSExpressionWithTypeArguments", "ClassImplements"))),
                optional: true
              }
            };
            (0, _utils.default)("ClassDeclaration", {
              builder: ["id", "superClass", "body", "decorators"],
              visitor: ["id", "body", "superClass", "mixins", "typeParameters", "superTypeParameters", "implements", "decorators"],
              aliases: ["Scopable", "Class", "Statement", "Declaration", "Pureish"],
              fields: Object.assign({}, classCommon, {
                declare: {
                  validate: (0, _utils.assertValueType)("boolean"),
                  optional: true
                },
                abstract: {
                  validate: (0, _utils.assertValueType)("boolean"),
                  optional: true
                },
                id: {
                  validate: (0, _utils.assertNodeType)("Identifier"),
                  optional: true
                },
                decorators: {
                  validate: (0, _utils.chain)((0, _utils.assertValueType)("array"), (0, _utils.assertEach)((0, _utils.assertNodeType)("Decorator"))),
                  optional: true
                }
              })
            });
            (0, _utils.default)("ClassExpression", {
              inherits: "ClassDeclaration",
              aliases: ["Scopable", "Class", "Expression", "Pureish"],
              fields: Object.assign({}, classCommon, {
                id: {
                  optional: true,
                  validate: (0, _utils.assertNodeType)("Identifier")
                },
                body: {
                  validate: (0, _utils.assertNodeType)("ClassBody")
                },
                superClass: {
                  optional: true,
                  validate: (0, _utils.assertNodeType)("Expression")
                },
                decorators: {
                  validate: (0, _utils.chain)((0, _utils.assertValueType)("array"), (0, _utils.assertEach)((0, _utils.assertNodeType)("Decorator"))),
                  optional: true
                }
              })
            });
            (0, _utils.default)("ExportAllDeclaration", {
              visitor: ["source"],
              aliases: ["Statement", "Declaration", "ModuleDeclaration", "ExportDeclaration"],
              fields: {
                source: {
                  validate: (0, _utils.assertNodeType)("StringLiteral")
                }
              }
            });
            (0, _utils.default)("ExportDefaultDeclaration", {
              visitor: ["declaration"],
              aliases: ["Statement", "Declaration", "ModuleDeclaration", "ExportDeclaration"],
              fields: {
                declaration: {
                  validate: (0, _utils.assertNodeType)("FunctionDeclaration", "TSDeclareFunction", "ClassDeclaration", "Expression")
                }
              }
            });
            (0, _utils.default)("ExportNamedDeclaration", {
              visitor: ["declaration", "specifiers", "source"],
              aliases: ["Statement", "Declaration", "ModuleDeclaration", "ExportDeclaration"],
              fields: {
                declaration: {
                  validate: (0, _utils.assertNodeType)("Declaration"),
                  optional: true
                },
                specifiers: {
                  validate: (0, _utils.chain)((0, _utils.assertValueType)("array"), (0, _utils.assertEach)((0, _utils.assertNodeType)("ExportSpecifier", "ExportDefaultSpecifier", "ExportNamespaceSpecifier")))
                },
                source: {
                  validate: (0, _utils.assertNodeType)("StringLiteral"),
                  optional: true
                }
              }
            });
            (0, _utils.default)("ExportSpecifier", {
              visitor: ["local", "exported"],
              aliases: ["ModuleSpecifier"],
              fields: {
                local: {
                  validate: (0, _utils.assertNodeType)("Identifier")
                },
                exported: {
                  validate: (0, _utils.assertNodeType)("Identifier")
                }
              }
            });
            (0, _utils.default)("ForOfStatement", {
              visitor: ["left", "right", "body"],
              aliases: ["Scopable", "Statement", "For", "BlockParent", "Loop", "ForXStatement"],
              fields: {
                left: {
                  validate: (0, _utils.assertNodeType)("VariableDeclaration", "LVal")
                },
                right: {
                  validate: (0, _utils.assertNodeType)("Expression")
                },
                body: {
                  validate: (0, _utils.assertNodeType)("Statement")
                },
                await: {
                  default: false,
                  validate: (0, _utils.assertValueType)("boolean")
                }
              }
            });
            (0, _utils.default)("ImportDeclaration", {
              visitor: ["specifiers", "source"],
              aliases: ["Statement", "Declaration", "ModuleDeclaration"],
              fields: {
                specifiers: {
                  validate: (0, _utils.chain)((0, _utils.assertValueType)("array"), (0, _utils.assertEach)((0, _utils.assertNodeType)("ImportSpecifier", "ImportDefaultSpecifier", "ImportNamespaceSpecifier")))
                },
                source: {
                  validate: (0, _utils.assertNodeType)("StringLiteral")
                }
              }
            });
            (0, _utils.default)("ImportDefaultSpecifier", {
              visitor: ["local"],
              aliases: ["ModuleSpecifier"],
              fields: {
                local: {
                  validate: (0, _utils.assertNodeType)("Identifier")
                }
              }
            });
            (0, _utils.default)("ImportNamespaceSpecifier", {
              visitor: ["local"],
              aliases: ["ModuleSpecifier"],
              fields: {
                local: {
                  validate: (0, _utils.assertNodeType)("Identifier")
                }
              }
            });
            (0, _utils.default)("ImportSpecifier", {
              visitor: ["local", "imported"],
              aliases: ["ModuleSpecifier"],
              fields: {
                local: {
                  validate: (0, _utils.assertNodeType)("Identifier")
                },
                imported: {
                  validate: (0, _utils.assertNodeType)("Identifier")
                },
                importKind: {
                  validate: (0, _utils.assertOneOf)(null, "type", "typeof")
                }
              }
            });
            (0, _utils.default)("MetaProperty", {
              visitor: ["meta", "property"],
              aliases: ["Expression"],
              fields: {
                meta: {
                  validate: (0, _utils.assertNodeType)("Identifier")
                },
                property: {
                  validate: (0, _utils.assertNodeType)("Identifier")
                }
              }
            });
            const classMethodOrPropertyCommon = {
              abstract: {
                validate: (0, _utils.assertValueType)("boolean"),
                optional: true
              },
              accessibility: {
                validate: (0, _utils.chain)((0, _utils.assertValueType)("string"), (0, _utils.assertOneOf)("public", "private", "protected")),
                optional: true
              },
              static: {
                validate: (0, _utils.assertValueType)("boolean"),
                optional: true
              },
              computed: {
                default: false,
                validate: (0, _utils.assertValueType)("boolean")
              },
              optional: {
                validate: (0, _utils.assertValueType)("boolean"),
                optional: true
              },
              key: {
                validate: (0, _utils.chain)(function () {
                  const normal = (0, _utils.assertNodeType)("Identifier", "StringLiteral", "NumericLiteral");
                  const computed = (0, _utils.assertNodeType)("Expression");
                  return function (node, key, val) {
                    const validator = node.computed ? computed : normal;
                    validator(node, key, val);
                  };
                }(), (0, _utils.assertNodeType)("Identifier", "StringLiteral", "NumericLiteral", "Expression"))
              }
            };
            exports.classMethodOrPropertyCommon = classMethodOrPropertyCommon;
            const classMethodOrDeclareMethodCommon = Object.assign({}, core.functionCommon, classMethodOrPropertyCommon, {
              kind: {
                validate: (0, _utils.chain)((0, _utils.assertValueType)("string"), (0, _utils.assertOneOf)("get", "set", "method", "constructor")),
                default: "method"
              },
              access: {
                validate: (0, _utils.chain)((0, _utils.assertValueType)("string"), (0, _utils.assertOneOf)("public", "private", "protected")),
                optional: true
              },
              decorators: {
                validate: (0, _utils.chain)((0, _utils.assertValueType)("array"), (0, _utils.assertEach)((0, _utils.assertNodeType)("Decorator"))),
                optional: true
              }
            });
            exports.classMethodOrDeclareMethodCommon = classMethodOrDeclareMethodCommon;
            (0, _utils.default)("ClassMethod", {
              aliases: ["Function", "Scopable", "BlockParent", "FunctionParent", "Method"],
              builder: ["kind", "key", "params", "body", "computed", "static"],
              visitor: ["key", "params", "body", "decorators", "returnType", "typeParameters"],
              fields: Object.assign({}, classMethodOrDeclareMethodCommon, core.functionTypeAnnotationCommon, {
                body: {
                  validate: (0, _utils.assertNodeType)("BlockStatement")
                }
              })
            });
            (0, _utils.default)("ObjectPattern", {
              visitor: ["properties", "typeAnnotation", "decorators"],
              builder: ["properties"],
              aliases: ["Pattern", "PatternLike", "LVal"],
              fields: Object.assign({}, core.patternLikeCommon, {
                properties: {
                  validate: (0, _utils.chain)((0, _utils.assertValueType)("array"), (0, _utils.assertEach)((0, _utils.assertNodeType)("RestElement", "ObjectProperty")))
                }
              })
            });
            (0, _utils.default)("SpreadElement", {
              visitor: ["argument"],
              aliases: ["UnaryLike"],
              deprecatedAlias: "SpreadProperty",
              fields: {
                argument: {
                  validate: (0, _utils.assertNodeType)("Expression")
                }
              }
            });
            (0, _utils.default)("Super", {
              aliases: ["Expression"]
            });
            (0, _utils.default)("TaggedTemplateExpression", {
              visitor: ["tag", "quasi"],
              aliases: ["Expression"],
              fields: {
                tag: {
                  validate: (0, _utils.assertNodeType)("Expression")
                },
                quasi: {
                  validate: (0, _utils.assertNodeType)("TemplateLiteral")
                },
                typeParameters: {
                  validate: (0, _utils.assertNodeType)("TypeParameterInstantiation", "TSTypeParameterInstantiation"),
                  optional: true
                }
              }
            });
            (0, _utils.default)("TemplateElement", {
              builder: ["value", "tail"],
              fields: {
                value: {},
                tail: {
                  validate: (0, _utils.assertValueType)("boolean"),
                  default: false
                }
              }
            });
            (0, _utils.default)("TemplateLiteral", {
              visitor: ["quasis", "expressions"],
              aliases: ["Expression", "Literal"],
              fields: {
                quasis: {
                  validate: (0, _utils.chain)((0, _utils.assertValueType)("array"), (0, _utils.assertEach)((0, _utils.assertNodeType)("TemplateElement")))
                },
                expressions: {
                  validate: (0, _utils.chain)((0, _utils.assertValueType)("array"), (0, _utils.assertEach)((0, _utils.assertNodeType)("Expression")))
                }
              }
            });
            (0, _utils.default)("YieldExpression", {
              builder: ["argument", "delegate"],
              visitor: ["argument"],
              aliases: ["Expression", "Terminatorless"],
              fields: {
                delegate: {
                  validate: (0, _utils.assertValueType)("boolean"),
                  default: false
                },
                argument: {
                  optional: true,
                  validate: (0, _utils.assertNodeType)("Expression")
                }
              }
            });
            });

            unwrapExports(es2015);
            var es2015_1 = es2015.classMethodOrDeclareMethodCommon;
            var es2015_2 = es2015.classMethodOrPropertyCommon;

            var flow = createCommonjsModule(function (module) {

            var _utils = _interopRequireWildcard(utils$1);

            function _interopRequireWildcard(obj) {
              if (obj && obj.__esModule) {
                return obj;
              } else {
                var newObj = {};

                if (obj != null) {
                  for (var key in obj) {
                    if (Object.prototype.hasOwnProperty.call(obj, key)) {
                      var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {};

                      if (desc.get || desc.set) {
                        Object.defineProperty(newObj, key, desc);
                      } else {
                        newObj[key] = obj[key];
                      }
                    }
                  }
                }

                newObj.default = obj;
                return newObj;
              }
            }

            const defineInterfaceishType = (name, typeParameterType = "TypeParameterDeclaration") => {
              (0, _utils.default)(name, {
                builder: ["id", "typeParameters", "extends", "body"],
                visitor: ["id", "typeParameters", "extends", "mixins", "implements", "body"],
                aliases: ["Flow", "FlowDeclaration", "Statement", "Declaration"],
                fields: {
                  id: (0, _utils.validateType)("Identifier"),
                  typeParameters: (0, _utils.validateOptionalType)(typeParameterType),
                  extends: (0, _utils.validateOptional)((0, _utils.arrayOfType)("InterfaceExtends")),
                  mixins: (0, _utils.validateOptional)((0, _utils.arrayOfType)("InterfaceExtends")),
                  implements: (0, _utils.validateOptional)((0, _utils.arrayOfType)("ClassImplements")),
                  body: (0, _utils.validateType)("ObjectTypeAnnotation")
                }
              });
            };

            (0, _utils.default)("AnyTypeAnnotation", {
              aliases: ["Flow", "FlowType", "FlowBaseAnnotation"]
            });
            (0, _utils.default)("ArrayTypeAnnotation", {
              visitor: ["elementType"],
              aliases: ["Flow", "FlowType"],
              fields: {
                elementType: (0, _utils.validateType)("FlowType")
              }
            });
            (0, _utils.default)("BooleanTypeAnnotation", {
              aliases: ["Flow", "FlowType", "FlowBaseAnnotation"]
            });
            (0, _utils.default)("BooleanLiteralTypeAnnotation", {
              builder: ["value"],
              aliases: ["Flow", "FlowType"],
              fields: {
                value: (0, _utils.validate)((0, _utils.assertValueType)("boolean"))
              }
            });
            (0, _utils.default)("NullLiteralTypeAnnotation", {
              aliases: ["Flow", "FlowType", "FlowBaseAnnotation"]
            });
            (0, _utils.default)("ClassImplements", {
              visitor: ["id", "typeParameters"],
              aliases: ["Flow"],
              fields: {
                id: (0, _utils.validateType)("Identifier"),
                typeParameters: (0, _utils.validateOptionalType)("TypeParameterInstantiation")
              }
            });
            defineInterfaceishType("DeclareClass", "TypeParameterInstantiation");
            (0, _utils.default)("DeclareFunction", {
              visitor: ["id"],
              aliases: ["Flow", "FlowDeclaration", "Statement", "Declaration"],
              fields: {
                id: (0, _utils.validateType)("Identifier"),
                predicate: (0, _utils.validateOptionalType)("DeclaredPredicate")
              }
            });
            defineInterfaceishType("DeclareInterface");
            (0, _utils.default)("DeclareModule", {
              builder: ["id", "body", "kind"],
              visitor: ["id", "body"],
              aliases: ["Flow", "FlowDeclaration", "Statement", "Declaration"],
              fields: {
                id: (0, _utils.validateType)(["Identifier", "StringLiteral"]),
                body: (0, _utils.validateType)("BlockStatement"),
                kind: (0, _utils.validateOptional)((0, _utils.assertOneOf)("CommonJS", "ES"))
              }
            });
            (0, _utils.default)("DeclareModuleExports", {
              visitor: ["typeAnnotation"],
              aliases: ["Flow", "FlowDeclaration", "Statement", "Declaration"],
              fields: {
                typeAnnotation: (0, _utils.validateType)("TypeAnnotation")
              }
            });
            (0, _utils.default)("DeclareTypeAlias", {
              visitor: ["id", "typeParameters", "right"],
              aliases: ["Flow", "FlowDeclaration", "Statement", "Declaration"],
              fields: {
                id: (0, _utils.validateType)("Identifier"),
                typeParameters: (0, _utils.validateOptionalType)("TypeParameterDeclaration"),
                right: (0, _utils.validateType)("FlowType")
              }
            });
            (0, _utils.default)("DeclareOpaqueType", {
              visitor: ["id", "typeParameters", "supertype"],
              aliases: ["Flow", "FlowDeclaration", "Statement", "Declaration"],
              fields: {
                id: (0, _utils.validateType)("Identifier"),
                typeParameters: (0, _utils.validateOptionalType)("TypeParameterDeclaration"),
                supertype: (0, _utils.validateOptionalType)("FlowType")
              }
            });
            (0, _utils.default)("DeclareVariable", {
              visitor: ["id"],
              aliases: ["Flow", "FlowDeclaration", "Statement", "Declaration"],
              fields: {
                id: (0, _utils.validateType)("Identifier")
              }
            });
            (0, _utils.default)("DeclareExportDeclaration", {
              visitor: ["declaration", "specifiers", "source"],
              aliases: ["Flow", "FlowDeclaration", "Statement", "Declaration"],
              fields: {
                declaration: (0, _utils.validateOptionalType)("Flow"),
                specifiers: (0, _utils.validateOptional)((0, _utils.arrayOfType)(["ExportSpecifier", "ExportNamespaceSpecifier"])),
                source: (0, _utils.validateOptionalType)("StringLiteral"),
                default: (0, _utils.validateOptional)((0, _utils.assertValueType)("boolean"))
              }
            });
            (0, _utils.default)("DeclareExportAllDeclaration", {
              visitor: ["source"],
              aliases: ["Flow", "FlowDeclaration", "Statement", "Declaration"],
              fields: {
                source: (0, _utils.validateType)("StringLiteral"),
                exportKind: (0, _utils.validateOptional)((0, _utils.assertOneOf)(["type", "value"]))
              }
            });
            (0, _utils.default)("DeclaredPredicate", {
              visitor: ["value"],
              aliases: ["Flow", "FlowPredicate"],
              fields: {
                value: (0, _utils.validateType)("Flow")
              }
            });
            (0, _utils.default)("ExistsTypeAnnotation", {
              aliases: ["Flow", "FlowType"]
            });
            (0, _utils.default)("FunctionTypeAnnotation", {
              visitor: ["typeParameters", "params", "rest", "returnType"],
              aliases: ["Flow", "FlowType"],
              fields: {
                typeParameters: (0, _utils.validateOptionalType)("TypeParameterDeclaration"),
                params: (0, _utils.validate)((0, _utils.arrayOfType)("FunctionTypeParam")),
                rest: (0, _utils.validateOptionalType)("FunctionTypeParam"),
                returnType: (0, _utils.validateType)("FlowType")
              }
            });
            (0, _utils.default)("FunctionTypeParam", {
              visitor: ["name", "typeAnnotation"],
              aliases: ["Flow"],
              fields: {
                name: (0, _utils.validateOptionalType)("Identifier"),
                typeAnnotation: (0, _utils.validateType)("FlowType"),
                optional: (0, _utils.validateOptional)((0, _utils.assertValueType)("boolean"))
              }
            });
            (0, _utils.default)("GenericTypeAnnotation", {
              visitor: ["id", "typeParameters"],
              aliases: ["Flow", "FlowType"],
              fields: {
                id: (0, _utils.validateType)(["Identifier", "QualifiedTypeIdentifier"]),
                typeParameters: (0, _utils.validateOptionalType)("TypeParameterInstantiation")
              }
            });
            (0, _utils.default)("InferredPredicate", {
              aliases: ["Flow", "FlowPredicate"]
            });
            (0, _utils.default)("InterfaceExtends", {
              visitor: ["id", "typeParameters"],
              aliases: ["Flow"],
              fields: {
                id: (0, _utils.validateType)(["Identifier", "QualifiedTypeIdentifier"]),
                typeParameters: (0, _utils.validateOptionalType)("TypeParameterInstantiation")
              }
            });
            defineInterfaceishType("InterfaceDeclaration");
            (0, _utils.default)("InterfaceTypeAnnotation", {
              visitor: ["extends", "body"],
              aliases: ["Flow", "FlowType"],
              fields: {
                extends: (0, _utils.validateOptional)((0, _utils.arrayOfType)("InterfaceExtends")),
                body: (0, _utils.validateType)("ObjectTypeAnnotation")
              }
            });
            (0, _utils.default)("IntersectionTypeAnnotation", {
              visitor: ["types"],
              aliases: ["Flow", "FlowType"],
              fields: {
                types: (0, _utils.validate)((0, _utils.arrayOfType)("FlowType"))
              }
            });
            (0, _utils.default)("MixedTypeAnnotation", {
              aliases: ["Flow", "FlowType", "FlowBaseAnnotation"]
            });
            (0, _utils.default)("EmptyTypeAnnotation", {
              aliases: ["Flow", "FlowType", "FlowBaseAnnotation"]
            });
            (0, _utils.default)("NullableTypeAnnotation", {
              visitor: ["typeAnnotation"],
              aliases: ["Flow", "FlowType"],
              fields: {
                typeAnnotation: (0, _utils.validateType)("FlowType")
              }
            });
            (0, _utils.default)("NumberLiteralTypeAnnotation", {
              builder: ["value"],
              aliases: ["Flow", "FlowType"],
              fields: {
                value: (0, _utils.validate)((0, _utils.assertValueType)("number"))
              }
            });
            (0, _utils.default)("NumberTypeAnnotation", {
              aliases: ["Flow", "FlowType", "FlowBaseAnnotation"]
            });
            (0, _utils.default)("ObjectTypeAnnotation", {
              visitor: ["properties", "indexers", "callProperties", "internalSlots"],
              aliases: ["Flow", "FlowType"],
              builder: ["properties", "indexers", "callProperties", "internalSlots", "exact"],
              fields: {
                properties: (0, _utils.validate)((0, _utils.arrayOfType)(["ObjectTypeProperty", "ObjectTypeSpreadProperty"])),
                indexers: (0, _utils.validateOptional)((0, _utils.arrayOfType)("ObjectTypeIndexer")),
                callProperties: (0, _utils.validateOptional)((0, _utils.arrayOfType)("ObjectTypeCallProperty")),
                internalSlots: (0, _utils.validateOptional)((0, _utils.arrayOfType)("ObjectTypeInternalSlot")),
                exact: {
                  validate: (0, _utils.assertValueType)("boolean"),
                  default: false
                },
                inexact: (0, _utils.validateOptional)((0, _utils.assertValueType)("boolean"))
              }
            });
            (0, _utils.default)("ObjectTypeInternalSlot", {
              visitor: ["id", "value", "optional", "static", "method"],
              aliases: ["Flow", "UserWhitespacable"],
              fields: {
                id: (0, _utils.validateType)("Identifier"),
                value: (0, _utils.validateType)("FlowType"),
                optional: (0, _utils.validate)((0, _utils.assertValueType)("boolean")),
                static: (0, _utils.validate)((0, _utils.assertValueType)("boolean")),
                method: (0, _utils.validate)((0, _utils.assertValueType)("boolean"))
              }
            });
            (0, _utils.default)("ObjectTypeCallProperty", {
              visitor: ["value"],
              aliases: ["Flow", "UserWhitespacable"],
              fields: {
                value: (0, _utils.validateType)("FlowType"),
                static: (0, _utils.validate)((0, _utils.assertValueType)("boolean"))
              }
            });
            (0, _utils.default)("ObjectTypeIndexer", {
              visitor: ["id", "key", "value", "variance"],
              aliases: ["Flow", "UserWhitespacable"],
              fields: {
                id: (0, _utils.validateOptionalType)("Identifier"),
                key: (0, _utils.validateType)("FlowType"),
                value: (0, _utils.validateType)("FlowType"),
                static: (0, _utils.validate)((0, _utils.assertValueType)("boolean")),
                variance: (0, _utils.validateOptionalType)("Variance")
              }
            });
            (0, _utils.default)("ObjectTypeProperty", {
              visitor: ["key", "value", "variance"],
              aliases: ["Flow", "UserWhitespacable"],
              fields: {
                key: (0, _utils.validateType)(["Identifier", "StringLiteral"]),
                value: (0, _utils.validateType)("FlowType"),
                kind: (0, _utils.validate)((0, _utils.assertOneOf)("init", "get", "set")),
                static: (0, _utils.validate)((0, _utils.assertValueType)("boolean")),
                proto: (0, _utils.validate)((0, _utils.assertValueType)("boolean")),
                optional: (0, _utils.validate)((0, _utils.assertValueType)("boolean")),
                variance: (0, _utils.validateOptionalType)("Variance")
              }
            });
            (0, _utils.default)("ObjectTypeSpreadProperty", {
              visitor: ["argument"],
              aliases: ["Flow", "UserWhitespacable"],
              fields: {
                argument: (0, _utils.validateType)("FlowType")
              }
            });
            (0, _utils.default)("OpaqueType", {
              visitor: ["id", "typeParameters", "supertype", "impltype"],
              aliases: ["Flow", "FlowDeclaration", "Statement", "Declaration"],
              fields: {
                id: (0, _utils.validateType)("Identifier"),
                typeParameters: (0, _utils.validateOptionalType)("TypeParameterDeclaration"),
                supertype: (0, _utils.validateOptionalType)("FlowType"),
                impltype: (0, _utils.validateType)("FlowType")
              }
            });
            (0, _utils.default)("QualifiedTypeIdentifier", {
              visitor: ["id", "qualification"],
              aliases: ["Flow"],
              fields: {
                id: (0, _utils.validateType)("Identifier"),
                qualification: (0, _utils.validateType)(["Identifier", "QualifiedTypeIdentifier"])
              }
            });
            (0, _utils.default)("StringLiteralTypeAnnotation", {
              builder: ["value"],
              aliases: ["Flow", "FlowType"],
              fields: {
                value: (0, _utils.validate)((0, _utils.assertValueType)("string"))
              }
            });
            (0, _utils.default)("StringTypeAnnotation", {
              aliases: ["Flow", "FlowType", "FlowBaseAnnotation"]
            });
            (0, _utils.default)("ThisTypeAnnotation", {
              aliases: ["Flow", "FlowType", "FlowBaseAnnotation"]
            });
            (0, _utils.default)("TupleTypeAnnotation", {
              visitor: ["types"],
              aliases: ["Flow", "FlowType"],
              fields: {
                types: (0, _utils.validate)((0, _utils.arrayOfType)("FlowType"))
              }
            });
            (0, _utils.default)("TypeofTypeAnnotation", {
              visitor: ["argument"],
              aliases: ["Flow", "FlowType"],
              fields: {
                argument: (0, _utils.validateType)("FlowType")
              }
            });
            (0, _utils.default)("TypeAlias", {
              visitor: ["id", "typeParameters", "right"],
              aliases: ["Flow", "FlowDeclaration", "Statement", "Declaration"],
              fields: {
                id: (0, _utils.validateType)("Identifier"),
                typeParameters: (0, _utils.validateOptionalType)("TypeParameterDeclaration"),
                right: (0, _utils.validateType)("FlowType")
              }
            });
            (0, _utils.default)("TypeAnnotation", {
              aliases: ["Flow"],
              visitor: ["typeAnnotation"],
              fields: {
                typeAnnotation: (0, _utils.validateType)("FlowType")
              }
            });
            (0, _utils.default)("TypeCastExpression", {
              visitor: ["expression", "typeAnnotation"],
              aliases: ["Flow", "ExpressionWrapper", "Expression"],
              fields: {
                expression: (0, _utils.validateType)("Expression"),
                typeAnnotation: (0, _utils.validateType)("TypeAnnotation")
              }
            });
            (0, _utils.default)("TypeParameter", {
              aliases: ["Flow"],
              visitor: ["bound", "default", "variance"],
              fields: {
                name: (0, _utils.validate)((0, _utils.assertValueType)("string")),
                bound: (0, _utils.validateOptionalType)("TypeAnnotation"),
                default: (0, _utils.validateOptionalType)("FlowType"),
                variance: (0, _utils.validateOptionalType)("Variance")
              }
            });
            (0, _utils.default)("TypeParameterDeclaration", {
              aliases: ["Flow"],
              visitor: ["params"],
              fields: {
                params: (0, _utils.validate)((0, _utils.arrayOfType)("TypeParameter"))
              }
            });
            (0, _utils.default)("TypeParameterInstantiation", {
              aliases: ["Flow"],
              visitor: ["params"],
              fields: {
                params: (0, _utils.validate)((0, _utils.arrayOfType)("FlowType"))
              }
            });
            (0, _utils.default)("UnionTypeAnnotation", {
              visitor: ["types"],
              aliases: ["Flow", "FlowType"],
              fields: {
                types: (0, _utils.validate)((0, _utils.arrayOfType)("FlowType"))
              }
            });
            (0, _utils.default)("Variance", {
              aliases: ["Flow"],
              builder: ["kind"],
              fields: {
                kind: (0, _utils.validate)((0, _utils.assertOneOf)("minus", "plus"))
              }
            });
            (0, _utils.default)("VoidTypeAnnotation", {
              aliases: ["Flow", "FlowType", "FlowBaseAnnotation"]
            });
            });

            unwrapExports(flow);

            var jsx = createCommonjsModule(function (module) {

            var _utils = _interopRequireWildcard(utils$1);

            function _interopRequireWildcard(obj) {
              if (obj && obj.__esModule) {
                return obj;
              } else {
                var newObj = {};

                if (obj != null) {
                  for (var key in obj) {
                    if (Object.prototype.hasOwnProperty.call(obj, key)) {
                      var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {};

                      if (desc.get || desc.set) {
                        Object.defineProperty(newObj, key, desc);
                      } else {
                        newObj[key] = obj[key];
                      }
                    }
                  }
                }

                newObj.default = obj;
                return newObj;
              }
            }

            (0, _utils.default)("JSXAttribute", {
              visitor: ["name", "value"],
              aliases: ["JSX", "Immutable"],
              fields: {
                name: {
                  validate: (0, _utils.assertNodeType)("JSXIdentifier", "JSXNamespacedName")
                },
                value: {
                  optional: true,
                  validate: (0, _utils.assertNodeType)("JSXElement", "JSXFragment", "StringLiteral", "JSXExpressionContainer")
                }
              }
            });
            (0, _utils.default)("JSXClosingElement", {
              visitor: ["name"],
              aliases: ["JSX", "Immutable"],
              fields: {
                name: {
                  validate: (0, _utils.assertNodeType)("JSXIdentifier", "JSXMemberExpression")
                }
              }
            });
            (0, _utils.default)("JSXElement", {
              builder: ["openingElement", "closingElement", "children", "selfClosing"],
              visitor: ["openingElement", "children", "closingElement"],
              aliases: ["JSX", "Immutable", "Expression"],
              fields: {
                openingElement: {
                  validate: (0, _utils.assertNodeType)("JSXOpeningElement")
                },
                closingElement: {
                  optional: true,
                  validate: (0, _utils.assertNodeType)("JSXClosingElement")
                },
                children: {
                  validate: (0, _utils.chain)((0, _utils.assertValueType)("array"), (0, _utils.assertEach)((0, _utils.assertNodeType)("JSXText", "JSXExpressionContainer", "JSXSpreadChild", "JSXElement", "JSXFragment")))
                }
              }
            });
            (0, _utils.default)("JSXEmptyExpression", {
              aliases: ["JSX"]
            });
            (0, _utils.default)("JSXExpressionContainer", {
              visitor: ["expression"],
              aliases: ["JSX", "Immutable"],
              fields: {
                expression: {
                  validate: (0, _utils.assertNodeType)("Expression", "JSXEmptyExpression")
                }
              }
            });
            (0, _utils.default)("JSXSpreadChild", {
              visitor: ["expression"],
              aliases: ["JSX", "Immutable"],
              fields: {
                expression: {
                  validate: (0, _utils.assertNodeType)("Expression")
                }
              }
            });
            (0, _utils.default)("JSXIdentifier", {
              builder: ["name"],
              aliases: ["JSX"],
              fields: {
                name: {
                  validate: (0, _utils.assertValueType)("string")
                }
              }
            });
            (0, _utils.default)("JSXMemberExpression", {
              visitor: ["object", "property"],
              aliases: ["JSX"],
              fields: {
                object: {
                  validate: (0, _utils.assertNodeType)("JSXMemberExpression", "JSXIdentifier")
                },
                property: {
                  validate: (0, _utils.assertNodeType)("JSXIdentifier")
                }
              }
            });
            (0, _utils.default)("JSXNamespacedName", {
              visitor: ["namespace", "name"],
              aliases: ["JSX"],
              fields: {
                namespace: {
                  validate: (0, _utils.assertNodeType)("JSXIdentifier")
                },
                name: {
                  validate: (0, _utils.assertNodeType)("JSXIdentifier")
                }
              }
            });
            (0, _utils.default)("JSXOpeningElement", {
              builder: ["name", "attributes", "selfClosing"],
              visitor: ["name", "attributes"],
              aliases: ["JSX", "Immutable"],
              fields: {
                name: {
                  validate: (0, _utils.assertNodeType)("JSXIdentifier", "JSXMemberExpression")
                },
                selfClosing: {
                  default: false,
                  validate: (0, _utils.assertValueType)("boolean")
                },
                attributes: {
                  validate: (0, _utils.chain)((0, _utils.assertValueType)("array"), (0, _utils.assertEach)((0, _utils.assertNodeType)("JSXAttribute", "JSXSpreadAttribute")))
                },
                typeParameters: {
                  validate: (0, _utils.assertNodeType)("TypeParameterInstantiation", "TSTypeParameterInstantiation"),
                  optional: true
                }
              }
            });
            (0, _utils.default)("JSXSpreadAttribute", {
              visitor: ["argument"],
              aliases: ["JSX"],
              fields: {
                argument: {
                  validate: (0, _utils.assertNodeType)("Expression")
                }
              }
            });
            (0, _utils.default)("JSXText", {
              aliases: ["JSX", "Immutable"],
              builder: ["value"],
              fields: {
                value: {
                  validate: (0, _utils.assertValueType)("string")
                }
              }
            });
            (0, _utils.default)("JSXFragment", {
              builder: ["openingFragment", "closingFragment", "children"],
              visitor: ["openingFragment", "children", "closingFragment"],
              aliases: ["JSX", "Immutable", "Expression"],
              fields: {
                openingFragment: {
                  validate: (0, _utils.assertNodeType)("JSXOpeningFragment")
                },
                closingFragment: {
                  validate: (0, _utils.assertNodeType)("JSXClosingFragment")
                },
                children: {
                  validate: (0, _utils.chain)((0, _utils.assertValueType)("array"), (0, _utils.assertEach)((0, _utils.assertNodeType)("JSXText", "JSXExpressionContainer", "JSXSpreadChild", "JSXElement", "JSXFragment")))
                }
              }
            });
            (0, _utils.default)("JSXOpeningFragment", {
              aliases: ["JSX", "Immutable"]
            });
            (0, _utils.default)("JSXClosingFragment", {
              aliases: ["JSX", "Immutable"]
            });
            });

            unwrapExports(jsx);

            var misc = createCommonjsModule(function (module) {

            var _utils = _interopRequireWildcard(utils$1);

            function _interopRequireWildcard(obj) {
              if (obj && obj.__esModule) {
                return obj;
              } else {
                var newObj = {};

                if (obj != null) {
                  for (var key in obj) {
                    if (Object.prototype.hasOwnProperty.call(obj, key)) {
                      var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {};

                      if (desc.get || desc.set) {
                        Object.defineProperty(newObj, key, desc);
                      } else {
                        newObj[key] = obj[key];
                      }
                    }
                  }
                }

                newObj.default = obj;
                return newObj;
              }
            }

            (0, _utils.default)("Noop", {
              visitor: []
            });
            (0, _utils.default)("ParenthesizedExpression", {
              visitor: ["expression"],
              aliases: ["Expression", "ExpressionWrapper"],
              fields: {
                expression: {
                  validate: (0, _utils.assertNodeType)("Expression")
                }
              }
            });
            });

            unwrapExports(misc);

            var experimental = createCommonjsModule(function (module) {

            var _utils = _interopRequireWildcard(utils$1);



            function _interopRequireWildcard(obj) {
              if (obj && obj.__esModule) {
                return obj;
              } else {
                var newObj = {};

                if (obj != null) {
                  for (var key in obj) {
                    if (Object.prototype.hasOwnProperty.call(obj, key)) {
                      var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {};

                      if (desc.get || desc.set) {
                        Object.defineProperty(newObj, key, desc);
                      } else {
                        newObj[key] = obj[key];
                      }
                    }
                  }
                }

                newObj.default = obj;
                return newObj;
              }
            }

            (0, _utils.default)("AwaitExpression", {
              builder: ["argument"],
              visitor: ["argument"],
              aliases: ["Expression", "Terminatorless"],
              fields: {
                argument: {
                  validate: (0, _utils.assertNodeType)("Expression")
                }
              }
            });
            (0, _utils.default)("BindExpression", {
              visitor: ["object", "callee"],
              aliases: ["Expression"],
              fields: {}
            });
            (0, _utils.default)("ClassProperty", {
              visitor: ["key", "value", "typeAnnotation", "decorators"],
              builder: ["key", "value", "typeAnnotation", "decorators", "computed"],
              aliases: ["Property"],
              fields: Object.assign({}, es2015.classMethodOrPropertyCommon, {
                value: {
                  validate: (0, _utils.assertNodeType)("Expression"),
                  optional: true
                },
                definite: {
                  validate: (0, _utils.assertValueType)("boolean"),
                  optional: true
                },
                typeAnnotation: {
                  validate: (0, _utils.assertNodeType)("TypeAnnotation", "TSTypeAnnotation", "Noop"),
                  optional: true
                },
                decorators: {
                  validate: (0, _utils.chain)((0, _utils.assertValueType)("array"), (0, _utils.assertEach)((0, _utils.assertNodeType)("Decorator"))),
                  optional: true
                },
                readonly: {
                  validate: (0, _utils.assertValueType)("boolean"),
                  optional: true
                }
              })
            });
            (0, _utils.default)("OptionalMemberExpression", {
              builder: ["object", "property", "computed", "optional"],
              visitor: ["object", "property"],
              aliases: ["Expression"],
              fields: {
                object: {
                  validate: (0, _utils.assertNodeType)("Expression")
                },
                property: {
                  validate: function () {
                    const normal = (0, _utils.assertNodeType)("Identifier");
                    const computed = (0, _utils.assertNodeType)("Expression");
                    return function (node, key, val) {
                      const validator = node.computed ? computed : normal;
                      validator(node, key, val);
                    };
                  }()
                },
                computed: {
                  default: false
                },
                optional: {
                  validate: (0, _utils.assertValueType)("boolean")
                }
              }
            });
            (0, _utils.default)("PipelineTopicExpression", {
              builder: ["expression"],
              visitor: ["expression"],
              fields: {
                expression: {
                  validate: (0, _utils.assertNodeType)("Expression")
                }
              }
            });
            (0, _utils.default)("PipelineBareFunction", {
              builder: ["callee"],
              visitor: ["callee"],
              fields: {
                callee: {
                  validate: (0, _utils.assertNodeType)("Expression")
                }
              }
            });
            (0, _utils.default)("PipelinePrimaryTopicReference", {
              aliases: ["Expression"]
            });
            (0, _utils.default)("OptionalCallExpression", {
              visitor: ["callee", "arguments", "typeParameters", "typeArguments"],
              builder: ["callee", "arguments", "optional"],
              aliases: ["Expression"],
              fields: {
                callee: {
                  validate: (0, _utils.assertNodeType)("Expression")
                },
                arguments: {
                  validate: (0, _utils.chain)((0, _utils.assertValueType)("array"), (0, _utils.assertEach)((0, _utils.assertNodeType)("Expression", "SpreadElement", "JSXNamespacedName")))
                },
                optional: {
                  validate: (0, _utils.assertValueType)("boolean")
                },
                typeArguments: {
                  validate: (0, _utils.assertNodeType)("TypeParameterInstantiation"),
                  optional: true
                },
                typeParameters: {
                  validate: (0, _utils.assertNodeType)("TSTypeParameterInstantiation"),
                  optional: true
                }
              }
            });
            (0, _utils.default)("ClassPrivateProperty", {
              visitor: ["key", "value"],
              builder: ["key", "value"],
              aliases: ["Property", "Private"],
              fields: {
                key: {
                  validate: (0, _utils.assertNodeType)("PrivateName")
                },
                value: {
                  validate: (0, _utils.assertNodeType)("Expression"),
                  optional: true
                }
              }
            });
            (0, _utils.default)("ClassPrivateMethod", {
              builder: ["kind", "key", "params", "body", "static"],
              visitor: ["key", "params", "body", "decorators", "returnType", "typeParameters"],
              aliases: ["Function", "Scopable", "BlockParent", "FunctionParent", "Method", "Private"],
              fields: Object.assign({}, es2015.classMethodOrDeclareMethodCommon, {
                key: {
                  validate: (0, _utils.assertNodeType)("PrivateName")
                },
                body: {
                  validate: (0, _utils.assertNodeType)("BlockStatement")
                }
              })
            });
            (0, _utils.default)("Import", {
              aliases: ["Expression"]
            });
            (0, _utils.default)("Decorator", {
              visitor: ["expression"],
              fields: {
                expression: {
                  validate: (0, _utils.assertNodeType)("Expression")
                }
              }
            });
            (0, _utils.default)("DoExpression", {
              visitor: ["body"],
              aliases: ["Expression"],
              fields: {
                body: {
                  validate: (0, _utils.assertNodeType)("BlockStatement")
                }
              }
            });
            (0, _utils.default)("ExportDefaultSpecifier", {
              visitor: ["exported"],
              aliases: ["ModuleSpecifier"],
              fields: {
                exported: {
                  validate: (0, _utils.assertNodeType)("Identifier")
                }
              }
            });
            (0, _utils.default)("ExportNamespaceSpecifier", {
              visitor: ["exported"],
              aliases: ["ModuleSpecifier"],
              fields: {
                exported: {
                  validate: (0, _utils.assertNodeType)("Identifier")
                }
              }
            });
            (0, _utils.default)("PrivateName", {
              visitor: ["id"],
              aliases: ["Private"],
              fields: {
                id: {
                  validate: (0, _utils.assertNodeType)("Identifier")
                }
              }
            });
            (0, _utils.default)("BigIntLiteral", {
              builder: ["value"],
              fields: {
                value: {
                  validate: (0, _utils.assertValueType)("string")
                }
              },
              aliases: ["Expression", "Pureish", "Literal", "Immutable"]
            });
            });

            unwrapExports(experimental);

            var typescript = createCommonjsModule(function (module) {

            var _utils = _interopRequireWildcard(utils$1);





            function _interopRequireWildcard(obj) {
              if (obj && obj.__esModule) {
                return obj;
              } else {
                var newObj = {};

                if (obj != null) {
                  for (var key in obj) {
                    if (Object.prototype.hasOwnProperty.call(obj, key)) {
                      var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {};

                      if (desc.get || desc.set) {
                        Object.defineProperty(newObj, key, desc);
                      } else {
                        newObj[key] = obj[key];
                      }
                    }
                  }
                }

                newObj.default = obj;
                return newObj;
              }
            }

            const bool = (0, _utils.assertValueType)("boolean");
            const tSFunctionTypeAnnotationCommon = {
              returnType: {
                validate: (0, _utils.assertNodeType)("TSTypeAnnotation", "Noop"),
                optional: true
              },
              typeParameters: {
                validate: (0, _utils.assertNodeType)("TSTypeParameterDeclaration", "Noop"),
                optional: true
              }
            };
            (0, _utils.default)("TSParameterProperty", {
              aliases: ["LVal"],
              visitor: ["parameter"],
              fields: {
                accessibility: {
                  validate: (0, _utils.assertOneOf)("public", "private", "protected"),
                  optional: true
                },
                readonly: {
                  validate: (0, _utils.assertValueType)("boolean"),
                  optional: true
                },
                parameter: {
                  validate: (0, _utils.assertNodeType)("Identifier", "AssignmentPattern")
                }
              }
            });
            (0, _utils.default)("TSDeclareFunction", {
              aliases: ["Statement", "Declaration"],
              visitor: ["id", "typeParameters", "params", "returnType"],
              fields: Object.assign({}, core.functionDeclarationCommon, tSFunctionTypeAnnotationCommon)
            });
            (0, _utils.default)("TSDeclareMethod", {
              visitor: ["decorators", "key", "typeParameters", "params", "returnType"],
              fields: Object.assign({}, es2015.classMethodOrDeclareMethodCommon, tSFunctionTypeAnnotationCommon)
            });
            (0, _utils.default)("TSQualifiedName", {
              aliases: ["TSEntityName"],
              visitor: ["left", "right"],
              fields: {
                left: (0, _utils.validateType)("TSEntityName"),
                right: (0, _utils.validateType)("Identifier")
              }
            });
            const signatureDeclarationCommon = {
              typeParameters: (0, _utils.validateOptionalType)("TSTypeParameterDeclaration"),
              parameters: (0, _utils.validateArrayOfType)(["Identifier", "RestElement"]),
              typeAnnotation: (0, _utils.validateOptionalType)("TSTypeAnnotation")
            };
            const callConstructSignatureDeclaration = {
              aliases: ["TSTypeElement"],
              visitor: ["typeParameters", "parameters", "typeAnnotation"],
              fields: signatureDeclarationCommon
            };
            (0, _utils.default)("TSCallSignatureDeclaration", callConstructSignatureDeclaration);
            (0, _utils.default)("TSConstructSignatureDeclaration", callConstructSignatureDeclaration);
            const namedTypeElementCommon = {
              key: (0, _utils.validateType)("Expression"),
              computed: (0, _utils.validate)(bool),
              optional: (0, _utils.validateOptional)(bool)
            };
            (0, _utils.default)("TSPropertySignature", {
              aliases: ["TSTypeElement"],
              visitor: ["key", "typeAnnotation", "initializer"],
              fields: Object.assign({}, namedTypeElementCommon, {
                readonly: (0, _utils.validateOptional)(bool),
                typeAnnotation: (0, _utils.validateOptionalType)("TSTypeAnnotation"),
                initializer: (0, _utils.validateOptionalType)("Expression")
              })
            });
            (0, _utils.default)("TSMethodSignature", {
              aliases: ["TSTypeElement"],
              visitor: ["key", "typeParameters", "parameters", "typeAnnotation"],
              fields: Object.assign({}, signatureDeclarationCommon, namedTypeElementCommon)
            });
            (0, _utils.default)("TSIndexSignature", {
              aliases: ["TSTypeElement"],
              visitor: ["parameters", "typeAnnotation"],
              fields: {
                readonly: (0, _utils.validateOptional)(bool),
                parameters: (0, _utils.validateArrayOfType)("Identifier"),
                typeAnnotation: (0, _utils.validateOptionalType)("TSTypeAnnotation")
              }
            });
            const tsKeywordTypes = ["TSAnyKeyword", "TSUnknownKeyword", "TSNumberKeyword", "TSObjectKeyword", "TSBooleanKeyword", "TSStringKeyword", "TSSymbolKeyword", "TSVoidKeyword", "TSUndefinedKeyword", "TSNullKeyword", "TSNeverKeyword"];

            for (const type of tsKeywordTypes) {
              (0, _utils.default)(type, {
                aliases: ["TSType"],
                visitor: [],
                fields: {}
              });
            }

            (0, _utils.default)("TSThisType", {
              aliases: ["TSType"],
              visitor: [],
              fields: {}
            });
            const fnOrCtr = {
              aliases: ["TSType"],
              visitor: ["typeParameters", "typeAnnotation"],
              fields: signatureDeclarationCommon
            };
            (0, _utils.default)("TSFunctionType", fnOrCtr);
            (0, _utils.default)("TSConstructorType", fnOrCtr);
            (0, _utils.default)("TSTypeReference", {
              aliases: ["TSType"],
              visitor: ["typeName", "typeParameters"],
              fields: {
                typeName: (0, _utils.validateType)("TSEntityName"),
                typeParameters: (0, _utils.validateOptionalType)("TSTypeParameterInstantiation")
              }
            });
            (0, _utils.default)("TSTypePredicate", {
              aliases: ["TSType"],
              visitor: ["parameterName", "typeAnnotation"],
              fields: {
                parameterName: (0, _utils.validateType)(["Identifier", "TSThisType"]),
                typeAnnotation: (0, _utils.validateType)("TSTypeAnnotation")
              }
            });
            (0, _utils.default)("TSTypeQuery", {
              aliases: ["TSType"],
              visitor: ["exprName"],
              fields: {
                exprName: (0, _utils.validateType)(["TSEntityName", "TSImportType"])
              }
            });
            (0, _utils.default)("TSTypeLiteral", {
              aliases: ["TSType"],
              visitor: ["members"],
              fields: {
                members: (0, _utils.validateArrayOfType)("TSTypeElement")
              }
            });
            (0, _utils.default)("TSArrayType", {
              aliases: ["TSType"],
              visitor: ["elementType"],
              fields: {
                elementType: (0, _utils.validateType)("TSType")
              }
            });
            (0, _utils.default)("TSTupleType", {
              aliases: ["TSType"],
              visitor: ["elementTypes"],
              fields: {
                elementTypes: (0, _utils.validateArrayOfType)("TSType")
              }
            });
            (0, _utils.default)("TSOptionalType", {
              aliases: ["TSType"],
              visitor: ["typeAnnotation"],
              fields: {
                typeAnnotation: (0, _utils.validateType)("TSType")
              }
            });
            (0, _utils.default)("TSRestType", {
              aliases: ["TSType"],
              visitor: ["typeAnnotation"],
              fields: {
                typeAnnotation: (0, _utils.validateType)("TSType")
              }
            });
            const unionOrIntersection = {
              aliases: ["TSType"],
              visitor: ["types"],
              fields: {
                types: (0, _utils.validateArrayOfType)("TSType")
              }
            };
            (0, _utils.default)("TSUnionType", unionOrIntersection);
            (0, _utils.default)("TSIntersectionType", unionOrIntersection);
            (0, _utils.default)("TSConditionalType", {
              aliases: ["TSType"],
              visitor: ["checkType", "extendsType", "trueType", "falseType"],
              fields: {
                checkType: (0, _utils.validateType)("TSType"),
                extendsType: (0, _utils.validateType)("TSType"),
                trueType: (0, _utils.validateType)("TSType"),
                falseType: (0, _utils.validateType)("TSType")
              }
            });
            (0, _utils.default)("TSInferType", {
              aliases: ["TSType"],
              visitor: ["typeParameter"],
              fields: {
                typeParameter: (0, _utils.validateType)("TSTypeParameter")
              }
            });
            (0, _utils.default)("TSParenthesizedType", {
              aliases: ["TSType"],
              visitor: ["typeAnnotation"],
              fields: {
                typeAnnotation: (0, _utils.validateType)("TSType")
              }
            });
            (0, _utils.default)("TSTypeOperator", {
              aliases: ["TSType"],
              visitor: ["typeAnnotation"],
              fields: {
                operator: (0, _utils.validate)((0, _utils.assertValueType)("string")),
                typeAnnotation: (0, _utils.validateType)("TSType")
              }
            });
            (0, _utils.default)("TSIndexedAccessType", {
              aliases: ["TSType"],
              visitor: ["objectType", "indexType"],
              fields: {
                objectType: (0, _utils.validateType)("TSType"),
                indexType: (0, _utils.validateType)("TSType")
              }
            });
            (0, _utils.default)("TSMappedType", {
              aliases: ["TSType"],
              visitor: ["typeParameter", "typeAnnotation"],
              fields: {
                readonly: (0, _utils.validateOptional)(bool),
                typeParameter: (0, _utils.validateType)("TSTypeParameter"),
                optional: (0, _utils.validateOptional)(bool),
                typeAnnotation: (0, _utils.validateOptionalType)("TSType")
              }
            });
            (0, _utils.default)("TSLiteralType", {
              aliases: ["TSType"],
              visitor: ["literal"],
              fields: {
                literal: (0, _utils.validateType)(["NumericLiteral", "StringLiteral", "BooleanLiteral"])
              }
            });
            (0, _utils.default)("TSExpressionWithTypeArguments", {
              aliases: ["TSType"],
              visitor: ["expression", "typeParameters"],
              fields: {
                expression: (0, _utils.validateType)("TSEntityName"),
                typeParameters: (0, _utils.validateOptionalType)("TSTypeParameterInstantiation")
              }
            });
            (0, _utils.default)("TSInterfaceDeclaration", {
              aliases: ["Statement", "Declaration"],
              visitor: ["id", "typeParameters", "extends", "body"],
              fields: {
                declare: (0, _utils.validateOptional)(bool),
                id: (0, _utils.validateType)("Identifier"),
                typeParameters: (0, _utils.validateOptionalType)("TSTypeParameterDeclaration"),
                extends: (0, _utils.validateOptional)((0, _utils.arrayOfType)("TSExpressionWithTypeArguments")),
                body: (0, _utils.validateType)("TSInterfaceBody")
              }
            });
            (0, _utils.default)("TSInterfaceBody", {
              visitor: ["body"],
              fields: {
                body: (0, _utils.validateArrayOfType)("TSTypeElement")
              }
            });
            (0, _utils.default)("TSTypeAliasDeclaration", {
              aliases: ["Statement", "Declaration"],
              visitor: ["id", "typeParameters", "typeAnnotation"],
              fields: {
                declare: (0, _utils.validateOptional)(bool),
                id: (0, _utils.validateType)("Identifier"),
                typeParameters: (0, _utils.validateOptionalType)("TSTypeParameterDeclaration"),
                typeAnnotation: (0, _utils.validateType)("TSType")
              }
            });
            (0, _utils.default)("TSAsExpression", {
              aliases: ["Expression"],
              visitor: ["expression", "typeAnnotation"],
              fields: {
                expression: (0, _utils.validateType)("Expression"),
                typeAnnotation: (0, _utils.validateType)("TSType")
              }
            });
            (0, _utils.default)("TSTypeAssertion", {
              aliases: ["Expression"],
              visitor: ["typeAnnotation", "expression"],
              fields: {
                typeAnnotation: (0, _utils.validateType)("TSType"),
                expression: (0, _utils.validateType)("Expression")
              }
            });
            (0, _utils.default)("TSEnumDeclaration", {
              aliases: ["Statement", "Declaration"],
              visitor: ["id", "members"],
              fields: {
                declare: (0, _utils.validateOptional)(bool),
                const: (0, _utils.validateOptional)(bool),
                id: (0, _utils.validateType)("Identifier"),
                members: (0, _utils.validateArrayOfType)("TSEnumMember"),
                initializer: (0, _utils.validateOptionalType)("Expression")
              }
            });
            (0, _utils.default)("TSEnumMember", {
              visitor: ["id", "initializer"],
              fields: {
                id: (0, _utils.validateType)(["Identifier", "StringLiteral"]),
                initializer: (0, _utils.validateOptionalType)("Expression")
              }
            });
            (0, _utils.default)("TSModuleDeclaration", {
              aliases: ["Statement", "Declaration"],
              visitor: ["id", "body"],
              fields: {
                declare: (0, _utils.validateOptional)(bool),
                global: (0, _utils.validateOptional)(bool),
                id: (0, _utils.validateType)(["Identifier", "StringLiteral"]),
                body: (0, _utils.validateType)(["TSModuleBlock", "TSModuleDeclaration"])
              }
            });
            (0, _utils.default)("TSModuleBlock", {
              visitor: ["body"],
              fields: {
                body: (0, _utils.validateArrayOfType)("Statement")
              }
            });
            (0, _utils.default)("TSImportType", {
              aliases: ["TSType"],
              visitor: ["argument", "qualifier", "typeParameters"],
              fields: {
                argument: (0, _utils.validateType)("StringLiteral"),
                qualifier: (0, _utils.validateOptionalType)("TSEntityName"),
                typeParameters: (0, _utils.validateOptionalType)("TSTypeParameterInstantiation")
              }
            });
            (0, _utils.default)("TSImportEqualsDeclaration", {
              aliases: ["Statement"],
              visitor: ["id", "moduleReference"],
              fields: {
                isExport: (0, _utils.validate)(bool),
                id: (0, _utils.validateType)("Identifier"),
                moduleReference: (0, _utils.validateType)(["TSEntityName", "TSExternalModuleReference"])
              }
            });
            (0, _utils.default)("TSExternalModuleReference", {
              visitor: ["expression"],
              fields: {
                expression: (0, _utils.validateType)("StringLiteral")
              }
            });
            (0, _utils.default)("TSNonNullExpression", {
              aliases: ["Expression"],
              visitor: ["expression"],
              fields: {
                expression: (0, _utils.validateType)("Expression")
              }
            });
            (0, _utils.default)("TSExportAssignment", {
              aliases: ["Statement"],
              visitor: ["expression"],
              fields: {
                expression: (0, _utils.validateType)("Expression")
              }
            });
            (0, _utils.default)("TSNamespaceExportDeclaration", {
              aliases: ["Statement"],
              visitor: ["id"],
              fields: {
                id: (0, _utils.validateType)("Identifier")
              }
            });
            (0, _utils.default)("TSTypeAnnotation", {
              visitor: ["typeAnnotation"],
              fields: {
                typeAnnotation: {
                  validate: (0, _utils.assertNodeType)("TSType")
                }
              }
            });
            (0, _utils.default)("TSTypeParameterInstantiation", {
              visitor: ["params"],
              fields: {
                params: {
                  validate: (0, _utils.chain)((0, _utils.assertValueType)("array"), (0, _utils.assertEach)((0, _utils.assertNodeType)("TSType")))
                }
              }
            });
            (0, _utils.default)("TSTypeParameterDeclaration", {
              visitor: ["params"],
              fields: {
                params: {
                  validate: (0, _utils.chain)((0, _utils.assertValueType)("array"), (0, _utils.assertEach)((0, _utils.assertNodeType)("TSTypeParameter")))
                }
              }
            });
            (0, _utils.default)("TSTypeParameter", {
              visitor: ["constraint", "default"],
              fields: {
                name: {
                  validate: (0, _utils.assertValueType)("string")
                },
                constraint: {
                  validate: (0, _utils.assertNodeType)("TSType"),
                  optional: true
                },
                default: {
                  validate: (0, _utils.assertNodeType)("TSType"),
                  optional: true
                }
              }
            });
            });

            unwrapExports(typescript);

            var definitions = createCommonjsModule(function (module, exports) {

            Object.defineProperty(exports, "__esModule", {
              value: true
            });
            Object.defineProperty(exports, "VISITOR_KEYS", {
              enumerable: true,
              get: function () {
                return utils$1.VISITOR_KEYS;
              }
            });
            Object.defineProperty(exports, "ALIAS_KEYS", {
              enumerable: true,
              get: function () {
                return utils$1.ALIAS_KEYS;
              }
            });
            Object.defineProperty(exports, "FLIPPED_ALIAS_KEYS", {
              enumerable: true,
              get: function () {
                return utils$1.FLIPPED_ALIAS_KEYS;
              }
            });
            Object.defineProperty(exports, "NODE_FIELDS", {
              enumerable: true,
              get: function () {
                return utils$1.NODE_FIELDS;
              }
            });
            Object.defineProperty(exports, "BUILDER_KEYS", {
              enumerable: true,
              get: function () {
                return utils$1.BUILDER_KEYS;
              }
            });
            Object.defineProperty(exports, "DEPRECATED_KEYS", {
              enumerable: true,
              get: function () {
                return utils$1.DEPRECATED_KEYS;
              }
            });
            exports.TYPES = void 0;

            function _toFastProperties() {
              const data = _interopRequireDefault(toFastProperties);

              _toFastProperties = function () {
                return data;
              };

              return data;
            }

















            function _interopRequireDefault(obj) {
              return obj && obj.__esModule ? obj : {
                default: obj
              };
            }

            (0, _toFastProperties().default)(utils$1.VISITOR_KEYS);
            (0, _toFastProperties().default)(utils$1.ALIAS_KEYS);
            (0, _toFastProperties().default)(utils$1.FLIPPED_ALIAS_KEYS);
            (0, _toFastProperties().default)(utils$1.NODE_FIELDS);
            (0, _toFastProperties().default)(utils$1.BUILDER_KEYS);
            (0, _toFastProperties().default)(utils$1.DEPRECATED_KEYS);
            const TYPES = Object.keys(utils$1.VISITOR_KEYS).concat(Object.keys(utils$1.FLIPPED_ALIAS_KEYS)).concat(Object.keys(utils$1.DEPRECATED_KEYS));
            exports.TYPES = TYPES;
            });

            unwrapExports(definitions);
            var definitions_1 = definitions.TYPES;

            var validate_1 = createCommonjsModule(function (module, exports) {

            Object.defineProperty(exports, "__esModule", {
              value: true
            });
            exports.default = validate;



            function validate(node, key, val) {
              if (!node) return;
              const fields = definitions.NODE_FIELDS[node.type];
              if (!fields) return;
              const field = fields[key];
              if (!field || !field.validate) return;
              if (field.optional && val == null) return;
              field.validate(node, key, val);
            }
            });

            unwrapExports(validate_1);

            var builder_1 = createCommonjsModule(function (module, exports) {

            Object.defineProperty(exports, "__esModule", {
              value: true
            });
            exports.default = builder;

            function _clone() {
              const data = _interopRequireDefault(clone_1);

              _clone = function () {
                return data;
              };

              return data;
            }



            var _validate = _interopRequireDefault(validate_1);

            function _interopRequireDefault(obj) {
              return obj && obj.__esModule ? obj : {
                default: obj
              };
            }

            function builder(type, ...args) {
              const keys = definitions.BUILDER_KEYS[type];
              const countArgs = args.length;

              if (countArgs > keys.length) {
                throw new Error(`${type}: Too many arguments passed. Received ${countArgs} but can receive no more than ${keys.length}`);
              }

              const node = {
                type
              };
              let i = 0;
              keys.forEach(key => {
                const field = definitions.NODE_FIELDS[type][key];
                let arg;
                if (i < countArgs) arg = args[i];
                if (arg === undefined) arg = (0, _clone().default)(field.default);
                node[key] = arg;
                i++;
              });

              for (const key in node) {
                (0, _validate.default)(node, key, node[key]);
              }

              return node;
            }
            });

            unwrapExports(builder_1);

            var generated$1 = createCommonjsModule(function (module, exports) {

            Object.defineProperty(exports, "__esModule", {
              value: true
            });
            exports.arrayExpression = exports.ArrayExpression = ArrayExpression;
            exports.assignmentExpression = exports.AssignmentExpression = AssignmentExpression;
            exports.binaryExpression = exports.BinaryExpression = BinaryExpression;
            exports.interpreterDirective = exports.InterpreterDirective = InterpreterDirective;
            exports.directive = exports.Directive = Directive;
            exports.directiveLiteral = exports.DirectiveLiteral = DirectiveLiteral;
            exports.blockStatement = exports.BlockStatement = BlockStatement;
            exports.breakStatement = exports.BreakStatement = BreakStatement;
            exports.callExpression = exports.CallExpression = CallExpression;
            exports.catchClause = exports.CatchClause = CatchClause;
            exports.conditionalExpression = exports.ConditionalExpression = ConditionalExpression;
            exports.continueStatement = exports.ContinueStatement = ContinueStatement;
            exports.debuggerStatement = exports.DebuggerStatement = DebuggerStatement;
            exports.doWhileStatement = exports.DoWhileStatement = DoWhileStatement;
            exports.emptyStatement = exports.EmptyStatement = EmptyStatement;
            exports.expressionStatement = exports.ExpressionStatement = ExpressionStatement;
            exports.file = exports.File = File;
            exports.forInStatement = exports.ForInStatement = ForInStatement;
            exports.forStatement = exports.ForStatement = ForStatement;
            exports.functionDeclaration = exports.FunctionDeclaration = FunctionDeclaration;
            exports.functionExpression = exports.FunctionExpression = FunctionExpression;
            exports.identifier = exports.Identifier = Identifier;
            exports.ifStatement = exports.IfStatement = IfStatement;
            exports.labeledStatement = exports.LabeledStatement = LabeledStatement;
            exports.stringLiteral = exports.StringLiteral = StringLiteral;
            exports.numericLiteral = exports.NumericLiteral = NumericLiteral;
            exports.nullLiteral = exports.NullLiteral = NullLiteral;
            exports.booleanLiteral = exports.BooleanLiteral = BooleanLiteral;
            exports.regExpLiteral = exports.RegExpLiteral = RegExpLiteral;
            exports.logicalExpression = exports.LogicalExpression = LogicalExpression;
            exports.memberExpression = exports.MemberExpression = MemberExpression;
            exports.newExpression = exports.NewExpression = NewExpression;
            exports.program = exports.Program = Program;
            exports.objectExpression = exports.ObjectExpression = ObjectExpression;
            exports.objectMethod = exports.ObjectMethod = ObjectMethod;
            exports.objectProperty = exports.ObjectProperty = ObjectProperty;
            exports.restElement = exports.RestElement = RestElement;
            exports.returnStatement = exports.ReturnStatement = ReturnStatement;
            exports.sequenceExpression = exports.SequenceExpression = SequenceExpression;
            exports.switchCase = exports.SwitchCase = SwitchCase;
            exports.switchStatement = exports.SwitchStatement = SwitchStatement;
            exports.thisExpression = exports.ThisExpression = ThisExpression;
            exports.throwStatement = exports.ThrowStatement = ThrowStatement;
            exports.tryStatement = exports.TryStatement = TryStatement;
            exports.unaryExpression = exports.UnaryExpression = UnaryExpression;
            exports.updateExpression = exports.UpdateExpression = UpdateExpression;
            exports.variableDeclaration = exports.VariableDeclaration = VariableDeclaration;
            exports.variableDeclarator = exports.VariableDeclarator = VariableDeclarator;
            exports.whileStatement = exports.WhileStatement = WhileStatement;
            exports.withStatement = exports.WithStatement = WithStatement;
            exports.assignmentPattern = exports.AssignmentPattern = AssignmentPattern;
            exports.arrayPattern = exports.ArrayPattern = ArrayPattern;
            exports.arrowFunctionExpression = exports.ArrowFunctionExpression = ArrowFunctionExpression;
            exports.classBody = exports.ClassBody = ClassBody;
            exports.classDeclaration = exports.ClassDeclaration = ClassDeclaration;
            exports.classExpression = exports.ClassExpression = ClassExpression;
            exports.exportAllDeclaration = exports.ExportAllDeclaration = ExportAllDeclaration;
            exports.exportDefaultDeclaration = exports.ExportDefaultDeclaration = ExportDefaultDeclaration;
            exports.exportNamedDeclaration = exports.ExportNamedDeclaration = ExportNamedDeclaration;
            exports.exportSpecifier = exports.ExportSpecifier = ExportSpecifier;
            exports.forOfStatement = exports.ForOfStatement = ForOfStatement;
            exports.importDeclaration = exports.ImportDeclaration = ImportDeclaration;
            exports.importDefaultSpecifier = exports.ImportDefaultSpecifier = ImportDefaultSpecifier;
            exports.importNamespaceSpecifier = exports.ImportNamespaceSpecifier = ImportNamespaceSpecifier;
            exports.importSpecifier = exports.ImportSpecifier = ImportSpecifier;
            exports.metaProperty = exports.MetaProperty = MetaProperty;
            exports.classMethod = exports.ClassMethod = ClassMethod;
            exports.objectPattern = exports.ObjectPattern = ObjectPattern;
            exports.spreadElement = exports.SpreadElement = SpreadElement;
            exports.super = exports.Super = Super;
            exports.taggedTemplateExpression = exports.TaggedTemplateExpression = TaggedTemplateExpression;
            exports.templateElement = exports.TemplateElement = TemplateElement;
            exports.templateLiteral = exports.TemplateLiteral = TemplateLiteral;
            exports.yieldExpression = exports.YieldExpression = YieldExpression;
            exports.anyTypeAnnotation = exports.AnyTypeAnnotation = AnyTypeAnnotation;
            exports.arrayTypeAnnotation = exports.ArrayTypeAnnotation = ArrayTypeAnnotation;
            exports.booleanTypeAnnotation = exports.BooleanTypeAnnotation = BooleanTypeAnnotation;
            exports.booleanLiteralTypeAnnotation = exports.BooleanLiteralTypeAnnotation = BooleanLiteralTypeAnnotation;
            exports.nullLiteralTypeAnnotation = exports.NullLiteralTypeAnnotation = NullLiteralTypeAnnotation;
            exports.classImplements = exports.ClassImplements = ClassImplements;
            exports.declareClass = exports.DeclareClass = DeclareClass;
            exports.declareFunction = exports.DeclareFunction = DeclareFunction;
            exports.declareInterface = exports.DeclareInterface = DeclareInterface;
            exports.declareModule = exports.DeclareModule = DeclareModule;
            exports.declareModuleExports = exports.DeclareModuleExports = DeclareModuleExports;
            exports.declareTypeAlias = exports.DeclareTypeAlias = DeclareTypeAlias;
            exports.declareOpaqueType = exports.DeclareOpaqueType = DeclareOpaqueType;
            exports.declareVariable = exports.DeclareVariable = DeclareVariable;
            exports.declareExportDeclaration = exports.DeclareExportDeclaration = DeclareExportDeclaration;
            exports.declareExportAllDeclaration = exports.DeclareExportAllDeclaration = DeclareExportAllDeclaration;
            exports.declaredPredicate = exports.DeclaredPredicate = DeclaredPredicate;
            exports.existsTypeAnnotation = exports.ExistsTypeAnnotation = ExistsTypeAnnotation;
            exports.functionTypeAnnotation = exports.FunctionTypeAnnotation = FunctionTypeAnnotation;
            exports.functionTypeParam = exports.FunctionTypeParam = FunctionTypeParam;
            exports.genericTypeAnnotation = exports.GenericTypeAnnotation = GenericTypeAnnotation;
            exports.inferredPredicate = exports.InferredPredicate = InferredPredicate;
            exports.interfaceExtends = exports.InterfaceExtends = InterfaceExtends;
            exports.interfaceDeclaration = exports.InterfaceDeclaration = InterfaceDeclaration;
            exports.interfaceTypeAnnotation = exports.InterfaceTypeAnnotation = InterfaceTypeAnnotation;
            exports.intersectionTypeAnnotation = exports.IntersectionTypeAnnotation = IntersectionTypeAnnotation;
            exports.mixedTypeAnnotation = exports.MixedTypeAnnotation = MixedTypeAnnotation;
            exports.emptyTypeAnnotation = exports.EmptyTypeAnnotation = EmptyTypeAnnotation;
            exports.nullableTypeAnnotation = exports.NullableTypeAnnotation = NullableTypeAnnotation;
            exports.numberLiteralTypeAnnotation = exports.NumberLiteralTypeAnnotation = NumberLiteralTypeAnnotation;
            exports.numberTypeAnnotation = exports.NumberTypeAnnotation = NumberTypeAnnotation;
            exports.objectTypeAnnotation = exports.ObjectTypeAnnotation = ObjectTypeAnnotation;
            exports.objectTypeInternalSlot = exports.ObjectTypeInternalSlot = ObjectTypeInternalSlot;
            exports.objectTypeCallProperty = exports.ObjectTypeCallProperty = ObjectTypeCallProperty;
            exports.objectTypeIndexer = exports.ObjectTypeIndexer = ObjectTypeIndexer;
            exports.objectTypeProperty = exports.ObjectTypeProperty = ObjectTypeProperty;
            exports.objectTypeSpreadProperty = exports.ObjectTypeSpreadProperty = ObjectTypeSpreadProperty;
            exports.opaqueType = exports.OpaqueType = OpaqueType;
            exports.qualifiedTypeIdentifier = exports.QualifiedTypeIdentifier = QualifiedTypeIdentifier;
            exports.stringLiteralTypeAnnotation = exports.StringLiteralTypeAnnotation = StringLiteralTypeAnnotation;
            exports.stringTypeAnnotation = exports.StringTypeAnnotation = StringTypeAnnotation;
            exports.thisTypeAnnotation = exports.ThisTypeAnnotation = ThisTypeAnnotation;
            exports.tupleTypeAnnotation = exports.TupleTypeAnnotation = TupleTypeAnnotation;
            exports.typeofTypeAnnotation = exports.TypeofTypeAnnotation = TypeofTypeAnnotation;
            exports.typeAlias = exports.TypeAlias = TypeAlias;
            exports.typeAnnotation = exports.TypeAnnotation = TypeAnnotation;
            exports.typeCastExpression = exports.TypeCastExpression = TypeCastExpression;
            exports.typeParameter = exports.TypeParameter = TypeParameter;
            exports.typeParameterDeclaration = exports.TypeParameterDeclaration = TypeParameterDeclaration;
            exports.typeParameterInstantiation = exports.TypeParameterInstantiation = TypeParameterInstantiation;
            exports.unionTypeAnnotation = exports.UnionTypeAnnotation = UnionTypeAnnotation;
            exports.variance = exports.Variance = Variance;
            exports.voidTypeAnnotation = exports.VoidTypeAnnotation = VoidTypeAnnotation;
            exports.jSXAttribute = exports.jsxAttribute = exports.JSXAttribute = JSXAttribute;
            exports.jSXClosingElement = exports.jsxClosingElement = exports.JSXClosingElement = JSXClosingElement;
            exports.jSXElement = exports.jsxElement = exports.JSXElement = JSXElement;
            exports.jSXEmptyExpression = exports.jsxEmptyExpression = exports.JSXEmptyExpression = JSXEmptyExpression;
            exports.jSXExpressionContainer = exports.jsxExpressionContainer = exports.JSXExpressionContainer = JSXExpressionContainer;
            exports.jSXSpreadChild = exports.jsxSpreadChild = exports.JSXSpreadChild = JSXSpreadChild;
            exports.jSXIdentifier = exports.jsxIdentifier = exports.JSXIdentifier = JSXIdentifier;
            exports.jSXMemberExpression = exports.jsxMemberExpression = exports.JSXMemberExpression = JSXMemberExpression;
            exports.jSXNamespacedName = exports.jsxNamespacedName = exports.JSXNamespacedName = JSXNamespacedName;
            exports.jSXOpeningElement = exports.jsxOpeningElement = exports.JSXOpeningElement = JSXOpeningElement;
            exports.jSXSpreadAttribute = exports.jsxSpreadAttribute = exports.JSXSpreadAttribute = JSXSpreadAttribute;
            exports.jSXText = exports.jsxText = exports.JSXText = JSXText;
            exports.jSXFragment = exports.jsxFragment = exports.JSXFragment = JSXFragment;
            exports.jSXOpeningFragment = exports.jsxOpeningFragment = exports.JSXOpeningFragment = JSXOpeningFragment;
            exports.jSXClosingFragment = exports.jsxClosingFragment = exports.JSXClosingFragment = JSXClosingFragment;
            exports.noop = exports.Noop = Noop;
            exports.parenthesizedExpression = exports.ParenthesizedExpression = ParenthesizedExpression;
            exports.awaitExpression = exports.AwaitExpression = AwaitExpression;
            exports.bindExpression = exports.BindExpression = BindExpression;
            exports.classProperty = exports.ClassProperty = ClassProperty;
            exports.optionalMemberExpression = exports.OptionalMemberExpression = OptionalMemberExpression;
            exports.pipelineTopicExpression = exports.PipelineTopicExpression = PipelineTopicExpression;
            exports.pipelineBareFunction = exports.PipelineBareFunction = PipelineBareFunction;
            exports.pipelinePrimaryTopicReference = exports.PipelinePrimaryTopicReference = PipelinePrimaryTopicReference;
            exports.optionalCallExpression = exports.OptionalCallExpression = OptionalCallExpression;
            exports.classPrivateProperty = exports.ClassPrivateProperty = ClassPrivateProperty;
            exports.classPrivateMethod = exports.ClassPrivateMethod = ClassPrivateMethod;
            exports.import = exports.Import = Import;
            exports.decorator = exports.Decorator = Decorator;
            exports.doExpression = exports.DoExpression = DoExpression;
            exports.exportDefaultSpecifier = exports.ExportDefaultSpecifier = ExportDefaultSpecifier;
            exports.exportNamespaceSpecifier = exports.ExportNamespaceSpecifier = ExportNamespaceSpecifier;
            exports.privateName = exports.PrivateName = PrivateName;
            exports.bigIntLiteral = exports.BigIntLiteral = BigIntLiteral;
            exports.tSParameterProperty = exports.tsParameterProperty = exports.TSParameterProperty = TSParameterProperty;
            exports.tSDeclareFunction = exports.tsDeclareFunction = exports.TSDeclareFunction = TSDeclareFunction;
            exports.tSDeclareMethod = exports.tsDeclareMethod = exports.TSDeclareMethod = TSDeclareMethod;
            exports.tSQualifiedName = exports.tsQualifiedName = exports.TSQualifiedName = TSQualifiedName;
            exports.tSCallSignatureDeclaration = exports.tsCallSignatureDeclaration = exports.TSCallSignatureDeclaration = TSCallSignatureDeclaration;
            exports.tSConstructSignatureDeclaration = exports.tsConstructSignatureDeclaration = exports.TSConstructSignatureDeclaration = TSConstructSignatureDeclaration;
            exports.tSPropertySignature = exports.tsPropertySignature = exports.TSPropertySignature = TSPropertySignature;
            exports.tSMethodSignature = exports.tsMethodSignature = exports.TSMethodSignature = TSMethodSignature;
            exports.tSIndexSignature = exports.tsIndexSignature = exports.TSIndexSignature = TSIndexSignature;
            exports.tSAnyKeyword = exports.tsAnyKeyword = exports.TSAnyKeyword = TSAnyKeyword;
            exports.tSUnknownKeyword = exports.tsUnknownKeyword = exports.TSUnknownKeyword = TSUnknownKeyword;
            exports.tSNumberKeyword = exports.tsNumberKeyword = exports.TSNumberKeyword = TSNumberKeyword;
            exports.tSObjectKeyword = exports.tsObjectKeyword = exports.TSObjectKeyword = TSObjectKeyword;
            exports.tSBooleanKeyword = exports.tsBooleanKeyword = exports.TSBooleanKeyword = TSBooleanKeyword;
            exports.tSStringKeyword = exports.tsStringKeyword = exports.TSStringKeyword = TSStringKeyword;
            exports.tSSymbolKeyword = exports.tsSymbolKeyword = exports.TSSymbolKeyword = TSSymbolKeyword;
            exports.tSVoidKeyword = exports.tsVoidKeyword = exports.TSVoidKeyword = TSVoidKeyword;
            exports.tSUndefinedKeyword = exports.tsUndefinedKeyword = exports.TSUndefinedKeyword = TSUndefinedKeyword;
            exports.tSNullKeyword = exports.tsNullKeyword = exports.TSNullKeyword = TSNullKeyword;
            exports.tSNeverKeyword = exports.tsNeverKeyword = exports.TSNeverKeyword = TSNeverKeyword;
            exports.tSThisType = exports.tsThisType = exports.TSThisType = TSThisType;
            exports.tSFunctionType = exports.tsFunctionType = exports.TSFunctionType = TSFunctionType;
            exports.tSConstructorType = exports.tsConstructorType = exports.TSConstructorType = TSConstructorType;
            exports.tSTypeReference = exports.tsTypeReference = exports.TSTypeReference = TSTypeReference;
            exports.tSTypePredicate = exports.tsTypePredicate = exports.TSTypePredicate = TSTypePredicate;
            exports.tSTypeQuery = exports.tsTypeQuery = exports.TSTypeQuery = TSTypeQuery;
            exports.tSTypeLiteral = exports.tsTypeLiteral = exports.TSTypeLiteral = TSTypeLiteral;
            exports.tSArrayType = exports.tsArrayType = exports.TSArrayType = TSArrayType;
            exports.tSTupleType = exports.tsTupleType = exports.TSTupleType = TSTupleType;
            exports.tSOptionalType = exports.tsOptionalType = exports.TSOptionalType = TSOptionalType;
            exports.tSRestType = exports.tsRestType = exports.TSRestType = TSRestType;
            exports.tSUnionType = exports.tsUnionType = exports.TSUnionType = TSUnionType;
            exports.tSIntersectionType = exports.tsIntersectionType = exports.TSIntersectionType = TSIntersectionType;
            exports.tSConditionalType = exports.tsConditionalType = exports.TSConditionalType = TSConditionalType;
            exports.tSInferType = exports.tsInferType = exports.TSInferType = TSInferType;
            exports.tSParenthesizedType = exports.tsParenthesizedType = exports.TSParenthesizedType = TSParenthesizedType;
            exports.tSTypeOperator = exports.tsTypeOperator = exports.TSTypeOperator = TSTypeOperator;
            exports.tSIndexedAccessType = exports.tsIndexedAccessType = exports.TSIndexedAccessType = TSIndexedAccessType;
            exports.tSMappedType = exports.tsMappedType = exports.TSMappedType = TSMappedType;
            exports.tSLiteralType = exports.tsLiteralType = exports.TSLiteralType = TSLiteralType;
            exports.tSExpressionWithTypeArguments = exports.tsExpressionWithTypeArguments = exports.TSExpressionWithTypeArguments = TSExpressionWithTypeArguments;
            exports.tSInterfaceDeclaration = exports.tsInterfaceDeclaration = exports.TSInterfaceDeclaration = TSInterfaceDeclaration;
            exports.tSInterfaceBody = exports.tsInterfaceBody = exports.TSInterfaceBody = TSInterfaceBody;
            exports.tSTypeAliasDeclaration = exports.tsTypeAliasDeclaration = exports.TSTypeAliasDeclaration = TSTypeAliasDeclaration;
            exports.tSAsExpression = exports.tsAsExpression = exports.TSAsExpression = TSAsExpression;
            exports.tSTypeAssertion = exports.tsTypeAssertion = exports.TSTypeAssertion = TSTypeAssertion;
            exports.tSEnumDeclaration = exports.tsEnumDeclaration = exports.TSEnumDeclaration = TSEnumDeclaration;
            exports.tSEnumMember = exports.tsEnumMember = exports.TSEnumMember = TSEnumMember;
            exports.tSModuleDeclaration = exports.tsModuleDeclaration = exports.TSModuleDeclaration = TSModuleDeclaration;
            exports.tSModuleBlock = exports.tsModuleBlock = exports.TSModuleBlock = TSModuleBlock;
            exports.tSImportType = exports.tsImportType = exports.TSImportType = TSImportType;
            exports.tSImportEqualsDeclaration = exports.tsImportEqualsDeclaration = exports.TSImportEqualsDeclaration = TSImportEqualsDeclaration;
            exports.tSExternalModuleReference = exports.tsExternalModuleReference = exports.TSExternalModuleReference = TSExternalModuleReference;
            exports.tSNonNullExpression = exports.tsNonNullExpression = exports.TSNonNullExpression = TSNonNullExpression;
            exports.tSExportAssignment = exports.tsExportAssignment = exports.TSExportAssignment = TSExportAssignment;
            exports.tSNamespaceExportDeclaration = exports.tsNamespaceExportDeclaration = exports.TSNamespaceExportDeclaration = TSNamespaceExportDeclaration;
            exports.tSTypeAnnotation = exports.tsTypeAnnotation = exports.TSTypeAnnotation = TSTypeAnnotation;
            exports.tSTypeParameterInstantiation = exports.tsTypeParameterInstantiation = exports.TSTypeParameterInstantiation = TSTypeParameterInstantiation;
            exports.tSTypeParameterDeclaration = exports.tsTypeParameterDeclaration = exports.TSTypeParameterDeclaration = TSTypeParameterDeclaration;
            exports.tSTypeParameter = exports.tsTypeParameter = exports.TSTypeParameter = TSTypeParameter;
            exports.numberLiteral = exports.NumberLiteral = NumberLiteral;
            exports.regexLiteral = exports.RegexLiteral = RegexLiteral;
            exports.restProperty = exports.RestProperty = RestProperty;
            exports.spreadProperty = exports.SpreadProperty = SpreadProperty;

            var _builder = _interopRequireDefault(builder_1);

            function _interopRequireDefault(obj) {
              return obj && obj.__esModule ? obj : {
                default: obj
              };
            }

            function ArrayExpression(...args) {
              return (0, _builder.default)("ArrayExpression", ...args);
            }

            function AssignmentExpression(...args) {
              return (0, _builder.default)("AssignmentExpression", ...args);
            }

            function BinaryExpression(...args) {
              return (0, _builder.default)("BinaryExpression", ...args);
            }

            function InterpreterDirective(...args) {
              return (0, _builder.default)("InterpreterDirective", ...args);
            }

            function Directive(...args) {
              return (0, _builder.default)("Directive", ...args);
            }

            function DirectiveLiteral(...args) {
              return (0, _builder.default)("DirectiveLiteral", ...args);
            }

            function BlockStatement(...args) {
              return (0, _builder.default)("BlockStatement", ...args);
            }

            function BreakStatement(...args) {
              return (0, _builder.default)("BreakStatement", ...args);
            }

            function CallExpression(...args) {
              return (0, _builder.default)("CallExpression", ...args);
            }

            function CatchClause(...args) {
              return (0, _builder.default)("CatchClause", ...args);
            }

            function ConditionalExpression(...args) {
              return (0, _builder.default)("ConditionalExpression", ...args);
            }

            function ContinueStatement(...args) {
              return (0, _builder.default)("ContinueStatement", ...args);
            }

            function DebuggerStatement(...args) {
              return (0, _builder.default)("DebuggerStatement", ...args);
            }

            function DoWhileStatement(...args) {
              return (0, _builder.default)("DoWhileStatement", ...args);
            }

            function EmptyStatement(...args) {
              return (0, _builder.default)("EmptyStatement", ...args);
            }

            function ExpressionStatement(...args) {
              return (0, _builder.default)("ExpressionStatement", ...args);
            }

            function File(...args) {
              return (0, _builder.default)("File", ...args);
            }

            function ForInStatement(...args) {
              return (0, _builder.default)("ForInStatement", ...args);
            }

            function ForStatement(...args) {
              return (0, _builder.default)("ForStatement", ...args);
            }

            function FunctionDeclaration(...args) {
              return (0, _builder.default)("FunctionDeclaration", ...args);
            }

            function FunctionExpression(...args) {
              return (0, _builder.default)("FunctionExpression", ...args);
            }

            function Identifier(...args) {
              return (0, _builder.default)("Identifier", ...args);
            }

            function IfStatement(...args) {
              return (0, _builder.default)("IfStatement", ...args);
            }

            function LabeledStatement(...args) {
              return (0, _builder.default)("LabeledStatement", ...args);
            }

            function StringLiteral(...args) {
              return (0, _builder.default)("StringLiteral", ...args);
            }

            function NumericLiteral(...args) {
              return (0, _builder.default)("NumericLiteral", ...args);
            }

            function NullLiteral(...args) {
              return (0, _builder.default)("NullLiteral", ...args);
            }

            function BooleanLiteral(...args) {
              return (0, _builder.default)("BooleanLiteral", ...args);
            }

            function RegExpLiteral(...args) {
              return (0, _builder.default)("RegExpLiteral", ...args);
            }

            function LogicalExpression(...args) {
              return (0, _builder.default)("LogicalExpression", ...args);
            }

            function MemberExpression(...args) {
              return (0, _builder.default)("MemberExpression", ...args);
            }

            function NewExpression(...args) {
              return (0, _builder.default)("NewExpression", ...args);
            }

            function Program(...args) {
              return (0, _builder.default)("Program", ...args);
            }

            function ObjectExpression(...args) {
              return (0, _builder.default)("ObjectExpression", ...args);
            }

            function ObjectMethod(...args) {
              return (0, _builder.default)("ObjectMethod", ...args);
            }

            function ObjectProperty(...args) {
              return (0, _builder.default)("ObjectProperty", ...args);
            }

            function RestElement(...args) {
              return (0, _builder.default)("RestElement", ...args);
            }

            function ReturnStatement(...args) {
              return (0, _builder.default)("ReturnStatement", ...args);
            }

            function SequenceExpression(...args) {
              return (0, _builder.default)("SequenceExpression", ...args);
            }

            function SwitchCase(...args) {
              return (0, _builder.default)("SwitchCase", ...args);
            }

            function SwitchStatement(...args) {
              return (0, _builder.default)("SwitchStatement", ...args);
            }

            function ThisExpression(...args) {
              return (0, _builder.default)("ThisExpression", ...args);
            }

            function ThrowStatement(...args) {
              return (0, _builder.default)("ThrowStatement", ...args);
            }

            function TryStatement(...args) {
              return (0, _builder.default)("TryStatement", ...args);
            }

            function UnaryExpression(...args) {
              return (0, _builder.default)("UnaryExpression", ...args);
            }

            function UpdateExpression(...args) {
              return (0, _builder.default)("UpdateExpression", ...args);
            }

            function VariableDeclaration(...args) {
              return (0, _builder.default)("VariableDeclaration", ...args);
            }

            function VariableDeclarator(...args) {
              return (0, _builder.default)("VariableDeclarator", ...args);
            }

            function WhileStatement(...args) {
              return (0, _builder.default)("WhileStatement", ...args);
            }

            function WithStatement(...args) {
              return (0, _builder.default)("WithStatement", ...args);
            }

            function AssignmentPattern(...args) {
              return (0, _builder.default)("AssignmentPattern", ...args);
            }

            function ArrayPattern(...args) {
              return (0, _builder.default)("ArrayPattern", ...args);
            }

            function ArrowFunctionExpression(...args) {
              return (0, _builder.default)("ArrowFunctionExpression", ...args);
            }

            function ClassBody(...args) {
              return (0, _builder.default)("ClassBody", ...args);
            }

            function ClassDeclaration(...args) {
              return (0, _builder.default)("ClassDeclaration", ...args);
            }

            function ClassExpression(...args) {
              return (0, _builder.default)("ClassExpression", ...args);
            }

            function ExportAllDeclaration(...args) {
              return (0, _builder.default)("ExportAllDeclaration", ...args);
            }

            function ExportDefaultDeclaration(...args) {
              return (0, _builder.default)("ExportDefaultDeclaration", ...args);
            }

            function ExportNamedDeclaration(...args) {
              return (0, _builder.default)("ExportNamedDeclaration", ...args);
            }

            function ExportSpecifier(...args) {
              return (0, _builder.default)("ExportSpecifier", ...args);
            }

            function ForOfStatement(...args) {
              return (0, _builder.default)("ForOfStatement", ...args);
            }

            function ImportDeclaration(...args) {
              return (0, _builder.default)("ImportDeclaration", ...args);
            }

            function ImportDefaultSpecifier(...args) {
              return (0, _builder.default)("ImportDefaultSpecifier", ...args);
            }

            function ImportNamespaceSpecifier(...args) {
              return (0, _builder.default)("ImportNamespaceSpecifier", ...args);
            }

            function ImportSpecifier(...args) {
              return (0, _builder.default)("ImportSpecifier", ...args);
            }

            function MetaProperty(...args) {
              return (0, _builder.default)("MetaProperty", ...args);
            }

            function ClassMethod(...args) {
              return (0, _builder.default)("ClassMethod", ...args);
            }

            function ObjectPattern(...args) {
              return (0, _builder.default)("ObjectPattern", ...args);
            }

            function SpreadElement(...args) {
              return (0, _builder.default)("SpreadElement", ...args);
            }

            function Super(...args) {
              return (0, _builder.default)("Super", ...args);
            }

            function TaggedTemplateExpression(...args) {
              return (0, _builder.default)("TaggedTemplateExpression", ...args);
            }

            function TemplateElement(...args) {
              return (0, _builder.default)("TemplateElement", ...args);
            }

            function TemplateLiteral(...args) {
              return (0, _builder.default)("TemplateLiteral", ...args);
            }

            function YieldExpression(...args) {
              return (0, _builder.default)("YieldExpression", ...args);
            }

            function AnyTypeAnnotation(...args) {
              return (0, _builder.default)("AnyTypeAnnotation", ...args);
            }

            function ArrayTypeAnnotation(...args) {
              return (0, _builder.default)("ArrayTypeAnnotation", ...args);
            }

            function BooleanTypeAnnotation(...args) {
              return (0, _builder.default)("BooleanTypeAnnotation", ...args);
            }

            function BooleanLiteralTypeAnnotation(...args) {
              return (0, _builder.default)("BooleanLiteralTypeAnnotation", ...args);
            }

            function NullLiteralTypeAnnotation(...args) {
              return (0, _builder.default)("NullLiteralTypeAnnotation", ...args);
            }

            function ClassImplements(...args) {
              return (0, _builder.default)("ClassImplements", ...args);
            }

            function DeclareClass(...args) {
              return (0, _builder.default)("DeclareClass", ...args);
            }

            function DeclareFunction(...args) {
              return (0, _builder.default)("DeclareFunction", ...args);
            }

            function DeclareInterface(...args) {
              return (0, _builder.default)("DeclareInterface", ...args);
            }

            function DeclareModule(...args) {
              return (0, _builder.default)("DeclareModule", ...args);
            }

            function DeclareModuleExports(...args) {
              return (0, _builder.default)("DeclareModuleExports", ...args);
            }

            function DeclareTypeAlias(...args) {
              return (0, _builder.default)("DeclareTypeAlias", ...args);
            }

            function DeclareOpaqueType(...args) {
              return (0, _builder.default)("DeclareOpaqueType", ...args);
            }

            function DeclareVariable(...args) {
              return (0, _builder.default)("DeclareVariable", ...args);
            }

            function DeclareExportDeclaration(...args) {
              return (0, _builder.default)("DeclareExportDeclaration", ...args);
            }

            function DeclareExportAllDeclaration(...args) {
              return (0, _builder.default)("DeclareExportAllDeclaration", ...args);
            }

            function DeclaredPredicate(...args) {
              return (0, _builder.default)("DeclaredPredicate", ...args);
            }

            function ExistsTypeAnnotation(...args) {
              return (0, _builder.default)("ExistsTypeAnnotation", ...args);
            }

            function FunctionTypeAnnotation(...args) {
              return (0, _builder.default)("FunctionTypeAnnotation", ...args);
            }

            function FunctionTypeParam(...args) {
              return (0, _builder.default)("FunctionTypeParam", ...args);
            }

            function GenericTypeAnnotation(...args) {
              return (0, _builder.default)("GenericTypeAnnotation", ...args);
            }

            function InferredPredicate(...args) {
              return (0, _builder.default)("InferredPredicate", ...args);
            }

            function InterfaceExtends(...args) {
              return (0, _builder.default)("InterfaceExtends", ...args);
            }

            function InterfaceDeclaration(...args) {
              return (0, _builder.default)("InterfaceDeclaration", ...args);
            }

            function InterfaceTypeAnnotation(...args) {
              return (0, _builder.default)("InterfaceTypeAnnotation", ...args);
            }

            function IntersectionTypeAnnotation(...args) {
              return (0, _builder.default)("IntersectionTypeAnnotation", ...args);
            }

            function MixedTypeAnnotation(...args) {
              return (0, _builder.default)("MixedTypeAnnotation", ...args);
            }

            function EmptyTypeAnnotation(...args) {
              return (0, _builder.default)("EmptyTypeAnnotation", ...args);
            }

            function NullableTypeAnnotation(...args) {
              return (0, _builder.default)("NullableTypeAnnotation", ...args);
            }

            function NumberLiteralTypeAnnotation(...args) {
              return (0, _builder.default)("NumberLiteralTypeAnnotation", ...args);
            }

            function NumberTypeAnnotation(...args) {
              return (0, _builder.default)("NumberTypeAnnotation", ...args);
            }

            function ObjectTypeAnnotation(...args) {
              return (0, _builder.default)("ObjectTypeAnnotation", ...args);
            }

            function ObjectTypeInternalSlot(...args) {
              return (0, _builder.default)("ObjectTypeInternalSlot", ...args);
            }

            function ObjectTypeCallProperty(...args) {
              return (0, _builder.default)("ObjectTypeCallProperty", ...args);
            }

            function ObjectTypeIndexer(...args) {
              return (0, _builder.default)("ObjectTypeIndexer", ...args);
            }

            function ObjectTypeProperty(...args) {
              return (0, _builder.default)("ObjectTypeProperty", ...args);
            }

            function ObjectTypeSpreadProperty(...args) {
              return (0, _builder.default)("ObjectTypeSpreadProperty", ...args);
            }

            function OpaqueType(...args) {
              return (0, _builder.default)("OpaqueType", ...args);
            }

            function QualifiedTypeIdentifier(...args) {
              return (0, _builder.default)("QualifiedTypeIdentifier", ...args);
            }

            function StringLiteralTypeAnnotation(...args) {
              return (0, _builder.default)("StringLiteralTypeAnnotation", ...args);
            }

            function StringTypeAnnotation(...args) {
              return (0, _builder.default)("StringTypeAnnotation", ...args);
            }

            function ThisTypeAnnotation(...args) {
              return (0, _builder.default)("ThisTypeAnnotation", ...args);
            }

            function TupleTypeAnnotation(...args) {
              return (0, _builder.default)("TupleTypeAnnotation", ...args);
            }

            function TypeofTypeAnnotation(...args) {
              return (0, _builder.default)("TypeofTypeAnnotation", ...args);
            }

            function TypeAlias(...args) {
              return (0, _builder.default)("TypeAlias", ...args);
            }

            function TypeAnnotation(...args) {
              return (0, _builder.default)("TypeAnnotation", ...args);
            }

            function TypeCastExpression(...args) {
              return (0, _builder.default)("TypeCastExpression", ...args);
            }

            function TypeParameter(...args) {
              return (0, _builder.default)("TypeParameter", ...args);
            }

            function TypeParameterDeclaration(...args) {
              return (0, _builder.default)("TypeParameterDeclaration", ...args);
            }

            function TypeParameterInstantiation(...args) {
              return (0, _builder.default)("TypeParameterInstantiation", ...args);
            }

            function UnionTypeAnnotation(...args) {
              return (0, _builder.default)("UnionTypeAnnotation", ...args);
            }

            function Variance(...args) {
              return (0, _builder.default)("Variance", ...args);
            }

            function VoidTypeAnnotation(...args) {
              return (0, _builder.default)("VoidTypeAnnotation", ...args);
            }

            function JSXAttribute(...args) {
              return (0, _builder.default)("JSXAttribute", ...args);
            }

            function JSXClosingElement(...args) {
              return (0, _builder.default)("JSXClosingElement", ...args);
            }

            function JSXElement(...args) {
              return (0, _builder.default)("JSXElement", ...args);
            }

            function JSXEmptyExpression(...args) {
              return (0, _builder.default)("JSXEmptyExpression", ...args);
            }

            function JSXExpressionContainer(...args) {
              return (0, _builder.default)("JSXExpressionContainer", ...args);
            }

            function JSXSpreadChild(...args) {
              return (0, _builder.default)("JSXSpreadChild", ...args);
            }

            function JSXIdentifier(...args) {
              return (0, _builder.default)("JSXIdentifier", ...args);
            }

            function JSXMemberExpression(...args) {
              return (0, _builder.default)("JSXMemberExpression", ...args);
            }

            function JSXNamespacedName(...args) {
              return (0, _builder.default)("JSXNamespacedName", ...args);
            }

            function JSXOpeningElement(...args) {
              return (0, _builder.default)("JSXOpeningElement", ...args);
            }

            function JSXSpreadAttribute(...args) {
              return (0, _builder.default)("JSXSpreadAttribute", ...args);
            }

            function JSXText(...args) {
              return (0, _builder.default)("JSXText", ...args);
            }

            function JSXFragment(...args) {
              return (0, _builder.default)("JSXFragment", ...args);
            }

            function JSXOpeningFragment(...args) {
              return (0, _builder.default)("JSXOpeningFragment", ...args);
            }

            function JSXClosingFragment(...args) {
              return (0, _builder.default)("JSXClosingFragment", ...args);
            }

            function Noop(...args) {
              return (0, _builder.default)("Noop", ...args);
            }

            function ParenthesizedExpression(...args) {
              return (0, _builder.default)("ParenthesizedExpression", ...args);
            }

            function AwaitExpression(...args) {
              return (0, _builder.default)("AwaitExpression", ...args);
            }

            function BindExpression(...args) {
              return (0, _builder.default)("BindExpression", ...args);
            }

            function ClassProperty(...args) {
              return (0, _builder.default)("ClassProperty", ...args);
            }

            function OptionalMemberExpression(...args) {
              return (0, _builder.default)("OptionalMemberExpression", ...args);
            }

            function PipelineTopicExpression(...args) {
              return (0, _builder.default)("PipelineTopicExpression", ...args);
            }

            function PipelineBareFunction(...args) {
              return (0, _builder.default)("PipelineBareFunction", ...args);
            }

            function PipelinePrimaryTopicReference(...args) {
              return (0, _builder.default)("PipelinePrimaryTopicReference", ...args);
            }

            function OptionalCallExpression(...args) {
              return (0, _builder.default)("OptionalCallExpression", ...args);
            }

            function ClassPrivateProperty(...args) {
              return (0, _builder.default)("ClassPrivateProperty", ...args);
            }

            function ClassPrivateMethod(...args) {
              return (0, _builder.default)("ClassPrivateMethod", ...args);
            }

            function Import(...args) {
              return (0, _builder.default)("Import", ...args);
            }

            function Decorator(...args) {
              return (0, _builder.default)("Decorator", ...args);
            }

            function DoExpression(...args) {
              return (0, _builder.default)("DoExpression", ...args);
            }

            function ExportDefaultSpecifier(...args) {
              return (0, _builder.default)("ExportDefaultSpecifier", ...args);
            }

            function ExportNamespaceSpecifier(...args) {
              return (0, _builder.default)("ExportNamespaceSpecifier", ...args);
            }

            function PrivateName(...args) {
              return (0, _builder.default)("PrivateName", ...args);
            }

            function BigIntLiteral(...args) {
              return (0, _builder.default)("BigIntLiteral", ...args);
            }

            function TSParameterProperty(...args) {
              return (0, _builder.default)("TSParameterProperty", ...args);
            }

            function TSDeclareFunction(...args) {
              return (0, _builder.default)("TSDeclareFunction", ...args);
            }

            function TSDeclareMethod(...args) {
              return (0, _builder.default)("TSDeclareMethod", ...args);
            }

            function TSQualifiedName(...args) {
              return (0, _builder.default)("TSQualifiedName", ...args);
            }

            function TSCallSignatureDeclaration(...args) {
              return (0, _builder.default)("TSCallSignatureDeclaration", ...args);
            }

            function TSConstructSignatureDeclaration(...args) {
              return (0, _builder.default)("TSConstructSignatureDeclaration", ...args);
            }

            function TSPropertySignature(...args) {
              return (0, _builder.default)("TSPropertySignature", ...args);
            }

            function TSMethodSignature(...args) {
              return (0, _builder.default)("TSMethodSignature", ...args);
            }

            function TSIndexSignature(...args) {
              return (0, _builder.default)("TSIndexSignature", ...args);
            }

            function TSAnyKeyword(...args) {
              return (0, _builder.default)("TSAnyKeyword", ...args);
            }

            function TSUnknownKeyword(...args) {
              return (0, _builder.default)("TSUnknownKeyword", ...args);
            }

            function TSNumberKeyword(...args) {
              return (0, _builder.default)("TSNumberKeyword", ...args);
            }

            function TSObjectKeyword(...args) {
              return (0, _builder.default)("TSObjectKeyword", ...args);
            }

            function TSBooleanKeyword(...args) {
              return (0, _builder.default)("TSBooleanKeyword", ...args);
            }

            function TSStringKeyword(...args) {
              return (0, _builder.default)("TSStringKeyword", ...args);
            }

            function TSSymbolKeyword(...args) {
              return (0, _builder.default)("TSSymbolKeyword", ...args);
            }

            function TSVoidKeyword(...args) {
              return (0, _builder.default)("TSVoidKeyword", ...args);
            }

            function TSUndefinedKeyword(...args) {
              return (0, _builder.default)("TSUndefinedKeyword", ...args);
            }

            function TSNullKeyword(...args) {
              return (0, _builder.default)("TSNullKeyword", ...args);
            }

            function TSNeverKeyword(...args) {
              return (0, _builder.default)("TSNeverKeyword", ...args);
            }

            function TSThisType(...args) {
              return (0, _builder.default)("TSThisType", ...args);
            }

            function TSFunctionType(...args) {
              return (0, _builder.default)("TSFunctionType", ...args);
            }

            function TSConstructorType(...args) {
              return (0, _builder.default)("TSConstructorType", ...args);
            }

            function TSTypeReference(...args) {
              return (0, _builder.default)("TSTypeReference", ...args);
            }

            function TSTypePredicate(...args) {
              return (0, _builder.default)("TSTypePredicate", ...args);
            }

            function TSTypeQuery(...args) {
              return (0, _builder.default)("TSTypeQuery", ...args);
            }

            function TSTypeLiteral(...args) {
              return (0, _builder.default)("TSTypeLiteral", ...args);
            }

            function TSArrayType(...args) {
              return (0, _builder.default)("TSArrayType", ...args);
            }

            function TSTupleType(...args) {
              return (0, _builder.default)("TSTupleType", ...args);
            }

            function TSOptionalType(...args) {
              return (0, _builder.default)("TSOptionalType", ...args);
            }

            function TSRestType(...args) {
              return (0, _builder.default)("TSRestType", ...args);
            }

            function TSUnionType(...args) {
              return (0, _builder.default)("TSUnionType", ...args);
            }

            function TSIntersectionType(...args) {
              return (0, _builder.default)("TSIntersectionType", ...args);
            }

            function TSConditionalType(...args) {
              return (0, _builder.default)("TSConditionalType", ...args);
            }

            function TSInferType(...args) {
              return (0, _builder.default)("TSInferType", ...args);
            }

            function TSParenthesizedType(...args) {
              return (0, _builder.default)("TSParenthesizedType", ...args);
            }

            function TSTypeOperator(...args) {
              return (0, _builder.default)("TSTypeOperator", ...args);
            }

            function TSIndexedAccessType(...args) {
              return (0, _builder.default)("TSIndexedAccessType", ...args);
            }

            function TSMappedType(...args) {
              return (0, _builder.default)("TSMappedType", ...args);
            }

            function TSLiteralType(...args) {
              return (0, _builder.default)("TSLiteralType", ...args);
            }

            function TSExpressionWithTypeArguments(...args) {
              return (0, _builder.default)("TSExpressionWithTypeArguments", ...args);
            }

            function TSInterfaceDeclaration(...args) {
              return (0, _builder.default)("TSInterfaceDeclaration", ...args);
            }

            function TSInterfaceBody(...args) {
              return (0, _builder.default)("TSInterfaceBody", ...args);
            }

            function TSTypeAliasDeclaration(...args) {
              return (0, _builder.default)("TSTypeAliasDeclaration", ...args);
            }

            function TSAsExpression(...args) {
              return (0, _builder.default)("TSAsExpression", ...args);
            }

            function TSTypeAssertion(...args) {
              return (0, _builder.default)("TSTypeAssertion", ...args);
            }

            function TSEnumDeclaration(...args) {
              return (0, _builder.default)("TSEnumDeclaration", ...args);
            }

            function TSEnumMember(...args) {
              return (0, _builder.default)("TSEnumMember", ...args);
            }

            function TSModuleDeclaration(...args) {
              return (0, _builder.default)("TSModuleDeclaration", ...args);
            }

            function TSModuleBlock(...args) {
              return (0, _builder.default)("TSModuleBlock", ...args);
            }

            function TSImportType(...args) {
              return (0, _builder.default)("TSImportType", ...args);
            }

            function TSImportEqualsDeclaration(...args) {
              return (0, _builder.default)("TSImportEqualsDeclaration", ...args);
            }

            function TSExternalModuleReference(...args) {
              return (0, _builder.default)("TSExternalModuleReference", ...args);
            }

            function TSNonNullExpression(...args) {
              return (0, _builder.default)("TSNonNullExpression", ...args);
            }

            function TSExportAssignment(...args) {
              return (0, _builder.default)("TSExportAssignment", ...args);
            }

            function TSNamespaceExportDeclaration(...args) {
              return (0, _builder.default)("TSNamespaceExportDeclaration", ...args);
            }

            function TSTypeAnnotation(...args) {
              return (0, _builder.default)("TSTypeAnnotation", ...args);
            }

            function TSTypeParameterInstantiation(...args) {
              return (0, _builder.default)("TSTypeParameterInstantiation", ...args);
            }

            function TSTypeParameterDeclaration(...args) {
              return (0, _builder.default)("TSTypeParameterDeclaration", ...args);
            }

            function TSTypeParameter(...args) {
              return (0, _builder.default)("TSTypeParameter", ...args);
            }

            function NumberLiteral(...args) {
              console.trace("The node type NumberLiteral has been renamed to NumericLiteral");
              return NumberLiteral("NumberLiteral", ...args);
            }

            function RegexLiteral(...args) {
              console.trace("The node type RegexLiteral has been renamed to RegExpLiteral");
              return RegexLiteral("RegexLiteral", ...args);
            }

            function RestProperty(...args) {
              console.trace("The node type RestProperty has been renamed to RestElement");
              return RestProperty("RestProperty", ...args);
            }

            function SpreadProperty(...args) {
              console.trace("The node type SpreadProperty has been renamed to SpreadElement");
              return SpreadProperty("SpreadProperty", ...args);
            }
            });

            unwrapExports(generated$1);
            var generated_1$1 = generated$1.arrayExpression;
            var generated_2$1 = generated$1.ArrayExpression;
            var generated_3$1 = generated$1.assignmentExpression;
            var generated_4$1 = generated$1.AssignmentExpression;
            var generated_5$1 = generated$1.binaryExpression;
            var generated_6$1 = generated$1.BinaryExpression;
            var generated_7$1 = generated$1.interpreterDirective;
            var generated_8$1 = generated$1.InterpreterDirective;
            var generated_9$1 = generated$1.directive;
            var generated_10$1 = generated$1.Directive;
            var generated_11$1 = generated$1.directiveLiteral;
            var generated_12$1 = generated$1.DirectiveLiteral;
            var generated_13$1 = generated$1.blockStatement;
            var generated_14$1 = generated$1.BlockStatement;
            var generated_15$1 = generated$1.breakStatement;
            var generated_16$1 = generated$1.BreakStatement;
            var generated_17$1 = generated$1.callExpression;
            var generated_18$1 = generated$1.CallExpression;
            var generated_19$1 = generated$1.catchClause;
            var generated_20$1 = generated$1.CatchClause;
            var generated_21$1 = generated$1.conditionalExpression;
            var generated_22$1 = generated$1.ConditionalExpression;
            var generated_23$1 = generated$1.continueStatement;
            var generated_24$1 = generated$1.ContinueStatement;
            var generated_25$1 = generated$1.debuggerStatement;
            var generated_26$1 = generated$1.DebuggerStatement;
            var generated_27$1 = generated$1.doWhileStatement;
            var generated_28$1 = generated$1.DoWhileStatement;
            var generated_29$1 = generated$1.emptyStatement;
            var generated_30$1 = generated$1.EmptyStatement;
            var generated_31$1 = generated$1.expressionStatement;
            var generated_32$1 = generated$1.ExpressionStatement;
            var generated_33$1 = generated$1.file;
            var generated_34$1 = generated$1.File;
            var generated_35$1 = generated$1.forInStatement;
            var generated_36$1 = generated$1.ForInStatement;
            var generated_37$1 = generated$1.forStatement;
            var generated_38$1 = generated$1.ForStatement;
            var generated_39$1 = generated$1.functionDeclaration;
            var generated_40$1 = generated$1.FunctionDeclaration;
            var generated_41$1 = generated$1.functionExpression;
            var generated_42$1 = generated$1.FunctionExpression;
            var generated_43$1 = generated$1.identifier;
            var generated_44$1 = generated$1.Identifier;
            var generated_45$1 = generated$1.ifStatement;
            var generated_46$1 = generated$1.IfStatement;
            var generated_47$1 = generated$1.labeledStatement;
            var generated_48$1 = generated$1.LabeledStatement;
            var generated_49$1 = generated$1.stringLiteral;
            var generated_50$1 = generated$1.StringLiteral;
            var generated_51$1 = generated$1.numericLiteral;
            var generated_52$1 = generated$1.NumericLiteral;
            var generated_53$1 = generated$1.nullLiteral;
            var generated_54$1 = generated$1.NullLiteral;
            var generated_55$1 = generated$1.booleanLiteral;
            var generated_56$1 = generated$1.BooleanLiteral;
            var generated_57$1 = generated$1.regExpLiteral;
            var generated_58$1 = generated$1.RegExpLiteral;
            var generated_59$1 = generated$1.logicalExpression;
            var generated_60$1 = generated$1.LogicalExpression;
            var generated_61$1 = generated$1.memberExpression;
            var generated_62$1 = generated$1.MemberExpression;
            var generated_63$1 = generated$1.newExpression;
            var generated_64$1 = generated$1.NewExpression;
            var generated_65$1 = generated$1.program;
            var generated_66$1 = generated$1.Program;
            var generated_67$1 = generated$1.objectExpression;
            var generated_68$1 = generated$1.ObjectExpression;
            var generated_69$1 = generated$1.objectMethod;
            var generated_70$1 = generated$1.ObjectMethod;
            var generated_71$1 = generated$1.objectProperty;
            var generated_72$1 = generated$1.ObjectProperty;
            var generated_73$1 = generated$1.restElement;
            var generated_74$1 = generated$1.RestElement;
            var generated_75$1 = generated$1.returnStatement;
            var generated_76$1 = generated$1.ReturnStatement;
            var generated_77$1 = generated$1.sequenceExpression;
            var generated_78$1 = generated$1.SequenceExpression;
            var generated_79$1 = generated$1.switchCase;
            var generated_80$1 = generated$1.SwitchCase;
            var generated_81$1 = generated$1.switchStatement;
            var generated_82$1 = generated$1.SwitchStatement;
            var generated_83$1 = generated$1.thisExpression;
            var generated_84$1 = generated$1.ThisExpression;
            var generated_85$1 = generated$1.throwStatement;
            var generated_86$1 = generated$1.ThrowStatement;
            var generated_87$1 = generated$1.tryStatement;
            var generated_88$1 = generated$1.TryStatement;
            var generated_89$1 = generated$1.unaryExpression;
            var generated_90$1 = generated$1.UnaryExpression;
            var generated_91$1 = generated$1.updateExpression;
            var generated_92$1 = generated$1.UpdateExpression;
            var generated_93$1 = generated$1.variableDeclaration;
            var generated_94$1 = generated$1.VariableDeclaration;
            var generated_95$1 = generated$1.variableDeclarator;
            var generated_96$1 = generated$1.VariableDeclarator;
            var generated_97$1 = generated$1.whileStatement;
            var generated_98$1 = generated$1.WhileStatement;
            var generated_99$1 = generated$1.withStatement;
            var generated_100$1 = generated$1.WithStatement;
            var generated_101$1 = generated$1.assignmentPattern;
            var generated_102$1 = generated$1.AssignmentPattern;
            var generated_103$1 = generated$1.arrayPattern;
            var generated_104$1 = generated$1.ArrayPattern;
            var generated_105$1 = generated$1.arrowFunctionExpression;
            var generated_106$1 = generated$1.ArrowFunctionExpression;
            var generated_107$1 = generated$1.classBody;
            var generated_108$1 = generated$1.ClassBody;
            var generated_109$1 = generated$1.classDeclaration;
            var generated_110$1 = generated$1.ClassDeclaration;
            var generated_111$1 = generated$1.classExpression;
            var generated_112$1 = generated$1.ClassExpression;
            var generated_113$1 = generated$1.exportAllDeclaration;
            var generated_114$1 = generated$1.ExportAllDeclaration;
            var generated_115$1 = generated$1.exportDefaultDeclaration;
            var generated_116$1 = generated$1.ExportDefaultDeclaration;
            var generated_117$1 = generated$1.exportNamedDeclaration;
            var generated_118$1 = generated$1.ExportNamedDeclaration;
            var generated_119$1 = generated$1.exportSpecifier;
            var generated_120$1 = generated$1.ExportSpecifier;
            var generated_121$1 = generated$1.forOfStatement;
            var generated_122$1 = generated$1.ForOfStatement;
            var generated_123$1 = generated$1.importDeclaration;
            var generated_124$1 = generated$1.ImportDeclaration;
            var generated_125$1 = generated$1.importDefaultSpecifier;
            var generated_126$1 = generated$1.ImportDefaultSpecifier;
            var generated_127$1 = generated$1.importNamespaceSpecifier;
            var generated_128$1 = generated$1.ImportNamespaceSpecifier;
            var generated_129$1 = generated$1.importSpecifier;
            var generated_130$1 = generated$1.ImportSpecifier;
            var generated_131$1 = generated$1.metaProperty;
            var generated_132$1 = generated$1.MetaProperty;
            var generated_133$1 = generated$1.classMethod;
            var generated_134$1 = generated$1.ClassMethod;
            var generated_135$1 = generated$1.objectPattern;
            var generated_136$1 = generated$1.ObjectPattern;
            var generated_137$1 = generated$1.spreadElement;
            var generated_138$1 = generated$1.SpreadElement;
            var generated_139$1 = generated$1.Super;
            var generated_140$1 = generated$1.taggedTemplateExpression;
            var generated_141$1 = generated$1.TaggedTemplateExpression;
            var generated_142$1 = generated$1.templateElement;
            var generated_143$1 = generated$1.TemplateElement;
            var generated_144$1 = generated$1.templateLiteral;
            var generated_145$1 = generated$1.TemplateLiteral;
            var generated_146$1 = generated$1.yieldExpression;
            var generated_147$1 = generated$1.YieldExpression;
            var generated_148$1 = generated$1.anyTypeAnnotation;
            var generated_149$1 = generated$1.AnyTypeAnnotation;
            var generated_150$1 = generated$1.arrayTypeAnnotation;
            var generated_151$1 = generated$1.ArrayTypeAnnotation;
            var generated_152$1 = generated$1.booleanTypeAnnotation;
            var generated_153$1 = generated$1.BooleanTypeAnnotation;
            var generated_154$1 = generated$1.booleanLiteralTypeAnnotation;
            var generated_155$1 = generated$1.BooleanLiteralTypeAnnotation;
            var generated_156$1 = generated$1.nullLiteralTypeAnnotation;
            var generated_157$1 = generated$1.NullLiteralTypeAnnotation;
            var generated_158$1 = generated$1.classImplements;
            var generated_159$1 = generated$1.ClassImplements;
            var generated_160$1 = generated$1.declareClass;
            var generated_161$1 = generated$1.DeclareClass;
            var generated_162$1 = generated$1.declareFunction;
            var generated_163$1 = generated$1.DeclareFunction;
            var generated_164$1 = generated$1.declareInterface;
            var generated_165$1 = generated$1.DeclareInterface;
            var generated_166$1 = generated$1.declareModule;
            var generated_167$1 = generated$1.DeclareModule;
            var generated_168$1 = generated$1.declareModuleExports;
            var generated_169$1 = generated$1.DeclareModuleExports;
            var generated_170$1 = generated$1.declareTypeAlias;
            var generated_171$1 = generated$1.DeclareTypeAlias;
            var generated_172$1 = generated$1.declareOpaqueType;
            var generated_173$1 = generated$1.DeclareOpaqueType;
            var generated_174$1 = generated$1.declareVariable;
            var generated_175$1 = generated$1.DeclareVariable;
            var generated_176$1 = generated$1.declareExportDeclaration;
            var generated_177$1 = generated$1.DeclareExportDeclaration;
            var generated_178$1 = generated$1.declareExportAllDeclaration;
            var generated_179$1 = generated$1.DeclareExportAllDeclaration;
            var generated_180$1 = generated$1.declaredPredicate;
            var generated_181$1 = generated$1.DeclaredPredicate;
            var generated_182$1 = generated$1.existsTypeAnnotation;
            var generated_183$1 = generated$1.ExistsTypeAnnotation;
            var generated_184$1 = generated$1.functionTypeAnnotation;
            var generated_185$1 = generated$1.FunctionTypeAnnotation;
            var generated_186$1 = generated$1.functionTypeParam;
            var generated_187$1 = generated$1.FunctionTypeParam;
            var generated_188$1 = generated$1.genericTypeAnnotation;
            var generated_189$1 = generated$1.GenericTypeAnnotation;
            var generated_190$1 = generated$1.inferredPredicate;
            var generated_191$1 = generated$1.InferredPredicate;
            var generated_192$1 = generated$1.interfaceExtends;
            var generated_193$1 = generated$1.InterfaceExtends;
            var generated_194$1 = generated$1.interfaceDeclaration;
            var generated_195$1 = generated$1.InterfaceDeclaration;
            var generated_196$1 = generated$1.interfaceTypeAnnotation;
            var generated_197$1 = generated$1.InterfaceTypeAnnotation;
            var generated_198$1 = generated$1.intersectionTypeAnnotation;
            var generated_199$1 = generated$1.IntersectionTypeAnnotation;
            var generated_200$1 = generated$1.mixedTypeAnnotation;
            var generated_201$1 = generated$1.MixedTypeAnnotation;
            var generated_202$1 = generated$1.emptyTypeAnnotation;
            var generated_203$1 = generated$1.EmptyTypeAnnotation;
            var generated_204$1 = generated$1.nullableTypeAnnotation;
            var generated_205$1 = generated$1.NullableTypeAnnotation;
            var generated_206$1 = generated$1.numberLiteralTypeAnnotation;
            var generated_207$1 = generated$1.NumberLiteralTypeAnnotation;
            var generated_208$1 = generated$1.numberTypeAnnotation;
            var generated_209$1 = generated$1.NumberTypeAnnotation;
            var generated_210$1 = generated$1.objectTypeAnnotation;
            var generated_211$1 = generated$1.ObjectTypeAnnotation;
            var generated_212$1 = generated$1.objectTypeInternalSlot;
            var generated_213$1 = generated$1.ObjectTypeInternalSlot;
            var generated_214$1 = generated$1.objectTypeCallProperty;
            var generated_215$1 = generated$1.ObjectTypeCallProperty;
            var generated_216$1 = generated$1.objectTypeIndexer;
            var generated_217$1 = generated$1.ObjectTypeIndexer;
            var generated_218$1 = generated$1.objectTypeProperty;
            var generated_219$1 = generated$1.ObjectTypeProperty;
            var generated_220$1 = generated$1.objectTypeSpreadProperty;
            var generated_221$1 = generated$1.ObjectTypeSpreadProperty;
            var generated_222$1 = generated$1.opaqueType;
            var generated_223$1 = generated$1.OpaqueType;
            var generated_224$1 = generated$1.qualifiedTypeIdentifier;
            var generated_225$1 = generated$1.QualifiedTypeIdentifier;
            var generated_226$1 = generated$1.stringLiteralTypeAnnotation;
            var generated_227$1 = generated$1.StringLiteralTypeAnnotation;
            var generated_228$1 = generated$1.stringTypeAnnotation;
            var generated_229$1 = generated$1.StringTypeAnnotation;
            var generated_230$1 = generated$1.thisTypeAnnotation;
            var generated_231$1 = generated$1.ThisTypeAnnotation;
            var generated_232$1 = generated$1.tupleTypeAnnotation;
            var generated_233$1 = generated$1.TupleTypeAnnotation;
            var generated_234$1 = generated$1.typeofTypeAnnotation;
            var generated_235$1 = generated$1.TypeofTypeAnnotation;
            var generated_236$1 = generated$1.typeAlias;
            var generated_237$1 = generated$1.TypeAlias;
            var generated_238$1 = generated$1.typeAnnotation;
            var generated_239$1 = generated$1.TypeAnnotation;
            var generated_240$1 = generated$1.typeCastExpression;
            var generated_241$1 = generated$1.TypeCastExpression;
            var generated_242$1 = generated$1.typeParameter;
            var generated_243$1 = generated$1.TypeParameter;
            var generated_244$1 = generated$1.typeParameterDeclaration;
            var generated_245$1 = generated$1.TypeParameterDeclaration;
            var generated_246$1 = generated$1.typeParameterInstantiation;
            var generated_247$1 = generated$1.TypeParameterInstantiation;
            var generated_248$1 = generated$1.unionTypeAnnotation;
            var generated_249$1 = generated$1.UnionTypeAnnotation;
            var generated_250$1 = generated$1.variance;
            var generated_251$1 = generated$1.Variance;
            var generated_252$1 = generated$1.voidTypeAnnotation;
            var generated_253$1 = generated$1.VoidTypeAnnotation;
            var generated_254$1 = generated$1.jSXAttribute;
            var generated_255$1 = generated$1.jsxAttribute;
            var generated_256$1 = generated$1.JSXAttribute;
            var generated_257$1 = generated$1.jSXClosingElement;
            var generated_258$1 = generated$1.jsxClosingElement;
            var generated_259$1 = generated$1.JSXClosingElement;
            var generated_260$1 = generated$1.jSXElement;
            var generated_261$1 = generated$1.jsxElement;
            var generated_262$1 = generated$1.JSXElement;
            var generated_263$1 = generated$1.jSXEmptyExpression;
            var generated_264$1 = generated$1.jsxEmptyExpression;
            var generated_265$1 = generated$1.JSXEmptyExpression;
            var generated_266$1 = generated$1.jSXExpressionContainer;
            var generated_267$1 = generated$1.jsxExpressionContainer;
            var generated_268 = generated$1.JSXExpressionContainer;
            var generated_269 = generated$1.jSXSpreadChild;
            var generated_270 = generated$1.jsxSpreadChild;
            var generated_271 = generated$1.JSXSpreadChild;
            var generated_272 = generated$1.jSXIdentifier;
            var generated_273 = generated$1.jsxIdentifier;
            var generated_274 = generated$1.JSXIdentifier;
            var generated_275 = generated$1.jSXMemberExpression;
            var generated_276 = generated$1.jsxMemberExpression;
            var generated_277 = generated$1.JSXMemberExpression;
            var generated_278 = generated$1.jSXNamespacedName;
            var generated_279 = generated$1.jsxNamespacedName;
            var generated_280 = generated$1.JSXNamespacedName;
            var generated_281 = generated$1.jSXOpeningElement;
            var generated_282 = generated$1.jsxOpeningElement;
            var generated_283 = generated$1.JSXOpeningElement;
            var generated_284 = generated$1.jSXSpreadAttribute;
            var generated_285 = generated$1.jsxSpreadAttribute;
            var generated_286 = generated$1.JSXSpreadAttribute;
            var generated_287 = generated$1.jSXText;
            var generated_288 = generated$1.jsxText;
            var generated_289 = generated$1.JSXText;
            var generated_290 = generated$1.jSXFragment;
            var generated_291 = generated$1.jsxFragment;
            var generated_292 = generated$1.JSXFragment;
            var generated_293 = generated$1.jSXOpeningFragment;
            var generated_294 = generated$1.jsxOpeningFragment;
            var generated_295 = generated$1.JSXOpeningFragment;
            var generated_296 = generated$1.jSXClosingFragment;
            var generated_297 = generated$1.jsxClosingFragment;
            var generated_298 = generated$1.JSXClosingFragment;
            var generated_299 = generated$1.noop;
            var generated_300 = generated$1.Noop;
            var generated_301 = generated$1.parenthesizedExpression;
            var generated_302 = generated$1.ParenthesizedExpression;
            var generated_303 = generated$1.awaitExpression;
            var generated_304 = generated$1.AwaitExpression;
            var generated_305 = generated$1.bindExpression;
            var generated_306 = generated$1.BindExpression;
            var generated_307 = generated$1.classProperty;
            var generated_308 = generated$1.ClassProperty;
            var generated_309 = generated$1.optionalMemberExpression;
            var generated_310 = generated$1.OptionalMemberExpression;
            var generated_311 = generated$1.pipelineTopicExpression;
            var generated_312 = generated$1.PipelineTopicExpression;
            var generated_313 = generated$1.pipelineBareFunction;
            var generated_314 = generated$1.PipelineBareFunction;
            var generated_315 = generated$1.pipelinePrimaryTopicReference;
            var generated_316 = generated$1.PipelinePrimaryTopicReference;
            var generated_317 = generated$1.optionalCallExpression;
            var generated_318 = generated$1.OptionalCallExpression;
            var generated_319 = generated$1.classPrivateProperty;
            var generated_320 = generated$1.ClassPrivateProperty;
            var generated_321 = generated$1.classPrivateMethod;
            var generated_322 = generated$1.ClassPrivateMethod;
            var generated_323 = generated$1.Import;
            var generated_324 = generated$1.decorator;
            var generated_325 = generated$1.Decorator;
            var generated_326 = generated$1.doExpression;
            var generated_327 = generated$1.DoExpression;
            var generated_328 = generated$1.exportDefaultSpecifier;
            var generated_329 = generated$1.ExportDefaultSpecifier;
            var generated_330 = generated$1.exportNamespaceSpecifier;
            var generated_331 = generated$1.ExportNamespaceSpecifier;
            var generated_332 = generated$1.privateName;
            var generated_333 = generated$1.PrivateName;
            var generated_334 = generated$1.bigIntLiteral;
            var generated_335 = generated$1.BigIntLiteral;
            var generated_336 = generated$1.tSParameterProperty;
            var generated_337 = generated$1.tsParameterProperty;
            var generated_338 = generated$1.TSParameterProperty;
            var generated_339 = generated$1.tSDeclareFunction;
            var generated_340 = generated$1.tsDeclareFunction;
            var generated_341 = generated$1.TSDeclareFunction;
            var generated_342 = generated$1.tSDeclareMethod;
            var generated_343 = generated$1.tsDeclareMethod;
            var generated_344 = generated$1.TSDeclareMethod;
            var generated_345 = generated$1.tSQualifiedName;
            var generated_346 = generated$1.tsQualifiedName;
            var generated_347 = generated$1.TSQualifiedName;
            var generated_348 = generated$1.tSCallSignatureDeclaration;
            var generated_349 = generated$1.tsCallSignatureDeclaration;
            var generated_350 = generated$1.TSCallSignatureDeclaration;
            var generated_351 = generated$1.tSConstructSignatureDeclaration;
            var generated_352 = generated$1.tsConstructSignatureDeclaration;
            var generated_353 = generated$1.TSConstructSignatureDeclaration;
            var generated_354 = generated$1.tSPropertySignature;
            var generated_355 = generated$1.tsPropertySignature;
            var generated_356 = generated$1.TSPropertySignature;
            var generated_357 = generated$1.tSMethodSignature;
            var generated_358 = generated$1.tsMethodSignature;
            var generated_359 = generated$1.TSMethodSignature;
            var generated_360 = generated$1.tSIndexSignature;
            var generated_361 = generated$1.tsIndexSignature;
            var generated_362 = generated$1.TSIndexSignature;
            var generated_363 = generated$1.tSAnyKeyword;
            var generated_364 = generated$1.tsAnyKeyword;
            var generated_365 = generated$1.TSAnyKeyword;
            var generated_366 = generated$1.tSUnknownKeyword;
            var generated_367 = generated$1.tsUnknownKeyword;
            var generated_368 = generated$1.TSUnknownKeyword;
            var generated_369 = generated$1.tSNumberKeyword;
            var generated_370 = generated$1.tsNumberKeyword;
            var generated_371 = generated$1.TSNumberKeyword;
            var generated_372 = generated$1.tSObjectKeyword;
            var generated_373 = generated$1.tsObjectKeyword;
            var generated_374 = generated$1.TSObjectKeyword;
            var generated_375 = generated$1.tSBooleanKeyword;
            var generated_376 = generated$1.tsBooleanKeyword;
            var generated_377 = generated$1.TSBooleanKeyword;
            var generated_378 = generated$1.tSStringKeyword;
            var generated_379 = generated$1.tsStringKeyword;
            var generated_380 = generated$1.TSStringKeyword;
            var generated_381 = generated$1.tSSymbolKeyword;
            var generated_382 = generated$1.tsSymbolKeyword;
            var generated_383 = generated$1.TSSymbolKeyword;
            var generated_384 = generated$1.tSVoidKeyword;
            var generated_385 = generated$1.tsVoidKeyword;
            var generated_386 = generated$1.TSVoidKeyword;
            var generated_387 = generated$1.tSUndefinedKeyword;
            var generated_388 = generated$1.tsUndefinedKeyword;
            var generated_389 = generated$1.TSUndefinedKeyword;
            var generated_390 = generated$1.tSNullKeyword;
            var generated_391 = generated$1.tsNullKeyword;
            var generated_392 = generated$1.TSNullKeyword;
            var generated_393 = generated$1.tSNeverKeyword;
            var generated_394 = generated$1.tsNeverKeyword;
            var generated_395 = generated$1.TSNeverKeyword;
            var generated_396 = generated$1.tSThisType;
            var generated_397 = generated$1.tsThisType;
            var generated_398 = generated$1.TSThisType;
            var generated_399 = generated$1.tSFunctionType;
            var generated_400 = generated$1.tsFunctionType;
            var generated_401 = generated$1.TSFunctionType;
            var generated_402 = generated$1.tSConstructorType;
            var generated_403 = generated$1.tsConstructorType;
            var generated_404 = generated$1.TSConstructorType;
            var generated_405 = generated$1.tSTypeReference;
            var generated_406 = generated$1.tsTypeReference;
            var generated_407 = generated$1.TSTypeReference;
            var generated_408 = generated$1.tSTypePredicate;
            var generated_409 = generated$1.tsTypePredicate;
            var generated_410 = generated$1.TSTypePredicate;
            var generated_411 = generated$1.tSTypeQuery;
            var generated_412 = generated$1.tsTypeQuery;
            var generated_413 = generated$1.TSTypeQuery;
            var generated_414 = generated$1.tSTypeLiteral;
            var generated_415 = generated$1.tsTypeLiteral;
            var generated_416 = generated$1.TSTypeLiteral;
            var generated_417 = generated$1.tSArrayType;
            var generated_418 = generated$1.tsArrayType;
            var generated_419 = generated$1.TSArrayType;
            var generated_420 = generated$1.tSTupleType;
            var generated_421 = generated$1.tsTupleType;
            var generated_422 = generated$1.TSTupleType;
            var generated_423 = generated$1.tSOptionalType;
            var generated_424 = generated$1.tsOptionalType;
            var generated_425 = generated$1.TSOptionalType;
            var generated_426 = generated$1.tSRestType;
            var generated_427 = generated$1.tsRestType;
            var generated_428 = generated$1.TSRestType;
            var generated_429 = generated$1.tSUnionType;
            var generated_430 = generated$1.tsUnionType;
            var generated_431 = generated$1.TSUnionType;
            var generated_432 = generated$1.tSIntersectionType;
            var generated_433 = generated$1.tsIntersectionType;
            var generated_434 = generated$1.TSIntersectionType;
            var generated_435 = generated$1.tSConditionalType;
            var generated_436 = generated$1.tsConditionalType;
            var generated_437 = generated$1.TSConditionalType;
            var generated_438 = generated$1.tSInferType;
            var generated_439 = generated$1.tsInferType;
            var generated_440 = generated$1.TSInferType;
            var generated_441 = generated$1.tSParenthesizedType;
            var generated_442 = generated$1.tsParenthesizedType;
            var generated_443 = generated$1.TSParenthesizedType;
            var generated_444 = generated$1.tSTypeOperator;
            var generated_445 = generated$1.tsTypeOperator;
            var generated_446 = generated$1.TSTypeOperator;
            var generated_447 = generated$1.tSIndexedAccessType;
            var generated_448 = generated$1.tsIndexedAccessType;
            var generated_449 = generated$1.TSIndexedAccessType;
            var generated_450 = generated$1.tSMappedType;
            var generated_451 = generated$1.tsMappedType;
            var generated_452 = generated$1.TSMappedType;
            var generated_453 = generated$1.tSLiteralType;
            var generated_454 = generated$1.tsLiteralType;
            var generated_455 = generated$1.TSLiteralType;
            var generated_456 = generated$1.tSExpressionWithTypeArguments;
            var generated_457 = generated$1.tsExpressionWithTypeArguments;
            var generated_458 = generated$1.TSExpressionWithTypeArguments;
            var generated_459 = generated$1.tSInterfaceDeclaration;
            var generated_460 = generated$1.tsInterfaceDeclaration;
            var generated_461 = generated$1.TSInterfaceDeclaration;
            var generated_462 = generated$1.tSInterfaceBody;
            var generated_463 = generated$1.tsInterfaceBody;
            var generated_464 = generated$1.TSInterfaceBody;
            var generated_465 = generated$1.tSTypeAliasDeclaration;
            var generated_466 = generated$1.tsTypeAliasDeclaration;
            var generated_467 = generated$1.TSTypeAliasDeclaration;
            var generated_468 = generated$1.tSAsExpression;
            var generated_469 = generated$1.tsAsExpression;
            var generated_470 = generated$1.TSAsExpression;
            var generated_471 = generated$1.tSTypeAssertion;
            var generated_472 = generated$1.tsTypeAssertion;
            var generated_473 = generated$1.TSTypeAssertion;
            var generated_474 = generated$1.tSEnumDeclaration;
            var generated_475 = generated$1.tsEnumDeclaration;
            var generated_476 = generated$1.TSEnumDeclaration;
            var generated_477 = generated$1.tSEnumMember;
            var generated_478 = generated$1.tsEnumMember;
            var generated_479 = generated$1.TSEnumMember;
            var generated_480 = generated$1.tSModuleDeclaration;
            var generated_481 = generated$1.tsModuleDeclaration;
            var generated_482 = generated$1.TSModuleDeclaration;
            var generated_483 = generated$1.tSModuleBlock;
            var generated_484 = generated$1.tsModuleBlock;
            var generated_485 = generated$1.TSModuleBlock;
            var generated_486 = generated$1.tSImportType;
            var generated_487 = generated$1.tsImportType;
            var generated_488 = generated$1.TSImportType;
            var generated_489 = generated$1.tSImportEqualsDeclaration;
            var generated_490 = generated$1.tsImportEqualsDeclaration;
            var generated_491 = generated$1.TSImportEqualsDeclaration;
            var generated_492 = generated$1.tSExternalModuleReference;
            var generated_493 = generated$1.tsExternalModuleReference;
            var generated_494 = generated$1.TSExternalModuleReference;
            var generated_495 = generated$1.tSNonNullExpression;
            var generated_496 = generated$1.tsNonNullExpression;
            var generated_497 = generated$1.TSNonNullExpression;
            var generated_498 = generated$1.tSExportAssignment;
            var generated_499 = generated$1.tsExportAssignment;
            var generated_500 = generated$1.TSExportAssignment;
            var generated_501 = generated$1.tSNamespaceExportDeclaration;
            var generated_502 = generated$1.tsNamespaceExportDeclaration;
            var generated_503 = generated$1.TSNamespaceExportDeclaration;
            var generated_504 = generated$1.tSTypeAnnotation;
            var generated_505 = generated$1.tsTypeAnnotation;
            var generated_506 = generated$1.TSTypeAnnotation;
            var generated_507 = generated$1.tSTypeParameterInstantiation;
            var generated_508 = generated$1.tsTypeParameterInstantiation;
            var generated_509 = generated$1.TSTypeParameterInstantiation;
            var generated_510 = generated$1.tSTypeParameterDeclaration;
            var generated_511 = generated$1.tsTypeParameterDeclaration;
            var generated_512 = generated$1.TSTypeParameterDeclaration;
            var generated_513 = generated$1.tSTypeParameter;
            var generated_514 = generated$1.tsTypeParameter;
            var generated_515 = generated$1.TSTypeParameter;
            var generated_516 = generated$1.numberLiteral;
            var generated_517 = generated$1.NumberLiteral;
            var generated_518 = generated$1.regexLiteral;
            var generated_519 = generated$1.RegexLiteral;
            var generated_520 = generated$1.restProperty;
            var generated_521 = generated$1.RestProperty;
            var generated_522 = generated$1.spreadProperty;
            var generated_523 = generated$1.SpreadProperty;

            var cleanJSXElementLiteralChild_1 = createCommonjsModule(function (module, exports) {

            Object.defineProperty(exports, "__esModule", {
              value: true
            });
            exports.default = cleanJSXElementLiteralChild;



            function cleanJSXElementLiteralChild(child, args) {
              const lines = child.value.split(/\r\n|\n|\r/);
              let lastNonEmptyLine = 0;

              for (let i = 0; i < lines.length; i++) {
                if (lines[i].match(/[^ \t]/)) {
                  lastNonEmptyLine = i;
                }
              }

              let str = "";

              for (let i = 0; i < lines.length; i++) {
                const line = lines[i];
                const isFirstLine = i === 0;
                const isLastLine = i === lines.length - 1;
                const isLastNonEmptyLine = i === lastNonEmptyLine;
                let trimmedLine = line.replace(/\t/g, " ");

                if (!isFirstLine) {
                  trimmedLine = trimmedLine.replace(/^[ ]+/, "");
                }

                if (!isLastLine) {
                  trimmedLine = trimmedLine.replace(/[ ]+$/, "");
                }

                if (trimmedLine) {
                  if (!isLastNonEmptyLine) {
                    trimmedLine += " ";
                  }

                  str += trimmedLine;
                }
              }

              if (str) args.push((0, generated$1.stringLiteral)(str));
            }
            });

            unwrapExports(cleanJSXElementLiteralChild_1);

            var buildChildren_1 = createCommonjsModule(function (module, exports) {

            Object.defineProperty(exports, "__esModule", {
              value: true
            });
            exports.default = buildChildren;



            var _cleanJSXElementLiteralChild = _interopRequireDefault(cleanJSXElementLiteralChild_1);

            function _interopRequireDefault(obj) {
              return obj && obj.__esModule ? obj : {
                default: obj
              };
            }

            function buildChildren(node) {
              const elements = [];

              for (let i = 0; i < node.children.length; i++) {
                let child = node.children[i];

                if ((0, generated.isJSXText)(child)) {
                  (0, _cleanJSXElementLiteralChild.default)(child, elements);
                  continue;
                }

                if ((0, generated.isJSXExpressionContainer)(child)) child = child.expression;
                if ((0, generated.isJSXEmptyExpression)(child)) continue;
                elements.push(child);
              }

              return elements;
            }
            });

            unwrapExports(buildChildren_1);

            var isNode_1 = createCommonjsModule(function (module, exports) {

            Object.defineProperty(exports, "__esModule", {
              value: true
            });
            exports.default = isNode;



            function isNode(node) {
              return !!(node && definitions.VISITOR_KEYS[node.type]);
            }
            });

            unwrapExports(isNode_1);

            var assertNode_1 = createCommonjsModule(function (module, exports) {

            Object.defineProperty(exports, "__esModule", {
              value: true
            });
            exports.default = assertNode;

            var _isNode = _interopRequireDefault(isNode_1);

            function _interopRequireDefault(obj) {
              return obj && obj.__esModule ? obj : {
                default: obj
              };
            }

            function assertNode(node) {
              if (!(0, _isNode.default)(node)) {
                const type = node && node.type || JSON.stringify(node);
                throw new TypeError(`Not a valid node of type "${type}"`);
              }
            }
            });

            unwrapExports(assertNode_1);

            var generated$2 = createCommonjsModule(function (module, exports) {

            Object.defineProperty(exports, "__esModule", {
              value: true
            });
            exports.assertArrayExpression = assertArrayExpression;
            exports.assertAssignmentExpression = assertAssignmentExpression;
            exports.assertBinaryExpression = assertBinaryExpression;
            exports.assertInterpreterDirective = assertInterpreterDirective;
            exports.assertDirective = assertDirective;
            exports.assertDirectiveLiteral = assertDirectiveLiteral;
            exports.assertBlockStatement = assertBlockStatement;
            exports.assertBreakStatement = assertBreakStatement;
            exports.assertCallExpression = assertCallExpression;
            exports.assertCatchClause = assertCatchClause;
            exports.assertConditionalExpression = assertConditionalExpression;
            exports.assertContinueStatement = assertContinueStatement;
            exports.assertDebuggerStatement = assertDebuggerStatement;
            exports.assertDoWhileStatement = assertDoWhileStatement;
            exports.assertEmptyStatement = assertEmptyStatement;
            exports.assertExpressionStatement = assertExpressionStatement;
            exports.assertFile = assertFile;
            exports.assertForInStatement = assertForInStatement;
            exports.assertForStatement = assertForStatement;
            exports.assertFunctionDeclaration = assertFunctionDeclaration;
            exports.assertFunctionExpression = assertFunctionExpression;
            exports.assertIdentifier = assertIdentifier;
            exports.assertIfStatement = assertIfStatement;
            exports.assertLabeledStatement = assertLabeledStatement;
            exports.assertStringLiteral = assertStringLiteral;
            exports.assertNumericLiteral = assertNumericLiteral;
            exports.assertNullLiteral = assertNullLiteral;
            exports.assertBooleanLiteral = assertBooleanLiteral;
            exports.assertRegExpLiteral = assertRegExpLiteral;
            exports.assertLogicalExpression = assertLogicalExpression;
            exports.assertMemberExpression = assertMemberExpression;
            exports.assertNewExpression = assertNewExpression;
            exports.assertProgram = assertProgram;
            exports.assertObjectExpression = assertObjectExpression;
            exports.assertObjectMethod = assertObjectMethod;
            exports.assertObjectProperty = assertObjectProperty;
            exports.assertRestElement = assertRestElement;
            exports.assertReturnStatement = assertReturnStatement;
            exports.assertSequenceExpression = assertSequenceExpression;
            exports.assertSwitchCase = assertSwitchCase;
            exports.assertSwitchStatement = assertSwitchStatement;
            exports.assertThisExpression = assertThisExpression;
            exports.assertThrowStatement = assertThrowStatement;
            exports.assertTryStatement = assertTryStatement;
            exports.assertUnaryExpression = assertUnaryExpression;
            exports.assertUpdateExpression = assertUpdateExpression;
            exports.assertVariableDeclaration = assertVariableDeclaration;
            exports.assertVariableDeclarator = assertVariableDeclarator;
            exports.assertWhileStatement = assertWhileStatement;
            exports.assertWithStatement = assertWithStatement;
            exports.assertAssignmentPattern = assertAssignmentPattern;
            exports.assertArrayPattern = assertArrayPattern;
            exports.assertArrowFunctionExpression = assertArrowFunctionExpression;
            exports.assertClassBody = assertClassBody;
            exports.assertClassDeclaration = assertClassDeclaration;
            exports.assertClassExpression = assertClassExpression;
            exports.assertExportAllDeclaration = assertExportAllDeclaration;
            exports.assertExportDefaultDeclaration = assertExportDefaultDeclaration;
            exports.assertExportNamedDeclaration = assertExportNamedDeclaration;
            exports.assertExportSpecifier = assertExportSpecifier;
            exports.assertForOfStatement = assertForOfStatement;
            exports.assertImportDeclaration = assertImportDeclaration;
            exports.assertImportDefaultSpecifier = assertImportDefaultSpecifier;
            exports.assertImportNamespaceSpecifier = assertImportNamespaceSpecifier;
            exports.assertImportSpecifier = assertImportSpecifier;
            exports.assertMetaProperty = assertMetaProperty;
            exports.assertClassMethod = assertClassMethod;
            exports.assertObjectPattern = assertObjectPattern;
            exports.assertSpreadElement = assertSpreadElement;
            exports.assertSuper = assertSuper;
            exports.assertTaggedTemplateExpression = assertTaggedTemplateExpression;
            exports.assertTemplateElement = assertTemplateElement;
            exports.assertTemplateLiteral = assertTemplateLiteral;
            exports.assertYieldExpression = assertYieldExpression;
            exports.assertAnyTypeAnnotation = assertAnyTypeAnnotation;
            exports.assertArrayTypeAnnotation = assertArrayTypeAnnotation;
            exports.assertBooleanTypeAnnotation = assertBooleanTypeAnnotation;
            exports.assertBooleanLiteralTypeAnnotation = assertBooleanLiteralTypeAnnotation;
            exports.assertNullLiteralTypeAnnotation = assertNullLiteralTypeAnnotation;
            exports.assertClassImplements = assertClassImplements;
            exports.assertDeclareClass = assertDeclareClass;
            exports.assertDeclareFunction = assertDeclareFunction;
            exports.assertDeclareInterface = assertDeclareInterface;
            exports.assertDeclareModule = assertDeclareModule;
            exports.assertDeclareModuleExports = assertDeclareModuleExports;
            exports.assertDeclareTypeAlias = assertDeclareTypeAlias;
            exports.assertDeclareOpaqueType = assertDeclareOpaqueType;
            exports.assertDeclareVariable = assertDeclareVariable;
            exports.assertDeclareExportDeclaration = assertDeclareExportDeclaration;
            exports.assertDeclareExportAllDeclaration = assertDeclareExportAllDeclaration;
            exports.assertDeclaredPredicate = assertDeclaredPredicate;
            exports.assertExistsTypeAnnotation = assertExistsTypeAnnotation;
            exports.assertFunctionTypeAnnotation = assertFunctionTypeAnnotation;
            exports.assertFunctionTypeParam = assertFunctionTypeParam;
            exports.assertGenericTypeAnnotation = assertGenericTypeAnnotation;
            exports.assertInferredPredicate = assertInferredPredicate;
            exports.assertInterfaceExtends = assertInterfaceExtends;
            exports.assertInterfaceDeclaration = assertInterfaceDeclaration;
            exports.assertInterfaceTypeAnnotation = assertInterfaceTypeAnnotation;
            exports.assertIntersectionTypeAnnotation = assertIntersectionTypeAnnotation;
            exports.assertMixedTypeAnnotation = assertMixedTypeAnnotation;
            exports.assertEmptyTypeAnnotation = assertEmptyTypeAnnotation;
            exports.assertNullableTypeAnnotation = assertNullableTypeAnnotation;
            exports.assertNumberLiteralTypeAnnotation = assertNumberLiteralTypeAnnotation;
            exports.assertNumberTypeAnnotation = assertNumberTypeAnnotation;
            exports.assertObjectTypeAnnotation = assertObjectTypeAnnotation;
            exports.assertObjectTypeInternalSlot = assertObjectTypeInternalSlot;
            exports.assertObjectTypeCallProperty = assertObjectTypeCallProperty;
            exports.assertObjectTypeIndexer = assertObjectTypeIndexer;
            exports.assertObjectTypeProperty = assertObjectTypeProperty;
            exports.assertObjectTypeSpreadProperty = assertObjectTypeSpreadProperty;
            exports.assertOpaqueType = assertOpaqueType;
            exports.assertQualifiedTypeIdentifier = assertQualifiedTypeIdentifier;
            exports.assertStringLiteralTypeAnnotation = assertStringLiteralTypeAnnotation;
            exports.assertStringTypeAnnotation = assertStringTypeAnnotation;
            exports.assertThisTypeAnnotation = assertThisTypeAnnotation;
            exports.assertTupleTypeAnnotation = assertTupleTypeAnnotation;
            exports.assertTypeofTypeAnnotation = assertTypeofTypeAnnotation;
            exports.assertTypeAlias = assertTypeAlias;
            exports.assertTypeAnnotation = assertTypeAnnotation;
            exports.assertTypeCastExpression = assertTypeCastExpression;
            exports.assertTypeParameter = assertTypeParameter;
            exports.assertTypeParameterDeclaration = assertTypeParameterDeclaration;
            exports.assertTypeParameterInstantiation = assertTypeParameterInstantiation;
            exports.assertUnionTypeAnnotation = assertUnionTypeAnnotation;
            exports.assertVariance = assertVariance;
            exports.assertVoidTypeAnnotation = assertVoidTypeAnnotation;
            exports.assertJSXAttribute = assertJSXAttribute;
            exports.assertJSXClosingElement = assertJSXClosingElement;
            exports.assertJSXElement = assertJSXElement;
            exports.assertJSXEmptyExpression = assertJSXEmptyExpression;
            exports.assertJSXExpressionContainer = assertJSXExpressionContainer;
            exports.assertJSXSpreadChild = assertJSXSpreadChild;
            exports.assertJSXIdentifier = assertJSXIdentifier;
            exports.assertJSXMemberExpression = assertJSXMemberExpression;
            exports.assertJSXNamespacedName = assertJSXNamespacedName;
            exports.assertJSXOpeningElement = assertJSXOpeningElement;
            exports.assertJSXSpreadAttribute = assertJSXSpreadAttribute;
            exports.assertJSXText = assertJSXText;
            exports.assertJSXFragment = assertJSXFragment;
            exports.assertJSXOpeningFragment = assertJSXOpeningFragment;
            exports.assertJSXClosingFragment = assertJSXClosingFragment;
            exports.assertNoop = assertNoop;
            exports.assertParenthesizedExpression = assertParenthesizedExpression;
            exports.assertAwaitExpression = assertAwaitExpression;
            exports.assertBindExpression = assertBindExpression;
            exports.assertClassProperty = assertClassProperty;
            exports.assertOptionalMemberExpression = assertOptionalMemberExpression;
            exports.assertPipelineTopicExpression = assertPipelineTopicExpression;
            exports.assertPipelineBareFunction = assertPipelineBareFunction;
            exports.assertPipelinePrimaryTopicReference = assertPipelinePrimaryTopicReference;
            exports.assertOptionalCallExpression = assertOptionalCallExpression;
            exports.assertClassPrivateProperty = assertClassPrivateProperty;
            exports.assertClassPrivateMethod = assertClassPrivateMethod;
            exports.assertImport = assertImport;
            exports.assertDecorator = assertDecorator;
            exports.assertDoExpression = assertDoExpression;
            exports.assertExportDefaultSpecifier = assertExportDefaultSpecifier;
            exports.assertExportNamespaceSpecifier = assertExportNamespaceSpecifier;
            exports.assertPrivateName = assertPrivateName;
            exports.assertBigIntLiteral = assertBigIntLiteral;
            exports.assertTSParameterProperty = assertTSParameterProperty;
            exports.assertTSDeclareFunction = assertTSDeclareFunction;
            exports.assertTSDeclareMethod = assertTSDeclareMethod;
            exports.assertTSQualifiedName = assertTSQualifiedName;
            exports.assertTSCallSignatureDeclaration = assertTSCallSignatureDeclaration;
            exports.assertTSConstructSignatureDeclaration = assertTSConstructSignatureDeclaration;
            exports.assertTSPropertySignature = assertTSPropertySignature;
            exports.assertTSMethodSignature = assertTSMethodSignature;
            exports.assertTSIndexSignature = assertTSIndexSignature;
            exports.assertTSAnyKeyword = assertTSAnyKeyword;
            exports.assertTSUnknownKeyword = assertTSUnknownKeyword;
            exports.assertTSNumberKeyword = assertTSNumberKeyword;
            exports.assertTSObjectKeyword = assertTSObjectKeyword;
            exports.assertTSBooleanKeyword = assertTSBooleanKeyword;
            exports.assertTSStringKeyword = assertTSStringKeyword;
            exports.assertTSSymbolKeyword = assertTSSymbolKeyword;
            exports.assertTSVoidKeyword = assertTSVoidKeyword;
            exports.assertTSUndefinedKeyword = assertTSUndefinedKeyword;
            exports.assertTSNullKeyword = assertTSNullKeyword;
            exports.assertTSNeverKeyword = assertTSNeverKeyword;
            exports.assertTSThisType = assertTSThisType;
            exports.assertTSFunctionType = assertTSFunctionType;
            exports.assertTSConstructorType = assertTSConstructorType;
            exports.assertTSTypeReference = assertTSTypeReference;
            exports.assertTSTypePredicate = assertTSTypePredicate;
            exports.assertTSTypeQuery = assertTSTypeQuery;
            exports.assertTSTypeLiteral = assertTSTypeLiteral;
            exports.assertTSArrayType = assertTSArrayType;
            exports.assertTSTupleType = assertTSTupleType;
            exports.assertTSOptionalType = assertTSOptionalType;
            exports.assertTSRestType = assertTSRestType;
            exports.assertTSUnionType = assertTSUnionType;
            exports.assertTSIntersectionType = assertTSIntersectionType;
            exports.assertTSConditionalType = assertTSConditionalType;
            exports.assertTSInferType = assertTSInferType;
            exports.assertTSParenthesizedType = assertTSParenthesizedType;
            exports.assertTSTypeOperator = assertTSTypeOperator;
            exports.assertTSIndexedAccessType = assertTSIndexedAccessType;
            exports.assertTSMappedType = assertTSMappedType;
            exports.assertTSLiteralType = assertTSLiteralType;
            exports.assertTSExpressionWithTypeArguments = assertTSExpressionWithTypeArguments;
            exports.assertTSInterfaceDeclaration = assertTSInterfaceDeclaration;
            exports.assertTSInterfaceBody = assertTSInterfaceBody;
            exports.assertTSTypeAliasDeclaration = assertTSTypeAliasDeclaration;
            exports.assertTSAsExpression = assertTSAsExpression;
            exports.assertTSTypeAssertion = assertTSTypeAssertion;
            exports.assertTSEnumDeclaration = assertTSEnumDeclaration;
            exports.assertTSEnumMember = assertTSEnumMember;
            exports.assertTSModuleDeclaration = assertTSModuleDeclaration;
            exports.assertTSModuleBlock = assertTSModuleBlock;
            exports.assertTSImportType = assertTSImportType;
            exports.assertTSImportEqualsDeclaration = assertTSImportEqualsDeclaration;
            exports.assertTSExternalModuleReference = assertTSExternalModuleReference;
            exports.assertTSNonNullExpression = assertTSNonNullExpression;
            exports.assertTSExportAssignment = assertTSExportAssignment;
            exports.assertTSNamespaceExportDeclaration = assertTSNamespaceExportDeclaration;
            exports.assertTSTypeAnnotation = assertTSTypeAnnotation;
            exports.assertTSTypeParameterInstantiation = assertTSTypeParameterInstantiation;
            exports.assertTSTypeParameterDeclaration = assertTSTypeParameterDeclaration;
            exports.assertTSTypeParameter = assertTSTypeParameter;
            exports.assertExpression = assertExpression;
            exports.assertBinary = assertBinary;
            exports.assertScopable = assertScopable;
            exports.assertBlockParent = assertBlockParent;
            exports.assertBlock = assertBlock;
            exports.assertStatement = assertStatement;
            exports.assertTerminatorless = assertTerminatorless;
            exports.assertCompletionStatement = assertCompletionStatement;
            exports.assertConditional = assertConditional;
            exports.assertLoop = assertLoop;
            exports.assertWhile = assertWhile;
            exports.assertExpressionWrapper = assertExpressionWrapper;
            exports.assertFor = assertFor;
            exports.assertForXStatement = assertForXStatement;
            exports.assertFunction = assertFunction;
            exports.assertFunctionParent = assertFunctionParent;
            exports.assertPureish = assertPureish;
            exports.assertDeclaration = assertDeclaration;
            exports.assertPatternLike = assertPatternLike;
            exports.assertLVal = assertLVal;
            exports.assertTSEntityName = assertTSEntityName;
            exports.assertLiteral = assertLiteral;
            exports.assertImmutable = assertImmutable;
            exports.assertUserWhitespacable = assertUserWhitespacable;
            exports.assertMethod = assertMethod;
            exports.assertObjectMember = assertObjectMember;
            exports.assertProperty = assertProperty;
            exports.assertUnaryLike = assertUnaryLike;
            exports.assertPattern = assertPattern;
            exports.assertClass = assertClass;
            exports.assertModuleDeclaration = assertModuleDeclaration;
            exports.assertExportDeclaration = assertExportDeclaration;
            exports.assertModuleSpecifier = assertModuleSpecifier;
            exports.assertFlow = assertFlow;
            exports.assertFlowType = assertFlowType;
            exports.assertFlowBaseAnnotation = assertFlowBaseAnnotation;
            exports.assertFlowDeclaration = assertFlowDeclaration;
            exports.assertFlowPredicate = assertFlowPredicate;
            exports.assertJSX = assertJSX;
            exports.assertPrivate = assertPrivate;
            exports.assertTSTypeElement = assertTSTypeElement;
            exports.assertTSType = assertTSType;
            exports.assertNumberLiteral = assertNumberLiteral;
            exports.assertRegexLiteral = assertRegexLiteral;
            exports.assertRestProperty = assertRestProperty;
            exports.assertSpreadProperty = assertSpreadProperty;

            var _is = _interopRequireDefault(is_1);

            function _interopRequireDefault(obj) {
              return obj && obj.__esModule ? obj : {
                default: obj
              };
            }

            function assert(type, node, opts) {
              if (!(0, _is.default)(type, node, opts)) {
                throw new Error(`Expected type "${type}" with option ${JSON.stringify(opts)}, but instead got "${node.type}".`);
              }
            }

            function assertArrayExpression(node, opts = {}) {
              assert("ArrayExpression", node, opts);
            }

            function assertAssignmentExpression(node, opts = {}) {
              assert("AssignmentExpression", node, opts);
            }

            function assertBinaryExpression(node, opts = {}) {
              assert("BinaryExpression", node, opts);
            }

            function assertInterpreterDirective(node, opts = {}) {
              assert("InterpreterDirective", node, opts);
            }

            function assertDirective(node, opts = {}) {
              assert("Directive", node, opts);
            }

            function assertDirectiveLiteral(node, opts = {}) {
              assert("DirectiveLiteral", node, opts);
            }

            function assertBlockStatement(node, opts = {}) {
              assert("BlockStatement", node, opts);
            }

            function assertBreakStatement(node, opts = {}) {
              assert("BreakStatement", node, opts);
            }

            function assertCallExpression(node, opts = {}) {
              assert("CallExpression", node, opts);
            }

            function assertCatchClause(node, opts = {}) {
              assert("CatchClause", node, opts);
            }

            function assertConditionalExpression(node, opts = {}) {
              assert("ConditionalExpression", node, opts);
            }

            function assertContinueStatement(node, opts = {}) {
              assert("ContinueStatement", node, opts);
            }

            function assertDebuggerStatement(node, opts = {}) {
              assert("DebuggerStatement", node, opts);
            }

            function assertDoWhileStatement(node, opts = {}) {
              assert("DoWhileStatement", node, opts);
            }

            function assertEmptyStatement(node, opts = {}) {
              assert("EmptyStatement", node, opts);
            }

            function assertExpressionStatement(node, opts = {}) {
              assert("ExpressionStatement", node, opts);
            }

            function assertFile(node, opts = {}) {
              assert("File", node, opts);
            }

            function assertForInStatement(node, opts = {}) {
              assert("ForInStatement", node, opts);
            }

            function assertForStatement(node, opts = {}) {
              assert("ForStatement", node, opts);
            }

            function assertFunctionDeclaration(node, opts = {}) {
              assert("FunctionDeclaration", node, opts);
            }

            function assertFunctionExpression(node, opts = {}) {
              assert("FunctionExpression", node, opts);
            }

            function assertIdentifier(node, opts = {}) {
              assert("Identifier", node, opts);
            }

            function assertIfStatement(node, opts = {}) {
              assert("IfStatement", node, opts);
            }

            function assertLabeledStatement(node, opts = {}) {
              assert("LabeledStatement", node, opts);
            }

            function assertStringLiteral(node, opts = {}) {
              assert("StringLiteral", node, opts);
            }

            function assertNumericLiteral(node, opts = {}) {
              assert("NumericLiteral", node, opts);
            }

            function assertNullLiteral(node, opts = {}) {
              assert("NullLiteral", node, opts);
            }

            function assertBooleanLiteral(node, opts = {}) {
              assert("BooleanLiteral", node, opts);
            }

            function assertRegExpLiteral(node, opts = {}) {
              assert("RegExpLiteral", node, opts);
            }

            function assertLogicalExpression(node, opts = {}) {
              assert("LogicalExpression", node, opts);
            }

            function assertMemberExpression(node, opts = {}) {
              assert("MemberExpression", node, opts);
            }

            function assertNewExpression(node, opts = {}) {
              assert("NewExpression", node, opts);
            }

            function assertProgram(node, opts = {}) {
              assert("Program", node, opts);
            }

            function assertObjectExpression(node, opts = {}) {
              assert("ObjectExpression", node, opts);
            }

            function assertObjectMethod(node, opts = {}) {
              assert("ObjectMethod", node, opts);
            }

            function assertObjectProperty(node, opts = {}) {
              assert("ObjectProperty", node, opts);
            }

            function assertRestElement(node, opts = {}) {
              assert("RestElement", node, opts);
            }

            function assertReturnStatement(node, opts = {}) {
              assert("ReturnStatement", node, opts);
            }

            function assertSequenceExpression(node, opts = {}) {
              assert("SequenceExpression", node, opts);
            }

            function assertSwitchCase(node, opts = {}) {
              assert("SwitchCase", node, opts);
            }

            function assertSwitchStatement(node, opts = {}) {
              assert("SwitchStatement", node, opts);
            }

            function assertThisExpression(node, opts = {}) {
              assert("ThisExpression", node, opts);
            }

            function assertThrowStatement(node, opts = {}) {
              assert("ThrowStatement", node, opts);
            }

            function assertTryStatement(node, opts = {}) {
              assert("TryStatement", node, opts);
            }

            function assertUnaryExpression(node, opts = {}) {
              assert("UnaryExpression", node, opts);
            }

            function assertUpdateExpression(node, opts = {}) {
              assert("UpdateExpression", node, opts);
            }

            function assertVariableDeclaration(node, opts = {}) {
              assert("VariableDeclaration", node, opts);
            }

            function assertVariableDeclarator(node, opts = {}) {
              assert("VariableDeclarator", node, opts);
            }

            function assertWhileStatement(node, opts = {}) {
              assert("WhileStatement", node, opts);
            }

            function assertWithStatement(node, opts = {}) {
              assert("WithStatement", node, opts);
            }

            function assertAssignmentPattern(node, opts = {}) {
              assert("AssignmentPattern", node, opts);
            }

            function assertArrayPattern(node, opts = {}) {
              assert("ArrayPattern", node, opts);
            }

            function assertArrowFunctionExpression(node, opts = {}) {
              assert("ArrowFunctionExpression", node, opts);
            }

            function assertClassBody(node, opts = {}) {
              assert("ClassBody", node, opts);
            }

            function assertClassDeclaration(node, opts = {}) {
              assert("ClassDeclaration", node, opts);
            }

            function assertClassExpression(node, opts = {}) {
              assert("ClassExpression", node, opts);
            }

            function assertExportAllDeclaration(node, opts = {}) {
              assert("ExportAllDeclaration", node, opts);
            }

            function assertExportDefaultDeclaration(node, opts = {}) {
              assert("ExportDefaultDeclaration", node, opts);
            }

            function assertExportNamedDeclaration(node, opts = {}) {
              assert("ExportNamedDeclaration", node, opts);
            }

            function assertExportSpecifier(node, opts = {}) {
              assert("ExportSpecifier", node, opts);
            }

            function assertForOfStatement(node, opts = {}) {
              assert("ForOfStatement", node, opts);
            }

            function assertImportDeclaration(node, opts = {}) {
              assert("ImportDeclaration", node, opts);
            }

            function assertImportDefaultSpecifier(node, opts = {}) {
              assert("ImportDefaultSpecifier", node, opts);
            }

            function assertImportNamespaceSpecifier(node, opts = {}) {
              assert("ImportNamespaceSpecifier", node, opts);
            }

            function assertImportSpecifier(node, opts = {}) {
              assert("ImportSpecifier", node, opts);
            }

            function assertMetaProperty(node, opts = {}) {
              assert("MetaProperty", node, opts);
            }

            function assertClassMethod(node, opts = {}) {
              assert("ClassMethod", node, opts);
            }

            function assertObjectPattern(node, opts = {}) {
              assert("ObjectPattern", node, opts);
            }

            function assertSpreadElement(node, opts = {}) {
              assert("SpreadElement", node, opts);
            }

            function assertSuper(node, opts = {}) {
              assert("Super", node, opts);
            }

            function assertTaggedTemplateExpression(node, opts = {}) {
              assert("TaggedTemplateExpression", node, opts);
            }

            function assertTemplateElement(node, opts = {}) {
              assert("TemplateElement", node, opts);
            }

            function assertTemplateLiteral(node, opts = {}) {
              assert("TemplateLiteral", node, opts);
            }

            function assertYieldExpression(node, opts = {}) {
              assert("YieldExpression", node, opts);
            }

            function assertAnyTypeAnnotation(node, opts = {}) {
              assert("AnyTypeAnnotation", node, opts);
            }

            function assertArrayTypeAnnotation(node, opts = {}) {
              assert("ArrayTypeAnnotation", node, opts);
            }

            function assertBooleanTypeAnnotation(node, opts = {}) {
              assert("BooleanTypeAnnotation", node, opts);
            }

            function assertBooleanLiteralTypeAnnotation(node, opts = {}) {
              assert("BooleanLiteralTypeAnnotation", node, opts);
            }

            function assertNullLiteralTypeAnnotation(node, opts = {}) {
              assert("NullLiteralTypeAnnotation", node, opts);
            }

            function assertClassImplements(node, opts = {}) {
              assert("ClassImplements", node, opts);
            }

            function assertDeclareClass(node, opts = {}) {
              assert("DeclareClass", node, opts);
            }

            function assertDeclareFunction(node, opts = {}) {
              assert("DeclareFunction", node, opts);
            }

            function assertDeclareInterface(node, opts = {}) {
              assert("DeclareInterface", node, opts);
            }

            function assertDeclareModule(node, opts = {}) {
              assert("DeclareModule", node, opts);
            }

            function assertDeclareModuleExports(node, opts = {}) {
              assert("DeclareModuleExports", node, opts);
            }

            function assertDeclareTypeAlias(node, opts = {}) {
              assert("DeclareTypeAlias", node, opts);
            }

            function assertDeclareOpaqueType(node, opts = {}) {
              assert("DeclareOpaqueType", node, opts);
            }

            function assertDeclareVariable(node, opts = {}) {
              assert("DeclareVariable", node, opts);
            }

            function assertDeclareExportDeclaration(node, opts = {}) {
              assert("DeclareExportDeclaration", node, opts);
            }

            function assertDeclareExportAllDeclaration(node, opts = {}) {
              assert("DeclareExportAllDeclaration", node, opts);
            }

            function assertDeclaredPredicate(node, opts = {}) {
              assert("DeclaredPredicate", node, opts);
            }

            function assertExistsTypeAnnotation(node, opts = {}) {
              assert("ExistsTypeAnnotation", node, opts);
            }

            function assertFunctionTypeAnnotation(node, opts = {}) {
              assert("FunctionTypeAnnotation", node, opts);
            }

            function assertFunctionTypeParam(node, opts = {}) {
              assert("FunctionTypeParam", node, opts);
            }

            function assertGenericTypeAnnotation(node, opts = {}) {
              assert("GenericTypeAnnotation", node, opts);
            }

            function assertInferredPredicate(node, opts = {}) {
              assert("InferredPredicate", node, opts);
            }

            function assertInterfaceExtends(node, opts = {}) {
              assert("InterfaceExtends", node, opts);
            }

            function assertInterfaceDeclaration(node, opts = {}) {
              assert("InterfaceDeclaration", node, opts);
            }

            function assertInterfaceTypeAnnotation(node, opts = {}) {
              assert("InterfaceTypeAnnotation", node, opts);
            }

            function assertIntersectionTypeAnnotation(node, opts = {}) {
              assert("IntersectionTypeAnnotation", node, opts);
            }

            function assertMixedTypeAnnotation(node, opts = {}) {
              assert("MixedTypeAnnotation", node, opts);
            }

            function assertEmptyTypeAnnotation(node, opts = {}) {
              assert("EmptyTypeAnnotation", node, opts);
            }

            function assertNullableTypeAnnotation(node, opts = {}) {
              assert("NullableTypeAnnotation", node, opts);
            }

            function assertNumberLiteralTypeAnnotation(node, opts = {}) {
              assert("NumberLiteralTypeAnnotation", node, opts);
            }

            function assertNumberTypeAnnotation(node, opts = {}) {
              assert("NumberTypeAnnotation", node, opts);
            }

            function assertObjectTypeAnnotation(node, opts = {}) {
              assert("ObjectTypeAnnotation", node, opts);
            }

            function assertObjectTypeInternalSlot(node, opts = {}) {
              assert("ObjectTypeInternalSlot", node, opts);
            }

            function assertObjectTypeCallProperty(node, opts = {}) {
              assert("ObjectTypeCallProperty", node, opts);
            }

            function assertObjectTypeIndexer(node, opts = {}) {
              assert("ObjectTypeIndexer", node, opts);
            }

            function assertObjectTypeProperty(node, opts = {}) {
              assert("ObjectTypeProperty", node, opts);
            }

            function assertObjectTypeSpreadProperty(node, opts = {}) {
              assert("ObjectTypeSpreadProperty", node, opts);
            }

            function assertOpaqueType(node, opts = {}) {
              assert("OpaqueType", node, opts);
            }

            function assertQualifiedTypeIdentifier(node, opts = {}) {
              assert("QualifiedTypeIdentifier", node, opts);
            }

            function assertStringLiteralTypeAnnotation(node, opts = {}) {
              assert("StringLiteralTypeAnnotation", node, opts);
            }

            function assertStringTypeAnnotation(node, opts = {}) {
              assert("StringTypeAnnotation", node, opts);
            }

            function assertThisTypeAnnotation(node, opts = {}) {
              assert("ThisTypeAnnotation", node, opts);
            }

            function assertTupleTypeAnnotation(node, opts = {}) {
              assert("TupleTypeAnnotation", node, opts);
            }

            function assertTypeofTypeAnnotation(node, opts = {}) {
              assert("TypeofTypeAnnotation", node, opts);
            }

            function assertTypeAlias(node, opts = {}) {
              assert("TypeAlias", node, opts);
            }

            function assertTypeAnnotation(node, opts = {}) {
              assert("TypeAnnotation", node, opts);
            }

            function assertTypeCastExpression(node, opts = {}) {
              assert("TypeCastExpression", node, opts);
            }

            function assertTypeParameter(node, opts = {}) {
              assert("TypeParameter", node, opts);
            }

            function assertTypeParameterDeclaration(node, opts = {}) {
              assert("TypeParameterDeclaration", node, opts);
            }

            function assertTypeParameterInstantiation(node, opts = {}) {
              assert("TypeParameterInstantiation", node, opts);
            }

            function assertUnionTypeAnnotation(node, opts = {}) {
              assert("UnionTypeAnnotation", node, opts);
            }

            function assertVariance(node, opts = {}) {
              assert("Variance", node, opts);
            }

            function assertVoidTypeAnnotation(node, opts = {}) {
              assert("VoidTypeAnnotation", node, opts);
            }

            function assertJSXAttribute(node, opts = {}) {
              assert("JSXAttribute", node, opts);
            }

            function assertJSXClosingElement(node, opts = {}) {
              assert("JSXClosingElement", node, opts);
            }

            function assertJSXElement(node, opts = {}) {
              assert("JSXElement", node, opts);
            }

            function assertJSXEmptyExpression(node, opts = {}) {
              assert("JSXEmptyExpression", node, opts);
            }

            function assertJSXExpressionContainer(node, opts = {}) {
              assert("JSXExpressionContainer", node, opts);
            }

            function assertJSXSpreadChild(node, opts = {}) {
              assert("JSXSpreadChild", node, opts);
            }

            function assertJSXIdentifier(node, opts = {}) {
              assert("JSXIdentifier", node, opts);
            }

            function assertJSXMemberExpression(node, opts = {}) {
              assert("JSXMemberExpression", node, opts);
            }

            function assertJSXNamespacedName(node, opts = {}) {
              assert("JSXNamespacedName", node, opts);
            }

            function assertJSXOpeningElement(node, opts = {}) {
              assert("JSXOpeningElement", node, opts);
            }

            function assertJSXSpreadAttribute(node, opts = {}) {
              assert("JSXSpreadAttribute", node, opts);
            }

            function assertJSXText(node, opts = {}) {
              assert("JSXText", node, opts);
            }

            function assertJSXFragment(node, opts = {}) {
              assert("JSXFragment", node, opts);
            }

            function assertJSXOpeningFragment(node, opts = {}) {
              assert("JSXOpeningFragment", node, opts);
            }

            function assertJSXClosingFragment(node, opts = {}) {
              assert("JSXClosingFragment", node, opts);
            }

            function assertNoop(node, opts = {}) {
              assert("Noop", node, opts);
            }

            function assertParenthesizedExpression(node, opts = {}) {
              assert("ParenthesizedExpression", node, opts);
            }

            function assertAwaitExpression(node, opts = {}) {
              assert("AwaitExpression", node, opts);
            }

            function assertBindExpression(node, opts = {}) {
              assert("BindExpression", node, opts);
            }

            function assertClassProperty(node, opts = {}) {
              assert("ClassProperty", node, opts);
            }

            function assertOptionalMemberExpression(node, opts = {}) {
              assert("OptionalMemberExpression", node, opts);
            }

            function assertPipelineTopicExpression(node, opts = {}) {
              assert("PipelineTopicExpression", node, opts);
            }

            function assertPipelineBareFunction(node, opts = {}) {
              assert("PipelineBareFunction", node, opts);
            }

            function assertPipelinePrimaryTopicReference(node, opts = {}) {
              assert("PipelinePrimaryTopicReference", node, opts);
            }

            function assertOptionalCallExpression(node, opts = {}) {
              assert("OptionalCallExpression", node, opts);
            }

            function assertClassPrivateProperty(node, opts = {}) {
              assert("ClassPrivateProperty", node, opts);
            }

            function assertClassPrivateMethod(node, opts = {}) {
              assert("ClassPrivateMethod", node, opts);
            }

            function assertImport(node, opts = {}) {
              assert("Import", node, opts);
            }

            function assertDecorator(node, opts = {}) {
              assert("Decorator", node, opts);
            }

            function assertDoExpression(node, opts = {}) {
              assert("DoExpression", node, opts);
            }

            function assertExportDefaultSpecifier(node, opts = {}) {
              assert("ExportDefaultSpecifier", node, opts);
            }

            function assertExportNamespaceSpecifier(node, opts = {}) {
              assert("ExportNamespaceSpecifier", node, opts);
            }

            function assertPrivateName(node, opts = {}) {
              assert("PrivateName", node, opts);
            }

            function assertBigIntLiteral(node, opts = {}) {
              assert("BigIntLiteral", node, opts);
            }

            function assertTSParameterProperty(node, opts = {}) {
              assert("TSParameterProperty", node, opts);
            }

            function assertTSDeclareFunction(node, opts = {}) {
              assert("TSDeclareFunction", node, opts);
            }

            function assertTSDeclareMethod(node, opts = {}) {
              assert("TSDeclareMethod", node, opts);
            }

            function assertTSQualifiedName(node, opts = {}) {
              assert("TSQualifiedName", node, opts);
            }

            function assertTSCallSignatureDeclaration(node, opts = {}) {
              assert("TSCallSignatureDeclaration", node, opts);
            }

            function assertTSConstructSignatureDeclaration(node, opts = {}) {
              assert("TSConstructSignatureDeclaration", node, opts);
            }

            function assertTSPropertySignature(node, opts = {}) {
              assert("TSPropertySignature", node, opts);
            }

            function assertTSMethodSignature(node, opts = {}) {
              assert("TSMethodSignature", node, opts);
            }

            function assertTSIndexSignature(node, opts = {}) {
              assert("TSIndexSignature", node, opts);
            }

            function assertTSAnyKeyword(node, opts = {}) {
              assert("TSAnyKeyword", node, opts);
            }

            function assertTSUnknownKeyword(node, opts = {}) {
              assert("TSUnknownKeyword", node, opts);
            }

            function assertTSNumberKeyword(node, opts = {}) {
              assert("TSNumberKeyword", node, opts);
            }

            function assertTSObjectKeyword(node, opts = {}) {
              assert("TSObjectKeyword", node, opts);
            }

            function assertTSBooleanKeyword(node, opts = {}) {
              assert("TSBooleanKeyword", node, opts);
            }

            function assertTSStringKeyword(node, opts = {}) {
              assert("TSStringKeyword", node, opts);
            }

            function assertTSSymbolKeyword(node, opts = {}) {
              assert("TSSymbolKeyword", node, opts);
            }

            function assertTSVoidKeyword(node, opts = {}) {
              assert("TSVoidKeyword", node, opts);
            }

            function assertTSUndefinedKeyword(node, opts = {}) {
              assert("TSUndefinedKeyword", node, opts);
            }

            function assertTSNullKeyword(node, opts = {}) {
              assert("TSNullKeyword", node, opts);
            }

            function assertTSNeverKeyword(node, opts = {}) {
              assert("TSNeverKeyword", node, opts);
            }

            function assertTSThisType(node, opts = {}) {
              assert("TSThisType", node, opts);
            }

            function assertTSFunctionType(node, opts = {}) {
              assert("TSFunctionType", node, opts);
            }

            function assertTSConstructorType(node, opts = {}) {
              assert("TSConstructorType", node, opts);
            }

            function assertTSTypeReference(node, opts = {}) {
              assert("TSTypeReference", node, opts);
            }

            function assertTSTypePredicate(node, opts = {}) {
              assert("TSTypePredicate", node, opts);
            }

            function assertTSTypeQuery(node, opts = {}) {
              assert("TSTypeQuery", node, opts);
            }

            function assertTSTypeLiteral(node, opts = {}) {
              assert("TSTypeLiteral", node, opts);
            }

            function assertTSArrayType(node, opts = {}) {
              assert("TSArrayType", node, opts);
            }

            function assertTSTupleType(node, opts = {}) {
              assert("TSTupleType", node, opts);
            }

            function assertTSOptionalType(node, opts = {}) {
              assert("TSOptionalType", node, opts);
            }

            function assertTSRestType(node, opts = {}) {
              assert("TSRestType", node, opts);
            }

            function assertTSUnionType(node, opts = {}) {
              assert("TSUnionType", node, opts);
            }

            function assertTSIntersectionType(node, opts = {}) {
              assert("TSIntersectionType", node, opts);
            }

            function assertTSConditionalType(node, opts = {}) {
              assert("TSConditionalType", node, opts);
            }

            function assertTSInferType(node, opts = {}) {
              assert("TSInferType", node, opts);
            }

            function assertTSParenthesizedType(node, opts = {}) {
              assert("TSParenthesizedType", node, opts);
            }

            function assertTSTypeOperator(node, opts = {}) {
              assert("TSTypeOperator", node, opts);
            }

            function assertTSIndexedAccessType(node, opts = {}) {
              assert("TSIndexedAccessType", node, opts);
            }

            function assertTSMappedType(node, opts = {}) {
              assert("TSMappedType", node, opts);
            }

            function assertTSLiteralType(node, opts = {}) {
              assert("TSLiteralType", node, opts);
            }

            function assertTSExpressionWithTypeArguments(node, opts = {}) {
              assert("TSExpressionWithTypeArguments", node, opts);
            }

            function assertTSInterfaceDeclaration(node, opts = {}) {
              assert("TSInterfaceDeclaration", node, opts);
            }

            function assertTSInterfaceBody(node, opts = {}) {
              assert("TSInterfaceBody", node, opts);
            }

            function assertTSTypeAliasDeclaration(node, opts = {}) {
              assert("TSTypeAliasDeclaration", node, opts);
            }

            function assertTSAsExpression(node, opts = {}) {
              assert("TSAsExpression", node, opts);
            }

            function assertTSTypeAssertion(node, opts = {}) {
              assert("TSTypeAssertion", node, opts);
            }

            function assertTSEnumDeclaration(node, opts = {}) {
              assert("TSEnumDeclaration", node, opts);
            }

            function assertTSEnumMember(node, opts = {}) {
              assert("TSEnumMember", node, opts);
            }

            function assertTSModuleDeclaration(node, opts = {}) {
              assert("TSModuleDeclaration", node, opts);
            }

            function assertTSModuleBlock(node, opts = {}) {
              assert("TSModuleBlock", node, opts);
            }

            function assertTSImportType(node, opts = {}) {
              assert("TSImportType", node, opts);
            }

            function assertTSImportEqualsDeclaration(node, opts = {}) {
              assert("TSImportEqualsDeclaration", node, opts);
            }

            function assertTSExternalModuleReference(node, opts = {}) {
              assert("TSExternalModuleReference", node, opts);
            }

            function assertTSNonNullExpression(node, opts = {}) {
              assert("TSNonNullExpression", node, opts);
            }

            function assertTSExportAssignment(node, opts = {}) {
              assert("TSExportAssignment", node, opts);
            }

            function assertTSNamespaceExportDeclaration(node, opts = {}) {
              assert("TSNamespaceExportDeclaration", node, opts);
            }

            function assertTSTypeAnnotation(node, opts = {}) {
              assert("TSTypeAnnotation", node, opts);
            }

            function assertTSTypeParameterInstantiation(node, opts = {}) {
              assert("TSTypeParameterInstantiation", node, opts);
            }

            function assertTSTypeParameterDeclaration(node, opts = {}) {
              assert("TSTypeParameterDeclaration", node, opts);
            }

            function assertTSTypeParameter(node, opts = {}) {
              assert("TSTypeParameter", node, opts);
            }

            function assertExpression(node, opts = {}) {
              assert("Expression", node, opts);
            }

            function assertBinary(node, opts = {}) {
              assert("Binary", node, opts);
            }

            function assertScopable(node, opts = {}) {
              assert("Scopable", node, opts);
            }

            function assertBlockParent(node, opts = {}) {
              assert("BlockParent", node, opts);
            }

            function assertBlock(node, opts = {}) {
              assert("Block", node, opts);
            }

            function assertStatement(node, opts = {}) {
              assert("Statement", node, opts);
            }

            function assertTerminatorless(node, opts = {}) {
              assert("Terminatorless", node, opts);
            }

            function assertCompletionStatement(node, opts = {}) {
              assert("CompletionStatement", node, opts);
            }

            function assertConditional(node, opts = {}) {
              assert("Conditional", node, opts);
            }

            function assertLoop(node, opts = {}) {
              assert("Loop", node, opts);
            }

            function assertWhile(node, opts = {}) {
              assert("While", node, opts);
            }

            function assertExpressionWrapper(node, opts = {}) {
              assert("ExpressionWrapper", node, opts);
            }

            function assertFor(node, opts = {}) {
              assert("For", node, opts);
            }

            function assertForXStatement(node, opts = {}) {
              assert("ForXStatement", node, opts);
            }

            function assertFunction(node, opts = {}) {
              assert("Function", node, opts);
            }

            function assertFunctionParent(node, opts = {}) {
              assert("FunctionParent", node, opts);
            }

            function assertPureish(node, opts = {}) {
              assert("Pureish", node, opts);
            }

            function assertDeclaration(node, opts = {}) {
              assert("Declaration", node, opts);
            }

            function assertPatternLike(node, opts = {}) {
              assert("PatternLike", node, opts);
            }

            function assertLVal(node, opts = {}) {
              assert("LVal", node, opts);
            }

            function assertTSEntityName(node, opts = {}) {
              assert("TSEntityName", node, opts);
            }

            function assertLiteral(node, opts = {}) {
              assert("Literal", node, opts);
            }

            function assertImmutable(node, opts = {}) {
              assert("Immutable", node, opts);
            }

            function assertUserWhitespacable(node, opts = {}) {
              assert("UserWhitespacable", node, opts);
            }

            function assertMethod(node, opts = {}) {
              assert("Method", node, opts);
            }

            function assertObjectMember(node, opts = {}) {
              assert("ObjectMember", node, opts);
            }

            function assertProperty(node, opts = {}) {
              assert("Property", node, opts);
            }

            function assertUnaryLike(node, opts = {}) {
              assert("UnaryLike", node, opts);
            }

            function assertPattern(node, opts = {}) {
              assert("Pattern", node, opts);
            }

            function assertClass(node, opts = {}) {
              assert("Class", node, opts);
            }

            function assertModuleDeclaration(node, opts = {}) {
              assert("ModuleDeclaration", node, opts);
            }

            function assertExportDeclaration(node, opts = {}) {
              assert("ExportDeclaration", node, opts);
            }

            function assertModuleSpecifier(node, opts = {}) {
              assert("ModuleSpecifier", node, opts);
            }

            function assertFlow(node, opts = {}) {
              assert("Flow", node, opts);
            }

            function assertFlowType(node, opts = {}) {
              assert("FlowType", node, opts);
            }

            function assertFlowBaseAnnotation(node, opts = {}) {
              assert("FlowBaseAnnotation", node, opts);
            }

            function assertFlowDeclaration(node, opts = {}) {
              assert("FlowDeclaration", node, opts);
            }

            function assertFlowPredicate(node, opts = {}) {
              assert("FlowPredicate", node, opts);
            }

            function assertJSX(node, opts = {}) {
              assert("JSX", node, opts);
            }

            function assertPrivate(node, opts = {}) {
              assert("Private", node, opts);
            }

            function assertTSTypeElement(node, opts = {}) {
              assert("TSTypeElement", node, opts);
            }

            function assertTSType(node, opts = {}) {
              assert("TSType", node, opts);
            }

            function assertNumberLiteral(node, opts) {
              console.trace("The node type NumberLiteral has been renamed to NumericLiteral");
              assert("NumberLiteral", node, opts);
            }

            function assertRegexLiteral(node, opts) {
              console.trace("The node type RegexLiteral has been renamed to RegExpLiteral");
              assert("RegexLiteral", node, opts);
            }

            function assertRestProperty(node, opts) {
              console.trace("The node type RestProperty has been renamed to RestElement");
              assert("RestProperty", node, opts);
            }

            function assertSpreadProperty(node, opts) {
              console.trace("The node type SpreadProperty has been renamed to SpreadElement");
              assert("SpreadProperty", node, opts);
            }
            });

            unwrapExports(generated$2);
            var generated_1$2 = generated$2.assertArrayExpression;
            var generated_2$2 = generated$2.assertAssignmentExpression;
            var generated_3$2 = generated$2.assertBinaryExpression;
            var generated_4$2 = generated$2.assertInterpreterDirective;
            var generated_5$2 = generated$2.assertDirective;
            var generated_6$2 = generated$2.assertDirectiveLiteral;
            var generated_7$2 = generated$2.assertBlockStatement;
            var generated_8$2 = generated$2.assertBreakStatement;
            var generated_9$2 = generated$2.assertCallExpression;
            var generated_10$2 = generated$2.assertCatchClause;
            var generated_11$2 = generated$2.assertConditionalExpression;
            var generated_12$2 = generated$2.assertContinueStatement;
            var generated_13$2 = generated$2.assertDebuggerStatement;
            var generated_14$2 = generated$2.assertDoWhileStatement;
            var generated_15$2 = generated$2.assertEmptyStatement;
            var generated_16$2 = generated$2.assertExpressionStatement;
            var generated_17$2 = generated$2.assertFile;
            var generated_18$2 = generated$2.assertForInStatement;
            var generated_19$2 = generated$2.assertForStatement;
            var generated_20$2 = generated$2.assertFunctionDeclaration;
            var generated_21$2 = generated$2.assertFunctionExpression;
            var generated_22$2 = generated$2.assertIdentifier;
            var generated_23$2 = generated$2.assertIfStatement;
            var generated_24$2 = generated$2.assertLabeledStatement;
            var generated_25$2 = generated$2.assertStringLiteral;
            var generated_26$2 = generated$2.assertNumericLiteral;
            var generated_27$2 = generated$2.assertNullLiteral;
            var generated_28$2 = generated$2.assertBooleanLiteral;
            var generated_29$2 = generated$2.assertRegExpLiteral;
            var generated_30$2 = generated$2.assertLogicalExpression;
            var generated_31$2 = generated$2.assertMemberExpression;
            var generated_32$2 = generated$2.assertNewExpression;
            var generated_33$2 = generated$2.assertProgram;
            var generated_34$2 = generated$2.assertObjectExpression;
            var generated_35$2 = generated$2.assertObjectMethod;
            var generated_36$2 = generated$2.assertObjectProperty;
            var generated_37$2 = generated$2.assertRestElement;
            var generated_38$2 = generated$2.assertReturnStatement;
            var generated_39$2 = generated$2.assertSequenceExpression;
            var generated_40$2 = generated$2.assertSwitchCase;
            var generated_41$2 = generated$2.assertSwitchStatement;
            var generated_42$2 = generated$2.assertThisExpression;
            var generated_43$2 = generated$2.assertThrowStatement;
            var generated_44$2 = generated$2.assertTryStatement;
            var generated_45$2 = generated$2.assertUnaryExpression;
            var generated_46$2 = generated$2.assertUpdateExpression;
            var generated_47$2 = generated$2.assertVariableDeclaration;
            var generated_48$2 = generated$2.assertVariableDeclarator;
            var generated_49$2 = generated$2.assertWhileStatement;
            var generated_50$2 = generated$2.assertWithStatement;
            var generated_51$2 = generated$2.assertAssignmentPattern;
            var generated_52$2 = generated$2.assertArrayPattern;
            var generated_53$2 = generated$2.assertArrowFunctionExpression;
            var generated_54$2 = generated$2.assertClassBody;
            var generated_55$2 = generated$2.assertClassDeclaration;
            var generated_56$2 = generated$2.assertClassExpression;
            var generated_57$2 = generated$2.assertExportAllDeclaration;
            var generated_58$2 = generated$2.assertExportDefaultDeclaration;
            var generated_59$2 = generated$2.assertExportNamedDeclaration;
            var generated_60$2 = generated$2.assertExportSpecifier;
            var generated_61$2 = generated$2.assertForOfStatement;
            var generated_62$2 = generated$2.assertImportDeclaration;
            var generated_63$2 = generated$2.assertImportDefaultSpecifier;
            var generated_64$2 = generated$2.assertImportNamespaceSpecifier;
            var generated_65$2 = generated$2.assertImportSpecifier;
            var generated_66$2 = generated$2.assertMetaProperty;
            var generated_67$2 = generated$2.assertClassMethod;
            var generated_68$2 = generated$2.assertObjectPattern;
            var generated_69$2 = generated$2.assertSpreadElement;
            var generated_70$2 = generated$2.assertSuper;
            var generated_71$2 = generated$2.assertTaggedTemplateExpression;
            var generated_72$2 = generated$2.assertTemplateElement;
            var generated_73$2 = generated$2.assertTemplateLiteral;
            var generated_74$2 = generated$2.assertYieldExpression;
            var generated_75$2 = generated$2.assertAnyTypeAnnotation;
            var generated_76$2 = generated$2.assertArrayTypeAnnotation;
            var generated_77$2 = generated$2.assertBooleanTypeAnnotation;
            var generated_78$2 = generated$2.assertBooleanLiteralTypeAnnotation;
            var generated_79$2 = generated$2.assertNullLiteralTypeAnnotation;
            var generated_80$2 = generated$2.assertClassImplements;
            var generated_81$2 = generated$2.assertDeclareClass;
            var generated_82$2 = generated$2.assertDeclareFunction;
            var generated_83$2 = generated$2.assertDeclareInterface;
            var generated_84$2 = generated$2.assertDeclareModule;
            var generated_85$2 = generated$2.assertDeclareModuleExports;
            var generated_86$2 = generated$2.assertDeclareTypeAlias;
            var generated_87$2 = generated$2.assertDeclareOpaqueType;
            var generated_88$2 = generated$2.assertDeclareVariable;
            var generated_89$2 = generated$2.assertDeclareExportDeclaration;
            var generated_90$2 = generated$2.assertDeclareExportAllDeclaration;
            var generated_91$2 = generated$2.assertDeclaredPredicate;
            var generated_92$2 = generated$2.assertExistsTypeAnnotation;
            var generated_93$2 = generated$2.assertFunctionTypeAnnotation;
            var generated_94$2 = generated$2.assertFunctionTypeParam;
            var generated_95$2 = generated$2.assertGenericTypeAnnotation;
            var generated_96$2 = generated$2.assertInferredPredicate;
            var generated_97$2 = generated$2.assertInterfaceExtends;
            var generated_98$2 = generated$2.assertInterfaceDeclaration;
            var generated_99$2 = generated$2.assertInterfaceTypeAnnotation;
            var generated_100$2 = generated$2.assertIntersectionTypeAnnotation;
            var generated_101$2 = generated$2.assertMixedTypeAnnotation;
            var generated_102$2 = generated$2.assertEmptyTypeAnnotation;
            var generated_103$2 = generated$2.assertNullableTypeAnnotation;
            var generated_104$2 = generated$2.assertNumberLiteralTypeAnnotation;
            var generated_105$2 = generated$2.assertNumberTypeAnnotation;
            var generated_106$2 = generated$2.assertObjectTypeAnnotation;
            var generated_107$2 = generated$2.assertObjectTypeInternalSlot;
            var generated_108$2 = generated$2.assertObjectTypeCallProperty;
            var generated_109$2 = generated$2.assertObjectTypeIndexer;
            var generated_110$2 = generated$2.assertObjectTypeProperty;
            var generated_111$2 = generated$2.assertObjectTypeSpreadProperty;
            var generated_112$2 = generated$2.assertOpaqueType;
            var generated_113$2 = generated$2.assertQualifiedTypeIdentifier;
            var generated_114$2 = generated$2.assertStringLiteralTypeAnnotation;
            var generated_115$2 = generated$2.assertStringTypeAnnotation;
            var generated_116$2 = generated$2.assertThisTypeAnnotation;
            var generated_117$2 = generated$2.assertTupleTypeAnnotation;
            var generated_118$2 = generated$2.assertTypeofTypeAnnotation;
            var generated_119$2 = generated$2.assertTypeAlias;
            var generated_120$2 = generated$2.assertTypeAnnotation;
            var generated_121$2 = generated$2.assertTypeCastExpression;
            var generated_122$2 = generated$2.assertTypeParameter;
            var generated_123$2 = generated$2.assertTypeParameterDeclaration;
            var generated_124$2 = generated$2.assertTypeParameterInstantiation;
            var generated_125$2 = generated$2.assertUnionTypeAnnotation;
            var generated_126$2 = generated$2.assertVariance;
            var generated_127$2 = generated$2.assertVoidTypeAnnotation;
            var generated_128$2 = generated$2.assertJSXAttribute;
            var generated_129$2 = generated$2.assertJSXClosingElement;
            var generated_130$2 = generated$2.assertJSXElement;
            var generated_131$2 = generated$2.assertJSXEmptyExpression;
            var generated_132$2 = generated$2.assertJSXExpressionContainer;
            var generated_133$2 = generated$2.assertJSXSpreadChild;
            var generated_134$2 = generated$2.assertJSXIdentifier;
            var generated_135$2 = generated$2.assertJSXMemberExpression;
            var generated_136$2 = generated$2.assertJSXNamespacedName;
            var generated_137$2 = generated$2.assertJSXOpeningElement;
            var generated_138$2 = generated$2.assertJSXSpreadAttribute;
            var generated_139$2 = generated$2.assertJSXText;
            var generated_140$2 = generated$2.assertJSXFragment;
            var generated_141$2 = generated$2.assertJSXOpeningFragment;
            var generated_142$2 = generated$2.assertJSXClosingFragment;
            var generated_143$2 = generated$2.assertNoop;
            var generated_144$2 = generated$2.assertParenthesizedExpression;
            var generated_145$2 = generated$2.assertAwaitExpression;
            var generated_146$2 = generated$2.assertBindExpression;
            var generated_147$2 = generated$2.assertClassProperty;
            var generated_148$2 = generated$2.assertOptionalMemberExpression;
            var generated_149$2 = generated$2.assertPipelineTopicExpression;
            var generated_150$2 = generated$2.assertPipelineBareFunction;
            var generated_151$2 = generated$2.assertPipelinePrimaryTopicReference;
            var generated_152$2 = generated$2.assertOptionalCallExpression;
            var generated_153$2 = generated$2.assertClassPrivateProperty;
            var generated_154$2 = generated$2.assertClassPrivateMethod;
            var generated_155$2 = generated$2.assertImport;
            var generated_156$2 = generated$2.assertDecorator;
            var generated_157$2 = generated$2.assertDoExpression;
            var generated_158$2 = generated$2.assertExportDefaultSpecifier;
            var generated_159$2 = generated$2.assertExportNamespaceSpecifier;
            var generated_160$2 = generated$2.assertPrivateName;
            var generated_161$2 = generated$2.assertBigIntLiteral;
            var generated_162$2 = generated$2.assertTSParameterProperty;
            var generated_163$2 = generated$2.assertTSDeclareFunction;
            var generated_164$2 = generated$2.assertTSDeclareMethod;
            var generated_165$2 = generated$2.assertTSQualifiedName;
            var generated_166$2 = generated$2.assertTSCallSignatureDeclaration;
            var generated_167$2 = generated$2.assertTSConstructSignatureDeclaration;
            var generated_168$2 = generated$2.assertTSPropertySignature;
            var generated_169$2 = generated$2.assertTSMethodSignature;
            var generated_170$2 = generated$2.assertTSIndexSignature;
            var generated_171$2 = generated$2.assertTSAnyKeyword;
            var generated_172$2 = generated$2.assertTSUnknownKeyword;
            var generated_173$2 = generated$2.assertTSNumberKeyword;
            var generated_174$2 = generated$2.assertTSObjectKeyword;
            var generated_175$2 = generated$2.assertTSBooleanKeyword;
            var generated_176$2 = generated$2.assertTSStringKeyword;
            var generated_177$2 = generated$2.assertTSSymbolKeyword;
            var generated_178$2 = generated$2.assertTSVoidKeyword;
            var generated_179$2 = generated$2.assertTSUndefinedKeyword;
            var generated_180$2 = generated$2.assertTSNullKeyword;
            var generated_181$2 = generated$2.assertTSNeverKeyword;
            var generated_182$2 = generated$2.assertTSThisType;
            var generated_183$2 = generated$2.assertTSFunctionType;
            var generated_184$2 = generated$2.assertTSConstructorType;
            var generated_185$2 = generated$2.assertTSTypeReference;
            var generated_186$2 = generated$2.assertTSTypePredicate;
            var generated_187$2 = generated$2.assertTSTypeQuery;
            var generated_188$2 = generated$2.assertTSTypeLiteral;
            var generated_189$2 = generated$2.assertTSArrayType;
            var generated_190$2 = generated$2.assertTSTupleType;
            var generated_191$2 = generated$2.assertTSOptionalType;
            var generated_192$2 = generated$2.assertTSRestType;
            var generated_193$2 = generated$2.assertTSUnionType;
            var generated_194$2 = generated$2.assertTSIntersectionType;
            var generated_195$2 = generated$2.assertTSConditionalType;
            var generated_196$2 = generated$2.assertTSInferType;
            var generated_197$2 = generated$2.assertTSParenthesizedType;
            var generated_198$2 = generated$2.assertTSTypeOperator;
            var generated_199$2 = generated$2.assertTSIndexedAccessType;
            var generated_200$2 = generated$2.assertTSMappedType;
            var generated_201$2 = generated$2.assertTSLiteralType;
            var generated_202$2 = generated$2.assertTSExpressionWithTypeArguments;
            var generated_203$2 = generated$2.assertTSInterfaceDeclaration;
            var generated_204$2 = generated$2.assertTSInterfaceBody;
            var generated_205$2 = generated$2.assertTSTypeAliasDeclaration;
            var generated_206$2 = generated$2.assertTSAsExpression;
            var generated_207$2 = generated$2.assertTSTypeAssertion;
            var generated_208$2 = generated$2.assertTSEnumDeclaration;
            var generated_209$2 = generated$2.assertTSEnumMember;
            var generated_210$2 = generated$2.assertTSModuleDeclaration;
            var generated_211$2 = generated$2.assertTSModuleBlock;
            var generated_212$2 = generated$2.assertTSImportType;
            var generated_213$2 = generated$2.assertTSImportEqualsDeclaration;
            var generated_214$2 = generated$2.assertTSExternalModuleReference;
            var generated_215$2 = generated$2.assertTSNonNullExpression;
            var generated_216$2 = generated$2.assertTSExportAssignment;
            var generated_217$2 = generated$2.assertTSNamespaceExportDeclaration;
            var generated_218$2 = generated$2.assertTSTypeAnnotation;
            var generated_219$2 = generated$2.assertTSTypeParameterInstantiation;
            var generated_220$2 = generated$2.assertTSTypeParameterDeclaration;
            var generated_221$2 = generated$2.assertTSTypeParameter;
            var generated_222$2 = generated$2.assertExpression;
            var generated_223$2 = generated$2.assertBinary;
            var generated_224$2 = generated$2.assertScopable;
            var generated_225$2 = generated$2.assertBlockParent;
            var generated_226$2 = generated$2.assertBlock;
            var generated_227$2 = generated$2.assertStatement;
            var generated_228$2 = generated$2.assertTerminatorless;
            var generated_229$2 = generated$2.assertCompletionStatement;
            var generated_230$2 = generated$2.assertConditional;
            var generated_231$2 = generated$2.assertLoop;
            var generated_232$2 = generated$2.assertWhile;
            var generated_233$2 = generated$2.assertExpressionWrapper;
            var generated_234$2 = generated$2.assertFor;
            var generated_235$2 = generated$2.assertForXStatement;
            var generated_236$2 = generated$2.assertFunction;
            var generated_237$2 = generated$2.assertFunctionParent;
            var generated_238$2 = generated$2.assertPureish;
            var generated_239$2 = generated$2.assertDeclaration;
            var generated_240$2 = generated$2.assertPatternLike;
            var generated_241$2 = generated$2.assertLVal;
            var generated_242$2 = generated$2.assertTSEntityName;
            var generated_243$2 = generated$2.assertLiteral;
            var generated_244$2 = generated$2.assertImmutable;
            var generated_245$2 = generated$2.assertUserWhitespacable;
            var generated_246$2 = generated$2.assertMethod;
            var generated_247$2 = generated$2.assertObjectMember;
            var generated_248$2 = generated$2.assertProperty;
            var generated_249$2 = generated$2.assertUnaryLike;
            var generated_250$2 = generated$2.assertPattern;
            var generated_251$2 = generated$2.assertClass;
            var generated_252$2 = generated$2.assertModuleDeclaration;
            var generated_253$2 = generated$2.assertExportDeclaration;
            var generated_254$2 = generated$2.assertModuleSpecifier;
            var generated_255$2 = generated$2.assertFlow;
            var generated_256$2 = generated$2.assertFlowType;
            var generated_257$2 = generated$2.assertFlowBaseAnnotation;
            var generated_258$2 = generated$2.assertFlowDeclaration;
            var generated_259$2 = generated$2.assertFlowPredicate;
            var generated_260$2 = generated$2.assertJSX;
            var generated_261$2 = generated$2.assertPrivate;
            var generated_262$2 = generated$2.assertTSTypeElement;
            var generated_263$2 = generated$2.assertTSType;
            var generated_264$2 = generated$2.assertNumberLiteral;
            var generated_265$2 = generated$2.assertRegexLiteral;
            var generated_266$2 = generated$2.assertRestProperty;
            var generated_267$2 = generated$2.assertSpreadProperty;

            var createTypeAnnotationBasedOnTypeof_1 = createCommonjsModule(function (module, exports) {

            Object.defineProperty(exports, "__esModule", {
              value: true
            });
            exports.default = createTypeAnnotationBasedOnTypeof;



            function createTypeAnnotationBasedOnTypeof(type) {
              if (type === "string") {
                return (0, generated$1.stringTypeAnnotation)();
              } else if (type === "number") {
                return (0, generated$1.numberTypeAnnotation)();
              } else if (type === "undefined") {
                return (0, generated$1.voidTypeAnnotation)();
              } else if (type === "boolean") {
                return (0, generated$1.booleanTypeAnnotation)();
              } else if (type === "function") {
                return (0, generated$1.genericTypeAnnotation)((0, generated$1.identifier)("Function"));
              } else if (type === "object") {
                return (0, generated$1.genericTypeAnnotation)((0, generated$1.identifier)("Object"));
              } else if (type === "symbol") {
                return (0, generated$1.genericTypeAnnotation)((0, generated$1.identifier)("Symbol"));
              } else {
                throw new Error("Invalid typeof value");
              }
            }
            });

            unwrapExports(createTypeAnnotationBasedOnTypeof_1);

            var removeTypeDuplicates_1 = createCommonjsModule(function (module, exports) {

            Object.defineProperty(exports, "__esModule", {
              value: true
            });
            exports.default = removeTypeDuplicates;



            function removeTypeDuplicates(nodes) {
              const generics = {};
              const bases = {};
              const typeGroups = [];
              const types = [];

              for (let i = 0; i < nodes.length; i++) {
                const node = nodes[i];
                if (!node) continue;

                if (types.indexOf(node) >= 0) {
                  continue;
                }

                if ((0, generated.isAnyTypeAnnotation)(node)) {
                  return [node];
                }

                if ((0, generated.isFlowBaseAnnotation)(node)) {
                  bases[node.type] = node;
                  continue;
                }

                if ((0, generated.isUnionTypeAnnotation)(node)) {
                  if (typeGroups.indexOf(node.types) < 0) {
                    nodes = nodes.concat(node.types);
                    typeGroups.push(node.types);
                  }

                  continue;
                }

                if ((0, generated.isGenericTypeAnnotation)(node)) {
                  const name = node.id.name;

                  if (generics[name]) {
                    let existing = generics[name];

                    if (existing.typeParameters) {
                      if (node.typeParameters) {
                        existing.typeParameters.params = removeTypeDuplicates(existing.typeParameters.params.concat(node.typeParameters.params));
                      }
                    } else {
                      existing = node.typeParameters;
                    }
                  } else {
                    generics[name] = node;
                  }

                  continue;
                }

                types.push(node);
              }

              for (const type in bases) {
                types.push(bases[type]);
              }

              for (const name in generics) {
                types.push(generics[name]);
              }

              return types;
            }
            });

            unwrapExports(removeTypeDuplicates_1);

            var createUnionTypeAnnotation_1 = createCommonjsModule(function (module, exports) {

            Object.defineProperty(exports, "__esModule", {
              value: true
            });
            exports.default = createUnionTypeAnnotation;



            var _removeTypeDuplicates = _interopRequireDefault(removeTypeDuplicates_1);

            function _interopRequireDefault(obj) {
              return obj && obj.__esModule ? obj : {
                default: obj
              };
            }

            function createUnionTypeAnnotation(types) {
              const flattened = (0, _removeTypeDuplicates.default)(types);

              if (flattened.length === 1) {
                return flattened[0];
              } else {
                return (0, generated$1.unionTypeAnnotation)(flattened);
              }
            }
            });

            unwrapExports(createUnionTypeAnnotation_1);

            var cloneNode_1 = createCommonjsModule(function (module, exports) {

            Object.defineProperty(exports, "__esModule", {
              value: true
            });
            exports.default = cloneNode;



            const has = Function.call.bind(Object.prototype.hasOwnProperty);

            function cloneIfNode(obj, deep) {
              if (obj && typeof obj.type === "string" && obj.type !== "CommentLine" && obj.type !== "CommentBlock") {
                return cloneNode(obj, deep);
              }

              return obj;
            }

            function cloneIfNodeOrArray(obj, deep) {
              if (Array.isArray(obj)) {
                return obj.map(node => cloneIfNode(node, deep));
              }

              return cloneIfNode(obj, deep);
            }

            function cloneNode(node, deep = true) {
              if (!node) return node;
              const type = node.type;
              const newNode = {
                type
              };

              if (type === "Identifier") {
                newNode.name = node.name;

                if (has(node, "optional") && typeof node.optional === "boolean") {
                  newNode.optional = node.optional;
                }

                if (has(node, "typeAnnotation")) {
                  newNode.typeAnnotation = deep ? cloneIfNodeOrArray(node.typeAnnotation, true) : node.typeAnnotation;
                }
              } else if (!has(definitions.NODE_FIELDS, type)) {
                throw new Error(`Unknown node type: "${type}"`);
              } else {
                for (const field of Object.keys(definitions.NODE_FIELDS[type])) {
                  if (has(node, field)) {
                    newNode[field] = deep ? cloneIfNodeOrArray(node[field], true) : node[field];
                  }
                }
              }

              if (has(node, "loc")) {
                newNode.loc = node.loc;
              }

              if (has(node, "leadingComments")) {
                newNode.leadingComments = node.leadingComments;
              }

              if (has(node, "innerComments")) {
                newNode.innerComments = node.innerCmments;
              }

              if (has(node, "trailingComments")) {
                newNode.trailingComments = node.trailingComments;
              }

              if (has(node, "extra")) {
                newNode.extra = Object.assign({}, node.extra);
              }

              return newNode;
            }
            });

            unwrapExports(cloneNode_1);

            var clone_1$1 = createCommonjsModule(function (module, exports) {

            Object.defineProperty(exports, "__esModule", {
              value: true
            });
            exports.default = clone;

            var _cloneNode = _interopRequireDefault(cloneNode_1);

            function _interopRequireDefault(obj) {
              return obj && obj.__esModule ? obj : {
                default: obj
              };
            }

            function clone(node) {
              return (0, _cloneNode.default)(node, false);
            }
            });

            unwrapExports(clone_1$1);

            var cloneDeep_1 = createCommonjsModule(function (module, exports) {

            Object.defineProperty(exports, "__esModule", {
              value: true
            });
            exports.default = cloneDeep;

            var _cloneNode = _interopRequireDefault(cloneNode_1);

            function _interopRequireDefault(obj) {
              return obj && obj.__esModule ? obj : {
                default: obj
              };
            }

            function cloneDeep(node) {
              return (0, _cloneNode.default)(node);
            }
            });

            unwrapExports(cloneDeep_1);

            var cloneWithoutLoc_1 = createCommonjsModule(function (module, exports) {

            Object.defineProperty(exports, "__esModule", {
              value: true
            });
            exports.default = cloneWithoutLoc;

            var _clone = _interopRequireDefault(clone_1$1);

            function _interopRequireDefault(obj) {
              return obj && obj.__esModule ? obj : {
                default: obj
              };
            }

            function cloneWithoutLoc(node) {
              const newNode = (0, _clone.default)(node);
              newNode.loc = null;
              return newNode;
            }
            });

            unwrapExports(cloneWithoutLoc_1);

            var addComments_1 = createCommonjsModule(function (module, exports) {

            Object.defineProperty(exports, "__esModule", {
              value: true
            });
            exports.default = addComments;

            function addComments(node, type, comments) {
              if (!comments || !node) return node;
              const key = `${type}Comments`;

              if (node[key]) {
                if (type === "leading") {
                  node[key] = comments.concat(node[key]);
                } else {
                  node[key] = node[key].concat(comments);
                }
              } else {
                node[key] = comments;
              }

              return node;
            }
            });

            unwrapExports(addComments_1);

            var addComment_1 = createCommonjsModule(function (module, exports) {

            Object.defineProperty(exports, "__esModule", {
              value: true
            });
            exports.default = addComment;

            var _addComments = _interopRequireDefault(addComments_1);

            function _interopRequireDefault(obj) {
              return obj && obj.__esModule ? obj : {
                default: obj
              };
            }

            function addComment(node, type, content, line) {
              return (0, _addComments.default)(node, type, [{
                type: line ? "CommentLine" : "CommentBlock",
                value: content
              }]);
            }
            });

            unwrapExports(addComment_1);

            /** Used to stand-in for `undefined` hash values. */
            var HASH_UNDEFINED$2 = '__lodash_hash_undefined__';
            /**
             * Adds `value` to the array cache.
             *
             * @private
             * @name add
             * @memberOf SetCache
             * @alias push
             * @param {*} value The value to cache.
             * @returns {Object} Returns the cache instance.
             */

            function setCacheAdd(value) {
              this.__data__.set(value, HASH_UNDEFINED$2);

              return this;
            }

            var _setCacheAdd = setCacheAdd;

            /**
             * Checks if `value` is in the array cache.
             *
             * @private
             * @name has
             * @memberOf SetCache
             * @param {*} value The value to search for.
             * @returns {number} Returns `true` if `value` is found, else `false`.
             */
            function setCacheHas(value) {
              return this.__data__.has(value);
            }

            var _setCacheHas = setCacheHas;

            /**
             *
             * Creates an array cache object to store unique values.
             *
             * @private
             * @constructor
             * @param {Array} [values] The values to cache.
             */


            function SetCache(values) {
              var index = -1,
                  length = values == null ? 0 : values.length;
              this.__data__ = new _MapCache();

              while (++index < length) {
                this.add(values[index]);
              }
            } // Add methods to `SetCache`.


            SetCache.prototype.add = SetCache.prototype.push = _setCacheAdd;
            SetCache.prototype.has = _setCacheHas;
            var _SetCache = SetCache;

            /**
             * The base implementation of `_.findIndex` and `_.findLastIndex` without
             * support for iteratee shorthands.
             *
             * @private
             * @param {Array} array The array to inspect.
             * @param {Function} predicate The function invoked per iteration.
             * @param {number} fromIndex The index to search from.
             * @param {boolean} [fromRight] Specify iterating from right to left.
             * @returns {number} Returns the index of the matched value, else `-1`.
             */
            function baseFindIndex(array, predicate, fromIndex, fromRight) {
              var length = array.length,
                  index = fromIndex + (fromRight ? 1 : -1);

              while (fromRight ? index-- : ++index < length) {
                if (predicate(array[index], index, array)) {
                  return index;
                }
              }

              return -1;
            }

            var _baseFindIndex = baseFindIndex;

            /**
             * The base implementation of `_.isNaN` without support for number objects.
             *
             * @private
             * @param {*} value The value to check.
             * @returns {boolean} Returns `true` if `value` is `NaN`, else `false`.
             */
            function baseIsNaN(value) {
              return value !== value;
            }

            var _baseIsNaN = baseIsNaN;

            /**
             * A specialized version of `_.indexOf` which performs strict equality
             * comparisons of values, i.e. `===`.
             *
             * @private
             * @param {Array} array The array to inspect.
             * @param {*} value The value to search for.
             * @param {number} fromIndex The index to search from.
             * @returns {number} Returns the index of the matched value, else `-1`.
             */
            function strictIndexOf(array, value, fromIndex) {
              var index = fromIndex - 1,
                  length = array.length;

              while (++index < length) {
                if (array[index] === value) {
                  return index;
                }
              }

              return -1;
            }

            var _strictIndexOf = strictIndexOf;

            /**
             * The base implementation of `_.indexOf` without `fromIndex` bounds checks.
             *
             * @private
             * @param {Array} array The array to inspect.
             * @param {*} value The value to search for.
             * @param {number} fromIndex The index to search from.
             * @returns {number} Returns the index of the matched value, else `-1`.
             */


            function baseIndexOf(array, value, fromIndex) {
              return value === value ? _strictIndexOf(array, value, fromIndex) : _baseFindIndex(array, _baseIsNaN, fromIndex);
            }

            var _baseIndexOf = baseIndexOf;

            /**
             * A specialized version of `_.includes` for arrays without support for
             * specifying an index to search from.
             *
             * @private
             * @param {Array} [array] The array to inspect.
             * @param {*} target The value to search for.
             * @returns {boolean} Returns `true` if `target` is found, else `false`.
             */


            function arrayIncludes(array, value) {
              var length = array == null ? 0 : array.length;
              return !!length && _baseIndexOf(array, value, 0) > -1;
            }

            var _arrayIncludes = arrayIncludes;

            /**
             * This function is like `arrayIncludes` except that it accepts a comparator.
             *
             * @private
             * @param {Array} [array] The array to inspect.
             * @param {*} target The value to search for.
             * @param {Function} comparator The comparator invoked per element.
             * @returns {boolean} Returns `true` if `target` is found, else `false`.
             */
            function arrayIncludesWith(array, value, comparator) {
              var index = -1,
                  length = array == null ? 0 : array.length;

              while (++index < length) {
                if (comparator(value, array[index])) {
                  return true;
                }
              }

              return false;
            }

            var _arrayIncludesWith = arrayIncludesWith;

            /**
             * Checks if a `cache` value for `key` exists.
             *
             * @private
             * @param {Object} cache The cache to query.
             * @param {string} key The key of the entry to check.
             * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
             */
            function cacheHas(cache, key) {
              return cache.has(key);
            }

            var _cacheHas = cacheHas;

            /**
             * This method returns `undefined`.
             *
             * @static
             * @memberOf _
             * @since 2.3.0
             * @category Util
             * @example
             *
             * _.times(2, _.noop);
             * // => [undefined, undefined]
             */
            function noop() {// No operation performed.
            }

            var noop_1 = noop;

            /**
             * Converts `set` to an array of its values.
             *
             * @private
             * @param {Object} set The set to convert.
             * @returns {Array} Returns the values.
             */
            function setToArray(set) {
              var index = -1,
                  result = Array(set.size);
              set.forEach(function (value) {
                result[++index] = value;
              });
              return result;
            }

            var _setToArray = setToArray;

            /** Used as references for various `Number` constants. */


            var INFINITY = 1 / 0;
            /**
             * Creates a set object of `values`.
             *
             * @private
             * @param {Array} values The values to add to the set.
             * @returns {Object} Returns the new set.
             */

            var createSet = !(_Set && 1 / _setToArray(new _Set([, -0]))[1] == INFINITY) ? noop_1 : function (values) {
              return new _Set(values);
            };
            var _createSet = createSet;

            /** Used as the size to enable large array optimizations. */


            var LARGE_ARRAY_SIZE$1 = 200;
            /**
             * The base implementation of `_.uniqBy` without support for iteratee shorthands.
             *
             * @private
             * @param {Array} array The array to inspect.
             * @param {Function} [iteratee] The iteratee invoked per element.
             * @param {Function} [comparator] The comparator invoked per element.
             * @returns {Array} Returns the new duplicate free array.
             */

            function baseUniq(array, iteratee, comparator) {
              var index = -1,
                  includes = _arrayIncludes,
                  length = array.length,
                  isCommon = true,
                  result = [],
                  seen = result;

              if (comparator) {
                isCommon = false;
                includes = _arrayIncludesWith;
              } else if (length >= LARGE_ARRAY_SIZE$1) {
                var set = iteratee ? null : _createSet(array);

                if (set) {
                  return _setToArray(set);
                }

                isCommon = false;
                includes = _cacheHas;
                seen = new _SetCache();
              } else {
                seen = iteratee ? [] : result;
              }

              outer: while (++index < length) {
                var value = array[index],
                    computed = iteratee ? iteratee(value) : value;
                value = comparator || value !== 0 ? value : 0;

                if (isCommon && computed === computed) {
                  var seenIndex = seen.length;

                  while (seenIndex--) {
                    if (seen[seenIndex] === computed) {
                      continue outer;
                    }
                  }

                  if (iteratee) {
                    seen.push(computed);
                  }

                  result.push(value);
                } else if (!includes(seen, computed, comparator)) {
                  if (seen !== result) {
                    seen.push(computed);
                  }

                  result.push(value);
                }
              }

              return result;
            }

            var _baseUniq = baseUniq;

            /**
             * Creates a duplicate-free version of an array, using
             * [`SameValueZero`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero)
             * for equality comparisons, in which only the first occurrence of each element
             * is kept. The order of result values is determined by the order they occur
             * in the array.
             *
             * @static
             * @memberOf _
             * @since 0.1.0
             * @category Array
             * @param {Array} array The array to inspect.
             * @returns {Array} Returns the new duplicate free array.
             * @example
             *
             * _.uniq([2, 1, 2]);
             * // => [2, 1]
             */


            function uniq(array) {
              return array && array.length ? _baseUniq(array) : [];
            }

            var uniq_1 = uniq;

            var inherit_1 = createCommonjsModule(function (module, exports) {

            Object.defineProperty(exports, "__esModule", {
              value: true
            });
            exports.default = inherit;

            function _uniq() {
              const data = _interopRequireDefault(uniq_1);

              _uniq = function () {
                return data;
              };

              return data;
            }

            function _interopRequireDefault(obj) {
              return obj && obj.__esModule ? obj : {
                default: obj
              };
            }

            function inherit(key, child, parent) {
              if (child && parent) {
                child[key] = (0, _uniq().default)([].concat(child[key], parent[key]).filter(Boolean));
              }
            }
            });

            unwrapExports(inherit_1);

            var inheritInnerComments_1 = createCommonjsModule(function (module, exports) {

            Object.defineProperty(exports, "__esModule", {
              value: true
            });
            exports.default = inheritInnerComments;

            var _inherit = _interopRequireDefault(inherit_1);

            function _interopRequireDefault(obj) {
              return obj && obj.__esModule ? obj : {
                default: obj
              };
            }

            function inheritInnerComments(child, parent) {
              (0, _inherit.default)("innerComments", child, parent);
            }
            });

            unwrapExports(inheritInnerComments_1);

            var inheritLeadingComments_1 = createCommonjsModule(function (module, exports) {

            Object.defineProperty(exports, "__esModule", {
              value: true
            });
            exports.default = inheritLeadingComments;

            var _inherit = _interopRequireDefault(inherit_1);

            function _interopRequireDefault(obj) {
              return obj && obj.__esModule ? obj : {
                default: obj
              };
            }

            function inheritLeadingComments(child, parent) {
              (0, _inherit.default)("leadingComments", child, parent);
            }
            });

            unwrapExports(inheritLeadingComments_1);

            var inheritTrailingComments_1 = createCommonjsModule(function (module, exports) {

            Object.defineProperty(exports, "__esModule", {
              value: true
            });
            exports.default = inheritTrailingComments;

            var _inherit = _interopRequireDefault(inherit_1);

            function _interopRequireDefault(obj) {
              return obj && obj.__esModule ? obj : {
                default: obj
              };
            }

            function inheritTrailingComments(child, parent) {
              (0, _inherit.default)("trailingComments", child, parent);
            }
            });

            unwrapExports(inheritTrailingComments_1);

            var inheritsComments_1 = createCommonjsModule(function (module, exports) {

            Object.defineProperty(exports, "__esModule", {
              value: true
            });
            exports.default = inheritsComments;

            var _inheritTrailingComments = _interopRequireDefault(inheritTrailingComments_1);

            var _inheritLeadingComments = _interopRequireDefault(inheritLeadingComments_1);

            var _inheritInnerComments = _interopRequireDefault(inheritInnerComments_1);

            function _interopRequireDefault(obj) {
              return obj && obj.__esModule ? obj : {
                default: obj
              };
            }

            function inheritsComments(child, parent) {
              (0, _inheritTrailingComments.default)(child, parent);
              (0, _inheritLeadingComments.default)(child, parent);
              (0, _inheritInnerComments.default)(child, parent);
              return child;
            }
            });

            unwrapExports(inheritsComments_1);

            var removeComments_1 = createCommonjsModule(function (module, exports) {

            Object.defineProperty(exports, "__esModule", {
              value: true
            });
            exports.default = removeComments;



            function removeComments(node) {
              constants.COMMENT_KEYS.forEach(key => {
                node[key] = null;
              });

              return node;
            }
            });

            unwrapExports(removeComments_1);

            var generated$3 = createCommonjsModule(function (module, exports) {

            Object.defineProperty(exports, "__esModule", {
              value: true
            });
            exports.TSTYPE_TYPES = exports.TSTYPEELEMENT_TYPES = exports.PRIVATE_TYPES = exports.JSX_TYPES = exports.FLOWPREDICATE_TYPES = exports.FLOWDECLARATION_TYPES = exports.FLOWBASEANNOTATION_TYPES = exports.FLOWTYPE_TYPES = exports.FLOW_TYPES = exports.MODULESPECIFIER_TYPES = exports.EXPORTDECLARATION_TYPES = exports.MODULEDECLARATION_TYPES = exports.CLASS_TYPES = exports.PATTERN_TYPES = exports.UNARYLIKE_TYPES = exports.PROPERTY_TYPES = exports.OBJECTMEMBER_TYPES = exports.METHOD_TYPES = exports.USERWHITESPACABLE_TYPES = exports.IMMUTABLE_TYPES = exports.LITERAL_TYPES = exports.TSENTITYNAME_TYPES = exports.LVAL_TYPES = exports.PATTERNLIKE_TYPES = exports.DECLARATION_TYPES = exports.PUREISH_TYPES = exports.FUNCTIONPARENT_TYPES = exports.FUNCTION_TYPES = exports.FORXSTATEMENT_TYPES = exports.FOR_TYPES = exports.EXPRESSIONWRAPPER_TYPES = exports.WHILE_TYPES = exports.LOOP_TYPES = exports.CONDITIONAL_TYPES = exports.COMPLETIONSTATEMENT_TYPES = exports.TERMINATORLESS_TYPES = exports.STATEMENT_TYPES = exports.BLOCK_TYPES = exports.BLOCKPARENT_TYPES = exports.SCOPABLE_TYPES = exports.BINARY_TYPES = exports.EXPRESSION_TYPES = void 0;



            const EXPRESSION_TYPES = definitions.FLIPPED_ALIAS_KEYS["Expression"];
            exports.EXPRESSION_TYPES = EXPRESSION_TYPES;
            const BINARY_TYPES = definitions.FLIPPED_ALIAS_KEYS["Binary"];
            exports.BINARY_TYPES = BINARY_TYPES;
            const SCOPABLE_TYPES = definitions.FLIPPED_ALIAS_KEYS["Scopable"];
            exports.SCOPABLE_TYPES = SCOPABLE_TYPES;
            const BLOCKPARENT_TYPES = definitions.FLIPPED_ALIAS_KEYS["BlockParent"];
            exports.BLOCKPARENT_TYPES = BLOCKPARENT_TYPES;
            const BLOCK_TYPES = definitions.FLIPPED_ALIAS_KEYS["Block"];
            exports.BLOCK_TYPES = BLOCK_TYPES;
            const STATEMENT_TYPES = definitions.FLIPPED_ALIAS_KEYS["Statement"];
            exports.STATEMENT_TYPES = STATEMENT_TYPES;
            const TERMINATORLESS_TYPES = definitions.FLIPPED_ALIAS_KEYS["Terminatorless"];
            exports.TERMINATORLESS_TYPES = TERMINATORLESS_TYPES;
            const COMPLETIONSTATEMENT_TYPES = definitions.FLIPPED_ALIAS_KEYS["CompletionStatement"];
            exports.COMPLETIONSTATEMENT_TYPES = COMPLETIONSTATEMENT_TYPES;
            const CONDITIONAL_TYPES = definitions.FLIPPED_ALIAS_KEYS["Conditional"];
            exports.CONDITIONAL_TYPES = CONDITIONAL_TYPES;
            const LOOP_TYPES = definitions.FLIPPED_ALIAS_KEYS["Loop"];
            exports.LOOP_TYPES = LOOP_TYPES;
            const WHILE_TYPES = definitions.FLIPPED_ALIAS_KEYS["While"];
            exports.WHILE_TYPES = WHILE_TYPES;
            const EXPRESSIONWRAPPER_TYPES = definitions.FLIPPED_ALIAS_KEYS["ExpressionWrapper"];
            exports.EXPRESSIONWRAPPER_TYPES = EXPRESSIONWRAPPER_TYPES;
            const FOR_TYPES = definitions.FLIPPED_ALIAS_KEYS["For"];
            exports.FOR_TYPES = FOR_TYPES;
            const FORXSTATEMENT_TYPES = definitions.FLIPPED_ALIAS_KEYS["ForXStatement"];
            exports.FORXSTATEMENT_TYPES = FORXSTATEMENT_TYPES;
            const FUNCTION_TYPES = definitions.FLIPPED_ALIAS_KEYS["Function"];
            exports.FUNCTION_TYPES = FUNCTION_TYPES;
            const FUNCTIONPARENT_TYPES = definitions.FLIPPED_ALIAS_KEYS["FunctionParent"];
            exports.FUNCTIONPARENT_TYPES = FUNCTIONPARENT_TYPES;
            const PUREISH_TYPES = definitions.FLIPPED_ALIAS_KEYS["Pureish"];
            exports.PUREISH_TYPES = PUREISH_TYPES;
            const DECLARATION_TYPES = definitions.FLIPPED_ALIAS_KEYS["Declaration"];
            exports.DECLARATION_TYPES = DECLARATION_TYPES;
            const PATTERNLIKE_TYPES = definitions.FLIPPED_ALIAS_KEYS["PatternLike"];
            exports.PATTERNLIKE_TYPES = PATTERNLIKE_TYPES;
            const LVAL_TYPES = definitions.FLIPPED_ALIAS_KEYS["LVal"];
            exports.LVAL_TYPES = LVAL_TYPES;
            const TSENTITYNAME_TYPES = definitions.FLIPPED_ALIAS_KEYS["TSEntityName"];
            exports.TSENTITYNAME_TYPES = TSENTITYNAME_TYPES;
            const LITERAL_TYPES = definitions.FLIPPED_ALIAS_KEYS["Literal"];
            exports.LITERAL_TYPES = LITERAL_TYPES;
            const IMMUTABLE_TYPES = definitions.FLIPPED_ALIAS_KEYS["Immutable"];
            exports.IMMUTABLE_TYPES = IMMUTABLE_TYPES;
            const USERWHITESPACABLE_TYPES = definitions.FLIPPED_ALIAS_KEYS["UserWhitespacable"];
            exports.USERWHITESPACABLE_TYPES = USERWHITESPACABLE_TYPES;
            const METHOD_TYPES = definitions.FLIPPED_ALIAS_KEYS["Method"];
            exports.METHOD_TYPES = METHOD_TYPES;
            const OBJECTMEMBER_TYPES = definitions.FLIPPED_ALIAS_KEYS["ObjectMember"];
            exports.OBJECTMEMBER_TYPES = OBJECTMEMBER_TYPES;
            const PROPERTY_TYPES = definitions.FLIPPED_ALIAS_KEYS["Property"];
            exports.PROPERTY_TYPES = PROPERTY_TYPES;
            const UNARYLIKE_TYPES = definitions.FLIPPED_ALIAS_KEYS["UnaryLike"];
            exports.UNARYLIKE_TYPES = UNARYLIKE_TYPES;
            const PATTERN_TYPES = definitions.FLIPPED_ALIAS_KEYS["Pattern"];
            exports.PATTERN_TYPES = PATTERN_TYPES;
            const CLASS_TYPES = definitions.FLIPPED_ALIAS_KEYS["Class"];
            exports.CLASS_TYPES = CLASS_TYPES;
            const MODULEDECLARATION_TYPES = definitions.FLIPPED_ALIAS_KEYS["ModuleDeclaration"];
            exports.MODULEDECLARATION_TYPES = MODULEDECLARATION_TYPES;
            const EXPORTDECLARATION_TYPES = definitions.FLIPPED_ALIAS_KEYS["ExportDeclaration"];
            exports.EXPORTDECLARATION_TYPES = EXPORTDECLARATION_TYPES;
            const MODULESPECIFIER_TYPES = definitions.FLIPPED_ALIAS_KEYS["ModuleSpecifier"];
            exports.MODULESPECIFIER_TYPES = MODULESPECIFIER_TYPES;
            const FLOW_TYPES = definitions.FLIPPED_ALIAS_KEYS["Flow"];
            exports.FLOW_TYPES = FLOW_TYPES;
            const FLOWTYPE_TYPES = definitions.FLIPPED_ALIAS_KEYS["FlowType"];
            exports.FLOWTYPE_TYPES = FLOWTYPE_TYPES;
            const FLOWBASEANNOTATION_TYPES = definitions.FLIPPED_ALIAS_KEYS["FlowBaseAnnotation"];
            exports.FLOWBASEANNOTATION_TYPES = FLOWBASEANNOTATION_TYPES;
            const FLOWDECLARATION_TYPES = definitions.FLIPPED_ALIAS_KEYS["FlowDeclaration"];
            exports.FLOWDECLARATION_TYPES = FLOWDECLARATION_TYPES;
            const FLOWPREDICATE_TYPES = definitions.FLIPPED_ALIAS_KEYS["FlowPredicate"];
            exports.FLOWPREDICATE_TYPES = FLOWPREDICATE_TYPES;
            const JSX_TYPES = definitions.FLIPPED_ALIAS_KEYS["JSX"];
            exports.JSX_TYPES = JSX_TYPES;
            const PRIVATE_TYPES = definitions.FLIPPED_ALIAS_KEYS["Private"];
            exports.PRIVATE_TYPES = PRIVATE_TYPES;
            const TSTYPEELEMENT_TYPES = definitions.FLIPPED_ALIAS_KEYS["TSTypeElement"];
            exports.TSTYPEELEMENT_TYPES = TSTYPEELEMENT_TYPES;
            const TSTYPE_TYPES = definitions.FLIPPED_ALIAS_KEYS["TSType"];
            exports.TSTYPE_TYPES = TSTYPE_TYPES;
            });

            unwrapExports(generated$3);
            var generated_1$3 = generated$3.TSTYPE_TYPES;
            var generated_2$3 = generated$3.TSTYPEELEMENT_TYPES;
            var generated_3$3 = generated$3.PRIVATE_TYPES;
            var generated_4$3 = generated$3.JSX_TYPES;
            var generated_5$3 = generated$3.FLOWPREDICATE_TYPES;
            var generated_6$3 = generated$3.FLOWDECLARATION_TYPES;
            var generated_7$3 = generated$3.FLOWBASEANNOTATION_TYPES;
            var generated_8$3 = generated$3.FLOWTYPE_TYPES;
            var generated_9$3 = generated$3.FLOW_TYPES;
            var generated_10$3 = generated$3.MODULESPECIFIER_TYPES;
            var generated_11$3 = generated$3.EXPORTDECLARATION_TYPES;
            var generated_12$3 = generated$3.MODULEDECLARATION_TYPES;
            var generated_13$3 = generated$3.CLASS_TYPES;
            var generated_14$3 = generated$3.PATTERN_TYPES;
            var generated_15$3 = generated$3.UNARYLIKE_TYPES;
            var generated_16$3 = generated$3.PROPERTY_TYPES;
            var generated_17$3 = generated$3.OBJECTMEMBER_TYPES;
            var generated_18$3 = generated$3.METHOD_TYPES;
            var generated_19$3 = generated$3.USERWHITESPACABLE_TYPES;
            var generated_20$3 = generated$3.IMMUTABLE_TYPES;
            var generated_21$3 = generated$3.LITERAL_TYPES;
            var generated_22$3 = generated$3.TSENTITYNAME_TYPES;
            var generated_23$3 = generated$3.LVAL_TYPES;
            var generated_24$3 = generated$3.PATTERNLIKE_TYPES;
            var generated_25$3 = generated$3.DECLARATION_TYPES;
            var generated_26$3 = generated$3.PUREISH_TYPES;
            var generated_27$3 = generated$3.FUNCTIONPARENT_TYPES;
            var generated_28$3 = generated$3.FUNCTION_TYPES;
            var generated_29$3 = generated$3.FORXSTATEMENT_TYPES;
            var generated_30$3 = generated$3.FOR_TYPES;
            var generated_31$3 = generated$3.EXPRESSIONWRAPPER_TYPES;
            var generated_32$3 = generated$3.WHILE_TYPES;
            var generated_33$3 = generated$3.LOOP_TYPES;
            var generated_34$3 = generated$3.CONDITIONAL_TYPES;
            var generated_35$3 = generated$3.COMPLETIONSTATEMENT_TYPES;
            var generated_36$3 = generated$3.TERMINATORLESS_TYPES;
            var generated_37$3 = generated$3.STATEMENT_TYPES;
            var generated_38$3 = generated$3.BLOCK_TYPES;
            var generated_39$3 = generated$3.BLOCKPARENT_TYPES;
            var generated_40$3 = generated$3.SCOPABLE_TYPES;
            var generated_41$3 = generated$3.BINARY_TYPES;
            var generated_42$3 = generated$3.EXPRESSION_TYPES;

            var toBlock_1 = createCommonjsModule(function (module, exports) {

            Object.defineProperty(exports, "__esModule", {
              value: true
            });
            exports.default = toBlock;





            function toBlock(node, parent) {
              if ((0, generated.isBlockStatement)(node)) {
                return node;
              }

              let blockNodes = [];

              if ((0, generated.isEmptyStatement)(node)) {
                blockNodes = [];
              } else {
                if (!(0, generated.isStatement)(node)) {
                  if ((0, generated.isFunction)(parent)) {
                    node = (0, generated$1.returnStatement)(node);
                  } else {
                    node = (0, generated$1.expressionStatement)(node);
                  }
                }

                blockNodes = [node];
              }

              return (0, generated$1.blockStatement)(blockNodes);
            }
            });

            unwrapExports(toBlock_1);

            var ensureBlock_1 = createCommonjsModule(function (module, exports) {

            Object.defineProperty(exports, "__esModule", {
              value: true
            });
            exports.default = ensureBlock;

            var _toBlock = _interopRequireDefault(toBlock_1);

            function _interopRequireDefault(obj) {
              return obj && obj.__esModule ? obj : {
                default: obj
              };
            }

            function ensureBlock(node, key = "body") {
              return node[key] = (0, _toBlock.default)(node[key], node);
            }
            });

            unwrapExports(ensureBlock_1);

            var toIdentifier_1 = createCommonjsModule(function (module, exports) {

            Object.defineProperty(exports, "__esModule", {
              value: true
            });
            exports.default = toIdentifier;

            var _isValidIdentifier = _interopRequireDefault(isValidIdentifier_1);

            function _interopRequireDefault(obj) {
              return obj && obj.__esModule ? obj : {
                default: obj
              };
            }

            function toIdentifier(name) {
              name = name + "";
              name = name.replace(/[^a-zA-Z0-9$_]/g, "-");
              name = name.replace(/^[-0-9]+/, "");
              name = name.replace(/[-\s]+(.)?/g, function (match, c) {
                return c ? c.toUpperCase() : "";
              });

              if (!(0, _isValidIdentifier.default)(name)) {
                name = `_${name}`;
              }

              return name || "_";
            }
            });

            unwrapExports(toIdentifier_1);

            var toBindingIdentifierName_1 = createCommonjsModule(function (module, exports) {

            Object.defineProperty(exports, "__esModule", {
              value: true
            });
            exports.default = toBindingIdentifierName;

            var _toIdentifier = _interopRequireDefault(toIdentifier_1);

            function _interopRequireDefault(obj) {
              return obj && obj.__esModule ? obj : {
                default: obj
              };
            }

            function toBindingIdentifierName(name) {
              name = (0, _toIdentifier.default)(name);
              if (name === "eval" || name === "arguments") name = "_" + name;
              return name;
            }
            });

            unwrapExports(toBindingIdentifierName_1);

            var toComputedKey_1 = createCommonjsModule(function (module, exports) {

            Object.defineProperty(exports, "__esModule", {
              value: true
            });
            exports.default = toComputedKey;





            function toComputedKey(node, key = node.key || node.property) {
              if (!node.computed && (0, generated.isIdentifier)(key)) key = (0, generated$1.stringLiteral)(key.name);
              return key;
            }
            });

            unwrapExports(toComputedKey_1);

            var toExpression_1 = createCommonjsModule(function (module, exports) {

            Object.defineProperty(exports, "__esModule", {
              value: true
            });
            exports.default = toExpression;



            function toExpression(node) {
              if ((0, generated.isExpressionStatement)(node)) {
                node = node.expression;
              }

              if ((0, generated.isExpression)(node)) {
                return node;
              }

              if ((0, generated.isClass)(node)) {
                node.type = "ClassExpression";
              } else if ((0, generated.isFunction)(node)) {
                node.type = "FunctionExpression";
              }

              if (!(0, generated.isExpression)(node)) {
                throw new Error(`cannot turn ${node.type} to an expression`);
              }

              return node;
            }
            });

            unwrapExports(toExpression_1);

            var traverseFast_1 = createCommonjsModule(function (module, exports) {

            Object.defineProperty(exports, "__esModule", {
              value: true
            });
            exports.default = traverseFast;



            function traverseFast(node, enter, opts) {
              if (!node) return;
              const keys = definitions.VISITOR_KEYS[node.type];
              if (!keys) return;
              opts = opts || {};
              enter(node, opts);

              for (const key of keys) {
                const subNode = node[key];

                if (Array.isArray(subNode)) {
                  for (const node of subNode) {
                    traverseFast(node, enter, opts);
                  }
                } else {
                  traverseFast(subNode, enter, opts);
                }
              }
            }
            });

            unwrapExports(traverseFast_1);

            var removeProperties_1 = createCommonjsModule(function (module, exports) {

            Object.defineProperty(exports, "__esModule", {
              value: true
            });
            exports.default = removeProperties;



            const CLEAR_KEYS = ["tokens", "start", "end", "loc", "raw", "rawValue"];

            const CLEAR_KEYS_PLUS_COMMENTS = constants.COMMENT_KEYS.concat(["comments"]).concat(CLEAR_KEYS);

            function removeProperties(node, opts = {}) {
              const map = opts.preserveComments ? CLEAR_KEYS : CLEAR_KEYS_PLUS_COMMENTS;

              for (const key of map) {
                if (node[key] != null) node[key] = undefined;
              }

              for (const key in node) {
                if (key[0] === "_" && node[key] != null) node[key] = undefined;
              }

              const symbols = Object.getOwnPropertySymbols(node);

              for (const sym of symbols) {
                node[sym] = null;
              }
            }
            });

            unwrapExports(removeProperties_1);

            var removePropertiesDeep_1 = createCommonjsModule(function (module, exports) {

            Object.defineProperty(exports, "__esModule", {
              value: true
            });
            exports.default = removePropertiesDeep;

            var _traverseFast = _interopRequireDefault(traverseFast_1);

            var _removeProperties = _interopRequireDefault(removeProperties_1);

            function _interopRequireDefault(obj) {
              return obj && obj.__esModule ? obj : {
                default: obj
              };
            }

            function removePropertiesDeep(tree, opts) {
              (0, _traverseFast.default)(tree, _removeProperties.default, opts);
              return tree;
            }
            });

            unwrapExports(removePropertiesDeep_1);

            var toKeyAlias_1 = createCommonjsModule(function (module, exports) {

            Object.defineProperty(exports, "__esModule", {
              value: true
            });
            exports.default = toKeyAlias;



            var _cloneNode = _interopRequireDefault(cloneNode_1);

            var _removePropertiesDeep = _interopRequireDefault(removePropertiesDeep_1);

            function _interopRequireDefault(obj) {
              return obj && obj.__esModule ? obj : {
                default: obj
              };
            }

            function toKeyAlias(node, key = node.key) {
              let alias;

              if (node.kind === "method") {
                return toKeyAlias.increment() + "";
              } else if ((0, generated.isIdentifier)(key)) {
                alias = key.name;
              } else if ((0, generated.isStringLiteral)(key)) {
                alias = JSON.stringify(key.value);
              } else {
                alias = JSON.stringify((0, _removePropertiesDeep.default)((0, _cloneNode.default)(key)));
              }

              if (node.computed) {
                alias = `[${alias}]`;
              }

              if (node.static) {
                alias = `static:${alias}`;
              }

              return alias;
            }

            toKeyAlias.uid = 0;

            toKeyAlias.increment = function () {
              if (toKeyAlias.uid >= Number.MAX_SAFE_INTEGER) {
                return toKeyAlias.uid = 0;
              } else {
                return toKeyAlias.uid++;
              }
            };
            });

            unwrapExports(toKeyAlias_1);

            var getBindingIdentifiers_1 = createCommonjsModule(function (module, exports) {

            Object.defineProperty(exports, "__esModule", {
              value: true
            });
            exports.default = getBindingIdentifiers;



            function getBindingIdentifiers(node, duplicates, outerOnly) {
              let search = [].concat(node);
              const ids = Object.create(null);

              while (search.length) {
                const id = search.shift();
                if (!id) continue;
                const keys = getBindingIdentifiers.keys[id.type];

                if ((0, generated.isIdentifier)(id)) {
                  if (duplicates) {
                    const _ids = ids[id.name] = ids[id.name] || [];

                    _ids.push(id);
                  } else {
                    ids[id.name] = id;
                  }

                  continue;
                }

                if ((0, generated.isExportDeclaration)(id)) {
                  if ((0, generated.isDeclaration)(id.declaration)) {
                    search.push(id.declaration);
                  }

                  continue;
                }

                if (outerOnly) {
                  if ((0, generated.isFunctionDeclaration)(id)) {
                    search.push(id.id);
                    continue;
                  }

                  if ((0, generated.isFunctionExpression)(id)) {
                    continue;
                  }
                }

                if (keys) {
                  for (let i = 0; i < keys.length; i++) {
                    const key = keys[i];

                    if (id[key]) {
                      search = search.concat(id[key]);
                    }
                  }
                }
              }

              return ids;
            }

            getBindingIdentifiers.keys = {
              DeclareClass: ["id"],
              DeclareFunction: ["id"],
              DeclareModule: ["id"],
              DeclareVariable: ["id"],
              DeclareInterface: ["id"],
              DeclareTypeAlias: ["id"],
              DeclareOpaqueType: ["id"],
              InterfaceDeclaration: ["id"],
              TypeAlias: ["id"],
              OpaqueType: ["id"],
              CatchClause: ["param"],
              LabeledStatement: ["label"],
              UnaryExpression: ["argument"],
              AssignmentExpression: ["left"],
              ImportSpecifier: ["local"],
              ImportNamespaceSpecifier: ["local"],
              ImportDefaultSpecifier: ["local"],
              ImportDeclaration: ["specifiers"],
              ExportSpecifier: ["exported"],
              ExportNamespaceSpecifier: ["exported"],
              ExportDefaultSpecifier: ["exported"],
              FunctionDeclaration: ["id", "params"],
              FunctionExpression: ["id", "params"],
              ArrowFunctionExpression: ["params"],
              ObjectMethod: ["params"],
              ClassMethod: ["params"],
              ForInStatement: ["left"],
              ForOfStatement: ["left"],
              ClassDeclaration: ["id"],
              ClassExpression: ["id"],
              RestElement: ["argument"],
              UpdateExpression: ["argument"],
              ObjectProperty: ["value"],
              AssignmentPattern: ["left"],
              ArrayPattern: ["elements"],
              ObjectPattern: ["properties"],
              VariableDeclaration: ["declarations"],
              VariableDeclarator: ["id"]
            };
            });

            unwrapExports(getBindingIdentifiers_1);

            var gatherSequenceExpressions_1 = createCommonjsModule(function (module, exports) {

            Object.defineProperty(exports, "__esModule", {
              value: true
            });
            exports.default = gatherSequenceExpressions;

            var _getBindingIdentifiers = _interopRequireDefault(getBindingIdentifiers_1);





            var _cloneNode = _interopRequireDefault(cloneNode_1);

            function _interopRequireDefault(obj) {
              return obj && obj.__esModule ? obj : {
                default: obj
              };
            }

            function gatherSequenceExpressions(nodes, scope, declars) {
              const exprs = [];
              let ensureLastUndefined = true;

              for (const node of nodes) {
                ensureLastUndefined = false;

                if ((0, generated.isExpression)(node)) {
                  exprs.push(node);
                } else if ((0, generated.isExpressionStatement)(node)) {
                  exprs.push(node.expression);
                } else if ((0, generated.isVariableDeclaration)(node)) {
                  if (node.kind !== "var") return;

                  for (const declar of node.declarations) {
                    const bindings = (0, _getBindingIdentifiers.default)(declar);

                    for (const key in bindings) {
                      declars.push({
                        kind: node.kind,
                        id: (0, _cloneNode.default)(bindings[key])
                      });
                    }

                    if (declar.init) {
                      exprs.push((0, generated$1.assignmentExpression)("=", declar.id, declar.init));
                    }
                  }

                  ensureLastUndefined = true;
                } else if ((0, generated.isIfStatement)(node)) {
                  const consequent = node.consequent ? gatherSequenceExpressions([node.consequent], scope, declars) : scope.buildUndefinedNode();
                  const alternate = node.alternate ? gatherSequenceExpressions([node.alternate], scope, declars) : scope.buildUndefinedNode();
                  if (!consequent || !alternate) return;
                  exprs.push((0, generated$1.conditionalExpression)(node.test, consequent, alternate));
                } else if ((0, generated.isBlockStatement)(node)) {
                  const body = gatherSequenceExpressions(node.body, scope, declars);
                  if (!body) return;
                  exprs.push(body);
                } else if ((0, generated.isEmptyStatement)(node)) {
                  ensureLastUndefined = true;
                } else {
                  return;
                }
              }

              if (ensureLastUndefined) {
                exprs.push(scope.buildUndefinedNode());
              }

              if (exprs.length === 1) {
                return exprs[0];
              } else {
                return (0, generated$1.sequenceExpression)(exprs);
              }
            }
            });

            unwrapExports(gatherSequenceExpressions_1);

            var toSequenceExpression_1 = createCommonjsModule(function (module, exports) {

            Object.defineProperty(exports, "__esModule", {
              value: true
            });
            exports.default = toSequenceExpression;

            var _gatherSequenceExpressions = _interopRequireDefault(gatherSequenceExpressions_1);

            function _interopRequireDefault(obj) {
              return obj && obj.__esModule ? obj : {
                default: obj
              };
            }

            function toSequenceExpression(nodes, scope) {
              if (!nodes || !nodes.length) return;
              const declars = [];
              const result = (0, _gatherSequenceExpressions.default)(nodes, scope, declars);
              if (!result) return;

              for (const declar of declars) {
                scope.push(declar);
              }

              return result;
            }
            });

            unwrapExports(toSequenceExpression_1);

            var toStatement_1 = createCommonjsModule(function (module, exports) {

            Object.defineProperty(exports, "__esModule", {
              value: true
            });
            exports.default = toStatement;





            function toStatement(node, ignore) {
              if ((0, generated.isStatement)(node)) {
                return node;
              }

              let mustHaveId = false;
              let newType;

              if ((0, generated.isClass)(node)) {
                mustHaveId = true;
                newType = "ClassDeclaration";
              } else if ((0, generated.isFunction)(node)) {
                mustHaveId = true;
                newType = "FunctionDeclaration";
              } else if ((0, generated.isAssignmentExpression)(node)) {
                return (0, generated$1.expressionStatement)(node);
              }

              if (mustHaveId && !node.id) {
                newType = false;
              }

              if (!newType) {
                if (ignore) {
                  return false;
                } else {
                  throw new Error(`cannot turn ${node.type} to a statement`);
                }
              }

              node.type = newType;
              return node;
            }
            });

            unwrapExports(toStatement_1);

            /** `Object#toString` result references. */


            var objectTag$3 = '[object Object]';
            /** Used for built-in method references. */

            var funcProto$2 = Function.prototype,
                objectProto$d = Object.prototype;
            /** Used to resolve the decompiled source of functions. */

            var funcToString$2 = funcProto$2.toString;
            /** Used to check objects for own properties. */

            var hasOwnProperty$a = objectProto$d.hasOwnProperty;
            /** Used to infer the `Object` constructor. */

            var objectCtorString = funcToString$2.call(Object);
            /**
             * Checks if `value` is a plain object, that is, an object created by the
             * `Object` constructor or one with a `[[Prototype]]` of `null`.
             *
             * @static
             * @memberOf _
             * @since 0.8.0
             * @category Lang
             * @param {*} value The value to check.
             * @returns {boolean} Returns `true` if `value` is a plain object, else `false`.
             * @example
             *
             * function Foo() {
             *   this.a = 1;
             * }
             *
             * _.isPlainObject(new Foo);
             * // => false
             *
             * _.isPlainObject([1, 2, 3]);
             * // => false
             *
             * _.isPlainObject({ 'x': 0, 'y': 0 });
             * // => true
             *
             * _.isPlainObject(Object.create(null));
             * // => true
             */

            function isPlainObject(value) {
              if (!isObjectLike_1(value) || _baseGetTag(value) != objectTag$3) {
                return false;
              }

              var proto = _getPrototype(value);

              if (proto === null) {
                return true;
              }

              var Ctor = hasOwnProperty$a.call(proto, 'constructor') && proto.constructor;
              return typeof Ctor == 'function' && Ctor instanceof Ctor && funcToString$2.call(Ctor) == objectCtorString;
            }

            var isPlainObject_1 = isPlainObject;

            /** `Object#toString` result references. */


            var regexpTag$3 = '[object RegExp]';
            /**
             * The base implementation of `_.isRegExp` without Node.js optimizations.
             *
             * @private
             * @param {*} value The value to check.
             * @returns {boolean} Returns `true` if `value` is a regexp, else `false`.
             */

            function baseIsRegExp(value) {
              return isObjectLike_1(value) && _baseGetTag(value) == regexpTag$3;
            }

            var _baseIsRegExp = baseIsRegExp;

            /* Node.js helper references. */


            var nodeIsRegExp = _nodeUtil && _nodeUtil.isRegExp;
            /**
             * Checks if `value` is classified as a `RegExp` object.
             *
             * @static
             * @memberOf _
             * @since 0.1.0
             * @category Lang
             * @param {*} value The value to check.
             * @returns {boolean} Returns `true` if `value` is a regexp, else `false`.
             * @example
             *
             * _.isRegExp(/abc/);
             * // => true
             *
             * _.isRegExp('/abc/');
             * // => false
             */

            var isRegExp = nodeIsRegExp ? _baseUnary(nodeIsRegExp) : _baseIsRegExp;
            var isRegExp_1 = isRegExp;

            var valueToNode_1 = createCommonjsModule(function (module, exports) {

            Object.defineProperty(exports, "__esModule", {
              value: true
            });
            exports.default = valueToNode;

            function _isPlainObject() {
              const data = _interopRequireDefault(isPlainObject_1);

              _isPlainObject = function () {
                return data;
              };

              return data;
            }

            function _isRegExp() {
              const data = _interopRequireDefault(isRegExp_1);

              _isRegExp = function () {
                return data;
              };

              return data;
            }

            var _isValidIdentifier = _interopRequireDefault(isValidIdentifier_1);



            function _interopRequireDefault(obj) {
              return obj && obj.__esModule ? obj : {
                default: obj
              };
            }

            function valueToNode(value) {
              if (value === undefined) {
                return (0, generated$1.identifier)("undefined");
              }

              if (value === true || value === false) {
                return (0, generated$1.booleanLiteral)(value);
              }

              if (value === null) {
                return (0, generated$1.nullLiteral)();
              }

              if (typeof value === "string") {
                return (0, generated$1.stringLiteral)(value);
              }

              if (typeof value === "number") {
                let result;

                if (Number.isFinite(value)) {
                  result = (0, generated$1.numericLiteral)(Math.abs(value));
                } else {
                  let numerator;

                  if (Number.isNaN(value)) {
                    numerator = (0, generated$1.numericLiteral)(0);
                  } else {
                    numerator = (0, generated$1.numericLiteral)(1);
                  }

                  result = (0, generated$1.binaryExpression)("/", numerator, (0, generated$1.numericLiteral)(0));
                }

                if (value < 0 || Object.is(value, -0)) {
                  result = (0, generated$1.unaryExpression)("-", result);
                }

                return result;
              }

              if ((0, _isRegExp().default)(value)) {
                const pattern = value.source;
                const flags = value.toString().match(/\/([a-z]+|)$/)[1];
                return (0, generated$1.regExpLiteral)(pattern, flags);
              }

              if (Array.isArray(value)) {
                return (0, generated$1.arrayExpression)(value.map(valueToNode));
              }

              if ((0, _isPlainObject().default)(value)) {
                const props = [];

                for (const key in value) {
                  let nodeKey;

                  if ((0, _isValidIdentifier.default)(key)) {
                    nodeKey = (0, generated$1.identifier)(key);
                  } else {
                    nodeKey = (0, generated$1.stringLiteral)(key);
                  }

                  props.push((0, generated$1.objectProperty)(nodeKey, valueToNode(value[key])));
                }

                return (0, generated$1.objectExpression)(props);
              }

              throw new Error("don't know how to turn this value into a node");
            }
            });

            unwrapExports(valueToNode_1);

            var appendToMemberExpression_1 = createCommonjsModule(function (module, exports) {

            Object.defineProperty(exports, "__esModule", {
              value: true
            });
            exports.default = appendToMemberExpression;



            function appendToMemberExpression(member, append, computed = false) {
              member.object = (0, generated$1.memberExpression)(member.object, member.property, member.computed);
              member.property = append;
              member.computed = !!computed;
              return member;
            }
            });

            unwrapExports(appendToMemberExpression_1);

            var inherits_1 = createCommonjsModule(function (module, exports) {

            Object.defineProperty(exports, "__esModule", {
              value: true
            });
            exports.default = inherits;



            var _inheritsComments = _interopRequireDefault(inheritsComments_1);

            function _interopRequireDefault(obj) {
              return obj && obj.__esModule ? obj : {
                default: obj
              };
            }

            function inherits(child, parent) {
              if (!child || !parent) return child;

              for (const key of constants.INHERIT_KEYS.optional) {
                if (child[key] == null) {
                  child[key] = parent[key];
                }
              }

              for (const key in parent) {
                if (key[0] === "_" && key !== "__clone") child[key] = parent[key];
              }

              for (const key of constants.INHERIT_KEYS.force) {
                child[key] = parent[key];
              }

              (0, _inheritsComments.default)(child, parent);
              return child;
            }
            });

            unwrapExports(inherits_1);

            var prependToMemberExpression_1 = createCommonjsModule(function (module, exports) {

            Object.defineProperty(exports, "__esModule", {
              value: true
            });
            exports.default = prependToMemberExpression;



            function prependToMemberExpression(member, prepend) {
              member.object = (0, generated$1.memberExpression)(prepend, member.object);
              return member;
            }
            });

            unwrapExports(prependToMemberExpression_1);

            var getOuterBindingIdentifiers_1 = createCommonjsModule(function (module, exports) {

            Object.defineProperty(exports, "__esModule", {
              value: true
            });
            exports.default = getOuterBindingIdentifiers;

            var _getBindingIdentifiers = _interopRequireDefault(getBindingIdentifiers_1);

            function _interopRequireDefault(obj) {
              return obj && obj.__esModule ? obj : {
                default: obj
              };
            }

            function getOuterBindingIdentifiers(node, duplicates) {
              return (0, _getBindingIdentifiers.default)(node, duplicates, true);
            }
            });

            unwrapExports(getOuterBindingIdentifiers_1);

            var traverse_1 = createCommonjsModule(function (module, exports) {

            Object.defineProperty(exports, "__esModule", {
              value: true
            });
            exports.default = traverse;



            function traverse(node, handlers, state) {
              if (typeof handlers === "function") {
                handlers = {
                  enter: handlers
                };
              }

              const _handlers = handlers,
                    enter = _handlers.enter,
                    exit = _handlers.exit;
              traverseSimpleImpl(node, enter, exit, state, []);
            }

            function traverseSimpleImpl(node, enter, exit, state, ancestors) {
              const keys = definitions.VISITOR_KEYS[node.type];
              if (!keys) return;
              if (enter) enter(node, ancestors, state);

              for (const key of keys) {
                const subNode = node[key];

                if (Array.isArray(subNode)) {
                  for (let i = 0; i < subNode.length; i++) {
                    const child = subNode[i];
                    if (!child) continue;
                    ancestors.push({
                      node,
                      key,
                      index: i
                    });
                    traverseSimpleImpl(child, enter, exit, state, ancestors);
                    ancestors.pop();
                  }
                } else if (subNode) {
                  ancestors.push({
                    node,
                    key
                  });
                  traverseSimpleImpl(subNode, enter, exit, state, ancestors);
                  ancestors.pop();
                }
              }

              if (exit) exit(node, ancestors, state);
            }
            });

            unwrapExports(traverse_1);

            var isBinding_1 = createCommonjsModule(function (module, exports) {

            Object.defineProperty(exports, "__esModule", {
              value: true
            });
            exports.default = isBinding;

            var _getBindingIdentifiers = _interopRequireDefault(getBindingIdentifiers_1);

            function _interopRequireDefault(obj) {
              return obj && obj.__esModule ? obj : {
                default: obj
              };
            }

            function isBinding(node, parent) {
              const keys = _getBindingIdentifiers.default.keys[parent.type];

              if (keys) {
                for (let i = 0; i < keys.length; i++) {
                  const key = keys[i];
                  const val = parent[key];

                  if (Array.isArray(val)) {
                    if (val.indexOf(node) >= 0) return true;
                  } else {
                    if (val === node) return true;
                  }
                }
              }

              return false;
            }
            });

            unwrapExports(isBinding_1);

            var isLet_1 = createCommonjsModule(function (module, exports) {

            Object.defineProperty(exports, "__esModule", {
              value: true
            });
            exports.default = isLet;





            function isLet(node) {
              return (0, generated.isVariableDeclaration)(node) && (node.kind !== "var" || node[constants.BLOCK_SCOPED_SYMBOL]);
            }
            });

            unwrapExports(isLet_1);

            var isBlockScoped_1 = createCommonjsModule(function (module, exports) {

            Object.defineProperty(exports, "__esModule", {
              value: true
            });
            exports.default = isBlockScoped;



            var _isLet = _interopRequireDefault(isLet_1);

            function _interopRequireDefault(obj) {
              return obj && obj.__esModule ? obj : {
                default: obj
              };
            }

            function isBlockScoped(node) {
              return (0, generated.isFunctionDeclaration)(node) || (0, generated.isClassDeclaration)(node) || (0, _isLet.default)(node);
            }
            });

            unwrapExports(isBlockScoped_1);

            var isImmutable_1 = createCommonjsModule(function (module, exports) {

            Object.defineProperty(exports, "__esModule", {
              value: true
            });
            exports.default = isImmutable;

            var _isType = _interopRequireDefault(isType_1);



            function _interopRequireDefault(obj) {
              return obj && obj.__esModule ? obj : {
                default: obj
              };
            }

            function isImmutable(node) {
              if ((0, _isType.default)(node.type, "Immutable")) return true;

              if ((0, generated.isIdentifier)(node)) {
                if (node.name === "undefined") {
                  return true;
                } else {
                  return false;
                }
              }

              return false;
            }
            });

            unwrapExports(isImmutable_1);

            var isNodesEquivalent_1 = createCommonjsModule(function (module, exports) {

            Object.defineProperty(exports, "__esModule", {
              value: true
            });
            exports.default = isNodesEquivalent;



            function isNodesEquivalent(a, b) {
              if (typeof a !== "object" || typeof b !== "object" || a == null || b == null) {
                return a === b;
              }

              if (a.type !== b.type) {
                return false;
              }

              const fields = Object.keys(definitions.NODE_FIELDS[a.type] || a.type);
              const visitorKeys = definitions.VISITOR_KEYS[a.type];

              for (const field of fields) {
                if (typeof a[field] !== typeof b[field]) {
                  return false;
                }

                if (Array.isArray(a[field])) {
                  if (!Array.isArray(b[field])) {
                    return false;
                  }

                  if (a[field].length !== b[field].length) {
                    return false;
                  }

                  for (let i = 0; i < a[field].length; i++) {
                    if (!isNodesEquivalent(a[field][i], b[field][i])) {
                      return false;
                    }
                  }

                  continue;
                }

                if (typeof a[field] === "object" && (!visitorKeys || !visitorKeys.includes(field))) {
                  for (const key in a[field]) {
                    if (a[field][key] !== b[field][key]) {
                      return false;
                    }
                  }

                  continue;
                }

                if (!isNodesEquivalent(a[field], b[field])) {
                  return false;
                }
              }

              return true;
            }
            });

            unwrapExports(isNodesEquivalent_1);

            var isReferenced_1 = createCommonjsModule(function (module, exports) {

            Object.defineProperty(exports, "__esModule", {
              value: true
            });
            exports.default = isReferenced;

            function isReferenced(node, parent) {
              switch (parent.type) {
                case "MemberExpression":
                case "JSXMemberExpression":
                case "OptionalMemberExpression":
                  if (parent.property === node) {
                    return !!parent.computed;
                  }

                  return parent.object === node;

                case "VariableDeclarator":
                  return parent.init === node;

                case "ArrowFunctionExpression":
                  return parent.body === node;

                case "ExportSpecifier":
                  if (parent.source) {
                    return false;
                  }

                  return parent.local === node;

                case "ObjectProperty":
                case "ClassProperty":
                case "ClassPrivateProperty":
                case "ClassMethod":
                case "ClassPrivateMethod":
                case "ObjectMethod":
                  if (parent.key === node) {
                    return !!parent.computed;
                  }

                  return parent.value === node;

                case "ClassDeclaration":
                case "ClassExpression":
                  return parent.superClass === node;

                case "AssignmentExpression":
                  return parent.right === node;

                case "AssignmentPattern":
                  return parent.right === node;

                case "LabeledStatement":
                  return false;

                case "CatchClause":
                  return false;

                case "RestElement":
                  return false;

                case "BreakStatement":
                case "ContinueStatement":
                  return false;

                case "FunctionDeclaration":
                case "FunctionExpression":
                  return false;

                case "ExportNamespaceSpecifier":
                case "ExportDefaultSpecifier":
                  return false;

                case "ImportDefaultSpecifier":
                case "ImportNamespaceSpecifier":
                case "ImportSpecifier":
                  return false;

                case "JSXAttribute":
                  return false;

                case "ObjectPattern":
                case "ArrayPattern":
                  return false;

                case "MetaProperty":
                  return false;

                case "ObjectTypeProperty":
                  return parent.key !== node;
              }

              return true;
            }
            });

            unwrapExports(isReferenced_1);

            var isScope_1 = createCommonjsModule(function (module, exports) {

            Object.defineProperty(exports, "__esModule", {
              value: true
            });
            exports.default = isScope;



            function isScope(node, parent) {
              if ((0, generated.isBlockStatement)(node) && (0, generated.isFunction)(parent, {
                body: node
              })) {
                return false;
              }

              if ((0, generated.isBlockStatement)(node) && (0, generated.isCatchClause)(parent, {
                body: node
              })) {
                return false;
              }

              return (0, generated.isScopable)(node);
            }
            });

            unwrapExports(isScope_1);

            var isSpecifierDefault_1 = createCommonjsModule(function (module, exports) {

            Object.defineProperty(exports, "__esModule", {
              value: true
            });
            exports.default = isSpecifierDefault;



            function isSpecifierDefault(specifier) {
              return (0, generated.isImportDefaultSpecifier)(specifier) || (0, generated.isIdentifier)(specifier.imported || specifier.exported, {
                name: "default"
              });
            }
            });

            unwrapExports(isSpecifierDefault_1);

            var isValidES3Identifier_1 = createCommonjsModule(function (module, exports) {

            Object.defineProperty(exports, "__esModule", {
              value: true
            });
            exports.default = isValidES3Identifier;

            var _isValidIdentifier = _interopRequireDefault(isValidIdentifier_1);

            function _interopRequireDefault(obj) {
              return obj && obj.__esModule ? obj : {
                default: obj
              };
            }

            const RESERVED_WORDS_ES3_ONLY = new Set(["abstract", "boolean", "byte", "char", "double", "enum", "final", "float", "goto", "implements", "int", "interface", "long", "native", "package", "private", "protected", "public", "short", "static", "synchronized", "throws", "transient", "volatile"]);

            function isValidES3Identifier(name) {
              return (0, _isValidIdentifier.default)(name) && !RESERVED_WORDS_ES3_ONLY.has(name);
            }
            });

            unwrapExports(isValidES3Identifier_1);

            var isVar_1 = createCommonjsModule(function (module, exports) {

            Object.defineProperty(exports, "__esModule", {
              value: true
            });
            exports.default = isVar;





            function isVar(node) {
              return (0, generated.isVariableDeclaration)(node, {
                kind: "var"
              }) && !node[constants.BLOCK_SCOPED_SYMBOL];
            }
            });

            unwrapExports(isVar_1);

            var lib$2 = createCommonjsModule(function (module, exports) {

            Object.defineProperty(exports, "__esModule", {
              value: true
            });
            var _exportNames = {
              react: true,
              assertNode: true,
              createTypeAnnotationBasedOnTypeof: true,
              createUnionTypeAnnotation: true,
              cloneNode: true,
              clone: true,
              cloneDeep: true,
              cloneWithoutLoc: true,
              addComment: true,
              addComments: true,
              inheritInnerComments: true,
              inheritLeadingComments: true,
              inheritsComments: true,
              inheritTrailingComments: true,
              removeComments: true,
              ensureBlock: true,
              toBindingIdentifierName: true,
              toBlock: true,
              toComputedKey: true,
              toExpression: true,
              toIdentifier: true,
              toKeyAlias: true,
              toSequenceExpression: true,
              toStatement: true,
              valueToNode: true,
              appendToMemberExpression: true,
              inherits: true,
              prependToMemberExpression: true,
              removeProperties: true,
              removePropertiesDeep: true,
              removeTypeDuplicates: true,
              getBindingIdentifiers: true,
              getOuterBindingIdentifiers: true,
              traverse: true,
              traverseFast: true,
              shallowEqual: true,
              is: true,
              isBinding: true,
              isBlockScoped: true,
              isImmutable: true,
              isLet: true,
              isNode: true,
              isNodesEquivalent: true,
              isReferenced: true,
              isScope: true,
              isSpecifierDefault: true,
              isType: true,
              isValidES3Identifier: true,
              isValidIdentifier: true,
              isVar: true,
              matchesPattern: true,
              validate: true,
              buildMatchMemberExpression: true
            };
            Object.defineProperty(exports, "assertNode", {
              enumerable: true,
              get: function () {
                return _assertNode.default;
              }
            });
            Object.defineProperty(exports, "createTypeAnnotationBasedOnTypeof", {
              enumerable: true,
              get: function () {
                return _createTypeAnnotationBasedOnTypeof.default;
              }
            });
            Object.defineProperty(exports, "createUnionTypeAnnotation", {
              enumerable: true,
              get: function () {
                return _createUnionTypeAnnotation.default;
              }
            });
            Object.defineProperty(exports, "cloneNode", {
              enumerable: true,
              get: function () {
                return _cloneNode.default;
              }
            });
            Object.defineProperty(exports, "clone", {
              enumerable: true,
              get: function () {
                return _clone.default;
              }
            });
            Object.defineProperty(exports, "cloneDeep", {
              enumerable: true,
              get: function () {
                return _cloneDeep.default;
              }
            });
            Object.defineProperty(exports, "cloneWithoutLoc", {
              enumerable: true,
              get: function () {
                return _cloneWithoutLoc.default;
              }
            });
            Object.defineProperty(exports, "addComment", {
              enumerable: true,
              get: function () {
                return _addComment.default;
              }
            });
            Object.defineProperty(exports, "addComments", {
              enumerable: true,
              get: function () {
                return _addComments.default;
              }
            });
            Object.defineProperty(exports, "inheritInnerComments", {
              enumerable: true,
              get: function () {
                return _inheritInnerComments.default;
              }
            });
            Object.defineProperty(exports, "inheritLeadingComments", {
              enumerable: true,
              get: function () {
                return _inheritLeadingComments.default;
              }
            });
            Object.defineProperty(exports, "inheritsComments", {
              enumerable: true,
              get: function () {
                return _inheritsComments.default;
              }
            });
            Object.defineProperty(exports, "inheritTrailingComments", {
              enumerable: true,
              get: function () {
                return _inheritTrailingComments.default;
              }
            });
            Object.defineProperty(exports, "removeComments", {
              enumerable: true,
              get: function () {
                return _removeComments.default;
              }
            });
            Object.defineProperty(exports, "ensureBlock", {
              enumerable: true,
              get: function () {
                return _ensureBlock.default;
              }
            });
            Object.defineProperty(exports, "toBindingIdentifierName", {
              enumerable: true,
              get: function () {
                return _toBindingIdentifierName.default;
              }
            });
            Object.defineProperty(exports, "toBlock", {
              enumerable: true,
              get: function () {
                return _toBlock.default;
              }
            });
            Object.defineProperty(exports, "toComputedKey", {
              enumerable: true,
              get: function () {
                return _toComputedKey.default;
              }
            });
            Object.defineProperty(exports, "toExpression", {
              enumerable: true,
              get: function () {
                return _toExpression.default;
              }
            });
            Object.defineProperty(exports, "toIdentifier", {
              enumerable: true,
              get: function () {
                return _toIdentifier.default;
              }
            });
            Object.defineProperty(exports, "toKeyAlias", {
              enumerable: true,
              get: function () {
                return _toKeyAlias.default;
              }
            });
            Object.defineProperty(exports, "toSequenceExpression", {
              enumerable: true,
              get: function () {
                return _toSequenceExpression.default;
              }
            });
            Object.defineProperty(exports, "toStatement", {
              enumerable: true,
              get: function () {
                return _toStatement.default;
              }
            });
            Object.defineProperty(exports, "valueToNode", {
              enumerable: true,
              get: function () {
                return _valueToNode.default;
              }
            });
            Object.defineProperty(exports, "appendToMemberExpression", {
              enumerable: true,
              get: function () {
                return _appendToMemberExpression.default;
              }
            });
            Object.defineProperty(exports, "inherits", {
              enumerable: true,
              get: function () {
                return _inherits.default;
              }
            });
            Object.defineProperty(exports, "prependToMemberExpression", {
              enumerable: true,
              get: function () {
                return _prependToMemberExpression.default;
              }
            });
            Object.defineProperty(exports, "removeProperties", {
              enumerable: true,
              get: function () {
                return _removeProperties.default;
              }
            });
            Object.defineProperty(exports, "removePropertiesDeep", {
              enumerable: true,
              get: function () {
                return _removePropertiesDeep.default;
              }
            });
            Object.defineProperty(exports, "removeTypeDuplicates", {
              enumerable: true,
              get: function () {
                return _removeTypeDuplicates.default;
              }
            });
            Object.defineProperty(exports, "getBindingIdentifiers", {
              enumerable: true,
              get: function () {
                return _getBindingIdentifiers.default;
              }
            });
            Object.defineProperty(exports, "getOuterBindingIdentifiers", {
              enumerable: true,
              get: function () {
                return _getOuterBindingIdentifiers.default;
              }
            });
            Object.defineProperty(exports, "traverse", {
              enumerable: true,
              get: function () {
                return _traverse.default;
              }
            });
            Object.defineProperty(exports, "traverseFast", {
              enumerable: true,
              get: function () {
                return _traverseFast.default;
              }
            });
            Object.defineProperty(exports, "shallowEqual", {
              enumerable: true,
              get: function () {
                return _shallowEqual.default;
              }
            });
            Object.defineProperty(exports, "is", {
              enumerable: true,
              get: function () {
                return _is.default;
              }
            });
            Object.defineProperty(exports, "isBinding", {
              enumerable: true,
              get: function () {
                return _isBinding.default;
              }
            });
            Object.defineProperty(exports, "isBlockScoped", {
              enumerable: true,
              get: function () {
                return _isBlockScoped.default;
              }
            });
            Object.defineProperty(exports, "isImmutable", {
              enumerable: true,
              get: function () {
                return _isImmutable.default;
              }
            });
            Object.defineProperty(exports, "isLet", {
              enumerable: true,
              get: function () {
                return _isLet.default;
              }
            });
            Object.defineProperty(exports, "isNode", {
              enumerable: true,
              get: function () {
                return _isNode.default;
              }
            });
            Object.defineProperty(exports, "isNodesEquivalent", {
              enumerable: true,
              get: function () {
                return _isNodesEquivalent.default;
              }
            });
            Object.defineProperty(exports, "isReferenced", {
              enumerable: true,
              get: function () {
                return _isReferenced.default;
              }
            });
            Object.defineProperty(exports, "isScope", {
              enumerable: true,
              get: function () {
                return _isScope.default;
              }
            });
            Object.defineProperty(exports, "isSpecifierDefault", {
              enumerable: true,
              get: function () {
                return _isSpecifierDefault.default;
              }
            });
            Object.defineProperty(exports, "isType", {
              enumerable: true,
              get: function () {
                return _isType.default;
              }
            });
            Object.defineProperty(exports, "isValidES3Identifier", {
              enumerable: true,
              get: function () {
                return _isValidES3Identifier.default;
              }
            });
            Object.defineProperty(exports, "isValidIdentifier", {
              enumerable: true,
              get: function () {
                return _isValidIdentifier.default;
              }
            });
            Object.defineProperty(exports, "isVar", {
              enumerable: true,
              get: function () {
                return _isVar.default;
              }
            });
            Object.defineProperty(exports, "matchesPattern", {
              enumerable: true,
              get: function () {
                return _matchesPattern.default;
              }
            });
            Object.defineProperty(exports, "validate", {
              enumerable: true,
              get: function () {
                return _validate.default;
              }
            });
            Object.defineProperty(exports, "buildMatchMemberExpression", {
              enumerable: true,
              get: function () {
                return _buildMatchMemberExpression.default;
              }
            });
            exports.react = void 0;

            var _isReactComponent = _interopRequireDefault(isReactComponent_1);

            var _isCompatTag = _interopRequireDefault(isCompatTag_1);

            var _buildChildren = _interopRequireDefault(buildChildren_1);

            var _assertNode = _interopRequireDefault(assertNode_1);



            Object.keys(generated$2).forEach(function (key) {
              if (key === "default" || key === "__esModule") return;
              if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
              Object.defineProperty(exports, key, {
                enumerable: true,
                get: function () {
                  return generated$2[key];
                }
              });
            });

            var _createTypeAnnotationBasedOnTypeof = _interopRequireDefault(createTypeAnnotationBasedOnTypeof_1);

            var _createUnionTypeAnnotation = _interopRequireDefault(createUnionTypeAnnotation_1);



            Object.keys(generated$1).forEach(function (key) {
              if (key === "default" || key === "__esModule") return;
              if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
              Object.defineProperty(exports, key, {
                enumerable: true,
                get: function () {
                  return generated$1[key];
                }
              });
            });

            var _cloneNode = _interopRequireDefault(cloneNode_1);

            var _clone = _interopRequireDefault(clone_1$1);

            var _cloneDeep = _interopRequireDefault(cloneDeep_1);

            var _cloneWithoutLoc = _interopRequireDefault(cloneWithoutLoc_1);

            var _addComment = _interopRequireDefault(addComment_1);

            var _addComments = _interopRequireDefault(addComments_1);

            var _inheritInnerComments = _interopRequireDefault(inheritInnerComments_1);

            var _inheritLeadingComments = _interopRequireDefault(inheritLeadingComments_1);

            var _inheritsComments = _interopRequireDefault(inheritsComments_1);

            var _inheritTrailingComments = _interopRequireDefault(inheritTrailingComments_1);

            var _removeComments = _interopRequireDefault(removeComments_1);



            Object.keys(generated$3).forEach(function (key) {
              if (key === "default" || key === "__esModule") return;
              if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
              Object.defineProperty(exports, key, {
                enumerable: true,
                get: function () {
                  return generated$3[key];
                }
              });
            });



            Object.keys(constants).forEach(function (key) {
              if (key === "default" || key === "__esModule") return;
              if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
              Object.defineProperty(exports, key, {
                enumerable: true,
                get: function () {
                  return constants[key];
                }
              });
            });

            var _ensureBlock = _interopRequireDefault(ensureBlock_1);

            var _toBindingIdentifierName = _interopRequireDefault(toBindingIdentifierName_1);

            var _toBlock = _interopRequireDefault(toBlock_1);

            var _toComputedKey = _interopRequireDefault(toComputedKey_1);

            var _toExpression = _interopRequireDefault(toExpression_1);

            var _toIdentifier = _interopRequireDefault(toIdentifier_1);

            var _toKeyAlias = _interopRequireDefault(toKeyAlias_1);

            var _toSequenceExpression = _interopRequireDefault(toSequenceExpression_1);

            var _toStatement = _interopRequireDefault(toStatement_1);

            var _valueToNode = _interopRequireDefault(valueToNode_1);



            Object.keys(definitions).forEach(function (key) {
              if (key === "default" || key === "__esModule") return;
              if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
              Object.defineProperty(exports, key, {
                enumerable: true,
                get: function () {
                  return definitions[key];
                }
              });
            });

            var _appendToMemberExpression = _interopRequireDefault(appendToMemberExpression_1);

            var _inherits = _interopRequireDefault(inherits_1);

            var _prependToMemberExpression = _interopRequireDefault(prependToMemberExpression_1);

            var _removeProperties = _interopRequireDefault(removeProperties_1);

            var _removePropertiesDeep = _interopRequireDefault(removePropertiesDeep_1);

            var _removeTypeDuplicates = _interopRequireDefault(removeTypeDuplicates_1);

            var _getBindingIdentifiers = _interopRequireDefault(getBindingIdentifiers_1);

            var _getOuterBindingIdentifiers = _interopRequireDefault(getOuterBindingIdentifiers_1);

            var _traverse = _interopRequireDefault(traverse_1);

            var _traverseFast = _interopRequireDefault(traverseFast_1);

            var _shallowEqual = _interopRequireDefault(shallowEqual_1);

            var _is = _interopRequireDefault(is_1);

            var _isBinding = _interopRequireDefault(isBinding_1);

            var _isBlockScoped = _interopRequireDefault(isBlockScoped_1);

            var _isImmutable = _interopRequireDefault(isImmutable_1);

            var _isLet = _interopRequireDefault(isLet_1);

            var _isNode = _interopRequireDefault(isNode_1);

            var _isNodesEquivalent = _interopRequireDefault(isNodesEquivalent_1);

            var _isReferenced = _interopRequireDefault(isReferenced_1);

            var _isScope = _interopRequireDefault(isScope_1);

            var _isSpecifierDefault = _interopRequireDefault(isSpecifierDefault_1);

            var _isType = _interopRequireDefault(isType_1);

            var _isValidES3Identifier = _interopRequireDefault(isValidES3Identifier_1);

            var _isValidIdentifier = _interopRequireDefault(isValidIdentifier_1);

            var _isVar = _interopRequireDefault(isVar_1);

            var _matchesPattern = _interopRequireDefault(matchesPattern_1);

            var _validate = _interopRequireDefault(validate_1);

            var _buildMatchMemberExpression = _interopRequireDefault(buildMatchMemberExpression_1);



            Object.keys(generated).forEach(function (key) {
              if (key === "default" || key === "__esModule") return;
              if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
              Object.defineProperty(exports, key, {
                enumerable: true,
                get: function () {
                  return generated[key];
                }
              });
            });

            function _interopRequireDefault(obj) {
              return obj && obj.__esModule ? obj : {
                default: obj
              };
            }

            const react = {
              isReactComponent: _isReactComponent.default,
              isCompatTag: _isCompatTag.default,
              buildChildren: _buildChildren.default
            };
            exports.react = react;
            });

            var t = unwrapExports(lib$2);
            var lib_1$1 = lib$2.react;

            var lib$3 = createCommonjsModule(function (module, exports) {

            Object.defineProperty(exports, "__esModule", {
              value: true
            });
            exports.default = _default;

            function t() {
              const data = _interopRequireWildcard(lib$2);

              t = function () {
                return data;
              };

              return data;
            }

            function _interopRequireWildcard(obj) {
              if (obj && obj.__esModule) {
                return obj;
              } else {
                var newObj = {};

                if (obj != null) {
                  for (var key in obj) {
                    if (Object.prototype.hasOwnProperty.call(obj, key)) {
                      var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {};

                      if (desc.get || desc.set) {
                        Object.defineProperty(newObj, key, desc);
                      } else {
                        newObj[key] = obj[key];
                      }
                    }
                  }
                }

                newObj.default = obj;
                return newObj;
              }
            }

            const visitor = {
              Scope(path, state) {
                if (state.kind === "let") path.skip();
              },

              Function(path) {
                path.skip();
              },

              VariableDeclaration(path, state) {
                if (state.kind && path.node.kind !== state.kind) return;
                const nodes = [];
                const declarations = path.get("declarations");
                let firstId;

                for (const declar of declarations) {
                  firstId = declar.node.id;

                  if (declar.node.init) {
                    nodes.push(t().expressionStatement(t().assignmentExpression("=", declar.node.id, declar.node.init)));
                  }

                  for (const name in declar.getBindingIdentifiers()) {
                    state.emit(t().identifier(name), name, declar.node.init !== null);
                  }
                }

                if (path.parentPath.isFor({
                  left: path.node
                })) {
                  path.replaceWith(firstId);
                } else {
                  path.replaceWithMultiple(nodes);
                }
              }

            };

            function _default(path, emit, kind = "var") {
              path.traverse(visitor, {
                kind,
                emit
              });
            }
            });

            unwrapExports(lib$3);

            var lib$4 = createCommonjsModule(function (module, exports) {

            Object.defineProperty(exports, "__esModule", {
              value: true
            });
            exports.default = void 0;

            function _helperPluginUtils() {
              const data = lib;

              _helperPluginUtils = function () {
                return data;
              };

              return data;
            }

            function _helperHoistVariables() {
              const data = _interopRequireDefault(lib$3);

              _helperHoistVariables = function () {
                return data;
              };

              return data;
            }

            function _core() {
              const data = babel;

              _core = function () {
                return data;
              };

              return data;
            }

            function _interopRequireDefault(obj) {
              return obj && obj.__esModule ? obj : {
                default: obj
              };
            }

            const buildTemplate = (0, _core().template)(`
  SYSTEM_REGISTER(MODULE_NAME, SOURCES, function (EXPORT_IDENTIFIER, CONTEXT_IDENTIFIER) {
    "use strict";
    BEFORE_BODY;
    return {
      setters: SETTERS,
      execute: function () {
        BODY;
      }
    };
  });
`);
            const buildExportAll = (0, _core().template)(`
  for (var KEY in TARGET) {
    if (KEY !== "default" && KEY !== "__esModule") EXPORT_OBJ[KEY] = TARGET[KEY];
  }
`);

            function constructExportCall(path, exportIdent, exportNames, exportValues, exportStarTarget) {
              const statements = [];

              if (exportNames.length === 1) {
                statements.push(_core().types.expressionStatement(_core().types.callExpression(exportIdent, [_core().types.stringLiteral(exportNames[0]), exportValues[0]])));
              } else if (!exportStarTarget) {
                const objectProperties = [];

                for (let i = 0; i < exportNames.length; i++) {
                  const exportName = exportNames[i];
                  const exportValue = exportValues[i];
                  objectProperties.push(_core().types.objectProperty(_core().types.identifier(exportName), exportValue));
                }

                statements.push(_core().types.expressionStatement(_core().types.callExpression(exportIdent, [_core().types.objectExpression(objectProperties)])));
              } else {
                const exportObj = path.scope.generateUid("exportObj");
                statements.push(_core().types.variableDeclaration("var", [_core().types.variableDeclarator(_core().types.identifier(exportObj), _core().types.objectExpression([]))]));
                statements.push(buildExportAll({
                  KEY: path.scope.generateUidIdentifier("key"),
                  EXPORT_OBJ: _core().types.identifier(exportObj),
                  TARGET: exportStarTarget
                }));

                for (let i = 0; i < exportNames.length; i++) {
                  const exportName = exportNames[i];
                  const exportValue = exportValues[i];
                  statements.push(_core().types.expressionStatement(_core().types.assignmentExpression("=", _core().types.memberExpression(_core().types.identifier(exportObj), _core().types.identifier(exportName)), exportValue)));
                }

                statements.push(_core().types.expressionStatement(_core().types.callExpression(exportIdent, [_core().types.identifier(exportObj)])));
              }

              return statements;
            }

            const TYPE_IMPORT = "Import";

            var _default = (0, _helperPluginUtils().declare)((api, options) => {
              api.assertVersion(7);
              const _options$systemGlobal = options.systemGlobal,
                    systemGlobal = _options$systemGlobal === void 0 ? "System" : _options$systemGlobal;
              const IGNORE_REASSIGNMENT_SYMBOL = Symbol();
              const reassignmentVisitor = {
                "AssignmentExpression|UpdateExpression"(path) {
                  if (path.node[IGNORE_REASSIGNMENT_SYMBOL]) return;
                  path.node[IGNORE_REASSIGNMENT_SYMBOL] = true;
                  const arg = path.get(path.isAssignmentExpression() ? "left" : "argument");

                  if (arg.isObjectPattern() || arg.isArrayPattern()) {
                    const exprs = [path.node];

                    for (const name in arg.getBindingIdentifiers()) {
                      if (this.scope.getBinding(name) !== path.scope.getBinding(name)) {
                        return;
                      }

                      const exportedNames = this.exports[name];
                      if (!exportedNames) return;

                      for (const exportedName of exportedNames) {
                        exprs.push(this.buildCall(exportedName, _core().types.identifier(name)).expression);
                      }
                    }

                    path.replaceWith(_core().types.sequenceExpression(exprs));
                    return;
                  }

                  if (!arg.isIdentifier()) return;
                  const name = arg.node.name;
                  if (this.scope.getBinding(name) !== path.scope.getBinding(name)) return;
                  const exportedNames = this.exports[name];
                  if (!exportedNames) return;
                  let node = path.node;
                  const isPostUpdateExpression = path.isUpdateExpression({
                    prefix: false
                  });

                  if (isPostUpdateExpression) {
                    node = _core().types.binaryExpression(node.operator[0], _core().types.unaryExpression("+", _core().types.cloneNode(node.argument)), _core().types.numericLiteral(1));
                  }

                  for (const exportedName of exportedNames) {
                    node = this.buildCall(exportedName, node).expression;
                  }

                  if (isPostUpdateExpression) {
                    node = _core().types.sequenceExpression([node, path.node]);
                  }

                  path.replaceWith(node);
                }

              };
              return {
                name: "transform-modules-systemjs",
                visitor: {
                  CallExpression(path, state) {
                    if (path.node.callee.type === TYPE_IMPORT) {
                      path.replaceWith(_core().types.callExpression(_core().types.memberExpression(_core().types.identifier(state.contextIdent), _core().types.identifier("import")), path.node.arguments));
                    }
                  },

                  MetaProperty(path, state) {
                    if (path.node.meta.name === "import" && path.node.property.name === "meta") {
                      path.replaceWith(_core().types.memberExpression(_core().types.identifier(state.contextIdent), _core().types.identifier("meta")));
                    }
                  },

                  ReferencedIdentifier(path, state) {
                    if (path.node.name == "__moduleName" && !path.scope.hasBinding("__moduleName")) {
                      path.replaceWith(_core().types.memberExpression(_core().types.identifier(state.contextIdent), _core().types.identifier("id")));
                    }
                  },

                  Program: {
                    enter(path, state) {
                      state.contextIdent = path.scope.generateUid("context");
                    },

                    exit(path, state) {
                      const exportIdent = path.scope.generateUid("export");
                      const contextIdent = state.contextIdent;
                      const exportNames = Object.create(null);
                      const modules = [];
                      let beforeBody = [];
                      const setters = [];
                      const sources = [];
                      const variableIds = [];
                      const removedPaths = [];

                      function addExportName(key, val) {
                        exportNames[key] = exportNames[key] || [];
                        exportNames[key].push(val);
                      }

                      function pushModule(source, key, specifiers) {
                        let module;
                        modules.forEach(function (m) {
                          if (m.key === source) {
                            module = m;
                          }
                        });

                        if (!module) {
                          modules.push(module = {
                            key: source,
                            imports: [],
                            exports: []
                          });
                        }

                        module[key] = module[key].concat(specifiers);
                      }

                      function buildExportCall(name, val) {
                        return _core().types.expressionStatement(_core().types.callExpression(_core().types.identifier(exportIdent), [_core().types.stringLiteral(name), val]));
                      }

                      const body = path.get("body");

                      for (const path of body) {
                        if (path.isFunctionDeclaration()) {
                          beforeBody.push(path.node);
                          removedPaths.push(path);
                        } else if (path.isImportDeclaration()) {
                          const source = path.node.source.value;
                          pushModule(source, "imports", path.node.specifiers);

                          for (const name in path.getBindingIdentifiers()) {
                            path.scope.removeBinding(name);
                            variableIds.push(_core().types.identifier(name));
                          }

                          path.remove();
                        } else if (path.isExportAllDeclaration()) {
                          pushModule(path.node.source.value, "exports", path.node);
                          path.remove();
                        } else if (path.isExportDefaultDeclaration()) {
                          const declar = path.get("declaration");

                          if (declar.isClassDeclaration() || declar.isFunctionDeclaration()) {
                            const id = declar.node.id;
                            const nodes = [];

                            if (id) {
                              nodes.push(declar.node);
                              nodes.push(buildExportCall("default", _core().types.cloneNode(id)));
                              addExportName(id.name, "default");
                            } else {
                              nodes.push(buildExportCall("default", _core().types.toExpression(declar.node)));
                            }

                            if (declar.isClassDeclaration()) {
                              path.replaceWithMultiple(nodes);
                            } else {
                              beforeBody = beforeBody.concat(nodes);
                              removedPaths.push(path);
                            }
                          } else {
                            path.replaceWith(buildExportCall("default", declar.node));
                          }
                        } else if (path.isExportNamedDeclaration()) {
                          const declar = path.get("declaration");

                          if (declar.node) {
                            path.replaceWith(declar);

                            if (path.isFunction()) {
                              const node = declar.node;
                              const name = node.id.name;
                              addExportName(name, name);
                              beforeBody.push(node);
                              beforeBody.push(buildExportCall(name, _core().types.cloneNode(node.id)));
                              removedPaths.push(path);
                            } else if (path.isClass()) {
                              const name = declar.node.id.name;
                              addExportName(name, name);
                              path.insertAfter([buildExportCall(name, _core().types.identifier(name))]);
                            } else {
                              for (const name in declar.getBindingIdentifiers()) {
                                addExportName(name, name);
                              }
                            }
                          } else {
                            const specifiers = path.node.specifiers;

                            if (specifiers && specifiers.length) {
                              if (path.node.source) {
                                pushModule(path.node.source.value, "exports", specifiers);
                                path.remove();
                              } else {
                                const nodes = [];

                                for (const specifier of specifiers) {
                                  const binding = path.scope.getBinding(specifier.local.name);

                                  if (binding && _core().types.isFunctionDeclaration(binding.path.node)) {
                                    beforeBody.push(buildExportCall(specifier.exported.name, _core().types.cloneNode(specifier.local)));
                                  } else if (!binding) {
                                    nodes.push(buildExportCall(specifier.exported.name, specifier.local));
                                  }

                                  addExportName(specifier.local.name, specifier.exported.name);
                                }

                                path.replaceWithMultiple(nodes);
                              }
                            }
                          }
                        }
                      }

                      modules.forEach(function (specifiers) {
                        let setterBody = [];
                        const target = path.scope.generateUid(specifiers.key);

                        for (let specifier of specifiers.imports) {
                          if (_core().types.isImportNamespaceSpecifier(specifier)) {
                            setterBody.push(_core().types.expressionStatement(_core().types.assignmentExpression("=", specifier.local, _core().types.identifier(target))));
                          } else if (_core().types.isImportDefaultSpecifier(specifier)) {
                            specifier = _core().types.importSpecifier(specifier.local, _core().types.identifier("default"));
                          }

                          if (_core().types.isImportSpecifier(specifier)) {
                            setterBody.push(_core().types.expressionStatement(_core().types.assignmentExpression("=", specifier.local, _core().types.memberExpression(_core().types.identifier(target), specifier.imported))));
                          }
                        }

                        if (specifiers.exports.length) {
                          const exportNames = [];
                          const exportValues = [];
                          let hasExportStar = false;

                          for (const node of specifiers.exports) {
                            if (_core().types.isExportAllDeclaration(node)) {
                              hasExportStar = true;
                            } else if (_core().types.isExportSpecifier(node)) {
                              exportNames.push(node.exported.name);
                              exportValues.push(_core().types.memberExpression(_core().types.identifier(target), node.local));
                            }
                          }

                          setterBody = setterBody.concat(constructExportCall(path, _core().types.identifier(exportIdent), exportNames, exportValues, hasExportStar ? _core().types.identifier(target) : null));
                        }

                        sources.push(_core().types.stringLiteral(specifiers.key));
                        setters.push(_core().types.functionExpression(null, [_core().types.identifier(target)], _core().types.blockStatement(setterBody)));
                      });
                      let moduleName = this.getModuleName();
                      if (moduleName) moduleName = _core().types.stringLiteral(moduleName);
                      const uninitializedVars = [];
                      (0, _helperHoistVariables().default)(path, (id, name, hasInit) => {
                        variableIds.push(id);

                        if (!hasInit) {
                          uninitializedVars.push(name);
                        }
                      }, null);

                      if (variableIds.length) {
                        beforeBody.unshift(_core().types.variableDeclaration("var", variableIds.map(id => _core().types.variableDeclarator(id))));
                      }

                      if (uninitializedVars.length) {
                        const undefinedValues = [];
                        const undefinedIdent = path.scope.buildUndefinedNode();

                        for (let i = 0; i < uninitializedVars.length; i++) {
                          undefinedValues[i] = undefinedIdent;
                        }

                        beforeBody = beforeBody.concat(constructExportCall(path, _core().types.identifier(exportIdent), uninitializedVars, undefinedValues, null));
                      }

                      path.traverse(reassignmentVisitor, {
                        exports: exportNames,
                        buildCall: buildExportCall,
                        scope: path.scope
                      });

                      for (const path of removedPaths) {
                        path.remove();
                      }

                      path.node.body = [buildTemplate({
                        SYSTEM_REGISTER: _core().types.memberExpression(_core().types.identifier(systemGlobal), _core().types.identifier("register")),
                        BEFORE_BODY: beforeBody,
                        MODULE_NAME: moduleName,
                        SETTERS: _core().types.arrayExpression(setters),
                        SOURCES: _core().types.arrayExpression(sources),
                        BODY: path.node.body,
                        EXPORT_IDENTIFIER: _core().types.identifier(exportIdent),
                        CONTEXT_IDENTIFIER: _core().types.identifier(contextIdent)
                      })];
                    }

                  }
                }
              };
            });

            exports.default = _default;
            });

            var esRegisterFormatPlugin = unwrapExports(lib$4);

            /*
             Forked from https://github.com/jspm/babel-visit-cjs-deps and slightly modified
             to be compatible with Babel 7 packages as a regular plugins. Make sure this is the
             first plugin to ensure it processes the original code.
             */
            // partially resolve the leading part if a string literal

            function partialResolve(expr, state) {
              let resolveModule;
              if (t.isStringLiteral(expr)) resolveModule = expr.value;else if (t.isTemplateLiteral(expr)) resolveModule = expr.quasis[0].value.cooked;else if (t.isBinaryExpression(expr) && expr.operator === '+' && t.isStringLiteral(expr.left)) resolveModule = expr.left.value;
              if (resolveModule && state.resolves.includes(resolveModule) === false) state.resolves.push(resolveModule);
            }

            function addDependency(depModuleArg, state) {
              let depModule;

              if (t.isStringLiteral(depModuleArg)) {
                depModule = depModuleArg.value;
              } else if (t.isTemplateLiteral(depModuleArg)) {
                if (depModuleArg.expressions.length !== 0) return;
                depModule = depModuleArg.quasis[0].value.cooked;
              } else {
                // no support for dynamic require currently
                // just becomes a "null" module
                return;
              }

              if (state.deps.includes(depModule) === false) state.deps.push(depModule);
            }

            function plugin(types, state) {
              let hasProcess = false;
              let hasBuffer = false;
              return {
                visitor: {
                  Program: {
                    enter(path) {
                      if (!state.deps) throw new Error('opts.deps must be set for the babel-visit-cjs-deps Babel plugin.');
                      if (!state.resolves) state.resolves = [];
                    },

                    exit(path) {
                      if (hasProcess && !state.deps.includes('process')) state.deps.push('process');
                      if (hasBuffer && !state.deps.includes('buffer')) state.deps.push('buffer');
                    }

                  },

                  /*
                   * require()
                   */
                  CallExpression(path) {
                    if (t.isIdentifier(path.node.callee, {
                      name: 'require'
                    })) addDependency(path.node.arguments[0], state);
                  },

                  /*
                   * require.resolve()
                   */
                  MemberExpression(path) {
                    try {
                      if (t.isIdentifier(path.node.object, {
                        name: 'require'
                      }) && !path.scope.hasBinding('require')) {
                        let name = path.node.computed ? path.node.property.value : path.node.property.name;

                        if (name === 'resolve') {
                          if (t.isCallExpression(path.parent) && path.parent.callee === path.node && path.parent.arguments.length === 1) {
                            const resolveArgPath = path.parentPath.get('arguments.0');
                            partialResolve(resolveArgPath.node, state);
                          }
                        }
                      }
                    } catch (err) {
                      console.log({
                        path
                      });
                      throw err;
                    }
                  },

                  /*
                   * module.require()
                   */
                  ReferencedIdentifier(path) {
                    const identifierName = path.node.name;
                    if (!hasProcess && identifierName === 'process' && !path.scope.hasBinding('process')) hasProcess = true;
                    if (!hasBuffer && identifierName === 'Buffer' && !path.scope.hasBinding('Buffer')) hasBuffer = true;

                    if (identifierName === 'module' && !path.scope.hasBinding('module')) {
                      const parentPath = path.parentPath;
                      const parentNode = path.parentPath.node;

                      if (t.isMemberExpression(parentNode) && parentNode.object === path.node) {
                        const name = parentNode.computed ? parentNode.property.value : parentNode.property.name;
                        if (name === 'require' && t.isCallExpression(parentPath.parent) && parentPath.parent.callee === parentPath.node) addDependency(parentPath.parent.arguments[0], state);
                      }
                    }
                  }

                }
              };
            }

            var shebangRegex = /^#!(.*)/;

            var stripShebang = function (str) {
              return str.replace(shebangRegex, '');
            };

            function unzipModuleVars(moduleVars = {}) {
              return Object.entries(moduleVars).reduce(({
                params,
                args
              }, [key, value]) => ({
                params: [...params, key],
                args: [...args, value]
              }), {
                params: [],
                args: []
              });
            }

            function compileScript(sourceUrl, source, moduleVars) {
              const _unzipModuleVars = unzipModuleVars(moduleVars),
                    params = _unzipModuleVars.params,
                    args = _unzipModuleVars.args;

              const wrapped_before = `(function(${params.join(',')}){`;
              const wrappee = stripShebang(source);
              const wrapper_sourceUrl = sourceUrl ? `\n//# sourceURL=${sourceUrl}` : '';
              const wrapped_after = '})';
              const wrapped = `${wrapped_before}${wrappee}${wrapped_after}${wrapper_sourceUrl}`;
              const evaluated = (0, eval)(wrapped);

              if (typeof evaluated === 'function') {
                evaluated(...args);
              }
            }

            // Copyright Joyent, Inc. and other Node contributors.
            //
            // Permission is hereby granted, free of charge, to any person obtaining a
            // copy of this software and associated documentation files (the
            // "Software"), to deal in the Software without restriction, including
            // without limitation the rights to use, copy, modify, merge, publish,
            // distribute, sublicense, and/or sell copies of the Software, and to permit
            // persons to whom the Software is furnished to do so, subject to the
            // following conditions:
            //
            // The above copyright notice and this permission notice shall be included
            // in all copies or substantial portions of the Software.
            //
            // THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
            // OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
            // MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
            // NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
            // DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
            // OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
            // USE OR OTHER DEALINGS IN THE SOFTWARE.
            // resolves . and .. elements in a path array with directory names there
            // must be no slashes, empty elements, or device names (c:\) in the array
            // (so also no leading and trailing slashes - it does not distinguish
            // relative and absolute paths)
            function normalizeArray(parts, allowAboveRoot) {
              // if the path tries to go above the root, `up` ends up > 0
              var up = 0;

              for (var i = parts.length - 1; i >= 0; i--) {
                var last = parts[i];

                if (last === '.') {
                  parts.splice(i, 1);
                } else if (last === '..') {
                  parts.splice(i, 1);
                  up++;
                } else if (up) {
                  parts.splice(i, 1);
                  up--;
                }
              } // if the path is allowed to go above the root, restore leading ..s


              if (allowAboveRoot) {
                for (; up--; up) {
                  parts.unshift('..');
                }
              }

              return parts;
            } // Split a filename into [root, dir, basename, ext], unix version
            // 'root' is just a slash, or nothing.


            var splitPathRe = /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/;

            var splitPath = function (filename) {
              return splitPathRe.exec(filename).slice(1);
            }; // path.resolve([from ...], to)
            // posix version


            function resolve() {
              var resolvedPath = '',
                  resolvedAbsolute = false;

              for (var i = arguments.length - 1; i >= -1 && !resolvedAbsolute; i--) {
                var path = i >= 0 ? arguments[i] : '/'; // Skip empty and invalid entries

                if (typeof path !== 'string') {
                  throw new TypeError('Arguments to path.resolve must be strings');
                } else if (!path) {
                  continue;
                }

                resolvedPath = path + '/' + resolvedPath;
                resolvedAbsolute = path.charAt(0) === '/';
              } // At this point the path should be resolved to a full absolute path, but
              // handle relative paths to be safe (might happen when process.cwd() fails)
              // Normalize the path


              resolvedPath = normalizeArray(filter(resolvedPath.split('/'), function (p) {
                return !!p;
              }), !resolvedAbsolute).join('/');
              return (resolvedAbsolute ? '/' : '') + resolvedPath || '.';
            }
            // posix version

            function normalize(path) {
              var isPathAbsolute = isAbsolute(path),
                  trailingSlash = substr(path, -1) === '/'; // Normalize the path

              path = normalizeArray(filter(path.split('/'), function (p) {
                return !!p;
              }), !isPathAbsolute).join('/');

              if (!path && !isPathAbsolute) {
                path = '.';
              }

              if (path && trailingSlash) {
                path += '/';
              }

              return (isPathAbsolute ? '/' : '') + path;
            }

            function isAbsolute(path) {
              return path.charAt(0) === '/';
            } // posix version

            function join() {
              var paths = Array.prototype.slice.call(arguments, 0);
              return normalize(filter(paths, function (p, index) {
                if (typeof p !== 'string') {
                  throw new TypeError('Arguments to path.join must be strings');
                }

                return p;
              }).join('/'));
            } // path.relative(from, to)
            // posix version

            function relative(from, to) {
              from = resolve(from).substr(1);
              to = resolve(to).substr(1);

              function trim(arr) {
                var start = 0;

                for (; start < arr.length; start++) {
                  if (arr[start] !== '') break;
                }

                var end = arr.length - 1;

                for (; end >= 0; end--) {
                  if (arr[end] !== '') break;
                }

                if (start > end) return [];
                return arr.slice(start, end - start + 1);
              }

              var fromParts = trim(from.split('/'));
              var toParts = trim(to.split('/'));
              var length = Math.min(fromParts.length, toParts.length);
              var samePartsLength = length;

              for (var i = 0; i < length; i++) {
                if (fromParts[i] !== toParts[i]) {
                  samePartsLength = i;
                  break;
                }
              }

              var outputParts = [];

              for (var i = samePartsLength; i < fromParts.length; i++) {
                outputParts.push('..');
              }

              outputParts = outputParts.concat(toParts.slice(samePartsLength));
              return outputParts.join('/');
            }
            var sep = '/';
            var delimiter = ':';
            function dirname(path) {
              var result = splitPath(path),
                  root = result[0],
                  dir = result[1];

              if (!root && !dir) {
                // No dirname whatsoever
                return '.';
              }

              if (dir) {
                // It has a dirname, strip trailing slash
                dir = dir.substr(0, dir.length - 1);
              }

              return root + dir;
            }
            function basename(path, ext) {
              var f = splitPath(path)[2]; // TODO: make this comparison case-insensitive on windows?

              if (ext && f.substr(-1 * ext.length) === ext) {
                f = f.substr(0, f.length - ext.length);
              }

              return f;
            }
            function extname(path) {
              return splitPath(path)[3];
            }
            var path = {
              extname: extname,
              basename: basename,
              dirname: dirname,
              sep: sep,
              delimiter: delimiter,
              relative: relative,
              join: join,
              isAbsolute: isAbsolute,
              normalize: normalize,
              resolve: resolve
            };

            function filter(xs, f) {
              if (xs.filter) return xs.filter(f);
              var res = [];

              for (var i = 0; i < xs.length; i++) {
                if (f(xs[i], i, xs)) res.push(xs[i]);
              }

              return res;
            } // String.prototype.substr - negative index don't work in IE8


            var substr = 'ab'.substr(-1) === 'b' ? function (str, start, len) {
              return str.substr(start, len);
            } : function (str, start, len) {
              if (start < 0) start = str.length + start;
              return str.substr(start, len);
            };

            var path$1 = /*#__PURE__*/Object.freeze({
                        resolve: resolve,
                        normalize: normalize,
                        isAbsolute: isAbsolute,
                        join: join,
                        relative: relative,
                        sep: sep,
                        delimiter: delimiter,
                        dirname: dirname,
                        basename: basename,
                        extname: extname,
                        default: path
            });

            /*! https://mths.be/punycode v1.4.1 by @mathias */

            var lookup = [];
            var revLookup = [];
            var Arr = typeof Uint8Array !== 'undefined' ? Uint8Array : Array;
            var inited = false;

            function init() {
              inited = true;
              var code = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

              for (var i = 0, len = code.length; i < len; ++i) {
                lookup[i] = code[i];
                revLookup[code.charCodeAt(i)] = i;
              }

              revLookup['-'.charCodeAt(0)] = 62;
              revLookup['_'.charCodeAt(0)] = 63;
            }

            function toByteArray(b64) {
              if (!inited) {
                init();
              }

              var i, j, l, tmp, placeHolders, arr;
              var len = b64.length;

              if (len % 4 > 0) {
                throw new Error('Invalid string. Length must be a multiple of 4');
              } // the number of equal signs (place holders)
              // if there are two placeholders, than the two characters before it
              // represent one byte
              // if there is only one, then the three characters before it represent 2 bytes
              // this is just a cheap hack to not do indexOf twice


              placeHolders = b64[len - 2] === '=' ? 2 : b64[len - 1] === '=' ? 1 : 0; // base64 is 4/3 + up to two characters of the original data

              arr = new Arr(len * 3 / 4 - placeHolders); // if there are placeholders, only get up to the last complete 4 chars

              l = placeHolders > 0 ? len - 4 : len;
              var L = 0;

              for (i = 0, j = 0; i < l; i += 4, j += 3) {
                tmp = revLookup[b64.charCodeAt(i)] << 18 | revLookup[b64.charCodeAt(i + 1)] << 12 | revLookup[b64.charCodeAt(i + 2)] << 6 | revLookup[b64.charCodeAt(i + 3)];
                arr[L++] = tmp >> 16 & 0xFF;
                arr[L++] = tmp >> 8 & 0xFF;
                arr[L++] = tmp & 0xFF;
              }

              if (placeHolders === 2) {
                tmp = revLookup[b64.charCodeAt(i)] << 2 | revLookup[b64.charCodeAt(i + 1)] >> 4;
                arr[L++] = tmp & 0xFF;
              } else if (placeHolders === 1) {
                tmp = revLookup[b64.charCodeAt(i)] << 10 | revLookup[b64.charCodeAt(i + 1)] << 4 | revLookup[b64.charCodeAt(i + 2)] >> 2;
                arr[L++] = tmp >> 8 & 0xFF;
                arr[L++] = tmp & 0xFF;
              }

              return arr;
            }

            function tripletToBase64(num) {
              return lookup[num >> 18 & 0x3F] + lookup[num >> 12 & 0x3F] + lookup[num >> 6 & 0x3F] + lookup[num & 0x3F];
            }

            function encodeChunk(uint8, start, end) {
              var tmp;
              var output = [];

              for (var i = start; i < end; i += 3) {
                tmp = (uint8[i] << 16) + (uint8[i + 1] << 8) + uint8[i + 2];
                output.push(tripletToBase64(tmp));
              }

              return output.join('');
            }

            function fromByteArray(uint8) {
              if (!inited) {
                init();
              }

              var tmp;
              var len = uint8.length;
              var extraBytes = len % 3; // if we have 1 byte left, pad 2 bytes

              var output = '';
              var parts = [];
              var maxChunkLength = 16383; // must be multiple of 3
              // go through the array every three bytes, we'll deal with trailing stuff later

              for (var i = 0, len2 = len - extraBytes; i < len2; i += maxChunkLength) {
                parts.push(encodeChunk(uint8, i, i + maxChunkLength > len2 ? len2 : i + maxChunkLength));
              } // pad the end with zeros, but make sure to not forget the extra bytes


              if (extraBytes === 1) {
                tmp = uint8[len - 1];
                output += lookup[tmp >> 2];
                output += lookup[tmp << 4 & 0x3F];
                output += '==';
              } else if (extraBytes === 2) {
                tmp = (uint8[len - 2] << 8) + uint8[len - 1];
                output += lookup[tmp >> 10];
                output += lookup[tmp >> 4 & 0x3F];
                output += lookup[tmp << 2 & 0x3F];
                output += '=';
              }

              parts.push(output);
              return parts.join('');
            }

            function read(buffer, offset, isLE, mLen, nBytes) {
              var e, m;
              var eLen = nBytes * 8 - mLen - 1;
              var eMax = (1 << eLen) - 1;
              var eBias = eMax >> 1;
              var nBits = -7;
              var i = isLE ? nBytes - 1 : 0;
              var d = isLE ? -1 : 1;
              var s = buffer[offset + i];
              i += d;
              e = s & (1 << -nBits) - 1;
              s >>= -nBits;
              nBits += eLen;

              for (; nBits > 0; e = e * 256 + buffer[offset + i], i += d, nBits -= 8) {}

              m = e & (1 << -nBits) - 1;
              e >>= -nBits;
              nBits += mLen;

              for (; nBits > 0; m = m * 256 + buffer[offset + i], i += d, nBits -= 8) {}

              if (e === 0) {
                e = 1 - eBias;
              } else if (e === eMax) {
                return m ? NaN : (s ? -1 : 1) * Infinity;
              } else {
                m = m + Math.pow(2, mLen);
                e = e - eBias;
              }

              return (s ? -1 : 1) * m * Math.pow(2, e - mLen);
            }
            function write(buffer, value, offset, isLE, mLen, nBytes) {
              var e, m, c;
              var eLen = nBytes * 8 - mLen - 1;
              var eMax = (1 << eLen) - 1;
              var eBias = eMax >> 1;
              var rt = mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0;
              var i = isLE ? 0 : nBytes - 1;
              var d = isLE ? 1 : -1;
              var s = value < 0 || value === 0 && 1 / value < 0 ? 1 : 0;
              value = Math.abs(value);

              if (isNaN(value) || value === Infinity) {
                m = isNaN(value) ? 1 : 0;
                e = eMax;
              } else {
                e = Math.floor(Math.log(value) / Math.LN2);

                if (value * (c = Math.pow(2, -e)) < 1) {
                  e--;
                  c *= 2;
                }

                if (e + eBias >= 1) {
                  value += rt / c;
                } else {
                  value += rt * Math.pow(2, 1 - eBias);
                }

                if (value * c >= 2) {
                  e++;
                  c /= 2;
                }

                if (e + eBias >= eMax) {
                  m = 0;
                  e = eMax;
                } else if (e + eBias >= 1) {
                  m = (value * c - 1) * Math.pow(2, mLen);
                  e = e + eBias;
                } else {
                  m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen);
                  e = 0;
                }
              }

              for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8) {}

              e = e << mLen | m;
              eLen += mLen;

              for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8) {}

              buffer[offset + i - d] |= s * 128;
            }

            var toString = {}.toString;
            var isArray$1 = Array.isArray || function (arr) {
              return toString.call(arr) == '[object Array]';
            };

            var INSPECT_MAX_BYTES = 50;
            /**
             * If `Buffer.TYPED_ARRAY_SUPPORT`:
             *   === true    Use Uint8Array implementation (fastest)
             *   === false   Use Object implementation (most compatible, even IE6)
             *
             * Browsers that support typed arrays are IE 10+, Firefox 4+, Chrome 7+, Safari 5.1+,
             * Opera 11.6+, iOS 4.2+.
             *
             * Due to various browser bugs, sometimes the Object implementation will be used even
             * when the browser supports typed arrays.
             *
             * Note:
             *
             *   - Firefox 4-29 lacks support for adding new properties to `Uint8Array` instances,
             *     See: https://bugzilla.mozilla.org/show_bug.cgi?id=695438.
             *
             *   - Chrome 9-10 is missing the `TypedArray.prototype.subarray` function.
             *
             *   - IE10 has a broken `TypedArray.prototype.subarray` function which returns arrays of
             *     incorrect length in some situations.

             * We detect these buggy browsers and set `Buffer.TYPED_ARRAY_SUPPORT` to `false` so they
             * get the Object implementation, which is slower but behaves correctly.
             */

            Buffer.TYPED_ARRAY_SUPPORT = global$1.TYPED_ARRAY_SUPPORT !== undefined ? global$1.TYPED_ARRAY_SUPPORT : true;

            function kMaxLength() {
              return Buffer.TYPED_ARRAY_SUPPORT ? 0x7fffffff : 0x3fffffff;
            }

            function createBuffer(that, length) {
              if (kMaxLength() < length) {
                throw new RangeError('Invalid typed array length');
              }

              if (Buffer.TYPED_ARRAY_SUPPORT) {
                // Return an augmented `Uint8Array` instance, for best performance
                that = new Uint8Array(length);
                that.__proto__ = Buffer.prototype;
              } else {
                // Fallback: Return an object instance of the Buffer class
                if (that === null) {
                  that = new Buffer(length);
                }

                that.length = length;
              }

              return that;
            }
            /**
             * The Buffer constructor returns instances of `Uint8Array` that have their
             * prototype changed to `Buffer.prototype`. Furthermore, `Buffer` is a subclass of
             * `Uint8Array`, so the returned instances will have all the node `Buffer` methods
             * and the `Uint8Array` methods. Square bracket notation works as expected -- it
             * returns a single octet.
             *
             * The `Uint8Array` prototype remains unmodified.
             */


            function Buffer(arg, encodingOrOffset, length) {
              if (!Buffer.TYPED_ARRAY_SUPPORT && !(this instanceof Buffer)) {
                return new Buffer(arg, encodingOrOffset, length);
              } // Common case.


              if (typeof arg === 'number') {
                if (typeof encodingOrOffset === 'string') {
                  throw new Error('If encoding is specified then the first argument must be a string');
                }

                return allocUnsafe(this, arg);
              }

              return from(this, arg, encodingOrOffset, length);
            }
            Buffer.poolSize = 8192; // not used by this implementation
            // TODO: Legacy, not needed anymore. Remove in next major version.

            Buffer._augment = function (arr) {
              arr.__proto__ = Buffer.prototype;
              return arr;
            };

            function from(that, value, encodingOrOffset, length) {
              if (typeof value === 'number') {
                throw new TypeError('"value" argument must not be a number');
              }

              if (typeof ArrayBuffer !== 'undefined' && value instanceof ArrayBuffer) {
                return fromArrayBuffer(that, value, encodingOrOffset, length);
              }

              if (typeof value === 'string') {
                return fromString(that, value, encodingOrOffset);
              }

              return fromObject(that, value);
            }
            /**
             * Functionally equivalent to Buffer(arg, encoding) but throws a TypeError
             * if value is a number.
             * Buffer.from(str[, encoding])
             * Buffer.from(array)
             * Buffer.from(buffer)
             * Buffer.from(arrayBuffer[, byteOffset[, length]])
             **/


            Buffer.from = function (value, encodingOrOffset, length) {
              return from(null, value, encodingOrOffset, length);
            };

            if (Buffer.TYPED_ARRAY_SUPPORT) {
              Buffer.prototype.__proto__ = Uint8Array.prototype;
              Buffer.__proto__ = Uint8Array;
            }

            function assertSize(size) {
              if (typeof size !== 'number') {
                throw new TypeError('"size" argument must be a number');
              } else if (size < 0) {
                throw new RangeError('"size" argument must not be negative');
              }
            }

            function alloc(that, size, fill, encoding) {
              assertSize(size);

              if (size <= 0) {
                return createBuffer(that, size);
              }

              if (fill !== undefined) {
                // Only pay attention to encoding if it's a string. This
                // prevents accidentally sending in a number that would
                // be interpretted as a start offset.
                return typeof encoding === 'string' ? createBuffer(that, size).fill(fill, encoding) : createBuffer(that, size).fill(fill);
              }

              return createBuffer(that, size);
            }
            /**
             * Creates a new filled Buffer instance.
             * alloc(size[, fill[, encoding]])
             **/


            Buffer.alloc = function (size, fill, encoding) {
              return alloc(null, size, fill, encoding);
            };

            function allocUnsafe(that, size) {
              assertSize(size);
              that = createBuffer(that, size < 0 ? 0 : checked(size) | 0);

              if (!Buffer.TYPED_ARRAY_SUPPORT) {
                for (var i = 0; i < size; ++i) {
                  that[i] = 0;
                }
              }

              return that;
            }
            /**
             * Equivalent to Buffer(num), by default creates a non-zero-filled Buffer instance.
             * */


            Buffer.allocUnsafe = function (size) {
              return allocUnsafe(null, size);
            };
            /**
             * Equivalent to SlowBuffer(num), by default creates a non-zero-filled Buffer instance.
             */


            Buffer.allocUnsafeSlow = function (size) {
              return allocUnsafe(null, size);
            };

            function fromString(that, string, encoding) {
              if (typeof encoding !== 'string' || encoding === '') {
                encoding = 'utf8';
              }

              if (!Buffer.isEncoding(encoding)) {
                throw new TypeError('"encoding" must be a valid string encoding');
              }

              var length = byteLength(string, encoding) | 0;
              that = createBuffer(that, length);
              var actual = that.write(string, encoding);

              if (actual !== length) {
                // Writing a hex string, for example, that contains invalid characters will
                // cause everything after the first invalid character to be ignored. (e.g.
                // 'abxxcd' will be treated as 'ab')
                that = that.slice(0, actual);
              }

              return that;
            }

            function fromArrayLike(that, array) {
              var length = array.length < 0 ? 0 : checked(array.length) | 0;
              that = createBuffer(that, length);

              for (var i = 0; i < length; i += 1) {
                that[i] = array[i] & 255;
              }

              return that;
            }

            function fromArrayBuffer(that, array, byteOffset, length) {
              array.byteLength; // this throws if `array` is not a valid ArrayBuffer

              if (byteOffset < 0 || array.byteLength < byteOffset) {
                throw new RangeError('\'offset\' is out of bounds');
              }

              if (array.byteLength < byteOffset + (length || 0)) {
                throw new RangeError('\'length\' is out of bounds');
              }

              if (byteOffset === undefined && length === undefined) {
                array = new Uint8Array(array);
              } else if (length === undefined) {
                array = new Uint8Array(array, byteOffset);
              } else {
                array = new Uint8Array(array, byteOffset, length);
              }

              if (Buffer.TYPED_ARRAY_SUPPORT) {
                // Return an augmented `Uint8Array` instance, for best performance
                that = array;
                that.__proto__ = Buffer.prototype;
              } else {
                // Fallback: Return an object instance of the Buffer class
                that = fromArrayLike(that, array);
              }

              return that;
            }

            function fromObject(that, obj) {
              if (internalIsBuffer(obj)) {
                var len = checked(obj.length) | 0;
                that = createBuffer(that, len);

                if (that.length === 0) {
                  return that;
                }

                obj.copy(that, 0, 0, len);
                return that;
              }

              if (obj) {
                if (typeof ArrayBuffer !== 'undefined' && obj.buffer instanceof ArrayBuffer || 'length' in obj) {
                  if (typeof obj.length !== 'number' || isnan(obj.length)) {
                    return createBuffer(that, 0);
                  }

                  return fromArrayLike(that, obj);
                }

                if (obj.type === 'Buffer' && isArray$1(obj.data)) {
                  return fromArrayLike(that, obj.data);
                }
              }

              throw new TypeError('First argument must be a string, Buffer, ArrayBuffer, Array, or array-like object.');
            }

            function checked(length) {
              // Note: cannot use `length < kMaxLength()` here because that fails when
              // length is NaN (which is otherwise coerced to zero.)
              if (length >= kMaxLength()) {
                throw new RangeError('Attempt to allocate Buffer larger than maximum ' + 'size: 0x' + kMaxLength().toString(16) + ' bytes');
              }

              return length | 0;
            }
            Buffer.isBuffer = isBuffer;

            function internalIsBuffer(b) {
              return !!(b != null && b._isBuffer);
            }

            Buffer.compare = function compare(a, b) {
              if (!internalIsBuffer(a) || !internalIsBuffer(b)) {
                throw new TypeError('Arguments must be Buffers');
              }

              if (a === b) return 0;
              var x = a.length;
              var y = b.length;

              for (var i = 0, len = Math.min(x, y); i < len; ++i) {
                if (a[i] !== b[i]) {
                  x = a[i];
                  y = b[i];
                  break;
                }
              }

              if (x < y) return -1;
              if (y < x) return 1;
              return 0;
            };

            Buffer.isEncoding = function isEncoding(encoding) {
              switch (String(encoding).toLowerCase()) {
                case 'hex':
                case 'utf8':
                case 'utf-8':
                case 'ascii':
                case 'latin1':
                case 'binary':
                case 'base64':
                case 'ucs2':
                case 'ucs-2':
                case 'utf16le':
                case 'utf-16le':
                  return true;

                default:
                  return false;
              }
            };

            Buffer.concat = function concat(list, length) {
              if (!isArray$1(list)) {
                throw new TypeError('"list" argument must be an Array of Buffers');
              }

              if (list.length === 0) {
                return Buffer.alloc(0);
              }

              var i;

              if (length === undefined) {
                length = 0;

                for (i = 0; i < list.length; ++i) {
                  length += list[i].length;
                }
              }

              var buffer = Buffer.allocUnsafe(length);
              var pos = 0;

              for (i = 0; i < list.length; ++i) {
                var buf = list[i];

                if (!internalIsBuffer(buf)) {
                  throw new TypeError('"list" argument must be an Array of Buffers');
                }

                buf.copy(buffer, pos);
                pos += buf.length;
              }

              return buffer;
            };

            function byteLength(string, encoding) {
              if (internalIsBuffer(string)) {
                return string.length;
              }

              if (typeof ArrayBuffer !== 'undefined' && typeof ArrayBuffer.isView === 'function' && (ArrayBuffer.isView(string) || string instanceof ArrayBuffer)) {
                return string.byteLength;
              }

              if (typeof string !== 'string') {
                string = '' + string;
              }

              var len = string.length;
              if (len === 0) return 0; // Use a for loop to avoid recursion

              var loweredCase = false;

              for (;;) {
                switch (encoding) {
                  case 'ascii':
                  case 'latin1':
                  case 'binary':
                    return len;

                  case 'utf8':
                  case 'utf-8':
                  case undefined:
                    return utf8ToBytes(string).length;

                  case 'ucs2':
                  case 'ucs-2':
                  case 'utf16le':
                  case 'utf-16le':
                    return len * 2;

                  case 'hex':
                    return len >>> 1;

                  case 'base64':
                    return base64ToBytes(string).length;

                  default:
                    if (loweredCase) return utf8ToBytes(string).length; // assume utf8

                    encoding = ('' + encoding).toLowerCase();
                    loweredCase = true;
                }
              }
            }

            Buffer.byteLength = byteLength;

            function slowToString(encoding, start, end) {
              var loweredCase = false; // No need to verify that "this.length <= MAX_UINT32" since it's a read-only
              // property of a typed array.
              // This behaves neither like String nor Uint8Array in that we set start/end
              // to their upper/lower bounds if the value passed is out of range.
              // undefined is handled specially as per ECMA-262 6th Edition,
              // Section 13.3.3.7 Runtime Semantics: KeyedBindingInitialization.

              if (start === undefined || start < 0) {
                start = 0;
              } // Return early if start > this.length. Done here to prevent potential uint32
              // coercion fail below.


              if (start > this.length) {
                return '';
              }

              if (end === undefined || end > this.length) {
                end = this.length;
              }

              if (end <= 0) {
                return '';
              } // Force coersion to uint32. This will also coerce falsey/NaN values to 0.


              end >>>= 0;
              start >>>= 0;

              if (end <= start) {
                return '';
              }

              if (!encoding) encoding = 'utf8';

              while (true) {
                switch (encoding) {
                  case 'hex':
                    return hexSlice(this, start, end);

                  case 'utf8':
                  case 'utf-8':
                    return utf8Slice(this, start, end);

                  case 'ascii':
                    return asciiSlice(this, start, end);

                  case 'latin1':
                  case 'binary':
                    return latin1Slice(this, start, end);

                  case 'base64':
                    return base64Slice(this, start, end);

                  case 'ucs2':
                  case 'ucs-2':
                  case 'utf16le':
                  case 'utf-16le':
                    return utf16leSlice(this, start, end);

                  default:
                    if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding);
                    encoding = (encoding + '').toLowerCase();
                    loweredCase = true;
                }
              }
            } // The property is used by `Buffer.isBuffer` and `is-buffer` (in Safari 5-7) to detect
            // Buffer instances.


            Buffer.prototype._isBuffer = true;

            function swap(b, n, m) {
              var i = b[n];
              b[n] = b[m];
              b[m] = i;
            }

            Buffer.prototype.swap16 = function swap16() {
              var len = this.length;

              if (len % 2 !== 0) {
                throw new RangeError('Buffer size must be a multiple of 16-bits');
              }

              for (var i = 0; i < len; i += 2) {
                swap(this, i, i + 1);
              }

              return this;
            };

            Buffer.prototype.swap32 = function swap32() {
              var len = this.length;

              if (len % 4 !== 0) {
                throw new RangeError('Buffer size must be a multiple of 32-bits');
              }

              for (var i = 0; i < len; i += 4) {
                swap(this, i, i + 3);
                swap(this, i + 1, i + 2);
              }

              return this;
            };

            Buffer.prototype.swap64 = function swap64() {
              var len = this.length;

              if (len % 8 !== 0) {
                throw new RangeError('Buffer size must be a multiple of 64-bits');
              }

              for (var i = 0; i < len; i += 8) {
                swap(this, i, i + 7);
                swap(this, i + 1, i + 6);
                swap(this, i + 2, i + 5);
                swap(this, i + 3, i + 4);
              }

              return this;
            };

            Buffer.prototype.toString = function toString() {
              var length = this.length | 0;
              if (length === 0) return '';
              if (arguments.length === 0) return utf8Slice(this, 0, length);
              return slowToString.apply(this, arguments);
            };

            Buffer.prototype.equals = function equals(b) {
              if (!internalIsBuffer(b)) throw new TypeError('Argument must be a Buffer');
              if (this === b) return true;
              return Buffer.compare(this, b) === 0;
            };

            Buffer.prototype.inspect = function inspect() {
              var str = '';
              var max = INSPECT_MAX_BYTES;

              if (this.length > 0) {
                str = this.toString('hex', 0, max).match(/.{2}/g).join(' ');
                if (this.length > max) str += ' ... ';
              }

              return '<Buffer ' + str + '>';
            };

            Buffer.prototype.compare = function compare(target, start, end, thisStart, thisEnd) {
              if (!internalIsBuffer(target)) {
                throw new TypeError('Argument must be a Buffer');
              }

              if (start === undefined) {
                start = 0;
              }

              if (end === undefined) {
                end = target ? target.length : 0;
              }

              if (thisStart === undefined) {
                thisStart = 0;
              }

              if (thisEnd === undefined) {
                thisEnd = this.length;
              }

              if (start < 0 || end > target.length || thisStart < 0 || thisEnd > this.length) {
                throw new RangeError('out of range index');
              }

              if (thisStart >= thisEnd && start >= end) {
                return 0;
              }

              if (thisStart >= thisEnd) {
                return -1;
              }

              if (start >= end) {
                return 1;
              }

              start >>>= 0;
              end >>>= 0;
              thisStart >>>= 0;
              thisEnd >>>= 0;
              if (this === target) return 0;
              var x = thisEnd - thisStart;
              var y = end - start;
              var len = Math.min(x, y);
              var thisCopy = this.slice(thisStart, thisEnd);
              var targetCopy = target.slice(start, end);

              for (var i = 0; i < len; ++i) {
                if (thisCopy[i] !== targetCopy[i]) {
                  x = thisCopy[i];
                  y = targetCopy[i];
                  break;
                }
              }

              if (x < y) return -1;
              if (y < x) return 1;
              return 0;
            }; // Finds either the first index of `val` in `buffer` at offset >= `byteOffset`,
            // OR the last index of `val` in `buffer` at offset <= `byteOffset`.
            //
            // Arguments:
            // - buffer - a Buffer to search
            // - val - a string, Buffer, or number
            // - byteOffset - an index into `buffer`; will be clamped to an int32
            // - encoding - an optional encoding, relevant is val is a string
            // - dir - true for indexOf, false for lastIndexOf


            function bidirectionalIndexOf(buffer, val, byteOffset, encoding, dir) {
              // Empty buffer means no match
              if (buffer.length === 0) return -1; // Normalize byteOffset

              if (typeof byteOffset === 'string') {
                encoding = byteOffset;
                byteOffset = 0;
              } else if (byteOffset > 0x7fffffff) {
                byteOffset = 0x7fffffff;
              } else if (byteOffset < -0x80000000) {
                byteOffset = -0x80000000;
              }

              byteOffset = +byteOffset; // Coerce to Number.

              if (isNaN(byteOffset)) {
                // byteOffset: it it's undefined, null, NaN, "foo", etc, search whole buffer
                byteOffset = dir ? 0 : buffer.length - 1;
              } // Normalize byteOffset: negative offsets start from the end of the buffer


              if (byteOffset < 0) byteOffset = buffer.length + byteOffset;

              if (byteOffset >= buffer.length) {
                if (dir) return -1;else byteOffset = buffer.length - 1;
              } else if (byteOffset < 0) {
                if (dir) byteOffset = 0;else return -1;
              } // Normalize val


              if (typeof val === 'string') {
                val = Buffer.from(val, encoding);
              } // Finally, search either indexOf (if dir is true) or lastIndexOf


              if (internalIsBuffer(val)) {
                // Special case: looking for empty string/buffer always fails
                if (val.length === 0) {
                  return -1;
                }

                return arrayIndexOf(buffer, val, byteOffset, encoding, dir);
              } else if (typeof val === 'number') {
                val = val & 0xFF; // Search for a byte value [0-255]

                if (Buffer.TYPED_ARRAY_SUPPORT && typeof Uint8Array.prototype.indexOf === 'function') {
                  if (dir) {
                    return Uint8Array.prototype.indexOf.call(buffer, val, byteOffset);
                  } else {
                    return Uint8Array.prototype.lastIndexOf.call(buffer, val, byteOffset);
                  }
                }

                return arrayIndexOf(buffer, [val], byteOffset, encoding, dir);
              }

              throw new TypeError('val must be string, number or Buffer');
            }

            function arrayIndexOf(arr, val, byteOffset, encoding, dir) {
              var indexSize = 1;
              var arrLength = arr.length;
              var valLength = val.length;

              if (encoding !== undefined) {
                encoding = String(encoding).toLowerCase();

                if (encoding === 'ucs2' || encoding === 'ucs-2' || encoding === 'utf16le' || encoding === 'utf-16le') {
                  if (arr.length < 2 || val.length < 2) {
                    return -1;
                  }

                  indexSize = 2;
                  arrLength /= 2;
                  valLength /= 2;
                  byteOffset /= 2;
                }
              }

              function read$$1(buf, i) {
                if (indexSize === 1) {
                  return buf[i];
                } else {
                  return buf.readUInt16BE(i * indexSize);
                }
              }

              var i;

              if (dir) {
                var foundIndex = -1;

                for (i = byteOffset; i < arrLength; i++) {
                  if (read$$1(arr, i) === read$$1(val, foundIndex === -1 ? 0 : i - foundIndex)) {
                    if (foundIndex === -1) foundIndex = i;
                    if (i - foundIndex + 1 === valLength) return foundIndex * indexSize;
                  } else {
                    if (foundIndex !== -1) i -= i - foundIndex;
                    foundIndex = -1;
                  }
                }
              } else {
                if (byteOffset + valLength > arrLength) byteOffset = arrLength - valLength;

                for (i = byteOffset; i >= 0; i--) {
                  var found = true;

                  for (var j = 0; j < valLength; j++) {
                    if (read$$1(arr, i + j) !== read$$1(val, j)) {
                      found = false;
                      break;
                    }
                  }

                  if (found) return i;
                }
              }

              return -1;
            }

            Buffer.prototype.includes = function includes(val, byteOffset, encoding) {
              return this.indexOf(val, byteOffset, encoding) !== -1;
            };

            Buffer.prototype.indexOf = function indexOf(val, byteOffset, encoding) {
              return bidirectionalIndexOf(this, val, byteOffset, encoding, true);
            };

            Buffer.prototype.lastIndexOf = function lastIndexOf(val, byteOffset, encoding) {
              return bidirectionalIndexOf(this, val, byteOffset, encoding, false);
            };

            function hexWrite(buf, string, offset, length) {
              offset = Number(offset) || 0;
              var remaining = buf.length - offset;

              if (!length) {
                length = remaining;
              } else {
                length = Number(length);

                if (length > remaining) {
                  length = remaining;
                }
              } // must be an even number of digits


              var strLen = string.length;
              if (strLen % 2 !== 0) throw new TypeError('Invalid hex string');

              if (length > strLen / 2) {
                length = strLen / 2;
              }

              for (var i = 0; i < length; ++i) {
                var parsed = parseInt(string.substr(i * 2, 2), 16);
                if (isNaN(parsed)) return i;
                buf[offset + i] = parsed;
              }

              return i;
            }

            function utf8Write(buf, string, offset, length) {
              return blitBuffer(utf8ToBytes(string, buf.length - offset), buf, offset, length);
            }

            function asciiWrite(buf, string, offset, length) {
              return blitBuffer(asciiToBytes(string), buf, offset, length);
            }

            function latin1Write(buf, string, offset, length) {
              return asciiWrite(buf, string, offset, length);
            }

            function base64Write(buf, string, offset, length) {
              return blitBuffer(base64ToBytes(string), buf, offset, length);
            }

            function ucs2Write(buf, string, offset, length) {
              return blitBuffer(utf16leToBytes(string, buf.length - offset), buf, offset, length);
            }

            Buffer.prototype.write = function write$$1(string, offset, length, encoding) {
              // Buffer#write(string)
              if (offset === undefined) {
                encoding = 'utf8';
                length = this.length;
                offset = 0; // Buffer#write(string, encoding)
              } else if (length === undefined && typeof offset === 'string') {
                encoding = offset;
                length = this.length;
                offset = 0; // Buffer#write(string, offset[, length][, encoding])
              } else if (isFinite(offset)) {
                offset = offset | 0;

                if (isFinite(length)) {
                  length = length | 0;
                  if (encoding === undefined) encoding = 'utf8';
                } else {
                  encoding = length;
                  length = undefined;
                } // legacy write(string, encoding, offset, length) - remove in v0.13

              } else {
                throw new Error('Buffer.write(string, encoding, offset[, length]) is no longer supported');
              }

              var remaining = this.length - offset;
              if (length === undefined || length > remaining) length = remaining;

              if (string.length > 0 && (length < 0 || offset < 0) || offset > this.length) {
                throw new RangeError('Attempt to write outside buffer bounds');
              }

              if (!encoding) encoding = 'utf8';
              var loweredCase = false;

              for (;;) {
                switch (encoding) {
                  case 'hex':
                    return hexWrite(this, string, offset, length);

                  case 'utf8':
                  case 'utf-8':
                    return utf8Write(this, string, offset, length);

                  case 'ascii':
                    return asciiWrite(this, string, offset, length);

                  case 'latin1':
                  case 'binary':
                    return latin1Write(this, string, offset, length);

                  case 'base64':
                    // Warning: maxLength not taken into account in base64Write
                    return base64Write(this, string, offset, length);

                  case 'ucs2':
                  case 'ucs-2':
                  case 'utf16le':
                  case 'utf-16le':
                    return ucs2Write(this, string, offset, length);

                  default:
                    if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding);
                    encoding = ('' + encoding).toLowerCase();
                    loweredCase = true;
                }
              }
            };

            Buffer.prototype.toJSON = function toJSON() {
              return {
                type: 'Buffer',
                data: Array.prototype.slice.call(this._arr || this, 0)
              };
            };

            function base64Slice(buf, start, end) {
              if (start === 0 && end === buf.length) {
                return fromByteArray(buf);
              } else {
                return fromByteArray(buf.slice(start, end));
              }
            }

            function utf8Slice(buf, start, end) {
              end = Math.min(buf.length, end);
              var res = [];
              var i = start;

              while (i < end) {
                var firstByte = buf[i];
                var codePoint = null;
                var bytesPerSequence = firstByte > 0xEF ? 4 : firstByte > 0xDF ? 3 : firstByte > 0xBF ? 2 : 1;

                if (i + bytesPerSequence <= end) {
                  var secondByte, thirdByte, fourthByte, tempCodePoint;

                  switch (bytesPerSequence) {
                    case 1:
                      if (firstByte < 0x80) {
                        codePoint = firstByte;
                      }

                      break;

                    case 2:
                      secondByte = buf[i + 1];

                      if ((secondByte & 0xC0) === 0x80) {
                        tempCodePoint = (firstByte & 0x1F) << 0x6 | secondByte & 0x3F;

                        if (tempCodePoint > 0x7F) {
                          codePoint = tempCodePoint;
                        }
                      }

                      break;

                    case 3:
                      secondByte = buf[i + 1];
                      thirdByte = buf[i + 2];

                      if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80) {
                        tempCodePoint = (firstByte & 0xF) << 0xC | (secondByte & 0x3F) << 0x6 | thirdByte & 0x3F;

                        if (tempCodePoint > 0x7FF && (tempCodePoint < 0xD800 || tempCodePoint > 0xDFFF)) {
                          codePoint = tempCodePoint;
                        }
                      }

                      break;

                    case 4:
                      secondByte = buf[i + 1];
                      thirdByte = buf[i + 2];
                      fourthByte = buf[i + 3];

                      if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80 && (fourthByte & 0xC0) === 0x80) {
                        tempCodePoint = (firstByte & 0xF) << 0x12 | (secondByte & 0x3F) << 0xC | (thirdByte & 0x3F) << 0x6 | fourthByte & 0x3F;

                        if (tempCodePoint > 0xFFFF && tempCodePoint < 0x110000) {
                          codePoint = tempCodePoint;
                        }
                      }

                  }
                }

                if (codePoint === null) {
                  // we did not generate a valid codePoint so insert a
                  // replacement char (U+FFFD) and advance only 1 byte
                  codePoint = 0xFFFD;
                  bytesPerSequence = 1;
                } else if (codePoint > 0xFFFF) {
                  // encode to utf16 (surrogate pair dance)
                  codePoint -= 0x10000;
                  res.push(codePoint >>> 10 & 0x3FF | 0xD800);
                  codePoint = 0xDC00 | codePoint & 0x3FF;
                }

                res.push(codePoint);
                i += bytesPerSequence;
              }

              return decodeCodePointsArray(res);
            } // Based on http://stackoverflow.com/a/22747272/680742, the browser with
            // the lowest limit is Chrome, with 0x10000 args.
            // We go 1 magnitude less, for safety


            var MAX_ARGUMENTS_LENGTH = 0x1000;

            function decodeCodePointsArray(codePoints) {
              var len = codePoints.length;

              if (len <= MAX_ARGUMENTS_LENGTH) {
                return String.fromCharCode.apply(String, codePoints); // avoid extra slice()
              } // Decode in chunks to avoid "call stack size exceeded".


              var res = '';
              var i = 0;

              while (i < len) {
                res += String.fromCharCode.apply(String, codePoints.slice(i, i += MAX_ARGUMENTS_LENGTH));
              }

              return res;
            }

            function asciiSlice(buf, start, end) {
              var ret = '';
              end = Math.min(buf.length, end);

              for (var i = start; i < end; ++i) {
                ret += String.fromCharCode(buf[i] & 0x7F);
              }

              return ret;
            }

            function latin1Slice(buf, start, end) {
              var ret = '';
              end = Math.min(buf.length, end);

              for (var i = start; i < end; ++i) {
                ret += String.fromCharCode(buf[i]);
              }

              return ret;
            }

            function hexSlice(buf, start, end) {
              var len = buf.length;
              if (!start || start < 0) start = 0;
              if (!end || end < 0 || end > len) end = len;
              var out = '';

              for (var i = start; i < end; ++i) {
                out += toHex(buf[i]);
              }

              return out;
            }

            function utf16leSlice(buf, start, end) {
              var bytes = buf.slice(start, end);
              var res = '';

              for (var i = 0; i < bytes.length; i += 2) {
                res += String.fromCharCode(bytes[i] + bytes[i + 1] * 256);
              }

              return res;
            }

            Buffer.prototype.slice = function slice(start, end) {
              var len = this.length;
              start = ~~start;
              end = end === undefined ? len : ~~end;

              if (start < 0) {
                start += len;
                if (start < 0) start = 0;
              } else if (start > len) {
                start = len;
              }

              if (end < 0) {
                end += len;
                if (end < 0) end = 0;
              } else if (end > len) {
                end = len;
              }

              if (end < start) end = start;
              var newBuf;

              if (Buffer.TYPED_ARRAY_SUPPORT) {
                newBuf = this.subarray(start, end);
                newBuf.__proto__ = Buffer.prototype;
              } else {
                var sliceLen = end - start;
                newBuf = new Buffer(sliceLen, undefined);

                for (var i = 0; i < sliceLen; ++i) {
                  newBuf[i] = this[i + start];
                }
              }

              return newBuf;
            };
            /*
             * Need to make sure that buffer isn't trying to write out of bounds.
             */


            function checkOffset(offset, ext, length) {
              if (offset % 1 !== 0 || offset < 0) throw new RangeError('offset is not uint');
              if (offset + ext > length) throw new RangeError('Trying to access beyond buffer length');
            }

            Buffer.prototype.readUIntLE = function readUIntLE(offset, byteLength, noAssert) {
              offset = offset | 0;
              byteLength = byteLength | 0;
              if (!noAssert) checkOffset(offset, byteLength, this.length);
              var val = this[offset];
              var mul = 1;
              var i = 0;

              while (++i < byteLength && (mul *= 0x100)) {
                val += this[offset + i] * mul;
              }

              return val;
            };

            Buffer.prototype.readUIntBE = function readUIntBE(offset, byteLength, noAssert) {
              offset = offset | 0;
              byteLength = byteLength | 0;

              if (!noAssert) {
                checkOffset(offset, byteLength, this.length);
              }

              var val = this[offset + --byteLength];
              var mul = 1;

              while (byteLength > 0 && (mul *= 0x100)) {
                val += this[offset + --byteLength] * mul;
              }

              return val;
            };

            Buffer.prototype.readUInt8 = function readUInt8(offset, noAssert) {
              if (!noAssert) checkOffset(offset, 1, this.length);
              return this[offset];
            };

            Buffer.prototype.readUInt16LE = function readUInt16LE(offset, noAssert) {
              if (!noAssert) checkOffset(offset, 2, this.length);
              return this[offset] | this[offset + 1] << 8;
            };

            Buffer.prototype.readUInt16BE = function readUInt16BE(offset, noAssert) {
              if (!noAssert) checkOffset(offset, 2, this.length);
              return this[offset] << 8 | this[offset + 1];
            };

            Buffer.prototype.readUInt32LE = function readUInt32LE(offset, noAssert) {
              if (!noAssert) checkOffset(offset, 4, this.length);
              return (this[offset] | this[offset + 1] << 8 | this[offset + 2] << 16) + this[offset + 3] * 0x1000000;
            };

            Buffer.prototype.readUInt32BE = function readUInt32BE(offset, noAssert) {
              if (!noAssert) checkOffset(offset, 4, this.length);
              return this[offset] * 0x1000000 + (this[offset + 1] << 16 | this[offset + 2] << 8 | this[offset + 3]);
            };

            Buffer.prototype.readIntLE = function readIntLE(offset, byteLength, noAssert) {
              offset = offset | 0;
              byteLength = byteLength | 0;
              if (!noAssert) checkOffset(offset, byteLength, this.length);
              var val = this[offset];
              var mul = 1;
              var i = 0;

              while (++i < byteLength && (mul *= 0x100)) {
                val += this[offset + i] * mul;
              }

              mul *= 0x80;
              if (val >= mul) val -= Math.pow(2, 8 * byteLength);
              return val;
            };

            Buffer.prototype.readIntBE = function readIntBE(offset, byteLength, noAssert) {
              offset = offset | 0;
              byteLength = byteLength | 0;
              if (!noAssert) checkOffset(offset, byteLength, this.length);
              var i = byteLength;
              var mul = 1;
              var val = this[offset + --i];

              while (i > 0 && (mul *= 0x100)) {
                val += this[offset + --i] * mul;
              }

              mul *= 0x80;
              if (val >= mul) val -= Math.pow(2, 8 * byteLength);
              return val;
            };

            Buffer.prototype.readInt8 = function readInt8(offset, noAssert) {
              if (!noAssert) checkOffset(offset, 1, this.length);
              if (!(this[offset] & 0x80)) return this[offset];
              return (0xff - this[offset] + 1) * -1;
            };

            Buffer.prototype.readInt16LE = function readInt16LE(offset, noAssert) {
              if (!noAssert) checkOffset(offset, 2, this.length);
              var val = this[offset] | this[offset + 1] << 8;
              return val & 0x8000 ? val | 0xFFFF0000 : val;
            };

            Buffer.prototype.readInt16BE = function readInt16BE(offset, noAssert) {
              if (!noAssert) checkOffset(offset, 2, this.length);
              var val = this[offset + 1] | this[offset] << 8;
              return val & 0x8000 ? val | 0xFFFF0000 : val;
            };

            Buffer.prototype.readInt32LE = function readInt32LE(offset, noAssert) {
              if (!noAssert) checkOffset(offset, 4, this.length);
              return this[offset] | this[offset + 1] << 8 | this[offset + 2] << 16 | this[offset + 3] << 24;
            };

            Buffer.prototype.readInt32BE = function readInt32BE(offset, noAssert) {
              if (!noAssert) checkOffset(offset, 4, this.length);
              return this[offset] << 24 | this[offset + 1] << 16 | this[offset + 2] << 8 | this[offset + 3];
            };

            Buffer.prototype.readFloatLE = function readFloatLE(offset, noAssert) {
              if (!noAssert) checkOffset(offset, 4, this.length);
              return read(this, offset, true, 23, 4);
            };

            Buffer.prototype.readFloatBE = function readFloatBE(offset, noAssert) {
              if (!noAssert) checkOffset(offset, 4, this.length);
              return read(this, offset, false, 23, 4);
            };

            Buffer.prototype.readDoubleLE = function readDoubleLE(offset, noAssert) {
              if (!noAssert) checkOffset(offset, 8, this.length);
              return read(this, offset, true, 52, 8);
            };

            Buffer.prototype.readDoubleBE = function readDoubleBE(offset, noAssert) {
              if (!noAssert) checkOffset(offset, 8, this.length);
              return read(this, offset, false, 52, 8);
            };

            function checkInt(buf, value, offset, ext, max, min) {
              if (!internalIsBuffer(buf)) throw new TypeError('"buffer" argument must be a Buffer instance');
              if (value > max || value < min) throw new RangeError('"value" argument is out of bounds');
              if (offset + ext > buf.length) throw new RangeError('Index out of range');
            }

            Buffer.prototype.writeUIntLE = function writeUIntLE(value, offset, byteLength, noAssert) {
              value = +value;
              offset = offset | 0;
              byteLength = byteLength | 0;

              if (!noAssert) {
                var maxBytes = Math.pow(2, 8 * byteLength) - 1;
                checkInt(this, value, offset, byteLength, maxBytes, 0);
              }

              var mul = 1;
              var i = 0;
              this[offset] = value & 0xFF;

              while (++i < byteLength && (mul *= 0x100)) {
                this[offset + i] = value / mul & 0xFF;
              }

              return offset + byteLength;
            };

            Buffer.prototype.writeUIntBE = function writeUIntBE(value, offset, byteLength, noAssert) {
              value = +value;
              offset = offset | 0;
              byteLength = byteLength | 0;

              if (!noAssert) {
                var maxBytes = Math.pow(2, 8 * byteLength) - 1;
                checkInt(this, value, offset, byteLength, maxBytes, 0);
              }

              var i = byteLength - 1;
              var mul = 1;
              this[offset + i] = value & 0xFF;

              while (--i >= 0 && (mul *= 0x100)) {
                this[offset + i] = value / mul & 0xFF;
              }

              return offset + byteLength;
            };

            Buffer.prototype.writeUInt8 = function writeUInt8(value, offset, noAssert) {
              value = +value;
              offset = offset | 0;
              if (!noAssert) checkInt(this, value, offset, 1, 0xff, 0);
              if (!Buffer.TYPED_ARRAY_SUPPORT) value = Math.floor(value);
              this[offset] = value & 0xff;
              return offset + 1;
            };

            function objectWriteUInt16(buf, value, offset, littleEndian) {
              if (value < 0) value = 0xffff + value + 1;

              for (var i = 0, j = Math.min(buf.length - offset, 2); i < j; ++i) {
                buf[offset + i] = (value & 0xff << 8 * (littleEndian ? i : 1 - i)) >>> (littleEndian ? i : 1 - i) * 8;
              }
            }

            Buffer.prototype.writeUInt16LE = function writeUInt16LE(value, offset, noAssert) {
              value = +value;
              offset = offset | 0;
              if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0);

              if (Buffer.TYPED_ARRAY_SUPPORT) {
                this[offset] = value & 0xff;
                this[offset + 1] = value >>> 8;
              } else {
                objectWriteUInt16(this, value, offset, true);
              }

              return offset + 2;
            };

            Buffer.prototype.writeUInt16BE = function writeUInt16BE(value, offset, noAssert) {
              value = +value;
              offset = offset | 0;
              if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0);

              if (Buffer.TYPED_ARRAY_SUPPORT) {
                this[offset] = value >>> 8;
                this[offset + 1] = value & 0xff;
              } else {
                objectWriteUInt16(this, value, offset, false);
              }

              return offset + 2;
            };

            function objectWriteUInt32(buf, value, offset, littleEndian) {
              if (value < 0) value = 0xffffffff + value + 1;

              for (var i = 0, j = Math.min(buf.length - offset, 4); i < j; ++i) {
                buf[offset + i] = value >>> (littleEndian ? i : 3 - i) * 8 & 0xff;
              }
            }

            Buffer.prototype.writeUInt32LE = function writeUInt32LE(value, offset, noAssert) {
              value = +value;
              offset = offset | 0;
              if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0);

              if (Buffer.TYPED_ARRAY_SUPPORT) {
                this[offset + 3] = value >>> 24;
                this[offset + 2] = value >>> 16;
                this[offset + 1] = value >>> 8;
                this[offset] = value & 0xff;
              } else {
                objectWriteUInt32(this, value, offset, true);
              }

              return offset + 4;
            };

            Buffer.prototype.writeUInt32BE = function writeUInt32BE(value, offset, noAssert) {
              value = +value;
              offset = offset | 0;
              if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0);

              if (Buffer.TYPED_ARRAY_SUPPORT) {
                this[offset] = value >>> 24;
                this[offset + 1] = value >>> 16;
                this[offset + 2] = value >>> 8;
                this[offset + 3] = value & 0xff;
              } else {
                objectWriteUInt32(this, value, offset, false);
              }

              return offset + 4;
            };

            Buffer.prototype.writeIntLE = function writeIntLE(value, offset, byteLength, noAssert) {
              value = +value;
              offset = offset | 0;

              if (!noAssert) {
                var limit = Math.pow(2, 8 * byteLength - 1);
                checkInt(this, value, offset, byteLength, limit - 1, -limit);
              }

              var i = 0;
              var mul = 1;
              var sub = 0;
              this[offset] = value & 0xFF;

              while (++i < byteLength && (mul *= 0x100)) {
                if (value < 0 && sub === 0 && this[offset + i - 1] !== 0) {
                  sub = 1;
                }

                this[offset + i] = (value / mul >> 0) - sub & 0xFF;
              }

              return offset + byteLength;
            };

            Buffer.prototype.writeIntBE = function writeIntBE(value, offset, byteLength, noAssert) {
              value = +value;
              offset = offset | 0;

              if (!noAssert) {
                var limit = Math.pow(2, 8 * byteLength - 1);
                checkInt(this, value, offset, byteLength, limit - 1, -limit);
              }

              var i = byteLength - 1;
              var mul = 1;
              var sub = 0;
              this[offset + i] = value & 0xFF;

              while (--i >= 0 && (mul *= 0x100)) {
                if (value < 0 && sub === 0 && this[offset + i + 1] !== 0) {
                  sub = 1;
                }

                this[offset + i] = (value / mul >> 0) - sub & 0xFF;
              }

              return offset + byteLength;
            };

            Buffer.prototype.writeInt8 = function writeInt8(value, offset, noAssert) {
              value = +value;
              offset = offset | 0;
              if (!noAssert) checkInt(this, value, offset, 1, 0x7f, -0x80);
              if (!Buffer.TYPED_ARRAY_SUPPORT) value = Math.floor(value);
              if (value < 0) value = 0xff + value + 1;
              this[offset] = value & 0xff;
              return offset + 1;
            };

            Buffer.prototype.writeInt16LE = function writeInt16LE(value, offset, noAssert) {
              value = +value;
              offset = offset | 0;
              if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000);

              if (Buffer.TYPED_ARRAY_SUPPORT) {
                this[offset] = value & 0xff;
                this[offset + 1] = value >>> 8;
              } else {
                objectWriteUInt16(this, value, offset, true);
              }

              return offset + 2;
            };

            Buffer.prototype.writeInt16BE = function writeInt16BE(value, offset, noAssert) {
              value = +value;
              offset = offset | 0;
              if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000);

              if (Buffer.TYPED_ARRAY_SUPPORT) {
                this[offset] = value >>> 8;
                this[offset + 1] = value & 0xff;
              } else {
                objectWriteUInt16(this, value, offset, false);
              }

              return offset + 2;
            };

            Buffer.prototype.writeInt32LE = function writeInt32LE(value, offset, noAssert) {
              value = +value;
              offset = offset | 0;
              if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000);

              if (Buffer.TYPED_ARRAY_SUPPORT) {
                this[offset] = value & 0xff;
                this[offset + 1] = value >>> 8;
                this[offset + 2] = value >>> 16;
                this[offset + 3] = value >>> 24;
              } else {
                objectWriteUInt32(this, value, offset, true);
              }

              return offset + 4;
            };

            Buffer.prototype.writeInt32BE = function writeInt32BE(value, offset, noAssert) {
              value = +value;
              offset = offset | 0;
              if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000);
              if (value < 0) value = 0xffffffff + value + 1;

              if (Buffer.TYPED_ARRAY_SUPPORT) {
                this[offset] = value >>> 24;
                this[offset + 1] = value >>> 16;
                this[offset + 2] = value >>> 8;
                this[offset + 3] = value & 0xff;
              } else {
                objectWriteUInt32(this, value, offset, false);
              }

              return offset + 4;
            };

            function checkIEEE754(buf, value, offset, ext, max, min) {
              if (offset + ext > buf.length) throw new RangeError('Index out of range');
              if (offset < 0) throw new RangeError('Index out of range');
            }

            function writeFloat(buf, value, offset, littleEndian, noAssert) {
              if (!noAssert) {
                checkIEEE754(buf, value, offset, 4, 3.4028234663852886e+38, -3.4028234663852886e+38);
              }

              write(buf, value, offset, littleEndian, 23, 4);
              return offset + 4;
            }

            Buffer.prototype.writeFloatLE = function writeFloatLE(value, offset, noAssert) {
              return writeFloat(this, value, offset, true, noAssert);
            };

            Buffer.prototype.writeFloatBE = function writeFloatBE(value, offset, noAssert) {
              return writeFloat(this, value, offset, false, noAssert);
            };

            function writeDouble(buf, value, offset, littleEndian, noAssert) {
              if (!noAssert) {
                checkIEEE754(buf, value, offset, 8, 1.7976931348623157E+308, -1.7976931348623157E+308);
              }

              write(buf, value, offset, littleEndian, 52, 8);
              return offset + 8;
            }

            Buffer.prototype.writeDoubleLE = function writeDoubleLE(value, offset, noAssert) {
              return writeDouble(this, value, offset, true, noAssert);
            };

            Buffer.prototype.writeDoubleBE = function writeDoubleBE(value, offset, noAssert) {
              return writeDouble(this, value, offset, false, noAssert);
            }; // copy(targetBuffer, targetStart=0, sourceStart=0, sourceEnd=buffer.length)


            Buffer.prototype.copy = function copy(target, targetStart, start, end) {
              if (!start) start = 0;
              if (!end && end !== 0) end = this.length;
              if (targetStart >= target.length) targetStart = target.length;
              if (!targetStart) targetStart = 0;
              if (end > 0 && end < start) end = start; // Copy 0 bytes; we're done

              if (end === start) return 0;
              if (target.length === 0 || this.length === 0) return 0; // Fatal error conditions

              if (targetStart < 0) {
                throw new RangeError('targetStart out of bounds');
              }

              if (start < 0 || start >= this.length) throw new RangeError('sourceStart out of bounds');
              if (end < 0) throw new RangeError('sourceEnd out of bounds'); // Are we oob?

              if (end > this.length) end = this.length;

              if (target.length - targetStart < end - start) {
                end = target.length - targetStart + start;
              }

              var len = end - start;
              var i;

              if (this === target && start < targetStart && targetStart < end) {
                // descending copy from end
                for (i = len - 1; i >= 0; --i) {
                  target[i + targetStart] = this[i + start];
                }
              } else if (len < 1000 || !Buffer.TYPED_ARRAY_SUPPORT) {
                // ascending copy from start
                for (i = 0; i < len; ++i) {
                  target[i + targetStart] = this[i + start];
                }
              } else {
                Uint8Array.prototype.set.call(target, this.subarray(start, start + len), targetStart);
              }

              return len;
            }; // Usage:
            //    buffer.fill(number[, offset[, end]])
            //    buffer.fill(buffer[, offset[, end]])
            //    buffer.fill(string[, offset[, end]][, encoding])


            Buffer.prototype.fill = function fill(val, start, end, encoding) {
              // Handle string cases:
              if (typeof val === 'string') {
                if (typeof start === 'string') {
                  encoding = start;
                  start = 0;
                  end = this.length;
                } else if (typeof end === 'string') {
                  encoding = end;
                  end = this.length;
                }

                if (val.length === 1) {
                  var code = val.charCodeAt(0);

                  if (code < 256) {
                    val = code;
                  }
                }

                if (encoding !== undefined && typeof encoding !== 'string') {
                  throw new TypeError('encoding must be a string');
                }

                if (typeof encoding === 'string' && !Buffer.isEncoding(encoding)) {
                  throw new TypeError('Unknown encoding: ' + encoding);
                }
              } else if (typeof val === 'number') {
                val = val & 255;
              } // Invalid ranges are not set to a default, so can range check early.


              if (start < 0 || this.length < start || this.length < end) {
                throw new RangeError('Out of range index');
              }

              if (end <= start) {
                return this;
              }

              start = start >>> 0;
              end = end === undefined ? this.length : end >>> 0;
              if (!val) val = 0;
              var i;

              if (typeof val === 'number') {
                for (i = start; i < end; ++i) {
                  this[i] = val;
                }
              } else {
                var bytes = internalIsBuffer(val) ? val : utf8ToBytes(new Buffer(val, encoding).toString());
                var len = bytes.length;

                for (i = 0; i < end - start; ++i) {
                  this[i + start] = bytes[i % len];
                }
              }

              return this;
            }; // HELPER FUNCTIONS
            // ================


            var INVALID_BASE64_RE = /[^+\/0-9A-Za-z-_]/g;

            function base64clean(str) {
              // Node strips out invalid characters like \n and \t from the string, base64-js does not
              str = stringtrim(str).replace(INVALID_BASE64_RE, ''); // Node converts strings with length < 2 to ''

              if (str.length < 2) return ''; // Node allows for non-padded base64 strings (missing trailing ===), base64-js does not

              while (str.length % 4 !== 0) {
                str = str + '=';
              }

              return str;
            }

            function stringtrim(str) {
              if (str.trim) return str.trim();
              return str.replace(/^\s+|\s+$/g, '');
            }

            function toHex(n) {
              if (n < 16) return '0' + n.toString(16);
              return n.toString(16);
            }

            function utf8ToBytes(string, units) {
              units = units || Infinity;
              var codePoint;
              var length = string.length;
              var leadSurrogate = null;
              var bytes = [];

              for (var i = 0; i < length; ++i) {
                codePoint = string.charCodeAt(i); // is surrogate component

                if (codePoint > 0xD7FF && codePoint < 0xE000) {
                  // last char was a lead
                  if (!leadSurrogate) {
                    // no lead yet
                    if (codePoint > 0xDBFF) {
                      // unexpected trail
                      if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD);
                      continue;
                    } else if (i + 1 === length) {
                      // unpaired lead
                      if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD);
                      continue;
                    } // valid lead


                    leadSurrogate = codePoint;
                    continue;
                  } // 2 leads in a row


                  if (codePoint < 0xDC00) {
                    if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD);
                    leadSurrogate = codePoint;
                    continue;
                  } // valid surrogate pair


                  codePoint = (leadSurrogate - 0xD800 << 10 | codePoint - 0xDC00) + 0x10000;
                } else if (leadSurrogate) {
                  // valid bmp char, but last char was a lead
                  if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD);
                }

                leadSurrogate = null; // encode utf8

                if (codePoint < 0x80) {
                  if ((units -= 1) < 0) break;
                  bytes.push(codePoint);
                } else if (codePoint < 0x800) {
                  if ((units -= 2) < 0) break;
                  bytes.push(codePoint >> 0x6 | 0xC0, codePoint & 0x3F | 0x80);
                } else if (codePoint < 0x10000) {
                  if ((units -= 3) < 0) break;
                  bytes.push(codePoint >> 0xC | 0xE0, codePoint >> 0x6 & 0x3F | 0x80, codePoint & 0x3F | 0x80);
                } else if (codePoint < 0x110000) {
                  if ((units -= 4) < 0) break;
                  bytes.push(codePoint >> 0x12 | 0xF0, codePoint >> 0xC & 0x3F | 0x80, codePoint >> 0x6 & 0x3F | 0x80, codePoint & 0x3F | 0x80);
                } else {
                  throw new Error('Invalid code point');
                }
              }

              return bytes;
            }

            function asciiToBytes(str) {
              var byteArray = [];

              for (var i = 0; i < str.length; ++i) {
                // Node's code seems to be doing this and not & 0x7F..
                byteArray.push(str.charCodeAt(i) & 0xFF);
              }

              return byteArray;
            }

            function utf16leToBytes(str, units) {
              var c, hi, lo;
              var byteArray = [];

              for (var i = 0; i < str.length; ++i) {
                if ((units -= 2) < 0) break;
                c = str.charCodeAt(i);
                hi = c >> 8;
                lo = c % 256;
                byteArray.push(lo);
                byteArray.push(hi);
              }

              return byteArray;
            }

            function base64ToBytes(str) {
              return toByteArray(base64clean(str));
            }

            function blitBuffer(src, dst, offset, length) {
              for (var i = 0; i < length; ++i) {
                if (i + offset >= dst.length || i >= src.length) break;
                dst[i + offset] = src[i];
              }

              return i;
            }

            function isnan(val) {
              return val !== val; // eslint-disable-line no-self-compare
            } // the following is from is-buffer, also by Feross Aboukhadijeh and with same lisence
            // The _isBuffer check is for Safari 5-7 support, because it's missing
            // Object.prototype.constructor. Remove this eventually


            function isBuffer(obj) {
              return obj != null && (!!obj._isBuffer || isFastBuffer(obj) || isSlowBuffer(obj));
            }

            function isFastBuffer(obj) {
              return !!obj.constructor && typeof obj.constructor.isBuffer === 'function' && obj.constructor.isBuffer(obj);
            } // For Node v0.10 support. Remove this eventually.


            function isSlowBuffer(obj) {
              return typeof obj.readFloatLE === 'function' && typeof obj.slice === 'function' && isFastBuffer(obj.slice(0, 0));
            }

            if (typeof global$1.setTimeout === 'function') ;

            if (typeof global$1.clearTimeout === 'function') ;

            var performance = global$1.performance || {};

            var performanceNow = performance.now || performance.mozNow || performance.msNow || performance.oNow || performance.webkitNow || function () {
              return new Date().getTime();
            }; // generate timestamp or delta

            // Copyright Joyent, Inc. and other Node contributors.

            // Copyright Joyent, Inc. and other Node contributors.

            getCjsExportFromNamespace(path$1);

            function getDefaultBaseUrl() {
              let url$$1;

              if (typeof location !== 'undefined') {
                url$$1 = location.href.split('#')[0].split('?')[0];
                const lastSepIndex = url$$1.lastIndexOf('/');

                if (lastSepIndex !== -1) {
                  url$$1 = url$$1.slice(0, lastSepIndex + 1);
                }
              }

              return url$$1;
            }

            let baseUrl = getDefaultBaseUrl();
            function urlToPath(url$$1) {
              return new URL(url$$1).pathname;
            }
            function basename$1(moduleUrl) {
              const filePath = urlToPath(moduleUrl);
              return path.basename(filePath);
            }
            function dirname$1(moduleUrl) {
              const filePath = urlToPath(moduleUrl);
              return path.dirname(filePath);
            }
            const sourceMapSources = {};
            SourceMapSupport.install({
              retrieveSourceMap: function (source) {
                if (!sourceMapSources[source]) return null;
                return {
                  url: source.replace('!transpiled', ''),
                  map: sourceMapSources[source]
                };
              }
            });

            async function createRequire(loader, url, deps, resolves) {
              const mapImportSpecifierToUrl = async specifier => {
                const resolvedUrl = await loader.resolve(specifier, url);
                await loader.import(specifier, url);
                return [specifier, resolvedUrl, true];
              };

              const mapResolveSpecifierToUrl = async specifier => {
                const resolvedUrl = await loader.resolve(specifier, url);
                return [specifier, resolvedUrl, false];
              };

              const importSpecifierMapEntries = await Promise.all(deps.map(mapImportSpecifierToUrl));
              const resolveSpecifierMapEntries = await Promise.all(resolves.map(mapResolveSpecifierToUrl));
              const specifierMapEntries = [...importSpecifierMapEntries, ...resolveSpecifierMapEntries];
              const specifierMap = specifierMapEntries.reduce((acc, [specifier, resolvedUrl, required]) => {
                const _ref = acc[specifier] || [],
                      _ref$ = _ref[1],
                      origRequired = _ref$ === void 0 ? false : _ref$;

                acc[specifier] = [resolvedUrl, origRequired || required];
                return acc;
              }, {});

              function require(specifier) {
                const _specifierMap$specifi = specifierMap[specifier],
                      resolvedUrl = _specifierMap$specifi[0],
                      required = _specifierMap$specifi[1];

                if (!required) {
                  throw new Error(`Cannot require dynamic module '${specifier}'`);
                }

                return loader.get(resolvedUrl).default;
              }

              require.resolve = function resolve(specifier) {
                const _specifierMap$specifi2 = specifierMap[specifier],
                      resolvedUrl = _specifierMap$specifi2[0];
                return resolvedUrl;
              };

              return require;
            }

            function createModule(require, url) {
              return {
                children: [],
                exports: Object.create(null),
                filename: url.href,
                id: url.href,
                loaded: false,
                parent: null,
                paths: [],
                require
              };
            }

            function postExecute(updateExport, module) {
              const exports = module.exports;

              if ((typeof exports === 'object' || typeof exports === 'function') && !('__esModule' in exports)) {
                Object.defineProperty(module.exports, '__esModule', {
                  value: true
                });
              }

              updateExport('default', module.exports);
              module.loaded = true;
            }

            function babelTransform(source, options) {
              return new Promise(function (resolve, reject) {
                babel.transform(source, options, function (err, result) {
                  if (err) {
                    reject(err);
                  } else {
                    resolve(result);
                  }
                });
              });
            }

            function getSourceUrl(url) {
              return new URL(url).href;
            }

            const systemPrototype = System.constructor.prototype;
            global$1.System = new System.constructor();
            const superTransform = systemPrototype.transform;

            systemPrototype.transform = async function transform(context, url, source) {
              if (context.format !== 'cjs') {
                return superTransform.call(this, context, url, source);
              }

              const _context$cjsDeps = context.cjsDeps = {
                resolves: [],
                deps: []
              },
                    resolves = _context$cjsDeps.resolves,
                    deps = _context$cjsDeps.deps;

              const sourceUrl = getSourceUrl(url);
              const sourceMapSupportKey = context.sourceMapSupportKey = `${sourceUrl}!transpiled`;
              const options = {
                babelrc: false,
                compact: false,
                configFile: false,
                filename: sourceMapSupportKey,
                sourceFileName: `${sourceUrl}`,
                moduleIds: false,
                parserOpts: {
                  allowReturnOutsideFunction: true
                },
                sourceMaps: true,
                sourceType: 'module',
                plugins: [[plugin, {
                  deps,
                  resolves
                }], dynamicImportPlugin, esRegisterFormatPlugin]
              };
              const output = await babelTransform(source, options);
              output.map.sources = output.map.sources.map(getSourceUrl);
              sourceMapSources[sourceMapSupportKey] = output.map;
              return output.code;
            };

            const superEvaluate = systemPrototype.evaluate;

            systemPrototype.evaluate = async function evaluate(context, url, source) {
              if (context.format !== 'cjs') {
                return superEvaluate.call(this, context, url, source);
              }

              const sourceMapSupportKey = context.sourceMapSupportKey,
                    _context$cjsDeps2 = context.cjsDeps,
                    deps = _context$cjsDeps2.deps,
                    resolves = _context$cjsDeps2.resolves;

              const _require = await createRequire(this, url, deps, resolves);

              const _module = createModule(_require, url);

              const moduleVars = {
                System: this,
                SystemJS: this,
                exports: _module.exports,
                require: _require,
                module: _module,
                __filename: basename$1(url),
                __dirname: dirname$1(url)
              };
              compileScript(sourceMapSupportKey, source, moduleVars); // Get the registration and modify the 'dependendencies' array to include
              // found require() & require.resolve() calls. Also wrap 'definition' and
              // 'execute' functions to get a reference to the export setter function
              // and get notified when the script actually executes so we can get the
              // default export. Since 'getRegister' removes the registration, we must
              // call 'register' again with the modified values for it to be picked up in
              // the next step.

              const _this$getRegister = this.getRegister(),
                    dependencies = _this$getRegister[0],
                    definition = _this$getRegister[1];

              function wrappedDefinition(_export, _context) {
                const _definition = definition(_export, _context),
                      setters = _definition.setters,
                      execute = _definition.execute;

                function wrappedExecute() {
                  execute.call(_module.exports);
                  postExecute(_export, _module);
                }

                return {
                  setters,
                  execute: wrappedExecute
                };
              }

              const registration = [[...dependencies, ...deps], wrappedDefinition];
              return registration;
            };

}(babel, SourceMapSupport));
//# sourceMappingURL=cjs.js.map
