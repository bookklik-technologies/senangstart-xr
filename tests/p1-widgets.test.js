/**
 * P1 regression tests:
 * - R11: toggle/button state flows through setAttribute (DOM attr stays in
 *   sync, visuals applied from update())
 * - R13: button keyboard handler only swallows Enter/Space
 * - R14: iconActive is applied on toggled icon buttons
 * - R10: remove() detaches listeners (verified via helpers registry)
 * - flex-container row layout math + null child guards
 */
const {makeEntity, createComponentInstance} = require('./helpers');

describe('P1 widget behavior', () => {
  let components;
  let createdTextEntities;
  let createdIconEntities;
  let removedEntities;
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
    redrawTextEntity: () => false,
    redrawIconEntity: () => false,
    createTextEntity: (options) => {
      createdTextEntities.push(options);
      return makeEntity();
    },
    createIconEntity: (options) => {
      createdIconEntities.push(options);
      return makeEntity();
    },
    removeEntity: (entity) => {
      removedEntities.push(entity);
    },
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
    require('../src/components/toggle.js');
    require('../src/components/button.js');
    require('../src/components/icon-button.js');
    require('../src/components/flex-container.js');
  });

  afterAll(() => {
    delete global.AFRAME;
    delete global.SXR;
    delete global.MutationObserver;
  });

  beforeEach(() => {
    createdTextEntities = [];
    createdIconEntities = [];
    removedEntities = [];
    createElementSpy = jest.spyOn(document, 'createElement').mockImplementation(makeEntity);
    global.MutationObserver = class {
      observe() {}
      disconnect() {}
    };
  });

  afterEach(() => {
    createElementSpy.mockRestore();
  });

  describe('R11: toggle state via setAttribute', () => {
    const toggleData = () => ({
      on: 'click',
      value: 't',
      toggle: false,
      toggleState: false,
      active: true,
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
    });

    const initToggle = (data) => {
      const clickAction = jest.fn();
      window.toggleCb = clickAction;
      const {el, instance, listeners} = createComponentInstance(
        'sxr-toggle',
        components['sxr-toggle'],
        data,
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

    afterEach(() => {
      delete window.toggleCb;
    });

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

    test('remove() detaches its listeners', () => {
      const {listeners, instance} = initToggle(toggleData());
      expect(listeners.click).toHaveLength(1);
      instance.remove();
      expect(listeners.click).toHaveLength(0);
      expect(removedEntities).toHaveLength(1);
    });
  });

  describe('R13: button keyboard behavior', () => {
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

    const initButton = (data) => {
      const clickAction = jest.fn();
      window.buttonCb = clickAction;
      const {el, instance, listeners} = createComponentInstance(
        'sxr-button',
        components['sxr-button'],
        data,
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
      return {el, instance, listeners, clickAction, buttonEntity: el.children[1]};
    };

    afterEach(() => {
      delete window.buttonCb;
    });

    test('click triggers the active flash and callback', () => {
      const {listeners, clickAction, buttonEntity} = initButton(buttonData());

      listeners.click[0]({});

      expect(buttonEntity.attributes['animation__click']).toBeDefined();
      expect(clickAction).toHaveBeenCalledTimes(1);
    });

    test('keyup only reacts to Enter/Space and only preventDefault those', () => {
      const {listeners, clickAction} = initButton(buttonData());

      const otherKey = {key: 'a', isComposing: false, keyCode: 65, preventDefault: jest.fn()};
      listeners.keyup[0](otherKey);
      expect(otherKey.preventDefault).not.toHaveBeenCalled();
      expect(clickAction).not.toHaveBeenCalled();

      const enter = {key: 'Enter', isComposing: false, keyCode: 13, preventDefault: jest.fn()};
      listeners.keyup[0](enter);
      expect(enter.preventDefault).toHaveBeenCalled();
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

    test('remove() detaches its listeners and disposes text', () => {
      const {listeners, instance} = initButton(buttonData());
      expect(listeners.click).toHaveLength(1);
      expect(listeners.keyup).toHaveLength(1);
      instance.remove();
      expect(listeners.click).toHaveLength(0);
      expect(listeners.keyup).toHaveLength(0);
      expect(removedEntities).toHaveLength(1);
    });
  });

  describe('R14: iconActive on toggle icon buttons', () => {
    test('active icon is used while toggleState is on', () => {
      const clickAction = jest.fn();
      window.iconCb = clickAction;
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
      const {el, instance, listeners} = createComponentInstance(
        'sxr-icon-button',
        components['sxr-icon-button'],
        data,
        {
          getAttribute: jest.fn((name) => {
            if (name === 'sxr-item') return {width: 1, height: 1};
            if (name === 'sxr-interactable') return {clickAction: 'iconCb'};
            return null;
          }),
        }
      );
      instance.init();

      expect(createdIconEntities[0].icon).toBe('star');

      listeners.click[0]({});
      expect(createdIconEntities[createdIconEntities.length - 1].icon).toBe('star-active');
      expect(el.attributes['sxr-icon-button']).toBe('true');

      // toggling back swaps to the base icon
      listeners.click[0]({});
      expect(createdIconEntities[createdIconEntities.length - 1].icon).toBe('star');

      instance.remove();
      expect(removedEntities.length).toBeGreaterThanOrEqual(1);
      delete window.iconCb;
    });
  });

  describe('flex-container layout', () => {
    const flexData = () => ({
      flexDirection: 'row',
      justifyContent: 'flexStart',
      alignItems: 'flexStart',
      itemPadding: 0.0,
      opacity: 0.0,
      isTopContainer: false,
      panelColor: '#202127',
      panelRounded: 0.05,
      styles: {
        fontFamily: 'f.ttf',
        fontColor: '#F1F5F9',
        borderColor: '#1B1B1F',
        backgroundColor: '#202127',
        hoverColor: '#0EA5E9',
        activeColor: '#2563EB',
        handleColor: '#F1F5F9',
      },
    });

    const makeChild = (guiItem) => {
      const child = makeEntity();
      child.getAttribute = jest.fn((name) => (name === 'sxr-item' ? guiItem : null));
      return child;
    };

    const initFlex = (data, children) => {
      const {el, instance} = createComponentInstance(
        'sxr-flex-container',
        components['sxr-flex-container'],
        data,
        {
          getAttribute: jest.fn((name) => (name === 'sxr-item' ? {width: 4, height: 2} : null)),
          getChildEntities: jest.fn(() => children),
        }
      );
      instance.init();
      return {el, instance};
    };

    test('row + flexStart lays children left-to-right from the top', () => {
      const childA = makeChild({width: 1, height: 0.5, margin: {x: 0, y: 0, z: 0, w: 0}, type: 'label'});
      const childB = makeChild({width: 1, height: 0.5, margin: {x: 0, y: 0, z: 0, w: 0}, type: 'label'});

      initFlex(flexData(), [childA, childB]);

      expect(childA.attributes.position).toBe('-1.5 0.5 0.01');
      expect(childB.attributes.position).toBe('-0.5 0.5 0.01');
    });

    test('row + center centers the row', () => {
      const data = flexData();
      data.justifyContent = 'center';
      const childA = makeChild({width: 1, height: 0.5, margin: {x: 0, y: 0, z: 0, w: 0}, type: 'label'});
      const childB = makeChild({width: 1, height: 0.5, margin: {x: 0, y: 0, z: 0, w: 0}, type: 'label'});

      initFlex(data, [childA, childB]);

      // row width = 2, cursorX = (4 - 2)/2 = 1
      expect(childA.attributes.position).toBe('-0.5 0.5 0.01');
      expect(childB.attributes.position).toBe('0.5 0.5 0.01');
    });

    test('children without sxr-item are skipped without crashing', () => {
      const plain = makeEntity(); // no sxr-item (getAttribute returns null)
      const child = makeChild({width: 1, height: 0.5, margin: {x: 0, y: 0, z: 0, w: 0}, type: 'label'});

      expect(() => initFlex(flexData(), [plain, child])).not.toThrow();
      expect(child.attributes.position).toBe('-1.5 0.5 0.01');
    });

    test('remove() clears the panel background', () => {
      const data = flexData();
      data.isTopContainer = true;
      data.opacity = 0.7;
      const parent = makeEntity();
      const {el, instance} = createComponentInstance(
        'sxr-flex-container',
        components['sxr-flex-container'],
        data,
        {
          getAttribute: jest.fn((name) => {
            if (name === 'sxr-item') return {width: 4, height: 2};
            if (name === 'position') return {x: 0, y: 0, z: 0};
            if (name === 'rotation') return {x: 0, y: 0, z: 0};
            return null;
          }),
          getChildEntities: jest.fn(() => []),
          parentNode: parent,
        }
      );
      instance.init();
      const panel = instance.panelBackground;
      expect(panel).toBeDefined();
      expect(parent.children).toContain(panel);

      instance.remove();
      expect(removedEntities).toContain(panel);
      expect(instance.panelBackground).toBeNull();
    });
  });
});
