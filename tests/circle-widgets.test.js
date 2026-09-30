/**
 * Circle widgets (loader + timer):
 * - loader ring arc follows `loaded`; per-second timer ticks redraw text in
 *   place without recreating the entity
 * - countdown updates ring arc + text, fires the callback exactly once at
 *   expiry, stays inert for countDown <= 0, and restarts when count-down
 *   changes
 *
 * Two SXR double flavors are used deliberately: the recreate flavor
 * (redrawTextEntity returns false) models entity replacement so countdown
 * text can be asserted per tick, while the stateful flavor models in-place
 * canvas redraws.
 */
const {
  createSXR, setupAFRAME, teardownAFRAME, createComponentInstance,
  stubCreateElement, makeEntity,
} = require('./helpers');

describe('circle widgets', () => {
  let components;
  let createElementSpy;
  let tracked;

  beforeAll(() => {
    global.SXR = createSXR().SXR; // schema defaults need SXR at require time
    ({components} = setupAFRAME(['sxr-circle-loader', 'sxr-circle-timer']));
    require('../src/components/circle-loader.js');
    require('../src/components/circle-timer.js');
  });

  afterAll(() => {
    teardownAFRAME();
    delete global.SXR;
  });

  beforeEach(() => {
    createElementSpy = stubCreateElement({mock: true});
  });

  afterEach(() => {
    createElementSpy.mockRestore();
    delete window.timerCb;
    delete window.timerCb2;
  });

  const useRecreateSXR = () => {
    tracked = createSXR({redrawTextEntity: () => false});
    global.SXR = tracked.SXR;
    return tracked;
  };

  const useStatefulSXR = () => {
    tracked = createSXR({
      redrawTextEntity: (entity, options) => {
        if (!entity || !entity._sxrTextState) { return false; }
        entity._sxrTextState.value = options.value;
        return true;
      },
      createTextEntity: (options) => {
        const entity = makeEntity();
        entity._sxrTextState = {value: options.value};
        tracked.createdTextEntities.push(options);
        return entity;
      },
    });
    global.SXR = tracked.SXR;
    return tracked;
  };

  // ---- loader ---------------------------------------------------------------

  describe('circle-loader ring follows `loaded` (recreate flavor)', () => {
    beforeEach(() => { useRecreateSXR(); });

    test('update() refreshes theta-length from data.loaded', () => {
      const el = makeEntity();
      el.getAttribute = jest.fn(() => ({width: 1, height: 0.75}));
      const data = {
        loaded: 0.5, fontSize: 0.2, fontFamily: 'f.ttf',
        fontColor: '#F1F5F9', backgroundColor: '#202127', activeColor: '#2563EB',
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

  // ---- timer ------------------------------------------------------------------

  describe('circle-timer countdown (recreate flavor)', () => {
    beforeEach(() => { useRecreateSXR(); });

    const timerData = () => ({
      countDown: 10, fontSize: 0.2, fontFamily: 'f.ttf',
      fontColor: '#F1F5F9', borderColor: '#1B1B1F',
      backgroundColor: '#202127', activeColor: '#2563EB',
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

    test('counts down, updates ring arc, and fires callback on expiry', () => {
      const {instance, callback} = initTimer(timerData());
      const ring = instance.timerRing;

      instance.tick(0);
      expect(tracked.createdTextEntities[tracked.createdTextEntities.length - 1].value).toBe(10);
      expect(ring.attributes['theta-length']).toBe('0');

      instance.tick(5000);
      expect(tracked.createdTextEntities[tracked.createdTextEntities.length - 1].value).toBe(5);
      expect(ring.attributes['theta-length']).toBe('180');
      expect(callback).not.toHaveBeenCalled();

      instance.tick(9999);
      expect(tracked.createdTextEntities[tracked.createdTextEntities.length - 1].value).toBe(1);
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
      expect(tracked.createdTextEntities[tracked.createdTextEntities.length - 1].value).toBe(5);
      expect(callback).not.toHaveBeenCalled();

      instance.tick(6000); // new 5s window elapsed
      expect(callback).toHaveBeenCalledTimes(1);
    });
  });

  // ---- in-place redraw ------------------------------------------------------------

  describe('circle-timer ticks redraw in place (stateful flavor)', () => {
    beforeEach(() => { useStatefulSXR(); });

    test('per-second updates do not recreate the text entity', () => {
      const callback = jest.fn();
      window.timerCb2 = callback;
      const {instance} = createComponentInstance(
        'sxr-circle-timer', components['sxr-circle-timer'],
        {
          countDown: 10, fontSize: 0.2, fontFamily: 'f.ttf',
          fontColor: '#F1F5F9', borderColor: '#1B1B1F',
          backgroundColor: '#202127', activeColor: '#2563EB',
        },
        {
          getAttribute: jest.fn((name) => {
            if (name === 'sxr-item') return {width: 1, height: 0.75};
            if (name === 'sxr-interactable') return {clickAction: 'timerCb2'};
            return null;
          }),
        }
      );
      instance.init();

      instance.tick(0);
      instance.tick(1000);
      instance.tick(2000);
      instance.tick(3000);

      // one create at init, zero during countdown ticks
      expect(tracked.createdTextEntities).toHaveLength(1);
      expect(instance.textEntity._sxrTextState.value).toBe(7);
      expect(callback).not.toHaveBeenCalled();
    });
  });
});
