/**
 * Native editing opt-in (a-sxr-input, native-editing="true"):
 * - activation focuses a synchronized hidden native field
 * - typing/selection/paste/composition sync the value and emit `input`
 * - Enter commits and emits `change`; teardown detaches the field
 * - appendText/delete still work; disabled mode preserves legacy behavior
 * - the native field is accessible (labelled) and is removed when native
 *   editing is switched off
 */
const {
  createSXR, setupAFRAME, teardownAFRAME, createComponentInstance,
  stubCreateElement,
} = require('./helpers');

describe('native editing opt-in (a-sxr-input)', () => {
  let components;
  let createElementSpy;

  beforeAll(() => {
    global.SXR = createSXR().SXR;
    ({components} = setupAFRAME(['sxr-input']));
    require('../src/components/input.js');
  });

  afterAll(() => {
    teardownAFRAME();
    delete global.SXR;
  });

  beforeEach(() => {
    // real <input> elements (focus/keydown), mock a-* entities
    createElementSpy = stubCreateElement({mock: true, real: ['input']});
  });

  afterEach(() => {
    createElementSpy.mockRestore();
  });

  const inputData = (overrides) => Object.assign({
    on: 'click', value: 'a', nativeEditing: true, fontSize: 0.2,
    fontFamily: 'f.ttf', fontColor: '#161618', borderColor: '#1B1B1F',
    borderHoverColor: '#0EA5E9', backgroundColor: '#F1F5F9', hoverColor: '#F1F5F9',
  }, overrides);

  const initInput = (data) => {
    const {el, instance, listeners} = createComponentInstance(
      'sxr-input', components['sxr-input'], data,
      {
        getAttribute: jest.fn((name) => {
          if (name === 'sxr-item') return {width: 2.5, height: 0.75};
          if (name === 'sxr-interactable') return {clickAction: ''};
          return null;
        }),
      }
    );
    instance.init();
    return {el, instance, listeners};
  };

  test('activation focuses a synchronized native field', () => {
    const {instance, listeners} = initInput(inputData());

    listeners.click[0]({});

    const field = instance.nativeField;
    expect(field).toBeTruthy();
    expect(document.body.contains(field)).toBe(true);
    expect(field.value).toBe('a');
    expect(document.activeElement).toBe(field);

    instance.remove();
  });

  test('native typing syncs the value and emits input', () => {
    const inputs = [];
    const {instance, listeners} = initInput(inputData());
    listeners.click[0]({});
    instance.el.addEventListener('input', (evt) => inputs.push(evt.detail));

    instance.nativeField.value = 'ab';
    instance._onNativeInput();

    expect(instance.data.value).toBe('ab');
    expect(inputs).toEqual([{value: 'ab', previousValue: 'a'}]);

    instance.remove();
  });

  test('Enter commits and emits change; teardown detaches the field', () => {
    const changes = [];
    const {instance, listeners} = initInput(inputData());
    listeners.click[0]({});
    instance.el.addEventListener('change', (evt) => changes.push(evt.detail));

    instance.nativeField.value = 'abc';
    instance._onNativeKeyDown({key: 'Enter', isComposing: false, preventDefault: jest.fn()});

    expect(instance.data.value).toBe('abc');
    expect(changes).toEqual([{value: 'abc'}]);

    const field = instance.nativeField;
    instance.remove();
    expect(document.body.contains(field)).toBe(false);
    expect(instance.nativeField).toBeNull();
  });

  test('appendText/delete still work and emit input', () => {
    const inputs = [];
    const {instance} = initInput(inputData());
    instance.el.addEventListener('input', (evt) => inputs.push(evt.detail.value));

    instance.appendText('b');
    expect(instance.data.value).toBe('ab');
    instance.delete();
    expect(instance.data.value).toBe('a');
    expect(inputs).toEqual(['ab', 'a']);

    instance.remove();
  });

  test('nativeEditing disabled preserves legacy behavior (no field)', () => {
    const {instance, listeners} = initInput(inputData({nativeEditing: false}));

    listeners.click[0]({});
    expect(instance.nativeField).toBeFalsy();

    instance.remove();
  });

  test('keyboard entry is accessible and turning native editing off removes the field', () => {
    const {el, instance, listeners} = initInput(inputData());
    listeners.keyup[0]({key: 'Enter', preventDefault() {}});
    const field = instance.nativeField;
    expect(document.activeElement).toBe(field);
    expect(field.getAttribute('aria-hidden')).not.toBe('true');
    expect(field.getAttribute('aria-label')).toBeTruthy();
    el.setAttribute('sxr-input', 'nativeEditing', false);
    expect(field.isConnected).toBe(false);
    expect(instance.nativeField).toBeNull();
    instance.remove();
  });
});
