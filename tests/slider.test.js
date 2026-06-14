describe('slider component', () => {
  let component;

  beforeAll(() => {
    global.SXR = {
      colors: {
        primary: '#2563EB',
        onSurface: '#F1F5F9',
        neutral: '#1B1B1F',
        secondary: '#0EA5E9',
      },
    };
    global.AFRAME = {
      registerComponent: jest.fn((name, definition) => {
        if (name === 'sxr-slider') component = definition;
      }),
      registerPrimitive: jest.fn(),
    };

    require('../src/components/slider.js');
  });

  afterAll(() => {
    delete global.AFRAME;
    delete global.SXR;
  });

  test('preserves the configured track width after interaction', () => {
    const listeners = {};
    const children = [];
    const makeEntity = () => ({
      attributes: {},
      children: [],
      setAttribute(name, value, propertyValue) {
        this.attributes[name] = propertyValue === undefined ? value : propertyValue;
      },
      appendChild(child) {
        this.children.push(child);
      },
    });
    const createElementSpy = jest.spyOn(document, 'createElement').mockImplementation(makeEntity);
    const el = makeEntity();
    el.getAttribute = jest.fn((name) => {
      if (name === 'sxr-item') return {width: 2.95, height: 0.42};
      if (name === 'sxr-interactable') return {clickAction: ''};
      return null;
    });
    el.appendChild = (child) => children.push(child);
    el.addEventListener = (name, listener) => {
      listeners[name] = listener;
    };
    el.object3D = {
      worldToLocal: jest.fn(() => ({x: 0.4})),
    };

    component.init.call({
      el,
      data: {
        activeColor: '#2563EB',
        backgroundColor: '#F1F5F9',
        borderColor: '#1B1B1F',
        handleColor: '#F1F5F9',
        handleInnerDepth: 0.02,
        handleInnerRadius: 0.13,
        handleOuterDepth: 0.04,
        handleOuterRadius: 0.17,
        hoverColor: '#0EA5E9',
        leftRightPadding: 0.25,
        percent: 0.1,
        sliderBarHeight: 0.05,
        sliderBarDepth: 0.03,
      },
    });

    const getWidth = (entity) => Number(entity.attributes.geometry.match(/width: ([^;]+)/)[1]);
    expect(getWidth(children[0]) + getWidth(children[1])).toBeCloseTo(2.45);

    listeners.click({detail: {intersection: {point: {x: 0.4}}}});

    expect(getWidth(children[0]) + getWidth(children[1])).toBeCloseTo(2.45);
    createElementSpy.mockRestore();
  });
});
