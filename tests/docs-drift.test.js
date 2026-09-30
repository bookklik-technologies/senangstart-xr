/**
 * Docs-drift test: every documented property in the README component tables
 * must exist in the schema (via the primitive mappings) with the documented
 * default value, and every overview-table primitive must be registered.
 *
 * This prevents the README/code drift class of bugs (audit findings D1/D2 and
 * the per-component default mismatches) from recurring.
 */
const fs = require('fs');
const path = require('path');

const README_PATH = path.join(__dirname, '..', 'README.md');

function normalizeActual(defaultValue) {
  if (defaultValue === undefined || defaultValue === null) { return ''; }
  if (typeof defaultValue === 'number') { return String(defaultValue); }
  if (typeof defaultValue === 'boolean') { return defaultValue ? 'true' : 'false'; }
  if (typeof defaultValue === 'object') {
    return [defaultValue.x, defaultValue.y, defaultValue.z, defaultValue.w].join(' ');
  }
  return String(defaultValue);
}

function normalizeReadme(cell) {
  let value = cell.trim().replace(/^'(.*)'$/, '$1');
  if (value === '') { return ''; }
  if (/^-?\d+(\.\d+)?$/.test(value)) { return String(parseFloat(value)); }
  return value;
}

describe('README ↔ schema consistency', () => {
  const registry = {};
  const primitives = {};

  beforeAll(() => {
    global.AFRAME = {
      get THREE() { return global.THREE; },
      registerComponent: (name, definition) => { registry[name] = definition; },
      registerPrimitive: (name, definition) => { primitives[name] = definition; },
      components: {},
      utils: {entity: {setComponentProperty: () => {}}},
    };
    require('../src/scripts/vars.js');
    if (!global.SXR && global.window && global.window.SXR) {
      global.SXR = global.window.SXR;
    }
    require('../src/index.js');
  });

  afterAll(() => {
    delete global.AFRAME;
  });

  const findComponentKey = (headingName) => {
    const normalized = headingName.replace(/^a-/, '').replace(/-/g, '');
    return Object.keys(registry).find((key) => key.replace(/-/g, '') === normalized);
  };

  const findPrimitiveFor = (componentKey) =>
    Object.keys(primitives).find((name) => {
      const def = primitives[name];
      return def.defaultComponents && Object.keys(def.defaultComponents).includes(componentKey);
    });

  test('every overview-table entry registers its documented primitive', () => {
    const readme = fs.readFileSync(README_PATH, 'utf8');
    const rows = readme.split('\n')
      .map((line) => line.split('|').map((cell) => cell.trim()))
      .filter((cells) => cells.length >= 4 && /^sxr-/.test(cells[1]));

    expect(rows.length).toBeGreaterThanOrEqual(15);

    const problems = [];
    rows.forEach((cells) => {
      const componentName = cells[1];
      const primitiveName = cells[2];
      if (primitiveName === '<none>') { return; }

      const componentKey = findComponentKey(componentName);
      if (!componentKey) {
        problems.push(`overview row "${componentName}": no registered component matches`);
        return;
      }
      const primitive = primitives[primitiveName];
      if (!primitive) {
        problems.push(`overview row "${componentName}": primitive "${primitiveName}" is never registered`);
        return;
      }
      const primitiveKeys = Object.keys(primitive.defaultComponents || {});
      if (!primitiveKeys.includes(componentKey)) {
        problems.push(
          `overview row "${componentName}": primitive "${primitiveName}" does not include "${componentKey}" ` +
          `(has: ${primitiveKeys.join(', ')})`
        );
      }
    });

    expect(problems).toEqual([]);
  });

  test('every documented property exists in the schema with the documented default', () => {
    const readme = fs.readFileSync(README_PATH, 'utf8');
    const sectionPattern = /### (a-sxr-[a-z-]+) Component\n([\s\S]*?)(?=\n### |\n## |$)/g;

    const problems = [];
    let match;
    while ((match = sectionPattern.exec(readme)) !== null) {
      const headingPrimitive = match[1];
      const sectionText = match[2];

      const componentKey = findComponentKey(headingPrimitive);
      if (!componentKey) {
        problems.push(`${headingPrimitive}: no registered component matches this heading`);
        continue;
      }
      const primitiveName = findPrimitiveFor(componentKey);
      if (!primitiveName) {
        problems.push(`${headingPrimitive}: no primitive registers "${componentKey}"`);
        continue;
      }
      const mappings = primitives[primitiveName].mappings || {};

      const tableRows = sectionText.split('\n')
        .filter((line) => line.trim().startsWith('|'))
        .map((line) => line.split('|').map((cell) => cell.trim()))
        .filter((cells) => cells.length >= 4);

      tableRows.forEach((cells) => {
        const propertyName = cells[1];
        const documentedDefault = cells[3] || '';
        if (!propertyName || propertyName === 'Property' || /^-+$/.test(propertyName)) { return; }

        const mapping = mappings[propertyName];
        if (!mapping) {
          problems.push(
            `${headingPrimitive}: property "${propertyName}" is documented but has no primitive mapping`
          );
          return;
        }

        const dot = mapping.lastIndexOf('.');
        const targetComponentName = mapping.slice(0, dot);
        const targetProperty = mapping.slice(dot + 1);
        const targetComponent = registry[targetComponentName];
        if (!targetComponent) {
          // e.g. the A-Frame built-in "cursor" component — cannot verify here
          return;
        }
        const schemaEntry = targetComponent.schema && targetComponent.schema[targetProperty];
        if (!schemaEntry) {
          problems.push(
            `${headingPrimitive}: "${propertyName}" maps to "${mapping}" but "${targetProperty}" ` +
            `is not in the ${targetComponentName} schema`
          );
          return;
        }

        const actual = normalizeActual(schemaEntry.default);
        const expected = normalizeReadme(documentedDefault);
        const bothNumeric = /^-?\d+(\.\d+)?$/.test(actual) && /^-?\d+(\.\d+)?$/.test(expected);
        const matches = bothNumeric
          ? parseFloat(actual) === parseFloat(expected)
          : actual === expected;
        if (!matches) {
          problems.push(
            `${headingPrimitive}: "${propertyName}" default documented as "${expected}" ` +
            `but schema says "${actual}" (${mapping})`
          );
        }
      });
    }

    expect(problems).toEqual([]);
  });
});
