describe('progress bar component', () => {
  let component;

  beforeAll(() => {
    global.SXR = {
      colors: {
        surface: '#202127',
        primary: '#2563EB',
      },
    };
    global.AFRAME = {
      registerComponent: jest.fn((name, definition) => {
        if (name === 'sxr-progressbar') component = definition;
      }),
      registerPrimitive: jest.fn(),
    };

    require('../src/components/progress-bar.js');
  });

  afterAll(() => {
    delete global.AFRAME;
    delete global.SXR;
  });

  test('renders the configured initial percentage', () => {
    const children = [];
    const makeEntity = () => ({
      attributes: {},
      setAttribute(name, value) {
        this.attributes[name] = value;
      },
    });
    const createElementSpy = jest.spyOn(document, 'createElement').mockImplementation(makeEntity);
    const el = makeEntity();
    el.getAttribute = jest.fn(() => ({width: 0.78, height: 0.2}));
    el.appendChild = (child) => children.push(child);
    const instance = {
      el,
      data: {
        activeColor: '#2563EB',
        backgroundColor: '#202127',
        percent: 0.5,
      },
      updateProgress: component.updateProgress,
    };

    component.init.call(instance);

    expect(children[0].attributes.geometry).toContain('width: 0.39;');
    expect(children[0].attributes.position).toBe('-0.195 0 0.01');
    createElementSpy.mockRestore();
  });
});
