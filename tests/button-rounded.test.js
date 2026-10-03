const {
  createSXR, setupAFRAME, teardownAFRAME, createComponentInstance,
  stubCreateElement,
} = require('./helpers');

describe('rounded buttons', () => {
  let components;
  let createElementSpy;
  let removedEntities;

  beforeAll(() => {
    global.THREE = require('three');
    ({components} = setupAFRAME(['sxr-item', 'sxr-button', 'bevelbox']));
    require('../src/components/item.js');
    require('../src/components/bevelbox.js');
    // The button schema reads the shared theme during registration.
    global.SXR = createSXR().SXR;
    require('../src/components/button.js');
  });

  beforeEach(() => {
    const sxr = createSXR();
    global.SXR = sxr.SXR;
    removedEntities = sxr.removedEntities;
    createElementSpy = stubCreateElement({mock: true});
  });

  afterEach(() => {
    createElementSpy.mockRestore();
    delete window.roundedButtonAction;
  });

  afterAll(() => {
    teardownAFRAME();
    delete global.SXR;
    delete global.THREE;
  });

  function defaults(name) {
    return Object.fromEntries(Object.entries(components[name].schema)
      .map(([key, property]) => [key, property.default]));
  }

  function makeButton(itemOverrides = {}, buttonOverrides = {}) {
    const item = {
      ...defaults('sxr-item'), width: 2, height: 0.6, depth: 0.1,
      baseDepth: 0.025, gap: 0.1, ...itemOverrides,
    };
    const button = createComponentInstance('sxr-button', components['sxr-button'], {
      ...defaults('sxr-button'), value: 'Continue', ...buttonOverrides,
    }, {
      getAttribute: (name) => name === 'sxr-item' ? item :
        name === 'sxr-interactable' ? {clickAction: 'roundedButtonAction'} : null,
    });
    button.instance.init();
    return {...button, item};
  }

  // Use real Three.js extrusion and raycasting to check the resulting shape,
  // rather than only checking which attributes the button writes.
  function inspectMesh(entity, inspect) {
    const box = createComponentInstance('bevelbox', components.bevelbox, {
      ...defaults('bevelbox'), ...entity.attributes.bevelbox,
    });
    box.instance.init();
    const mesh = box.el.getObject3D('mesh');
    mesh.geometry.computeBoundingBox();
    mesh.updateMatrixWorld(true);
    try {
      inspect(mesh);
    } finally {
      box.instance.remove();
    }
  }

  test.each([0.12, 100])('radius %s produces a bounded rounded outline and preserves depth', (radius) => {
    const {instance, item, el} = makeButton({radius});
    inspectMesh(instance.buttonContainer, mesh => {
      const bounds = mesh.geometry.boundingBox;
      expect(bounds.max.x - bounds.min.x).toBeCloseTo(item.width);
      expect(bounds.max.y - bounds.min.y).toBeCloseTo(item.height);
      expect(bounds.min.z).toBeCloseTo(0);
      expect(bounds.max.z).toBeCloseTo(item.baseDepth);

      const ray = new THREE.Raycaster(new THREE.Vector3(0, 0, 1), new THREE.Vector3(0, 0, -1));
      expect(ray.intersectObject(mesh).length).toBeGreaterThan(0);
      ray.ray.origin.set(item.width / 2 - 0.001, item.height / 2 - 0.001, 1);
      expect(ray.intersectObject(mesh)).toHaveLength(0);
    });
    inspectMesh(instance.buttonEntity, mesh => {
      const bounds = mesh.geometry.boundingBox;
      expect(bounds.max.x - bounds.min.x).toBeCloseTo(item.width - item.gap);
      expect(bounds.max.y - bounds.min.y).toBeCloseTo(item.height - item.gap);
      expect(bounds.max.z).toBeCloseTo(item.depth);
    });
    expect(instance.buttonEntity.attributes.bevelbox.topLeftRadius)
      .toBeCloseTo(Math.min(radius, item.height / 2) - item.gap / 2);
    expect(instance.textEntity.attributes.position).toBe(`0 0 ${item.depth + 0.05}`);
    expect(instance.buttonBacking.attributes.rounded.radius).toBeLessThanOrEqual(item.height / 2);
    expect(el.attributes.geometry).toContain('primitive: plane;');
    expect(el.attributes.material).toContain('opacity: 0;');
    expect(el.attributes.material).toContain('depthWrite: false;');
  });

  test.each([0, -1, NaN, Infinity, -Infinity])('radius %s retains the square button', radius => {
    const {instance, el} = makeButton({radius});
    expect(instance.buttonBacking).toBeUndefined();
    expect(instance.buttonContainer.attributes.geometry).toContain('primitive: box;');
    expect(instance.buttonEntity.attributes.geometry).toContain('primitive: box;');
    expect(el.attributes.material).toContain('opacity: 0.5;');
    expect(el.attributes.material).toContain('depthWrite: true;');
    expect(instance.buttonEntity.attributes.position).toBe('0 0 0.05');
    expect(instance.textEntity.attributes.position).toBe('0 0 0.1');
  });

  test('a radius smaller than the border inset leaves a valid square face', () => {
    const {instance} = makeButton({radius: 0.01});
    expect(instance.buttonEntity.attributes.bevelbox.topLeftRadius).toBe(0);
    inspectMesh(instance.buttonEntity, mesh => {
      expect(Array.from(mesh.geometry.attributes.position.array).every(Number.isFinite)).toBe(true);
      const ray = new THREE.Raycaster(new THREE.Vector3(0, 0, 1), new THREE.Vector3(0, 0, -1));
      expect(ray.intersectObject(mesh).length).toBeGreaterThan(0);
    });
  });

  test('rounded bevels preserve their existing origin and label placement', () => {
    const {instance, item} = makeButton({radius: 100, bevel: true});
    for (const entity of [instance.buttonContainer, instance.buttonEntity]) {
      expect(entity.attributes.position).toBe('0 0 0');
      expect(Object.values(entity.attributes.bevelbox).every(Number.isFinite)).toBe(true);
    }
    expect(instance.buttonContainer.attributes.bevelbox.topLeftRadius)
      .toBeCloseTo(item.height * (1 - item.bevelSize) / 2);
    expect(instance.textEntity.attributes.position)
      .toBe(`0 0 ${item.depth + item.bevelThickness / 2 + 0.05}`);
  });

  test('live radius changes dispose the old backing and retain focus, toggle and keyboard activation', () => {
    window.roundedButtonAction = jest.fn();
    const {instance, el, item, listeners} = makeButton({}, {toggle: true, toggleState: true});
    el.emit('focus');
    item.radius = 0.12;
    el.emit('componentchanged', {name: 'sxr-item', newData: item});
    expect(instance.buttonContainer.attributes.material).toContain(instance.data.focusColor);
    expect(instance.buttonEntity.attributes.material).toContain(instance.data.activeColor);
    const oldBacking = instance.buttonBacking;
    const oldFace = instance.buttonEntity;
    item.height = 0.2;
    el.emit('componentchanged', {name: 'sxr-item', newData: item});
    expect(removedEntities).toContain(oldBacking);
    expect(removedEntities).toContain(oldFace);
    expect(instance.buttonBacking.attributes.rounded.radius).toBeCloseTo(0.1);

    const keyEvent = {key: 'Enter', preventDefault: jest.fn()};
    listeners.keyup[0](keyEvent);
    expect(instance.data.toggleState).toBe(false);
    expect(window.roundedButtonAction).toHaveBeenCalledTimes(1);
    expect(keyEvent.preventDefault).toHaveBeenCalledTimes(1);
    el.emit('mouseenter');
    el.emit('mouseleave');

    const roundedBacking = instance.buttonBacking;
    item.radius = 0;
    el.emit('componentchanged', {name: 'sxr-item', newData: item});
    expect(removedEntities).toContain(roundedBacking);
    expect(instance.buttonBacking).toBeNull();
    expect(instance.buttonEntity.attributes.geometry).toContain('primitive: box;');
    expect(instance.textEntity.attributes.position).toBe('0 0 0.1');
    instance.remove();
    expect(el.children).toHaveLength(0);
  });
});
