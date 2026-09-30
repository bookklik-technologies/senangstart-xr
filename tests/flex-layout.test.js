/**
 * Flex-container layout:
 * - row layout math (flexStart / center), null child guards
 * - item-padding is spacing BETWEEN children, not around the group
 * - relayout fires on child removal, layout-property changes, container
 *   resize, and a queued layout callback cannot outlive removal
 * - remove() clears the panel background
 */
const {
  createSXR, setupAFRAME, teardownAFRAME, createComponentInstance,
  stubCreateElement, makeEntity,
} = require('./helpers');

describe('flex-container layout', () => {
  let components;
  let createElementSpy;
  let observerCallback;

  const flexData = (overrides) => Object.assign({
    flexDirection: 'row',
    justifyContent: 'flexStart',
    alignItems: 'flexStart',
    itemPadding: 0.0,
    opacity: 0.0,
    isTopContainer: false,
    panelColor: '#202127',
    panelRounded: 0.05,
    styles: {
      fontFamily: 'f.ttf', fontColor: '#F1F5F9', borderColor: '#1B1B1F',
      backgroundColor: '#202127', hoverColor: '#0EA5E9',
      activeColor: '#2563EB', handleColor: '#F1F5F9',
    },
  }, overrides);

  const makeChild = (guiItem) => {
    const child = makeEntity();
    child.getAttribute = jest.fn((name) => (name === 'sxr-item' ? guiItem : null));
    return child;
  };

  beforeAll(() => {
    global.SXR = createSXR().SXR;
    ({components} = setupAFRAME(['sxr-flex-container']));
    require('../src/components/flex-container.js');
  });

  afterAll(() => {
    teardownAFRAME();
    delete global.SXR;
    delete global.MutationObserver;
  });

  beforeEach(() => {
    createElementSpy = stubCreateElement({mock: true});
    global.MutationObserver = class {
      constructor(cb) { observerCallback = cb; }
      observe() {}
      disconnect() {}
    };
  });

  afterEach(() => {
    createElementSpy.mockRestore();
  });

  const initFlex = (data, children) => {
    const sxr = createSXR();
    global.SXR = sxr.SXR;
    const {el, instance} = createComponentInstance(
      'sxr-flex-container', components['sxr-flex-container'], data,
      {
        getAttribute: jest.fn((name) => (name === 'sxr-item' ? {width: 4, height: 2} : null)),
        getChildEntities: jest.fn(() => children),
        parentNode: makeEntity(),
      }
    );
    instance.init();
    return {el, instance};
  };

  test('row + flexStart lays children left-to-right from the top', () => {
    const childA = makeChild({width: 1, height: 0.5, margin: {x: 0, y: 0, z: 0, w: 0}, type: 'label'});
    const childB = makeChild({width: 1, height: 0.5, margin: {x: 0, y: 0, z: 0, w: 0}, type: 'label'});

    initFlex(flexData(), [childA, childB]);

    expect(childA.attributes.position).toBe('-1.5 0.75 0.01');
    expect(childB.attributes.position).toBe('-0.5 0.75 0.01');
  });

  test('row + center centers the row', () => {
    const data = flexData();
    data.justifyContent = 'center';
    const childA = makeChild({width: 1, height: 0.5, margin: {x: 0, y: 0, z: 0, w: 0}, type: 'label'});
    const childB = makeChild({width: 1, height: 0.5, margin: {x: 0, y: 0, z: 0, w: 0}, type: 'label'});

    initFlex(data, [childA, childB]);

    // row width = 2, cursorX = (4 - 2)/2 = 1
    expect(childA.attributes.position).toBe('-0.5 0.75 0.01');
    expect(childB.attributes.position).toBe('0.5 0.75 0.01');
  });

  test('children without sxr-item are skipped without crashing', () => {
    const plain = makeEntity(); // no sxr-item (getAttribute returns null)
    const child = makeChild({width: 1, height: 0.5, margin: {x: 0, y: 0, z: 0, w: 0}, type: 'label'});

    expect(() => initFlex(flexData(), [plain, child])).not.toThrow();
    expect(child.attributes.position).toBe('-1.5 0.75 0.01');
  });

  test('item-padding is spacing between children, not around the group', () => {
    const data = flexData({itemPadding: 0.2});
    const childA = makeChild({width: 1, height: 0.5, margin: {x: 0, y: 0, z: 0, w: 0}, type: 'label'});
    const childB = makeChild({width: 1, height: 0.5, margin: {x: 0, y: 0, z: 0, w: 0}, type: 'label'});

    initFlex(data, [childA, childB]);

    expect(childA.attributes.position).toBe('-1.5 0.75 0.01');
    // childB shifts right by exactly the 0.2 inter-child spacing
    expect(childB.attributes.position).toBe(`${-2 + 1 + 0.2 + 0.5} 0.75 0.01`);
  });

  test('removing a child triggers a relayout of the remaining children', async () => {
    const data = flexData();
    const childA = makeChild({width: 1, height: 0.5, margin: {x: 0, y: 0, z: 0, w: 0}, type: 'label'});
    const childB = makeChild({width: 1, height: 0.5, margin: {x: 0, y: 0, z: 0, w: 0}, type: 'label'});
    const children = [childA, childB];
    const {el} = initFlex(data, children);

    // drop the first child from the container
    children.splice(0, 1);
    observerCallback([
      {addedNodes: [], removedNodes: [childA], target: el},
    ]);
    await new Promise((resolve) => setTimeout(resolve, 5));

    // childB now sits at the head of the row
    expect(childB.attributes.position).toBe('-1.5 0.75 0.01');
  });

  test('layout property changes relayout immediately', () => {
    const data = flexData();
    const childA = makeChild({width: 1, height: 0.5, margin: {x: 0, y: 0, z: 0, w: 0}, type: 'label'});
    const childB = makeChild({width: 1, height: 0.5, margin: {x: 0, y: 0, z: 0, w: 0}, type: 'label'});
    const {instance} = initFlex(data, [childA, childB]);

    // emulated setAttribute flow: data changes then update(oldData) runs
    const oldData = {...data};
    data.justifyContent = 'center';
    instance.update(oldData);

    // row width 2 -> cursorX = (4 - 2)/2 = 1
    expect(childA.attributes.position).toBe('-0.5 0.75 0.01');
    expect(childB.attributes.position).toBe('0.5 0.75 0.01');
  });

  test('container resizing forces layout and a queued callback cannot outlive removal', async () => {
    const child = makeChild({width: 1, height: 0.5, margin: {x: 0, y: 0, z: 0, w: 0}, type: 'label'});
    const {el, instance} = initFlex(flexData(), [child]);
    el.getAttribute.mockImplementation((name) => (name === 'sxr-item' ? {width: 4, height: 4} : null));
    el.emit('componentchanged', {name: 'sxr-item'});
    await new Promise((resolve) => setTimeout(resolve, 5));
    expect(child.attributes.position).toBe('-1.5 1.75 0.01');
    const layout = jest.spyOn(instance, 'layout');
    instance._scheduleLayout([], true);
    instance.remove();
    await new Promise((resolve) => setTimeout(resolve, 5));
    expect(layout).not.toHaveBeenCalled();
  });

  test('remove() clears the panel background', () => {
    const data = flexData();
    data.isTopContainer = true;
    data.opacity = 0.7;
    const parent = makeEntity();
    const sxr = createSXR();
    global.SXR = sxr.SXR;
    const {instance} = createComponentInstance(
      'sxr-flex-container', components['sxr-flex-container'], data,
      {
        getAttribute: jest.fn((name) => {
          if (name === 'sxr-item') return {width: 4, height: 2};
          if (name === 'position') return {x: 0, y: 0, z: 0};
          if (name === 'rotation') return {x: 0, y: 0, z: 0};
          return null;
        }),
        getChildEntities: jest.fn(() => []),
        parentNode: parent,
      }
    );
    instance.init();
    const panel = instance.panelBackground;
    expect(panel).toBeDefined();
    expect(parent.children).toContain(panel);

    instance.remove();
    expect(sxr.removedEntities).toContain(panel);
    expect(instance.panelBackground).toBeNull();
  });
});
