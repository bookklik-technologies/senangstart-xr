/**
 * bevelbox:
 * - init extrudes the rounded shape and attaches it as the `mesh` object3D
 * - update() disposes the previous geometry/material and attaches a new mesh
 * - remove() disposes GPU resources exactly once and clears the object3D
 */
const {
  createSXR, setupAFRAME, teardownAFRAME, createComponentInstance,
  stubCreateElement,
} = require('./helpers');

describe('bevelbox', () => {
  let components;
  let createElementSpy;
  let disposedGeometries;

  beforeAll(() => {
    global.SXR = createSXR().SXR;
    disposedGeometries = [];
    global.THREE = {
      Shape: jest.fn(function () {
        this.moveTo = jest.fn();
        this.lineTo = jest.fn();
        this.quadraticCurveTo = jest.fn();
      }),
      ExtrudeGeometry: jest.fn(function () {
        this.dispose = jest.fn(() => disposedGeometries.push(this));
      }),
      Mesh: jest.fn(function (geometry, material) {
        this.geometry = geometry;
        this.material = material;
      }),
      MeshStandardMaterial: jest.fn(function () { this.dispose = jest.fn(); }),
      DoubleSide: 'DoubleSide',
    };
    ({components} = setupAFRAME(['bevelbox']));
    require('../src/components/bevelbox.js');
  });

  afterAll(() => {
    teardownAFRAME();
    delete global.SXR;
    delete global.THREE;
  });

  beforeEach(() => {
    disposedGeometries.length = 0;
    createElementSpy = stubCreateElement({mock: true});
  });

  afterEach(() => {
    createElementSpy.mockRestore();
  });

  const boxData = (overrides) => Object.assign({
    width: 1, height: 1, depth: 1,
    topLeftRadius: 0.00001, topRightRadius: 0.00001,
    bottomLeftRadius: 0.00001, bottomRightRadius: 0.00001,
    bevelEnabled: true, bevelSegments: 2, steps: 1,
    bevelSize: 0.1, bevelOffset: 0, bevelThickness: 0.1,
  }, overrides);

  test('init extrudes the rounded shape and attaches the mesh', () => {
    const {el} = createComponentInstance(
      'bevelbox', components['bevelbox'], boxData()
    );
    el.components['bevelbox'] = Object.assign({}, components['bevelbox'], {el, data: boxData()});
    const instance = el.components['bevelbox'];
    instance.init();

    const mesh = el.getObject3D('mesh');
    expect(mesh).toBeDefined();
    expect(global.THREE.ExtrudeGeometry).toHaveBeenCalled();
  });

  test('update() replaces the mesh and disposes the old geometry once', () => {
    const data = boxData();
    const {el} = createComponentInstance('bevelbox', components['bevelbox'], data);
    const instance = Object.assign({}, components['bevelbox'], {el, data});
    instance.init();
    const firstMesh = el.getObject3D('mesh');
    const firstGeometry = firstMesh.geometry;

    instance.update({width: 1});

    const secondMesh = el.getObject3D('mesh');
    expect(secondMesh).not.toBe(firstMesh);
    expect(disposedGeometries).toContain(firstGeometry);
    expect(firstGeometry.dispose).toHaveBeenCalledTimes(1);
  });

  test('remove() disposes geometry and material exactly once', () => {
    const data = boxData();
    const {el} = createComponentInstance('bevelbox', components['bevelbox'], data);
    const instance = Object.assign({}, components['bevelbox'], {el, data});
    instance.init();
    const mesh = el.getObject3D('mesh');

    instance.remove();
    instance.remove();

    expect(mesh.geometry.dispose).toHaveBeenCalledTimes(1);
    expect(mesh.material.dispose).toHaveBeenCalledTimes(1);
    expect(el.getObject3D('mesh')).toBeNull();
  });
});
