/**
 * P0 regression tests (audit fixes R1-R5).
 * R1: slider background plane uses guiItem.width
 * R2: slider/vertical-slider click handlers tolerate detail-less (keyboard) clicks
 * R3: radio stays checked on repeated clicks; check/uncheck events sync visuals
 * R4: circle-loader ring arc updates on `loaded` changes
 * R5: circle-timer counts down, updates text/ring, fires callback at expiry, survives countDown <= 0
 */
const {makeEntity, createComponentInstance} = require('./helpers');

describe('P0 audit fixes', () => {
  let components = {};
  let createElementSpy;
  let createdTextEntities;

  const makeEntity = () => ({
    attributes: {},
    children: [],
    components: null,
    hasLoaded: false,
    setAttribute(name, value, propertyValue) {
      this.attributes[name] = propertyValue === undefined ? value : propertyValue;
    },
    getAttribute() {
      return null;
    },
    removeAttribute(name) {
      delete this.attributes[name];
    },
    appendChild(child) {
      this.children.push(child);
      return child;
    },
    addEventListener() {},
    removeEventListener() {},
    emit() {},
  });

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
    redrawTextEntity: () => false,
    createTextEntity: (options) => {
      const entity = makeEntity();
      createdTextEntities.push(options);
      return entity;
    },
    removeEntity: () => {},
  });

  const captureComponents = (names) => ({
    registerComponent: jest.fn((name, definition) => {
      if (names.includes(name)) components[name] = definition;
    }),
    registerPrimitive: jest.fn(),
    components: {},
    utils: {entity: {setComponentProperty: jest.fn()}},
  });

  beforeAll(() => {
    global.SXR = baseSXR();
    components = {};
    global.AFRAME = captureComponents([
      'sxr-slider',
      'sxr-vertical-slider',
      'sxr-radio',
      'sxr-circle-loader',
      'sxr-circle-timer',
    ]);
    require('../src/components/slider.js');
    require('../src/components/vertical-slider.js');
    require('../src/components/radio.js');
    require('../src/components/circle-loader.js');
    require('../src/components/circle-timer.js');
  });

  afterAll(() => {
    delete global.AFRAME;
    delete global.SXR;
    delete global.THREE;
  });

  beforeEach(() => {
    createdTextEntities = [];
    createElementSpy = jest.spyOn(document, 'createElement').mockImplementation(makeEntity);
  });

  afterEach(() => {
    createElementSpy.mockRestore();
  });

  describe('R1: slider background plane', () => {
    test('uses the configured width instead of height', () => {
      const el = makeEntity();
      el.getAttribute = jest.fn((name) => {
        if (name === 'sxr-item') return {width: 2.95, height: 0.42};
        if (name === 'sxr-interactable') return {clickAction: ''};
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
        leftRightPadding: 0.25,
        percent: 0.1,
        sliderBarHeight: 0.05,
        sliderBarDepth: 0.03,
        topBottomPadding: 0.125,
      };
      components['sxr-slider'].init.call({el, data});

      expect(el.attributes.geometry).toContain('width: 2.95;');
      expect(el.attributes.geometry).toContain('height: 0.42;');
    });
  });

  describe('R2: keyboard clicks carry no intersection detail', () => {
    const sliderData = {
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
      percent: 0.5,
      sliderBarHeight: 0.05,
      sliderBarDepth: 0.03,
      topBottomPadding: 0.125,
    };

    test('sxr-slider click without detail does not throw', () => {
      const listeners = {};
      const el = makeEntity();
      el.addEventListener = (name, listener) => { listeners[name] = listener; };
      el.getAttribute = jest.fn((name) => {
        if (name === 'sxr-item') return {width: 2.95, height: 0.42};
        if (name === 'sxr-interactable') return {clickAction: 'sliderCb'};
        return null;
      });
      const clickAction = jest.fn();
      window.sliderCb = clickAction;

      components['sxr-slider'].init.call({el, data: {...sliderData}});

      expect(() => listeners.click({})).not.toThrow();
      expect(() => listeners.click({detail: {}})).not.toThrow();
      expect(clickAction).not.toHaveBeenCalled();
      delete window.sliderCb;
    });

    test('sxr-slider click with detail still updates percent and fires callback', () => {
      const listeners = {};
      const el = makeEntity();
      el.addEventListener = (name, listener) => { listeners[name] = listener; };
      el.getAttribute = jest.fn((name) => {
        if (name === 'sxr-item') return {width: 2.95, height: 0.42};
        if (name === 'sxr-interactable') return {clickAction: 'sliderCb2'};
        return null;
      });
      el.object3D = {worldToLocal: jest.fn(() => ({x: 0.4}))};
      const clickAction = jest.fn();
      window.sliderCb2 = clickAction;

      components['sxr-slider'].init.call({el, data: {...sliderData}});
      listeners.click({detail: {intersection: {point: {x: 0.4, y: 0, z: 0}}}});

      expect(clickAction).toHaveBeenCalledTimes(1);
      delete window.sliderCb2;
    });

    test('sxr-vertical-slider click without detail does not throw', () => {
      global.THREE = {
        Vector3: class { set() {} },
        Quaternion: class { set() {} },
      };
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
        hoverMargin: {x: 0, y: 0, z: 0, w: 0},
        leftRightPadding: 0.125,
        percent: 0.5,
        opacity: 1,
        outputFontSize: '0.2',
        outputFunction: '',
        outputHeight: 1,
        outputMargin: {x: 0, y: 0, z: 0, w: 0},
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
      el.object3D = {worldToLocal: jest.fn(() => ({y: 0}))};
      expect(() =>
        listeners.click({detail: {intersection: {point: {x: 0, y: 0, z: 0}}}})
      ).not.toThrow();
      // mock stores the third setAttribute argument (the property value)
      expect(el.attributes['sxr-vertical-slider']).toBe('0.5');
    });
  });

  describe('R3: radio group semantics', () => {
    const radioData = () => ({
      on: 'click',
      value: 'r',
      group: '',
      active: true,
      toggle: false,
      toggleState: false,
      checked: false,
      radiosizecoef: 1,
      fontSize: 0.2,
      fontFamily: 'f.ttf',
      fontColor: '#161618',
      borderColor: '#1B1B1F',
      backgroundColor: '#F1F5F9',
      hoverColor: '#0EA5E9',
      activeColor: '#2563EB',
      handleColor: '#202127',
    });

    const initRadio = (data) => {
      const clickAction = jest.fn();
      window.radioCb = clickAction;
      const {el, instance, listeners} = createComponentInstance(
        'sxr-radio',
        components['sxr-radio'],
        data,
        {
          getAttribute: jest.fn((name) => {
            if (name === 'sxr-item') return {width: 2.5, height: 0.75};
            if (name === 'sxr-interactable') return {clickAction: 'radioCb'};
            return null;
          }),
        }
      );
      instance.init();
      const radioBox = el.children[0];
      const radioCenter = radioBox.children[1];
      return {data, listeners, clickAction, radioCenter};
    };

    afterEach(() => {
      delete window.radioCb;
    });

    test('repeated clicks keep the radio checked (no uncheck, single callback)', () => {
      const {data, listeners, clickAction, radioCenter} = initRadio(radioData());

      listeners.click[0]({});
      expect(data.checked).toBe(true);
      expect(radioCenter.attributes['animation__colorIn']).toBeDefined();
      expect(clickAction).toHaveBeenCalledTimes(1);

      // second click: no-op — radio stays checked, callback not fired again
      listeners.click[0]({});
      expect(data.checked).toBe(true);
      expect(clickAction).toHaveBeenCalledTimes(1);
    });

    test('uncheck event resets state and replays the unchecked visuals', () => {
      const {data, listeners, radioCenter} = initRadio(radioData());

      listeners.click[0]({});
      expect(data.checked).toBe(true);

      listeners.uncheck[0]();
      expect(data.checked).toBe(false);
      expect(radioCenter.attributes['animation__colorOut']).toBeDefined();

      // clicking again re-checks (previous bug: toggled off on second click)
      listeners.click[0]({});
      expect(data.checked).toBe(true);
      expect(radioCenter.attributes['animation__colorIn']).toBeDefined();
    });

    test('initial checked state renders checked resting color', () => {
      const data = radioData();
      data.checked = true;
      const {radioCenter} = initRadio(data);
      expect(radioCenter.attributes.material).toBe('#2563EB');
    });
  });

  describe('R4: circle-loader ring follows `loaded`', () => {
    test('update() refreshes theta-length from data.loaded', () => {
      const el = makeEntity();
      el.getAttribute = jest.fn(() => ({width: 1, height: 0.75}));
      const data = {
        loaded: 0.5,
        fontSize: 0.2,
        fontFamily: 'f.ttf',
        fontColor: '#F1F5F9',
        backgroundColor: '#202127',
        activeColor: '#2563EB',
      };
      const instance = Object.assign({}, components['sxr-circle-loader'], {el, data});
      components['sxr-circle-loader'].init.call(instance);

      const ring = el.children[1];
      expect(ring.attributes['theta-length']).toBe('180');

      data.loaded = 1;
      instance.update({loaded: 0.5});
      expect(ring.attributes['theta-length']).toBe('360');

      data.loaded = 0.25;
      instance.update({loaded: 1});
      expect(ring.attributes['theta-length']).toBe('90');
    });
  });

  describe('R5: circle-timer countdown', () => {
    const timerData = () => ({
      countDown: 10,
      fontSize: 0.2,
      fontFamily: 'f.ttf',
      fontColor: '#F1F5F9',
      borderColor: '#1B1B1F',
      backgroundColor: '#202127',
      activeColor: '#2563EB',
    });

    const initTimer = (data) => {
      const el = makeEntity();
      el.getAttribute = jest.fn((name) => {
        if (name === 'sxr-item') return {width: 1, height: 0.75};
        if (name === 'sxr-interactable') return {clickAction: 'timerCb'};
        return null;
      });
      const callback = jest.fn();
      window.timerCb = callback;
      const instance = Object.assign({}, components['sxr-circle-timer'], {el, data});
      components['sxr-circle-timer'].init.call(instance);
      return {instance, callback};
    };

    afterEach(() => {
      delete window.timerCb;
    });

    test('counts down, updates ring arc, and fires callback on expiry', () => {
      const {instance, callback} = initTimer(timerData());
      const ring = instance.timerRing;

      instance.tick(0);
      expect(createdTextEntities[createdTextEntities.length - 1].value).toBe(10);
      expect(ring.attributes['theta-length']).toBe('0');

      instance.tick(5000);
      expect(createdTextEntities[createdTextEntities.length - 1].value).toBe(5);
      expect(ring.attributes['theta-length']).toBe('180');
      expect(callback).not.toHaveBeenCalled();

      instance.tick(9999);
      expect(createdTextEntities[createdTextEntities.length - 1].value).toBe(1);
      expect(callback).not.toHaveBeenCalled();

      instance.tick(10000);
      expect(ring.attributes['theta-length']).toBe('360');
      expect(callback).toHaveBeenCalledTimes(1);

      // after expiry the timer is inert
      instance.tick(12000);
      expect(callback).toHaveBeenCalledTimes(1);
    });

    test('countDown of 0 (or negative) is inert and does not crash', () => {
      const data = timerData();
      data.countDown = 0;
      const {instance, callback} = initTimer(data);

      expect(() => instance.tick(0)).not.toThrow();
      expect(() => instance.tick(5000)).not.toThrow();
      expect(callback).not.toHaveBeenCalled();
      expect(instance._finished).toBe(false);

      data.countDown = -5;
      expect(() => instance.tick(1000)).not.toThrow();
      expect(callback).not.toHaveBeenCalled();
    });

    test('changing countDown restarts the countdown', () => {
      const {instance, callback} = initTimer(timerData());

      instance.tick(0);
      instance.tick(9000); // 1s left of the original 10

      // external setAttribute('count-down', 5) style update
      instance.data.countDown = 5;
      instance.update({countDown: 10});

      instance.tick(1000); // restart begins at this timestamp (elapsed 0 of new 5s window)
      expect(createdTextEntities[createdTextEntities.length - 1].value).toBe(5);
      expect(callback).not.toHaveBeenCalled();

      instance.tick(6000); // new 5s window elapsed
      expect(callback).toHaveBeenCalledTimes(1);
    });
  });
});
