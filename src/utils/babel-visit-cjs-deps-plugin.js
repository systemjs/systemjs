/*
 Forked from https://github.com/jspm/babel-visit-cjs-deps and slightly modified
 to be compatible with Babel 7 packages as a regular plugins. Make sure this is the
 first plugin to ensure it processes the original code.
 */

import t from '@babel/types';

// given a string literal expression
// partially resolve the leading part if a string literal
function partialResolve (expr, state) {
  let resolveModule;
  if (t.isStringLiteral(expr))
    resolveModule = expr.value;
  else if (t.isTemplateLiteral(expr))
    resolveModule = expr.quasis[0].value.cooked;
  else if (t.isBinaryExpression(expr) && expr.operator === '+' && t.isStringLiteral(expr.left))
    resolveModule = expr.left.value;
  if (resolveModule && state.resolves.includes(resolveModule) === false)
    state.resolves.push(resolveModule);
}

function addDependency (depModuleArg, state) {
  let depModule;
  if (t.isStringLiteral(depModuleArg)) {
    depModule = depModuleArg.value;
  }
  else if (t.isTemplateLiteral(depModuleArg)) {
    if (depModuleArg.expressions.length !== 0)
      return;
    depModule = depModuleArg.quasis[0].value.cooked;
  }
  else {
    // no support for dynamic require currently
    // just becomes a "null" module
    return;
  }
  if (state.deps.includes(depModule) === false)
    state.deps.push(depModule);
}

export default function plugin(types, state) {
  let hasProcess = false;
  let hasBuffer = false;

  return {
    visitor: {
      Program: {
        enter(path) {
          if (!state.deps)
            throw new Error('opts.deps must be set for the babel-visit-cjs-deps Babel plugin.');
          if (!state.resolves)
            state.resolves = [];
        },
        exit(path) {
          if (hasProcess && !state.deps.includes('process'))
            state.deps.push('process');
          if (hasBuffer && !state.deps.includes('buffer'))
            state.deps.push('buffer');
        }
      },

      /*
       * require()
       */
      CallExpression(path) {
        if (t.isIdentifier(path.node.callee, { name: 'require' }))
          addDependency(path.node.arguments[0], state);
      },

      /*
       * require.resolve()
       */
      MemberExpression(path) {
        try {
          if (t.isIdentifier(path.node.object, { name: 'require' }) && !path.scope.hasBinding('require')) {
            let name = path.node.computed ? path.node.property.value : path.node.property.name;
            if (name === 'resolve') {
              if (t.isCallExpression(path.parent) && path.parent.callee === path.node &&
                path.parent.arguments.length === 1) {
                const resolveArgPath = path.parentPath.get('arguments.0');
                partialResolve(resolveArgPath.node, state);
              }
            }
          }
        } catch (err) {
          console.log({ path });
          throw err;
        }
      },

      /*
       * module.require()
       */
      ReferencedIdentifier(path) {
        const identifierName = path.node.name;

        if (!hasProcess && identifierName === 'process' && !path.scope.hasBinding('process'))
          hasProcess = true;
        if (!hasBuffer && identifierName === 'Buffer' && !path.scope.hasBinding('Buffer'))
          hasBuffer = true;

        if (identifierName === 'module' && !path.scope.hasBinding('module')) {
          const parentPath = path.parentPath;
          const parentNode = path.parentPath.node;
          if (t.isMemberExpression(parentNode) && parentNode.object === path.node) {
            const name = parentNode.computed ? parentNode.property.value : parentNode.property.name;
            if (name === 'require' && t.isCallExpression(parentPath.parent) && parentPath.parent.callee === parentPath.node)
              addDependency(parentPath.parent.arguments[0], state);
          }
        }
      },
    }
  };
}
