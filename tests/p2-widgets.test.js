/**
 * P2 tests: widget update paths prefer in-place redraws and skip redundant
 * work (R17/R18).
 * - input: typing redraws the existing text entity instead of recreating it
 * - circle-timer: per-second ticks redraw in place
 * - label: update() is diffed (text vs background keys)
 * - button: update() no longer rebuilds geometry, only colors + label
 */
const {createComponentInstance, makeEntity} = require('./helpers');

describe('P2 widget update efficiency', () => {
  let components;
  let createdTextEntities;
  let createElementSpy;

  const baseSXR = () => ({
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
    // emulate a stateful text entity that always redraws in place
    redrawTextEntity: (entity, options) => {
      if (!entity || !entity._sxrTextState) { return false; }
      entity._sxrTextState.value = options.value;
      return true;
    },
    redrawIconEntity: () => false,
    createTextEntity: (options) => {
      const entity = makeEntity();
      entity._sxrTextState = {value: options.value};
      createdTextEntities.push(options);
      return entity;
    },
    removeEntity: () => {},
  });

  beforeAll(() => {
    global.SXR = baseSXR();
    components = {};
    global.AFRAME = {
      registerComponent: jest.fn((name, definition) => {
        components[name] = definition;
      }),
      registerPrimitive: jest.fn(),
      components: {},
      utils: {entity: {setComponentProperty: jest.fn()}},
    };
    require('../src/components/input.js');
    require('../src/components/circle-timer.js');
    require('../src/components/label.js');
    require('../src/components/button.js');
  });

  afterAll(() => {
    delete global.AFRAME;
    delete global.SXR;
  });

  beforeEach(() => {
    createdTextEntities = [];
    createElementSpy = jest.spyOn(document, 'createElement').mockImplementation(makeEntity);
  });

  afterEach(() => {
    createElementSpy.mockRestore();
  });

  const sxrItem = {width: 2.5, height: 0.75};
  const getAttributeFor = (interactableName) => jest.fn((name) => {
    if (name === 'sxr-item') return sxrItem;
    if (name === 'sxr-interactable') return {clickAction: interactableName, hoverAction: ''};
    return null;
  });

  describe('input redraws per keystroke', () => {
    const inputData = () => ({
      on: 'click',
      value: 'a',
      fontSize: 0.2,
      fontFamily: 'f.ttf',
      fontColor: '#161618',
      borderColor: '#1B1B1F',
      borderHoverColor: '#0EA5E9',
      backgroundColor: '#F1F5F9',
      hoverColor: '#F1F5F9',
    });

    test('appendText reuses the same text entity', () => {
      const {el, instance, data} = createComponentInstance(
        'sxr-input', components['sxr-input'], inputData(),
        {getAttribute: getAttributeFor('')}
      );
      instance.init();

      expect(createdTextEntities).toHaveLength(1);

      instance.appendText('b');
      expect(data.value).toBe('ab');
      expect(createdTextEntities).toHaveLength(1);
      expect(instance.textEntity._sxrTextState.value).toBe('ab');

      instance.delete();
      expect(data.value).toBe('a');
      expect(createdTextEntities).toHaveLength(1);
    });
  });

  describe('circle-timer ticks redraw in place', () => {
    const timerData = () => ({
      countDown: 10,
      fontSize: 0.2,
      fontFamily: 'f.ttf',
      fontColor: '#F1F5F9',
      borderColor: '#1B1B1F',
      backgroundColor: '#202127',
      activeColor: '#2563EB',
    });

    test('per-second updates do not recreate the text entity', () => {
      const callback = jest.fn();
      window.timerCb2 = callback;
      const {instance} = createComponentInstance(
        'sxr-circle-timer', components['sxr-circle-timer'], timerData(),
        {
          getAttribute: jest.fn((name) => {
            if (name === 'sxr-item') return {width: 1, height: 0.75};
            if (name === 'sxr-interactable') return {clickAction: 'timerCb2'};
            return null;
          }),
        }
      );
      instance.init();

      const textEntities = [];
      instance.tick(0);
      instance.tick(1000);
      instance.tick(2000);
      instance.tick(3000);

      // one create at init, zero during countdown ticks
      expect(createdTextEntities).toHaveLength(1);
      expect(instance.textEntity._sxrTextState.value).toBe(7);
      expect(callback).not.toHaveBeenCalled();
      delete window.timerCb2;
    });
  });

  describe('label update diffing', () => {
    const labelData = () => ({
      value: 'hi',
      align: 'center',
      anchor: 'center',
      fontSize: 0.2,
      lineHeight: 0.2,
      letterSpacing: 0,
      fontFamily: 'f.ttf',
      fontColor: '#F1F5F9',
      backgroundColor: '#202127',
      opacity: 1.0,
      textDepth: 0.01,
      textStrokeColor: '',
      textStrokeWidth: -1,
    });

    test('unrelated property change does not re-render text or background', () => {
      const {el, instance, data} = createComponentInstance(
        'sxr-label', components['sxr-label'], labelData(),
        {getAttribute: getAttributeFor(''), getObject3D: jest.fn(() => null), removeObject3D: jest.fn()}
      );
      instance.init();
      instance.update({}); // first update pass establishes the keys

      instance.updateBackground = jest.fn();
      instance.setText = jest.fn();

      data.anchor = 'left'; // not used by rendering at all
      instance.update({anchor: 'center'});

      expect(instance.setText).not.toHaveBeenCalled();
      expect(instance.updateBackground).not.toHaveBeenCalled();

      data.value = 'changed';
      instance.update({value: 'hi'});
      expect(instance.setText).toHaveBeenCalledTimes(1);

      data.opacity = 0.5;
      instance.update({opacity: 1.0});
      expect(instance.updateBackground).toHaveBeenCalledTimes(1);
    });
  });

  describe('button update diffing', () => {
    const buttonData = () => ({
      on: 'click',
      value: 'btn',
      fontSize: 0.2,
      fontFamily: 'f.ttf',
      fontColor: '#F1F5F9',
      borderColor: '#1B1B1F',
      focusColor: '#0EA5E9',
      backgroundColor: '#202127',
      hoverColor: '#0EA5E9',
      activeColor: '#2563EB',
      toggle: false,
      toggleState: false,
    });

    test('update() refreshes resting colors without touching geometry', () => {
      const {el, instance, data, listeners} = createComponentInstance(
        'sxr-button', components['sxr-button'], buttonData(),
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

      const geometryBefore = el.attributes.geometry;
      const buttonEntity = el.children[1];

      data.backgroundColor = '#111111';
      instance.update({backgroundColor: '#202127'});

      // geometry untouched, resting color refreshed from the new data
      expect(el.attributes.geometry).toBe(geometryBefore);
      expect(buttonEntity.attributes.material).toContain('#111111');
    });
  });
});
