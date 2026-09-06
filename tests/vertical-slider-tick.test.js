/**
 * Regression test: sxr-vertical-slider tick() must compute localCoordinates
 * before the no-change early-out (previous version threw
 * "Cannot access 'localCoordinates' before initialization").
 */
const {makeEntity} = require('./helpers');

describe('sxr-vertical-slider tick', () => {
  let component;

  beforeAll(() => {
    global.SXR = {
      colors: {
        primary: '#2563EB',
        secondary: '#0EA5E9',
        onSurface: '#F1F5F9',
        surface: '#202127',
        border: '#1B1B1F',
        neutral: '#1B1B1F',
      },
      fonts: {default: 'Outfit-Regular.ttf'},
      normalizeFontSize: (value, fallback = 0.2) => {
        const parsed = typeof value === 'number' ? value : parseFloat(value);
        return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
      },
      getActionFunction: (name) => {
        const fn = window[name];
        return (name && typeof fn === 'function') ? fn : null;
      },
      redrawTextEntity: () => false,
      createTextEntity: () => makeEntity(),
      removeEntity: () => {},
      getValidColor: (color, fallback = '#F1F5F9') => color || fallback,
    };
    global.THREE = {
      Vector3: class {
        constructor() { this.x = 0; this.y = 0; this.z = 0; }
        set(x, y, z) { this.x = x; this.y = y; this.z = z; }
      },
      Quaternion: class { set() {} },
    };
    global.AFRAME = {
      registerComponent: jest.fn((name, definition) => {
        if (name === 'sxr-vertical-slider') component = definition;
      }),
      registerPrimitive: jest.fn(),
      components: {},
      utils: {entity: {setComponentProperty: jest.fn()}},
    };
    require('../src/components/vertical-slider.js');
  });

  afterAll(() => {
    delete global.AFRAME;
    delete global.SXR;
    delete global.THREE;
  });

  const makeTickInstance = () => {
    const el = makeEntity();
    el.sceneEl = {time: 0};
    el.object3D = {
      updateMatrixWorld: jest.fn(),
      matrixWorld: {decompose: jest.fn()},
    };
    const data = {
      hoverPercent: 0,
      hoverFontSize: 0.2,
      hoverHeight: 0.35,
      hoverWidth: 0.7,
      outputTextDepth: 0.25,
      outputFunction: '',
      sliderBarDepth: 0.03,
      sliderBarWidth: 0.08,
    };
    const instance = Object.assign({}, component, {
      el,
      data,
      sliderHeight: 1,
      _pos: new global.THREE.Vector3(),
      _rot: new global.THREE.Quaternion(),
      _scale: new global.THREE.Vector3(),
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
