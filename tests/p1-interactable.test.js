/**
 * P1 regression tests: sxr-interactable singleton keyboard registry.
 * - one shared window keydown listener instead of one per widget
 * - keyboard clicks carry a detail payload (source/key/keyCode)
 * - update() re-syncs registration when key/keyCode changes
 * - remove() unregisters and releases the window listener
 */
const {createComponentInstance} = require('./helpers');

const fireKeyDown = (key, keyCode) => {
  const event = new window.Event('keydown');
  event.key = key;
  event.keyCode = keyCode;
  window.dispatchEvent(event);
};

describe('sxr-interactable keyboard registry', () => {
  let component;

  beforeAll(() => {
    global.AFRAME = {
      registerComponent: jest.fn((name, definition) => {
        if (name === 'sxr-interactable') component = definition;
      }),
      registerPrimitive: jest.fn(),
      components: {},
    };
    require('../src/components/interactable.js');
  });

  afterAll(() => {
    delete global.AFRAME;
  });

  const makeInteractable = (data) => {
    const {el, instance, listeners} = createComponentInstance(
      'sxr-interactable',
      component,
      Object.assign({clickAction: '', hoverAction: '', keyCode: -1, key: ''}, data)
    );
    instance.init();
    return {el, instance, listeners};
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

  test('instances with keyCode <= 0 are not registered', () => {
    const clicks = [];
    const {el} = makeInteractable({keyCode: -1});
    el.emit = (name, detail) => clicks.push({name, detail});

    fireKeyDown('a', 65);

    expect(clicks).toHaveLength(0);
  });

  test('update() re-syncs registration when the key changes', () => {
    const clicks = [];
    const {el, instance} = makeInteractable({keyCode: 32, key: ' '});
    el.emit = (name, detail) => clicks.push({name, detail});

    fireKeyDown(' ', 32);
    expect(clicks).toHaveLength(1);

    // unbind: keyCode -1 (emulated setAttribute flow)
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

  test('remove() unregisters the instance and releases the window listener', () => {
    const first = makeInteractable({keyCode: 32});
    const second = makeInteractable({keyCode: 32});
    const clicks = [];
    second.el.emit = (name) => clicks.push(name);

    first.instance.remove();
    fireKeyDown(' ', 32);
    expect(clicks).toEqual(['click']);

    second.instance.remove();
    fireKeyDown(' ', 32);
    expect(clicks).toEqual(['click']);
  });
});
