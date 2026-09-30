/**
 * Keyboard interaction:
 * - sxr-interactable singleton keydown registry (one shared listener)
 * - `key` binds independently of the legacy `key-code`; repeats/composition
 *   and editable targets are ignored
 * - focused keyboard operation per widget: Enter/Space on buttons and icon
 *   buttons, radio Space + group arrow navigation
 * - duplicate activation prevented when a widget's own shortcut fires
 */
const {
  createSXR, setupAFRAME, teardownAFRAME, createComponentInstance, fireKeyDown,
} = require('./helpers');

describe('keyboard interaction', () => {
  let components;
  let createElementSpy;

  beforeAll(() => {
    global.SXR = createSXR().SXR;
    ({components} = setupAFRAME(['sxr-interactable', 'sxr-button', 'sxr-icon-button', 'sxr-radio']));
    require('../src/components/interactable.js');
    require('../src/components/button.js');
    require('../src/components/icon-button.js');
    require('../src/components/radio.js');
  });

  afterAll(() => {
    teardownAFRAME();
    delete global.SXR;
  });

  beforeEach(() => {
    createElementSpy = jest.spyOn(document, 'createElement').mockImplementation(() => {
      const {makeEntity} = require('./helpers');
      return makeEntity();
    });
  });

  afterEach(() => {
    createElementSpy.mockRestore();
    delete window.buttonCb4;
    delete window.iconCb4;
  });

  // ---- singleton registry -------------------------------------------------

  const makeInteractable = (data) => {
    const {el, instance} = createComponentInstance(
      'sxr-interactable',
      components['sxr-interactable'],
      Object.assign({clickAction: '', hoverAction: '', keyCode: -1, key: ''}, data)
    );
    instance.init();
    return {el, instance};
  };

  test('fires clicks with a keyboard detail payload', () => {
    const clicks = [];
    const {el} = makeInteractable({keyCode: 32, key: ' '});
    el.emit = (name, detail) => clicks.push({name, detail});

    fireKeyDown(' ', 32);

    expect(clicks).toHaveLength(1);
    expect(clicks[0].name).toBe('click');
    expect(clicks[0].detail).toEqual({source: 'keyboard', key: ' ', keyCode: 32});
  });

  test('instances with keyCode <= 0 and no key are not registered', () => {
    const clicks = [];
    const {el} = makeInteractable({keyCode: -1});
    el.emit = (name, detail) => clicks.push({name, detail});

    fireKeyDown('a', 65);

    expect(clicks).toHaveLength(0);
  });

  test('update() re-syncs registration when the key changes', () => {
    const clicks = [];
    const {el, instance} = makeInteractable({keyCode: 32, key: ''});
    el.emit = (name, detail) => clicks.push({name, detail});

    fireKeyDown(' ', 32);
    expect(clicks).toHaveLength(1);

    // unbind: keyCode -1 and no textual key (emulated setAttribute flow)
    instance.el.setAttribute = function () {};
    instance.data.keyCode = -1;
    instance.update();

    fireKeyDown(' ', 32);
    expect(clicks).toHaveLength(1);

    // rebind on a different key
    instance.data.keyCode = 13;
    instance.update();
    fireKeyDown('Enter', 13);
    expect(clicks).toHaveLength(2);
  });

  test('a textual key binds independently of the legacy key-code', () => {
    const clicks = [];
    const {el, instance} = makeInteractable({keyCode: -1, key: 'e'});
    el.emit = (name, detail) => clicks.push({name, detail});

    fireKeyDown('e', 69);
    expect(clicks).toHaveLength(1);
    expect(clicks[0].detail).toEqual({source: 'keyboard', key: 'e', keyCode: 69});

    // other keys do not match
    fireKeyDown('Enter', 13);
    expect(clicks).toHaveLength(1);

    instance.remove();
    fireKeyDown('e', 69);
    expect(clicks).toHaveLength(1);
  });

  test('auto-repeated keydowns fire only once', () => {
    const clicks = [];
    const {el} = makeInteractable({keyCode: 32});
    el.emit = (name, detail) => clicks.push({name, detail});

    fireKeyDown(' ', 32, {repeat: true});

    expect(clicks).toHaveLength(0);
  });

  test('remove() unregisters the instance and releases the window listener', () => {
    const clicks = [];
    const first = makeInteractable({keyCode: 32});
    const second = makeInteractable({keyCode: 32});
    second.el.emit = (name) => clicks.push(name);

    first.instance.remove();
    fireKeyDown(' ', 32);
    expect(clicks).toEqual(['click']);

    second.instance.remove();
    fireKeyDown(' ', 32);
    expect(clicks).toEqual(['click']);
  });

  // ---- focused keyboard operation ------------------------------------------

  const buttonData = () => ({
    on: 'click', value: 'btn', fontSize: 0.2, fontFamily: 'f.ttf',
    fontColor: '#F1F5F9', borderColor: '#1B1B1F', focusColor: '#0EA5E9',
    backgroundColor: '#202127', hoverColor: '#0EA5E9', activeColor: '#2563EB',
    toggle: false, toggleState: false,
  });

  const initButton = (data, interactable) => {
    const {el, instance, listeners} = createComponentInstance(
      'sxr-button', components['sxr-button'], data,
      {
        getAttribute: jest.fn((name) => {
          if (name === 'sxr-item') {
            return {width: 2.5, height: 0.7, depth: 0.1, baseDepth: 0.025, gap: 0.1, bevel: false};
          }
          if (name === 'sxr-interactable') return interactable || {clickAction: ''};
          return null;
        }),
      }
    );
    instance.init();
    return {el, instance, listeners};
  };

  test('Enter/Space on a focused button emit its activation event once', () => {
    const emissions = [];
    const {el, listeners} = initButton(buttonData());
    el.addEventListener('click', (evt) => emissions.push(evt));

    listeners.keyup[0]({key: 'Enter', preventDefault: jest.fn()});
    listeners.keyup[0]({key: ' ', preventDefault: jest.fn()});
    expect(emissions.length).toBe(2);
  });

  test('auto-repeat and composition do not trigger activation', () => {
    const emissions = [];
    const {el, listeners} = initButton(buttonData());
    el.addEventListener('click', (evt) => emissions.push(evt));

    listeners.keyup[0]({key: 'Enter', repeat: true, preventDefault: jest.fn()});
    listeners.keyup[0]({key: 'Enter', isComposing: true, preventDefault: jest.fn()});
    listeners.keyup[0]({key: 'a', preventDefault: jest.fn()});
    expect(emissions.length).toBe(0);
  });

  test('a widget bound to the same key is not activated twice', () => {
    const emissions = [];
    const matchesEvent = (event) => event.keyCode === 32;
    // emulate the shortcut registry having already fired for Space
    const {el, listeners} = initButton(buttonData(), {
      clickAction: '',
      keyCode: 32,
      matchesEvent,
    });
    el.components['sxr-interactable'] = {matchesEvent};
    el.addEventListener('click', (evt) => emissions.push(evt));

    listeners.keyup[0]({key: ' ', keyCode: 32, preventDefault: jest.fn()});
    expect(emissions.length).toBe(0);
  });

  test('Enter/Space on a focused icon button emit its activation event', () => {
    const emissions = [];
    const data = {
      on: 'click', toggle: false, toggleState: false, icon: 'star',
      iconActive: '', iconFontSize: 0.4, iconFont: '', iconOcclusion: false,
      fontColor: '#F1F5F9', borderColor: '#1B1B1F', backgroundColor: '#202127',
      hoverColor: '#0EA5E9', activeColor: '#2563EB',
    };
    const {el, instance, listeners} = createComponentInstance(
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
    el.addEventListener('click', (evt) => emissions.push(evt));

    listeners.keyup[0]({key: ' ', preventDefault: jest.fn()});
    expect(emissions.length).toBe(1);

    instance.remove();
  });

  test('radio arrow navigation moves focus and selects the neighbor', () => {
    const data = {
      on: 'click', value: 'r1', group: 'g', active: true, toggle: false,
      toggleState: false, checked: false, radiosizecoef: 1, fontSize: 0.2,
      fontFamily: 'f.ttf', fontColor: '#161618', borderColor: '#1B1B1F',
      backgroundColor: '#F1F5F9', hoverColor: '#0EA5E9',
      activeColor: '#2563EB', handleColor: '#202127',
    };
    const {el, instance, listeners} = createComponentInstance(
      'sxr-radio', components['sxr-radio'], {...data}, {
        getAttribute: jest.fn((name) => {
          if (name === 'sxr-item') return {width: 2.5, height: 0.75};
          if (name === 'sxr-interactable') return {clickAction: ''};
          return null;
        }),
      }
    );
    const neighbor = {
      components: {'sxr-radio': {data: {group: 'g', on: 'click', active: true}}},
      focus: jest.fn(),
      emit: jest.fn(),
    };
    el.parentElement = {
      querySelectorAll: jest.fn(() => [el, neighbor]),
    };
    instance.init();

    listeners.keyup[0]({key: 'ArrowDown', preventDefault: jest.fn()});

    expect(neighbor.focus).toHaveBeenCalledTimes(1);
    expect(neighbor.emit).toHaveBeenCalledWith('click');
    expect(instance.data.checked).toBe(false); // selection happens on the neighbor
  });

  test('radio Space activates through its own event', () => {
    const data = {
      on: 'click', value: 'r1', group: '', active: true, toggle: false,
      toggleState: false, checked: false, radiosizecoef: 1, fontSize: 0.2,
      fontFamily: 'f.ttf', fontColor: '#161618', borderColor: '#1B1B1F',
      backgroundColor: '#F1F5F9', hoverColor: '#0EA5E9',
      activeColor: '#2563EB', handleColor: '#202127',
    };
    const {instance, listeners} = createComponentInstance(
      'sxr-radio', components['sxr-radio'], data, {
        getAttribute: jest.fn((name) => {
          if (name === 'sxr-item') return {width: 2.5, height: 0.75};
          if (name === 'sxr-interactable') return {clickAction: ''};
          return null;
        }),
      }
    );
    instance.init();

    listeners.keyup[0]({key: ' ', preventDefault: jest.fn()});
    expect(instance.data.checked).toBe(true);
  });
});
