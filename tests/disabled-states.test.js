/**
 * Disabled controls: active="false" blocks toggle/radio activation events
 * and click-action callbacks, suppresses hover animations, and keeps the
 * accessible states (aria-disabled / aria-checked) in sync.
 */
const {createSXR, setupAFRAME, teardownAFRAME, createComponentInstance} = require('./helpers');

describe('disabled controls (active="false")', () => {
  let components;

  beforeAll(() => {
    global.SXR = createSXR().SXR;
    ({components} = setupAFRAME(['sxr-toggle', 'sxr-radio']));
    require('../src/components/toggle.js');
    require('../src/components/radio.js');
  });

  afterAll(() => {
    teardownAFRAME();
    delete global.SXR;
  });

  const toggleData = (overrides) => Object.assign({
    on: 'click',
    value: 't',
    toggle: false,
    toggleState: false,
    active: false,
    checked: false,
    borderWidth: 1,
    fontSize: 0.2,
    fontFamily: 'f.ttf',
    fontColor: '#161618',
    borderColor: '#1B1B1F',
    backgroundColor: '#F1F5F9',
    hoverColor: '#0EA5E9',
    activeColor: '#2563EB',
    handleColor: '#F1F5F9',
  }, overrides);

  const initToggle = (data) => {
    const clickAction = jest.fn();
    window.toggleCb = clickAction;
    const {el, instance, listeners, data: liveData} = createComponentInstance(
      'sxr-toggle', components['sxr-toggle'], data,
      {
        getAttribute: jest.fn((name) => {
          if (name === 'sxr-item') return {width: 2.5, height: 0.75};
          if (name === 'sxr-interactable') return {clickAction: 'toggleCb'};
          return null;
        }),
      }
    );
    instance.init();
    return {el, instance, listeners, clickAction, data: liveData};
  };

  afterEach(() => { delete window.toggleCb; });

  test('disabled toggle ignores activation events and callbacks', () => {
    const {data, listeners, clickAction, el} = initToggle(toggleData());

    listeners.click[0]({});
    expect(data.checked).toBe(false);
    expect(clickAction).not.toHaveBeenCalled();
    expect(el.attributes['aria-disabled']).toBe('true');
  });

  test('disabled toggle keeps the checked state but no hover animation', () => {
    const data = toggleData();
    data.checked = true;
    const {listeners, el, instance} = initToggle(data);

    listeners.mouseenter[0]();
    const track = el.children[0];
    expect(track.attributes['animation__enter']).toBeUndefined();
    expect(el.attributes['aria-checked']).toBe('true');

    instance.remove();
  });

  test('enabled toggle still activates', () => {
    const {data, listeners, clickAction} = initToggle(toggleData({active: true}));

    listeners.click[0]({});
    expect(data.checked).toBe(true);
    expect(clickAction).toHaveBeenCalledTimes(1);
  });

  test('disabled radio ignores activation, callbacks, and group sync', () => {
    const clickAction = jest.fn();
    window.radioCb = clickAction;
    const data = {
      on: 'click', value: 'r', group: 'g', active: false, toggle: false,
      toggleState: false, checked: false, radiosizecoef: 1, fontSize: 0.2,
      fontFamily: 'f.ttf', fontColor: '#161618', borderColor: '#1B1B1F',
      backgroundColor: '#F1F5F9', hoverColor: '#0EA5E9',
      activeColor: '#2563EB', handleColor: '#202127',
    };
    const {el, instance, listeners} = createComponentInstance(
      'sxr-radio', components['sxr-radio'], data,
      {
        getAttribute: jest.fn((name) => {
          if (name === 'sxr-item') return {width: 2.5, height: 0.75};
          if (name === 'sxr-interactable') return {clickAction: 'radioCb'};
          return null;
        }),
      }
    );
    const uncheck = jest.fn();
    el.parentElement = {
      querySelectorAll: jest.fn(() => [
        el,
        {components: {'sxr-radio': {data: {group: 'g', active: true}}}, emit: uncheck},
      ]),
    };
    instance.init();

    listeners.click[0]({});

    expect(data.checked).toBe(false);
    expect(clickAction).not.toHaveBeenCalled();
    expect(uncheck).not.toHaveBeenCalled();
    expect(el.attributes['aria-disabled']).toBe('true');
    delete window.radioCb;
  });
});
