/**
 * Polish-tier regression tests:
 * - R25: icon entities redraw in place on toggle (icon buttons)
 * - R26: sxr-slider `percent` is live after init
 * - R27: sxr-item exposes a `type` default; input borders are named correctly
 */
const {createComponentInstance, makeEntity} = require('./helpers');

describe('P1 polish: icon redraw preference', () => {
  let components;
  let createdIconEntities;
  let createElementSpy;

  beforeAll(() => {
    global.SXR = {
      colors: {
        primary: '#2563EB',
        secondary: '#0EA5E9',
        background: '#161618',
        surface: '#202127',
        onSurface: '#F1F5F9',
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
      redrawIconEntity: (entity, options) => {
        if (!entity || !entity._sxrIconState) { return false; }
        entity._sxrIconState.icon = options.icon;
        return true;
      },
      createTextEntity: () => makeEntity(),
      createIconEntity: (options) => {
        const entity = makeEntity();
        entity._sxrIconState = {icon: options.icon};
        createdIconEntities.push(options);
        return entity;
      },
      removeEntity: () => {},
    };
    components = {};
    global.AFRAME = {
      registerComponent: jest.fn((name, definition) => {
        components[name] = definition;
      }),
      registerPrimitive: jest.fn(),
      components: {},
      utils: {entity: {setComponentProperty: jest.fn()}},
    };
    require('../src/components/icon-button.js');
    require('../src/components/slider.js');
    require('../src/components/item.js');
  });

  afterAll(() => {
    delete global.AFRAME;
    delete global.SXR;
  });

  beforeEach(() => {
    createdIconEntities = [];
    createElementSpy = jest.spyOn(document, 'createElement').mockImplementation(
      makeEntity
    );
  });

  afterEach(() => {
    createElementSpy.mockRestore();
  });

  test('toggling an icon button redraws in place (no recreate)', () => {
    const data = {
      on: 'click',
      toggle: true,
      toggleState: false,
      icon: 'star',
      iconActive: 'star-active',
      iconFontSize: 0.4,
      iconFont: '',
      fontColor: '#F1F5F9',
      borderColor: '#1B1B1F',
      backgroundColor: '#202127',
      hoverColor: '#0EA5E9',
      activeColor: '#2563EB',
    };
    const {instance, listeners} = createComponentInstance(
      'sxr-icon-button', components['sxr-icon-button'], data,
      {
        getAttribute: jest.fn((name) => {
          if (name === 'sxr-item') return {width: 1, height: 1};
          if (name === 'sxr-interactable') return {clickAction: ''};
          return null;
        }),
      }
    );
    instance.init();

    expect(createdIconEntities).toHaveLength(1);

    listeners.click[0]({});
    expect(data.toggleState).toBe(true);
    expect(instance.iconEntity._sxrIconState.icon).toBe('star-active');
    expect(createdIconEntities).toHaveLength(1);

    listeners.click[0]({});
    expect(instance.iconEntity._sxrIconState.icon).toBe('star');
    expect(createdIconEntities).toHaveLength(1);
  });

  test('sxr-slider percent is live after init and clamped', () => {
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
      leftRightPadding: 0.25,
      percent: 0.1,
      sliderBarHeight: 0.05,
      sliderBarDepth: 0.03,
      topBottomPadding: 0.125,
    };
    const {el, instance, data: liveData} = createComponentInstance(
      'sxr-slider', components['sxr-slider'], data,
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

  test('sxr-item type has an empty-string default', () => {
    expect(components['sxr-item'].schema.type.default).toBe('');
  });
});

