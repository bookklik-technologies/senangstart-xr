/**
 * Shared test infrastructure for the SenangStart XR suite.
 *
 * Conventions every migrated suite follows:
 * - `createSXR(overrides)` builds THE SXR test double; never hand-roll one.
 *   It records created/removed entities in the returned tracking arrays.
 * - `makeEntity()` is the canonical entity mock: it keeps a listener
 *   registry, tracks parent/child links, and supports hasAttribute.
 * - `createComponentInstance()` emulates the A-Frame setAttribute -> data ->
 *   update(oldData) cycle. IMPORTANT: `el.emit(name, detail)` wraps the
 *   second argument as `{detail}` (A-Frame event object semantics), so a
 *   listener checking `evt.detail.x` must be fed `el.emit(name, {x: 1})`.
 * - `setupAFRAME(names)` installs the global AFRAME capture double; pair it
 *   with `teardownAFRAME()` in afterAll.
 * - `stubCreateElement()` swaps document.createElement for entity mocks in
 *   one place; never hand-roll the spy (it is recursion-prone).
 */
// Captured at module load, BEFORE any test installs a createElement spy
// (binding lazily would capture the spy itself and recurse forever).
const _realCreateElement = (typeof document !== 'undefined' && document.createElement)
  ? document.createElement.bind(document)
  : null;
function realCreateElement(tag, opts) {
  if (!_realCreateElement) {
    throw new Error('realCreateElement requires a DOM (jsdom environment)');
  }
  return _realCreateElement(tag, opts);
}

// ---- entity mock ---------------------------------------------------------

function makeEntity() {
  const entity = {
    attributes: {},
    children: [],
    components: {},
    object3Ds: {},
    listeners: {},
    hasLoaded: false,
    parentNode: null,
    setAttribute(name, value, propertyValue) {
      this.attributes[name] = propertyValue === undefined ? value : propertyValue;
    },
    getAttribute() {
      return null;
    },
    removeAttribute(name) {
      delete this.attributes[name];
    },
    hasAttribute(name) {
      return Object.prototype.hasOwnProperty.call(this.attributes, name);
    },
    appendChild(child) {
      this.children.push(child);
      child.parentNode = this;
      return child;
    },
    removeChild(child) {
      const index = this.children.indexOf(child);
      if (index !== -1) { this.children.splice(index, 1); }
      if (child) { child.parentNode = null; }
      return child;
    },
    insertBefore(child) {
      this.children.push(child);
      child.parentNode = this;
      return child;
    },
    addEventListener(name, handler) {
      (entity.listeners[name] = entity.listeners[name] || []).push(handler);
    },
    removeEventListener(name, handler) {
      const registered = entity.listeners[name] || [];
      const index = registered.indexOf(handler);
      if (index !== -1) { registered.splice(index, 1); }
    },
    emit(name, detail) {
      (entity.listeners[name] || []).slice().forEach(function (handler) {
        handler({detail});
      });
    },
    focus() {},
    setObject3D(name, object3D) {
      this.object3Ds[name] = object3D;
    },
    getObject3D(name) {
      return this.object3Ds[name] || null;
    },
    removeObject3D(name) {
      delete this.object3Ds[name];
    },
  };
  return entity;
}

// ---- component instance factory ------------------------------------------

/**
 * Creates a component instance wired to a mock entity that emulates the
 * A-Frame update cycle: setAttribute(componentName, prop, value) merges the
 * parsed value into `data` and invokes update(oldData).
 *
 * `overrides` are assigned onto the entity before init runs (e.g.
 * getAttribute, object3D, getChildEntities).
 */
function createComponentInstance(name, componentDefinition, data, overrides) {
  const el = makeEntity();
  const instance = Object.assign({}, componentDefinition, {el, data});

  el.setAttribute = function (attr, a2, a3) {
    if (attr === name && a3 !== undefined) {
      el.attributes[attr] = a3;
      const oldData = Object.assign({}, data);
      data[a2] = a3 === 'true' ? true : a3 === 'false' ? false : a3;
      instance.update(oldData);
      return;
    }
    if (attr === name && a2 !== null && typeof a2 === 'object') {
      const oldData = Object.assign({}, data);
      Object.assign(data, a2);
      instance.update(oldData);
      return;
    }
    if (attr === name) {
      const oldData = Object.assign({}, data);
      Object.assign(data, {value: a2});
      instance.update(oldData);
      return;
    }
    el.attributes[attr] = a3 === undefined ? a2 : a3;
  };
  el.components[name] = instance;

  if (overrides) {
    Object.keys(overrides).forEach(function (key) {
      el[key] = overrides[key];
    });
  }

  return {el, instance, listeners: el.listeners, data};
}

// ---- SXR test double -------------------------------------------------------

const defaultSxrItem = () => ({
  type: '', width: 1, height: 1, baseDepth: 0.01, depth: 0.02, gap: 0.025,
  radius: 0, margin: {x: 0, y: 0, z: 0, w: 0},
  bevel: false, bevelSegments: 5, steps: 2, bevelSize: 0.1, bevelOffset: 0,
  bevelThickness: 0.1,
});

/**
 * Canonical SXR double. Tracks created/removed entities so suites can assert
 * redraw-vs-recreate and teardown behavior without local counters.
 */
function createSXR(overrides) {
  const createdTextEntities = [];
  const createdIconEntities = [];
  const removedEntities = [];

  const sxr = Object.assign({
    colors: {
      primary: '#2563EB',
      secondary: '#0EA5E9',
      background: '#161618',
      surface: '#202127',
      onSurface: '#F1F5F9',
      border: '#1B1B1F',
      neutral: '#1B1B1F',
    },
    fonts: {default: 'Outfit-Regular.ttf', registered: {}, pending: {}, redrawQueue: {}},
    icons: {},
    normalizeFontSize: (value, fallback = 0.2) => {
      const parsed = typeof value === 'number' ? value : parseFloat(value);
      return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
    },
    getActionFunction: (name) => {
      const fn = window[name];
      return (name && typeof fn === 'function') ? fn : null;
    },
    getValidColor: (color, fallback = '#F1F5F9') => color || fallback,
    redrawTextEntity: () => false,
    redrawIconEntity: () => false,
    createTextEntity: (options) => {
      const entity = makeEntity();
      createdTextEntities.push(options);
      return entity;
    },
    createIconEntity: (options) => {
      const entity = makeEntity();
      createdIconEntities.push(options);
      return entity;
    },
    removeEntity: (entity) => {
      if (!entity) { return; }
      removedEntities.push(entity);
      if (entity.parentNode) { entity.parentNode.removeChild(entity); }
    },
    getItem: (el) => {
      const item = el && el.getAttribute ? el.getAttribute('sxr-item') : null;
      if (item && item.width !== undefined && item.height !== undefined) { return item; }
      return defaultSxrItem();
    },
    watchGuiItem: (el, callback) => {
      const handler = (evt) => {
        if (!evt || !evt.detail || evt.detail.name !== 'sxr-item') { return; }
        callback(evt.detail.newData || (el && el.getAttribute ? el.getAttribute('sxr-item') : null));
      };
      el.addEventListener('componentchanged', handler);
      return handler;
    },
    keyboard: {
      isEditableTarget: (target) => {
        if (!target) { return false; }
        const tag = (target.tagName || '').toLowerCase();
        return tag === 'input' || tag === 'textarea' || tag === 'select' ||
          target.isContentEditable === true;
      },
      isActivationPress: (event) => {
        if (!event || event.repeat || event.isComposing || event.keyCode === 229) { return false; }
        return event.key === 'Enter' || event.key === ' ' || event.key === 'Spacebar';
      },
      isActivationKey: (key) => key === 'Enter' || key === ' ' || key === 'Spacebar',
      isArrowKey: (key) => key === 'ArrowUp' || key === 'ArrowDown' ||
        key === 'ArrowLeft' || key === 'ArrowRight',
    },
  }, overrides || {});

  return {SXR: sxr, createdTextEntities, createdIconEntities, removedEntities};
}

// ---- AFRAME capture double -------------------------------------------------

/**
 * Installs global.AFRAME capturing registered components (and primitives)
 * into plain maps returned to the caller. Pass an explicit list of names to
 * capture only those components; pass nothing to capture all.
 */
function setupAFRAME(componentNames) {
  const components = {};
  const primitives = {};
  const wants = (name) => !componentNames || componentNames.includes(name);
  global.AFRAME = {
    // sources use AFRAME.THREE; resolve lazily so suites can assign
    // global.THREE before or after setupAFRAME()
    get THREE() { return global.THREE; },
    registerComponent: jest.fn((name, definition) => {
      if (wants(name)) { components[name] = definition; }
    }),
    registerPrimitive: jest.fn((name, definition) => {
      primitives[name] = definition;
    }),
    components: {},
    utils: {entity: {setComponentProperty: jest.fn()}},
  };
  return {components, primitives};
}

function teardownAFRAME() {
  delete global.AFRAME;
}

// ---- createElement spy -------------------------------------------------------

/**
 * Swaps document.createElement for the duration of a test.
 * - `mock: true` returns makeEntity() for every tag except those in `real`.
 * - `enhance: ['a-entity']` returns real DOM elements but attaches
 *   setObject3D/removeAttribute stubs to the listed tags (canvas contexts
 *   from jest-canvas-mock keep working).
 */
function stubCreateElement(options = {}) {
  const realTags = options.real || [];
  const enhanceTags = options.enhance || [];
  return jest.spyOn(document, 'createElement').mockImplementation((tag, opts) => {
    if (options.mock && !realTags.includes(tag)) { return makeEntity(); }
    const element = realCreateElement(tag, opts);
    if (enhanceTags.includes(tag)) {
      element.setObject3D = jest.fn();
      element.removeAttribute = () => {};
    }
    return element;
  });
}

// ---- keyboard + font harnesses -----------------------------------------------

function fireKeyDown(key, keyCode, extra) {
  const event = new window.Event('keydown');
  event.key = key;
  event.keyCode = keyCode;
  if (extra) { Object.assign(event, extra); }
  window.dispatchEvent(event);
}

/**
 * Installs a FontFace double whose loads are manually resolved/rejected via
 * `harness.resolveLoad.resolve({})` / `.reject(err)`. `harness.loadSpy`
 * counts load() calls (shared pending loads call it once).
 */
function createFontHarness() {
  const state = {loadSpy: null, resolveLoad: null, faces: []};
  state.loadSpy = jest.fn(() => new Promise((resolve, reject) => {
    state.resolveLoad = {resolve, reject};
  }));
  global.FontFace = jest.fn(function (family, source) {
    this.family = family;
    this.source = source;
    this.load = state.loadSpy;
    state.faces.push(this);
  });
  global.document.fonts = {add: jest.fn()};
  return state;
}

function removeFontHarness() {
  delete global.FontFace;
}

module.exports = {
  makeEntity,
  createComponentInstance,
  createSXR,
  setupAFRAME,
  teardownAFRAME,
  stubCreateElement,
  fireKeyDown,
  createFontHarness,
  removeFontHarness,
};
