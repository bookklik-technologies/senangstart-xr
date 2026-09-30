/**
 * Core widgets (toggle, button, icon buttons, radio, input, label, progress
 * bar):
 * - state flows through setAttribute -> update(oldData); visuals follow
 * - in-place redraw preference: toggles/icons swap on the existing
 *   canvas/texture instead of recreating entities
 * - keyboard handler only swallows Enter/Space; radio group semantics
 * - remove() detaches listeners and removes every component-owned child
 * - update() diffing: unrelated property changes do not re-render
 * - progress bar renders the configured percentage
 */
const {
  createSXR, setupAFRAME, teardownAFRAME, createComponentInstance,
  stubCreateElement, makeEntity,
} = require('./helpers');

describe('core widgets', () => {
  let components;
  let createElementSpy;
  let createdTextEntities;
  let createdIconEntities;
  let removedEntities;

  beforeAll(() => {
    // stateful redraw mocks mirror the real vars.js behavior: same-box
    // redraws happen in place, entities are only recreated on size changes
    const sxr = createSXR({
      redrawTextEntity: (entity, options) => {
        if (!entity || !entity._sxrTextState) { return false; }
        entity._sxrTextState.value = options.value;
        return true;
      },
      createTextEntity: (options) => {
        const entity = makeEntity();
        entity._sxrTextState = {value: options.value};
        createdTextEntities.push(options);
        return entity;
      },
      redrawIconEntity: (entity, options) => {
        if (!entity || !entity._sxrIconState) { return false; }
        entity._sxrIconState.icon = options.icon;
        return true;
      },
      createIconEntity: (options) => {
        const entity = makeEntity();
        entity._sxrIconState = {icon: options.icon};
        createdIconEntities.push(options);
        return entity;
      },
    });
    createdTextEntities = sxr.createdTextEntities;
    createdIconEntities = sxr.createdIconEntities;
    removedEntities = sxr.removedEntities;
    global.SXR = sxr.SXR;
    global.THREE = {
      Vector3: class {
        constructor() { this.x = 0; this.y = 0; this.z = 0; }
        copy(v) { this.x = v.x; this.y = v.y; this.z = v.z; return this; }
      },
    };
    ({components} = setupAFRAME([
      'sxr-toggle', 'sxr-button', 'sxr-icon-button', 'sxr-radio',
      'sxr-input', 'sxr-label', 'sxr-progressbar', 'sxr-item',
    ]));
    require('../src/components/toggle.js');
    require('../src/components/button.js');
    require('../src/components/icon-button.js');
    require('../src/components/radio.js');
    require('../src/components/input.js');
    require('../src/components/label.js');
    require('../src/components/progress-bar.js');
    require('../src/components/item.js');
  });

  afterAll(() => {
    teardownAFRAME();
    delete global.SXR;
    delete global.THREE;
  });

  beforeEach(() => {
    createdTextEntities.length = 0;
    createdIconEntities.length = 0;
    removedEntities.length = 0;
    createElementSpy = stubCreateElement({mock: true});
  });

  afterEach(() => {
    createElementSpy.mockRestore();
    delete window.toggleCb;
    delete window.buttonCb;
    delete window.iconCb;
    delete window.radioCb;
  });

  // ---- toggle -----------------------------------------------------------------

  describe('toggle state via setAttribute', () => {
    const toggleData = () => ({
      on: 'click', value: 't', toggle: false, toggleState: false, active: true,
      checked: false, borderWidth: 1, fontSize: 0.2, fontFamily: 'f.ttf',
      fontColor: '#161618', borderColor: '#1B1B1F', backgroundColor: '#F1F5F9',
      hoverColor: '#0EA5E9', activeColor: '#2563EB', handleColor: '#F1F5F9',
    });

    const initToggle = (data) => {
      const clickAction = jest.fn();
      window.toggleCb = clickAction;
      const {el, instance, listeners} = createComponentInstance(
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
      return {el, instance, data, listeners, clickAction, track: el.children[0], handle: el.children[0].children[0]};
    };

    test('click checks via setAttribute and update() applies the visuals', () => {
      const {data, listeners, clickAction, track, handle} = initToggle(toggleData());

      listeners.click[0]({});

      expect(data.checked).toBe(true);
      expect(track.attributes['animation__colorIn']).toBeDefined();
      expect(handle.attributes['animation__positionIn']).toBeDefined();
      expect(clickAction).toHaveBeenCalledTimes(1);
    });

    test('second click unchecks; check/uncheck events drive the same visuals', () => {
      const {data, listeners, track} = initToggle(toggleData());

      listeners.click[0]({});
      listeners.click[0]({});
      expect(data.checked).toBe(false);
      expect(track.attributes['animation__colorOut']).toBeDefined();

      listeners.check[0]();
      expect(data.checked).toBe(true);

      listeners.uncheck[0]();
      expect(data.checked).toBe(false);
    });

    test('declares switch role and tabindex', () => {
      const {el} = initToggle(toggleData());
      expect(el.attributes.role).toBe('switch');
      expect(el.attributes.tabindex).toBe('0');
    });
  });

  // ---- button -----------------------------------------------------------------

  describe('button behavior', () => {
    const buttonData = () => ({
      on: 'click', value: 'btn', fontSize: 0.2, fontFamily: 'f.ttf',
      fontColor: '#F1F5F9', borderColor: '#1B1B1F', focusColor: '#0EA5E9',
      backgroundColor: '#202127', hoverColor: '#0EA5E9', activeColor: '#2563EB',
      toggle: false, toggleState: false,
    });

    const initButton = (data) => {
      const clickAction = jest.fn();
      window.buttonCb = clickAction;
      const {el, instance, listeners} = createComponentInstance(
        'sxr-button', components['sxr-button'], data,
        {
          getAttribute: jest.fn((name) => {
            if (name === 'sxr-item') {
              return {width: 2.5, height: 0.7, depth: 0.1, baseDepth: 0.025, gap: 0.1, bevel: false};
            }
            if (name === 'sxr-interactable') return {clickAction: 'buttonCb'};
            return null;
          }),
        }
      );
      instance.init();
      return {el, instance, listeners, clickAction, buttonEntity: el.children[1], data};
    };

    test('click triggers the active flash and callback', () => {
      const {listeners, clickAction, buttonEntity} = initButton(buttonData());

      listeners.click[0]({});

      expect(buttonEntity.attributes['animation__click']).toBeDefined();
      expect(clickAction).toHaveBeenCalledTimes(1);
    });

    test('toggle-mode setActiveState syncs the attribute', () => {
      const data = buttonData();
      data.toggle = true;
      const {instance, el, buttonEntity} = initButton(data);

      instance.setActiveState(true);

      expect(el.attributes['sxr-button']).toBe('true');
      expect(buttonEntity.attributes.material).toBe('#2563EB');
    });

    test('update() refreshes resting colors without touching geometry', () => {
      const {el, instance, data} = initButton(buttonData());

      const geometryBefore = el.attributes.geometry;
      const buttonEntity = el.children[1];

      data.backgroundColor = '#111111';
      instance.update({backgroundColor: '#202127'});

      // geometry untouched, resting color refreshed from the new data
      expect(el.attributes.geometry).toBe(geometryBefore);
      expect(buttonEntity.attributes.material).toContain('#111111');
    });
  });

  // ---- icon buttons -------------------------------------------------------------

  describe('iconActive on toggle icon buttons', () => {
    test('active icon is applied in place while toggleState is on', () => {
      const clickAction = jest.fn();
      window.iconCb = clickAction;
      const data = {
        on: 'click', toggle: true, toggleState: false, icon: 'star',
        iconActive: 'star-active', iconFontSize: 0.4, iconFont: '',
        iconOcclusion: false, fontColor: '#F1F5F9', borderColor: '#1B1B1F',
        backgroundColor: '#202127', hoverColor: '#0EA5E9', activeColor: '#2563EB',
      };
      const {el, instance, listeners} = createComponentInstance(
        'sxr-icon-button', components['sxr-icon-button'], data,
        {
          getAttribute: jest.fn((name) => {
            if (name === 'sxr-item') return {width: 1, height: 1};
            if (name === 'sxr-interactable') return {clickAction: 'iconCb'};
            return null;
          }),
        }
      );
      instance.init();

      expect(createdIconEntities).toHaveLength(1);
      expect(instance.iconEntity._sxrIconState.icon).toBe('star');

      listeners.click[0]({});
      expect(data.toggleState).toBe(true);
      expect(instance.iconEntity._sxrIconState.icon).toBe('star-active');
      expect(createdIconEntities).toHaveLength(1); // redrawn in place, not recreated
      expect(el.attributes['sxr-icon-button']).toBe('true');

      // toggling back swaps to the base icon
      listeners.click[0]({});
      expect(instance.iconEntity._sxrIconState.icon).toBe('star');
      expect(createdIconEntities).toHaveLength(1);

      instance.remove();
      expect(removedEntities.length).toBeGreaterThanOrEqual(1);
    });
  });

  // ---- radio ---------------------------------------------------------------------

  describe('radio group semantics', () => {
    const radioData = () => ({
      on: 'click', value: 'r', group: '', active: true, toggle: false,
      toggleState: false, checked: false, radiosizecoef: 1, fontSize: 0.2,
      fontFamily: 'f.ttf', fontColor: '#161618', borderColor: '#1B1B1F',
      backgroundColor: '#F1F5F9', hoverColor: '#0EA5E9',
      activeColor: '#2563EB', handleColor: '#202127',
    });

    const initRadio = (data) => {
      const clickAction = jest.fn();
      window.radioCb = clickAction;
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
      instance.init();
      const radioBox = el.children[0];
      const radioCenter = radioBox.children[1];
      return {data, listeners, clickAction, radioCenter};
    };

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

  // ---- input ---------------------------------------------------------------------

  describe('input redraws per keystroke', () => {
    const inputData = () => ({
      on: 'click', value: 'a', nativeEditing: false, fontSize: 0.2,
      fontFamily: 'f.ttf', fontColor: '#161618', borderColor: '#1B1B1F',
      borderHoverColor: '#0EA5E9', backgroundColor: '#F1F5F9', hoverColor: '#F1F5F9',
    });

    test('appendText reuses the same text entity', () => {
      const {el, instance, data} = createComponentInstance(
        'sxr-input', components['sxr-input'], inputData(),
        {
          getAttribute: jest.fn((name) => {
            if (name === 'sxr-item') return {width: 2.5, height: 0.75};
            if (name === 'sxr-interactable') return {clickAction: ''};
            return null;
          }),
        }
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

      void el;
    });
  });

  // ---- label ---------------------------------------------------------------------

  describe('label update diffing', () => {
    const labelData = () => ({
      value: 'hi', align: 'center', anchor: 'center', fontSize: 0.2,
      lineHeight: 0.2, letterSpacing: 0, fontFamily: 'f.ttf',
      fontColor: '#F1F5F9', backgroundColor: '#202127', opacity: 1.0,
      textDepth: 0.01, textOcclusion: false, textStrokeColor: '',
      textStrokeWidth: -1,
    });

    test('unrelated property change does not re-render text or background', () => {
      const {el, instance, data} = createComponentInstance(
        'sxr-label', components['sxr-label'], labelData(),
        {
          getAttribute: jest.fn((name) => {
            if (name === 'sxr-item') return {width: 2.5, height: 0.75};
            return null;
          }),
        }
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

      void el;
    });
  });

  // ---- progress bar ----------------------------------------------------------------

  describe('progress bar', () => {
    test('renders the configured initial percentage', () => {
      const children = [];
      const el = makeEntity();
      el.getAttribute = jest.fn(() => ({width: 0.78, height: 0.2}));
      el.appendChild = (child) => children.push(child);
      const instance = {
        el,
        data: {activeColor: '#2563EB', backgroundColor: '#202127', percent: 0.5},
        updateProgress: components['sxr-progressbar'].updateProgress,
      };

      components['sxr-progressbar'].init.call(instance);

      expect(children[0].attributes.geometry).toContain('width: 0.39;');
      expect(children[0].attributes.position).toBe('-0.195 0 0.01');
    });
  });

  // ---- schema ----------------------------------------------------------------------

  test('sxr-item type has an empty-string default', () => {
    expect(components['sxr-item'].schema.type.default).toBe('');
  });
});
