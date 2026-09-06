/**
 * P2 tests: text renderer v2 (R17).
 * - createTextEntity attaches a persistent drawing state to the entity
 * - redrawTextEntity redraws in place (same canvas + texture) when the box
 *   is unchanged, and returns false when the box size changed
 * - the default pixel ratio produces compact (GPU-cheap) textures
 */
describe('SXR text renderer v2', () => {
  let createElementSpy;

  beforeAll(() => {
    global.AFRAME = {
      registerComponent: jest.fn(),
      registerPrimitive: jest.fn(),
      components: {},
      utils: {entity: {setComponentProperty: jest.fn()}},
    };
    require('../src/scripts/vars.js');
    if (!global.SXR && global.window && global.window.SXR) {
      global.SXR = global.window.SXR;
    }
    require('../src/components/circle-loader.js');
    require('../src/components/circle-timer.js');
    global.THREE = {
      CanvasTexture: jest.fn(function (canvas) { this.image = canvas; this.dispose = jest.fn(); }),
      MeshBasicMaterial: jest.fn(function () { this.dispose = jest.fn(); }),
      PlaneGeometry: jest.fn(function () { this.dispose = jest.fn(); }),
      Mesh: jest.fn(),
      LinearFilter: 'LinearFilter',
      DoubleSide: 'DoubleSide',
    };
  });

  afterAll(() => {
    delete global.AFRAME;
    delete global.THREE;
    delete global.SXR;
  });

  beforeEach(() => {
    const originalCreateElement = document.createElement.bind(document);
    createElementSpy = jest.spyOn(document, 'createElement').mockImplementation((tagName, options) => {
      const element = originalCreateElement(tagName, options);
      if (tagName === 'a-entity') {
        element.setObject3D = jest.fn();
        element.removeAttribute = () => {};
      }
      return element;
    });
  });

  afterEach(() => {
    createElementSpy.mockRestore();
  });

  const makeOptions = (overrides) => Object.assign({
    value: 'Hello',
    width: 2,
    height: 1,
    fontSize: 0.2,
    fontFamily: 'Arial',
    color: '#FFFFFF',
    align: 'center',
  }, overrides);

  test('createTextEntity attaches persistent state and compact textures', () => {
    const entity = window.SXR.createTextEntity(makeOptions());

    expect(entity._sxrTextState).toBeDefined();
    expect(entity._sxrTextTexture).toBeInstanceOf(global.THREE.CanvasTexture);
    // pixel ratio 128: width 2 -> 256px canvas, height 1 -> 128px canvas
    expect(entity._sxrTextState.canvas.width).toBe(256);
    expect(entity._sxrTextState.canvas.height).toBe(128);
  });

  test('redrawTextEntity reuses the same canvas and texture', () => {
    const entity = window.SXR.createTextEntity(makeOptions());
    const state = entity._sxrTextState;
    const texture = entity._sxrTextTexture;
    const canvas = state.canvas;
    const valueBefore = state.value;

    const redrawn = window.SXR.redrawTextEntity(entity, makeOptions({value: 'World'}));

    expect(redrawn).toBe(true);
    expect(entity._sxrTextState).toBe(state);
    expect(entity._sxrTextTexture).toBe(texture);
    expect(entity._sxrTextState.canvas).toBe(canvas);
    expect(state.value).toBe('World');
    expect(state.value).not.toBe(valueBefore);
    expect(entity._sxrTextTexture.needsUpdate).toBe(true);
  });

  test('redrawTextEntity refuses to redraw when the box size changed', () => {
    const entity = window.SXR.createTextEntity(makeOptions());
    const state = entity._sxrTextState;

    const redrawn = window.SXR.redrawTextEntity(entity, makeOptions({width: 4}));

    expect(redrawn).toBe(false);
    expect(entity._sxrTextState).toBe(state);
  });

  test('each redraw clears previous lettering before drawing shorter or empty text', () => {
    const entity = window.SXR.createTextEntity(makeOptions({value: 'Last event: ready'}));
    const {ctx, canvas} = entity._sxrTextState;

    ['Updated status', 'OK', '', 'Next event'].forEach((value) => {
      ctx.clearRect.mockClear();
      ctx.fillText.mockClear();

      expect(window.SXR.redrawTextEntity(entity, makeOptions({value}))).toBe(true);
      expect(ctx.clearRect).toHaveBeenCalledTimes(1);
      expect(ctx.clearRect).toHaveBeenCalledWith(0, 0, canvas.width, canvas.height);
      expect(ctx.clearRect.mock.invocationCallOrder[0]).toBeLessThan(ctx.fillText.mock.invocationCallOrder[0]);
      expect(ctx.fillText.mock.calls.map((call) => call[0]).join(' ')).toBe(value);
    });
  });

  const makeCircle = (name) => {
    const definition = global.AFRAME.registerComponent.mock.calls.find((call) => call[0] === name)[1];
    const data = Object.fromEntries(Object.entries(definition.schema).map(([key, value]) => [key, value.default]));
    data.fontFamily = 'Arial';
    const el = document.createElement('a-entity');
    const getAttribute = el.getAttribute.bind(el);
    el.getAttribute = (attribute) => attribute === 'sxr-item'
      ? {width: 0.86, height: 0.86}
      : getAttribute(attribute);
    const instance = Object.assign({}, definition, {el, data});
    instance.init();
    return instance;
  };

  const expectAttachedText = (instance, text, value) => {
    expect(instance.textEntity).toBe(text);
    expect(text.parentNode).toBe(instance.el);
    expect(Array.from(instance.el.children).filter((child) => child._sxrTextState)).toEqual([text]);
    expect(text._sxrTextState.value).toBe(String(value));
    [text._sxrTextTexture, text._sxrTextMaterial, text._sxrTextGeometry].forEach((resource) => {
      expect(resource.dispose).not.toHaveBeenCalled();
    });
  };

  test('loader initial update and repeated value changes retain attached text', () => {
    const instance = makeCircle('sxr-circle-loader');
    const text = instance.textEntity;
    instance.update({});
    expectAttachedText(instance, text, 50);

    [0.75, 0.12, 0, 1].forEach((loaded) => {
      const oldData = {...instance.data};
      instance.data.loaded = loaded;
      instance.update(oldData);
      expectAttachedText(instance, text, Math.round(loaded * 100));
      expect(instance.loaderRing.getAttribute('theta-length')).toBe(String(loaded * 360));
    });
  });

  test('timer ticks and resets retain attached text through expiry and restart', () => {
    const instance = makeCircle('sxr-circle-timer');
    const text = instance.textEntity;
    instance.callback = jest.fn();
    instance.update({});
    instance.tick(0);
    instance.tick(1000);
    expectAttachedText(instance, text, 9);

    const oldData = {...instance.data};
    instance.data.countDown = 3;
    instance.update(oldData);
    expectAttachedText(instance, text, 3);
    instance.tick(2000);
    instance.tick(3000);
    expectAttachedText(instance, text, 2);
    instance.tick(5000);
    instance.tick(6000);
    expectAttachedText(instance, text, 0);
    expect(instance.callback).toHaveBeenCalledTimes(1);

    instance.data.countDown = 12;
    instance.update({countDown: 3});
    instance.tick(7000);
    instance.tick(8000);
    expectAttachedText(instance, text, 11);
  });

  test('showcase metric updates let the timer ring complete before restarting', () => {
    const instance = makeCircle('sxr-circle-timer');
    instance.data.countDown = 12;
    instance.update({countDown: 10});
    instance.callback = jest.fn();
    const timer = instance.el;
    timer.components = {'sxr-circle-timer': instance};
    timer.setAttribute = jest.fn((name, value) => {
      if (name !== 'count-down') return;
      const oldData = {...instance.data};
      instance.data.countDown = Number(value);
      instance.update(oldData);
    });
    const metric = document.createElement('a-entity');
    const html = require('fs').readFileSync(require('path').join(__dirname, '../examples/index.html'), 'utf8');
    const script = html.match(/<script>([\s\S]*?)<\/script>/)[1];
    const demo = {
      AFRAME: global.AFRAME,
      window: {addEventListener: jest.fn()},
      document: {querySelector: (selector) => selector === '#circleTimer' ? timer : metric},
    };
    require('vm').runInNewContext(script, demo);

    instance.tick(0);
    for (let second = 1; second <= 12; second++) {
      instance.tick(second * 1000);
      expect(Number(instance.timerRing.getAttribute('theta-length'))).toBeCloseTo(second * 30);
      demo.tickTimer();
      expect(metric.getAttribute('value')).toBe(`Timer ${12 - second}s`);
      if (second < 12) expect(timer.setAttribute).not.toHaveBeenCalled();
    }
    expect(instance.callback).toHaveBeenCalledTimes(1);
    expect(instance.data.countDown).toBe(12);
    instance.tick(13000);
    instance.tick(14000);
    demo.tickTimer();
    expect(Number(instance.timerRing.getAttribute('theta-length'))).toBeCloseTo(30);
    expect(metric.getAttribute('value')).toBe('Timer 11s');
  });

  test.each(['sxr-circle-loader', 'sxr-circle-timer'])('%s replaces resized text and disposes removed resources once', (name) => {
    const instance = makeCircle(name);
    const original = instance.textEntity;
    instance.guiItem.height = 1.2;
    instance.setText(1);
    const replacement = instance.textEntity;
    expect(replacement).not.toBe(original);
    expect(original.parentNode).toBeNull();
    expectAttachedText(instance, replacement, name === 'sxr-circle-loader' ? 100 : 1);
    instance.remove();
    instance.remove();
    expect(instance.textEntity).toBeNull();
    expect(replacement.parentNode).toBeNull();
    [original, replacement].forEach((entity) => {
      [entity._sxrTextTexture, entity._sxrTextMaterial, entity._sxrTextGeometry].forEach((resource) => {
        expect(resource.dispose).toHaveBeenCalledTimes(1);
      });
    });
  });

  test('redrawTextEntity returns false for entities without text state', () => {
    expect(window.SXR.redrawTextEntity(null, makeOptions())).toBe(false);
    expect(window.SXR.redrawTextEntity({}, makeOptions())).toBe(false);
  });

  test('createIconEntity attaches persistent state and redraws in place', () => {
    const entity = window.SXR.createIconEntity({icon: 'check', width: 0.4, color: '#FFFFFF'});

    expect(entity._sxrIconState).toBeDefined();
    const state = entity._sxrIconState;
    const texture = entity._sxrIconTexture;
    const canvas = state.canvas;

    const redrawn = window.SXR.redrawIconEntity(entity, {icon: 'star'});

    expect(redrawn).toBe(true);
    expect(entity._sxrIconState).toBe(state);
    expect(entity._sxrIconTexture).toBe(texture);
    expect(entity._sxrIconState.canvas).toBe(canvas);
    expect(state.icon).toBe('star');
  });

  test('redrawIconEntity rejects size changes and missing state', () => {
    const entity = window.SXR.createIconEntity({icon: 'check', width: 0.4, color: '#FFFFFF'});

    expect(window.SXR.redrawIconEntity(entity, {icon: 'star', width: 0.8})).toBe(false);
    expect(window.SXR.redrawIconEntity(null, {icon: 'star'})).toBe(false);
    expect(window.SXR.redrawIconEntity({}, {icon: 'star'})).toBe(false);
  });

  test('unknown icons fall back synchronously and report via onLoad', () => {
    const onLoad = jest.fn();
    const entity = window.SXR.createIconEntity({icon: 'nonexistent-icon', width: 0.4, onLoad});

    expect(onLoad).toHaveBeenCalledTimes(1);
    expect(entity._sxrIconState).toBeDefined();
  });
});
