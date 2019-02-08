import vm from 'vm';
import stripShebang from 'strip-shebang';

const isNode = typeof self === 'undefined';


function unzipModuleVars(moduleVars = {}) {
  return Object.entries(moduleVars)
    .reduce(({ params, args }, [key, value]) => ({
      params: [...params, key],
      args: [...args, value],
    }), { params: [], args: [] });
}


export function compileScriptBrowser(sourceUrl, source, moduleVars) {
  const { params, args } = unzipModuleVars(moduleVars);

  const wrappee = stripShebang(source);
  const wrapper_sourceUrl = sourceUrl ? `\n//# sourceURL=${sourceUrl}` : '';

  const wrapped = `${wrappee}${wrapper_sourceUrl}`;

  Function(...params, wrapped)(...args);
}


export function compileScriptNode(sourceUrl, source, moduleVars) {
  const { params, args } = unzipModuleVars(moduleVars);

  const wrapper_before = `(function(${params.join(', ')}){`;
  const wrappee = stripShebang(source);
  const wrapper_after = '\n})';
  const wrapper_sourceUrl = sourceUrl ? `\n//# sourceURL=${sourceUrl}` : '';

  const wrapped = `${wrapper_before}${wrappee}${wrapper_after}${wrapper_sourceUrl}`;

  const runOptions = {
    displayErrors: true,
    filename: `${sourceUrl}`,
    lineOffset: 0,
  };

  vm.runInThisContext(wrapped, runOptions)(...args);
}

export const compileScript = isNode ? compileScriptNode : compileScriptBrowser;
