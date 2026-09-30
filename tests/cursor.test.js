/**
 * sxr-cursor:
 * - each design builds its decorative child entities
 * - fuse mode adds a fuse loader
 * - mouseenter/mouseleave fan the hover/leave events out to the children
 * - remove() detaches listeners and removes every component-owned child
 */
const {
  createSXR, setupAFRAME, teardownAFRAME, createComponentInstance,
  stubCreateElement,
} = require('./helpers');

describe('sxr-cursor', () => {
  let components;
  let createElementSpy;
  let removedEntities;

  beforeAll(() => {
    const sxr = createSXR();
    removedEntities = sxr.removedEntities;
    global.SXR = sxr.SXR;
    ({components} = setupAFRAME(['sxr-cursor']));
    require('../src/components/cursor.js');
  });

  afterAll(() => {
    teardownAFRAME();
    delete global.SXR;
  });

  beforeEach(() => {
    removedEntities.length = 0;
    createElementSpy = stubCreateElement({mock: true});
  });

  afterEach(() => {
    createElementSpy.mockRestore();
  });

  const initCursor = (design, fuse) => {
    const {el, instance, listeners} = createComponentInstance(
      'sxr-cursor', components['sxr-cursor'],
      {color: '#F1F5F9', hoverColor: '#0EA5E9', activeColor: '#2563EB', distance: -1, design},
      {
        getAttribute: jest.fn((name) => {
          if (name === 'cursor') return {fuse: fuse === true, fuseTimeout: 1500};
          return null;
        }),
      }
    );
    instance.init();
    return {el, instance, listeners};
  };

  test('dot design builds a shadow child and cursor geometry', () => {
    const {el, instance} = initCursor('dot', false);

    expect(el.attributes.geometry).toContain('primitive: ring');
    expect(instance.cursorShadow).toBeDefined();
    expect(el.children).toContain(instance.cursorShadow);

    instance.remove();
  });

  test('fuse mode adds a fuse loader child', () => {
    const {instance} = initCursor('dot', true);

    expect(instance.fuseLoader).toBeDefined();
    expect(instance.fuseLoader.attributes.animation).toContain('autoplay:false');

    instance.remove();
  });

  test('mouseenter fans hovergui out to the design children', () => {
    const {instance, listeners} = initCursor('dot', false);
    const hoverEvents = [];
    instance.cursorShadow.addEventListener('hovergui', () => hoverEvents.push('shadow'));

    listeners.mouseenter[0]();

    expect(hoverEvents).toEqual(['shadow']);

    instance.remove();
  });

  test('remove() detaches listeners and removes owned children', () => {
    const {el, listeners} = initCursor('dot', true);
    expect(listeners.mouseenter).toHaveLength(1);
    expect(listeners.mouseleave).toHaveLength(1);

    const shadow = el.children[0];
    const fuseLoader = el.children[1];
    el.removeEventListener('stateremoved', () => {});
    const instance = el.components['sxr-cursor'];

    instance.remove();

    expect(listeners.mouseenter).toHaveLength(0);
    expect(listeners.mouseleave).toHaveLength(0);
    expect(removedEntities).toContain(shadow);
    expect(removedEntities).toContain(fuseLoader);
    expect(instance.cursorShadow).toBeNull();
    expect(instance.fuseLoader).toBeNull();
  });
});
