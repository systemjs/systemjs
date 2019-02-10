import stripShebang from 'strip-shebang';


function unzipModuleVars(moduleVars = {}) {
  return Object.entries(moduleVars)
    .reduce(({ params, args }, [key, value]) => ({
      params: [...params, key],
      args: [...args, value],
    }), { params: [], args: [] });
}


export function compileScript(sourceUrl, source, moduleVars) {
  const { params, args } = unzipModuleVars(moduleVars);

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
