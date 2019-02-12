import vm from 'vm';
import stripShebang from 'strip-shebang';

import { isNode } from '../common';


function unzipModuleVars(moduleVars = {}) {
  return Object.entries(moduleVars).reduce(({ params, args }, [key, value]) => ({
    params: [...params, key],
    args: [...args, value],
  }), { params: [], args: [] });
}


function wrapScript(sourceUrl, source, moduleVars) {
  const { params, args } = unzipModuleVars(moduleVars);

  const wrapped_before = `(function(${params.join(',')}){`;
  const wrappee = stripShebang(source);
  const wrapper_sourceUrl = sourceUrl ? `\n//# sourceURL=${sourceUrl}` : '';
  const wrapped_after = '})';

  return `${wrapped_before}${wrappee}${wrapped_after}${wrapper_sourceUrl}`;
}


export function compileScriptBrowser(sourceUrl, source, moduleVars) {
  const { args } = unzipModuleVars(moduleVars);
  const wrapped = wrapScript(sourceUrl, source, moduleVars);

  (0, eval)(wrapped)(...args);
}


export function compileScriptNode(sourceUrl, source, moduleVars) {
  const { args } = unzipModuleVars(moduleVars);
  const wrapped = wrapScript(sourceUrl, source, moduleVars);

  const runOptions = {
    displayErrors: true,
    filename: `${sourceUrl}`,
    lineOffset: 0,
  };

  vm.runInThisContext(wrapped, runOptions)(...args);
}


export function compileScript(sourceUrl, source, moduleVars) {
  return (isNode? compileScriptNode : compileScriptBrowser)(sourceUrl, source, moduleVars);
}
