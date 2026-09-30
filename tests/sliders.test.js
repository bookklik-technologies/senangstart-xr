/**
 * Sliders (horizontal + vertical):
 * - track geometry derives from sxr-item width, not height
 * - click/keyboard clicks without intersection detail are tolerated
 * - intersection points are copied before transformation (rotated/scaled
 *   parents resolve correctly; the raycaster's shared point is not mutated)
 * - percent is live and clamped; keyboard-step arrows/Home/End work when
 *   focused with the (event, percent) callback signature preserved
 * - vertical slider tick() computes local coordinates and hides the hover
 *   indicator when the pointer does not move
 * - sxr-item dimension changes rebuild the live geometry
 */
const {
  createSXR, setupAFRAME, teardownAFRAME, createComponentInstance,
  stubCreateElement, makeEntity,
} = require('./helpers');

describe('sliders', () => {
  let components;
  let createElementSpy;

  beforeAll(() => {
    global.SXR = createSXR().SXR;
    global.THREE = {
      Vector3: class {
        constructor() { this.x = 0; this.y = 0; this.z = 0; }
        copy(v) { this.x = v.x; this.y = v.y; this.z = v.z; return this; }
      },
      Quaternion: class { set() {} },
    };
    ({components} = setupAFRAME(['sxr-slider', 'sxr-vertical-slider']));
    require('../src/components/slider.js');
    require('../src/components/vertical-slider.js');
  });

  afterAll(() => {
    teardownAFRAME();
    delete global.SXR;
    delete global.THREE;
  });

  beforeEach(() => {
    createElementSpy = stubCreateElement({mock: true});
  });

  afterEach(() => {
    createElementSpy.mockRestore();
    delete window.sliderCb;
    delete window.sliderCb2;
  });

  const sliderData = (overrides) => Object.assign({
    activeColor: '#2563EB',
    backgroundColor: '#F1F5F9',
    borderColor: '#1B1B1F',
    handleColor: '#F1F5F9',
    handleInnerDepth: 0.02,
    handleInnerRadius: 0.13,
    handleOuterDepth: 0.04,
    handleOuterRadius: 0.17,
    hoverColor: '#0EA5E9',
    keyboardStep: 0.05,
    leftRightPadding: 0.25,
    percent: 0.5,
    sliderBarHeight: 0.05,
    sliderBarDepth: 0.03,
    topBottomPadding: 0.125,
  }, overrides);

  // ---- geometry -------------------------------------------------------------

  test('background plane uses the configured width instead of height', () => {
    const el = makeEntity();
    el.getAttribute = jest.fn((name) => {
      if (name === 'sxr-item') return {width: 2.95, height: 0.42};
      if (name === 'sxr-interactable') return {clickAction: ''};
      return null;
    });

    components['sxr-slider'].init.call({el, data: sliderData({percent: 0.1})});

    expect(el.attributes.geometry).toContain('width: 2.95;');
    expect(el.attributes.geometry).toContain('height: 0.42;');
  });

  test('preserves the configured track width after interaction', () => {
    const listeners = {};
    const children = [];
    const el = makeEntity();
    el.getAttribute = jest.fn((name) => {
      if (name === 'sxr-item') return {width: 2.95, height: 0.42};
      if (name === 'sxr-interactable') return {clickAction: ''};
      return null;
    });
    el.appendChild = (child) => children.push(child);
    el.addEventListener = (name, listener) => { listeners[name] = listener; };
    el.object3D = {
      updateMatrixWorld: jest.fn(),
      worldToLocal: jest.fn((_v) => ({x: 0.4})),
    };

    components['sxr-slider'].init.call({el, data: sliderData({percent: 0.1})});

    const getWidth = (entity) => Number(entity.attributes.geometry.match(/width: ([^;]+)/)[1]);
    expect(getWidth(children[0]) + getWidth(children[1])).toBeCloseTo(2.45);

    listeners.click({detail: {intersection: {point: {x: 0.4}}}});

    expect(getWidth(children[0]) + getWidth(children[1])).toBeCloseTo(2.45);
  });

  test('percent is live after init and clamped', () => {
    const {el, instance, data: liveData} = createComponentInstance(
      'sxr-slider', components['sxr-slider'], sliderData({percent: 0.1}),
      {
        getAttribute: jest.fn((name) => {
          if (name === 'sxr-item') return {width: 2.95, height: 0.42};
          if (name === 'sxr-interactable') return {clickAction: ''};
          return null;
        }),
      }
    );
    instance.init();

    const activeBar = el.children[0];
    expect(parseFloat(/width: ([\d.]+)/.exec(activeBar.attributes.geometry)[1])).toBeCloseTo(0.245);

    liveData.percent = 0.9;
    instance.update({percent: 0.1});
    expect(parseFloat(/width: ([\d.]+)/.exec(activeBar.attributes.geometry)[1])).toBeCloseTo(2.205);

    liveData.percent = 5;
    instance.update({percent: 0.9});
    expect(parseFloat(/width: ([\d.]+)/.exec(activeBar.attributes.geometry)[1])).toBeCloseTo(2.45);
  });

  // ---- clicks ---------------------------------------------------------------

  test('click without detail does not throw and does not fire the callback', () => {
    const clickAction = jest.fn();
    window.sliderCb = clickAction;
    const listeners = {};
    const el = makeEntity();
    el.addEventListener = (name, listener) => { listeners[name] = listener; };
    el.getAttribute = jest.fn((name) => {
      if (name === 'sxr-item') return {width: 2.95, height: 0.42};
      if (name === 'sxr-interactable') return {clickAction: 'sliderCb'};
      return null;
    });

    components['sxr-slider'].init.call({el, data: sliderData()});

    expect(() => listeners.click({})).not.toThrow();
    expect(() => listeners.click({detail: {}})).not.toThrow();
    expect(clickAction).not.toHaveBeenCalled();
  });

  test('click with detail still updates percent and fires the callback', () => {
    const clickAction = jest.fn();
    window.sliderCb2 = clickAction;
    const listeners = {};
    const el = makeEntity();
    el.addEventListener = (name, listener) => { listeners[name] = listener; };
    el.getAttribute = jest.fn((name) => {
      if (name === 'sxr-item') return {width: 2.95, height: 0.42};
      if (name === 'sxr-interactable') return {clickAction: 'sliderCb2'};
      return null;
    });
    el.object3D = {
      updateMatrixWorld: jest.fn(),
      worldToLocal: jest.fn((_v) => ({x: 0.4})),
    };

    components['sxr-slider'].init.call({el, data: sliderData()});
    listeners.click({detail: {intersection: {point: {x: 0.4, y: 0, z: 0}}}});

    expect(clickAction).toHaveBeenCalledTimes(1);
  });

  test('click under a rotated parent copies the intersection point', () => {
    const originalPoint = {x: 0.4, y: 0, z: 0};
    // emulate a rotated parent: local X maps to a transformed coordinate
    const worldToLocal = (v) => {
      v.x = 0.6;
      return v;
    };
    const clickAction = jest.fn();
    window.sliderCb = clickAction;
    const {el, instance, listeners} = createComponentInstance(
      'sxr-slider', components['sxr-slider'], sliderData(),
      {
        getAttribute: jest.fn((name) => {
          if (name === 'sxr-item') return {width: 2.95, height: 0.42};
          if (name === 'sxr-interactable') return {clickAction: 'sliderCb'};
          return null;
        }),
      }
    );
    instance.init();
    el.object3D = {updateMatrixWorld: jest.fn(), worldToLocal};

    listeners.click[0]({detail: {intersection: {point: originalPoint}}});

    expect(clickAction).toHaveBeenCalledTimes(1);
    // percent = (0.6 + 2.45/2) / 2.45 under the rotated coordinates
    expect(clickAction.mock.calls[0][1]).toBeCloseTo(0.7449, 3);
    // the raycaster's shared point object was not mutated
    expect(originalPoint).toEqual({x: 0.4, y: 0, z: 0});
  });

  // ---- keyboard ---------------------------------------------------------------

  test('arrows step the value and Home/End jump to the extremes', () => {
    const clickAction = jest.fn();
    window.sliderCb = clickAction;
    const {instance, listeners} = createComponentInstance(
      'sxr-slider', components['sxr-slider'], sliderData(),
      {
        getAttribute: jest.fn((name) => {
          if (name === 'sxr-item') return {width: 2.95, height: 0.42};
          if (name === 'sxr-interactable') return {clickAction: 'sliderCb'};
          return null;
        }),
      }
    );
    instance.init();
    instance.el.object3D = {updateMatrixWorld: jest.fn(), worldToLocal: (_v) => _v};

    listeners.keyup[0]({key: 'ArrowRight', preventDefault: jest.fn()});
    expect(instance.data.percent).toBeCloseTo(0.55);
    expect(clickAction).toHaveBeenCalledTimes(1);
    expect(clickAction.mock.calls[0][1]).toBeCloseTo(0.55);

    listeners.keyup[0]({key: 'Home', preventDefault: jest.fn()});
    expect(instance.data.percent).toBe(0);

    listeners.keyup[0]({key: 'End', preventDefault: jest.fn()});
    expect(instance.data.percent).toBe(1);
  });

  // ---- live geometry ------------------------------------------------------------

  test('sxr-item dimension changes rebuild the live geometry', () => {
    const item = {width: 2.95, height: 0.42};
    const {el, instance} = createComponentInstance(
      'sxr-slider', components['sxr-slider'], sliderData(),
      {
        getAttribute: jest.fn((name) => {
          if (name === 'sxr-item') return item;
          if (name === 'sxr-interactable') return {clickAction: ''};
          return null;
        }),
      }
    );
    instance.init();
    el.object3D = {updateMatrixWorld: jest.fn(), worldToLocal: (_v) => _v};

    const geometryBefore = el.attributes.geometry;
    item.width = 4.0;
    // the mock emit wraps its second argument as {detail}
    el.emit('componentchanged', {name: 'sxr-item', newData: item});

    expect(el.attributes.geometry).not.toBe(geometryBefore);
    expect(el.attributes.geometry).toContain('width: 4;');
  });

  // ---- vertical slider ----------------------------------------------------------

  test('vertical slider click without detail does not throw', () => {
    const listeners = {};
    const el = makeEntity();
    el.addEventListener = (name, listener) => { listeners[name] = listener; };
    el.getAttribute = jest.fn((name) => {
      if (name === 'sxr-item') return {width: 1, height: 2};
      if (name === 'sxr-interactable') return {clickAction: '', hoverAction: ''};
      return null;
    });

    const data = {
      activeColor: '#2563EB',
      backgroundColor: '#F1F5F9',
      borderColor: '#1B1B1F',
      handleColor: '#F1F5F9',
      handleInnerDepth: 0.02,
      handleInnerRadius: 0.13,
      handleOuterDepth: 0.04,
      handleOuterRadius: 0.17,
      hoverColor: '#0EA5E9',
      hoverFontSize: 100.0,
      hoverHeight: 0.35,
      hoverPercent: 0,
      hoverWidth: 0.7,
      keyboardStep: 0.05,
      leftRightPadding: 0.125,
      percent: 0.5,
      opacity: 1,
      outputFontSize: '0.2',
      outputFunction: '',
      outputTextDepth: 0.25,
      outputWidth: 1,
      sliderBarDepth: 0.03,
      sliderBarWidth: 0.08,
      topBottomPadding: 0.25,
    };
    components['sxr-vertical-slider'].init.call({el, data});

    expect(() => listeners.click({})).not.toThrow();
    expect(() => listeners.click({detail: {}})).not.toThrow();

    // a click with detail still routes through the percent update path
    el.object3D = {
      updateMatrixWorld: jest.fn(),
      worldToLocal: jest.fn((_v) => ({y: 0})),
    };
    expect(() =>
      listeners.click({detail: {intersection: {point: {x: 0, y: 0, z: 0}}}})
    ).not.toThrow();
    // mock stores the third setAttribute argument (the property value)
    expect(el.attributes['sxr-vertical-slider']).toBe('0.5');
  });

  describe('vertical slider tick', () => {
    const makeTickInstance = () => {
      const el = makeEntity();
      el.sceneEl = {time: 0};
      el.object3D = {
        updateMatrixWorld: jest.fn(),
        worldToLocal: jest.fn((_v) => _v),
      };
      const data = {
        hoverPercent: 0,
        hoverFontSize: 0.2,
        hoverHeight: 0.35,
        hoverWidth: 0.7,
        keyboardStep: 0.05,
        outputTextDepth: 0.25,
        outputFunction: '',
        sliderBarDepth: 0.03,
        sliderBarWidth: 0.08,
      };
      const instance = Object.assign({}, components['sxr-vertical-slider'], {
        el,
        data,
        sliderHeight: 1,
        raycaster: {
          components: {
            raycaster: {getIntersection: () => ({point: {x: 0, y: 0, z: 0}})},
          },
        },
        hoverIndicator: makeEntity(),
        hoverLabel: makeEntity(),
      });
      return instance;
    };

    test('does not throw and updates hoverPercent', () => {
      const instance = makeTickInstance();
      instance.data.hoverPercent = undefined;

      expect(() => instance.tick()).not.toThrow();
      expect(instance.el.attributes['sxr-vertical-slider']).toBe('0.5');
    });

    test('early-outs with hidden indicator when the pointer has not moved', () => {
      const instance = makeTickInstance();
      instance.data.hoverPercent = 0.5;

      instance.tick();
      expect(instance.previousLocalY).toBe(0);

      // pointer at the same local Y again (throttle window passed): indicator hidden
      instance.el.sceneEl.time = 100;
      instance.tick();
      expect(instance.hoverIndicator.attributes.visible).toBe(false);
      expect(instance.hoverLabel.attributes.visible).toBe(false);
      expect(instance.el.attributes['sxr-vertical-slider']).toBeUndefined();
    });
  });
});
