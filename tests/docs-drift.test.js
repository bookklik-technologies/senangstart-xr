/**
 * Docs-drift test: every documented property in the documentation component
 * tables must exist in the schema (via the primitive mappings) with the
 * documented default value, and every overview-table primitive must be
 * registered.
 *
 * This prevents the docs/code drift class of bugs (audit findings D1/D2 and
 * the per-component default mismatches) from recurring.
 *
 * The canonical component reference now lives in the VitePress site under
 * docs/components/: the overview table is in docs/components/index.md and each
 * per-component property table is in its own page. This test reads those pages
 * instead of the README.
 */
const fs = require('fs');
const path = require('path');

const COMPONENTS_DIR = path.join(__dirname, '..', 'docs', 'components');
const OVERVIEW_PATH = path.join(COMPONENTS_DIR, 'index.md');

function readDocPages() {
  return fs
    .readdirSync(COMPONENTS_DIR)
    .filter((file) => file.endsWith('.md'))
    .map((file) => ({
      file,
      text: fs.readFileSync(path.join(COMPONENTS_DIR, file), 'utf8')
    }));
}

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

describe('docs ↔ schema consistency', () => {
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
    const overview = fs.readFileSync(OVERVIEW_PATH, 'utf8');
    const rows = overview.split('\n')
      .map((line) => line.split('|').map((cell) => cell.trim()))
      .filter((cells) => cells.length >= 4 && /^sxr-/.test(cells[1]));

    expect(rows.length).toBeGreaterThanOrEqual(15);

    const problems = [];
    rows.forEach((cells) => {
      const componentName = cells[1];
      // "<none>" is written as a code span in the docs so Vue does not parse it
      // as an HTML tag; strip the backticks before comparing.
      const primitiveName = cells[2].replace(/`/g, '');
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
    // Each component page carries a "### a-sxr-<name> Component" heading
    // followed by a "#### Properties" table in the same shape as before.
    // The section runs until the next markdown heading or the end of the page.
    // NOTE: use the absolute-end anchor Z rather than $, which under the /m
    // flag would match at every line end and truncate sections before their
    // tables (making the test pass vacuously).
    const sectionPattern = /^### (a-sxr-[a-z-]+) Component\r?\n([\s\S]*?)(?=\n#{1,6} |Z)/gm;

    const problems = [];
    let sectionsFound = 0;
    readDocPages().forEach(({ file, text }) => {
      let match;
      sectionPattern.lastIndex = 0;
      while ((match = sectionPattern.exec(text)) !== null) {
        sectionsFound += 1;
        const headingPrimitive = match[1];
        const sectionText = match[2];

        const componentKey = findComponentKey(headingPrimitive);
        if (!componentKey) {
          problems.push(`${file}: "${headingPrimitive}": no registered component matches this heading`);
          continue;
        }
        const primitiveName = findPrimitiveFor(componentKey);
        if (!primitiveName) {
          problems.push(`${file}: "${headingPrimitive}": no primitive registers "${componentKey}"`);
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
              `${file}: "${headingPrimitive}": property "${propertyName}" is documented but has no primitive mapping`
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
              `${file}: "${headingPrimitive}": "${propertyName}" maps to "${mapping}" but "${targetProperty}" ` +
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
              `${file}: "${headingPrimitive}": "${propertyName}" default documented as "${expected}" ` +
              `but schema says "${actual}" (${mapping})`
            );
          }
        });
      }
    });

    // Guard against the pattern silently matching nothing after a refactor.
    expect(sectionsFound).toBeGreaterThanOrEqual(14);

    expect(problems).toEqual([]);
  });
});
