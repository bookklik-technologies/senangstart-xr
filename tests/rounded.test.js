describe('rounded component', () => {
  let component;
  let shapeGeometry;

  beforeAll(() => {
    shapeGeometry = jest.fn(function ShapeGeometry(shape) {
      this.shape = shape;
    });

    global.THREE = {
      Shape: jest.fn(function Shape() {
        this.moveTo = jest.fn();
        this.lineTo = jest.fn();
        this.quadraticCurveTo = jest.fn();
      }),
      ShapeGeometry: shapeGeometry,
    };

    global.AFRAME = {
      registerComponent: jest.fn((name, definition) => {
        if (name === 'rounded') {
          component = definition;
        }
      }),
      registerPrimitive: jest.fn(),
    };

    require('../src/components/rounded.js');
  });

  afterAll(() => {
    delete global.AFRAME;
    delete global.THREE;
  });

  test('uses ShapeGeometry supported by current Three.js releases', () => {
    const geometry = component.draw.call({
      data: {
        width: 2,
        height: 1,
        radius: 0.1,
        topLeftRadius: -1,
        topRightRadius: -1,
        bottomLeftRadius: -1,
        bottomRightRadius: -1,
      },
    });

    expect(shapeGeometry).toHaveBeenCalledTimes(1);
    expect(geometry).toBeInstanceOf(global.THREE.ShapeGeometry);
  });
});
