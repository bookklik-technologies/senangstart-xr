/**
 * Live updates:
 * - activation event names (`on`) rebind without losing the handler
 * - sxr-item dimension changes (via `componentchanged`) rebuild the widget
 *   geometry: circle-loader ring + text, progress bar, label background,
 *   input borders — all follow the new dimensions in place
 */
const {
  createSXR, setupAFRAME, teardownAFRAME, createComponentInstance,
  stubCreateElement, makeEntity,
} = require('./helpers');

describe('live updates', () => {
  let components;
  let createElementSpy;
  let createdTextEntities;
  let removedEntities;

  beforeAll(() => {
    const sxr = createSXR({redrawTextEntity: () => false});
    createdTextEntities = sxr.createdTextEntities;
    removedEntities = sxr.removedEntities;
    global.SXR = sxr.SXR;
    global.THREE = {
      Vector3: class {
        constructor() { this.x = 0; this.y = 0; this.z = 0; }
        copy(v) { this.x = v.x; this.y = v.y; this.z = v.z; return this; }
      },
      Quaternion: class { set() {} },
    };
    ({components} = setupAFRAME([
      'sxr-button', 'sxr-circle-loader', 'sxr-progressbar', 'sxr-label', 'sxr-input',
    ]));
    require('../src/components/button.js');
    require('../src/components/circle-loader.js');
    require('../src/components/progress-bar.js');
    require('../src/components/label.js');
    require('../src/components/input.js');
  });

  afterAll(() => {
    teardownAFRAME();
    delete global.SXR;
    delete global.THREE;
  });

  beforeEach(() => {
    createdTextEntities.length = 0;
    removedEntities.length = 0;
    createElementSpy = stubCreateElement({mock: true});
  });

  afterEach(() => {
    createElementSpy.mockRestore();
  });

  test('button rebinds when the `on` event name changes', () => {
    const data = {
      on: 'click', value: 'btn', fontSize: 0.2, fontFamily: 'f.ttf',
      fontColor: '#F1F5F9', borderColor: '#1B1B1F', focusColor: '#0EA5E9',
      backgroundColor: '#202127', hoverColor: '#0EA5E9', activeColor: '#2563EB',
      toggle: false, toggleState: false,
    };
    const {instance, listeners} = createComponentInstance(
      'sxr-button', components['sxr-button'], data,
      {
        getAttribute: jest.fn((name) => {
          if (name === 'sxr-item') {
            return {width: 2.5, height: 0.7, depth: 0.1, baseDepth: 0.025, gap: 0.1, bevel: false};
          }
          if (name === 'sxr-interactable') return {clickAction: ''};
          return null;
        }),
      }
    );
    instance.init();

    // emulated setAttribute flow: data changes then update(oldData) runs
    const oldData = {...data};
    data.on = 'tap';
    instance.update(oldData);

    expect(listeners.click).toHaveLength(0);
    expect(listeners.tap).toHaveLength(1);
  });

  test('circle-loader rebuilds ring and text when sxr-item changes', () => {
    const item = {width: 1, height: 0.86};
    const {el, instance} = createComponentInstance(
      'sxr-circle-loader', components['sxr-circle-loader'],
      {
        loaded: 0.5, fontSize: 0.2, fontFamily: 'f.ttf',
        fontColor: '#F1F5F9', backgroundColor: '#202127', activeColor: '#2563EB',
      },
      {
        getAttribute: jest.fn((name) => (name === 'sxr-item' ? item : null)),
      }
    );
    instance.init();

    const textCountBefore = createdTextEntities.length;
    const geometryBefore = el.attributes.geometry;
    item.height = 1.4;
    // the mock emit wraps its second argument as {detail}
    el.emit('componentchanged', {name: 'sxr-item', newData: item});

    expect(el.attributes.geometry).not.toBe(geometryBefore);
    expect(el.attributes.geometry).toContain('height: 1.4;');
    // the ring resizes in place to the new diameter
    expect(instance.loaderRing.attributes['radius-outer']).toBe('0.7');
    // text is recreated to fit the new box
    expect(createdTextEntities.length).toBe(textCountBefore + 1);
    // the old text entity was torn down through removeEntity
    expect(removedEntities.length).toBe(1);
  });

  test('progress bar rebuilds its meter when sxr-item changes', () => {
    const item = {width: 0.78, height: 0.2};
    const {el, instance} = createComponentInstance(
      'sxr-progressbar', components['sxr-progressbar'],
      {backgroundColor: '#202127', activeColor: '#2563EB', percent: 0.5},
      {
        getAttribute: jest.fn((name) => (name === 'sxr-item' ? item : null)),
      }
    );
    instance.init();

    const geometryBefore = el.attributes.geometry;
    item.width = 1.2;
    el.emit('componentchanged', {name: 'sxr-item', newData: item});

    expect(el.attributes.geometry).not.toBe(geometryBefore);
    expect(el.attributes.geometry).toContain('width: 1.2;');
    // the meter follows the new width: 0.6 active, centered
    const meter = el.children[0];
    expect(meter.attributes.geometry).toContain('width: 0.6;');
    expect(meter.attributes.position).toBe('-0.3 0 0.01');
  });

  test('label resizes background and text box when sxr-item changes', () => {
    const item = {width: 2.5, height: 0.75};
    const {el, instance} = createComponentInstance(
      'sxr-label', components['sxr-label'],
      {
        value: 'hi', align: 'center', anchor: 'center', fontSize: 0.2,
        lineHeight: 0.2, letterSpacing: 0, fontFamily: 'f.ttf',
        fontColor: '#F1F5F9', backgroundColor: '#202127', opacity: 1.0,
        textDepth: 0.01, textOcclusion: false, textStrokeColor: '', textStrokeWidth: -1,
      },
      {
        getAttribute: jest.fn((name) => (name === 'sxr-item' ? item : null)),
      }
    );
    instance.init();

    const textCountBefore = createdTextEntities.length;
    const geometryBefore = el.attributes.geometry;
    item.width = 3.4;
    el.emit('componentchanged', {name: 'sxr-item', newData: item});

    expect(el.attributes.geometry).not.toBe(geometryBefore);
    expect(el.attributes.geometry).toContain('width: 3.4;');
    expect(createdTextEntities.length).toBe(textCountBefore + 1);
    const lastOptions = createdTextEntities[createdTextEntities.length - 1];
    // text box follows the new width (width / 1.05)
    expect(lastOptions.width).toBeCloseTo(3.4 / 1.05);
  });

  test('input rebuilds its border entities when sxr-item changes', () => {
    const item = {width: 2.5, height: 0.75};
    const {el, instance} = createComponentInstance(
      'sxr-input', components['sxr-input'],
      {
        on: 'click', value: 'a', nativeEditing: false, fontSize: 0.2,
        fontFamily: 'f.ttf', fontColor: '#161618', borderColor: '#1B1B1F',
        borderHoverColor: '#0EA5E9', backgroundColor: '#F1F5F9', hoverColor: '#F1F5F9',
      },
      {
        getAttribute: jest.fn((name) => (name === 'sxr-item' ? item : null)),
      }
    );
    instance.init();

    const bordersBefore = [
      instance.borderTopEntity, instance.borderBottomEntity,
      instance.borderLeftEntity, instance.borderRightEntity,
    ];
    const textCountBefore = createdTextEntities.length;
    item.width = 3.2;
    el.emit('componentchanged', {name: 'sxr-item', newData: item});

    // every border entity was replaced
    [instance.borderTopEntity, instance.borderBottomEntity,
     instance.borderLeftEntity, instance.borderRightEntity].forEach((border) => {
      expect(bordersBefore).not.toContain(border);
    });
    // top/bottom borders span the new width; left/right keep their 0.05 rail
    expect(instance.borderTopEntity.attributes.geometry).toContain('width: 3.2;');
    expect(instance.borderBottomEntity.attributes.geometry).toContain('width: 3.2;');
    expect(instance.borderLeftEntity.attributes.geometry).toContain('height: 0.75;');
    expect(instance.borderRightEntity.attributes.geometry).toContain('height: 0.75;');
    // old borders + old text were torn down
    expect(removedEntities.length).toBeGreaterThanOrEqual(5);
    expect(createdTextEntities.length).toBe(textCountBefore + 1);
  });

  test('unchanged sxr-item data does not trigger a rebuild', () => {
    const item = {width: 2.5, height: 0.75};
    const {el, instance} = createComponentInstance(
      'sxr-progressbar', components['sxr-progressbar'],
      {backgroundColor: '#202127', activeColor: '#2563EB', percent: 0.5},
      {
        getAttribute: jest.fn((name) => (name === 'sxr-item' ? item : null)),
      }
    );
    instance.init();

    const textCountBefore = createdTextEntities.length;
    const meterBefore = el.children[0];
    el.emit('componentchanged', {name: 'sxr-item', newData: item});

    expect(el.children[0]).toBe(meterBefore);
    expect(createdTextEntities.length).toBe(textCountBefore);
    void makeEntity;
  });
});
