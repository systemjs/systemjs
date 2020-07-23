const externalModule = 'fixtures/esm.js';
const IMPORT_MAP_TYPE = 'systemjs-importmap';

const appendImportMap = ({ moduleId, src }) => {
  const script = document.createElement('script');
  script.type = IMPORT_MAP_TYPE;

  if (src) {
    script.async = true; // avoid theoretical timing issues
    script.src = src;
  }

  if (moduleId) {
    script.textContent = JSON.stringify({ imports: { [moduleId]: externalModule } });
  }

  container.append(script);
  return script;
};

const editImportMap = ({ needleModuleId, needleSrc, newModuleId, newSrc }) => {
  const importMapType = `script[type="${IMPORT_MAP_TYPE}"]`;
  if (needleModuleId && newModuleId) {
    [...document.querySelectorAll(importMapType)]
      .filter(element => element.textContent.includes(needleModuleId))
      .forEach(element => element.textContent = element.textContent.replace(needleModuleId, newModuleId));
  } else if (needleSrc && newSrc) {
    document.querySelector(`${importMapType}[src="${needleSrc}"]`).src = newSrc;
  } else {
    throw new Error('Incorrect configuration');
  }
};

const importAfterImportMap = id => new Promise(resolve => setTimeout(resolve, 10)).then(() => {
  return System.import(id);
});

const importNonExistent = id => System.import(id)
  .catch(error => error)
  .then(result => {
    if (!(result instanceof Error)) {
      throw new Error(`Unexpected mapping found for module "${id}"`);
    }
  });

let container;

suite('Dynamic import maps', () => {
  suiteSetup(() => System.import('../../dist/extras/dynamic-import-maps.js'));

  setup(() => {
    container = document.createElement('div');
    container.id = 'importmap-container';
    document.body.append(container);
  });

  teardown(() => container.remove());

  test('Loading newly added elements (inline)', async () => {
    const moduleId = 'dynamic-inline-map-1';
    await importNonExistent(moduleId);
    appendImportMap({ moduleId });
    return importAfterImportMap(moduleId);
  });

  test('Loading newly added elements (external)', async () => {
    const moduleId = 'dynamic-external-map-1';
    await importNonExistent(moduleId);
    appendImportMap({ src: 'fixtures/browser/dynamic-importmap1.json' });
    return importAfterImportMap(moduleId);
  });
});
